const mongoose = require('mongoose');

const tableSessionSchema = new mongoose.Schema(
    {
        sessionId: {
            type: String,
            required: true,
            unique: true,
            index: true,
            immutable: true,
        },
        tableId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Table',
            required: true,
            index: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
            immutable: true,
        },
        lastActivityAt: {
            type: Date,
            default: Date.now,
            required: true,
            index: true,
        },
        maxExpiresAt: {
            type: Date,
            required: true,
            index: true,
        },
        expiresAt: {
            type: Date,
            required: true,
            index: { expires: 0 },
        },
        active: {
            type: Boolean,
            default: true,
            index: true,
        },
        closedAt: {
            type: Date,
            default: null,
        },
        closeReason: {
            type: String,
            enum: ['paid', 'expired', 'manual', null],
            default: null,
        },
    },
    {
        versionKey: false,
    }
);

module.exports = mongoose.model('TableSession', tableSessionSchema);
