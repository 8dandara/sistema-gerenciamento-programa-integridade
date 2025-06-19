const db = require('../models/db');
const Atividade = require('../models/Atividade');

exports.criarAtividade = (req, res) => {
  const { pilar_id, acao_id, data, descricao } = req.body;

  db.query('SELECT prazo_conclusao FROM acoes WHERE id = ?', [acao_id], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0) return res.status(400).json({ message: 'Ação não encontrada' });

    const prazoAcao = results[0].prazo_conclusao;
    if (new Date(data) > new Date(prazoAcao)) {
      return res.status(400).json({ message: 'Data da atividade excede o prazo da ação' });
    }

    Atividade.criar({ pilar_id, acao_id, data, descricao }, (err, result) => {
      if (err) return res.status(500).json(err);
      res.status(201).json({ message: 'Atividade criada com sucesso', id: result.insertId });
    });
  });
};

exports.atualizarAtividade = (req, res) => {
  const { id } = req.params;
  const { pilar_id, acao_id, data, descricao } = req.body;

  const sql = `
    UPDATE atividades
    SET pilar_id = ?, acao_id = ?, data = ?, descricao = ?
    WHERE id = ?
  `;

  db.query(sql, [pilar_id, acao_id, data, descricao, id], (err) => {
    if (err) return res.status(500).json({ message: 'Erro ao atualizar atividade', error: err });
    res.json({ message: 'Atividade atualizada com sucesso' });
  });
};

exports.listarAtividades = (req, res) => {
  Atividade.listar((err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

exports.excluirAtividade = (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM atividades WHERE id = ?';

  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ message: 'Erro ao excluir atividade' });
    res.json({ message: 'Atividade excluída com sucesso' });
  });
};
