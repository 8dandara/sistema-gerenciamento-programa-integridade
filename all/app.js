const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/acoes', require('./routes/acoesRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/pilares', require('./routes/pilaresRoutes'));
app.use('/api/historico', require('./routes/historicoRoutes'));
app.use('/api/notificacoes', require('./routes/notificacaoRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/atividades', require('./routes/atividadesRoutes'));
app.use('/api/relatorios', require('./routes/relatoriosRoutes'));


const { verificarNotificacoes } = require('./utils/notificador');
verificarNotificacoes(); 


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
