const express = require('express');
const router = express.Router();
const { login, cadastrar, listarUsuarios } = require('../controllers/authController');
const { auth } = require('../middleware/authMiddleware');
const db = require('../models/db');

router.post('/login', login);
router.post('/cadastrar', cadastrar);

router.get('/usuarios', listarUsuarios);
router.get('/responsaveis', auth, (req, res) => {
  const sql = 'SELECT id, nome FROM usuarios';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Erro ao buscar responsáveis', error: err });
    res.json(results);
  });
});

module.exports = router;

