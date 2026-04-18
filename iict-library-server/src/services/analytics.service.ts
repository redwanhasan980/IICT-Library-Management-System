import prisma from '../config/database';

interface DateRangeInput {
  from?: string;
  to?: string;
}

class AnalyticsService {
  private normalizeRange(input: DateRangeInput) {
    const now = new Date();
    const to = input.to ? new Date(input.to) : now;
    const from = input.from
      ? new Date(input.from)
      : new Date(to.getFullYear() - 1, to.getMonth(), 1);

    return {
      from,
      to,
    };
  }

  async getDashboard(input: DateRangeInput) {
    const { from, to } = this.normalizeRange(input);

    const [loanRows, outsideRows] = await Promise.all([
      prisma.loan.findMany({
        where: {
          issuedAt: {
            gte: from,
            lte: to,
          },
        },
        include: {
          book: true,
          user: true,
        },
      }),
      prisma.outsideBookEntry.findMany({
        where: {
          entryTime: {
            gte: from,
            lte: to,
          },
        },
        include: {
          student: {
            include: {
              user: true,
            },
          },
        },
      }),
    ]);

    const mostBorrowedBooksMap = new Map<string, { title: string; accessionNumber: string; count: number }>();
    const mostActiveBorrowersMap = new Map<string, { name: string; email: string; role: string; count: number }>();
    const monthlyBorrowMap = new Map<string, number>();
    const overdueMonthlyMap = new Map<string, number>();
    const departmentBorrowMap = new Map<string, number>();

    loanRows.forEach((loan) => {
      const bookKey = loan.book.id;
      const borrowerKey = loan.user.id;
      const monthKey = `${loan.issuedAt.getFullYear()}-${String(loan.issuedAt.getMonth() + 1).padStart(2, '0')}`;

      const bookSummary = mostBorrowedBooksMap.get(bookKey) ?? {
        title: loan.book.title,
        accessionNumber: loan.book.accessionNumber,
        count: 0,
      };
      bookSummary.count += 1;
      mostBorrowedBooksMap.set(bookKey, bookSummary);

      const borrowerSummary = mostActiveBorrowersMap.get(borrowerKey) ?? {
        name: loan.user.name,
        email: loan.user.email,
        role: loan.user.role,
        count: 0,
      };
      borrowerSummary.count += 1;
      mostActiveBorrowersMap.set(borrowerKey, borrowerSummary);

      monthlyBorrowMap.set(monthKey, (monthlyBorrowMap.get(monthKey) ?? 0) + 1);

      const dueTime = loan.dueAt.getTime();
      const returnedLate = loan.returnedAt && loan.returnedAt.getTime() > dueTime;
      const stillOverdue = !loan.returnedAt && dueTime < Date.now();
      if (returnedLate || stillOverdue) {
        overdueMonthlyMap.set(monthKey, (overdueMonthlyMap.get(monthKey) ?? 0) + 1);
      }

      const department = loan.book.department?.trim() || 'Unspecified';
      departmentBorrowMap.set(department, (departmentBorrowMap.get(department) ?? 0) + 1);
    });

    const mostBorrowedBooks = [...mostBorrowedBooksMap.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const mostActiveBorrowers = [...mostActiveBorrowersMap.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const borrowingTrendsByMonth = [...monthlyBorrowMap.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, count]) => ({ month, count }));

    const overdueTrendSummary = [...overdueMonthlyMap.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, count]) => ({ month, count }));

    const outsideBookUsageSummary = {
      totalEntries: outsideRows.length,
      uniqueStudents: new Set(outsideRows.map((entry) => entry.student.userId)).size,
      verifiedEntries: outsideRows.filter((entry) => entry.isVerifiedEntry).length,
      verifiedExits: outsideRows.filter((entry) => entry.isVerifiedExit).length,
    };

    const departmentWiseBorrowingSummary = [...departmentBorrowMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([department, count]) => ({ department, count }));

    return {
      dateRange: { from: from.toISOString(), to: to.toISOString() },
      mostBorrowedBooks,
      mostActiveBorrowers,
      borrowingTrendsByMonth,
      overdueTrendSummary,
      outsideBookUsageSummary,
      departmentWiseBorrowingSummary,
    };
  }
}

export default new AnalyticsService();
