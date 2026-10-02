'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const fetchTemplates = () => {
    setLoading(true);
    let url = `/api/templates?`;
    if (selectedCategory) url += `category_id=${selectedCategory}&`;
    if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTemplates(data.templates);
          setCategories(data.categories || []);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTemplates();
  }, [selectedCategory]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTemplates();
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center pb-3 mb-4 border-bottom">
        <div>
          <h3 className="fw-bold mb-1 text-primary">
            <i className="bi bi-folder2-open me-2"></i>Kho Biểu Mẫu Template
          </h3>
          <p className="text-muted mb-0">
            Quản lý các file Word (.docx) và PDF mẫu có sẵn để điền thông tin và xuất in.
          </p>
        </div>
        <div className="d-flex gap-2 mt-2 mt-md-0">
          <Link href="/templates/upload" className="btn btn-primary d-flex align-items-center gap-1 shadow-sm">
            <i className="bi bi-cloud-arrow-up"></i> Nạp Biểu Mẫu Mới (.docx / .pdf)
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <form onSubmit={handleSearch} className="row g-3">
            <div className="col-12 col-md-5">
              <div className="input-group">
                <span className="input-group-text bg-white"><i className="bi bi-search text-muted"></i></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tìm kiếm theo tên mẫu, mã biểu mẫu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="col-12 col-md-4">
              <select
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">-- Tất cả nhóm lĩnh vực --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-3 d-flex gap-2">
              <button type="submit" className="btn btn-outline-primary flex-grow-1">
                Lọc dữ liệu
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => { setSearchTerm(''); setSelectedCategory(''); }}
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
          <div className="text-muted mt-2">Đang tải danh sách biểu mẫu...</div>
        </div>
      ) : templates.length === 0 ? (
        <div className="card text-center py-5 shadow-sm">
          <div className="card-body">
            <i className="bi bi-folder-x fs-1 text-muted"></i>
            <h5 className="mt-3 text-dark fw-bold">Không tìm thấy biểu mẫu nào</h5>
            <p className="text-muted">Hãy thử tìm kiếm với từ khóa khác hoặc nạp biểu mẫu Word mới vào hệ thống.</p>
            <Link href="/templates/upload" className="btn btn-primary">
              <i className="bi bi-cloud-arrow-up me-1"></i> Nạp Biểu Mẫu Ngay
            </Link>
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
                <div className="card h-100 shadow-sm border-0 border-top border-4 border-primary">
                  <div className="card-body d-flex flex-column justify-content-between p-4">
                    <div>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle font-monospace">
                          {tpl.code}
                        </span>
                        <div className="d-flex gap-1">
                          <span className="badge bg-secondary-subtle text-dark text-uppercase">
                            {tpl.file_type === 'docx' ? 'Word .docx' : 'PDF'}
                          </span>
                          <span className="badge bg-success-subtle text-success">Hoạt động</span>
                        </div>
                      </div>

                      <h5 className="fw-bold text-dark mb-2">{tpl.name}</h5>
                      <p className="text-muted small mb-3 text-truncate-2" style={{ minHeight: '38px' }}>
                        {tpl.description || 'Không có mô tả thêm.'}
                      </p>

                      <div className="bg-light p-2 rounded small text-muted mb-3">
                        <div className="d-flex justify-content-between py-1 border-bottom">
                          <span>Nhóm lĩnh vực:</span>
                          <span className="fw-semibold text-dark">{tpl.category_name || 'Chung'}</span>
                        </div>
                        <div className="d-flex justify-content-between py-1 border-bottom">
                          <span>Số trường dữ liệu:</span>
                          <span className="fw-bold text-primary">{fieldsCount} trường</span>
                        </div>
                        <div className="d-flex justify-content-between py-1">
                          <span>Đã điền và in:</span>
                          <span className="fw-semibold text-dark">{tpl.records_count || 0} hồ sơ</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="d-flex gap-2 pt-2 border-top">
                        <Link href={`/fill/${tpl.id}`} className="btn btn-primary flex-grow-1 d-flex align-items-center justify-content-center gap-1 shadow-sm">
                          <i className="bi bi-pencil-square"></i> Điền Form & In
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

                <div className="table-responsive">
                  <table className="table table-bordered table-hover align-middle">
                    <thead className="table-light">
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
                          return <tr><td colSpan="6" className="text-center text-muted">Chưa có thông tin trường</td></tr>;
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
