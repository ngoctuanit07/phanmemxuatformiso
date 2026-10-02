'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(json => {
        if (json.success) setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center pb-3 mb-4 border-bottom">
        <div>
          <h3 className="fw-bold mb-1 text-primary">
            <i className="bi bi-speedometer2 me-2"></i>Bảng Điều Khiển Hệ Thống
          </h3>
          <p className="text-muted mb-0">
            Hệ thống nạp template Word/PDF, nhập dữ liệu biểu mẫu, lưu trữ cơ sở dữ liệu và in ấn ra máy in local.
          </p>
        </div>
        <div className="d-flex gap-2 mt-2 mt-md-0">
          <Link href="/products" className="btn btn-outline-secondary d-flex align-items-center gap-1">
            <i className="bi bi-box-seam"></i> Kho Sản Phẩm
          </Link>
          <Link href="/templates/upload" className="btn btn-outline-primary d-flex align-items-center gap-1">
            <i className="bi bi-cloud-arrow-up"></i> Nạp Mẫu Word / PDF
          </Link>
          <Link href="/fill" className="btn btn-primary d-flex align-items-center gap-1">
            <i className="bi bi-pencil-square"></i> Nhập Form Mới
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl">
          <div className="card h-100 border-primary border-opacity-25 bg-white shadow-sm">
            <div className="card-body d-flex align-items-center justify-content-between p-3">
              <div>
                <span className="text-muted text-uppercase fw-semibold fs-7">Biểu Mẫu Sẵn Sàng</span>
                <h4 className="fw-bold my-1 text-primary">
                  {loading ? '...' : (data?.stats?.templates || 0)}
                </h4>
                <small className="text-success"><i className="bi bi-file-earmark-word me-1"></i>Word & PDF</small>
              </div>
              <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-circle">
                <i className="bi bi-collection fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl">
          <div className="card h-100 border-success border-opacity-25 bg-white shadow-sm">
            <div className="card-body d-flex align-items-center justify-content-between p-3">
              <div>
                <span className="text-muted text-uppercase fw-semibold fs-7">Hồ Sơ Đã Lưu CSDL</span>
                <h4 className="fw-bold my-1 text-success">
                  {loading ? '...' : (data?.stats?.records || 0)}
                </h4>
                <small className="text-muted"><i className="bi bi-database-check me-1"></i>Lưu trữ MySQL</small>
              </div>
              <div className="p-3 bg-success bg-opacity-10 text-success rounded-circle">
                <i className="bi bi-file-earmark-check fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl">
          <Link href="/products" className="text-decoration-none">
            <div className="card h-100 border-secondary border-opacity-25 bg-white shadow-sm hover-shadow transition">
              <div className="card-body d-flex align-items-center justify-content-between p-3">
                <div>
                  <span className="text-muted text-uppercase fw-semibold fs-7">Kho Hàng Hóa</span>
                  <h4 className="fw-bold my-1 text-dark">
                    {loading ? '...' : (data?.stats?.products || 0)}
                  </h4>
                  <small className="text-primary"><i className="bi bi-box-seam me-1"></i>Mã code & Tên SP</small>
                </div>
                <div className="p-3 bg-dark bg-opacity-10 text-dark rounded-circle">
                  <i className="bi bi-boxes fs-4"></i>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-12 col-sm-6 col-xl">
          <div className="card h-100 border-warning border-opacity-25 bg-white shadow-sm">
            <div className="card-body d-flex align-items-center justify-content-between p-3">
              <div>
                <span className="text-muted text-uppercase fw-semibold fs-7">Lượt In Máy Local</span>
                <h4 className="fw-bold my-1 text-warning">
                  {loading ? '...' : (data?.stats?.prints || 0)}
                </h4>
                <small className="text-muted"><i className="bi bi-printer me-1"></i>Máy in vật lý</small>
              </div>
              <div className="p-3 bg-warning bg-opacity-10 text-warning rounded-circle">
                <i className="bi bi-printer fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl">
          <div className="card h-100 border-info border-opacity-25 bg-white shadow-sm">
            <div className="card-body d-flex align-items-center justify-content-between p-3">
              <div>
                <span className="text-muted text-uppercase fw-semibold fs-7">Người Dùng</span>
                <h4 className="fw-bold my-1 text-info">
                  {loading ? '...' : (data?.stats?.users || 0)}
                </h4>
                <small className="text-muted"><i className="bi bi-shield-check me-1"></i>Phân quyền RBAC</small>
              </div>
              <div className="p-3 bg-info bg-opacity-10 text-info rounded-circle">
                <i className="bi bi-people fs-4"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Templates Row */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
            <i className="bi bi-lightning-charge-fill text-warning"></i>
            Biểu Mẫu Sẵn Sàng Điền & In Ngay
          </h5>
          <Link href="/templates" className="btn btn-sm btn-outline-secondary">
            Xem tất cả <i className="bi bi-arrow-right ms-1"></i>
          </Link>
        </div>
        <div className="card-body">
          <div className="row g-3">
            {loading ? (
              <div className="text-center py-4 text-muted">Đang tải biểu mẫu...</div>
            ) : data?.top_templates && data.top_templates.length > 0 ? (
              data.top_templates.map(tpl => (
                <div key={tpl.id} className="col-12 col-md-4">
                  <div className="p-3 border rounded h-100 d-flex flex-column justify-content-between bg-light bg-opacity-50 hover-shadow transition">
                    <div>
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle font-monospace">
                          {tpl.code}
                        </span>
                        <span className="badge bg-secondary text-uppercase">{tpl.file_type}</span>
                      </div>
                      <h6 className="fw-bold text-dark mb-1">{tpl.name}</h6>
                      <small className="text-muted d-block mb-3">
                        <i className="bi bi-printer me-1"></i>Đã sử dụng: <strong>{tpl.usage_count}</strong> lần
                      </small>
                    </div>
                    <div className="d-flex gap-2">
                      <Link href={`/fill/${tpl.id}`} className="btn btn-sm btn-primary flex-grow-1 d-flex align-items-center justify-content-center gap-1">
                        <i className="bi bi-pencil-square"></i> Điền Form & In
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted">Chưa có biểu mẫu nào</div>
            )}
          </div>
        </div>
      </div>

      {/* Two columns: Recent Records & Recent Print Logs */}
      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                <i className="bi bi-clock-history text-primary"></i>
                Hồ Sơ Form Vừa Lưu Gần Đây
              </h5>
              <Link href="/records" className="btn btn-sm btn-outline-secondary">
                Xem tất cả
              </Link>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover table-custom mb-0">
                  <thead>
                    <tr>
                      <th>Mã Hồ Sơ</th>
                      <th>Tên Hồ Sơ / Biểu Mẫu</th>
                      <th>Người Nhập</th>
                      <th>Lần In</th>
                      <th className="text-end">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="5" className="text-center py-4 text-muted">Đang tải dữ liệu...</td></tr>
                    ) : data?.recent_records && data.recent_records.length > 0 ? (
                      data.recent_records.map(rec => (
                        <tr key={rec.id}>
                          <td>
                            <span className="badge bg-dark-subtle text-dark font-monospace">
                              {rec.code}
                            </span>
                          </td>
                          <td>
                            <div className="fw-semibold text-dark">{rec.title}</div>
                            <small className="text-muted">{rec.template_name}</small>
                          </td>
                          <td>
                            <small className="text-muted">{rec.created_by_name}</small>
                          </td>
                          <td>
                            <span className={`badge ${rec.print_count > 0 ? 'bg-success' : 'bg-secondary'}`}>
                              {rec.print_count} lần
                            </span>
                          </td>
                          <td className="text-end">
                            <Link href={`/records/${rec.id}`} className="btn btn-sm btn-outline-primary me-1" title="Xem & In">
                              <i className="bi bi-printer"></i> In
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="5" className="text-center py-4 text-muted">Chưa có bản ghi nào được lưu</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                <i className="bi bi-printer text-warning"></i>
                Nhật Ký In Máy Local Gần Đây
              </h5>
              <Link href="/print-logs" className="btn btn-sm btn-outline-secondary">
                Xem tất cả
              </Link>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                {loading ? (
                  <div className="text-center py-4 text-muted">Đang tải nhật ký in...</div>
                ) : data?.recent_prints && data.recent_prints.length > 0 ? (
                  data.recent_prints.map(log => (
                    <div key={log.id} className="list-group-item d-flex justify-content-between align-items-center py-3">
                      <div>
                        <div className="fw-semibold text-dark">{log.record_title}</div>
                        <small className="text-muted d-block">
                          <i className="bi bi-person me-1"></i>{log.user_name} • <i className="bi bi-printer me-1"></i>{log.printer_name}
                        </small>
                        <small className="text-secondary" style={{ fontSize: '0.75rem' }}>
                          {log.created_at}
                        </small>
                      </div>
                      <span className="badge bg-success-subtle text-success border border-success-subtle">
                        <i className="bi bi-check-circle me-1"></i>Đã in
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted">Chưa có lượt in nào được ghi nhận</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
