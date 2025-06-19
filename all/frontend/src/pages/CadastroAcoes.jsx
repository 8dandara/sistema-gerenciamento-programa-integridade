import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CadastroAcoes() {
  const [titulo, setTitulo] = useState('');
  const [prazo, setPrazo] = useState('');
  const [metodo, setMetodo] = useState('');
  const [situacao, setSituacao] = useState('');
  const [pilares, setPilares] = useState([]);
  const [responsaveis, setResponsaveis] = useState([]);
  const [pilarId, setPilarId] = useState('');
  const [responsavelId, setResponsavelId] = useState('');
  const [prazoMax, setPrazoMax] = useState('');

  const navigate = useNavigate();
  const rawId = localStorage.getItem('acaoEdicaoId');
  const acaoIdValida = rawId && rawId !== 'undefined';
  const acaoEdicaoId = acaoIdValida ? rawId : null;
  const funcao = localStorage.getItem('funcao');

  const fetchPilares = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/pilares', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setPilares(data);
  };

  const fetchResponsaveis = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/auth/usuarios', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setResponsaveis(data);
  };

  useEffect(() => {
    fetchPilares();
    fetchResponsaveis();
  }, []);

  useEffect(() => {
    const pilarSelecionado = pilares.find(p => p.id === parseInt(pilarId));
    if (pilarSelecionado && pilarSelecionado.prazo) {
      setPrazoMax(pilarSelecionado.prazo.split('T')[0]);
    }
  }, [pilarId, pilares]);

  useEffect(() => {
    if (acaoEdicaoId) {
      const token = localStorage.getItem('token');
      fetch(`http://localhost:5000/api/acoes/${acaoEdicaoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.id) {
            setTitulo(data.titulo);
            setPrazo(data.prazo_conclusao?.split('T')[0]);
            setMetodo(data.metodo);
            setSituacao(data.situacao);
            setPilarId(data.pilar_id);
            setResponsavelId(data.responsavel_id);
          } else {
            alert('Ação não encontrada');
          }
        })
        .catch(err => {
          console.error(err);
          alert('Erro ao buscar dados da ação para edição');
        });
    }
  }, [acaoEdicaoId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return alert('Usuário não autenticado');

    const url = acaoEdicaoId
      ? `http://localhost:5000/api/acoes/${acaoEdicaoId}`
      : 'http://localhost:5000/api/acoes';

    const method = acaoEdicaoId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        titulo,
        prazo_conclusao: prazo,
        metodo,
        situacao: acaoEdicaoId ? situacao : funcao === 'Analista' ? 'Em avaliação' : situacao,
        pilar_id: pilarId,
        responsavel_id: responsavelId
      })
    });

    const data = await response.json();

    if (response.ok) {
      alert(acaoEdicaoId ? 'Ação atualizada com sucesso!' : 'Ação cadastrada com sucesso!');
      localStorage.removeItem('acaoEdicaoId');
      navigate('/dashboard');
    } else {
      alert(data.message || 'Erro ao salvar ação');
    }
  };

  return (
    <div className="flex min-h-screen font-mono">
      <aside className="w-64 bg-gray-100 p-4 flex flex-col justify-between">
        <div>
          <h1 className="text-xl mb-4">Menu</h1>
          <nav className="space-y-2">
            <button onClick={() => navigate('/dashboard')} className="block w-full text-left px-2 py-1 rounded hover:bg-yellow-100 text-sm">Dashboard</button>
            {funcao !== 'Gestor' && (
              <>
                <button onClick={() => navigate('/cadastro-pilar')} className="block w-full text-left px-2 py-1 rounded hover:bg-yellow-100 text-sm">Cadastrar Pilar</button>
                <button className="block w-full text-left px-2 py-1 rounded bg-yellow-200 text-sm">Cadastrar Ação</button>
                <button onClick={() => navigate('/cadastro-atividades')} className="block w-full text-left px-2 py-1 rounded hover:bg-yellow-100 text-sm">Cadastrar Atividades</button>
              </>
            )}
            <button onClick={() => navigate('/relatorios')} className="block w-full text-left px-2 py-1 rounded hover:bg-yellow-100 text-sm">Relatórios</button>
          </nav>
        </div>
      </aside>

      <main className="flex-1 bg-white p-10 text-black">
        <h1 className="text-2xl mb-6">{acaoIdValida ? 'Editar Ação' : 'Cadastro de Ação'}</h1>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <select value={pilarId} onChange={(e) => setPilarId(e.target.value)} required className="w-full p-2 rounded border bg-transparent border-gray-400">
            <option value="">Selecione um Pilar</option>
            {pilares.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>

          <select value={situacao} onChange={(e) => setSituacao(e.target.value)} required className="w-full p-2 rounded border bg-transparent border-gray-400 text-gray-700">
            <option value="" disabled hidden>Situação</option>
            {funcao === 'Analista' && <option value="Em avaliação">Em avaliação</option>}
            <option value="Cadastrada">Cadastrada</option>
            <option value="Em andamento">Em andamento</option>
            {funcao === 'Coordenador' && <option value="Concluída">Concluída</option>}
          </select>

          <input type="text" placeholder="Título da Ação" value={titulo} onChange={(e) => setTitulo(e.target.value)} required className="w-full p-2 rounded border bg-transparent border-gray-400" />

          <select value={responsavelId} onChange={(e) => setResponsavelId(e.target.value)} required className="w-full p-2 rounded border bg-transparent border-gray-400">
            <option value="">Selecione um Responsável</option>
            {responsaveis.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}
          </select>

          <input type="date" value={prazo} max={prazoMax} onChange={(e) => setPrazo(e.target.value)} required className="w-full p-2 rounded border bg-transparent border-gray-400" />

          <textarea placeholder="Método" value={metodo} onChange={(e) => setMetodo(e.target.value)} className="w-full p-2 rounded border bg-transparent border-gray-400" />

          <button type="submit" className="w-full bg-yellow-400 text-black font-bold py-2 rounded hover:bg-yellow-500">
            {acaoIdValida ? 'Salvar Alterações' : 'Cadastrar'}
          </button>
        </form>
      </main>
    </div>
  );
}



