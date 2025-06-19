const express = require('express');
const router = express.Router();
const acoesController = require('../controllers/acoesController');
const { auth } = require('../middleware/authMiddleware');

router.get('/', auth, acoesController.listarAcoes);
router.get('/:id', auth, acoesController.buscarAcaoPorId); 
router.post('/', auth, acoesController.criarAcao);
router.put('/:id', auth, acoesController.atualizarAcao);
router.delete('/:id', auth, acoesController.excluirAcao);

module.exports = router;

