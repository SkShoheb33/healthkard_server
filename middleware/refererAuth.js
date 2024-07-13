// middleware/refererAuth.js
const refererAuth = (req, res, next) => {
    const referer = req.headers.referer || req.headers.origin;
    const allowedDomain = 'healthkard.in';

    if (referer && referer.includes(allowedDomain)) {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden' });
    }
}

module.exports = refererAuth;