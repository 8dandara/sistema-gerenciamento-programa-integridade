const db = require('../models/db');

exports.getRelatorio = (req, res) => {
  const query = `
  SELECT 
    p.id AS pilar_id,
    p.nome AS nome_pilar,
    a.id AS acao_id,
    a.titulo AS titulo_acao,
    a.situacao, 
    u.nome AS nome_responsavel,
    a.prazo_conclusao AS prazo_acao,
    at.id AS atividade_id,
    at.descricao AS descricao_atividade,
    at.data AS prazo_atividade
  FROM pilares p
  JOIN acoes a ON a.pilar_id = p.id
  JOIN usuarios u ON a.responsavel_id = u.id
  LEFT JOIN atividades at ON at.acao_id = a.id
  ORDER BY p.nome, a.titulo;
`;


  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Erro ao buscar relatório', error: err });
    res.json(results);
  });
};



