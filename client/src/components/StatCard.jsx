import React from 'react';

const StatCard = ({
  title,
  value,
  icon: Icon,
  iconBg = 'rgba(99, 102, 241, 0.15)',
  iconColor = 'var(--primary)',
  subtitle,
  badgeText,
  badgeType = 'positive'
}) => {
  return (
    <div className="stat-card">
      <div className="stat-info">
        <span className="stat-label">{title}</span>
        <span className="stat-value">{value}</span>
        {subtitle && (
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {subtitle}
          </span>
        )}
      </div>

      <div
        className="stat-icon-wrapper"
        style={{
          background: iconBg,
          color: iconColor,
          border: `1px solid ${iconColor}33`
        }}
      >
        {Icon && <Icon />}
      </div>
    </div>
  );
};

export default StatCard;
