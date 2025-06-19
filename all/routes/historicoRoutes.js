const express = require('express');
const router = express.Router();
const historicoController = require('../controllers/historicoController');
const { auth } = require('../middleware/authMiddleware');

router.get('/:acao_id', auth, historicoController.listarHistorico);
router.post('/', auth, historicoController.registrarHistorico);

module.exports = router;
