const db = require('./db');

const Pilar = {
  criar: (dados, callback) => {
    const { nome, descricao, prazo, criado_por } = dados;
    const sql = 'INSERT INTO pilares (nome, descricao, prazo, criado_por, criado_em) VALUES (?, ?, ?, ?, NOW())';
    db.query(sql, [nome, descricao, prazo, criado_por], callback);
  },

  listar: (callback) => {
    db.query('SELECT * FROM pilares', callback);
  }
};

module.exports = Pilar;
