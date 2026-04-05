const express = require('express');

const {
    openTableByQr,
    touchTableSession,
    closeTableSessionOnPayment,
} = require('../controllers/tableAccess.controller');

const router = express.Router();

router.post('/session/activity', touchTableSession);
router.post('/session/pay', closeTableSessionOnPayment);
router.get('/:qrId', openTableByQr);

module.exports = router;
