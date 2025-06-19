const db = require('../models/db');

exports.listarNotificacoes = (req, res) => {
  const usuario_id = req.usuario.id;

  const sql = `
    SELECT n.*, a.titulo AS titulo_acao
    FROM notificacoes n
    JOIN acoes a ON n.acao_id = a.id
    WHERE n.usuario_id = ?
    ORDER BY n.criada_em DESC
  `;

  db.query(sql, [usuario_id], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

exports.marcarComoLida = (req, res) => {
  const { id } = req.params;

  db.query('UPDATE notificacoes SET lida = 1 WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Notificação marcada como lida' });
  });
};
