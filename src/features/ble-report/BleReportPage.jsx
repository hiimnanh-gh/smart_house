import React, { useMemo, useState } from 'react';
import {
  FileCode2,
  Search,
  Copy,
  Check,
  Download,
  Printer,
  ChevronDown,
  ChevronUp,
  Layers,
  Code2,
  Cpu,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import {
  REPORT_CATEGORIES,
  REPORT_FEATURES,
  buildMarkdownReport,
} from './bleReportData';
import { sound } from '../../utils/soundEffects';
import './BleReportPage.css';

export const BleReportPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedIds, setExpandedIds] = useState(() =>
    new Set(REPORT_FEATURES.map((f) => f.id))
  );
  const [activeTabByFeature, setActiveTabByFeature] = useState({});
  const [fullFileMode, setFullFileMode] = useState({});
  const [copiedKey, setCopiedKey] = useState(null);

  const filteredFeatures = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return REPORT_FEATURES.filter((feat) => {
      if (activeCategory !== 'all' && feat.category !== activeCategory) {
        return false;
      }
      if (!q) return true;
      const haystacks = [
        feat.title,
        feat.summary,
        ...feat.highlights,
        ...feat.protocols,
        ...feat.files,
        ...feat.codeBlocks.map((b) => b.code),
      ];
      return haystacks.some((item) => item.toLowerCase().includes(q));
    });
  }, [searchQuery, activeCategory]);

  const stats = useMemo(() => {
    const fileSet = new Set();
    let totalLines = 0;
    REPORT_FEATURES.forEach((f) => {
      f.files.forEach((p) => fileSet.add(p));
      f.codeBlocks.forEach((b) => {
        totalLines += b.endLine - b.startLine + 1;
      });
    });
    return {
      featureCount: REPORT_FEATURES.length,
      fileCount: fileSet.size,
      extractedLines: totalLines,
    };
  }, []);

  const toggleExpand = (id) => {
    sound.playClick();
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    sound.playClick();
    setExpandedIds(new Set(REPORT_FEATURES.map((f) => f.id)));
  };

  const collapseAll = () => {
    sound.playClick();
    setExpandedIds(new Set());
  };

  const jumpToFeature = (id) => {
    sound.playClick();
    setExpandedIds((prev) => new Set([...prev, id]));
    const el = document.getElementById(`report-feat-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCopyCode = async (key, text) => {
    try {
      await navigator.clipboard.writeText(text);
      sound.playSuccess();
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    } catch {
      // Bỏ qua nếu trình duyệt chặn clipboard
    }
  };

  const handleDownloadMarkdown = () => {
    sound.playClick();
    const md = buildMarkdownReport(filteredFeatures);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bao_cao_chuc_nang_ble_stickem_${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    sound.playClick();
    setExpandedIds(new Set(filteredFeatures.map((f) => f.id)));
    setTimeout(() => window.print(), 120);
  };

  return (
    <div className="ble-report-page animate-fade-in">
      {/* Header */}
      <div className="report-header">
        <div className="report-title-wrap">
          <div className="report-badge-icon">
            <FileCode2 size={24} />
          </div>
          <div>
            <h1 className="page-title">
              Báo Cáo Tổng Hợp Chức Năng &amp; Mã Nguồn
            </h1>
            <p className="page-subtitle">
              Tài liệu kỹ thuật chi tiết từng tính năng BLE Stick &apos;Em (&quot;Chiendeptry&quot;)
              v1.3.x &amp; IoT ESP32 kèm mã nguồn thực tế đồng bộ từ dự án
            </p>
          </div>
        </div>

        <div className="report-header-actions">
          <button
            type="button"
            className="btn-rpt-action md"
            onClick={handleDownloadMarkdown}
          >
            <Download size={15} /> Tải Báo Cáo (.md)
          </button>
          <button
            type="button"
            className="btn-rpt-action print"
            onClick={handlePrint}
          >
            <Printer size={15} /> In / Xuất PDF
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="report-kpi-row">
        <div className="report-kpi-card glass-panel">
          <div className="kpi-icon cyan">
            <Layers size={18} />
          </div>
          <div>
            <span className="kpi-lbl">Tổng chức năng hoàn thiện</span>
            <div className="kpi-val">{stats.featureCount} chức năng</div>
          </div>
        </div>

        <div className="report-kpi-card glass-panel">
          <div className="kpi-icon green">
            <FileCode2 size={18} />
          </div>
          <div>
            <span className="kpi-lbl">Tệp mã nguồn liên quan</span>
            <div className="kpi-val">{stats.fileCount} files</div>
          </div>
        </div>

        <div className="report-kpi-card glass-panel">
          <div className="kpi-icon purple">
            <Code2 size={18} />
          </div>
          <div>
            <span className="kpi-lbl">Code trích dẫn trực tiếp</span>
            <div className="kpi-val">{stats.extractedLines} dòng</div>
          </div>
        </div>

        <div className="report-kpi-card glass-panel">
          <div className="kpi-icon amber">
            <Cpu size={18} />
          </div>
          <div>
            <span className="kpi-lbl">Chuẩn giao tiếp chính</span>
            <div className="kpi-val mono">0xFFE0 • mv:PWM</div>
          </div>
        </div>
      </div>

      {/* Search, Filter & Quick Jump */}
      <div className="report-toolbar glass-panel">
        <div className="report-toolbar-top">
          <div className="report-search-box">
            <Search size={16} className="search-ico" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm chức năng, tên hàm (vd: autoDetectActivePort, rotatePort, mv:, 0xFFE1)..."
            />
          </div>

          <div className="report-expand-btns">
            <button type="button" className="btn-rpt-mini" onClick={expandAll}>
              Mở tất cả
            </button>
            <button type="button" className="btn-rpt-mini" onClick={collapseAll}>
              Thu gọn
            </button>
          </div>
        </div>

        <div className="report-category-tabs">
          {REPORT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`cat-tab-btn ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => {
                sound.playClick();
                setActiveCategory(cat.id);
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="report-toc-strip">
          <span className="toc-lbl">Mục lục nhanh:</span>
          <div className="toc-pills">
            {filteredFeatures.map((f) => (
              <button
                key={f.id}
                type="button"
                className="toc-pill-btn"
                onClick={() => jumpToFeature(f.id)}
              >
                <span className="toc-num">{f.index}</span>
                <span>{f.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feature List */}
      <div className="report-features-list">
        {filteredFeatures.length === 0 ? (
          <div className="report-empty glass-panel">
            Không tìm thấy chức năng phù hợp với từ khóa &quot;{searchQuery}&quot;.
          </div>
        ) : (
          filteredFeatures.map((feat) => {
            const isExpanded = expandedIds.has(feat.id);
            const activeTabIdx = Math.min(
              activeTabByFeature[feat.id] || 0,
              feat.codeBlocks.length - 1
            );
            const currentBlock = feat.codeBlocks[activeTabIdx];
            const blockKey = `${feat.id}:${activeTabIdx}`;
            const showFull = Boolean(fullFileMode[blockKey]);
            const displayedCode = showFull ? currentBlock.fullCode : currentBlock.code;
            const codeLines = displayedCode.split('\n');
            const firstLineNum = showFull ? 1 : currentBlock.startLine;

            return (
              <section
                key={feat.id}
                id={`report-feat-${feat.id}`}
                className="report-feature-card glass-panel"
              >
                <div
                  className="rf-card-header"
                  onClick={() => toggleExpand(feat.id)}
                >
                  <div className="rf-head-left">
                    <span className="rf-index-badge">{feat.index}</span>
                    <div>
                      <h2 className="rf-title">{feat.title}</h2>
                      <div className="rf-protocols">
                        {feat.protocols.map((proto) => (
                          <span key={proto} className="rf-proto-pill">
                            {proto}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="rf-toggle-btn"
                    aria-label={isExpanded ? 'Thu gọn' : 'Mở rộng'}
                  >
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="rf-card-body">
                    <p className="rf-summary">{feat.summary}</p>

                    <div className="rf-meta-grid">
                      <div className="rf-highlights-box">
                        <h4>Điểm kỹ thuật nổi bật</h4>
                        <ul>
                          {feat.highlights.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="rf-files-box">
                        <h4>File nguồn triển khai</h4>
                        <div className="rf-file-list">
                          {feat.files.map((fp) => (
                            <code key={fp} className="rf-file-chip">
                              {fp}
                            </code>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Code Viewer */}
                    <div className="rf-code-panel">
                      <div className="rf-code-topbar">
                        <div className="rf-code-tabs">
                          {feat.codeBlocks.map((blk, idx) => (
                            <button
                              key={blk.tabLabel}
                              type="button"
                              className={`rf-code-tab ${
                                activeTabIdx === idx ? 'active' : ''
                              }`}
                              onClick={() => {
                                sound.playClick();
                                setActiveTabByFeature((prev) => ({
                                  ...prev,
                                  [feat.id]: idx,
                                }));
                              }}
                            >
                              {blk.tabLabel}
                            </button>
                          ))}
                        </div>

                        <div className="rf-code-actions">
                          <span className="rf-line-meta">
                            <code>{currentBlock.filePath}</code> • Dòng{' '}
                            {showFull
                              ? `1–${currentBlock.totalFileLines}`
                              : `${currentBlock.startLine}–${currentBlock.endLine}`}
                          </span>

                          <button
                            type="button"
                            className="btn-code-ctrl"
                            onClick={() =>
                              setFullFileMode((prev) => ({
                                ...prev,
                                [blockKey]: !showFull,
                              }))
                            }
                            title="Chuyển giữa đoạn code tiêu biểu và toàn bộ nội dung file"
                          >
                            {showFull ? (
                              <>
                                <Minimize2 size={13} /> Thu gọn đoạn chính
                              </>
                            ) : (
                              <>
                                <Maximize2 size={13} /> Toàn bộ file ({currentBlock.totalFileLines}d)
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            className={`btn-code-ctrl copy ${
                              copiedKey === blockKey ? 'copied' : ''
                            }`}
                            onClick={() => handleCopyCode(blockKey, displayedCode)}
                          >
                            {copiedKey === blockKey ? (
                              <>
                                <Check size={13} /> Đã copy
                              </>
                            ) : (
                              <>
                                <Copy size={13} /> Copy Code
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="rf-code-scroll">
                        <pre className="rf-code-pre">
                          {codeLines.map((line, idx) => (
                            <div key={idx} className="rf-code-line">
                              <span className="rf-line-num">{firstLineNum + idx}</span>
                              <span className="rf-line-text">{line || ' '}</span>
                            </div>
                          ))}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            );
          })
        )}
      </div>
    </div>
  );
};
export default BleReportPage;

