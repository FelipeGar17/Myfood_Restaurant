const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const Table = require('../models/table.model');
const TableSession = require('../models/tableSession.model');

const DEFAULT_IDLE_TIMEOUT_MINUTES = 30;
const DEFAULT_MAX_SESSION_MINUTES = 180;
const QR_ID_PATTERN = /^[A-Za-z0-9_-]{43}$/;

const getPositiveInt = (value, fallback) => {
    const parsed = Number.parseInt(value, 10);

    if (Number.isInteger(parsed) && parsed > 0) {
        return parsed;
    }

    return fallback;
};

const getLegacySessionMinutes = () => getPositiveInt(process.env.SESSION_DURATION_MINUTES, null);

const getIdleTimeoutMinutes = () => {
    const legacy = getLegacySessionMinutes();
    const fallback = legacy || DEFAULT_IDLE_TIMEOUT_MINUTES;

    return getPositiveInt(process.env.SESSION_IDLE_MINUTES, fallback);
};

const getMaxSessionMinutes = () => {
    const legacy = getLegacySessionMinutes();
    const fallback = legacy || DEFAULT_MAX_SESSION_MINUTES;
    const configuredMax = getPositiveInt(process.env.SESSION_MAX_MINUTES, fallback);

    return Math.max(configuredMax, getIdleTimeoutMinutes());
};

const getSessionDurationMinutes = getMaxSessionMinutes;

const getSessionDurationMs = () => getMaxSessionMinutes() * 60 * 1000;
const getIdleTimeoutMs = () => getIdleTimeoutMinutes() * 60 * 1000;

const getJwtSecret = () => process.env.SESSION_JWT_SECRET || 'dev_only_change_this_secret';

const createSignedToken = (payload, durationMinutes) =>
    jwt.sign(payload, getJwtSecret(), {
        expiresIn: `${durationMinutes}m`,
    });

const minDate = (a, b) => (a.getTime() <= b.getTime() ? a : b);

const closeSession = async (session, reason) => {
    const now = new Date();

    session.active = false;
    session.closeReason = reason;
    session.closedAt = now;
    session.lastActivityAt = now;
    session.expiresAt = now;

    await session.save();

    return session;
};

const verifyToken = (token) => {
    if (!token) {
        const error = new Error('Missing session token.');
        error.statusCode = 401;
        throw error;
    }

    try {
        const payload = jwt.verify(token, getJwtSecret());

        if (payload.scope !== 'table-session' || !payload.sid) {
            const error = new Error('Invalid session token scope.');
            error.statusCode = 401;
            throw error;
        }

        return payload;
    } catch (err) {
        const error = new Error('Invalid or expired session token.');
        error.statusCode = 401;
        throw error;
    }
};

const getOpenSessionFromToken = async (token) => {
    const payload = verifyToken(token);

    const session = await TableSession.findOne({
        sessionId: payload.sid,
    }).populate('tableId');

    if (!session) {
        const error = new Error('Session not found.');
        error.statusCode = 404;
        throw error;
    }

    if (!session.active) {
        const error = new Error('Session is already closed.');
        error.statusCode = 409;
        throw error;
    }

    const now = new Date();
    if (now > session.expiresAt || now > session.maxExpiresAt) {
        await closeSession(session, 'expired');

        const error = new Error('Session expired due to inactivity or max lifetime.');
        error.statusCode = 401;
        throw error;
    }

    return session;
};

const openSessionForTableQr = async (qrId) => {
    if (!QR_ID_PATTERN.test(qrId)) {
        const error = new Error('Invalid QR code format.');
        error.statusCode = 400;
        throw error;
    }

    const table = await Table.findOne({
        qrId,
        status: 'active',
    });

    if (!table) {
        const error = new Error('Table not found or inactive.');
        error.statusCode = 404;
        throw error;
    }

    const now = Date.now();
    const idleTimeoutMinutes = getIdleTimeoutMinutes();
    const maxSessionMinutes = getMaxSessionMinutes();

    const maxExpiresAt = new Date(now + maxSessionMinutes * 60 * 1000);
    const idleExpiresAt = new Date(now + idleTimeoutMinutes * 60 * 1000);
    const expiresAt = minDate(idleExpiresAt, maxExpiresAt);
    const sessionId = crypto.randomBytes(32).toString('hex');

    const session = await TableSession.create({
        sessionId,
        tableId: table._id,
        lastActivityAt: new Date(now),
        maxExpiresAt,
        expiresAt,
        active: true,
    });

    const token = createSignedToken(
        {
            sid: session.sessionId,
            tid: table._id.toString(),
            scope: 'table-session',
        },
        maxSessionMinutes
    );

    return {
        table,
        session,
        token,
        expiresAt,
        idleTimeoutMinutes,
        maxSessionMinutes,
    };
};

const refreshSessionActivity = async (token) => {
    const session = await getOpenSessionFromToken(token);
    const now = new Date();
    const idleExpiresAt = new Date(now.getTime() + getIdleTimeoutMs());
    const newExpiresAt = minDate(idleExpiresAt, session.maxExpiresAt);

    session.lastActivityAt = now;
    session.expiresAt = newExpiresAt;

    await session.save();

    return {
        session,
        table: session.tableId,
    };
};

const closeSessionAsPaid = async (token) => {
    const session = await getOpenSessionFromToken(token);
    await closeSession(session, 'paid');

    return {
        session,
        table: session.tableId,
    };
};

module.exports = {
    openSessionForTableQr,
    refreshSessionActivity,
    closeSessionAsPaid,
    getSessionDurationMinutes,
    getSessionDurationMs,
    getIdleTimeoutMinutes,
    getMaxSessionMinutes,
};
