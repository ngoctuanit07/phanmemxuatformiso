/**
 * PageHeader — Standardised page title + subtitle + actions bar.
 *
 * Usage:
 *   <PageHeader
 *     icon="bi-speedometer2"
 *     title="Bảng Điều Khiển"
 *     subtitle="Mô tả ngắn gọn về trang này"
 *     actions={<><Link href="/fill" className="btn btn-primary">Nhập Form</Link></>}
 *   />
 *
 * Design system: REDESIGN-001 / globals.css .page-header*
 */
export default function PageHeader({ icon, title, subtitle, actions, className = '' }) {
  return (
    <div className={`page-header ${className}`}>
      <div>
        <h3 className="page-header-title">
          {icon && <i className={`bi ${icon}`} aria-hidden="true"></i>}
          {title}
        </h3>
        {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
      </div>
      {actions && (
        <div className="page-header-actions">
          {actions}
        </div>
      )}
    </div>
  );
}
