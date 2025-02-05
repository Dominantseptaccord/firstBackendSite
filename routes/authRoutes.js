const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');

router.post('/verify-2fa', dataController.verify2FA);

module.exports = router;
