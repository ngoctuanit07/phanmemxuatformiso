/**
 * EmptyState — Standardised empty-list / no-results state.
 *
 * Usage:
 *   <EmptyState
 *     icon="bi-inbox"
 *     title="Chưa có dữ liệu hồ sơ nào phù hợp với bộ lọc"
 *     description="Bạn có thể chọn một biểu mẫu và nhập dữ liệu để lưu vào cơ sở dữ liệu."
 *     action={<Link href="/fill" className="btn btn-sm btn-primary">Điền mới</Link>}
 *   />
 *
 * Design system: REDESIGN-004 / WCAG 2.2 AA
 */
export default function EmptyState({
  icon = 'bi-inbox',
  title,
  description,
  action,
  className = '',
}) {
  return (
    <div className={`text-center py-5 text-muted ${className}`}>
      {icon && (
        <i
          className={`bi ${icon} fs-1 text-secondary opacity-50 d-block mb-2`}
          aria-hidden="true"
        ></i>
      )}
      {title && <div className="fw-semibold text-dark mb-1">{title}</div>}
      {description && <p className="text-muted small mb-3">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
