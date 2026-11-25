/**
 * StatsCard — Metric / KPI card for dashboard overview rows.
 *
 * Usage:
 *   <StatsCard
 *     label="Biểu Mẫu Sẵn Sàng"
 *     value={42}
 *     icon="bi-collection"
 *     variant="primary"          // primary | success | warning | danger | info | secondary
 *     subtext="Word & PDF"
 *     subtextIcon="bi-file-earmark-word"
 *     loading={false}
 *     href="/templates"          // optional — wraps card in <a>
 *   />
 *
 * Design system: REDESIGN-001 / globals.css .stat-card-*
 */
import Link from 'next/link';

const VARIANT_ICON_BG = {
  primary:   'bg-primary bg-opacity-10 text-primary',
  success:   'bg-success bg-opacity-10 text-success',
  warning:   'bg-warning bg-opacity-10 text-warning',
  danger:    'bg-danger  bg-opacity-10 text-danger',
  info:      'bg-info    bg-opacity-10 text-info',
  secondary: 'bg-secondary bg-opacity-10 text-secondary',
};
const VARIANT_VALUE_CLASS = {
  primary:   'text-primary',
  success:   'text-success',
  warning:   'text-warning',
  danger:    'text-danger',
  info:      'text-info',
  secondary: 'text-secondary',
};

function CardInner({ label, value, icon, variant = 'primary', subtext, subtextIcon, loading }) {
  const iconBg = VARIANT_ICON_BG[variant] || VARIANT_ICON_BG.primary;
  const valueClass = VARIANT_VALUE_CLASS[variant] || VARIANT_VALUE_CLASS.primary;

  return (
    <div className={`card h-100 bg-white shadow-sm stat-card-${variant}`}>
      <div className="card-body d-flex align-items-center justify-content-between p-3">
        <div>
          <span className="text-muted text-uppercase fw-semibold fs-7 d-block mb-1">{label}</span>
          <h4 className={`fw-bold my-1 ${valueClass}`}>
            {loading ? (
              <span className="placeholder-glow"><span className="placeholder col-4 rounded"></span></span>
            ) : value}
          </h4>
          {subtext && (
            <small className="text-muted">
              {subtextIcon && <i className={`bi ${subtextIcon} me-1`} aria-hidden="true"></i>}
              {subtext}
            </small>
          )}
        </div>
        <div className={`p-3 rounded-circle ${iconBg}`} aria-hidden="true">
          <i className={`bi ${icon} fs-4`}></i>
        </div>
      </div>
    </div>
  );
}

export default function StatsCard({ href, ...props }) {
  if (href) {
    return (
      <Link href={href} className="text-decoration-none hover-shadow d-block h-100">
        <CardInner {...props} />
      </Link>
    );
  }
  return <CardInner {...props} />;
}
