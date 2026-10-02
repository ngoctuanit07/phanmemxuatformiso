'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function RecordsPage() {
  const [records, setRecords] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Print modal states
  const [activePrintRecord, setActivePrintRecord] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const printIframeRef = useRef(null);

  const fetchRecords = () => {
    setLoading(true);
    let url = `/api/records?`;
    if (selectedTemplate) url += `template_id=${selectedTemplate}&`;
    if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRecords(data.records || []);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    // Fetch templates list for filter dropdown
    fetch('/api/templates')
      .then(res => res.json())
      .then(data => {
        if (data.success) setTemplates(data.templates || []);
      })
      .catch(console.error);

    fetchRecords();
  }, [selectedTemplate]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRecords();
  };

  // Direct print trigger for a record
  const handlePrintRecord = (record) => {
    setActivePrintRecord(record);
    const printUrl = `/api/records/${record.id}/print`;

    if (printIframeRef.current) {
      printIframeRef.current.src = printUrl;
      printIframeRef.current.onload = () => {
        setTimeout(() => {
          try {
            printIframeRef.current.contentWindow.focus();
            printIframeRef.current.contentWindow.print();
          } catch (e) {
            setShowPrintModal(true);
          }
        }, 500);
      };
    } else {
      setShowPrintModal(true);
    }
  };

  // Delete record
  const handleDeleteRecord = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bản ghi này khỏi cơ sở dữ liệu?')) return;
    try {
      const res = await fetch(`/api/records/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setRecords(records.filter(r => r.id !== id));
      } else {
        alert(data.message || 'Lỗi khi xóa bản ghi');
      }
    } catch (err) {
      alert('Lỗi kết nối: ' + err.message);
    }
  };

  return (
    <div>
      {/* Hidden print iframe */}
      <iframe
        ref={printIframeRef}
        style={{ display: 'none', position: 'absolute', width: '0px', height: '0px' }}
        title="Direct Print Iframe"
      />

      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center pb-3 mb-4 border-bottom">
        <div>
          <h3 className="fw-bold mb-1 text-primary">
            <i className="bi bi-clock-history me-2"></i>Hồ Sơ & Form Đã Lưu Trữ
          </h3>
          <p className="text-muted mb-0">
            Toàn bộ dữ liệu biểu mẫu đã nhập và lưu vào cơ sở dữ liệu MySQL. Bạn có thể in lại ra máy in bất kỳ lúc nào.
          </p>
        </div>
        <Link href="/fill" className="btn btn-primary d-flex align-items-center gap-1 shadow-sm">
          <i className="bi bi-pencil-square"></i> Nhập Form Mới
        </Link>
      </div>

      {/* Filter and Search */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <form onSubmit={handleSearch} className="row g-3">
            <div className="col-12 col-md-5">
              <div className="input-group">
                <span className="input-group-text bg-white"><i className="bi bi-search text-muted"></i></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tìm theo tiêu đề, mã hồ sơ hoặc nội dung đã nhập..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="col-12 col-md-4">
              <select
                className="form-select"
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
              >
                <option value="">-- Tất cả biểu mẫu --</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-3 d-flex gap-2">
              <button type="submit" className="btn btn-outline-primary flex-grow-1">
                Tìm kiếm
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => { setSearchTerm(''); setSelectedTemplate(''); }}
              >
                Đặt lại
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Records Table */}
      <div className="card shadow-sm">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
            <i className="bi bi-table text-primary"></i>
            Danh Sách Bản Ghi Trong CSDL ({records.length} hồ sơ)
          </h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-custom align-middle mb-0">
              <thead>
                <tr>
                  <th style={{ width: '13%' }}>Mã Hồ Sơ</th>
                  <th style={{ width: '27%' }}>Tiêu Đề & Biểu Mẫu</th>
                  <th style={{ width: '15%' }}>Người Tạo</th>
                  <th style={{ width: '15%' }}>Ngày Lưu</th>
                  <th style={{ width: '10%' }}>Lần In</th>
                  <th style={{ width: '20%' }} className="text-end">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div className="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
                      Đang tải danh sách hồ sơ...
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      <i className="bi bi-inbox fs-2 text-secondary d-block mb-2"></i>
                      Chưa có hồ sơ nào được lưu vào cơ sở dữ liệu.
                      <div className="mt-2">
                        <Link href="/fill" className="btn btn-sm btn-primary">
                          <i className="bi bi-pencil-square me-1"></i> Nhập và lưu hồ sơ đầu tiên
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  records.map(rec => (
                    <tr key={rec.id}>
                      <td>
                        <span className="badge bg-dark-subtle text-dark font-monospace fw-bold">
                          {rec.code}
                        </span>
                      </td>
                      <td>
                        <Link href={`/records/${rec.id}`} className="fw-bold text-dark text-decoration-none hover-primary d-block">
                          {rec.title}
                        </Link>
                        <small className="text-muted d-flex align-items-center gap-1">
                          <i className="bi bi-file-earmark-word text-primary"></i>
                          <span>{rec.template_name}</span>
                        </small>
                      </td>
                      <td>
                        <div className="fw-semibold small">{rec.created_by_name}</div>
                      </td>
                      <td>
                        <small className="text-muted">{rec.created_at}</small>
                      </td>
                      <td>
                        <span className={`badge ${rec.print_count > 0 ? 'bg-success' : 'bg-secondary'}`}>
                          <i className="bi bi-printer me-1"></i>{rec.print_count} lần
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            className="btn btn-warning text-dark fw-bold"
                            onClick={() => handlePrintRecord(rec)}
                            title="In ra máy in local ngay"
                          >
                            <i className="bi bi-printer-fill me-1"></i> In
                          </button>
                          <Link
                            href={`/records/${rec.id}`}
                            className="btn btn-outline-secondary"
                            title="Xem chi tiết dữ liệu"
                          >
                            <i className="bi bi-eye"></i>
                          </Link>
                          <a
                            href={`/api/records/${rec.id}/export?format=docx`}
                            className="btn btn-outline-success"
                            title="Tải file Word (.docx) đã điền"
                          >
                            <i className="bi bi-file-earmark-word"></i>
                          </a>
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => handleDeleteRecord(rec.id)}
                            title="Xóa bản ghi"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Print Preview & Local Printer Dialog Modal */}
      {showPrintModal && activePrintRecord && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-xl modal-dialog-centered" style={{ height: '90vh' }}>
            <div className="modal-content h-100 shadow-lg border-0">
              <div className="modal-header bg-dark text-white py-2">
                <h6 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <i className="bi bi-printer-fill text-warning"></i>
                  In Hồ Sơ: {activePrintRecord.title} [{activePrintRecord.code}]
                </h6>
                <div className="d-flex gap-2 ms-auto me-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-warning text-dark fw-bold"
                    onClick={() => {
                      const iframe = document.getElementById('recordPrintIframe');
                      if (iframe) {
                        iframe.contentWindow.focus();
                        iframe.contentWindow.print();
                      }
                    }}
                  >
                    <i className="bi bi-printer-fill me-1"></i> Gửi Lệnh In Ra Máy In Local
                  </button>
                  <a
                    href={`/api/records/${activePrintRecord.id}/export?format=docx`}
                    className="btn btn-sm btn-outline-light"
                  >
                    <i className="bi bi-download me-1"></i> Tải Word
                  </a>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowPrintModal(false)}
                ></button>
              </div>
              <div className="modal-body p-0 bg-secondary bg-opacity-10 h-100">
                <iframe
                  id="recordPrintIframe"
                  src={`/api/records/${activePrintRecord.id}/print`}
                  className="w-100 h-100 border-0"
                  title="PDF Print View"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
