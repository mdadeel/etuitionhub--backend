// async wrapper - avoids try catch in routes
// copied from stackoverflow lol
module.exports = fn => (req, res, next) => fn(req, res, next).catch(next)
