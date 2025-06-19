const express = require('express');
const router = express.Router();
const notificacaoController = require('../controllers/notificacaoController');
const { auth } = require('../middleware/authMiddleware');

router.get('/', auth, notificacaoController.listarNotificacoes);
router.put('/:id/lida', auth, notificacaoController.marcarComoLida);

module.exports = router;
