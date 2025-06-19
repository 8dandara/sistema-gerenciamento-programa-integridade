const express = require('express');
const router = express.Router();
const atividadesController = require('../controllers/atividadesController');
const { auth } = require('../middleware/authMiddleware');

router.post('/', auth, atividadesController.criarAtividade);
router.put('/:id', auth, atividadesController.atualizarAtividade);
router.get('/', auth, atividadesController.listarAtividades);
router.delete('/:id', auth, atividadesController.excluirAtividade);

module.exports = router;
