'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import AlertBanner from '@/components/AlertBanner';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    company_name: '',
    company_address: '',
    company_phone: '',
    default_paper_size: 'A4',
    default_printer: 'Local Default Printer',
    auto_print_dialog: 'true'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) {
          setSettings(prev => ({ ...prev, ...data.settings }));
        }
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setBanner(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });
      const data = await res.json();
      if (data.success) {
        setBanner({ type: 'success', message: 'Đã lưu cấu hình hệ thống thành công!' });
      } else {
        setBanner({ type: 'danger', message: data.message || 'Lỗi lưu cài đặt' });
      }
    } catch (err) {
      setBanner({ type: 'danger', message: 'Lỗi kết nối: ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <PageHeader
        icon="bi-gear"
        title="Cài Đặt Hệ Thống & Thiết Lập In Ấn"
        subtitle="Cấu hình thông tin cơ quan, máy in local mặc định, khổ giấy và tham số vận hành."
      />

      <AlertBanner
        type={banner?.type}
        message={banner?.message}
        onClose={() => setBanner(null)}
        className="mb-4"
      />

      <form onSubmit={handleSave}>
        <div className="row g-4">
          <div className="col-12 col-md-6">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-white py-3 fw-bold text-dark d-flex align-items-center gap-2">
                <i className="bi bi-building text-primary"></i>
                Thông Tin Cơ Quan / Doanh Nghiệp
              </div>
              <div className="card-body p-4">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Tên cơ quan / Đơn vị ban hành</label>
                  <input
                    type="text"
                    className="form-control"
                    value={settings.company_name}
                    onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                  />
                  <small className="text-muted">Xuất hiện ở phần tiêu đề góc trái biểu mẫu.</small>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Địa chỉ trụ sở</label>
                  <input
                    type="text"
                    className="form-control"
                    value={settings.company_address}
                    onChange={(e) => setSettings({ ...settings, company_address: e.target.value })}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Số điện thoại liên hệ</label>
                  <input
                    type="text"
                    className="form-control"
                    value={settings.company_phone}
                    onChange={(e) => setSettings({ ...settings, company_phone: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-white py-3 fw-bold text-dark d-flex align-items-center gap-2">
                <i className="bi bi-printer-fill text-warning"></i>
                Thiết Lập Máy In Local & Khổ Giấy
              </div>
              <div className="card-body p-4">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Khổ giấy in tiêu chuẩn</label>
                  <select
                    className="form-select"
                    value={settings.default_paper_size}
                    onChange={(e) => setSettings({ ...settings, default_paper_size: e.target.value })}
                  >
                    <option value="A4">A4 (210 x 297 mm) - Tiêu chuẩn Việt Nam</option>
                    <option value="Letter">Letter (8.5 x 11 in)</option>
                    <option value="A5">A5 (148 x 210 mm)</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Tên máy in mặc định</label>
                  <input
                    type="text"
                    className="form-control"
                    value={settings.default_printer}
                    onChange={(e) => setSettings({ ...settings, default_printer: e.target.value })}
                  />
                  <small className="text-muted">Tên máy in ghi trong nhật ký in ấn.</small>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Tự động kích hoạt hộp thoại in</label>
                  <select
                    className="form-select"
                    value={settings.auto_print_dialog}
                    onChange={(e) => setSettings({ ...settings, auto_print_dialog: e.target.value })}
                  >
                    <option value="true">Bật (Tự động mở hộp thoại in của máy in sau khi nạp)</option>
                    <option value="false">Tắt (Chỉ xem trước PDF rồi bấm nút in thủ công)</option>
                  </select>
                </div>
              </div>

              <div className="card-footer bg-white p-3 text-end">
                <button type="submit" className="btn btn-primary fw-bold px-4" disabled={saving}>
                  {saving ? 'Đang lưu...' : 'Lưu Thiết Lập'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
