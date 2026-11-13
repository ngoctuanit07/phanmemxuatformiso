'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RecordDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);
  const [fieldSearch, setFieldSearch] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const printIframeRef = useRef(null);

  const fetchRecord = () => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/records/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.record) {
          setRecord(data.record);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRecord();
  }, [id]);

  const handlePrint = () => {
    setPrinting(true);
    const printUrl = `/api/records/${id}/print`;

    if (printIframeRef.current) {
      printIframeRef.current.src = printUrl;
      printIframeRef.current.onload = () => {
        setTimeout(() => {
          try {
            printIframeRef.current.contentWindow.focus();
            printIframeRef.current.contentWindow.print();
            setTimeout(() => {
              fetchRecord();
            }, 1000);
          } catch (e) {
            console.warn('Iframe print error fallback:', e);
            window.open(printUrl, '_blank');
          }
          setPrinting(false);
        }, 500);
      };
    } else {
      window.open(printUrl, '_blank');
      setPrinting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Bạn có chắc chắn muốn xóa hồ sơ "${record.title}" [${record.code}] khỏi cơ sở dữ liệu?`)) return;
    try {
      const res = await fetch(`/api/records/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        alert('Đã xóa hồ sơ thành công!');
        router.push('/records');
      } else {
        alert(data.message || 'Lỗi khi xóa hồ sơ');
      }
    } catch (err) {
      alert('Lỗi kết nối: ' + err.message);
    }
  };

  const copyCode = () => {
    if (!record) return;
    navigator.clipboard?.writeText(record.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <div className="text-muted mt-2">Đang tải thông tin chi tiết hồ sơ...</div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="alert alert-danger shadow-sm">
        <h5 className="alert-heading">Không tìm thấy hồ sơ!</h5>
        <p className="mb-2">Bản ghi này không tồn tại hoặc đã bị xóa khỏi cơ sở dữ liệu.</p>
        <Link href="/records" className="btn btn-sm btn-outline-danger">
          <i className="bi bi-arrow-left me-1"></i> Quay lại danh sách hồ sơ
        </Link>
      </div>
    );
  }

  // Filter fields for preview table
  const allFieldEntries = record.fields_schema && record.fields_schema.length > 0
    ? record.fields_schema.map(f => ({
        name: f.name,
        label: f.label || f.name,
        type: f.type || 'text',
        value: record.form_data ? record.form_data[f.name] : ''
      }))
    : Object.entries(record.form_data || {}).map(([k, v]) => ({
        name: k,
        label: k,
        type: 'text',
        value: v
      }));

  const filteredFields = fieldSearch.trim()
    ? allFieldEntries.filter(
        f =>
          f.name.toLowerCase().includes(fieldSearch.toLowerCase()) ||
          f.label.toLowerCase().includes(fieldSearch.toLowerCase()) ||
          String(f.value || '').toLowerCase().includes(fieldSearch.toLowerCase())
      )
    : allFieldEntries;

  return (
    <div className="pb-5">
      {/* Hidden print iframe */}
      <iframe
        ref={printIframeRef}
        style={{ display: 'none', position: 'absolute', width: '0px', height: '0px' }}
        title="Detail Direct Print Iframe"
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item">
            <Link href="/" className="text-decoration-none">Bảng Điều Khiển</Link>
          </li>
          <li className="breadcrumb-item">
            <Link href="/records" className="text-decoration-none">Quản Lý Dữ Liệu Đã Nhập</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {record.code}
          </li>
        </ol>
      </nav>

      {/* Main Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center pb-3 mb-4 border-bottom">
        <div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="badge bg-dark font-monospace fs-6 px-2 py-1">
              {record.code}
            </span>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary py-0 px-2"
              onClick={copyCode}
              title="Sao chép mã hồ sơ"
            >
              <i className={`bi ${copiedCode ? 'bi-check-lg text-success' : 'bi-clipboard'} me-1`}></i>
              {copiedCode ? 'Đã chép' : 'Sao chép'}
            </button>
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle font-monospace">
              {record.template_code}
            </span>
            <span className="badge bg-secondary">
              {record.template_name}
            </span>
            <span className={`badge ${record.print_count > 0 ? 'bg-success' : 'bg-secondary'}`}>
              <i className="bi bi-printer me-1"></i>Đã in {record.print_count || 0} lần
            </span>
          </div>
          <h2 className="fw-bold mb-0 text-primary">{record.title}</h2>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="d-flex flex-wrap gap-2 mt-3 mt-lg-0">
          <Link href="/records" className="btn btn-outline-secondary d-flex align-items-center gap-1 shadow-sm">
            <i className="bi bi-arrow-left"></i> Danh Sách
          </Link>

          {/* Edit Data & Re-fill */}
          <Link
            href={`/fill?record_id=${record.id}`}
            className="btn btn-outline-primary d-flex align-items-center gap-1 shadow-sm"
            title="Mở form để chỉnh sửa các trường dữ liệu và in lại"
          >
            <i className="bi bi-pencil-square"></i> Sửa Dữ Liệu
          </Link>

          {/* Duplicate Record */}
          <Link
            href={`/fill?record_id=${record.id}&mode=duplicate`}
            className="btn btn-outline-info d-flex align-items-center gap-1 shadow-sm"
            title="Tạo bản sao mới với dữ liệu được nạp sẵn từ hồ sơ này"
          >
            <i className="bi bi-copy"></i> Nhân Bản
          </Link>

          {/* Download Word */}
          <a
            href={`/api/records/${record.id}/export?format=docx`}
            className="btn btn-outline-success d-flex align-items-center gap-1 shadow-sm"
            title="Tải file Word (.docx) đã điền sẵn dữ liệu"
          >
            <i className="bi bi-file-earmark-word"></i> Tải Word
          </a>

          {/* Download PDF */}
          <a
            href={`/api/records/${record.id}/export?format=pdf`}
            className="btn btn-outline-danger d-flex align-items-center gap-1 shadow-sm"
            title="Tải file PDF (.pdf) đã kết xuất"
          >
            <i className="bi bi-file-earmark-pdf"></i> Tải PDF
          </a>

          {/* Primary Action: Re-Print */}
          <button
            type="button"
            className="btn btn-warning text-dark fw-bold d-flex align-items-center gap-2 shadow"
            onClick={handlePrint}
            disabled={printing}
          >
            {printing ? (
              <span className="spinner-border spinner-border-sm"></span>
            ) : (
              <i className="bi bi-printer-fill fs-5"></i>
            )}
            <span>IN LẠI RA MÁY IN LOCAL</span>
          </button>

          {/* Delete Button */}
          <button
            type="button"
            className="btn btn-outline-danger"
            onClick={handleDelete}
            title="Xóa hồ sơ này khỏi cơ sở dữ liệu"
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      </div>

      {/* Metadata Bar */}
      <div className="card shadow-sm mb-4 border-0 bg-light">
        <div className="card-body p-3">
          <div className="row g-3 text-secondary small">
            <div className="col-6 col-md-3">
              <span className="text-muted d-block">Người tạo hồ sơ:</span>
              <strong className="text-dark">{record.created_by_name || 'N/A'}</strong>
            </div>
            <div className="col-6 col-md-3">
              <span className="text-muted d-block">Ngày lưu vào CSDL:</span>
              <strong className="text-dark">{record.created_at}</strong>
            </div>
            <div className="col-6 col-md-3">
              <span className="text-muted d-block">Lần cập nhật cuối:</span>
              <strong className="text-dark">{record.updated_at || record.created_at}</strong>
            </div>
            <div className="col-6 col-md-3">
              <span className="text-muted d-block">Lần in gần nhất:</span>
              <strong className="text-dark">
                {record.last_printed_at ? String(record.last_printed_at) : 'Chưa in lần nào'}
              </strong>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Data fields inspection */}
        <div className="col-12 col-xl-6">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-header bg-white py-3 d-flex flex-wrap align-items-center justify-content-between gap-2 border-bottom">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-database-check text-success fs-5"></i>
                <h5 className="mb-0 fw-bold text-dark">Dữ Liệu Đã Lưu Trong CSDL</h5>
              </div>
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                {allFieldEntries.length} trường dữ liệu
              </span>
            </div>

            {/* Field search input */}
            <div className="p-2 border-bottom bg-light bg-opacity-50">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Lọc nhanh trường dữ liệu hoặc giá trị..."
                  value={fieldSearch}
                  onChange={(e) => setFieldSearch(e.target.value)}
                />
                {fieldSearch && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setFieldSearch('')}
                  >
                    Xóa
                  </button>
                )}
              </div>
            </div>

            <div className="card-body p-0" style={{ maxHeight: '650px', overflowY: 'auto' }}>
              <table className="table table-bordered table-striped mb-0 align-middle">
                <thead className="table-light sticky-top small text-uppercase">
                  <tr>
                    <th style={{ width: '40%' }}>Tên Trường / Tag Word</th>
                    <th style={{ width: '60%' }}>Giá Trị Đã Nhập</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFields.length === 0 ? (
                    <tr>
                      <td colSpan="2" className="text-center py-4 text-muted">
                        Không tìm thấy trường nào phù hợp với từ khóa "{fieldSearch}"
                      </td>
                    </tr>
                  ) : (
                    filteredFields.map((field, idx) => {
                      const val = field.value;
                      const hasVal = val !== undefined && val !== null && val !== '';
                      return (
                        <tr key={idx}>
                          <td>
                            <div className="fw-semibold text-dark">{field.label}</div>
                            <code className="text-muted small" style={{ fontSize: '0.75rem' }}>
                              {`{${field.name}}`}
                            </code>
                          </td>
                          <td>
                            {hasVal ? (
                              <span className="text-dark fw-bold" style={{ wordBreak: 'break-word' }}>
                                {String(val)}
                              </span>
                            ) : (
                              <em className="text-muted small">Trống</em>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="card-footer bg-white py-3 border-top d-flex justify-content-between align-items-center">
              <Link href={`/fill?record_id=${record.id}`} className="btn btn-sm btn-outline-primary">
                <i className="bi bi-pencil-square me-1"></i> Chỉnh sửa dữ liệu này
              </Link>
              <small className="text-muted">
                Dữ liệu được nạp tự động vào file mẫu Word/PDF khi in
              </small>
            </div>
          </div>
        </div>

        {/* Right Column: Live Printable Preview */}
        <div className="col-12 col-xl-6">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-header bg-white py-3 d-flex flex-wrap align-items-center justify-content-between gap-2 border-bottom">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-file-earmark-pdf-fill text-danger fs-5"></i>
                <h5 className="mb-0 fw-bold text-dark">Bản Xem Trước In Ấn (Print Preview)</h5>
              </div>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => {
                    const iframe = document.getElementById('previewDetailIframe');
                    if (iframe) iframe.src = iframe.src;
                  }}
                  title="Tải lại bản xem trước"
                >
                  <i className="bi bi-arrow-clockwise"></i> Tải lại
                </button>
                <a
                  href={`/api/records/${record.id}/print`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm btn-outline-primary"
                  title="Mở tab riêng để xem toàn màn hình hoặc in độc lập"
                >
                  <i className="bi bi-box-arrow-up-right me-1"></i> Mở Tab In
                </a>
              </div>
            </div>

            <div className="card-body p-0 bg-secondary bg-opacity-10 position-relative" style={{ height: '650px' }}>
              <iframe
                id="previewDetailIframe"
                src={`/api/records/${record.id}/print`}
                className="w-100 h-100 border-0"
                title="Bản Xem Trước In Ấn"
              />
            </div>

            <div className="card-footer bg-white py-3 border-top d-flex justify-content-between align-items-center">
              <span className="small text-muted">
                <i className="bi bi-info-circle me-1"></i>Kết xuất chuẩn khổ A4 theo đúng dữ liệu đã nhập
              </span>
              <button
                type="button"
                className="btn btn-sm btn-warning text-dark fw-bold shadow-sm"
                onClick={handlePrint}
                disabled={printing}
              >
                <i className="bi bi-printer-fill me-1"></i> In Ngay Ra Máy In Local
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Print History / Audit Trail */}
      <div className="card shadow-sm mt-4 border-0">
        <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
          <h5 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
            <i className="bi bi-clock-history text-primary"></i>
            Nhật Ký In Ấn Của Hồ Sơ Này ({record.print_history ? record.print_history.length : 0} lần ghi nhận)
          </h5>
          <Link href="/print-logs" className="btn btn-sm btn-outline-secondary">
            Xem toàn bộ nhật ký hệ thống &rarr;
          </Link>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-uppercase">
                <tr>
                  <th style={{ width: '10%' }}>ID Log</th>
                  <th style={{ width: '25%' }}>Thời Gian In</th>
                  <th style={{ width: '20%' }}>Người Thực Hiện</th>
                  <th style={{ width: '25%' }}>Máy In / Thông Số</th>
                  <th style={{ width: '10%' }}>Khổ Giấy</th>
                  <th style={{ width: '10%' }} className="text-center">Trạng Thái</th>
                </tr>
              </thead>
              <tbody>
                {!record.print_history || record.print_history.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      Hồ sơ này chưa từng được gửi lệnh in nào ra máy in local.
                    </td>
                  </tr>
                ) : (
                  record.print_history.map(log => (
                    <tr key={log.id}>
                      <td><span className="badge bg-light text-dark font-monospace">#{log.id}</span></td>
                      <td>
                        <span className="fw-semibold text-dark">{log.created_at}</span>
                      </td>
                      <td>
                        <div className="small fw-semibold">{log.printed_by_name || 'Hệ thống'}</div>
                      </td>
                      <td>
                        <div className="small">{log.printer_name}</div>
                        <small className="text-muted">IP: {log.ip_address || '127.0.0.1'}</small>
                      </td>
                      <td>
                        <span className="badge bg-secondary">{log.paper_size || 'A4'}</span>
                      </td>
                      <td className="text-center">
                        <span className="badge bg-success-subtle text-success border border-success-subtle">
                          <i className="bi bi-check-circle-fill me-1"></i>Thành công
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
