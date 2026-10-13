import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import SearchFilterBar from '../components/SearchFilterBar';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { TableSkeleton } from '../components/Loader';
import { isRequired, isPositiveNumber } from '../utils/validators';
import { formatCurrency, formatDate, formatInputDate } from '../utils/format';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiDollarSign,
  FiCalendar,
  FiBriefcase,
  FiCreditCard,
  FiCheckCircle,
  FiClock,
  FiFilter
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = ['Bank Transfer', 'PayPal', 'Credit Card', 'Cash', 'Other'];
const PAYMENT_STATUSES = ['Paid', 'Pending'];

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({ totalAmount: 0, totalPaidAmount: 0, totalPendingAmount: 0 });
  const [projectOptions, setProjectOptions] = useState([]);
  const [clientOptions, setClientOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    project: '',
    amount: '',
    date: formatInputDate(new Date()),
    method: 'Bank Transfer',
    status: 'Paid',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Delete State
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch dropdown options (projects and clients)
  const fetchDropdownData = useCallback(async () => {
    try {
      const [projRes, clientRes] = await Promise.all([
        api.get('/projects?all=true'),
        api.get('/clients?all=true')
      ]);
      if (projRes.data?.success) setProjectOptions(projRes.data.data);
      if (clientRes.data?.success) setClientOptions(clientRes.data.data);
    } catch (err) {
      console.error('Failed to load filter options:', err);
    }
  }, []);

  useEffect(() => {
    fetchDropdownData();
  }, [fetchDropdownData]);

  // Fetch Payments
  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/payments', {
        params: {
          page,
          limit: 10,
          status: statusFilter,
          client: clientFilter,
          project: projectFilter,
          from: fromDate,
          to: toDate
        }
      });
      if (res.data?.success) {
        setPayments(res.data.data);
        setTotalPages(res.data.pages || 1);
        setTotalItems(res.data.total || 0);
        if (res.data.summary) {
          setSummary(res.data.summary);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, clientFilter, projectFilter, fromDate, toDate]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Reset Filters
  const handleResetFilters = () => {
    setStatusFilter('');
    setClientFilter('');
    setProjectFilter('');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingPayment(null);
    setFormData({
      project: projectOptions.length > 0 ? projectOptions[0]._id : '',
      amount: '',
      date: formatInputDate(new Date()),
      method: 'Bank Transfer',
      status: 'Paid',
      notes: ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (p) => {
    setEditingPayment(p);
    setFormData({
      project: p.project?._id || p.project || '',
      amount: p.amount !== undefined ? String(p.amount) : '',
      date: formatInputDate(p.date),
      method: p.method || 'Bank Transfer',
      status: p.status || 'Paid',
      notes: p.notes || ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Handle Form Change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Validate Form
  const validate = () => {
    const errors = {};
    if (!isRequired(formData.project)) {
      errors.project = 'Project is required';
    }
    if (!isPositiveNumber(formData.amount)) {
      errors.amount = 'Amount must be a number greater than 0';
    }
    if (!isRequired(formData.date)) {
      errors.date = 'Payment date is required';
    }
    return errors;
  };

  // Submit Payment
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        project: formData.project,
        amount: Number(formData.amount),
        date: formData.date,
        method: formData.method,
        status: formData.status,
        notes: formData.notes.trim()
      };

      if (editingPayment) {
        await api.put(`/payments/${editingPayment._id}`, payload);
        toast.success('Payment updated successfully');
      } else {
        await api.post('/payments', payload);
        toast.success('Payment recorded successfully');
      }
      setIsModalOpen(false);
      fetchPayments();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save payment';
      toast.error(msg);
      setFormErrors({ server: msg });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Payment
  const handleDeleteConfirm = async () => {
    if (!paymentToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/payments/${paymentToDelete._id}`);
      toast.success('Payment record removed successfully');
      setPaymentToDelete(null);
      if (payments.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        fetchPayments();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete payment';
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  const hasActiveFilters = statusFilter || clientFilter || projectFilter || fromDate || toDate;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header and Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Financial Income & Payments</h2>
          <p className="text-secondary text-sm">
            Track invoices, received transfers, and historical revenue.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleOpenCreateModal}
        >
          <FiPlus size={18} /> Record New Payment
        </button>
      </div>

      {/* Income Summary Metric Widgets */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem'
        }}
      >
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FiCheckCircle size={16} />
            </div>
            <span className="text-secondary text-xs uppercase font-semibold">Total Received</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399' }}>
            {formatCurrency(summary.totalPaidAmount)}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FiClock size={16} />
            </div>
            <span className="text-secondary text-xs uppercase font-semibold">Pending Payments</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fbbf24' }}>
            {formatCurrency(summary.totalPendingAmount)}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FiDollarSign size={16} />
            </div>
            <span className="text-secondary text-xs uppercase font-semibold">Filtered Total Volume</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {formatCurrency(summary.totalAmount)}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          <FiFilter size={16} />
          <span className="font-semibold">Filters:</span>
        </div>

        {/* Status Filter */}
        <select
          className="form-control"
          style={{ width: '150px', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Statuses</option>
          {PAYMENT_STATUSES.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>

        {/* Client Filter */}
        <select
          className="form-control"
          style={{ width: '180px', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
          value={clientFilter}
          onChange={(e) => {
            setClientFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Clients</option>
          {clientOptions.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Project Filter */}
        <select
          className="form-control"
          style={{ width: '190px', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
          value={projectFilter}
          onChange={(e) => {
            setProjectFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Projects</option>
          {projectOptions.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* Date From */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span className="text-secondary text-xs">From:</span>
          <input
            type="date"
            className="form-control"
            style={{ width: '145px', padding: '0.45rem 0.65rem', fontSize: '0.8rem' }}
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Date To */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span className="text-secondary text-xs">To:</span>
          <input
            type="date"
            className="form-control"
            style={{ width: '145px', padding: '0.45rem 0.65rem', fontSize: '0.8rem' }}
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Reset Filters button */}
        {hasActiveFilters && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleResetFilters}
            style={{ marginLeft: 'auto' }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Payments Table */}
      {loading ? (
        <TableSkeleton rows={5} cols={7} />
      ) : payments.length === 0 ? (
        <EmptyState
          icon={FiDollarSign}
          title={hasActiveFilters ? 'No matching payment records' : 'No payments logged yet'}
          description={
            hasActiveFilters
              ? 'Try clearing some of your filters or expanding the date range.'
              : 'Record incoming client payments to monitor cash flow and invoice history.'
          }
          action={
            !hasActiveFilters && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleOpenCreateModal}
              >
                <FiPlus size={16} /> Record First Payment
              </button>
            )
          }
        />
      ) : (
        <>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Project</th>
                  <th>Client</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}>
                        <FiCalendar size={13} className="text-muted" />
                        <span>{formatDate(p.date)}</span>
                      </div>
                    </td>
                    <td>
                      <span className="font-semibold">{p.project?.name || 'Unknown Project'}</span>
                    </td>
                    <td>
                      <span className="text-secondary text-sm">{p.client?.name || '—'}</span>
                    </td>
                    <td>
                      <span
                        className="font-mono font-bold"
                        style={{
                          fontSize: '1rem',
                          color: p.status === 'Paid' ? '#34d399' : '#fbbf24'
                        }}
                      >
                        {formatCurrency(p.amount)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem' }}>
                        <FiCreditCard size={13} className="text-muted" />
                        <span>{p.method || 'Bank Transfer'}</span>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                    <td>
                      {p.notes ? (
                        <span
                          style={{
                            display: 'inline-block',
                            maxWidth: '160px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: 'var(--text-muted)',
                            fontSize: '0.825rem'
                          }}
                          title={p.notes}
                        >
                          {p.notes}
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => handleOpenEditModal(p)}
                          title="Edit payment"
                        >
                          <FiEdit2 size={15} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon"
                          style={{ color: '#f87171' }}
                          onClick={() => setPaymentToDelete(p)}
                          title="Delete payment"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </>
      )}

      {/* Record / Edit Payment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPayment ? 'Edit Payment Record' : 'Record New Income Payment'}
        maxWidth="540px"
      >
        <form onSubmit={handleSubmit} noValidate>
          {formErrors.server && (
            <div
              style={{
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#f87171',
                fontSize: '0.85rem',
                marginBottom: '1rem'
              }}
            >
              {formErrors.server}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="pay-project">
              Associated Project <span className="required">*</span>
            </label>
            <select
              id="pay-project"
              name="project"
              value={formData.project}
              onChange={handleFormChange}
              className={`form-control ${formErrors.project ? 'is-invalid' : ''}`}
            >
              <option value="">Select a Project</option>
              {projectOptions.map((pr) => (
                <option key={pr._id} value={pr._id}>
                  {pr.name} ({pr.client?.name || 'Client'})
                </option>
              ))}
            </select>
            {formErrors.project && <span className="form-error">{formErrors.project}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="pay-amount">
                Amount (USD) <span className="required">*</span>
              </label>
              <input
                id="pay-amount"
                type="number"
                step="any"
                min="0.01"
                name="amount"
                value={formData.amount}
                onChange={handleFormChange}
                placeholder="e.g. 1500"
                className={`form-control ${formErrors.amount ? 'is-invalid' : ''}`}
              />
              {formErrors.amount && <span className="form-error">{formErrors.amount}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="pay-date">
                Payment Date <span className="required">*</span>
              </label>
              <input
                id="pay-date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleFormChange}
                className={`form-control ${formErrors.date ? 'is-invalid' : ''}`}
              />
              {formErrors.date && <span className="form-error">{formErrors.date}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="pay-method">
                Payment Method
              </label>
              <select
                id="pay-method"
                name="method"
                value={formData.method}
                onChange={handleFormChange}
                className="form-control"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="pay-status">
                Status
              </label>
              <select
                id="pay-status"
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                className="form-control"
              >
                {PAYMENT_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="pay-notes">
              Transaction Notes / Invoice Ref
            </label>
            <input
              id="pay-notes"
              type="text"
              name="notes"
              value={formData.notes}
              onChange={handleFormChange}
              placeholder="e.g. Milestone 1 - Wire Transfer ref #98214"
              className="form-control"
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              marginTop: '1.5rem'
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="spinner" style={{ width: '16px', height: '16px' }} />
                  Saving...
                </>
              ) : editingPayment ? (
                'Save Changes'
              ) : (
                'Record Payment'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!paymentToDelete}
        onClose={() => setPaymentToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Payment Record"
        message={`Are you sure you want to delete this payment of ${formatCurrency(paymentToDelete?.amount)}? This will recalculate the associated project's paid balance.`}
        confirmText="Delete Record"
        loading={deleting}
      />
    </div>
  );
};

export default Payments;
