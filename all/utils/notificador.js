const db = require('../models/db');


exports.verificarNotificacoes = () => {
  const hoje = new Date();
  const hojeISO = hoje.toISOString().split('T')[0];

  const sql = `
    SELECT a.*, u.id AS responsavel_id, u.funcao
    FROM acoes a
    JOIN usuarios u ON a.responsavel_id = u.id
    WHERE a.situacao IN ('Cadastrada', 'Em andamento')
  `;

  db.query(sql, (err, acoes) => {
    if (err) return console.error('Erro ao buscar ações:', err);

    acoes.forEach(acao => {
      const prazo = new Date(acao.prazo_conclusao);
      const diasRestantes = Math.ceil((prazo - hoje) / (1000 * 60 * 60 * 24));

      
      if (diasRestantes === 7) {
        criarNotificacao(acao.responsavel_id, acao.id, `Atenção: a ação "${acao.titulo}" vence em 7 dias.`);
      }

      
      if (diasRestantes < 0) {
        criarNotificacao(acao.responsavel_id, acao.id, ` Ação "${acao.titulo}" está atrasada!`);
        
        
        db.query(
          'SELECT id FROM usuarios WHERE funcao = "Coordenador"',
          (err, coordenadores) => {
            if (!err) {
              coordenadores.forEach(coord => {
                criarNotificacao(coord.id, acao.id, ` Ação "${acao.titulo}" atribuída a ${acao.responsavel_id} está atrasada.`);
              });
            }
          }
        );
      }
    });
  });
};


function criarNotificacao(usuario_id, acao_id, mensagem) {
  db.query(
    'INSERT INTO notificacoes (usuario_id, acao_id, mensagem) VALUES (?, ?, ?)',
    [usuario_id, acao_id, mensagem],
    (err) => {
      if (err) console.error('Erro ao criar notificação:', err);
    }
  );
}
