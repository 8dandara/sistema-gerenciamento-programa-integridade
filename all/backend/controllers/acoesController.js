const db = require('../models/db');

exports.listarAcoes = (req, res) => {
  const { pilar_id } = req.query;

  let sql = `
    SELECT a.*, p.nome AS nome_pilar, u.nome AS nome_responsavel
    FROM acoes a
    JOIN pilares p ON a.pilar_id = p.id
    JOIN usuarios u ON a.responsavel_id = u.id
  `;

  const params = [];

  if (pilar_id) {
    sql += ' WHERE a.pilar_id = ?';
    params.push(pilar_id);
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

exports.buscarAcaoPorId = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const sql = `
    SELECT a.*, p.nome AS nome_pilar, u.nome AS nome_responsavel
    FROM acoes a
    JOIN pilares p ON a.pilar_id = p.id
    JOIN usuarios u ON a.responsavel_id = u.id
    WHERE a.id = ?
  `;
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Erro ao buscar ação', error: err });
    if (results.length === 0) return res.status(404).json({ message: 'Ação não encontrada' });
    res.json(results[0]);
  });
};

exports.criarAcao = (req, res) => {
  const { pilar_id, titulo, responsavel_id, prazo_conclusao, metodo } = req.body;

  db.query('SELECT prazo FROM pilares WHERE id = ?', [pilar_id], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0) return res.status(400).json({ message: 'Pilar não encontrado' });

    const prazoPilar = results[0].prazo;
    if (new Date(prazo_conclusao) > new Date(prazoPilar)) {
      return res.status(400).json({ message: 'Data da ação excede o prazo do pilar selecionado' });
    }

    const sql = `
      INSERT INTO acoes (pilar_id, titulo, prazo_conclusao, situacao, responsavel_id, metodo, criado_em)
      VALUES (?, ?, ?, 'Cadastrada', ?, ?, NOW())
    `;
    db.query(sql, [pilar_id, titulo, prazo_conclusao, responsavel_id, metodo], (err, result) => {
      if (err) return res.status(500).json(err);
      res.status(201).json({ message: 'Ação criada com sucesso', id: result.insertId });
    });
  });
};

exports.atualizarAcao = (req, res) => {
  const { id } = req.params;
  const { titulo, prazo_conclusao, situacao, responsavel_id, metodo } = req.body;

  const sql = `
    UPDATE acoes
    SET titulo = ?, prazo_conclusao = ?, situacao = ?, responsavel_id = ?, metodo = ?
    WHERE id = ?
  `;

  db.query(sql, [titulo, prazo_conclusao, situacao, responsavel_id, metodo, id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Ação atualizada com sucesso' });
  });
};

exports.excluirAcao = (req, res) => {
  const { id } = req.params;

  const sqlDeleteAtividades = 'DELETE FROM atividades WHERE acao_id = ?';
  db.query(sqlDeleteAtividades, [id], (err) => {
    if (err) return res.status(500).json({ message: 'Erro ao excluir atividades vinculadas', error: err });

    db.query('DELETE FROM acoes WHERE id = ?', [id], (err2) => {
      if (err2) return res.status(500).json({ message: 'Erro ao excluir ação', error: err2 });
      res.json({ message: 'Ação excluída com sucesso' });
    });
  });
};

