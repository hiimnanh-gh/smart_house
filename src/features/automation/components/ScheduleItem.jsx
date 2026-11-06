import React from 'react';
import { ToggleSwitch } from '../../../components/common/ToggleSwitch';
import { ArrowRight, Cpu, Thermometer, Shield, Zap } from 'lucide-react';
import './ScheduleItem.css';

export const ScheduleItem = ({ rule, onToggleRule }) => {
  const getCatIcon = (cat) => {
    switch (cat) {
      case 'climate':
        return <Thermometer size={16} className="cat-icon climate" />;
      case 'security':
        return <Shield size={16} className="cat-icon security" />;
      case 'energy':
        return <Zap size={16} className="cat-icon energy" />;
      default:
        return <Cpu size={16} className="cat-icon" />;
    }
  };

  return (
    <div className={`rule-item-card glass-panel ${rule.isActive ? 'rule-active' : ''}`}>
      <div className="rule-left">
        <div className="rule-cat-badge">
          {getCatIcon(rule.category)}
        </div>
        <div className="rule-details">
          <h4 className="rule-name">{rule.name}</h4>
          <div className="rule-condition-flow">
            <span className="flow-trigger">NẾU: {rule.trigger}</span>
            <ArrowRight size={14} className="flow-arrow" />
            <span className="flow-action">THÌ: {rule.action}</span>
          </div>
        </div>
      </div>

      <div className="rule-right">
        <ToggleSwitch
          size="sm"
          checked={rule.isActive}
          onChange={() => onToggleRule(rule.id)}
        />
      </div>
    </div>
  );
};

