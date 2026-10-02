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
  const printIframeRef = useRef(null);

  useEffect(() => {
    if (!id) return;
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
          } catch (e) {
            console.error(e);
          }
          setPrinting(false);
        }, 500);
      };
    } else {
      setPrinting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <div className="text-muted mt-2">Đang tải thông tin hồ sơ...</div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="alert alert-danger">
        Không tìm thấy hồ sơ hoặc hồ sơ đã bị xóa.
        <div className="mt-2">
          <Link href="/records" className="btn btn-sm btn-outline-danger">Quay lại danh sách</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hidden print iframe */}
      <iframe
        ref={printIframeRef}
        style={{ display: 'none', position: 'absolute', width: '0px', height: '0px' }}
        title="Detail Print Iframe"
      />

      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center pb-3 mb-4 border-bottom">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-primary font-monospace">{record.code}</span>
            <span className="badge bg-secondary">{record.template_name}</span>
          </div>
          <h3 className="fw-bold mb-0 text-primary">{record.title}</h3>
        </div>
        <div className="d-flex gap-2 mt-2 mt-md-0">
          <Link href="/records" className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-1"></i> Quay lại
          </Link>
          <a
            href={`/api/records/${record.id}/export?format=docx`}
            className="btn btn-outline-success d-flex align-items-center gap-1"
          >
            <i className="bi bi-file-earmark-word"></i> Tải Word Đã Điền
          </a>
          <button
            type="button"
            className="btn btn-warning text-dark fw-bold d-flex align-items-center gap-2 shadow-sm"
            onClick={handlePrint}
            disabled={printing}
          >
            {printing ? (
              <span className="spinner-border spinner-border-sm"></span>
            ) : (
              <i className="bi bi-printer-fill fs-5"></i>
            )}
            <span>IN RA MÁY IN LOCAL</span>
          </button>
        </div>
      </div>

      <div className="row g-4">
        {/* Left: Input Form Data Breakdown */}
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white py-3 fw-bold text-dark d-flex align-items-center justify-content-between">
              <span className="d-flex align-items-center gap-2">
                <i className="bi bi-database-fill text-success"></i>
                Dữ Liệu Đã Lưu Trong CSDL
              </span>
              <span className="badge bg-success-subtle text-success">
                Đã in: {record.print_count || 0} lần
              </span>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-bordered table-striped mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '40%' }}>Tên Trường (Word Tag)</th>
                      <th style={{ width: '60%' }}>Giá Trị Nhập Liệu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {record.fields_schema && record.fields_schema.length > 0 ? (
                      record.fields_schema.map((field, idx) => {
                        const val = record.form_data ? record.form_data[field.name] : '';
                        return (
                          <tr key={idx}>
                            <td>
                              <div className="fw-semibold text-dark">{field.label || field.name}</div>
                              <code className="text-muted small">{`{${field.name}}`}</code>
                            </td>
                            <td>
                              <span className="text-dark fw-bold">{val !== undefined && val !== '' ? String(val) : <em className="text-muted">Trống</em>}</span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      Object.entries(record.form_data || {}).map(([key, val], idx) => (
                        <tr key={idx}>
                          <td><code>{`{${key}}`}</code></td>
                          <td className="fw-bold">{String(val)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live PDF / Print Document Preview */}
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white py-3 fw-bold text-dark d-flex align-items-center justify-content-between">
              <span className="d-flex align-items-center gap-2">
                <i className="bi bi-file-earmark-pdf-fill text-danger"></i>
                Bản Xem Trước In Ấn (Print Preview)
              </span>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={() => {
                  const iframe = document.getElementById('previewDetailIframe');
                  if (iframe) iframe.src = iframe.src;
                }}
              >
                <i className="bi bi-arrow-clockwise"></i> Tải lại
              </button>
            </div>
            <div className="card-body p-0" style={{ height: '600px' }}>
              <iframe
                id="previewDetailIframe"
                src={`/api/records/${record.id}/print`}
                className="w-100 h-100 border-0"
                title="Bản Xem Trước In Ấn"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
