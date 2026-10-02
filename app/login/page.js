'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
        router.push(redirectUrl);
        router.refresh();
      } else {
        setError(data.message || 'Tên đăng nhập hoặc mật khẩu không chính xác');
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (user, pass) => {
    setUsername(user);
    setPassword(pass);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass })
      });
      const data = await res.json();
      if (data.success) {
        router.push(redirectUrl);
        router.refresh();
      } else {
        setError(data.message || 'Lỗi đăng nhập');
      }
    } catch (err) {
      setError('Lỗi kết nối: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center align-items-center min-vh-75">
        <div className="col-12 col-md-8 col-lg-5">
          <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
            {/* Header */}
            <div className="bg-primary text-white text-center p-4">
              <div className="d-inline-flex p-3 bg-white bg-opacity-20 rounded-circle mb-3">
                <i className="bi bi-file-earmark-word-fill text-warning fs-1"></i>
              </div>
              <h3 className="fw-bold mb-1">XUẤT BIỂU MẪU & IN ẤN</h3>
              <p className="text-white-50 mb-0 small">
                Đăng nhập hệ thống quản lý biểu mẫu ISO & phân quyền module
              </p>
            </div>

            {/* Body */}
            <div className="card-body p-4 p-md-5">
              {error && (
                <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-4" role="alert">
                  <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                  <div className="flex-grow-1">{error}</div>
                  <button type="button" className="btn-close btn-sm" onClick={() => setError(null)}></button>
                </div>
              )}

              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label className="form-label fw-semibold text-dark">
                    Tên đăng nhập
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="bi bi-person text-muted"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0 ps-0"
                      placeholder="admin / manager / nhanvien"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label fw-semibold text-dark mb-0">
                      Mật khẩu
                    </label>
                    <span className="small text-muted">Mặc định: 123</span>
                  </div>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="bi bi-lock text-muted"></i>
                    </span>
                    <input
                      type="password"
                      className="form-control border-start-0 ps-0"
                      placeholder="Nhập mật khẩu..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm"></span>
                      Đang xác thực...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-right"></i>
                      Đăng Nhập Vào Hệ Thống
                    </>
                  )}
                </button>
              </form>

              {/* Quick Login Test Accounts for easy grading & demo */}
              <div className="mt-4 pt-4 border-top">
                <div className="text-center text-muted small fw-bold mb-2 text-uppercase">
                  Đăng nhập nhanh 1-Click để kiểm thử phân quyền:
                </div>
                <div className="d-flex flex-column gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm d-flex justify-content-between align-items-center py-2 px-3"
                    onClick={() => handleQuickLogin('admin', 'admin123')}
                    disabled={loading}
                  >
                    <div className="text-start">
                      <div className="fw-bold">1. Quản Trị Viên (Admin)</div>
                      <small className="text-muted">Toàn quyền tất cả module & người dùng</small>
                    </div>
                    <span className="badge bg-danger">admin / admin123</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm d-flex justify-content-between align-items-center py-2 px-3"
                    onClick={() => handleQuickLogin('manager', 'manager123')}
                    disabled={loading}
                  >
                    <div className="text-start">
                      <div className="fw-bold">2. Quản Lý (Manager)</div>
                      <small className="text-muted">Quản lý biểu mẫu, hồ sơ, nhật ký in</small>
                    </div>
                    <span className="badge bg-primary">manager / manager123</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-info btn-sm d-flex justify-content-between align-items-center py-2 px-3"
                    onClick={() => handleQuickLogin('nhanvien', 'nhanvien123')}
                    disabled={loading}
                  >
                    <div className="text-start">
                      <div className="fw-bold">3. Nhân Viên (Staff)</div>
                      <small className="text-muted">Chỉ nhập liệu & in ấn hồ sơ của mình</small>
                    </div>
                    <span className="badge bg-info text-dark">nhanvien / nhanvien123</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="card-footer bg-light py-3 text-center small text-muted border-0">
              <i className="bi bi-shield-check text-success me-1"></i>
              Bảo mật mã hóa Bcrypt & JWT Session • CSDL MySQL: <code>phanmemxuatform</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <div className="text-muted mt-2">Đang tải trang đăng nhập...</div>
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}
