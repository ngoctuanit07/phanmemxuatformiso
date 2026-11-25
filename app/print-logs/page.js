'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';

export default function PrintLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = () => {
    setLoading(true);
    fetch('/api/print-logs?limit=100')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setLogs(data.logs || []);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div>
      {/* Header */}
      <PageHeader
        icon="bi-printer"
        title="Nhật Ký In Ấn Máy In Local (Audit Logs)"
        subtitle="Theo dõi chi tiết mọi lần kết nối và in biểu mẫu ra máy in vật lý hoặc máy in mạng nội bộ."
        actions={
          <button
            type="button"
            className="btn btn-outline-primary d-flex align-items-center gap-1"
            onClick={fetchLogs}
          >
            <i className="bi bi-arrow-clockwise" aria-hidden="true"></i> Làm mới danh sách
          </button>
        }
      />

      <div className="card shadow-sm">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
            <i className="bi bi-list-check text-success" aria-hidden="true"></i>
            Lịch Sử Lệnh In ({logs.length} lượt)
          </h5>
          <span className="badge bg-success-subtle text-success border border-success-subtle">
            Khổ in: A4 tiêu chuẩn
          </span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-custom align-middle mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Thời Gian In</th>
                  <th>Mã & Tiêu Đề Hồ Sơ</th>
                  <th>Biểu Mẫu Word</th>
                  <th>Người Thực Hiện</th>
                  <th>Tên Máy In Local</th>
                  <th>Trạng Thái</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <LoadingSpinner inline size="sm" message="Đang tải nhật ký in ấn..." />
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-0">
                      <EmptyState
                        icon="bi-printer"
                        title="Chưa có lượt in nào được ghi nhận"
                        description='Hãy điền form và bấm "In ra máy in local".'
                      />
                    </td>
                  </tr>
                ) : (
                  logs.map((log, idx) => (
                    <tr key={log.id}>
                      <td className="text-muted small">{idx + 1}</td>
                      <td>
                        <span className="fw-semibold text-dark">{log.created_at}</span>
                      </td>
                      <td>
                        <span className="badge bg-dark-subtle text-dark font-monospace me-1">
                          {log.record_code}
                        </span>
                        <div className="fw-bold text-dark mt-1">{log.record_title}</div>
                      </td>
                      <td>
                        <span className="text-muted small">
                          <i className="bi bi-file-earmark-word text-primary me-1"></i>
                          {log.template_name}
                        </span>
                      </td>
                      <td>
                        <div className="fw-semibold">{log.user_name}</div>
                        <small className="text-muted">@{log.username}</small>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          <i className="bi bi-printer me-1"></i>{log.printer_name}
                        </span>
                      </td>
                      <td>
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
