const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
    tutorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    dayOfWeek: {
        type: Number,
        required: true,
        min: 0,
        max: 6 // 0 = Sunday, 6 = Saturday
    },
    slots: [{
        startTime: String, // "09:00"
        endTime: String,   // "10:00"
        isActive: { type: Boolean, default: true }
    }]
});

const Availability = mongoose.model('Availability', availabilitySchema);

module.exports = Availability;
