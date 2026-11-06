import React from 'react';
import './StatusBadge.css';

export const StatusBadge = ({ status = 'active', text, size = 'sm' }) => {
  // status: 'active' | 'inactive' | 'warning' | 'danger' | 'info'
  return (
    <span className={`status-badge ${status} size-${size}`}>
      <span className="status-badge-dot"></span>
      {text}
    </span>
  );
};

