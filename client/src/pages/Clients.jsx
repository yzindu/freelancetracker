import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import SearchFilterBar from '../components/SearchFilterBar';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import { TableSkeleton } from '../components/Loader';
import { isRequired, isValidEmail } from '../utils/validators';
import { formatDate } from '../utils/format';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiUser,
  FiMail,
  FiPhone,
  FiBriefcase,
  FiFileText
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Delete State
  const [clientToDelete, setClientToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch Clients
  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/clients', {
        params: {
          page,
          limit: 10,
          search
        }
      });
      if (res.data?.success) {
        setClients(res.data.data);
        setTotalPages(res.data.pages || 1);
        setTotalItems(res.data.total || 0);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Handle Search Input (reset to page 1)
  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      notes: ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      company: client.company || '',
      notes: client.notes || ''
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

  // Validate Client Form
  const validate = () => {
    const errors = {};
    if (!isRequired(formData.name)) {
      errors.name = 'Client name is required';
    }
    if (formData.email && !isValidEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    return errors;
  };

  // Submit Client (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      if (editingClient) {
        await api.put(`/clients/${editingClient._id}`, formData);
        toast.success(`Client "${formData.name}" updated successfully`);
      } else {
        await api.post('/clients', formData);
        toast.success(`Client "${formData.name}" created successfully`);
      }
      setIsModalOpen(false);
      fetchClients();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save client';
      toast.error(msg);
      setFormErrors({ server: msg });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/clients/${clientToDelete._id}`);
      toast.success(`Client "${clientToDelete.name}" removed successfully`);
      setClientToDelete(null);
      // If we just deleted the last item on current page and page > 1, go back one page
      if (clients.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        fetchClients();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete client';
      toast.error(msg, { duration: 5000 });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Clients Management</h2>
          <p className="text-secondary text-sm">
            Maintain your contacts, companies, and relationship notes.
          </p>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <SearchFilterBar
        search={search}
        onSearchChange={handleSearchChange}
        placeholder="Search clients by name, email, or company..."
        actionButton={
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleOpenCreateModal}
          >
            <FiPlus size={18} /> Add New Client
          </button>
        }
      />

      {/* Clients Data List / Table */}
      {loading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : clients.length === 0 ? (
        <EmptyState
          icon={FiUser}
          title={search ? 'No clients match your search' : 'No clients added yet'}
          description={
            search
              ? `No records found for "${search}". Try checking for typos or clear your search query.`
              : 'Add your first client to start creating projects and tracking invoices.'
          }
          action={
            !search && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleOpenCreateModal}
              >
                <FiPlus size={16} /> Add Your First Client
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
                  <th>Client Name</th>
                  <th>Company</th>
                  <th>Contact Info</th>
                  <th>Notes</th>
                  <th>Created</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: 'var(--radius-full)',
                            background: 'rgba(99, 102, 241, 0.12)',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.8rem'
                          }}
                        >
                          {client.name?.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-semibold">{client.name}</span>
                      </div>
                    </td>
                    <td>
                      {client.company ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <FiBriefcase size={14} className="text-muted" />
                          <span>{client.company}</span>
                        </div>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.825rem' }}>
                        {client.email && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <FiMail size={13} className="text-muted" />
                            <a href={`mailto:${client.email}`} className="text-secondary" style={{ textDecoration: 'underline' }}>
                              {client.email}
                            </a>
                          </div>
                        )}
                        {client.phone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <FiPhone size={13} className="text-muted" />
                            <span className="text-secondary">{client.phone}</span>
                          </div>
                        )}
                        {!client.email && !client.phone && <span className="text-muted">—</span>}
                      </div>
                    </td>
                    <td>
                      {client.notes ? (
                        <span
                          style={{
                            display: 'inline-block',
                            maxWidth: '180px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: 'var(--text-secondary)',
                            fontSize: '0.825rem'
                          }}
                          title={client.notes}
                        >
                          {client.notes}
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="text-secondary text-sm">
                      {formatDate(client.createdAt)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => handleOpenEditModal(client)}
                          title="Edit client"
                        >
                          <FiEdit2 size={15} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon"
                          style={{ color: '#f87171' }}
                          onClick={() => setClientToDelete(client)}
                          title="Delete client"
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

      {/* Add / Edit Client Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClient ? 'Edit Client' : 'Add New Client'}
        maxWidth="520px"
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
            <label className="form-label" htmlFor="client-name">
              Client Name <span className="required">*</span>
            </label>
            <input
              id="client-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              placeholder="e.g. Acme Studio or Sarah Connor"
              className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
            />
            {formErrors.name && <span className="form-error">{formErrors.name}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="client-company">
                Company / Organization
              </label>
              <input
                id="client-company"
                type="text"
                name="company"
                value={formData.company}
                onChange={handleFormChange}
                placeholder="e.g. Acme Corp"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="client-phone">
                Phone Number
              </label>
              <input
                id="client-phone"
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
                placeholder="e.g. +1 555-0199"
                className="form-control"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="client-email">
              Email Address
            </label>
            <input
              id="client-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleFormChange}
              placeholder="e.g. sarah@acme.com"
              className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
            />
            {formErrors.email && <span className="form-error">{formErrors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="client-notes">
              Notes & Background
            </label>
            <textarea
              id="client-notes"
              name="notes"
              value={formData.notes}
              onChange={handleFormChange}
              placeholder="Preferred communication channel, timezone, rate agreements..."
              className="form-control"
              rows={3}
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
              ) : editingClient ? (
                'Save Changes'
              ) : (
                'Create Client'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!clientToDelete}
        onClose={() => setClientToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Client"
        message={`Are you sure you want to delete client "${clientToDelete?.name}"? You will not be able to delete this client if they still have active projects.`}
        confirmText="Delete Client"
        loading={deleting}
      />
    </div>
  );
};

export default Clients;
