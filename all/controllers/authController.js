const db = require('../models/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = (req, res) => {
  const { email, senha } = req.body;

  db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0) return res.status(401).json({ message: 'Usuário não encontrado' });

    const user = results[0];
    const match = await bcrypt.compare(senha, user.senha);
    if (!match) return res.status(401).json({ message: 'Senha incorreta' });

    const token = jwt.sign(
      { id: user.id, funcao: user.funcao },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      usuario: {
        id: user.id,
        nome: user.nome,
        funcao: user.funcao
      }
    });
  });
};

exports.cadastrar = async (req, res) => {
  const { nome, email, senha, funcao } = req.body;
  const hash = await bcrypt.hash(senha, 10);

  db.query(
    'INSERT INTO usuarios (nome, email, senha, funcao) VALUES (?, ?, ?, ?)',
    [nome, email, hash, funcao],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.status(201).json({ message: 'Usuário cadastrado com sucesso' });
    }
  );
};

exports.listarUsuarios = (req, res) => {
  const sql = 'SELECT id, nome, funcao FROM usuarios';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

