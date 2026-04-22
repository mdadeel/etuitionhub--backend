const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    key: { 
        type: String, 
        required: true, 
        unique: true,
        index: true 
    },
    value: { 
        type: mongoose.Schema.Types.Mixed, 
        required: true 
    },
    label: String,
    description: String,
    category: {
        type: String,
        enum: ['general', 'contact', 'financial', 'appearance'],
        default: 'general'
    }
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
