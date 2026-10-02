'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function FillFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTemplateId = searchParams.get('template_id');

  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(initialTemplateId || '');
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [formData, setFormData] = useState({});
  const [recordTitle, setRecordTitle] = useState('');

  // Status & UI states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [savedRecord, setSavedRecord] = useState(null);
  const [alertInfo, setAlertInfo] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  // Product picker states
  const [showProductModal, setShowProductModal] = useState(false);
  const [productsList, setProductsList] = useState([]);

  // Hidden print iframe reference
  const printIframeRef = useRef(null);

  const openProductPicker = () => {
    setShowProductModal(true);
    if (productsList.length === 0) {
      fetch('/api/products')
        .then(res => res.json())
        .then(d => {
          if (d.success) setProductsList(d.products || []);
        })
        .catch(console.error);
    }
  };

  const handleSelectProduct = (product) => {
    setFormData(prev => {
      const updated = { ...prev };
      // Smart matching across dynamic fields in any uploaded Word template
      for (const key of Object.keys(updated)) {
        const lower = key.toLowerCase();
        if (['ten_tai_san', 'ten_san_pham', 'ten_hang', 'san_pham'].includes(lower) || 
            (lower.includes('san_pham') && !lower.includes('ma')) || 
            lower.includes('ten_hang')) {
          updated[key] = product.name;
        } else if (['ma_serial', 'ma_san_pham', 'ma_code', 'ma_hang', 'code'].includes(lower) || 
                   lower.includes('ma_sp')) {
          updated[key] = product.code;
        } else if (['don_vi_tinh', 'dvt', 'unit'].includes(lower)) {
          updated[key] = product.unit;
        } else if (['so_tien', 'don_gia', 'gia_tien', 'price', 'gia'].includes(lower)) {
          updated[key] = Number(product.price).toLocaleString('vi-VN');
        } else if (['noi_dung_thanh_toan', 'mo_ta'].includes(lower)) {
          if (!updated[key]) {
            updated[key] = `Sản phẩm: ${product.name} (${product.code})`;
          }
        }
      }
      return updated;
    });
    setShowProductModal(false);
    setAlertInfo({
      type: 'info',
      message: `Đã nạp nhanh thông tin sản phẩm [${product.code}] ${product.name} vào form!`
    });
  };

  // 1. Fetch available templates
  useEffect(() => {
    fetch('/api/templates')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTemplates(data.templates);
          if (!selectedTemplateId && data.templates.length > 0) {
            setSelectedTemplateId(data.templates[0].id.toString());
          }
        }
      })
      .catch(console.error);
  }, []);

  // 2. Fetch selected template detail and initialize dynamic form
  useEffect(() => {
    if (!selectedTemplateId) return;

    setLoading(true);
    setSavedRecord(null);
    setAlertInfo(null);

    fetch(`/api/templates/${selectedTemplateId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.template) {
          const tpl = data.template;
          setCurrentTemplate(tpl);

          // Initialize form values from schema default_values
          const initialValues = {};
          if (Array.isArray(tpl.fields_schema)) {
            tpl.fields_schema.forEach(field => {
              initialValues[field.name] = field.default_value || '';
            });
          }
          setFormData(initialValues);

          // Auto-generate title
          const today = new Date().toLocaleDateString('vi-VN');
          setRecordTitle(`${tpl.name} - Ngày ${today}`);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedTemplateId]);

  // Handle dynamic input change
  const handleInputChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  // Save form data to MySQL database
  const saveFormRecord = async () => {
    if (!selectedTemplateId) {
      setAlertInfo({ type: 'danger', message: 'Vui lòng chọn một biểu mẫu template.' });
      return null;
    }

    setSaving(true);
    setAlertInfo(null);

    try {
      let res, data;
      // If updating an already saved record
      if (savedRecord && savedRecord.id) {
        res = await fetch(`/api/records/${savedRecord.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: recordTitle,
            form_data: formData,
            status: 'completed'
          })
        });
        data = await res.json();
        if (data.success) {
          setAlertInfo({
            type: 'success',
            message: `✔ Đã cập nhật thành công dữ liệu hồ sơ [${savedRecord.code}] vào cơ sở dữ liệu MySQL!`
          });
          return savedRecord.id;
        }
      } else {
        // Create new record
        res = await fetch('/api/records', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            template_id: parseInt(selectedTemplateId, 10),
            title: recordTitle,
            form_data: formData,
            status: 'completed'
          })
        });
        data = await res.json();
        if (data.success) {
          setSavedRecord({ id: data.id, code: data.code });
          setAlertInfo({
            type: 'success',
            message: `✔ Đã lưu hồ sơ mới thành công vào cơ sở dữ liệu! Mã hồ sơ: ${data.code}`
          });
          return data.id;
        }
      }

      setAlertInfo({ type: 'danger', message: data.message || 'Lỗi khi lưu dữ liệu vào CSDL' });
      return null;
    } catch (err) {
      setAlertInfo({ type: 'danger', message: 'Lỗi kết nối máy chủ: ' + err.message });
      return null;
    } finally {
      setSaving(false);
    }
  };

  // Save to DB and trigger local printer immediately
  const handleSaveAndPrint = async () => {
    setPrinting(true);
    const recordId = await saveFormRecord();

    if (!recordId) {
      setPrinting(false);
      return;
    }

    try {
      const printUrl = `/api/records/${recordId}/print`;
      setPreviewUrl(printUrl);

      // Trigger local browser printer dialog directly
      if (printIframeRef.current) {
        printIframeRef.current.src = printUrl;
        printIframeRef.current.onload = () => {
          setTimeout(() => {
            try {
              printIframeRef.current.contentWindow.focus();
              printIframeRef.current.contentWindow.print();
            } catch (printErr) {
              console.warn('Silent print blocked by browser sandbox, opening print preview modal:', printErr);
              setShowPreviewModal(true);
            }
            setPrinting(false);
          }, 600);
        };
      } else {
        // Fallback: open print preview modal
        setShowPreviewModal(true);
        setPrinting(false);
      }
    } catch (err) {
      console.error(err);
      setShowPreviewModal(true);
      setPrinting(false);
    }
  };

  // Open Preview Modal
  const handlePreview = async () => {
    const recordId = await saveFormRecord();
    if (recordId) {
      setPreviewUrl(`/api/records/${recordId}/print`);
      setShowPreviewModal(true);
    }
  };

  return (
    <div>
      {/* Hidden print iframe for direct local printing */}
      <iframe
        ref={printIframeRef}
        style={{ display: 'none', position: 'absolute', width: '0px', height: '0px', border: 'none' }}
        title="Local Print Bridge"
      />

      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center pb-3 mb-4 border-bottom">
        <div>
          <h3 className="fw-bold mb-1 text-primary">
            <i className="bi bi-pencil-square me-2"></i>Nhập Liệu, Lưu CSDL & In Máy Local
          </h3>
          <p className="text-muted mb-0">
            Chọn biểu mẫu có sẵn, điền thông tin, hệ thống tự động lưu vào MySQL và nạp dữ liệu vào file mẫu để in trực tiếp ra máy in local.
          </p>
        </div>
        <div className="d-flex gap-2 mt-2 mt-md-0">
          <Link href="/records" className="btn btn-outline-secondary">
            <i className="bi bi-clock-history me-1"></i> Danh sách form đã lưu
          </Link>
          <Link href="/templates/upload" className="btn btn-outline-primary">
            <i className="bi bi-cloud-arrow-up me-1"></i> Nạp thêm mẫu Word mới
          </Link>
        </div>
      </div>

      {alertInfo && (
        <div className={`alert alert-${alertInfo.type} alert-dismissible fade show shadow-sm`} role="alert">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <i className={`bi ${alertInfo.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} fs-5`}></i>
              <div>{alertInfo.message}</div>
            </div>
            {savedRecord && (
              <div className="d-flex gap-2">
                <a
                  href={`/api/records/${savedRecord.id}/export?format=docx`}
                  className="btn btn-sm btn-outline-success bg-white"
                >
                  <i className="bi bi-file-earmark-word me-1"></i> Tải Word đã điền
                </a>
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={handleSaveAndPrint}
                >
                  <i className="bi bi-printer me-1"></i> In ngay
                </button>
              </div>
            )}
          </div>
          <button type="button" className="btn-close" onClick={() => setAlertInfo(null)}></button>
        </div>
      )}

      {/* Template Selector Bar */}
      <div className="card shadow-sm mb-4 border-primary border-opacity-25 bg-primary bg-opacity-10">
        <div className="card-body p-3">
          <div className="row align-items-center g-3">
            <div className="col-12 col-md-4">
              <label className="form-label fw-bold text-dark mb-1">
                <i className="bi bi-file-earmark-text-fill text-primary me-1"></i> Chọn Biểu Mẫu Cần Điền:
              </label>
              <select
                className="form-select form-select-lg fw-semibold"
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
              >
                {templates.map(t => (
                  <option key={t.id} value={t.id}>
                    [{t.code}] {t.name} ({t.file_type.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {currentTemplate && (
              <div className="col-12 col-md-8">
                <div className="bg-white p-2 rounded border">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-bold text-primary">{currentTemplate.name}</span>
                    <span className="badge bg-secondary">{currentTemplate.file_name}</span>
                  </div>
                  <small className="text-muted d-block">
                    {currentTemplate.description || 'Biểu mẫu chuẩn ISO cho văn phòng và vận hành'}
                  </small>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <div className="text-muted mt-2">Đang tải cấu trúc trường biểu mẫu...</div>
        </div>
      ) : !currentTemplate ? (
        <div className="alert alert-warning">Chưa có biểu mẫu nào được chọn.</div>
      ) : (
        <div className="row g-4">
          {/* Main Dynamic Form Inputs */}
          <div className="col-12 col-lg-8">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                  <i className="bi bi-ui-checks-grid text-primary"></i>
                  Nội Dung Nhập Liệu Biểu Mẫu
                </h5>
                <div className="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 shadow-sm"
                    onClick={openProductPicker}
                    title="Chọn sản phẩm từ danh mục để nạp nhanh vào biểu mẫu"
                  >
                    <i className="bi bi-box-seam"></i>
                    <span>Nạp Từ Kho Sản Phẩm</span>
                  </button>
                  <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                    {Array.isArray(currentTemplate.fields_schema) ? currentTemplate.fields_schema.length : 0} Trường Dữ Liệu
                  </span>
                </div>
              </div>

              <div className="card-body p-4">
                {/* Title of this Record */}
                <div className="mb-4 pb-3 border-bottom">
                  <label className="form-label fw-bold text-dark">
                    Tên / Tiêu đề hồ sơ lưu trữ <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg fw-semibold"
                    placeholder="Nhập tên định danh cho hồ sơ này..."
                    value={recordTitle}
                    onChange={(e) => setRecordTitle(e.target.value)}
                    required
                  />
                  <small className="text-muted">Tiêu đề này giúp bạn dễ dàng tìm kiếm lại trong danh sách hồ sơ đã lưu.</small>
                </div>

                {/* Render Dynamic Form Fields */}
                <div className="row g-3">
                  {Array.isArray(currentTemplate.fields_schema) && currentTemplate.fields_schema.length > 0 ? (
                    currentTemplate.fields_schema.map((field, idx) => {
                      const value = formData[field.name] !== undefined ? formData[field.name] : '';
                      const isFullWidth = field.type === 'textarea' || (field.label && field.label.length > 25);

                      return (
                        <div key={idx} className={isFullWidth ? 'col-12' : 'col-12 col-md-6'}>
                          <label className="form-label fw-semibold text-dark d-flex justify-content-between align-items-center mb-1">
                            <span>
                              {field.label || field.name}
                              {field.required && <span className="text-danger ms-1">*</span>}
                            </span>
                            <code className="text-muted small" style={{ fontSize: '0.75rem' }}>
                              {`{${field.name}}`}
                            </code>
                          </label>

                          {/* Render appropriate input element based on field type */}
                          {field.type === 'textarea' ? (
                            <textarea
                              className="form-control"
                              rows="3"
                              value={value}
                              onChange={(e) => handleInputChange(field.name, e.target.value)}
                              placeholder={`Nhập ${field.label || field.name}...`}
                              required={field.required}
                            ></textarea>
                          ) : field.type === 'select' ? (
                            <select
                              className="form-select"
                              value={value}
                              onChange={(e) => handleInputChange(field.name, e.target.value)}
                              required={field.required}
                            >
                              <option value="">-- Chọn {field.label} --</option>
                              {Array.isArray(field.options) && field.options.map((opt, oIdx) => (
                                <option key={oIdx} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : field.type === 'date' ? (
                            <input
                              type="date"
                              className="form-control"
                              value={value}
                              onChange={(e) => handleInputChange(field.name, e.target.value)}
                              required={field.required}
                            />
                          ) : field.type === 'number' ? (
                            <input
                              type="number"
                              className="form-control"
                              value={value}
                              onChange={(e) => handleInputChange(field.name, e.target.value)}
                              placeholder={`Nhập số...`}
                              required={field.required}
                            />
                          ) : (
                            <input
                              type="text"
                              className="form-control"
                              value={value}
                              onChange={(e) => handleInputChange(field.name, e.target.value)}
                              placeholder={`Nhập ${field.label || field.name}...`}
                              required={field.required}
                            />
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-12 text-center py-4 text-muted">
                      Biểu mẫu này chưa có trường dữ liệu động nào được định nghĩa.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Action Control Panel */}
          <div className="col-12 col-lg-4">
            <div className="card shadow-sm border-0 sticky-top" style={{ top: '80px' }}>
              <div className="card-header bg-white py-3 fw-bold text-dark d-flex align-items-center gap-2">
                <i className="bi bi-printer-fill text-warning fs-5"></i>
                <span>Thao Tác & Kết Nối Máy In Local</span>
              </div>
              <div className="card-body p-4">
                <div className="d-grid gap-3">
                  {/* Primary Action: Save to DB & Print to Local Printer */}
                  <button
                    type="button"
                    className="btn btn-warning btn-lg text-dark fw-bold d-flex align-items-center justify-content-center gap-2 shadow"
                    onClick={handleSaveAndPrint}
                    disabled={printing || saving}
                  >
                    {printing ? (
                      <>
                        <span className="spinner-border spinner-border-sm"></span>
                        Đang nạp file & gửi lệnh in...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-printer-fill fs-4"></i>
                        <span>LƯU & IN RA MÁY IN LOCAL</span>
                      </>
                    )}
                  </button>

                  {/* Secondary Action: Save to DB only */}
                  <button
                    type="button"
                    className="btn btn-success d-flex align-items-center justify-content-center gap-2 py-2 fw-semibold"
                    onClick={saveFormRecord}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm"></span>
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-floppy2-fill"></i>
                        <span>Lưu Dữ Liệu Vào Cơ Sở Dữ Liệu</span>
                      </>
                    )}
                  </button>

                  {/* Preview Action */}
                  <button
                    type="button"
                    className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2 py-2"
                    onClick={handlePreview}
                  >
                    <i className="bi bi-eye"></i>
                    <span>Xem Trước Bản In (PDF Preview)</span>
                  </button>

                  {savedRecord && (
                    <a
                      href={`/api/records/${savedRecord.id}/export?format=docx`}
                      className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2 py-2"
                    >
                      <i className="bi bi-file-earmark-word"></i>
                      <span>Tải Xuống File Word (.docx) Đã Điền</span>
                    </a>
                  )}
                </div>

                <div className="mt-4 pt-3 border-top">
                  <h6 className="fw-bold text-dark small text-uppercase">Cơ Chế In Ấn Local:</h6>
                  <ul className="small text-muted ps-3 mb-0">
                    <li className="mb-1">Hệ thống lấy dữ liệu mới nhập nạp vào file mẫu Word gốc.</li>
                    <li className="mb-1">Kết xuất file PDF chuẩn khổ A4 bằng Chrome/Edge engine.</li>
                    <li className="mb-1">Mở hộp thoại máy in Windows trực tiếp trên máy của bạn (Canon, HP, Brother, Epson...).</li>
                    <li>Tự động ghi nhận nhật ký vào bảng <code>print_logs</code> trong CSDL MySQL.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF / Print Preview Modal */}
      {showPreviewModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-xl modal-dialog-centered" style={{ height: '90vh' }}>
            <div className="modal-content h-100 shadow-lg border-0">
              <div className="modal-header bg-dark text-white py-2">
                <h6 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <i className="bi bi-file-earmark-pdf-fill text-danger"></i>
                  Xem Trước Bản In - Khổ Giấy A4
                </h6>
                <div className="d-flex gap-2 ms-auto me-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-warning text-dark fw-bold d-flex align-items-center gap-1"
                    onClick={() => {
                      const iframe = document.getElementById('previewIframe');
                      if (iframe) {
                        iframe.contentWindow.focus();
                        iframe.contentWindow.print();
                      }
                    }}
                  >
                    <i className="bi bi-printer-fill"></i> In Ra Máy In Local Ngay
                  </button>
                  {savedRecord && (
                    <a
                      href={`/api/records/${savedRecord.id}/export?format=docx`}
                      className="btn btn-sm btn-outline-light d-flex align-items-center gap-1"
                    >
                      <i className="bi bi-download"></i> Tải Word
                    </a>
                  )}
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowPreviewModal(false)}
                ></button>
              </div>
              <div className="modal-body p-0 bg-secondary bg-opacity-10 h-100">
                <iframe
                  id="previewIframe"
                  src={previewUrl}
                  className="w-100 h-100 border-0"
                  title="Xem Trước Biểu Mẫu PDF"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Picker Modal */}
      {showProductModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content shadow-lg border-0">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <i className="bi bi-box-seam-fill"></i>
                  Kho Hàng Hóa: Chọn Sản Phẩm Nạp Nhanh Vào Biểu Mẫu
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowProductModal(false)}></button>
              </div>
              <div className="modal-body p-3">
                <div className="alert alert-info py-2 small mb-3">
                  <i className="bi bi-info-circle-fill me-1"></i>
                  Bấm nút <strong>&quot;Nạp Vào Form&quot;</strong> để hệ thống tự động điền Tên sản phẩm, Mã sản phẩm hoặc Giá tương ứng vào biểu mẫu đang mở.
                </div>
                <div className="table-responsive">
                  <table className="table table-hover table-sm align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Mã Code</th>
                        <th>Tên Sản Phẩm</th>
                        <th>ĐVT</th>
                        <th>Đơn Giá</th>
                        <th className="text-end">Hành Động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productsList.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center py-4 text-muted">
                            Đang tải kho sản phẩm hoặc chưa có sản phẩm nào...
                          </td>
                        </tr>
                      ) : (
                        productsList.map(p => (
                          <tr key={p.id}>
                            <td>
                              <span className="badge bg-primary-subtle text-primary font-monospace">{p.code}</span>
                            </td>
                            <td>
                              <div className="fw-bold">{p.name}</div>
                              <small className="text-muted">{p.category_name || ''}</small>
                            </td>
                            <td><span className="badge bg-light text-dark border">{p.unit}</span></td>
                            <td className="fw-semibold text-danger">
                              {Number(p.price || 0).toLocaleString('vi-VN')} đ
                            </td>
                            <td className="text-end">
                              <button
                                type="button"
                                className="btn btn-sm btn-success fw-bold d-flex align-items-center gap-1 ms-auto"
                                onClick={() => handleSelectProduct(p)}
                              >
                                <i className="bi bi-box-arrow-in-down-left"></i> Nạp Form
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowProductModal(false)}>Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FillFormPage() {
  return (
    <Suspense fallback={
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <div className="text-muted mt-2">Đang tải biểu mẫu...</div>
      </div>
    }>
      <FillFormContent />
    </Suspense>
  );
}
