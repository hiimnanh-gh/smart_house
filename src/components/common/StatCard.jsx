import React from 'react';
import './StatCard.css';

export const StatCard = ({
  icon: Icon,
  title,
  value,
  unit,
  subtext,
  color = 'cyan', // cyan, amber, emerald, violet, rose
  trend,
  onClick,
}) => {
  return (
    <div className={`stat-card glass-panel color-${color} ${onClick ? 'clickable' : ''}`} onClick={onClick}>
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        {Icon && (
          <div className="stat-card-icon-wrapper">
            <Icon size={20} className="stat-icon" />
          </div>
        )}
      </div>

      <div className="stat-card-body">
        <div className="stat-value-container">
          <span className="stat-value">{value}</span>
          {unit && <span className="stat-unit">{unit}</span>}
        </div>

        {trend && (
          <span className={`stat-trend ${trend.type || 'neutral'}`}>
            {trend.text}
          </span>
        )}
      </div>

      {subtext && <div className="stat-card-footer">{subtext}</div>}
    </div>
  );
};

