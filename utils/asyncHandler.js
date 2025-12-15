/**
 * Async handler wrapper - eliminates try-catch boilerplate
 * 
 * Before: Each route had its own try-catch block
 * After: Wrap handler with this, errors auto-forward to error middleware
 * 
 * Example:
 *   router.get('/', asyncHandler(async (req, res) => {
 *       const data = await Model.find();
 *       res.json(data);
 *   }));
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = asyncHandler;
