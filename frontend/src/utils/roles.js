export function hasAdminMasterAccess(user) {
  if (!user) return false;

  // Check in roles array if it exists
  if (user.roles && Array.isArray(user.roles)) {
    return user.roles.some(role => role.toUpperCase() === 'ADMIN_MASTER');
  }

  // Fallback to role string or object
  if (typeof user.role === 'string') {
    return user.role.toUpperCase() === 'ADMIN_MASTER';
  }

  return false;
}
