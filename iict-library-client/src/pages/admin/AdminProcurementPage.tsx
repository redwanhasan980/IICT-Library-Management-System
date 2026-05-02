import { useState } from 'react';
import type { FormEvent } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { Badge } from '../../components/shared/Badge';
import { Button } from '../../components/shared/Button';
import { Card } from '../../components/shared/Card';
import { EmptyState, ErrorState, LoadingState } from '../../components/shared/FeedbackState';
import { Input } from '../../components/shared/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/shared/Table';
import {
  useCreateBookRequisitionMutation,
  useCreateProcurementApplicationMutation,
  useCreateProcurementOrderMutation,
  useCreateVendorMutation,
  useGetProcurementSummaryQuery,
  useListBookRequisitionsQuery,
  useListProcurementApplicationsQuery,
  useListProcurementOrdersQuery,
  useListVendorsQuery,
  useUpdateProcurementOrderMutation,
} from '../../services/procurement.api';
import type { Department, ProcurementStatus, ShelvingStatus } from '../../types/procurement.types';

const selectClass =
  'mt-1 w-full border-2 border-library-ink bg-paper-soft px-3 py-2 text-sm font-semibold text-library-ink shadow-[2px_2px_0_#1a1c1a] focus:outline-none focus:ring-2 focus:ring-library-forest/40 disabled:bg-library-mist/60';

const statusVariant: Record<ProcurementStatus, 'info' | 'warning' | 'success' | 'danger'> = {
  NOT_STARTED: 'info',
  ONGOING: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

const shelvingVariant: Record<ShelvingStatus, 'info' | 'warning' | 'success'> = {
  PENDING: 'info',
  IN_PROGRESS: 'warning',
  SHELVED: 'success',
};

const money = (value?: number | string) =>
  Number(value ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 });

const formatDate = (value?: string) => {
  if (!value) {
    return '-';
  }

  return format(new Date(value), 'PP');
};

const apiError = (error: unknown, fallback: string) => {
  const maybeApiError = error as { data?: { message?: string } };
  return maybeApiError?.data?.message || fallback;
};

const AdminProcurementPage = () => {
  const [orderSearchInput, setOrderSearchInput] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState<ProcurementStatus | ''>('');

  const [applicationForm, setApplicationForm] = useState({
    applicationCode: '',
    budgetYear: new Date().getFullYear().toString(),
    allocatedBudget: '',
    department: 'SWE' as Department,
  });
  const [requisitionForm, setRequisitionForm] = useState({
    requisitionCode: '',
    applicationId: '',
    bookTitle: '',
    authorName: '',
    publisher: '',
    edition: '',
    isbn: '',
    quantity: '1',
    pricePerUnit: '',
  });
  const [vendorForm, setVendorForm] = useState({
    vendorCode: '',
    vendorName: '',
    quotationDetails: '',
  });
  const [orderForm, setOrderForm] = useState({
    procurementCode: '',
    requisitionId: '',
    vendorId: '',
    procurementApprovalDate: '',
    deliveryDate: '',
    handoverDateToIICT: '',
    bookReceivingRecord: '',
    procurementStatus: 'NOT_STARTED' as ProcurementStatus,
    shelvingStatus: 'PENDING' as ShelvingStatus,
  });

  const {
    data: summary,
    isLoading: summaryLoading,
    isError: summaryError,
    refetch: refetchSummary,
  } = useGetProcurementSummaryQuery();
  const {
    data: applications,
    isLoading: applicationsLoading,
    isError: applicationsError,
    refetch: refetchApplications,
  } = useListProcurementApplicationsQuery({ pageSize: 100 });
  const {
    data: requisitions,
    isLoading: requisitionsLoading,
    isError: requisitionsError,
    refetch: refetchRequisitions,
  } = useListBookRequisitionsQuery({ pageSize: 100 });
  const {
    data: vendors,
    isLoading: vendorsLoading,
    isError: vendorsError,
    refetch: refetchVendors,
  } = useListVendorsQuery({ pageSize: 100 });
  const {
    data: orders,
    isLoading: ordersLoading,
    isError: ordersError,
    refetch: refetchOrders,
  } = useListProcurementOrdersQuery({
    q: orderSearch || undefined,
    procurementStatus: orderStatus || undefined,
    pageSize: 100,
  });

  const [createApplication, { isLoading: creatingApplication }] = useCreateProcurementApplicationMutation();
  const [createRequisition, { isLoading: creatingRequisition }] = useCreateBookRequisitionMutation();
  const [createVendor, { isLoading: creatingVendor }] = useCreateVendorMutation();
  const [createOrder, { isLoading: creatingOrder }] = useCreateProcurementOrderMutation();
  const [updateOrder, { isLoading: updatingOrder }] = useUpdateProcurementOrderMutation();

  const handleApplicationSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!applicationForm.applicationCode.trim() || !applicationForm.budgetYear || !applicationForm.allocatedBudget) {
      toast.error('Application code, budget year, and allocated budget are required');
      return;
    }

    try {
      await createApplication({
        applicationCode: applicationForm.applicationCode.trim(),
        budgetYear: Number(applicationForm.budgetYear),
        allocatedBudget: Number(applicationForm.allocatedBudget),
        department: applicationForm.department,
      }).unwrap();
      setApplicationForm((prev) => ({ ...prev, applicationCode: '', allocatedBudget: '' }));
      toast.success('Procurement application saved');
    } catch (error) {
      toast.error(apiError(error, 'Failed to save procurement application'));
    }
  };

  const handleRequisitionSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!requisitionForm.applicationId || !requisitionForm.requisitionCode.trim() || !requisitionForm.bookTitle.trim()) {
      toast.error('Application, requisition code, and book title are required');
      return;
    }

    try {
      await createRequisition({
        requisitionCode: requisitionForm.requisitionCode.trim(),
        applicationId: requisitionForm.applicationId,
        bookTitle: requisitionForm.bookTitle.trim(),
        authorName: requisitionForm.authorName.trim(),
        publisher: requisitionForm.publisher.trim() || undefined,
        edition: requisitionForm.edition.trim() || undefined,
        isbn: requisitionForm.isbn.trim() || undefined,
        quantity: Number(requisitionForm.quantity),
        pricePerUnit: requisitionForm.pricePerUnit ? Number(requisitionForm.pricePerUnit) : undefined,
      }).unwrap();
      setRequisitionForm((prev) => ({
        ...prev,
        requisitionCode: '',
        bookTitle: '',
        authorName: '',
        publisher: '',
        edition: '',
        isbn: '',
        quantity: '1',
        pricePerUnit: '',
      }));
      toast.success('Book requisition saved');
    } catch (error) {
      toast.error(apiError(error, 'Failed to save book requisition'));
    }
  };

  const handleVendorSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!vendorForm.vendorCode.trim() || !vendorForm.vendorName.trim()) {
      toast.error('Vendor code and name are required');
      return;
    }

    try {
      await createVendor({
        vendorCode: vendorForm.vendorCode.trim(),
        vendorName: vendorForm.vendorName.trim(),
        quotationDetails: vendorForm.quotationDetails.trim() || undefined,
      }).unwrap();
      setVendorForm({ vendorCode: '', vendorName: '', quotationDetails: '' });
      toast.success('Vendor saved');
    } catch (error) {
      toast.error(apiError(error, 'Failed to save vendor'));
    }
  };

  const handleOrderSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!orderForm.procurementCode.trim() || !orderForm.requisitionId || !orderForm.vendorId) {
      toast.error('Procurement code, requisition, and vendor are required');
      return;
    }

    try {
      await createOrder({
        procurementCode: orderForm.procurementCode.trim(),
        requisitionId: orderForm.requisitionId,
        vendorId: orderForm.vendorId,
        procurementApprovalDate: orderForm.procurementApprovalDate || undefined,
        deliveryDate: orderForm.deliveryDate || undefined,
        handoverDateToIICT: orderForm.handoverDateToIICT || undefined,
        bookReceivingRecord: orderForm.bookReceivingRecord.trim() || undefined,
        procurementStatus: orderForm.procurementStatus,
        shelvingStatus: orderForm.shelvingStatus,
      }).unwrap();
      setOrderForm((prev) => ({
        ...prev,
        procurementCode: '',
        bookReceivingRecord: '',
        procurementApprovalDate: '',
        deliveryDate: '',
        handoverDateToIICT: '',
        procurementStatus: 'NOT_STARTED',
        shelvingStatus: 'PENDING',
      }));
      toast.success('Procurement order saved');
    } catch (error) {
      toast.error(apiError(error, 'Failed to save procurement order'));
    }
  };

  const handleOrderUpdate = async (id: string, body: { procurementStatus?: ProcurementStatus; shelvingStatus?: ShelvingStatus }) => {
    try {
      await updateOrder({ id, body }).unwrap();
      toast.success('Procurement order updated');
    } catch (error) {
      toast.error(apiError(error, 'Failed to update procurement order'));
    }
  };

  const handleOrderSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOrderSearch(orderSearchInput.trim());
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-brown">Procurement Management</h1>
        <p className="text-sm text-warm-taupe">Track central library applications, requisitions, vendors, delivery, handover, and shelving.</p>
      </div>

      <Card className="space-y-4">
        <h2 className="text-lg font-semibold text-dark-brown">Procurement Summary</h2>
        {summaryLoading && <LoadingState message="Loading procurement summary..." />}
        {summaryError && <ErrorState message="Failed to load procurement summary." onRetry={refetchSummary} />}
        {!summaryLoading && !summaryError && summary && (
          <div className="grid gap-3 md:grid-cols-4">
            <div className="border-2 border-library-ink bg-pale-cream p-3 shadow-[3px_3px_0_#1a1c1a]">
              <p className="text-xs text-warm-taupe">Applications</p>
              <p className="text-xl font-bold text-dark-brown">{summary.totalApplications}</p>
            </div>
            <div className="border-2 border-library-ink bg-pale-cream p-3 shadow-[3px_3px_0_#1a1c1a]">
              <p className="text-xs text-warm-taupe">Requisitions</p>
              <p className="text-xl font-bold text-dark-brown">{summary.totalRequisitions}</p>
            </div>
            <div className="border-2 border-library-ink bg-pale-cream p-3 shadow-[3px_3px_0_#1a1c1a]">
              <p className="text-xs text-warm-taupe">Vendors</p>
              <p className="text-xl font-bold text-dark-brown">{summary.totalVendors}</p>
            </div>
            <div className="border-2 border-library-ink bg-pale-cream p-3 shadow-[3px_3px_0_#1a1c1a]">
              <p className="text-xs text-warm-taupe">Orders</p>
              <p className="text-xl font-bold text-dark-brown">{summary.totalOrders}</p>
            </div>
            <div className="border-2 border-library-ink bg-pale-cream p-3 shadow-[3px_3px_0_#1a1c1a]">
              <p className="text-xs text-warm-taupe">Allocated Budget</p>
              <p className="text-xl font-bold text-dark-brown">{money(summary.totalAllocatedBudget)}</p>
            </div>
            <div className="border-2 border-library-ink bg-pale-cream p-3 shadow-[3px_3px_0_#1a1c1a]">
              <p className="text-xs text-warm-taupe">Estimated Cost</p>
              <p className="text-xl font-bold text-dark-brown">{money(summary.totalEstimatedCost)}</p>
            </div>
            <div className="border-2 border-library-ink bg-pale-cream p-3 shadow-[3px_3px_0_#1a1c1a]">
              <p className="text-xs text-warm-taupe">Requested Quantity</p>
              <p className="text-xl font-bold text-dark-brown">{summary.totalRequestedQuantity}</p>
            </div>
            <div className="border-2 border-library-ink bg-pale-cream p-3 shadow-[3px_3px_0_#1a1c1a]">
              <p className="text-xs text-warm-taupe">Completed Orders</p>
              <p className="text-xl font-bold text-dark-brown">{summary.completedOrders}</p>
            </div>
          </div>
        )}
      </Card>

      <Card className="space-y-4">
        <h2 className="text-lg font-semibold text-dark-brown">Central Library Application</h2>
        <form onSubmit={handleApplicationSubmit} className="grid gap-4 lg:grid-cols-5 lg:items-end">
          <div>
            <label className="text-sm text-warm-taupe">Application Code</label>
            <Input value={applicationForm.applicationCode} onChange={(e) => setApplicationForm((prev) => ({ ...prev, applicationCode: e.target.value }))} disabled={creatingApplication} required />
          </div>
          <div>
            <label className="text-sm text-warm-taupe">Budget Year</label>
            <Input type="number" min={2000} value={applicationForm.budgetYear} onChange={(e) => setApplicationForm((prev) => ({ ...prev, budgetYear: e.target.value }))} disabled={creatingApplication} required />
          </div>
          <div>
            <label className="text-sm text-warm-taupe">Allocated Budget</label>
            <Input type="number" min={0} step="0.01" value={applicationForm.allocatedBudget} onChange={(e) => setApplicationForm((prev) => ({ ...prev, allocatedBudget: e.target.value }))} disabled={creatingApplication} required />
          </div>
          <div>
            <label className="text-sm text-warm-taupe">Department</label>
            <select value={applicationForm.department} onChange={(e) => setApplicationForm((prev) => ({ ...prev, department: e.target.value as Department }))} className={selectClass} disabled={creatingApplication}>
              <option value="CSE">CSE</option>
              <option value="SWE">SWE</option>
              <option value="EEE">EEE</option>
            </select>
          </div>
          <Button type="submit" disabled={creatingApplication}>{creatingApplication ? 'Saving...' : 'Save Application'}</Button>
        </form>

        {applicationsLoading && <LoadingState message="Loading applications..." />}
        {applicationsError && <ErrorState message="Failed to load applications." onRetry={refetchApplications} />}
        {!applicationsLoading && !applicationsError && applications?.items.length === 0 && <EmptyState message="No procurement applications yet." />}
        {!applicationsLoading && !applicationsError && applications && applications.items.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Budget Year</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Requisitions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.items.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>{application.applicationCode}</TableCell>
                  <TableCell>{application.budgetYear}</TableCell>
                  <TableCell>{application.department}</TableCell>
                  <TableCell>{money(application.allocatedBudget)}</TableCell>
                  <TableCell>{application.requisitions?.length ?? 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Card className="space-y-4">
        <h2 className="text-lg font-semibold text-dark-brown">Book Requisition</h2>
        <form onSubmit={handleRequisitionSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm text-warm-taupe">Application</label>
              <select value={requisitionForm.applicationId} onChange={(e) => setRequisitionForm((prev) => ({ ...prev, applicationId: e.target.value }))} className={selectClass} disabled={creatingRequisition || !applications?.items.length} required>
                <option value="">Select application</option>
                {applications?.items.map((application) => (
                  <option key={application.id} value={application.id}>{application.applicationCode}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-warm-taupe">Requisition Code</label>
              <Input value={requisitionForm.requisitionCode} onChange={(e) => setRequisitionForm((prev) => ({ ...prev, requisitionCode: e.target.value }))} disabled={creatingRequisition} required />
            </div>
            <div>
              <label className="text-sm text-warm-taupe">Book Title</label>
              <Input value={requisitionForm.bookTitle} onChange={(e) => setRequisitionForm((prev) => ({ ...prev, bookTitle: e.target.value }))} disabled={creatingRequisition} required />
            </div>
            <div>
              <label className="text-sm text-warm-taupe">Author Name</label>
              <Input value={requisitionForm.authorName} onChange={(e) => setRequisitionForm((prev) => ({ ...prev, authorName: e.target.value }))} disabled={creatingRequisition} required />
            </div>
            <div>
              <label className="text-sm text-warm-taupe">Publisher</label>
              <Input value={requisitionForm.publisher} onChange={(e) => setRequisitionForm((prev) => ({ ...prev, publisher: e.target.value }))} disabled={creatingRequisition} />
            </div>
            <div>
              <label className="text-sm text-warm-taupe">Edition</label>
              <Input value={requisitionForm.edition} onChange={(e) => setRequisitionForm((prev) => ({ ...prev, edition: e.target.value }))} disabled={creatingRequisition} />
            </div>
            <div>
              <label className="text-sm text-warm-taupe">ISBN</label>
              <Input value={requisitionForm.isbn} onChange={(e) => setRequisitionForm((prev) => ({ ...prev, isbn: e.target.value }))} disabled={creatingRequisition} />
            </div>
            <div>
              <label className="text-sm text-warm-taupe">Quantity</label>
              <Input type="number" min={1} value={requisitionForm.quantity} onChange={(e) => setRequisitionForm((prev) => ({ ...prev, quantity: e.target.value }))} disabled={creatingRequisition} required />
            </div>
            <div>
              <label className="text-sm text-warm-taupe">Price Per Unit</label>
              <Input type="number" min={0} step="0.01" value={requisitionForm.pricePerUnit} onChange={(e) => setRequisitionForm((prev) => ({ ...prev, pricePerUnit: e.target.value }))} disabled={creatingRequisition} />
            </div>
          </div>
          <Button type="submit" disabled={creatingRequisition || !applications?.items.length}>{creatingRequisition ? 'Saving...' : 'Save Requisition'}</Button>
        </form>

        {requisitionsLoading && <LoadingState message="Loading requisitions..." />}
        {requisitionsError && <ErrorState message="Failed to load requisitions." onRetry={refetchRequisitions} />}
        {!requisitionsLoading && !requisitionsError && requisitions?.items.length === 0 && <EmptyState message="No book requisitions yet." />}
        {!requisitionsLoading && !requisitionsError && requisitions && requisitions.items.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Application</TableHead>
                <TableHead>Book</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requisitions.items.map((requisition) => (
                <TableRow key={requisition.id}>
                  <TableCell>{requisition.requisitionCode}</TableCell>
                  <TableCell>{requisition.application?.applicationCode || '-'}</TableCell>
                  <TableCell>{requisition.bookTitle}</TableCell>
                  <TableCell>{requisition.authorName}</TableCell>
                  <TableCell>{requisition.quantity}</TableCell>
                  <TableCell>{requisition.totalPrice ? money(requisition.totalPrice) : '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Card className="space-y-4">
        <h2 className="text-lg font-semibold text-dark-brown">Vendor Selection</h2>
        <form onSubmit={handleVendorSubmit} className="grid gap-4 lg:grid-cols-4 lg:items-end">
          <div>
            <label className="text-sm text-warm-taupe">Vendor Code</label>
            <Input value={vendorForm.vendorCode} onChange={(e) => setVendorForm((prev) => ({ ...prev, vendorCode: e.target.value }))} disabled={creatingVendor} required />
          </div>
          <div>
            <label className="text-sm text-warm-taupe">Vendor Name</label>
            <Input value={vendorForm.vendorName} onChange={(e) => setVendorForm((prev) => ({ ...prev, vendorName: e.target.value }))} disabled={creatingVendor} required />
          </div>
          <div>
            <label className="text-sm text-warm-taupe">Quotation Details</label>
            <Input value={vendorForm.quotationDetails} onChange={(e) => setVendorForm((prev) => ({ ...prev, quotationDetails: e.target.value }))} disabled={creatingVendor} />
          </div>
          <Button type="submit" disabled={creatingVendor}>{creatingVendor ? 'Saving...' : 'Save Vendor'}</Button>
        </form>

        {vendorsLoading && <LoadingState message="Loading vendors..." />}
        {vendorsError && <ErrorState message="Failed to load vendors." onRetry={refetchVendors} />}
        {!vendorsLoading && !vendorsError && vendors?.items.length === 0 && <EmptyState message="No vendors yet." />}
        {!vendorsLoading && !vendorsError && vendors && vendors.items.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Quotation</TableHead>
                <TableHead>Orders</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.items.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell>{vendor.vendorCode}</TableCell>
                  <TableCell>{vendor.vendorName}</TableCell>
                  <TableCell>{vendor.quotationDetails || '-'}</TableCell>
                  <TableCell>{vendor._count?.procurements ?? 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Card className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="text-lg font-semibold text-dark-brown">Approval, Delivery, Handover, and Shelving</h2>
          <form onSubmit={handleOrderSearch} className="flex flex-wrap items-end gap-2">
            <Input value={orderSearchInput} onChange={(e) => setOrderSearchInput(e.target.value)} placeholder="Search orders" />
            <select value={orderStatus} onChange={(e) => setOrderStatus(e.target.value as ProcurementStatus | '')} className={selectClass}>
              <option value="">All status</option>
              <option value="NOT_STARTED">Not started</option>
              <option value="ONGOING">Ongoing</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <Button type="submit" variant="secondary">Search</Button>
          </form>
        </div>

        <form onSubmit={handleOrderSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm text-warm-taupe">Procurement Code</label>
              <Input value={orderForm.procurementCode} onChange={(e) => setOrderForm((prev) => ({ ...prev, procurementCode: e.target.value }))} disabled={creatingOrder} required />
            </div>
            <div>
              <label className="text-sm text-warm-taupe">Requisition</label>
              <select value={orderForm.requisitionId} onChange={(e) => setOrderForm((prev) => ({ ...prev, requisitionId: e.target.value }))} className={selectClass} disabled={creatingOrder || !requisitions?.items.length} required>
                <option value="">Select requisition</option>
                {requisitions?.items.map((requisition) => (
                  <option key={requisition.id} value={requisition.id}>{requisition.requisitionCode} - {requisition.bookTitle}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-warm-taupe">Vendor</label>
              <select value={orderForm.vendorId} onChange={(e) => setOrderForm((prev) => ({ ...prev, vendorId: e.target.value }))} className={selectClass} disabled={creatingOrder || !vendors?.items.length} required>
                <option value="">Select vendor</option>
                {vendors?.items.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>{vendor.vendorCode} - {vendor.vendorName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-warm-taupe">Approval Date</label>
              <Input type="date" value={orderForm.procurementApprovalDate} onChange={(e) => setOrderForm((prev) => ({ ...prev, procurementApprovalDate: e.target.value }))} disabled={creatingOrder} />
            </div>
            <div>
              <label className="text-sm text-warm-taupe">Delivery Date</label>
              <Input type="date" value={orderForm.deliveryDate} onChange={(e) => setOrderForm((prev) => ({ ...prev, deliveryDate: e.target.value }))} disabled={creatingOrder} />
            </div>
            <div>
              <label className="text-sm text-warm-taupe">Handover Date To IICT</label>
              <Input type="date" value={orderForm.handoverDateToIICT} onChange={(e) => setOrderForm((prev) => ({ ...prev, handoverDateToIICT: e.target.value }))} disabled={creatingOrder} />
            </div>
            <div>
              <label className="text-sm text-warm-taupe">Procurement Status</label>
              <select value={orderForm.procurementStatus} onChange={(e) => setOrderForm((prev) => ({ ...prev, procurementStatus: e.target.value as ProcurementStatus }))} className={selectClass} disabled={creatingOrder}>
                <option value="NOT_STARTED">Not started</option>
                <option value="ONGOING">Ongoing</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-warm-taupe">Shelving Status</label>
              <select value={orderForm.shelvingStatus} onChange={(e) => setOrderForm((prev) => ({ ...prev, shelvingStatus: e.target.value as ShelvingStatus }))} className={selectClass} disabled={creatingOrder}>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In progress</option>
                <option value="SHELVED">Shelved</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-warm-taupe">Receiving Record</label>
              <Input value={orderForm.bookReceivingRecord} onChange={(e) => setOrderForm((prev) => ({ ...prev, bookReceivingRecord: e.target.value }))} disabled={creatingOrder} />
            </div>
          </div>
          <Button type="submit" disabled={creatingOrder || !requisitions?.items.length || !vendors?.items.length}>{creatingOrder ? 'Saving...' : 'Save Procurement Order'}</Button>
        </form>

        {ordersLoading && <LoadingState message="Loading procurement orders..." />}
        {ordersError && <ErrorState message="Failed to load procurement orders." onRetry={refetchOrders} />}
        {!ordersLoading && !ordersError && orders?.items.length === 0 && <EmptyState message="No procurement orders found." />}
        {!ordersLoading && !ordersError && orders && orders.items.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Book</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Shelving</TableHead>
                <TableHead>Handover</TableHead>
                <TableHead>Cataloged</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.items.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.procurementCode}</TableCell>
                  <TableCell>
                    <p>{order.requisition?.bookTitle || '-'}</p>
                    <p className="text-xs text-warm-taupe">{order.requisition?.requisitionCode || ''}</p>
                  </TableCell>
                  <TableCell>{order.vendor?.vendorName || '-'}</TableCell>
                  <TableCell><Badge variant={statusVariant[order.procurementStatus]}>{order.procurementStatus}</Badge></TableCell>
                  <TableCell><Badge variant={shelvingVariant[order.shelvingStatus]}>{order.shelvingStatus}</Badge></TableCell>
                  <TableCell>{formatDate(order.handoverDateToIICT)}</TableCell>
                  <TableCell>{order.books?.length ?? 0}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {order.procurementStatus === 'NOT_STARTED' && (
                        <Button size="sm" variant="secondary" disabled={updatingOrder} onClick={() => handleOrderUpdate(order.id, { procurementStatus: 'ONGOING' })}>Start</Button>
                      )}
                      {order.procurementStatus !== 'COMPLETED' && order.procurementStatus !== 'CANCELLED' && (
                        <Button size="sm" variant="secondary" disabled={updatingOrder} onClick={() => handleOrderUpdate(order.id, { procurementStatus: 'COMPLETED' })}>Complete</Button>
                      )}
                      {order.shelvingStatus !== 'SHELVED' && (
                        <Button size="sm" variant="ghost" disabled={updatingOrder} onClick={() => handleOrderUpdate(order.id, { shelvingStatus: 'SHELVED' })}>Shelved</Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
};

export default AdminProcurementPage;
