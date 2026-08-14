function requireAuth(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({ error: 'You must be logged in.' });
    }
    next();
}

function requireAdmin(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({ error: 'You must be logged in.' });
    }
    if (req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access only.' });
    }
    next();
}

module.exports = { requireAuth, requireAdmin };