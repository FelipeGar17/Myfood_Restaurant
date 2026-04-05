const {
    openSessionForTableQr,
    refreshSessionActivity,
    closeSessionAsPaid,
} = require('../services/tableAccess.service');

const getTokenFromRequest = (req) => {
    const authHeader = req.headers.authorization || '';
    if (authHeader.startsWith('Bearer ')) {
        return authHeader.slice(7).trim();
    }

    const rawCookie = req.headers.cookie || '';
    const parts = rawCookie.split(';').map((item) => item.trim());
    const sessionCookie = parts.find((item) => item.startsWith('table_session='));

    if (!sessionCookie) {
        return null;
    }

    return decodeURIComponent(sessionCookie.slice('table_session='.length));
};

const openTableByQr = async (req, res) => {
    try {
        const { qrId } = req.params;

        const result = await openSessionForTableQr(qrId);

        res.cookie('table_session', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: result.maxSessionMinutes * 60 * 1000,
            path: '/',
        });

        return res.status(200).json({
            message: 'Table session started.',
            token: result.token,
            table: {
                id: result.table._id,
                tableNumber: result.table.tableNumber,
            },
            session: {
                sessionId: result.session.sessionId,
                createdAt: result.session.createdAt,
                lastActivityAt: result.session.lastActivityAt,
                maxExpiresAt: result.session.maxExpiresAt,
                expiresAt: result.expiresAt,
                active: result.session.active,
            },
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;

        return res.status(statusCode).json({
            message: error.message || 'Unable to open table session.',
        });
    }
};

const touchTableSession = async (req, res) => {
    try {
        const token = getTokenFromRequest(req);
        const result = await refreshSessionActivity(token);

        return res.status(200).json({
            message: 'Session activity updated.',
            table: {
                id: result.table._id,
                tableNumber: result.table.tableNumber,
            },
            session: {
                sessionId: result.session.sessionId,
                createdAt: result.session.createdAt,
                lastActivityAt: result.session.lastActivityAt,
                maxExpiresAt: result.session.maxExpiresAt,
                expiresAt: result.session.expiresAt,
                active: result.session.active,
            },
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;

        return res.status(statusCode).json({
            message: error.message || 'Unable to update session activity.',
        });
    }
};

const closeTableSessionOnPayment = async (req, res) => {
    try {
        const token = getTokenFromRequest(req);
        const result = await closeSessionAsPaid(token);

        res.clearCookie('table_session', {
            path: '/',
        });

        return res.status(200).json({
            message: 'Session closed by payment.',
            table: {
                id: result.table._id,
                tableNumber: result.table.tableNumber,
            },
            session: {
                sessionId: result.session.sessionId,
                active: result.session.active,
                closeReason: result.session.closeReason,
                closedAt: result.session.closedAt,
            },
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;

        return res.status(statusCode).json({
            message: error.message || 'Unable to close session by payment.',
        });
    }
};

module.exports = {
    openTableByQr,
    touchTableSession,
    closeTableSessionOnPayment,
};
