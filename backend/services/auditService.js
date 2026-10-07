const AuditLog = require('../models/AuditLog');

/**
 * Record an administrative security/audit event
 */
const logAdminAction = async ({
  req,
  action,
  targetType,
  targetId = null,
  previousState = null,
  newState = null,
}) => {
  try {
    const actor = req?.user?._id;
    const actorEmail = req?.user?.email || 'system@techcrate.com';
    const actorRole = req?.user?.role || 'system';
    const ipAddress = req?.ip || req?.headers?.['x-forwarded-for'] || '127.0.0.1';
    const userAgent = req?.headers?.['user-agent'] || 'Admin Console';

    await AuditLog.create({
      actor,
      actorEmail,
      actorRole,
      action,
      targetType,
      targetId: targetId ? String(targetId) : null,
      previousState,
      newState,
      ipAddress,
      userAgent,
    });
  } catch (err) {
    console.error('[AuditLog Error]', err.message);
  }
};

module.exports = { logAdminAction };
