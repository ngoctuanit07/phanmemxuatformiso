'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import StatsCard from '@/components/StatsCard';

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
      {/* Page Header — standardised component */}
      <PageHeader
        icon="bi-speedometer2"
        title="Bảng Điều Khiển Hệ Thống"
        subtitle="Hệ thống nạp template Word/PDF, nhập dữ liệu biểu mẫu, lưu trữ cơ sở dữ liệu và in ấn ra máy in local."
        actions={
          <>
            <Link href="/products" className="btn btn-outline-secondary d-flex align-items-center gap-1">
              <i className="bi bi-box-seam" aria-hidden="true"></i> Kho Sản Phẩm
            </Link>
            <Link href="/templates/upload" className="btn btn-outline-primary d-flex align-items-center gap-1">
              <i className="bi bi-cloud-arrow-up" aria-hidden="true"></i> Nạp Mẫu Word / PDF
            </Link>
            <Link href="/fill" className="btn btn-primary d-flex align-items-center gap-1">
              <i className="bi bi-pencil-square" aria-hidden="true"></i> Nhập Form Mới
            </Link>
          </>
        }
      />

      {/* Metrics Cards — standardised StatsCard */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl">
          <StatsCard
            label="Biểu Mẫu Sẵn Sàng"
            value={loading ? null : (data?.stats?.templates || 0)}
            icon="bi-collection"
            variant="primary"
            subtext="Word & PDF"
            subtextIcon="bi-file-earmark-word"
            loading={loading}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl">
          <StatsCard
            label="Hồ Sơ Đã Lưu CSDL"
            value={loading ? null : (data?.stats?.records || 0)}
            icon="bi-file-earmark-check"
            variant="success"
            subtext="Xem & In lại →"
            subtextIcon="bi-database-check"
            loading={loading}
            href="/records"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl">
          <StatsCard
            label="Kho Hàng Hóa"
            value={loading ? null : (data?.stats?.products || 0)}
            icon="bi-boxes"
            variant="secondary"
            subtext="Mã code & Tên SP"
            subtextIcon="bi-box-seam"
            loading={loading}
            href="/products"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl">
          <StatsCard
            label="Lượt In Máy Local"
            value={loading ? null : (data?.stats?.prints || 0)}
            icon="bi-printer"
            variant="warning"
            subtext="Máy in vật lý"
            subtextIcon="bi-printer"
            loading={loading}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl">
          <StatsCard
            label="Người Dùng"
            value={loading ? null : (data?.stats?.users || 0)}
            icon="bi-people"
            variant="info"
            subtext="Phân quyền RBAC"
            subtextIcon="bi-shield-check"
            loading={loading}
          />
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
                      <Link href={`/fill/${tpl.id}`} className="btn btn-sm btn-primary flex-grow-1 d-flex align-items-center justify-content-center gap-1 shadow-sm">
                        <i className="bi bi-pencil-square"></i> Điền Form & In
                      </Link>
                      <Link href={`/records?template_id=${tpl.id}`} className="btn btn-sm btn-outline-info d-flex align-items-center justify-content-center gap-1 shadow-sm" title="Quản lý dữ liệu đã lưu của biểu mẫu này">
                        <i className="bi bi-database"></i> Dữ Liệu
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
                            <div className="btn-group btn-group-sm">
                              <Link href={`/records/${rec.id}`} className="btn btn-warning text-dark fw-bold" title="In Lại Hồ Sơ Này">
                                <i className="bi bi-printer-fill me-1"></i> In Lại
                              </Link>
                              <Link href={`/fill?record_id=${rec.id}`} className="btn btn-outline-primary" title="Sửa Dữ Liệu">
                                <i className="bi bi-pencil-square"></i>
                              </Link>
                            </div>
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
