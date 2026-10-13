import React from 'react';

const statusClassMap = {
  active: 'badge-active',
  pending: 'badge-pending',
  completed: 'badge-completed',
  'on hold': 'badge-on-hold',
  onhold: 'badge-on-hold',
  cancelled: 'badge-cancelled',
  paid: 'badge-paid',
  unpaid: 'badge-unpaid'
};

const StatusBadge = ({ status }) => {
  if (!status) return null;

  const normalized = String(status).toLowerCase().trim();
  const className = statusClassMap[normalized] || 'badge-pending';

  return <span className={`badge ${className}`}>{status}</span>;
};

export default StatusBadge;
