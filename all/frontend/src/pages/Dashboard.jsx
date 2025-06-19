import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [dados, setDados] = useState(null);
  const [acoesPendentes, setAcoesPendentes] = useState([]);
  const navigate = useNavigate();
  const funcao = localStorage.getItem('funcao');

  const carregarDashboard = async () => {
    const token = localStorage.getItem('token');
    if (!token) return alert('Usuário não autenticado');

    try {
      const res = await fetch('http://localhost:5000/api/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

if (!res.ok || typeof data !== 'object') {
  console.warn('Erro ao carregar dados do dashboard:', data);
  return;
}
      if (res.ok) {
        setDados(data);
      } else {
        alert('Erro ao carregar dashboard');
      }
    } catch (error) {
      console.error(error);
      alert('Erro de conexão com o servidor');
    }
  };

const buscarAcoesPendentes = async () => {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch('http://localhost:5000/api/acoes', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const todasAcoes = await res.json();

    if (!Array.isArray(todasAcoes)) {
      console.warn('Resposta inesperada da API de ações:', todasAcoes);
      return;
    }

    const pendentes = todasAcoes.filter(acao => acao.situacao === 'Em avaliação');
    setAcoesPendentes(pendentes);
  } catch (err) {
    console.error('Erro ao buscar ações pendentes:', err);
  }
};


  const aprovarAcao = async (acao) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/acoes/${acao.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          titulo: acao.titulo,
          prazo_conclusao: acao.prazo_conclusao?.split('T')[0],
          responsavel_id: acao.responsavel_id,
          metodo: acao.metodo || '',
          situacao: 'Cadastrada'
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert('Ação aprovada com sucesso!');
        buscarAcoesPendentes();
        carregarDashboard();
      } else {
        alert(data.message || 'Erro ao aprovar ação');
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão ao aprovar');
    }
  };

  useEffect(() => {
    carregarDashboard();
    if (funcao === 'Coordenador') {
      buscarAcoesPendentes();
    }
  }, []);

  if (!dados) {
    return (
      <div className="min-h-screen flex justify-center items-center text-blue-900 font-mono">
        Carregando...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen font-mono">
      <aside className="w-64 bg-gray-100 p-4 flex flex-col justify-between">
        <div>
          <h1 className="text-xl mb-4">Menu</h1>
          <nav className="space-y-2">
            <button className="block w-full text-left px-2 py-1 rounded bg-yellow-200 text-sm">Dashboard</button>
            {funcao !== 'Gestor' && (
              <>
                <button onClick={() => navigate('/cadastro-pilar')} className="block w-full text-left px-2 py-1 rounded hover:bg-yellow-100 text-sm">Cadastrar Pilar</button>
                <button
                  onClick={() => {
                    localStorage.removeItem('acaoEdicaoId');
                    navigate('/cadastro-acoes');
                  }}
                  className="block w-full text-left px-2 py-1 rounded hover:bg-yellow-100 text-sm"
                >
                  Cadastrar Ação
                </button>
                <button onClick={() => navigate('/cadastro-atividades')} className="block w-full text-left px-2 py-1 rounded hover:bg-yellow-100 text-sm">Cadastrar Atividades</button>
              </>
            )}
            <button onClick={() => navigate('/relatorios')} className="block w-full text-left px-2 py-1 rounded hover:bg-yellow-100 text-sm">Relatórios</button>
          </nav>
        </div>
        <button
          className="text-left text-sm text-black-1000"
          onClick={() => {
            localStorage.clear();
            navigate('/');
          }}
        >
          Sair
        </button>
      </aside>

      <main className="flex-1 bg-white p-8">
        <h1 className="text-2xl font-bold text-blue-900 mb-6">Dashboard</h1>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="border p-4 text-center">
            <p className="font-semibold">Cadastradas</p>
            <span className="text-lg font-bold">{dados.acoesStatus.cadastradas}</span>
          </div>
          <div className="border p-4 text-center">
            <p className="font-semibold">Em Avaliação</p>
            <span className="text-lg font-bold">{dados.acoesStatus.em_avaliacao}</span>
          </div>
          <div className="border p-4 text-center">
            <p className="font-semibold">Em Andamento</p>
            <span className="text-lg font-bold">{dados.acoesStatus.em_andamento}</span>
          </div>
          <div className="border p-4 text-center">
            <p className="font-semibold">Concluídas</p>
            <span className="text-lg font-bold">{dados.acoesStatus.concluidas}</span>
          </div>
        </div>

        <div className="border p-4 mb-6">
          <h2 className="font-bold mb-4">Progresso por Pilar</h2>
          {dados.progressoPorPilar.map((pilar, index) => (
            <div key={index} className="mb-4">
              <p>{pilar.pilar}</p>
              <div className="w-full h-3 bg-gray-200 rounded">
                <div className="h-3 bg-blue-600 rounded" style={{ width: `${pilar.percentual}%` }} />
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {pilar.percentual}% concluído ({pilar.concluidas}/{pilar.total})
              </p>
            </div>
          ))}
        </div>

        {funcao === 'Coordenador' && (
          <div className="border p-4">
            <h2 className="font-bold mb-4">Aprovar Ações Cadastradas</h2>
            {acoesPendentes.length === 0 ? (
              <p>Nenhuma ação pendente.</p>
            ) : (
              <ul className="space-y-2">
                {acoesPendentes.map((acao, index) => (
                  <li key={index} className="text-sm flex justify-between items-center border p-2 rounded">
                    <div>
                      <span className="font-bold">{acao.titulo}</span> – Responsável: {acao.nome_responsavel}
                    </div>
                    <button
                      onClick={() => aprovarAcao(acao)}
                      className="bg-green-500 text-white text-xs px-3 py-1 rounded hover:bg-green-600"
                    >
                      Aprovar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </main>
    </div>
  );
}



