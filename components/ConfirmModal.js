/**
 * ConfirmModal — Standardised confirmation dialog (replaces native confirm()).
 *
 * Usage:
 *   <ConfirmModal
 *     show={!!confirmState}
 *     title="Xác nhận xóa"
 *     message="Bạn có chắc chắn muốn xóa?"
 *     confirmLabel="Xóa"
 *     variant="danger"
 *     loading={deleting}
 *     onConfirm={...}
 *     onCancel={() => setConfirmState(null)}
 *   />
 *
 * Design system: REDESIGN-004 / WCAG 2.2 AA
 */
export default function ConfirmModal({
  show,
  title = 'Xác nhận thao tác',
  message,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!show) return null;

  const headerBg =
    variant === 'danger'
      ? 'bg-danger text-white'
      : variant === 'warning'
        ? 'bg-warning text-dark'
        : 'bg-primary text-white';

  const closeWhite = variant === 'warning' ? '' : 'btn-close-white';

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmModalTitle"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow-lg border-0">
          <div className={`modal-header ${headerBg}`}>
            <h5 className="modal-title fw-bold d-flex align-items-center gap-2" id="confirmModalTitle">
              <i className="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
              {title}
            </h5>
            <button
              type="button"
              className={`btn-close ${closeWhite}`}
              aria-label="Đóng"
              onClick={onCancel}
              disabled={loading}
            ></button>
          </div>
          <div className="modal-body p-4">
            <p className="mb-0 text-dark">{message}</p>
          </div>
          <div className="modal-footer bg-light">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              className={`btn btn-${variant} fw-semibold d-flex align-items-center gap-1`}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading && (
                <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
              )}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
