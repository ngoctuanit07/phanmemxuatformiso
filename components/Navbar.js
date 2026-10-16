'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleSwitchUser = async (username) => {
    const res = await fetch('/api/auth/switch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });
    const data = await res.json();
    if (data.success) {
      setUser(data.user);
      router.refresh();
      window.location.reload();
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow-sm py-2">
      <div className="container-fluid px-3">
        <Link href="/" className="navbar-brand d-flex align-items-center gap-2 fw-bold text-white fs-5">
          <i className="bi bi-file-earmark-word-fill text-warning fs-4"></i>
          <span>XUẤT FORM ISO & IN ẤN</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link href="/templates" className="nav-link text-white-50 hover-white">
                <i className="bi bi-folder2-open me-1"></i> Biểu Mẫu
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/fill" className="nav-link text-white-50 hover-white">
                <i className="bi bi-pencil-square me-1"></i> Nhập Form Mới
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/records" className="nav-link text-white-50 hover-white">
                <i className="bi bi-clock-history me-1"></i> Form Đã Lưu
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/products" className="nav-link text-white-50 hover-white">
                <i className="bi bi-box-seam me-1"></i> Sản Phẩm
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/orders" className="nav-link text-white-50 hover-white">
                <i className="bi bi-cart3 me-1"></i> Đơn Hàng
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/print-logs" className="nav-link text-white-50 hover-white">
                <i className="bi bi-printer me-1"></i> Nhật Ký In
              </Link>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-3">
            {/* Quick Role Switcher for instant testing */}
            <div className="dropdown">
              <button
                className="btn btn-sm btn-outline-light dropdown-toggle d-flex align-items-center gap-1"
                type="button"
                id="roleSwitchDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="bi bi-arrow-repeat text-warning"></i>
                <span>Chuyển Vai Trò:</span>
                <span className="badge bg-warning text-dark ms-1">
                  {user ? user.role_code : 'Chưa đăng nhập'}
                </span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow" aria-labelledby="roleSwitchDropdown">
                <li><h6 className="dropdown-header">Kiểm thử phân quyền vai trò</h6></li>
                <li>
                  <button
                    className={`dropdown-item d-flex justify-content-between align-items-center ${user?.username === 'admin' ? 'active' : ''}`}
                    onClick={() => handleSwitchUser('admin')}
                  >
                    <span><strong>1. Admin:</strong> Toàn quyền</span>
                    <span className="badge bg-danger ms-2">ADMIN</span>
                  </button>
                </li>
                <li>
                  <button
                    className={`dropdown-item d-flex justify-content-between align-items-center ${user?.username === 'manager' ? 'active' : ''}`}
                    onClick={() => handleSwitchUser('manager')}
                  >
                    <span><strong>2. Manager:</strong> Quản lý mẫu & form</span>
                    <span className="badge bg-primary ms-2">MANAGER</span>
                  </button>
                </li>
                <li>
                  <button
                    className={`dropdown-item d-flex justify-content-between align-items-center ${user?.username === 'nhanvien' ? 'active' : ''}`}
                    onClick={() => handleSwitchUser('nhanvien')}
                  >
                    <span><strong>3. Nhân viên:</strong> Nhập & In</span>
                    <span className="badge bg-info text-dark ms-2">STAFF</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Current user badge & profile dropdown */}
            {user ? (
              <div className="dropdown">
                <button
                  className="btn btn-link text-decoration-none text-white p-0 d-flex align-items-center gap-2 dropdown-toggle"
                  type="button"
                  id="userProfileDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <div className="text-end d-none d-md-block">
                    <div className="fw-semibold lh-1">{user.full_name}</div>
                    <small className="text-white-50" style={{ fontSize: '0.75rem' }}>
                      {user.department || user.role_name}
                    </small>
                  </div>
                  <div className="avatar bg-white text-primary fw-bold rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: 36, height: 36 }}>
                    {user.full_name ? user.full_name.charAt(0) : 'U'}
                  </div>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow" aria-labelledby="userProfileDropdown">
                  <li className="px-3 py-2 border-bottom">
                    <div className="fw-bold">{user.full_name}</div>
                    <small className="text-muted d-block">@{user.username}</small>
                    <span className="badge bg-primary-subtle text-primary border mt-1">
                      {user.role_name}
                    </span>
                  </li>
                  <li>
                    <Link href="/users" className="dropdown-item py-2">
                      <i className="bi bi-people me-2"></i>Quản lý người dùng
                    </Link>
                  </li>
                  <li>
                    <Link href="/roles" className="dropdown-item py-2">
                      <i className="bi bi-shield-lock me-2"></i>Phân quyền module
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider my-1" /></li>
                  <li>
                    <button
                      className="dropdown-item text-danger py-2 d-flex align-items-center gap-2"
                      onClick={handleLogout}
                    >
                      <i className="bi bi-box-arrow-right"></i>Đăng xuất
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <Link href="/login" className="btn btn-sm btn-light fw-semibold">
                <i className="bi bi-box-arrow-in-right me-1"></i>Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
