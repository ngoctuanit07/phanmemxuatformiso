'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UploadTemplatePage() {
  const router = useRouter();

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);

  // File upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFileInfo, setUploadedFileInfo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fields, setFields] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/templates')
      .then(res => res.json())
      .then(data => {
        if (data.categories) setCategories(data.categories);
      })
      .catch(() => {});
  }, []);

  // Handle file select and auto-upload for tag extraction
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['docx', 'pdf'].includes(ext)) {
      setError('Chỉ hỗ trợ file Word (.docx) hoặc file .pdf!');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setMessage(null);
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/templates/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.success) {
        setUploadedFileInfo(data.data);
        setMessage(data.message);

        // Pre-fill template name if empty
        if (!name) {
          const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          setName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
        }

        // Pre-fill template code if empty
        if (!code) {
          const rand = Math.floor(100 + Math.random() * 900);
          setCode(`TPL-FORM-${rand}`);
        }

        // Set extracted fields
        if (data.data.detected_fields && data.data.detected_fields.length > 0) {
          setFields(data.data.detected_fields);
        } else {
          setFields([]);
        }
      } else {
        setError(data.message || 'Lỗi khi tải file lên');
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  // Add a manual field (useful for PDF templates or additional fields)
  const handleAddField = () => {
    const newField = {
      name: `truong_${fields.length + 1}`,
      label: `Trường dữ liệu ${fields.length + 1}`,
      type: 'text',
      required: true,
      default_value: '',
      options: []
    };
    setFields([...fields, newField]);
  };

  // Remove a field
  const handleRemoveField = (index) => {
    const updated = [...fields];
    updated.splice(index, 1);
    setFields(updated);
  };

  // Update field property
  const handleFieldChange = (index, key, value) => {
    const updated = [...fields];
    updated[index][key] = value;
    setFields(updated);
  };

  // Save template to database
  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    if (!uploadedFileInfo) {
      setError('Vui lòng chọn và nạp file mẫu Word (.docx) hoặc PDF trước.');
      return;
    }
    if (!name.trim()) {
      setError('Vui lòng nhập tên biểu mẫu.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        name,
        code: code.trim().toUpperCase(),
        description,
        category_id: categoryId || null,
        file_path: uploadedFileInfo.file_path,
        file_name: uploadedFileInfo.file_name,
        file_type: uploadedFileInfo.file_type,
        file_size: uploadedFileInfo.file_size,
        fields_schema: fields
      };

      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        alert('Đã lưu biểu mẫu mới thành công! Hệ thống chuyển bạn đến trang nhập liệu để điền và in thử.');
        router.push(`/fill/${data.id}`);
      } else {
        setError(data.message || 'Lỗi khi lưu biểu mẫu vào cơ sở dữ liệu');
      }
    } catch (err) {
      setError('Lỗi kết nối: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center pb-3 mb-4 border-bottom">
        <div>
          <h3 className="fw-bold mb-1 text-primary">
            <i className="bi bi-cloud-arrow-up me-2"></i>Nạp Biểu Mẫu Mới (.docx / .pdf)
          </h3>
          <p className="text-muted mb-0">
            Tải lên file mẫu Word có sẵn (chứa các thẻ <code>{'{ten_truong}'}</code>) hoặc file PDF. Hệ thống sẽ tự động quét các trường cần điền.
          </p>
        </div>
        <Link href="/templates" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-1"></i> Quay lại kho mẫu
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {message && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i>
          {message}
          <button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
        </div>
      )}

      <form onSubmit={handleSaveTemplate}>
        <div className="row g-4">
          {/* Left Column: File upload & template basic information */}
          <div className="col-12 col-lg-5">
            {/* Step 1: Upload File */}
            <div className="card shadow-sm mb-4 border-primary border-opacity-25">
              <div className="card-header bg-white py-3 fw-bold text-primary d-flex align-items-center gap-2">
                <span className="badge bg-primary rounded-circle">1</span>
                <span>Chọn File Mẫu Word hoặc PDF</span>
              </div>
              <div className="card-body">
                <div className="border border-2 border-dashed rounded p-4 text-center bg-light">
                  <i className="bi bi-file-earmark-word text-primary fs-1 mb-2 d-block"></i>
                  <h6 className="fw-bold text-dark">Kéo thả hoặc chọn file từ máy tính</h6>
                  <p className="text-muted small mb-3">
                    Định dạng: <strong>.docx</strong> (khuyến nghị cho mẫu có thẻ) hoặc <strong>.pdf</strong>
                  </p>

                  <input
                    type="file"
                    id="templateFileInput"
                    className="d-none"
                    accept=".docx,.pdf"
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                  <label htmlFor="templateFileInput" className="btn btn-primary px-4 shadow-sm">
                    {uploading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Đang quét các trường trong file...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-upload me-1"></i> Chọn File Mẫu
                      </>
                    )}
                  </label>
                </div>

                {uploadedFileInfo && (
                  <div className="mt-3 p-3 bg-white border rounded">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-file-earmark-check text-success fs-3"></i>
                        <div>
                          <div className="fw-bold text-dark">{uploadedFileInfo.file_name}</div>
                          <small className="text-muted">
                            Kích thước: {(uploadedFileInfo.file_size / 1024).toFixed(1)} KB • Định dạng: {uploadedFileInfo.file_type.toUpperCase()}
                          </small>
                        </div>
                      </div>
                      <span className="badge bg-success">Đã nạp sẵn sàng</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Template Information */}
            <div className="card shadow-sm">
              <div className="card-header bg-white py-3 fw-bold text-primary d-flex align-items-center gap-2">
                <span className="badge bg-primary rounded-circle">2</span>
                <span>Thông Tin Định Danh Biểu Mẫu</span>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Tên biểu mẫu <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ví dụ: Đơn xin nghỉ phép năm"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Mã biểu mẫu <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control text-uppercase font-monospace"
                    placeholder="Ví dụ: TPL-NGHI-PHEP"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                  />
                  <small className="text-muted">Mã duy nhất để định danh mẫu trong cơ sở dữ liệu.</small>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Nhóm lĩnh vực</label>
                  <select
                    className="form-select"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    <option value="">-- Chọn nhóm lĩnh vực --</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Mô tả mục đích sử dụng</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Mô tả đối tượng áp dụng, quy trình ký duyệt..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Fields Configurator */}
          <div className="col-12 col-lg-7">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <div className="fw-bold text-primary d-flex align-items-center gap-2">
                  <span className="badge bg-primary rounded-circle">3</span>
                  <span>Cấu Hình Các Trường Dữ Liệu Tự Động ({fields.length} trường)</span>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                  onClick={handleAddField}
                >
                  <i className="bi bi-plus-circle"></i> Thêm trường
                </button>
              </div>

              <div className="card-body p-3">
                {fields.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <i className="bi bi-code-slash fs-1 text-secondary mb-2 d-block"></i>
                    <p className="mb-1 fw-bold text-dark">Chưa có trường dữ liệu nào</p>
                    <small>
                      Hãy tải lên file Word chứa các thẻ như <code>{'{ho_ten}'}</code>, <code>{'{ngay_sinh}'}</code>, hoặc bấm &quot;Thêm trường&quot; ở trên.
                    </small>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-bordered table-sm align-middle">
                      <thead className="table-light">
                        <tr className="small text-muted">
                          <th style={{ width: '22%' }}>Mã Thẻ (Word)</th>
                          <th style={{ width: '28%' }}>Nhãn Tiếng Việt</th>
                          <th style={{ width: '22%' }}>Kiểu Nhập</th>
                          <th style={{ width: '20%' }}>Mặc Định</th>
                          <th style={{ width: '8%' }} className="text-center">Xóa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fields.map((field, idx) => (
                          <tr key={idx}>
                            <td>
                              <input
                                type="text"
                                className="form-control form-control-sm font-monospace text-primary fw-semibold"
                                value={field.name}
                                onChange={(e) => handleFieldChange(idx, 'name', e.target.value.replace(/[^a-zA-Z0-9_\-]/g, '_'))}
                                placeholder="ten_truong"
                                required
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={field.label}
                                onChange={(e) => handleFieldChange(idx, 'label', e.target.value)}
                                placeholder="Họ và tên..."
                                required
                              />
                            </td>
                            <td>
                              <select
                                className="form-select form-select-sm"
                                value={field.type}
                                onChange={(e) => handleFieldChange(idx, 'type', e.target.value)}
                              >
                                <option value="text">Văn bản (Text)</option>
                                <option value="number">Số (Number)</option>
                                <option value="currency">Số tiền (VNĐ)</option>
                                <option value="date">Ngày tháng (Date)</option>
                                <option value="textarea">Văn bản dài (Textarea)</option>
                                <option value="select">Hộp chọn (Select)</option>
                              </select>
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={field.default_value || ''}
                                onChange={(e) => handleFieldChange(idx, 'default_value', e.target.value)}
                                placeholder="Giá trị mẫu..."
                              />
                            </td>
                            <td className="text-center">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger p-1"
                                onClick={() => handleRemoveField(idx)}
                                title="Xóa trường này"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="alert alert-light border small text-muted mt-3 mb-0">
                  <i className="bi bi-lightbulb-fill text-warning me-1"></i>
                  <strong>Mẹo:</strong> Trong file Word của bạn, hãy viết các placeholder ở dạng <code>{'{ho_ten}'}</code>, <code>{'{dia_chi}'}</code>, <code>{'{so_tien}'}</code>. Khi nạp file vào đây, hệ thống sẽ tự động bắt lấy và tạo form tương ứng mà bạn không cần phải tự thiết kế lại giao diện!
                </div>
              </div>

              <div className="card-footer bg-white p-3 d-flex justify-content-end gap-2 border-top">
                <Link href="/templates" className="btn btn-outline-secondary">
                  Hủy bỏ
                </Link>
                <button
                  type="submit"
                  className="btn btn-success px-4 fw-bold shadow-sm d-flex align-items-center gap-2"
                  disabled={saving || !uploadedFileInfo}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm"></span>
                      Đang lưu vào CSDL...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check2-circle fs-5"></i>
                      Lưu Mẫu Vào CSDL & Bắt Đầu Điền Form
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
