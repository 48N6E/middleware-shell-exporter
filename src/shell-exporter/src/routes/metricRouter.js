const express = require('express');
const metricCrontroller = require('../controllers/metricCrontroller');
const router = express.Router();

router.get('/*', metricCrontroller.exportMetric);

module.exports = router;

