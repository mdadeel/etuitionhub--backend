const Setting = require('../models/Setting');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

/**
 * GET /api/settings
 * Admin only - returns all settings
 */
const getAllSettings = asyncHandler(async (req, res) => {
    const settings = await Setting.find().sort({ category: 1, label: 1 });
    res.json(settings);
});

/**
 * GET /api/settings/public
 * Returns non-sensitive settings (e.g. contact_phone, platform_name)
 */
const getPublicSettings = asyncHandler(async (req, res) => {
    // Only return settings that aren't restricted
    const settings = await Setting.find({
        key: { $in: ['contact_phone', 'contact_email', 'platform_fee', 'notice_banner'] }
    });
    
    // Map to a cleaner object for frontend
    const publicSettings = {};
    settings.forEach(s => {
        publicSettings[s.key] = s.value;
    });
    
    res.json(publicSettings);
});

/**
 * PATCH /api/settings/bulk
 * Admin only - updates multiple settings at once
 */
const bulkUpdateSettings = asyncHandler(async (req, res) => {
    const { settings } = req.body; // Array of { key, value }

    if (!Array.isArray(settings)) {
        throw AppError.badRequest('Settings must be an array', 'INVALID_FORMAT');
    }

    const updatePromises = settings.map(item => 
        Setting.findOneAndUpdate(
            { key: item.key },
            { value: item.value },
            { new: true, upsert: true }
        )
    );

    const updatedSettings = await Promise.all(updatePromises);
    res.json(updatedSettings);
});

module.exports = {
    getAllSettings,
    getPublicSettings,
    bulkUpdateSettings
};
