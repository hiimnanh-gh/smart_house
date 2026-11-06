import React from 'react';
import { Home, Shield, Moon, Sparkles, Film, Play } from 'lucide-react';
import './SceneCard.css';

const SCENE_ICONS = {
  home: Home,
  shield: Shield,
  moon: Moon,
  sparkles: Sparkles,
  film: Film,
};

export const SceneCard = ({ scene, isActive, onActivate }) => {
  const Icon = SCENE_ICONS[scene.icon] || Sparkles;

  return (
    <div className={`scene-card glass-panel ${isActive ? 'scene-active' : ''}`}>
      <div className="scene-card-top">
        <div className="scene-icon-wrap">
          <Icon size={24} />
        </div>
        {isActive && <span className="scene-active-tag">Đang Áp Dụng</span>}
      </div>

      <div className="scene-card-body">
        <h4 className="scene-title">{scene.name}</h4>
        <p className="scene-desc">{scene.desc}</p>
      </div>

      <div className="scene-card-footer">
        <button
          className={`btn-activate-scene ${isActive ? 'btn-current' : ''}`}
          onClick={() => onActivate(scene.id)}
        >
          <Play size={14} />
          {isActive ? 'Kịch Bản Hiện Tại' : 'Kích Hoạt Kịch Bản'}
        </button>
      </div>
    </div>
  );
};

