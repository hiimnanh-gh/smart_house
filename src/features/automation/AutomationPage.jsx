import React, { useState } from 'react';
import { useSmartHome } from '../../context/SmartHomeContext';
import { SceneCard } from './components/SceneCard';
import { ScheduleItem } from './components/ScheduleItem';
import { CreateSceneModal } from './components/CreateSceneModal';
import { Modal } from '../../components/common/Modal';
import { INITIAL_AUTOMATION_RULES } from './automationService';
import { Plus, Cpu, Sparkles } from 'lucide-react';
import './AutomationPage.css';

export const AutomationPage = () => {
  const {
    scenes,
    activeScene,
    activateScene,
    addLog,
  } = useSmartHome();

  const [rules, setRules] = useState(INITIAL_AUTOMATION_RULES);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleRule = (id) => {
    setRules((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const nextState = !r.isActive;
          addLog(`Quy tắc tự động "${r.name}" đã ${nextState ? 'kích hoạt' : 'tắt'}`, 'info');
          return { ...r, isActive: nextState };
        }
        return r;
      })
    );
  };

  const handleAddRule = (newRule) => {
    setRules((prev) => [newRule, ...prev]);
    addLog(`Đã tạo mới quy tắc: "${newRule.name}"`, 'success');
  };

  return (
    <div className="automation-page animate-fade-in">
      <div className="automation-page-header">
        <div>
          <h1 className="page-title">Ngữ Cảnh & Tự Động Hóa (Automation)</h1>
          <p className="page-subtitle">
            Tạo các chuỗi hành động thông minh theo kịch bản sinh hoạt và điều kiện thời gian thực
          </p>
        </div>

        <button className="btn-add-rule" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Thêm Quy Tắc Mới
        </button>
      </div>

      {/* Preset Scenes Grid */}
      <div className="scenes-section">
        <div className="section-title-wrap">
          <Sparkles size={20} className="title-icon" />
          <div>
            <h3>Kịch Bản Ngữ Cảnh Nhanh (Smart Scenes)</h3>
            <p>1 chạm để điều chỉnh đồng loạt ánh sáng, nhiệt độ và an ninh</p>
          </div>
        </div>

        <div className="scenes-grid">
          {scenes.map((scene) => (
            <SceneCard
              key={scene.id}
              scene={scene}
              isActive={activeScene === scene.id}
              onActivate={activateScene}
            />
          ))}
        </div>
      </div>

      {/* Rules / IFTTT List */}
      <div className="rules-section">
        <div className="section-title-wrap">
          <Cpu size={20} className="title-icon" />
          <div>
            <h3>Quy Tắc Tự Động Theo Điều Kiện (IFTTT Engine)</h3>
            <p>Tự động thực thi khi cảm biến vượt ngưỡng hoặc tới giờ hẹn</p>
          </div>
        </div>

        <div className="rules-list">
          {rules.map((rule) => (
            <ScheduleItem
              key={rule.id}
              rule={rule}
              onToggleRule={toggleRule}
            />
          ))}
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tạo Mới Quy Tắc Tự Động Hóa"
      >
        <CreateSceneModal
          onAddRule={handleAddRule}
          onClose={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

