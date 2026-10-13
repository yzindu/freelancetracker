import React from 'react';
import { FiInbox } from 'react-icons/fi';

const EmptyState = ({
  icon: Icon = FiInbox,
  title = 'No records found',
  description = 'There is currently no data matching your criteria.',
  action
}) => {
  return (
    <div className="empty-state card" style={{ margin: '1rem 0' }}>
      <div className="empty-state-icon">
        <Icon />
      </div>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.35rem' }}>{title}</h3>
      <p
        className="text-secondary text-sm"
        style={{ maxWidth: '420px', margin: '0 auto 1.5rem', lineHeight: '1.6' }}
      >
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
