'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

const STATUS_META = {
  active: { label: 'Hoạt động', badgeClass: 'bg-success-subtle text-success border border-success-subtle' },
  draft: { label: 'Bản nháp', badgeClass: 'bg-warning-subtle text-warning-emphasis border border-warning-subtle' },
  archived: { label: 'Lưu trữ', badgeClass: 'bg-secondary-subtle text-secondary border border-secondary-subtle' }
};

function parseFieldsSchema(raw) {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function formatFileSize(bytes) {
  const num = Number(bytes) || 0;
  if (num < 1024) return `${num} B`;
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
  return `${(num / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ManageTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // Feedback banner
  const [feedback, setFeedback] = useState(null);

  // Inline rename state
  const [inlineEditId, setInlineEditId] = useState(null);
  const [inlineEditName, setInlineEditName] = useState('');
  const [inlineSavingId, setInlineSavingId] = useState(null);

  // Full Edit Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [editFields, setEditFields] = useState([]);
  const [showFieldsEditor, setShowFieldsEditor] = useState(false);
  const [uploadingReplacement, setUploadingReplacement] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  const hasPerm = (code) => {
    if (!user) return false;
    if (user.role_code === 'ADMIN') return true;
    return Array.isArray(user.permissions) && user.permissions.includes(code);
  };

  const fetchTemplates = async (overrides = {}) => {
    setLoading(true);
    const search = overrides.search !== undefined ? overrides.search : searchTerm;
    const status = overrides.status !== undefined ? overrides.status : statusFilter;
    const categoryId = overrides.categoryId !== undefined ? overrides.categoryId : categoryFilter;

    const params = new URLSearchParams();
    params.set('status', status || 'all');
    if (categoryId) params.set('category_id', categoryId);
    if (search) params.set('search', search);

    try {
      const res = await fetch(`/api/templates?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setTemplates(data.templates || []);
        setCategories(data.categories || []);
      } else {
        setFeedback({ type: 'danger', text: data.message || 'Lỗi tải danh sách biểu mẫu.' });
      }
    } catch (err) {
      setFeedback({ type: 'danger', text: 'Lỗi kết nối máy chủ: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [statusFilter, categoryFilter]);

  const filteredTemplates = useMemo(() => {
    if (typeFilter === 'all') return templates;
    return templates.filter(t => t.file_type === typeFilter);
  }, [templates, typeFilter]);

  const stats = useMemo(() => {
    return templates.reduce(
      (acc, tpl) => {
        acc.total += 1;
        if (tpl.status === 'active') acc.active += 1;
        else acc.inactive += 1;
        acc.records += Number(tpl.records_count || 0);
        return acc;
      },
      { total: 0, active: 0, inactive: 0, records: 0 }
    );
  }, [templates]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTemplates();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('');
    setTypeFilter('all');
    fetchTemplates({ search: '', status: 'all', categoryId: '' });
  };

  // Quick inline rename
  const startInlineRename = (tpl) => {
    setInlineEditId(tpl.id);
    setInlineEditName(tpl.name || '');
    setFeedback(null);
  };

  const cancelInlineRename = () => {
    setInlineEditId(null);
    setInlineEditName('');
  };

  const saveInlineRename = async (tpl) => {
    const trimmed = inlineEditName.trim();
    if (!trimmed) {
      setFeedback({ type: 'danger', text: 'Tên biểu mẫu không được để trống.' });
      return;
    }
    if (trimmed === tpl.name) {
      cancelInlineRename();
      return;
    }

    setInlineSavingId(tpl.id);
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
          prev.map(item => (item.id === tpl.id && data.template ? data.template : item))
        );
        setFeedback({ type: 'success', text: `Đã đổi tên biểu mẫu [${tpl.code}] thành "${trimmed}".` });
        cancelInlineRename();
      } else {
        setFeedback({ type: 'danger', text: data.message || 'Không thể cập nhật tên biểu mẫu.' });
      }
    } catch (err) {
      setFeedback({ type: 'danger', text: 'Lỗi kết nối: ' + err.message });
    } finally {
      setInlineSavingId(null);
    }
  };

  // Quick status change
  const handleQuickStatusChange = async (tpl, newStatus) => {
    if (tpl.status === newStatus) return;
    setFeedback(null);
    try {
      const res = await fetch(`/api/templates/${tpl.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setTemplates(prev =>
          prev.map(item => (item.id === tpl.id && data.template ? data.template : item))
        );
        setFeedback({
          type: 'success',
          text: `Đã chuyển trạng thái biểu mẫu "${tpl.name}" sang "${STATUS_META[newStatus]?.label || newStatus}".`
        });
      } else {
        setFeedback({ type: 'danger', text: data.message || 'Lỗi cập nhật trạng thái.' });
      }
    } catch (err) {
      setFeedback({ type: 'danger', text: 'Lỗi kết nối: ' + err.message });
    }
  };

  // Full Edit Modal
  const openEditModal = (tpl) => {
    setEditForm({
      id: tpl.id,
      name: tpl.name || '',
      code: tpl.code || '',
      description: tpl.description || '',
      category_id: tpl.category_id ? String(tpl.category_id) : '',
      status: tpl.status || 'active',
      file_name: tpl.file_name || '',
      file_path: tpl.file_path || '',
      file_type: tpl.file_type || 'docx',
      file_size: tpl.file_size || 0,
      version: tpl.version || 1,
      records_count: tpl.records_count || 0
    });
    setEditFields(parseFieldsSchema(tpl.fields_schema).map(f => ({ ...f })));
    setShowFieldsEditor(false);
    setEditModalOpen(true);
    setFeedback(null);
  };

  const handleReplaceFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editForm) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['docx', 'pdf'].includes(ext)) {
      alert('Chỉ hỗ trợ file Word (.docx) hoặc file .pdf!');
      return;
    }

    setUploadingReplacement(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/templates/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && data.data) {
        setEditForm(prev => ({
          ...prev,
          file_path: data.data.file_path,
          file_name: data.data.file_name,
          file_type: data.data.file_type,
          file_size: data.data.file_size
        }));

        if (
          Array.isArray(data.data.detected_fields) &&
          data.data.detected_fields.length > 0 &&
          confirm(
            `Hệ thống quét thấy ${data.data.detected_fields.length} trường dữ liệu trong tệp mới. Bạn có muốn cập nhật danh sách trường theo tệp mới không?`
          )
        ) {
          setEditFields(data.data.detected_fields);
          setShowFieldsEditor(true);
        }
      } else {
        alert(data.message || 'Không thể tải tệp thay thế lên máy chủ.');
      }
    } catch (err) {
      alert('Lỗi kết nối khi tải file: ' + err.message);
    } finally {
      setUploadingReplacement(false);
      e.target.value = '';
    }
  };

  const handleAddField = () => {
    setEditFields(prev => [
      ...prev,
      {
        name: `truong_${prev.length + 1}`,
        label: `Trường dữ liệu ${prev.length + 1}`,
        type: 'text',
        required: false,
        default_value: '',
        options: []
      }
    ]);
  };

  const handleFieldChange = (index, key, value) => {
    setEditFields(prev =>
      prev.map((item, idx) => (idx === index ? { ...item, [key]: value } : item))
    );
  };

  const handleRemoveField = (index) => {
    setEditFields(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveEditModal = async (e) => {
    e.preventDefault();
    if (!editForm) return;
    if (!editForm.name.trim() || !editForm.code.trim()) {
      alert('Tên biểu mẫu và Mã biểu mẫu là bắt buộc.');
      return;
    }

    setSavingEdit(true);
    try {
      const payload = {
        name: editForm.name.trim(),
        code: editForm.code.trim().toUpperCase(),
        description: editForm.description,
        category_id: editForm.category_id ? Number(editForm.category_id) : null,
        status: editForm.status,
        file_name: editForm.file_name.trim(),
        file_path: editForm.file_path,
        file_type: editForm.file_type,
        file_size: editForm.file_size,
        fields_schema: editFields
      };

      const res = await fetch(`/api/templates/${editForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setEditModalOpen(false);
        setFeedback({ type: 'success', text: `Đã cập nhật biểu mẫu "${payload.name}" thành công!` });
        fetchTemplates();
      } else {
        alert(data.message || 'Lỗi cập nhật biểu mẫu.');
      }
    } catch (err) {
      alert('Lỗi kết nối: ' + err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteTemplate = async (tpl) => {
    const recordsCount = Number(tpl.records_count || 0);
    const warningMsg =
      recordsCount > 0
        ? `CẢNH BÁO: Biểu mẫu "${tpl.name}" (${tpl.code}) đang có ${recordsCount} hồ sơ đã lưu. Nếu xóa biểu mẫu, toàn bộ ${recordsCount} hồ sơ và lịch sử in liên quan cũng sẽ bị xóa!\n\nBạn có chắc chắn muốn xóa không?`
        : `Bạn có chắc chắn muốn xóa biểu mẫu "${tpl.name}" (${tpl.code}) khỏi Kho Biểu Mẫu?`;

    if (!confirm(warningMsg)) return;

    setFeedback(null);
    try {
      const res = await fetch(`/api/templates/${tpl.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setTemplates(prev => prev.filter(item => item.id !== tpl.id));
        setFeedback({ type: 'success', text: `Đã xóa biểu mẫu "${tpl.name}" thành công.` });
      } else {
        setFeedback({ type: 'danger', text: data.message || 'Không thể xóa biểu mẫu.' });
      }
    } catch (err) {
      setFeedback({ type: 'danger', text: 'Lỗi kết nối: ' + err.message });
    }
  };

  const canEdit = hasPerm('template.edit');
  const canDelete = hasPerm('template.delete');
  const canCreate = hasPerm('template.create');

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center pb-3 mb-4 border-bottom">
        <div>
          <h3 className="fw-bold mb-1 text-primary">
            <i className="bi bi-sliders me-2"></i>Quản Lý File Biểu Mẫu Đã Nạp
          </h3>
          <p className="text-muted mb-0">
            Chỉnh sửa tên hiển thị, mã biểu mẫu, phân loại, trạng thái, thay thế tệp Word/PDF hoặc xóa mẫu trong Kho Biểu Mẫu Template.
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2 mt-2 mt-md-0">
          <Link href="/templates" className="btn btn-outline-secondary d-flex align-items-center gap-1">
            <i className="bi bi-folder2-open"></i> Xem Kho Biểu Mẫu
          </Link>
          {canCreate && (
            <Link href="/templates/upload" className="btn btn-primary d-flex align-items-center gap-1 shadow-sm">
              <i className="bi bi-cloud-arrow-up"></i> Nạp Biểu Mẫu Mới
            </Link>
          )}
        </div>
      </div>

      {feedback && (
        <div className={`alert alert-${feedback.type} alert-dismissible fade show shadow-sm mb-4`} role="alert">
          <i className={`bi ${feedback.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>
          {feedback.text}
          <button type="button" className="btn-close" onClick={() => setFeedback(null)}></button>
        </div>
      )}

      {/* Summary Stats */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card shadow-sm border-0 border-start border-4 border-primary h-100">
            <div className="card-body py-3">
              <div className="text-muted small fw-semibold">Tổng File Biểu Mẫu</div>
              <div className="fs-4 fw-bold text-primary">{stats.total}</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card shadow-sm border-0 border-start border-4 border-success h-100">
            <div className="card-body py-3">
              <div className="text-muted small fw-semibold">Đang Hoạt Động</div>
              <div className="fs-4 fw-bold text-success">{stats.active}</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card shadow-sm border-0 border-start border-4 border-warning h-100">
            <div className="card-body py-3">
              <div className="text-muted small fw-semibold">Bản Nháp / Lưu Trữ</div>
              <div className="fs-4 fw-bold text-warning-emphasis">{stats.inactive}</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card shadow-sm border-0 border-start border-4 border-info h-100">
            <div className="card-body py-3">
              <div className="text-muted small fw-semibold">Hồ Sơ Đã Tạo</div>
              <div className="fs-4 fw-bold text-info-emphasis">{stats.records}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="card shadow-sm mb-4">
        <div className="card-body py-3">
          <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
            <div className="col-12 col-lg-4">
              <div className="input-group">
                <span className="input-group-text bg-white"><i className="bi bi-search text-muted"></i></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tìm tên biểu mẫu, mã, tên file..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="col-6 col-md-4 col-lg-2">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="draft">Bản nháp</option>
                <option value="archived">Lưu trữ</option>
              </select>
            </div>

            <div className="col-6 col-md-4 col-lg-2">
              <select
                className="form-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">Tất cả lĩnh vực</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="col-6 col-md-4 col-lg-2">
              <select
                className="form-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">Mọi định dạng</option>
                <option value="docx">Word (.docx)</option>
                <option value="pdf">PDF (.pdf)</option>
              </select>
            </div>

            <div className="col-6 col-md-12 col-lg-2 d-flex gap-2">
              <button type="submit" className="btn btn-outline-primary flex-grow-1">
                Lọc
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={handleResetFilters}>
                Đặt lại
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Templates Management Table */}
      <div className="card shadow-sm">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
            <i className="bi bi-folder-check text-primary"></i>
            Danh Sách Tệp Trong Kho Biểu Mẫu ({filteredTemplates.length} biểu mẫu)
          </h5>
          {canEdit && (
            <small className="text-muted d-none d-md-inline">
              <i className="bi bi-info-circle me-1"></i>
              Bấm biểu tượng <i className="bi bi-pencil text-primary"></i> ở cột Tên Biểu Mẫu để đổi tên nhanh
            </small>
          )}
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-custom align-middle mb-0">
              <thead>
                <tr>
                  <th style={{ width: '13%' }}>Mã & Phiên Bản</th>
                  <th style={{ width: '28%' }}>Tên Biểu Mẫu (Hiển Thị)</th>
                  <th style={{ width: '20%' }}>Tệp Đã Nạp</th>
                  <th style={{ width: '13%' }}>Lĩnh Vực</th>
                  <th style={{ width: '10%' }}>Trường / Hồ Sơ</th>
                  <th style={{ width: '8%' }}>Trạng Thái</th>
                  <th style={{ width: '8%' }} className="text-end">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="spinner-border text-primary spinner-border-sm me-2"></div>
                      Đang tải danh sách biểu mẫu...
                    </td>
                  </tr>
                ) : filteredTemplates.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      Không có biểu mẫu nào phù hợp với điều kiện lọc.
                    </td>
                  </tr>
                ) : (
                  filteredTemplates.map(tpl => {
                    const fieldsList = parseFieldsSchema(tpl.fields_schema);
                    const statusInfo = STATUS_META[tpl.status] || STATUS_META.active;
                    const isInlineEditing = inlineEditId === tpl.id;

                    return (
                      <tr key={tpl.id}>
                        <td>
                          <span className="badge bg-primary-subtle text-primary border border-primary-subtle font-monospace d-inline-block mb-1">
                            {tpl.code}
                          </span>
                          <div className="small text-muted">Phiên bản v{tpl.version || 1}</div>
                        </td>

                        <td>
                          {isInlineEditing ? (
                            <div>
                              <div className="input-group input-group-sm">
                                <input
                                  type="text"
                                  className="form-control fw-bold"
                                  value={inlineEditName}
                                  onChange={(e) => setInlineEditName(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      saveInlineRename(tpl);
                                    } else if (e.key === 'Escape') {
                                      cancelInlineRename();
                                    }
                                  }}
                                  maxLength={200}
                                  autoFocus
                                  disabled={inlineSavingId === tpl.id}
                                />
                                <button
                                  type="button"
                                  className="btn btn-success"
                                  onClick={() => saveInlineRename(tpl)}
                                  disabled={inlineSavingId === tpl.id}
                                  title="Lưu tên mới"
                                >
                                  {inlineSavingId === tpl.id ? (
                                    <span className="spinner-border spinner-border-sm"></span>
                                  ) : (
                                    <i className="bi bi-check-lg"></i>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-outline-secondary"
                                  onClick={cancelInlineRename}
                                  disabled={inlineSavingId === tpl.id}
                                  title="Hủy"
                                >
                                  <i className="bi bi-x-lg"></i>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="d-flex align-items-start gap-2">
                                <span className="fw-bold text-dark">{tpl.name}</span>
                                {canEdit && (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-link p-0 text-primary"
                                    onClick={() => startInlineRename(tpl)}
                                    title="Đổi tên biểu mẫu nhanh"
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </button>
                                )}
                              </div>
                              <small className="text-muted d-block text-truncate" style={{ maxWidth: '340px' }}>
                                {tpl.description || 'Không có mô tả'}
                              </small>
                            </div>
                          )}
                        </td>

                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <span className={`badge text-uppercase ${tpl.file_type === 'docx' ? 'bg-primary' : 'bg-danger'}`}>
                              {tpl.file_type}
                            </span>
                            <div className="text-truncate" style={{ maxWidth: '180px' }} title={tpl.file_name}>
                              <div className="fw-semibold text-dark small text-truncate">{tpl.file_name}</div>
                              <small className="text-muted">{formatFileSize(tpl.file_size)}</small>
                            </div>
                          </div>
                        </td>

                        <td>
                          {tpl.category_name ? (
                            <span className="badge bg-light text-dark border">{tpl.category_name}</span>
                          ) : (
                            <span className="text-muted small">Chưa phân loại</span>
                          )}
                        </td>

                        <td>
                          <div className="small">
                            <span className="fw-bold text-primary">{fieldsList.length}</span> trường
                          </div>
                          <div className="small">
                            <Link
                              href={`/records?template_id=${tpl.id}`}
                              className="fw-semibold text-primary text-decoration-none hover-underline d-inline-flex align-items-center gap-1"
                              title="Bấm để xem danh sách hồ sơ đã nhập của biểu mẫu này"
                            >
                              <i className="bi bi-database text-info"></i>
                              <span>{tpl.records_count || 0} hồ sơ</span>
                            </Link>
                          </div>
                        </td>

                        <td>
                          {canEdit ? (
                            <select
                              className={`form-select form-select-sm fw-semibold ${statusInfo.badgeClass}`}
                              value={tpl.status}
                              onChange={(e) => handleQuickStatusChange(tpl, e.target.value)}
                              aria-label="Trạng thái biểu mẫu"
                            >
                              <option value="active">Hoạt động</option>
                              <option value="draft">Bản nháp</option>
                              <option value="archived">Lưu trữ</option>
                            </select>
                          ) : (
                            <span className={`badge ${statusInfo.badgeClass}`}>{statusInfo.label}</span>
                          )}
                        </td>

                        <td className="text-end">
                          <div className="btn-group btn-group-sm">
                            {canEdit && (
                              <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={() => openEditModal(tpl)}
                                title="Chỉnh sửa đầy đủ thông tin & cấu hình"
                              >
                                <i className="bi bi-pencil-square"></i>
                              </button>
                            )}
                            <a
                              href={tpl.file_path}
                              download={tpl.file_name}
                              className="btn btn-outline-success"
                              title="Tải file mẫu gốc"
                            >
                              <i className="bi bi-download"></i>
                            </a>
                            <Link
                              href={`/fill/${tpl.id}`}
                              className="btn btn-outline-secondary"
                              title="Điền biểu mẫu này"
                            >
                              <i className="bi bi-file-earmark-text"></i>
                            </Link>
                            <Link
                              href={`/records?template_id=${tpl.id}`}
                              className="btn btn-outline-info"
                              title="Xem danh sách dữ liệu hồ sơ đã nhập & in lại"
                            >
                              <i className="bi bi-database-check"></i>
                            </Link>
                            {canDelete && (
                              <button
                                type="button"
                                className="btn btn-outline-danger"
                                onClick={() => handleDeleteTemplate(tpl)}
                                title="Xóa biểu mẫu"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Full Edit Modal */}
      {editModalOpen && editForm && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content shadow-lg border-0">
              <form onSubmit={handleSaveEditModal}>
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                    <i className="bi bi-pencil-square"></i>
                    Chỉnh Sửa Biểu Mẫu: [{editForm.code}]
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setEditModalOpen(false)}
                  ></button>
                </div>

                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-12 col-md-8">
                      <label className="form-label fw-semibold">
                        Tên Biểu Mẫu (Hiển thị trong Kho Biểu Mẫu Template) <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control fw-bold"
                        value={editForm.name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        maxLength={200}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold">
                        Mã Biểu Mẫu <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control font-monospace text-uppercase fw-bold text-primary"
                        value={editForm.code}
                        onChange={(e) => setEditForm(prev => ({ ...prev, code: e.target.value }))}
                        maxLength={50}
                        required
                      />
                      {editForm.code.startsWith('FQC-') && (
                        <small className="text-warning-emphasis">
                          <i className="bi bi-exclamation-triangle me-1"></i>
                          Mã FQC-* gắn với giao diện nhập liệu chuyên biệt.
                        </small>
                      )}
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold">Nhóm Lĩnh Vực</label>
                      <select
                        className="form-select"
                        value={editForm.category_id}
                        onChange={(e) => setEditForm(prev => ({ ...prev, category_id: e.target.value }))}
                      >
                        <option value="">-- Chưa phân loại --</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold">Trạng Thái</label>
                      <select
                        className="form-select"
                        value={editForm.status}
                        onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                      >
                        <option value="active">Hoạt động (Hiển thị trong Kho Mẫu)</option>
                        <option value="draft">Bản nháp (Ẩn khỏi Kho Mẫu)</option>
                        <option value="archived">Lưu trữ (Ngưng sử dụng)</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold">Tên Tệp Gốc Hiển Thị</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editForm.file_name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, file_name: e.target.value }))}
                        maxLength={255}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Mô Tả Biểu Mẫu</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={editForm.description}
                        onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Mô tả mục đích, đối tượng áp dụng..."
                      ></textarea>
                    </div>

                    {/* Replace file box */}
                    <div className="col-12">
                      <div className="p-3 bg-light border rounded d-flex flex-wrap justify-content-between align-items-center gap-3">
                        <div>
                          <div className="fw-semibold text-dark">
                            <i className="bi bi-file-earmark-word text-primary me-1"></i>
                            Tệp hiện tại: <code>{editForm.file_name}</code> ({editForm.file_type.toUpperCase()} • {formatFileSize(editForm.file_size)})
                          </div>
                          <small className="text-muted">Đường dẫn lưu trữ: {editForm.file_path}</small>
                        </div>
                        <div>
                          <input
                            type="file"
                            id="replaceTemplateFileInput"
                            className="d-none"
                            accept=".docx,.pdf"
                            onChange={handleReplaceFile}
                            disabled={uploadingReplacement}
                          />
                          <label htmlFor="replaceTemplateFileInput" className="btn btn-sm btn-outline-primary">
                            {uploadingReplacement ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-1"></span>
                                Đang tải tệp mới...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-arrow-repeat me-1"></i>
                                Thay Thế Tệp (.docx / .pdf)
                              </>
                            )}
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Dynamic fields toggle */}
                    <div className="col-12">
                      <div className="d-flex justify-content-between align-items-center border-top pt-3">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2"
                          onClick={() => setShowFieldsEditor(prev => !prev)}
                        >
                          <i className={`bi ${showFieldsEditor ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                          <span>Cấu Hình Các Trường Dữ Liệu ({editFields.length} trường)</span>
                        </button>
                        {showFieldsEditor && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={handleAddField}
                          >
                            <i className="bi bi-plus-circle me-1"></i> Thêm trường
                          </button>
                        )}
                      </div>

                      {showFieldsEditor && (
                        <div className="table-responsive mt-3">
                          <table className="table table-bordered table-sm align-middle mb-0">
                            <thead className="table-light">
                              <tr className="small text-muted">
                                <th style={{ width: '20%' }}>Mã Thẻ</th>
                                <th style={{ width: '28%' }}>Nhãn Tiếng Việt</th>
                                <th style={{ width: '18%' }}>Kiểu Nhập</th>
                                <th style={{ width: '10%' }} className="text-center">Bắt Buộc</th>
                                <th style={{ width: '16%' }}>Mặc Định</th>
                                <th style={{ width: '8%' }} className="text-center">Xóa</th>
                              </tr>
                            </thead>
                            <tbody>
                              {editFields.length === 0 ? (
                                <tr>
                                  <td colSpan="6" className="text-center text-muted py-3">
                                    Chưa có trường dữ liệu nào.
                                  </td>
                                </tr>
                              ) : (
                                editFields.map((field, idx) => (
                                  <tr key={idx}>
                                    <td>
                                      <input
                                        type="text"
                                        className="form-control form-control-sm font-monospace text-primary"
                                        value={field.name || ''}
                                        onChange={(e) =>
                                          handleFieldChange(idx, 'name', e.target.value.replace(/[^a-zA-Z0-9_-]/g, '_'))
                                        }
                                        required
                                      />
                                    </td>
                                    <td>
                                      <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        value={field.label || ''}
                                        onChange={(e) => handleFieldChange(idx, 'label', e.target.value)}
                                        required
                                      />
                                    </td>
                                    <td>
                                      <select
                                        className="form-select form-select-sm"
                                        value={field.type || 'text'}
                                        onChange={(e) => handleFieldChange(idx, 'type', e.target.value)}
                                      >
                                        <option value="text">Văn bản (Text)</option>
                                        <option value="number">Số (Number)</option>
                                        <option value="currency">Số tiền (VNĐ)</option>
                                        <option value="date">Ngày tháng (Date)</option>
                                        <option value="textarea">Văn bản dài</option>
                                        <option value="select">Hộp chọn</option>
                                      </select>
                                    </td>
                                    <td className="text-center">
                                      <input
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={Boolean(field.required)}
                                        onChange={(e) => handleFieldChange(idx, 'required', e.target.checked)}
                                      />
                                    </td>
                                    <td>
                                      <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        value={field.default_value || ''}
                                        onChange={(e) => handleFieldChange(idx, 'default_value', e.target.value)}
                                      />
                                    </td>
                                    <td className="text-center">
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger py-0 px-1"
                                        onClick={() => handleRemoveField(idx)}
                                      >
                                        <i className="bi bi-trash"></i>
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setEditModalOpen(false)}
                    disabled={savingEdit}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary fw-bold px-4"
                    disabled={savingEdit || uploadingReplacement}
                  >
                    {savingEdit ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check2-circle me-1"></i>
                        Lưu Thay Đổi
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
