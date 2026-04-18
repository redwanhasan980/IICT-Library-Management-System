import { InventoryAuditStatus, LoanStatus } from '@prisma/client';
import prisma from '../config/database';
import AppError from '../utils/AppError';
import { logAuditEvent } from '../utils/auditLog';

type InventoryAuditResultStatus =
  | 'FOUND'
  | 'MISSING'
  | 'EXTRA_OR_UNMATCHED'
  | 'ISSUED_DURING_AUDIT'
  | 'INACTIVE_OR_ARCHIVED';

interface AuditResultItem {
  type: 'BOOK' | 'UNMATCHED_SCAN';
  status: InventoryAuditResultStatus;
  accessionNumber: string;
  title?: string;
  author?: string;
  department?: string;
  bookId?: string;
  isArchived?: boolean;
  scannedCount?: number;
}

class InventoryAuditService {
  async createSession(actorId: string, title: string, notes?: string) {
    const created = await prisma.inventoryAuditSession.create({
      data: {
        title,
        notes,
        createdById: actorId,
      },
    });

    logAuditEvent({
      action: 'inventory_audit.session_create',
      actorId,
      entity: 'InventoryAuditSession',
      entityId: created.id,
      details: { title },
    });

    return created;
  }

  async listSessions() {
    return prisma.inventoryAuditSession.findMany({
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        closedBy: { select: { id: true, name: true, email: true } },
        _count: { select: { scans: true } },
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  async getSessionDetails(id: string) {
    const session = await prisma.inventoryAuditSession.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        closedBy: { select: { id: true, name: true, email: true } },
        scans: {
          orderBy: { scannedAt: 'desc' },
          include: {
            matchedBook: {
              select: {
                id: true,
                title: true,
                accessionNumber: true,
                author: true,
                isArchived: true,
              },
            },
          },
          take: 200,
        },
      },
    });

    if (!session) {
      throw new AppError('Audit session not found', 404);
    }

    return session;
  }

  async addScan(sessionId: string, actorId: string, accessionNumberRaw: string) {
    const session = await prisma.inventoryAuditSession.findUnique({ where: { id: sessionId } });
    if (!session) {
      throw new AppError('Audit session not found', 404);
    }
    if (session.status !== InventoryAuditStatus.OPEN) {
      throw new AppError('Cannot add scans to a closed audit session', 400);
    }

    const accessionNumber = accessionNumberRaw.trim();
    const matchedBook = await prisma.book.findUnique({
      where: { accessionNumber },
      select: { id: true },
    });

    const created = await prisma.inventoryAuditScan.create({
      data: {
        sessionId,
        accessionNumber,
        scannedById: actorId,
        matched: Boolean(matchedBook),
        matchedBookId: matchedBook?.id,
      },
      include: {
        matchedBook: {
          select: {
            id: true,
            title: true,
            accessionNumber: true,
            author: true,
            isArchived: true,
          },
        },
      },
    });

    logAuditEvent({
      action: 'inventory_audit.scan_add',
      actorId,
      entity: 'InventoryAuditSession',
      entityId: sessionId,
      details: { accessionNumber, matched: created.matched },
    });

    return created;
  }

  async bulkAddScans(sessionId: string, actorId: string, accessionNumbers: string[]) {
    const normalized = accessionNumbers.map((item) => item.trim()).filter(Boolean);
    if (normalized.length === 0) {
      throw new AppError('No valid accession numbers were provided', 400);
    }

    const results = [] as Awaited<ReturnType<InventoryAuditService['addScan']>>[];
    for (const accessionNumber of normalized) {
      const scan = await this.addScan(sessionId, actorId, accessionNumber);
      results.push(scan);
    }

    return {
      added: results.length,
      scans: results,
    };
  }

  async closeSession(sessionId: string, actorId: string) {
    const session = await prisma.inventoryAuditSession.findUnique({ where: { id: sessionId } });
    if (!session) {
      throw new AppError('Audit session not found', 404);
    }

    if (session.status === InventoryAuditStatus.CLOSED) {
      throw new AppError('Audit session is already closed', 400);
    }

    const closed = await prisma.inventoryAuditSession.update({
      where: { id: sessionId },
      data: {
        status: InventoryAuditStatus.CLOSED,
        closedById: actorId,
        closedAt: new Date(),
      },
    });

    logAuditEvent({
      action: 'inventory_audit.session_close',
      actorId,
      entity: 'InventoryAuditSession',
      entityId: sessionId,
    });

    return closed;
  }

  private getSnapshotTime(session: { status: InventoryAuditStatus; closedAt: Date | null }) {
    if (session.status === InventoryAuditStatus.CLOSED && session.closedAt) {
      return session.closedAt;
    }
    return new Date();
  }

  async getAuditResults(sessionId: string, statusFilter?: InventoryAuditResultStatus) {
    const session = await prisma.inventoryAuditSession.findUnique({ where: { id: sessionId } });
    if (!session) {
      throw new AppError('Audit session not found', 404);
    }

    const snapshot = this.getSnapshotTime(session);

    const [books, scans] = await Promise.all([
      prisma.book.findMany({
        orderBy: { accessionNumber: 'asc' },
      }),
      prisma.inventoryAuditScan.findMany({
        where: { sessionId },
        orderBy: { scannedAt: 'asc' },
      }),
    ]);

    const scannedCountByAccession = scans.reduce<Map<string, number>>((acc, item) => {
      acc.set(item.accessionNumber, (acc.get(item.accessionNumber) ?? 0) + 1);
      return acc;
    }, new Map());

    const unmatchedScans = scans.filter((scan) => !scan.matched);

    const activeLoanBookIds = new Set(
      (
        await prisma.loan.findMany({
          where: {
            status: LoanStatus.ACTIVE,
            issuedAt: { lte: snapshot },
            OR: [{ returnedAt: null }, { returnedAt: { gt: snapshot } }],
          },
          select: { bookId: true },
        })
      ).map((item) => item.bookId)
    );

    const results: AuditResultItem[] = books.map((book) => {
      const scanCount = scannedCountByAccession.get(book.accessionNumber) ?? 0;
      const wasScanned = scanCount > 0;
      const isIssuedDuringAudit = activeLoanBookIds.has(book.id);

      let status: InventoryAuditResultStatus;
      if (book.isArchived) {
        status = 'INACTIVE_OR_ARCHIVED';
      } else if (isIssuedDuringAudit) {
        status = 'ISSUED_DURING_AUDIT';
      } else if (wasScanned) {
        status = 'FOUND';
      } else {
        status = 'MISSING';
      }

      return {
        type: 'BOOK',
        status,
        accessionNumber: book.accessionNumber,
        title: book.title,
        author: book.author,
        department: book.department ?? undefined,
        bookId: book.id,
        isArchived: book.isArchived,
        scannedCount: scanCount,
      };
    });

    unmatchedScans.forEach((scan) => {
      results.push({
        type: 'UNMATCHED_SCAN',
        status: 'EXTRA_OR_UNMATCHED',
        accessionNumber: scan.accessionNumber,
        scannedCount: 1,
      });
    });

    const filtered = statusFilter
      ? results.filter((item) => item.status === statusFilter)
      : results;

    const summary = {
      totalExpected: books.length,
      found: results.filter((item) => item.status === 'FOUND').length,
      missing: results.filter((item) => item.status === 'MISSING').length,
      unmatched: results.filter((item) => item.status === 'EXTRA_OR_UNMATCHED').length,
      issuedDuringAudit: results.filter((item) => item.status === 'ISSUED_DURING_AUDIT').length,
      inactiveOrArchived: results.filter((item) => item.status === 'INACTIVE_OR_ARCHIVED').length,
      scannedTotal: scans.length,
    };

    return {
      session,
      summary,
      items: filtered,
    };
  }
}

export default new InventoryAuditService();
