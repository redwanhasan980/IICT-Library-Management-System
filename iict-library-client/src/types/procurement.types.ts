import type { Book } from './book.types';

export type Department = 'CSE' | 'SWE' | 'EEE';
export type ShelvingStatus = 'PENDING' | 'IN_PROGRESS' | 'SHELVED';
export type ProcurementStatus = 'NOT_STARTED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export interface ProcurementSummary {
  totalApplications: number;
  totalRequisitions: number;
  totalVendors: number;
  totalOrders: number;
  ongoingOrders: number;
  completedOrders: number;
  totalAllocatedBudget: number;
  totalRequestedQuantity: number;
  totalEstimatedCost: number;
}

export interface ProcurementApplication {
  id: string;
  applicationCode: string;
  budgetYear: number;
  allocatedBudget: number | string;
  department: Department;
  requisitions?: BookRequisition[];
  createdAt: string;
  updatedAt: string;
}

export interface BookRequisition {
  id: string;
  requisitionCode: string;
  applicationId: string;
  application?: Pick<ProcurementApplication, 'id' | 'applicationCode' | 'budgetYear' | 'department'>;
  bookTitle: string;
  authorName: string;
  publisher?: string;
  edition?: string;
  isbn?: string;
  quantity: number;
  pricePerUnit?: number | string;
  totalPrice?: number | string;
  procurements?: Array<Pick<ProcurementOrder, 'id' | 'procurementCode' | 'procurementStatus' | 'shelvingStatus'>>;
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  id: string;
  vendorCode: string;
  vendorName: string;
  quotationDetails?: string;
  _count?: {
    procurements: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProcurementOrder {
  id: string;
  procurementCode: string;
  requisitionId: string;
  vendorId: string;
  procurementApprovalDate?: string;
  deliveryDate?: string;
  handoverDateToIICT?: string;
  bookReceivingRecord?: string;
  shelvingStatus: ShelvingStatus;
  procurementStatus: ProcurementStatus;
  requisition?: BookRequisition;
  vendor?: Vendor;
  books?: Pick<Book, 'id' | 'title' | 'accessionNumber' | 'isArchived'>[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedProcurementResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
