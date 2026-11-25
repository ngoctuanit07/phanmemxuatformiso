/**
 * LoadingSpinner — Standardised loading state indicator.
 *
 * Usage:
 *   <LoadingSpinner message="Đang tải danh sách biểu mẫu..." />
 *   <LoadingSpinner size="sm" inline message="Đang tải..." />
 *
 * Design system: REDESIGN-003 / WCAG 2.2 AA
 */
export default function LoadingSpinner({
  message = 'Đang tải dữ liệu...',
  size = 'md',
  inline = false,
  className = '',
}) {
  const spinnerClass = `spinner-border text-primary ${size === 'sm' ? 'spinner-border-sm' : ''}`;

  if (inline) {
    return (
      <span className={`d-inline-flex align-items-center gap-2 text-muted ${className}`} role="status">
        <span className={spinnerClass} aria-hidden="true"></span>
        <span>{message}</span>
      </span>
    );
  }

  return (
    <div className={`text-center py-5 ${className}`} role="status">
      <div className={spinnerClass} aria-hidden="true"></div>
      {message && <div className="text-muted mt-2">{message}</div>}
      {!message && <span className="visually-hidden">Đang tải...</span>}
    </div>
  );
}
