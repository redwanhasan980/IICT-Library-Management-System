import prisma from '../config/database';
import { logAuditEvent } from '../utils/auditLog';
import { parseCsv, toCsv } from '../utils/csv';

const ALLOWED_DEPARTMENTS = new Set(['CSE', 'SWE', 'EEE']);

interface ImportError {
  row: number;
  message: string;
}

class BulkService {
  async importBooksCsv(actorId: string, csv: string) {
    const { rows } = parseCsv(csv);

    let created = 0;
    let updated = 0;
    const errors: ImportError[] = [];

    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      const rowNo = i + 2;

      const accessionNumber = row.accessionNumber?.trim();
      const title = row.title?.trim();
      const author = row.author?.trim();
      const isbn = row.isbn?.trim() || undefined;
      const department = row.department?.trim() || undefined;
      const normalizedDepartment = department ? department.toUpperCase() : undefined;
      const copiesRaw = row.totalCopies?.trim();

      if (!accessionNumber || !title || !author) {
        errors.push({
          row: rowNo,
          message: 'accessionNumber, title and author are required',
        });
        continue;
      }

      const totalCopies = copiesRaw ? Number(copiesRaw) : 1;
      if (!Number.isInteger(totalCopies) || totalCopies < 1) {
        errors.push({ row: rowNo, message: 'totalCopies must be a positive integer' });
        continue;
      }

      if (normalizedDepartment && !ALLOWED_DEPARTMENTS.has(normalizedDepartment)) {
        errors.push({ row: rowNo, message: 'department must be one of CSE, SWE, EEE' });
        continue;
      }

      const existing = await prisma.book.findUnique({ where: { accessionNumber } });

      if (existing) {
        await prisma.book.update({
          where: { id: existing.id },
          data: {
            title,
            author,
            isbn,
            department: normalizedDepartment as 'CSE' | 'SWE' | 'EEE' | undefined,
            totalCopies,
            availableCopies: Math.max(existing.availableCopies, 0),
          },
        });
        updated += 1;
      } else {
        await prisma.book.create({
          data: {
            accessionNumber,
            title,
            author,
            isbn,
            department: normalizedDepartment as 'CSE' | 'SWE' | 'EEE' | undefined,
            totalCopies,
            availableCopies: totalCopies,
          },
        });
        created += 1;
      }
    }

    logAuditEvent({
      action: 'bulk_import.books',
      actorId,
      entity: 'Book',
      details: { rows: rows.length, created, updated, errors: errors.length },
    });

    return {
      rowsProcessed: rows.length,
      created,
      updated,
      errors,
    };
  }

  async exportCsv(actorId: string, resource: 'books' | 'loans' | 'outside-books' | 'members') {
    if (resource === 'books') {
      const books = await prisma.book.findMany({ orderBy: { createdAt: 'desc' } });
      const csv = toCsv(
        books.map((book) => ({
          id: book.id,
          accessionNumber: book.accessionNumber,
          title: book.title,
          author: book.author,
          isbn: book.isbn ?? '',
          department: book.department ?? '',
          totalCopies: book.totalCopies,
          availableCopies: book.availableCopies,
          isArchived: book.isArchived,
        }))
      );
      this.logExport(actorId, resource, books.length);
      return csv;
    }

    if (resource === 'loans') {
      const loans = await prisma.loan.findMany({
        include: { book: true, user: true },
        orderBy: { issuedAt: 'desc' },
      });
      const csv = toCsv(
        loans.map((loan) => ({
          id: loan.id,
          accessionNumber: loan.book.accessionNumber,
          bookTitle: loan.book.title,
          borrowerName: loan.user.name,
          borrowerEmail: loan.user.email,
          borrowerRole: loan.user.role,
          status: loan.status,
          issuedAt: loan.issuedAt.toISOString(),
          dueAt: loan.dueAt.toISOString(),
          returnedAt: loan.returnedAt?.toISOString() ?? '',
        }))
      );
      this.logExport(actorId, resource, loans.length);
      return csv;
    }

    if (resource === 'outside-books') {
      const rows = await prisma.outsideBookEntry.findMany({
        include: {
          student: {
            include: {
              user: true,
            },
          },
        },
        orderBy: { entryTime: 'desc' },
      });

      const csv = toCsv(
        rows.map((entry) => ({
          id: entry.id,
          studentId: entry.student.userId,
          studentName: entry.student.user.name,
          studentEmail: entry.student.user.email,
          title: entry.title,
          author: entry.author,
          entryTime: entry.entryTime.toISOString(),
          exitTime: entry.exitTime?.toISOString() ?? '',
          isVerifiedEntry: entry.isVerifiedEntry,
          isVerifiedExit: entry.isVerifiedExit,
        }))
      );

      this.logExport(actorId, resource, rows.length);
      return csv;
    }

    const members = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const csv = toCsv(
      members.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
      }))
    );

    this.logExport(actorId, resource, members.length);
    return csv;
  }

  private logExport(actorId: string, resource: string, rows: number) {
    logAuditEvent({
      action: 'bulk_export.generate',
      actorId,
      entity: resource,
      details: { rows },
    });
  }
}

export default new BulkService();
