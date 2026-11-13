'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ISO_TEMPLATE_CODES, isIsoTemplate } from '@/lib/constants';

export default function TemplateList({ type = 'regular' }) {
  const isIso = type === 'iso';
  const [templates, setTemplates] = useState([]);
  const [counts, setCounts] = useState({ regular: 0, iso: 0, total: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [user, setUser] = useState(null);

  // Inline rename states
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const hasPerm = (code) => {
    if (!user) return false;
    if (user.role_code === 'ADMIN') return true;
    return Array.isArray(user.permissions) && user.permissions.includes(code);
  };

  const fetchTemplates = (searchValue = searchTerm) => {
    setLoading(true);
    let url = `/api/templates?type=${type}&`;
    if (searchValue) url += `search=${encodeURIComponent(searchValue)}&`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Double filter client-side as safeguard
          const filtered = (data.templates || []).filter(tpl => {
            const isMatch = isIsoTemplate(tpl);
            return isIso ? isMatch : !isMatch;
          });
          setTemplates(filtered);

          if (data.counts) {
            setCounts(data.counts);
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTemplates('');
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, [type]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTemplates(searchTerm);
  };

  const startInlineEdit = (tpl) => {
    setEditingId(tpl.id);
    setEditingName(tpl.name || '');
    setFeedback(null);
  };

  const cancelInlineEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const saveInlineName = async (tpl) => {
    const trimmed = editingName.trim();
    if (!trimmed) {
      setFeedback({ type: 'danger', text: 'Tên biểu mẫu không được để trống.' });
      return;
    }
    if (trimmed === tpl.name) {
      cancelInlineEdit();
      return;
    }

    setSavingId(tpl.id);
    setFeedback(null);
    try {
      const res = await fetch(`/api/templates/${tpl.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed })
      });
      const data = await res.json();
      if (data.success) {
        setTemplates(prev =>
          prev.map(item =>
            item.id === tpl.id
              ? { ...item, name: data.template?.name || trimmed, version: data.template?.version ?? item.version }
              : item
          )
        );
        setFeedback({ type: 'success', text: `Đã đổi tên biểu mẫu thành "${trimmed}".` });
        cancelInlineEdit();
      } else {
        setFeedback({ type: 'danger', text: data.message || 'Không thể cập nhật tên biểu mẫu.' });
      }
    } catch (err) {
      setFeedback({ type: 'danger', text: 'Lỗi kết nối: ' + err.message });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center pb-3 mb-3 border-bottom">
        <div>
          <h3 className={`fw-bold mb-1 ${isIso ? 'text-primary' : 'text-primary'}`}>
            {isIso ? (
              <>
                <i className="bi bi-patch-check-fill text-warning me-2"></i>
                Danh Sách Template ISO
              </>
            ) : (
              <>
                <i className="bi bi-collection me-2 text-primary"></i>
                Danh Sách Template Thường Quy
              </>
            )}
          </h3>
          <p className="text-muted mb-0">
            {isIso
              ? 'Quản lý các biểu mẫu kiểm soát chất lượng đạt chuẩn ISO (FQC-002-02, FQC-003-02, FQC-004-02, FQC-005-02).'
              : 'Quản lý các biểu mẫu hành chính, đề nghị thanh toán, bàn giao và tài liệu biểu mẫu thường quy.'}
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2 mt-2 mt-md-0">
          {(hasPerm('template.edit') || hasPerm('template.delete')) && (
            <Link href="/templates/manage" className="btn btn-outline-primary d-flex align-items-center gap-1 shadow-sm">
              <i className="bi bi-sliders"></i> Quản Lý File Đã Nạp
            </Link>
          )}
          {hasPerm('template.create') && (
            <Link href="/templates/upload" className="btn btn-primary d-flex align-items-center gap-1 shadow-sm">
              <i className="bi bi-cloud-arrow-up"></i> Nạp Biểu Mẫu Mới (.docx / .pdf)
            </Link>
          )}
        </div>
      </div>

      {/* Tabs Switcher between Regular and ISO */}
      <div className="mb-4">
        <ul className="nav nav-pills gap-2 bg-light p-2 rounded border">
          <li className="nav-item">
            <Link
              href="/templates/regular"
              className={`nav-link px-3 py-2 d-flex align-items-center gap-2 ${
                !isIso ? 'active shadow-sm fw-semibold' : 'text-secondary'
              }`}
            >
              <i className="bi bi-collection"></i>
              <span>Template Thường Quy</span>
              {counts.regular > 0 && (
                <span className={`badge rounded-pill ${!isIso ? 'bg-light text-primary' : 'bg-secondary-subtle text-secondary'}`}>
                  {counts.regular}
                </span>
              )}
            </Link>
          </li>
          <li className="nav-item">
            <Link
              href="/templates/iso"
              className={`nav-link px-3 py-2 d-flex align-items-center gap-2 ${
                isIso ? 'active shadow-sm fw-semibold' : 'text-secondary'
              }`}
            >
              <i className="bi bi-patch-check"></i>
              <span>Template ISO</span>
              <span className={`badge rounded-pill ${isIso ? 'bg-light text-primary' : 'bg-warning-subtle text-dark border border-warning-subtle'}`}>
                {counts.iso || ISO_TEMPLATE_CODES.length}
              </span>
            </Link>
          </li>
        </ul>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div className={`alert alert-${feedback.type} alert-dismissible fade show shadow-sm mb-4`} role="alert">
          <i className={`bi ${feedback.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>
          {feedback.text}
          <button type="button" className="btn-close" onClick={() => setFeedback(null)}></button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <form onSubmit={handleSearch} className="row g-3">
            <div className="col-12 col-md-9">
              <div className="input-group">
                <span className="input-group-text bg-white"><i className="bi bi-search text-muted"></i></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder={
                    isIso
                      ? 'Tìm kiếm theo mã FQC (FQC-002-02, FQC-003-02...), tên biểu mẫu...'
                      : 'Tìm kiếm theo tên mẫu, mã biểu mẫu...'
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="col-12 col-md-3 d-flex gap-2">
              <button type="submit" className="btn btn-outline-primary flex-grow-1">
                Lọc dữ liệu
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => { setSearchTerm(''); fetchTemplates(''); }}
              >
                Đặt lại
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Templates Grid / Cards */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <div className="text-muted mt-2">
            Đang tải danh sách biểu mẫu {isIso ? 'ISO' : 'thường quy'}...
          </div>
        </div>
      ) : templates.length === 0 ? (
        <div className="card text-center py-5 shadow-sm">
          <div className="card-body">
            <i className={`bi ${isIso ? 'bi-patch-question' : 'bi-folder-x'} fs-1 text-muted`}></i>
            <h5 className="mt-3 text-dark fw-bold">
              {isIso ? 'Không tìm thấy biểu mẫu ISO nào' : 'Không tìm thấy biểu mẫu thường quy nào'}
            </h5>
            <p className="text-muted">
              {searchTerm
                ? 'Hãy thử tìm kiếm với từ khóa khác hoặc đặt lại bộ lọc.'
                : isIso
                ? 'Hiện chưa có biểu mẫu ISO nào trong danh mục hoặc các mã FQC chưa được kích hoạt.'
                : 'Hãy thử nạp biểu mẫu Word mới vào hệ thống.'}
            </p>
            {hasPerm('template.create') && (
              <Link href="/templates/upload" className="btn btn-primary">
                <i className="bi bi-cloud-arrow-up me-1"></i> Nạp Biểu Mẫu Ngay
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {templates.map(tpl => {
            let fieldsCount = 0;
            try {
              const parsed = typeof tpl.fields_schema === 'string' ? JSON.parse(tpl.fields_schema) : tpl.fields_schema;
              fieldsCount = Array.isArray(parsed) ? parsed.length : 0;
            } catch (e) {}

            return (
              <div key={tpl.id} className="col-12 col-md-6 col-xl-4">
                <div className={`card h-100 shadow-sm border-0 border-top border-4 ${isIso ? 'border-warning' : 'border-primary'}`}>
                  <div className="card-body d-flex flex-column justify-content-between p-4">
                    <div>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        {isIso ? (
                          <span className="badge bg-warning-subtle text-dark border border-warning font-monospace fw-bold d-flex align-items-center gap-1">
                            <i className="bi bi-patch-check-fill text-warning"></i>
                            {tpl.code}
                          </span>
                        ) : (
                          <span className="badge bg-primary-subtle text-primary border border-primary-subtle font-monospace">
                            {tpl.code}
                          </span>
                        )}
                        <div className="d-flex gap-1">
                          <span className="badge bg-secondary-subtle text-dark text-uppercase">
                            {tpl.file_type === 'docx' ? 'Word .docx' : 'PDF'}
                          </span>
                          <span className="badge bg-success-subtle text-success">Hoạt động</span>
                        </div>
                      </div>

                      {editingId === tpl.id ? (
                        <div className="mb-2">
                          <div className="input-group input-group-sm">
                            <input
                              type="text"
                              className="form-control fw-bold"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  saveInlineName(tpl);
                                } else if (e.key === 'Escape') {
                                  cancelInlineEdit();
                                }
                              }}
                              maxLength={200}
                              autoFocus
                              disabled={savingId === tpl.id}
                              aria-label="Chỉnh sửa tên biểu mẫu"
                            />
                            <button
                              type="button"
                              className="btn btn-success"
                              onClick={() => saveInlineName(tpl)}
                              disabled={savingId === tpl.id}
                              title="Lưu tên mới"
                            >
                              {savingId === tpl.id ? (
                                <span className="spinner-border spinner-border-sm"></span>
                              ) : (
                                <i className="bi bi-check-lg"></i>
                              )}
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={cancelInlineEdit}
                              disabled={savingId === tpl.id}
                              title="Hủy"
                            >
                              <i className="bi bi-x-lg"></i>
                            </button>
                          </div>
                          <small className="text-muted">Nhấn Enter để lưu, Esc để hủy</small>
                        </div>
                      ) : (
                        <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
                          <h5
                            className="fw-bold text-dark mb-0"
                            onDoubleClick={() => hasPerm('template.edit') && startInlineEdit(tpl)}
                            title={hasPerm('template.edit') ? 'Nhấp đúp hoặc bấm nút sửa để đổi tên' : undefined}
                            style={hasPerm('template.edit') ? { cursor: 'pointer' } : undefined}
                          >
                            {tpl.name}
                          </h5>
                          {hasPerm('template.edit') && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary py-0 px-2 flex-shrink-0"
                              onClick={() => startInlineEdit(tpl)}
                              title="Chỉnh sửa tên biểu mẫu"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                          )}
                        </div>
                      )}

                      <p className="text-muted small mb-3 text-truncate-2" style={{ minHeight: '38px' }}>
                        {tpl.description || (isIso ? 'Biểu mẫu kiểm tra chất lượng FQC theo tiêu chuẩn ISO.' : 'Không có mô tả thêm.')}
                      </p>

                      <div className="bg-light p-2 rounded small text-muted mb-3">
                        <div className="d-flex justify-content-between py-1 border-bottom">
                          <span>Số trường dữ liệu:</span>
                          <span className="fw-bold text-primary">{fieldsCount} trường</span>
                        </div>
                        <div className="d-flex justify-content-between py-1">
                          <span>Đã điền và in:</span>
                          <Link
                            href={`/records?template_id=${tpl.id}`}
                            className="fw-bold text-primary text-decoration-none hover-underline d-inline-flex align-items-center gap-1"
                            title="Bấm để xem danh sách hồ sơ đã lưu của biểu mẫu này"
                          >
                            <i className="bi bi-database me-1"></i>
                            <span>{tpl.records_count || 0} hồ sơ</span>
                          </Link>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="d-flex gap-2 pt-2 border-top">
                        <Link href={`/fill/${tpl.id}`} className="btn btn-primary flex-grow-1 d-flex align-items-center justify-content-center gap-1 shadow-sm">
                          <i className="bi bi-pencil-square"></i> Điền Form & In
                        </Link>
                        <Link
                          href={`/records?template_id=${tpl.id}`}
                          className="btn btn-outline-info"
                          title="Quản lý và in lại các hồ sơ đã lưu của biểu mẫu này"
                        >
                          <i className="bi bi-clock-history"></i>
                        </Link>
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setSelectedTemplate(tpl)}
                          title="Xem chi tiết các trường dữ liệu"
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                        <a
                          href={tpl.file_path}
                          download={tpl.file_name}
                          className="btn btn-outline-success"
                          title="Tải file Word mẫu gốc"
                        >
                          <i className="bi bi-download"></i>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Field Inspection Modal */}
      {selectedTemplate && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content shadow-lg border-0">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-card-checklist me-2"></i>
                  Cấu Hình Các Trường Động: {selectedTemplate.name}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedTemplate(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="alert alert-info py-2 small d-flex align-items-center gap-2">
                  <i className="bi bi-info-circle-fill fs-5"></i>
                  <div>
                    Các trường này tương ứng với các thẻ <code>{'{ten_truong}'}</code> có trong file mẫu Word gốc. Khi người dùng nhập dữ liệu, hệ thống sẽ tự động thay thế vào đúng vị trí để xuất file PDF/in ấn.
                  </div>
                </div>

                <div className="table-responsive" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                  <table className="table table-bordered table-hover align-middle mb-0">
                    <thead className="table-light sticky-top">
                      <tr>
                        <th>#</th>
                        <th>Tên thẻ trong Word</th>
                        <th>Nhãn hiển thị tiếng Việt</th>
                        <th>Kiểu nhập liệu</th>
                        <th>Bắt buộc</th>
                        <th>Giá trị mặc định</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        let fields = [];
                        try {
                          fields = typeof selectedTemplate.fields_schema === 'string'
                            ? JSON.parse(selectedTemplate.fields_schema)
                            : selectedTemplate.fields_schema;
                        } catch (e) {}

                        if (!fields || fields.length === 0) {
                          return (
                            <tr>
                              <td colSpan="6" className="text-center text-muted py-4">Chưa có thông tin trường</td>
                            </tr>
                          );
                        }

                        return fields.map((f, idx) => (
                          <tr key={idx}>
                            <td className="text-muted small">{idx + 1}</td>
                            <td><code className="text-primary fw-bold">{`{${f.name}}`}</code></td>
                            <td className="fw-semibold">{f.label || f.name}</td>
                            <td>
                              <span className="badge bg-secondary-subtle text-dark">
                                {f.type}
                              </span>
                            </td>
                            <td>
                              {f.required ? (
                                <span className="badge bg-danger">Bắt buộc</span>
                              ) : (
                                <span className="badge bg-light text-muted border">Tùy chọn</span>
                              )}
                            </td>
                            <td className="small text-muted">{f.default_value || 'Trống'}</td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer">
                <a href={selectedTemplate.file_path} download={selectedTemplate.file_name} className="btn btn-outline-secondary me-auto">
                  <i className="bi bi-download me-1"></i> Tải file mẫu gốc ({selectedTemplate.file_name})
                </a>
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedTemplate(null)}>
                  Đóng
                </button>
                <Link href={`/fill/${selectedTemplate.id}`} className="btn btn-primary">
                  <i className="bi bi-pencil-square me-1"></i> Điền Form Này Ngay
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
