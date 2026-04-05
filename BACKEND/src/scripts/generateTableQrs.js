require('dotenv').config();

const crypto = require('crypto');
const fs = require('fs/promises');
const mongoose = require('mongoose');
const path = require('path');
const QRCode = require('qrcode');

const connectDB = require('../config/database');
const Table = require('../models/table.model');

const DEFAULT_TABLES = 10;
const DEFAULT_START_AT = 1;
const DEFAULT_BASE_URL = 'http://localhost:3000';
const QR_OUTPUT_DIR = path.resolve(__dirname, '../../public/qrs');

const parsePositiveInt = (value, fallback) => {
    const parsed = Number.parseInt(value, 10);

    if (Number.isInteger(parsed) && parsed > 0) {
        return parsed;
    }

    return fallback;
};

const generateUniqueQrId = async () => {
    while (true) {
        const candidate = crypto.randomBytes(32).toString('base64url');
        const exists = await Table.exists({ qrId: candidate });

        if (!exists) {
            return candidate;
        }
    }
};

const ensureTable = async (tableNumber) => {
    let table = await Table.findOne({ tableNumber });

    if (!table) {
        table = await Table.create({
            tableNumber,
            qrId: await generateUniqueQrId(),
            status: 'active',
        });
    }

    return table;
};

const saveQrImage = async (table, baseUrl) => {
    const qrUrl = `${baseUrl}/t/${table.qrId}`;
    const fileName = `table-${table.tableNumber}.png`;
    const filePath = path.join(QR_OUTPUT_DIR, fileName);

    await QRCode.toFile(filePath, qrUrl, {
        type: 'png',
        width: 320,
        margin: 2,
        errorCorrectionLevel: 'H',
    });

    return {
        tableNumber: table.tableNumber,
        qrId: table.qrId,
        qrUrl,
        fileName,
    };
};

const main = async () => {
    const totalTables = parsePositiveInt(process.argv[2], DEFAULT_TABLES);
    const startAt = parsePositiveInt(process.argv[3], DEFAULT_START_AT);
    const baseUrl = (process.env.APP_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, '');

    await connectDB();
    await fs.mkdir(QR_OUTPUT_DIR, { recursive: true });

    const generated = [];

    for (let i = 0; i < totalTables; i += 1) {
        const tableNumber = startAt + i;
        const table = await ensureTable(tableNumber);
        const result = await saveQrImage(table, baseUrl);
        generated.push(result);
    }

    console.log(`Generated ${generated.length} QR files in: ${QR_OUTPUT_DIR}`);

    generated.forEach((item) => {
        console.log(`Table ${item.tableNumber}: ${item.qrUrl} -> ${item.fileName}`);
    });
};

main()
    .catch((error) => {
        console.error('Failed to generate table QRs:', error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.connection.close();
    });
