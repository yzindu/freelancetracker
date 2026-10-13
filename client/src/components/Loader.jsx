import React from 'react';

export const SpinnerLoader = ({ text = 'Loading data...', size = 32 }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1rem',
        gap: '0.85rem',
        color: 'var(--text-secondary)'
      }}
    >
      <div className="spinner" style={{ width: `${size}px`, height: `${size}px` }} />
      {text && <span style={{ fontSize: '0.875rem' }}>{text}</span>}
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={`sk-th-${i}`}>
                <div
                  className="skeleton"
                  style={{ height: '14px', width: `${60 + (i % 3) * 20}%` }}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={`sk-tr-${r}`}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={`sk-td-${r}-${c}`}>
                  <div
                    className="skeleton"
                    style={{ height: '18px', width: `${70 + ((r + c) % 4) * 8}%` }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SpinnerLoader;
