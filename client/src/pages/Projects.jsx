import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import SearchFilterBar from '../components/SearchFilterBar';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { TableSkeleton } from '../components/Loader';
import { isRequired, isNonNegativeNumber } from '../utils/validators';
import { formatCurrency, formatDate, formatInputDate, isOverdue } from '../utils/format';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiBriefcase,
  FiCalendar,
  FiClock,
  FiAlertCircle
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['Pending', 'Active', 'Completed', 'On Hold', 'Cancelled'];

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [clientOptions, setClientOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    status: 'Pending',
    fee: '',
    startDate: '',
    deadline: '',
    description: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Delete State
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch Clients for dropdown
  const fetchClientOptions = useCallback(async () => {
    try {
      const res = await api.get('/clients?all=true');
      if (res.data?.success) {
        setClientOptions(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load client options:', err);
    }
  }, []);

  useEffect(() => {
    fetchClientOptions();
  }, [fetchClientOptions]);

  // Fetch Projects with Filters
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/projects', {
        params: {
          page,
          limit: 10,
          search,
          status: statusFilter,
          client: clientFilter
        }
      });
      if (res.data?.success) {
        setProjects(res.data.data);
        setTotalPages(res.data.pages || 1);
        setTotalItems(res.data.total || 0);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, clientFilter]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      client: clientOptions.length > 0 ? clientOptions[0]._id : '',
      status: 'Active',
      fee: '',
      startDate: formatInputDate(new Date()),
      deadline: '',
      description: ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (proj) => {
    setEditingProject(proj);
    setFormData({
      name: proj.name || '',
      client: proj.client?._id || proj.client || '',
      status: proj.status || 'Active',
      fee: proj.fee !== undefined ? String(proj.fee) : '',
      startDate: formatInputDate(proj.startDate),
      deadline: formatInputDate(proj.deadline),
      description: proj.description || ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Handle Input Changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Validate Project Form
  const validate = () => {
    const errors = {};
    if (!isRequired(formData.name)) {
      errors.name = 'Project name is required';
    }
    if (!isRequired(formData.client)) {
      errors.client = 'Please assign a client to this project';
    }
    if (!isNonNegativeNumber(formData.fee)) {
      errors.fee = 'Fee must be a valid non-negative number';
    }
    return errors;
  };

  // Submit Project
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
        name: formData.name.trim(),
        client: formData.client,
        status: formData.status,
        fee: Number(formData.fee),
        startDate: formData.startDate || null,
        deadline: formData.deadline || null,
        description: formData.description.trim()
      };

      if (editingProject) {
        await api.put(`/projects/${editingProject._id}`, payload);
        toast.success(`Project "${payload.name}" updated successfully`);
      } else {
        await api.post('/projects', payload);
        toast.success(`Project "${payload.name}" created successfully`);
      }
      setIsModalOpen(false);
      fetchProjects();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save project';
      toast.error(msg);
      setFormErrors({ server: msg });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Project
  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/projects/${projectToDelete._id}`);
      toast.success(`Project "${projectToDelete.name}" and associated payments deleted`);
      setProjectToDelete(null);
      if (projects.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        fetchProjects();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete project';
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Projects Management</h2>
          <p className="text-secondary text-sm">
            Monitor client engagements, fee milestones, and delivery deadlines.
          </p>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <SearchFilterBar
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        placeholder="Search projects by name..."
        actionButton={
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleOpenCreateModal}
          >
            <FiPlus size={18} /> Add New Project
          </button>
        }
      >
        {/* Status Filter */}
        <select
          className="form-control"
          style={{ width: '160px', padding: '0.625rem 0.85rem' }}
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>

        {/* Client Filter */}
        <select
          className="form-control"
          style={{ width: '180px', padding: '0.625rem 0.85rem' }}
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
      </SearchFilterBar>

      {/* Projects Table */}
      {loading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FiBriefcase}
          title={search || statusFilter || clientFilter ? 'No matching projects' : 'No projects found'}
          description={
            search || statusFilter || clientFilter
              ? 'Try adjusting your status, client, or search keywords to find what you are looking for.'
              : 'Add your first project to start tracking milestones and earnings.'
          }
          action={
            !search && !statusFilter && !clientFilter && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleOpenCreateModal}
              >
                <FiPlus size={16} /> Create Your First Project
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
                  <th>Project Name</th>
                  <th>Client</th>
                  <th>Status</th>
                  <th>Fee & Payment Progress</th>
                  <th>Deadline</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((proj) => {
                  const paidPct = proj.fee > 0 ? Math.min(100, Math.round(((proj.paidAmount || 0) / proj.fee) * 100)) : 0;
                  const overdue = isOverdue(proj.deadline, proj.status);

                  return (
                    <tr key={proj._id}>
                      <td>
                        <div>
                          <div className="font-semibold" style={{ fontSize: '0.95rem' }}>
                            {proj.name}
                          </div>
                          {proj.description && (
                            <div
                              className="text-secondary text-xs"
                              style={{
                                maxWidth: '240px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                marginTop: '2px'
                              }}
                              title={proj.description}
                            >
                              {proj.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span className="font-semibold text-sm">
                            {proj.client?.name || 'Unknown Client'}
                          </span>
                          {proj.client?.company && (
                            <span className="text-muted text-xs">{proj.client.company}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={proj.status} />
                      </td>
                      <td style={{ minWidth: '190px' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '4px' }}>
                            <span className="font-semibold">{formatCurrency(proj.fee)}</span>
                            <span className="text-secondary text-xs font-mono">
                              {formatCurrency(proj.paidAmount || 0)} ({paidPct}%)
                            </span>
                          </div>
                          <div className="progress-container">
                            <div
                              className="progress-bar-fill"
                              style={{
                                width: `${paidPct}%`,
                                background:
                                  paidPct === 100
                                    ? 'var(--gradient-accent)'
                                    : 'var(--gradient-primary)'
                              }}
                            />
                          </div>
                          {proj.remainingAmount > 0 && (
                            <span className="text-muted text-xs" style={{ display: 'block', marginTop: '2px' }}>
                              Pending: {formatCurrency(proj.remainingAmount)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                          <FiCalendar size={13} className="text-muted" />
                          <span
                            style={{
                              color: overdue ? '#f87171' : 'var(--text-secondary)',
                              fontWeight: overdue ? 600 : 400
                            }}
                          >
                            {formatDate(proj.deadline)}
                          </span>
                          {overdue && (
                            <span
                              title="Project is past deadline"
                              style={{ color: '#ef4444', display: 'flex' }}
                            >
                              <FiAlertCircle size={14} />
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <button
                            type="button"
                            className="btn-icon"
                            onClick={() => handleOpenEditModal(proj)}
                            title="Edit project"
                          >
                            <FiEdit2 size={15} />
                          </button>
                          <button
                            type="button"
                            className="btn-icon"
                            style={{ color: '#f87171' }}
                            onClick={() => setProjectToDelete(proj)}
                            title="Delete project"
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

      {/* Add / Edit Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? 'Edit Project' : 'Create New Project'}
        maxWidth="580px"
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
            <label className="form-label" htmlFor="project-name">
              Project Name <span className="required">*</span>
            </label>
            <input
              id="project-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              placeholder="e.g. Fintech Mobile App Redesign"
              className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
            />
            {formErrors.name && <span className="form-error">{formErrors.name}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="project-client">
                Client <span className="required">*</span>
              </label>
              <select
                id="project-client"
                name="client"
                value={formData.client}
                onChange={handleFormChange}
                className={`form-control ${formErrors.client ? 'is-invalid' : ''}`}
              >
                <option value="">Select a Client</option>
                {clientOptions.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} {c.company ? `(${c.company})` : ''}
                  </option>
                ))}
              </select>
              {formErrors.client && <span className="form-error">{formErrors.client}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="project-status">
                Status
              </label>
              <select
                id="project-status"
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                className="form-control"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="project-fee">
                Total Fee (USD) <span className="required">*</span>
              </label>
              <input
                id="project-fee"
                type="number"
                step="any"
                min="0"
                name="fee"
                value={formData.fee}
                onChange={handleFormChange}
                placeholder="e.g. 2500"
                className={`form-control ${formErrors.fee ? 'is-invalid' : ''}`}
              />
              {formErrors.fee && <span className="form-error">{formErrors.fee}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="project-start-date">
                Start Date
              </label>
              <input
                id="project-start-date"
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleFormChange}
                className="form-control"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="project-deadline">
              Deadline Date
            </label>
            <input
              id="project-deadline"
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleFormChange}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="project-description">
              Scope & Deliverables Description
            </label>
            <textarea
              id="project-description"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              placeholder="Outline project milestones, key deliverables, and client specs..."
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
              ) : editingProject ? (
                'Save Changes'
              ) : (
                'Create Project'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Project"
        message={`Are you sure you want to delete project "${projectToDelete?.name}"? All logged income payments associated with this project will also be deleted.`}
        confirmText="Delete Project"
        loading={deleting}
      />
    </div>
  );
};

export default Projects;
