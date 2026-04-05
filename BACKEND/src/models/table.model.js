const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema(
    {
        tableNumber: {
            type: Number,
            required: true,
            unique: true,
            min: 1,
            index: true,
        },
        qrId: {
            type: String,
            required: true,
            unique: true,
            index: true,
            immutable: true,
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
            index: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

module.exports = mongoose.model('Table', tableSchema);
