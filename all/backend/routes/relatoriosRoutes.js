const express = require('express');
const router = express.Router();
const { getRelatorio } = require('../controllers/relatorioController');
const { auth } = require('../middleware/authMiddleware');

router.get('/', auth, getRelatorio);

module.exports = router;
