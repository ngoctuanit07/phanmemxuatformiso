/**
 * AlertBanner — Standardised dismissible alert banner (replaces native alert()).
 *
 * Usage:
 *   <AlertBanner
 *     type="success" // success | danger | warning | info
 *     message="Đã lưu thành công!"
 *     onClose={() => setBanner(null)}
 *   />
 *
 * Design system: REDESIGN-002 / WCAG 2.2 AA
 */
const ICON_MAP = {
  success: 'bi-check-circle-fill',
  danger: 'bi-exclamation-triangle-fill',
  warning: 'bi-exclamation-circle-fill',
  info: 'bi-info-circle-fill',
};

export default function AlertBanner({ type = 'info', message, onClose, className = '' }) {
  if (!message) return null;
  const icon = ICON_MAP[type] || ICON_MAP.info;

  return (
    <div
      className={`alert alert-${type} alert-dismissible fade show shadow-sm d-flex align-items-center gap-2 ${className}`}
      role="alert"
    >
      <i className={`bi ${icon} flex-shrink-0`} aria-hidden="true"></i>
      <div className="flex-grow-1">{message}</div>
      {onClose && (
        <button
          type="button"
          className="btn-close"
          aria-label="Đóng thông báo"
          onClick={onClose}
        ></button>
      )}
    </div>
  );
}
