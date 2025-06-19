const db = require('../models/db');

exports.getResumoDashboard = (req, res) => {
  const hoje = new Date();
  const seteDiasDepois = new Date();
  seteDiasDepois.setDate(hoje.getDate() + 7);
  const hojeISO = hoje.toISOString().split('T')[0];
  const seteDiasISO = seteDiasDepois.toISOString().split('T')[0];

  const resumo = {};

  const sqlStatus = `
    SELECT situacao, COUNT(*) AS total
    FROM acoes
    GROUP BY situacao
  `;

  db.query(sqlStatus, (err, statusRows) => {
    if (err) return res.status(500).json(err);

    resumo.acoesStatus = {
  cadastradas: 0,
  em_avaliacao: 0,
  em_andamento: 0,
  concluidas: 0
};

statusRows.forEach(row => {
  if (row.situacao === 'Cadastrada') resumo.acoesStatus.cadastradas = row.total;
  if (row.situacao === 'Em avaliação') resumo.acoesStatus.em_avaliacao = row.total;
  if (row.situacao === 'Em andamento') resumo.acoesStatus.em_andamento = row.total;
  if (row.situacao === 'Concluída') resumo.acoesStatus.concluidas = row.total;
});

    const sqlProgresso = `
      SELECT
        p.id,
        p.nome AS pilar,
        COUNT(a.id) AS total_acoes,
        SUM(CASE WHEN a.situacao = 'Concluída' THEN 1 ELSE 0 END) AS concluidas
      FROM pilares p
      LEFT JOIN acoes a ON a.pilar_id = p.id
      GROUP BY p.id
    `;

    db.query(sqlProgresso, (err, progressoRows) => {
      if (err) return res.status(500).json(err);

      resumo.progressoPorPilar = progressoRows.map(row => ({
        pilar: row.pilar,
        total: row.total_acoes,
        concluidas: row.concluidas,
        percentual: row.total_acoes > 0
          ? Math.round((row.concluidas / row.total_acoes) * 100)
          : 0
      }));

    
      const sqlCriticos = `
        SELECT a.titulo AS acao, a.prazo_conclusao AS prazo, p.nome AS pilar
        FROM acoes a
        JOIN pilares p ON a.pilar_id = p.id
        WHERE a.prazo_conclusao BETWEEN ? AND ? AND a.situacao != 'Concluída'
      `;

      db.query(sqlCriticos, [hojeISO, seteDiasISO], (err, criticosRows) => {
        if (err) return res.status(500).json(err);

        resumo.prazosCriticos = criticosRows;
        res.json(resumo);
      });
    });
  });
};
