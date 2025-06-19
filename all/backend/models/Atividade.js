const db = require('./db');

const Atividade = {
  criar: (dados, callback) => {
    const { pilar_id, acao_id, data, descricao } = dados;
    const sql = `
      INSERT INTO atividades (pilar_id, acao_id, data, descricao)
      VALUES (?, ?, ?, ?)
    `;
    db.query(sql, [pilar_id, acao_id, data, descricao], callback);
  },

  listar: (callback) => {
    const sql = `
      SELECT a.*, p.nome AS nome_pilar, ac.titulo AS titulo_acao
      FROM atividades a
      JOIN pilares p ON a.pilar_id = p.id
      JOIN acoes ac ON a.acao_id = ac.id
    `;
    db.query(sql, callback);
  }
};

module.exports = Atividade;
