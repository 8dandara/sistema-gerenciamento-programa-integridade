const db = require('../models/db');

exports.listarHistorico = (req, res) => {
  const { acao_id } = req.params;

  const sql = `
    SELECT h.*, u.nome AS autor
    FROM historico_acoes h
    JOIN usuarios u ON h.autor_id = u.id
    WHERE h.acao_id = ?
    ORDER BY h.data DESC
  `;

  db.query(sql, [acao_id], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

exports.registrarHistorico = (req, res) => {
  const { acao_id, descricao } = req.body;
  const autor_id = req.usuario.id;

  const sql = `
    INSERT INTO historico_acoes (acao_id, descricao, autor_id)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [acao_id, descricao, autor_id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.status(201).json({ message: 'Histórico registrado', id: result.insertId });
  });
};
