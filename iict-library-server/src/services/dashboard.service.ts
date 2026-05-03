import { LoanStatus, OutsideBookEntryStatus, ProcurementStatus, Role } from '@prisma/client';
import prisma from '../config/database';
import bookService from './book.service';

class DashboardService {
  private async getCoreStats() {
    const now = new Date();
    const [
      totalAggregate,
      availableAggregate,
      issuedBooks,
      overdueLoans,
      activeOutsideBookEntries,
    ] = await Promise.all([
      prisma.book.aggregate({
        where: { isArchived: false },
        _sum: { totalCopies: true },
      }),
      prisma.book.aggregate({
        where: { isArchived: false },
        _sum: { availableCopies: true },
      }),
      prisma.loan.count({
        where: {
          status: LoanStatus.ACTIVE,
          returnedAt: null,
        },
      }),
      prisma.loan.count({
        where: {
          status: LoanStatus.ACTIVE,
          returnedAt: null,
          dueAt: { lt: now },
        },
      }),
      prisma.outsideBookEntry.count({
        where: { entryStatus: OutsideBookEntryStatus.ENTERED },
      }),
    ]);

    return {
      totalBooks: totalAggregate._sum.totalCopies ?? 0,
      availableBooks: availableAggregate._sum.availableCopies ?? 0,
      issuedBooks,
      overdueLoans,
      activeOutsideBookEntries,
    };
  }

  async getHomeData() {
    const [stats, recentBooks, popularBooks, featuredBooks] = await Promise.all([
      this.getCoreStats(),
      bookService.listRecentBooks({ limit: 6 }),
      bookService.listPopularBooks({ limit: 6 }),
      bookService.listFeaturedBooks({ limit: 6 }),
    ]);

    return {
      stats,
      recentBooks,
      popularBooks,
      featuredBooks,
    };
  }

  async getSummary(user: { id: string; role: Role; studentProfile?: { id: string } }) {
    if (user.role === Role.ADMIN) {
      const [stats, totalStudents, totalTeachers, pendingProcurement, recentLoans, recentReturns, recentOutsideBookEntries, recentCatalogAdditions] =
        await Promise.all([
          this.getCoreStats(),
          prisma.user.count({ where: { role: Role.STUDENT } }),
          prisma.user.count({ where: { role: Role.TEACHER } }),
          prisma.procurement.count({
            where: {
              procurementStatus: {
                in: [ProcurementStatus.NOT_STARTED, ProcurementStatus.ONGOING],
              },
            },
          }),
          prisma.loan.findMany({
            where: { status: LoanStatus.ACTIVE },
            include: {
              book: true,
              user: { select: { id: true, name: true, email: true, role: true } },
            },
            orderBy: { issuedAt: 'desc' },
            take: 5,
          }),
          prisma.loan.findMany({
            where: { status: LoanStatus.RETURNED },
            include: {
              book: true,
              user: { select: { id: true, name: true, email: true, role: true } },
            },
            orderBy: { returnedAt: 'desc' },
            take: 5,
          }),
          prisma.outsideBookEntry.findMany({
            include: {
              student: {
                include: {
                  user: { select: { id: true, name: true, email: true, role: true } },
                },
              },
            },
            orderBy: { entryTime: 'desc' },
            take: 5,
          }),
          prisma.book.findMany({
            where: { isArchived: false },
            orderBy: { createdAt: 'desc' },
            take: 5,
          }),
        ]);

      return {
        role: user.role,
        stats: {
          ...stats,
          totalStudents,
          totalTeachers,
          pendingProcurement,
        },
        recentActivity: {
          recentLoans,
          recentReturns,
          recentOutsideBookEntries,
          recentCatalogAdditions,
        },
      };
    }

    const now = new Date();
    const isStudent = user.role === Role.STUDENT;
    const [currentBorrowedBooks, returnedBooks, overdueBooks, recentBorrowingActivity, activeOutsideBookEntries] =
      await Promise.all([
        prisma.loan.count({
          where: {
            userId: user.id,
            status: LoanStatus.ACTIVE,
            returnedAt: null,
          },
        }),
        prisma.loan.count({
          where: {
            userId: user.id,
            status: LoanStatus.RETURNED,
          },
        }),
        prisma.loan.count({
          where: {
            userId: user.id,
            status: LoanStatus.ACTIVE,
            returnedAt: null,
            dueAt: { lt: now },
          },
        }),
        prisma.loan.findMany({
          where: { userId: user.id },
          include: { book: true },
          orderBy: { issuedAt: 'desc' },
          take: 6,
        }),
        isStudent && user.studentProfile?.id
          ? prisma.outsideBookEntry.count({
              where: {
                studentId: user.studentProfile.id,
                entryStatus: OutsideBookEntryStatus.ENTERED,
              },
            })
          : Promise.resolve(0),
      ]);

    return {
      role: user.role,
      stats: {
        currentBorrowedBooks,
        returnedBooks,
        overdueBooks,
        activeOutsideBookEntries,
      },
      recentActivity: {
        recentBorrowingActivity,
      },
    };
  }
}

export default new DashboardService();
