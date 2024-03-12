const express = require('express');
const execController = require('../controllers/execController');
const router = express.Router();

router.get('/*', execController.execMetric);

module.exports = router;
