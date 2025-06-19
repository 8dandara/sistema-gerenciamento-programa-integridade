const express = require('express');
const router = express.Router();
const pilaresController = require('../controllers/pilaresController');
const { auth } = require('../middleware/authMiddleware');

router.get('/', auth, pilaresController.listarPilares);
router.post('/', auth, pilaresController.criarPilar);
router.put('/:id', auth, pilaresController.atualizarPilar);
router.delete('/:id', auth, pilaresController.excluirPilar);

module.exports = router;
