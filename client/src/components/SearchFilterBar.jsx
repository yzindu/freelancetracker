import React from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

const SearchFilterBar = ({
  search = '',
  onSearchChange,
  placeholder = 'Search records...',
  children,
  actionButton
}) => {
  return (
    <div className="filter-bar">
      <div className="filter-group">
        {/* Search Input Box */}
        <div className="search-input-wrapper">
          <FiSearch size={16} />
          <input
            type="text"
            className="form-control"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              style={{
                position: 'absolute',
                right: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                display: 'flex'
              }}
              title="Clear search"
            >
              <FiX size={14} />
            </button>
          )}
        </div>

        {/* Custom filter dropdowns or date pickers */}
        {children}
      </div>

      {/* Main Right Action Button (e.g., + Add Project / Client / Payment) */}
      {actionButton && <div>{actionButton}</div>}
    </div>
  );
};

export default SearchFilterBar;
