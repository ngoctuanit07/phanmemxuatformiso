import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { queryOne, query } from './db';

const JWT_SECRET = process.env.JWT_SECRET || (
  process.env.NODE_ENV === 'production' 
    ? (() => { throw new Error('FATAL: JWT_SECRET environment variable must be set in production!'); })()
    : 'phanmemxuatform_dev_only_key_not_for_production_2026'
);

/**
 * Sign JWT Token
 */
export function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role_id: user.role_id,
      role_code: user.role_code
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Verify JWT Token
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Get current authenticated user from cookies or Authorization header
 */
export async function getCurrentUser(req) {
  let token = null;

  // Try reading from Next.js cookies if available
  try {
    const cookieStore = cookies();
    const authCookie = cookieStore.get('auth_token');
    if (authCookie) {
      token = authCookie.value;
    }
  } catch (e) {
    // Ignore if outside Next.js request context
  }

  // If request object provided, check headers or cookie header
  if (!token && req) {
    const authHeader = req.headers?.get ? req.headers.get('authorization') : req.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies?.get) {
      token = req.cookies.get('auth_token')?.value;
    }
  }

  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded || !decoded.id) return null;

  // Fetch fresh user data with role from DB
  const user = await queryOne(
    `SELECT u.id, u.username, u.full_name, u.email, u.phone, u.department, u.role_id, u.status,
            r.name AS role_name, r.code AS role_code
     FROM users u
     LEFT JOIN roles r ON u.role_id = r.id
     WHERE u.id = ? AND u.status = 'active'`,
    [decoded.id]
  );

  if (!user) return null;

  // 1. Fetch role permissions
  const rolePerms = await query(
    `SELECT p.code
     FROM permissions p
     INNER JOIN role_permissions rp ON p.id = rp.permission_id
     WHERE rp.role_id = ?`,
    [user.role_id]
  );

  // 2. Fetch direct user-specific permissions
  const userPerms = await query(
    `SELECT p.code
     FROM permissions p
     INNER JOIN user_permissions up ON p.id = up.permission_id
     WHERE up.user_id = ?`,
    [user.id]
  );

  const permissionSet = new Set([
    ...rolePerms.map(p => p.code),
    ...userPerms.map(p => p.code)
  ]);

  user.permissions = Array.from(permissionSet);
  return user;
}

/**
 * Check if user has specific permission code
 */
export function hasPermission(user, permissionCode) {
  if (!user) return false;
  if (user.role_code === 'ADMIN') return true; // Superadmin has all permissions
  return user.permissions && user.permissions.includes(permissionCode);
}

/**
 * Check if user can access a module
 */
export function canAccessModule(user, moduleName) {
  if (!user) return false;
  if (user.role_code === 'ADMIN') return true;

  switch (moduleName) {
    case 'Templates':
      return hasPermission(user, 'template.view') || hasPermission(user, 'template.create');
    case 'Records':
      return hasPermission(user, 'record.view') || hasPermission(user, 'record.create') || hasPermission(user, 'record.print');
    case 'Products':
      return hasPermission(user, 'product.view') || hasPermission(user, 'product.create');
    case 'Orders':
      return hasPermission(user, 'order.view') || hasPermission(user, 'order.create');
    case 'Users':
      return hasPermission(user, 'user.view') || hasPermission(user, 'user.manage');
    case 'Roles':
      return hasPermission(user, 'role.manage');
    case 'Logs':
      return hasPermission(user, 'log.view');
    case 'Settings':
      return hasPermission(user, 'setting.manage');
    default:
      return true;
  }
}
