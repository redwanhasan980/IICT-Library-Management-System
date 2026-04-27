import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AdminProcurementPage from './AdminProcurementPage';

const mocks = vi.hoisted(() => ({
  refetch: vi.fn(),
  createMutation: vi.fn(() => ({ unwrap: vi.fn() })),
  updateMutation: vi.fn(() => ({ unwrap: vi.fn() })),
}));

vi.mock('react-hot-toast', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('../../services/procurement.api', () => ({
  useGetProcurementSummaryQuery: () => ({
    data: {
      totalApplications: 1,
      totalRequisitions: 1,
      totalVendors: 1,
      totalOrders: 1,
      ongoingOrders: 1,
      completedOrders: 0,
      totalAllocatedBudget: 50000,
      totalRequestedQuantity: 5,
      totalEstimatedCost: 25000,
    },
    isLoading: false,
    isError: false,
    refetch: mocks.refetch,
  }),
  useListProcurementApplicationsQuery: () => ({
    data: {
      items: [{
        id: 'app-1',
        applicationCode: 'APP-2026-01',
        budgetYear: 2026,
        allocatedBudget: 50000,
        department: 'SWE',
        requisitions: [],
      }],
    },
    isLoading: false,
    isError: false,
    refetch: mocks.refetch,
  }),
  useListBookRequisitionsQuery: () => ({
    data: {
      items: [{
        id: 'req-1',
        requisitionCode: 'REQ-1',
        applicationId: 'app-1',
        application: { id: 'app-1', applicationCode: 'APP-2026-01', budgetYear: 2026, department: 'SWE' },
        bookTitle: 'Database Systems',
        authorName: 'Elmasri',
        quantity: 5,
        totalPrice: 25000,
      }],
    },
    isLoading: false,
    isError: false,
    refetch: mocks.refetch,
  }),
  useListVendorsQuery: () => ({
    data: {
      items: [{
        id: 'vendor-1',
        vendorCode: 'V-1',
        vendorName: 'Academic Books',
        quotationDetails: 'Lowest compliant quote',
        _count: { procurements: 1 },
      }],
    },
    isLoading: false,
    isError: false,
    refetch: mocks.refetch,
  }),
  useListProcurementOrdersQuery: () => ({
    data: {
      items: [{
        id: 'po-1',
        procurementCode: 'PO-1',
        requisitionId: 'req-1',
        vendorId: 'vendor-1',
        procurementStatus: 'ONGOING',
        shelvingStatus: 'PENDING',
        handoverDateToIICT: '2026-04-28T00:00:00.000Z',
        requisition: { requisitionCode: 'REQ-1', bookTitle: 'Database Systems' },
        vendor: { vendorName: 'Academic Books' },
        books: [],
      }],
    },
    isLoading: false,
    isError: false,
    refetch: mocks.refetch,
  }),
  useCreateProcurementApplicationMutation: () => [mocks.createMutation, { isLoading: false }],
  useCreateBookRequisitionMutation: () => [mocks.createMutation, { isLoading: false }],
  useCreateVendorMutation: () => [mocks.createMutation, { isLoading: false }],
  useCreateProcurementOrderMutation: () => [mocks.createMutation, { isLoading: false }],
  useUpdateProcurementOrderMutation: () => [mocks.updateMutation, { isLoading: false }],
}));

describe('AdminProcurementPage', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders procurement workflow sections and existing records', () => {
    render(<AdminProcurementPage />);

    expect(screen.getByText('Procurement Management')).toBeInTheDocument();
    expect(screen.getByText('Central Library Application')).toBeInTheDocument();
    expect(screen.getByText('Book Requisition')).toBeInTheDocument();
    expect(screen.getByText('Vendor Selection')).toBeInTheDocument();
    expect(screen.getByText('Approval, Delivery, Handover, and Shelving')).toBeInTheDocument();
    expect(screen.getAllByText('APP-2026-01').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Database Systems').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Academic Books').length).toBeGreaterThan(0);
    expect(screen.getByText('ONGOING')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Procurement Order' })).toBeInTheDocument();
  });
});
