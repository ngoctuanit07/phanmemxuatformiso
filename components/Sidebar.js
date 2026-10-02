'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const hasPerm = (code) => {
    if (!user) return false;
    if (user.role_code === 'ADMIN') return true;
    return user.permissions && user.permissions.includes(code);
  };

  const hasModule = (moduleName) => {
    if (!user) return false;
    if (user.role_code === 'ADMIN') return true;
    switch (moduleName) {
      case 'Templates':
        return hasPerm('template.view') || hasPerm('template.create');
      case 'Records':
        return hasPerm('record.view') || hasPerm('record.create') || hasPerm('record.print');
      case 'Logs':
        return hasPerm('log.view');
      case 'Products':
        return hasPerm('product.view') || hasPerm('product.create');
      case 'Users':
        return hasPerm('user.view') || hasPerm('user.manage');
      case 'Roles':
        return hasPerm('role.manage');
      case 'Settings':
        return hasPerm('setting.manage');
      default:
        return true;
    }
  };

  return (
    <aside className="sidebar p-0 d-flex flex-column">
      <div className="p-3 border-bottom border-secondary border-opacity-25">
        <div className="d-flex align-items-center gap-2 text-white">
          <i className="bi bi-printer-fill fs-3 text-warning"></i>
          <div>
            <div className="fw-bold fs-6">HỆ THỐNG XUẤT FORM</div>
            <small className="text-secondary" style={{ fontSize: '0.75rem' }}>Word & PDF Engine v1.0</small>
          </div>
        </div>
      </div>

      <div className="py-2 flex-grow-1">
        <div className="nav-header">TỔNG QUAN</div>
        <ul className="nav flex-column">
          <li className="nav-item">
            <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>
              <i className="bi bi-speedometer2"></i>
              <span>Bảng Điều Khiển</span>
            </Link>
          </li>
        </ul>

        {hasModule('Templates') && (
          <>
            <div className="nav-header">MODULE BIỂU MẪU</div>
            <ul className="nav flex-column">
              {hasPerm('template.view') && (
                <li className="nav-item">
                  <Link href="/templates" className={`nav-link ${pathname === '/templates' ? 'active' : ''}`}>
                    <i className="bi bi-collection"></i>
                    <span>Danh Sách Template</span>
                  </Link>
                </li>
              )}
              {hasPerm('template.create') && (
                <li className="nav-item">
                  <Link href="/templates/upload" className={`nav-link ${pathname === '/templates/upload' ? 'active' : ''}`}>
                    <i className="bi bi-cloud-arrow-up"></i>
                    <span>Nạp Mẫu Word / PDF</span>
                    <span className="badge bg-warning text-dark ms-auto font-monospace" style={{ fontSize: '0.65rem' }}>MỚI</span>
                  </Link>
                </li>
              )}
            </ul>
          </>
        )}

        {hasModule('Records') && (
          <>
            <div className="nav-header">MODULE NHẬP LIỆU & IN</div>
            <ul className="nav flex-column">
              {hasPerm('record.create') && (
                <li className="nav-item">
                  <Link href="/fill" className={`nav-link ${pathname.startsWith('/fill') ? 'active' : ''}`}>
                    <i className="bi bi-pencil-square"></i>
                    <span>Nhập Liệu & In Form</span>
                  </Link>
                </li>
              )}
              {hasPerm('record.view') && (
                <li className="nav-item">
                  <Link href="/records" className={`nav-link ${pathname.startsWith('/records') ? 'active' : ''}`}>
                    <i className="bi bi-file-earmark-check"></i>
                    <span>Hồ Sơ Form Đã Lưu</span>
                  </Link>
                </li>
              )}
              {hasPerm('log.view') && (
                <li className="nav-item">
                  <Link href="/print-logs" className={`nav-link ${pathname === '/print-logs' ? 'active' : ''}`}>
                    <i className="bi bi-printer"></i>
                    <span>Nhật Ký In Máy Local</span>
                  </Link>
                </li>
              )}
            </ul>
          </>
        )}

        {hasModule('Products') && (
          <>
            <div className="nav-header">MODULE SẢN PHẨM</div>
            <ul className="nav flex-column">
              <li className="nav-item">
                <Link href="/products" className={`nav-link ${pathname === '/products' ? 'active' : ''}`}>
                  <i className="bi bi-box-seam"></i>
                  <span>Danh Sách Sản Phẩm</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/product-categories" className={`nav-link ${pathname === '/product-categories' ? 'active' : ''}`}>
                  <i className="bi bi-tags"></i>
                  <span>Danh Mục Sản Phẩm</span>
                </Link>
              </li>
            </ul>
          </>
        )}

        {hasModule('Orders') && (
          <>
            <div className="nav-header">MODULE ĐƠN HÀNG</div>
            <ul className="nav flex-column">
              <li className="nav-item">
                <Link href="/orders" className={`nav-link ${pathname === '/orders' ? 'active' : ''}`}>
                  <i className="bi bi-cart3"></i>
                  <span>Quản Lý Đơn Hàng</span>
                  <span className="badge bg-danger-subtle text-danger ms-auto font-monospace" style={{ fontSize: '0.65rem' }}>ORDER</span>
                </Link>
              </li>
            </ul>
          </>
        )}

        {(hasModule('Users') || hasModule('Roles') || hasModule('Settings')) && (
          <>
            <div className="nav-header">MODULE QUẢN TRỊ</div>
            <ul className="nav flex-column">
              {hasModule('Users') && (
                <li className="nav-item">
                  <Link href="/users" className={`nav-link ${pathname === '/users' ? 'active' : ''}`}>
                    <i className="bi bi-people"></i>
                    <span>Quản Lý Người Dùng</span>
                  </Link>
                </li>
              )}
              {hasModule('Roles') && (
                <li className="nav-item">
                  <Link href="/roles" className={`nav-link ${pathname === '/roles' ? 'active' : ''}`}>
                    <i className="bi bi-shield-lock"></i>
                    <span>Phân Quyền Vai Trò</span>
                  </Link>
                </li>
              )}
              {hasModule('Settings') && (
                <li className="nav-item">
                  <Link href="/settings" className={`nav-link ${pathname === '/settings' ? 'active' : ''}`}>
                    <i className="bi bi-gear"></i>
                    <span>Cài Đặt Máy In & Hệ Thống</span>
                  </Link>
                </li>
              )}
            </ul>
          </>
        )}
      </div>

      <div className="p-3 border-top border-secondary border-opacity-25 mt-auto">
        <div className="d-flex align-items-center justify-content-between text-secondary mb-2" style={{ fontSize: '0.8rem' }}>
          <span>Phân quyền RBAC</span>
          <span className="badge bg-success">{user?.role_code || 'Khách'}</span>
        </div>
        <button
          type="button"
          className="btn btn-sm btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-1"
          onClick={async () => {
            try { await fetch('/api/auth/logout', { method: 'POST' }); } catch (e) {}
            window.location.href = '/login';
          }}
        >
          <i className="bi bi-box-arrow-right"></i>
          <span>Đăng Xuất</span>
        </button>
      </div>
    </aside>
  );
}
