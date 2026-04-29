import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoanStatus, OutsideBookEntryStatus, ProcurementStatus, Role } from '@prisma/client';

const mocks = vi.hoisted(() => ({
  prisma: {
    book: {
      count: vi.fn(),
      aggregate: vi.fn(),
      findMany: vi.fn(),
    },
    loan: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    outsideBookEntry: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    user: {
      count: vi.fn(),
    },
    procurement: {
      count: vi.fn(),
    },
  },
  bookService: {
    listRecentBooks: vi.fn(),
    listPopularBooks: vi.fn(),
    listFeaturedBooks: vi.fn(),
  },
}));

vi.mock('../config/database', () => ({ default: mocks.prisma }));
vi.mock('./book.service', () => ({ default: mocks.bookService }));

const { default: dashboardService } = await import('./dashboard.service');

beforeEach(() => {
  vi.clearAllMocks();
  mocks.prisma.book.count.mockResolvedValue(10);
  mocks.prisma.book.aggregate.mockResolvedValue({ _sum: { availableCopies: 7 } });
  mocks.prisma.loan.count.mockResolvedValueOnce(2).mockResolvedValueOnce(1);
  mocks.prisma.outsideBookEntry.count.mockResolvedValue(3);
  mocks.bookService.listRecentBooks.mockResolvedValue([]);
  mocks.bookService.listPopularBooks.mockResolvedValue([]);
  mocks.bookService.listFeaturedBooks.mockResolvedValue([]);
});

describe('dashboardService', () => {
  it('returns public home counts without private member stats', async () => {
    const result = await dashboardService.getHomeData();

    expect(result.stats).toEqual({
      totalBooks: 10,
      availableBooks: 7,
      issuedBooks: 2,
      overdueLoans: 1,
      activeOutsideBookEntries: 3,
    });
    expect(result.stats).not.toHaveProperty('totalStudents');
    expect(mocks.bookService.listRecentBooks).toHaveBeenCalledWith({ limit: 6 });
  });

  it('returns admin-only stats and recent activity for admins', async () => {
    mocks.prisma.loan.count.mockReset().mockResolvedValueOnce(5).mockResolvedValueOnce(2);
    mocks.prisma.user.count.mockResolvedValueOnce(20).mockResolvedValueOnce(6);
    mocks.prisma.procurement.count.mockResolvedValue(4);
    mocks.prisma.loan.findMany.mockResolvedValueOnce([]).mockResolvedValueOnce([]);
    mocks.prisma.outsideBookEntry.findMany.mockResolvedValue([]);
    mocks.prisma.book.findMany.mockResolvedValue([]);

    const result = await dashboardService.getSummary({ id: 'admin-1', role: Role.ADMIN });

    expect(result.stats).toMatchObject({
      totalStudents: 20,
      totalTeachers: 6,
      pendingProcurement: 4,
    });
    expect(mocks.prisma.procurement.count).toHaveBeenCalledWith({
      where: {
        procurementStatus: {
          in: [ProcurementStatus.NOT_STARTED, ProcurementStatus.ONGOING],
        },
      },
    });
  });

  it('returns personal borrower stats without admin member totals', async () => {
    mocks.prisma.loan.count.mockReset()
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(8)
      .mockResolvedValueOnce(0);
    mocks.prisma.loan.findMany.mockResolvedValue([]);
    mocks.prisma.outsideBookEntry.count.mockResolvedValue(1);

    const result = await dashboardService.getSummary({
      id: 'student-1',
      role: Role.STUDENT,
      studentProfile: { id: 'student-profile-1' },
    });

    expect(result.stats).toEqual({
      currentBorrowedBooks: 1,
      returnedBooks: 8,
      overdueBooks: 0,
      activeOutsideBookEntries: 1,
    });
    expect(result.stats).not.toHaveProperty('totalStudents');
    expect(mocks.prisma.loan.count).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ status: LoanStatus.ACTIVE }),
    }));
    expect(mocks.prisma.outsideBookEntry.count).toHaveBeenCalledWith({
      where: {
        studentId: 'student-profile-1',
        entryStatus: OutsideBookEntryStatus.ENTERED,
      },
    });
  });
});
