import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CadastroAtividades() {
  const [pilares, setPilares] = useState([]);
  const [acoes, setAcoes] = useState([]);
  const [pilarId, setPilarId] = useState('');
  const [acaoId, setAcaoId] = useState('');
  const [prazo, setPrazo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [prazoMax, setPrazoMax] = useState('');

  const navigate = useNavigate();
  const funcao = localStorage.getItem('funcao');
  const rawAtividadeId = localStorage.getItem('atividadeEdicaoId');
  const atividadeIdValida = rawAtividadeId && rawAtividadeId !== 'undefined';
  const atividadeId = atividadeIdValida ? rawAtividadeId : null;

  const fetchPilares = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/pilares', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setPilares(data);
  };

  const fetchAcoes = async (pilarIdSelecionado) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:5000/api/acoes?pilar_id=${pilarIdSelecionado}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setAcoes(data);
  };

  const fetchAtividade = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:5000/api/atividades`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const todas = await res.json();
    const encontrada = todas.find(a => a.id === parseInt(atividadeId));
    if (encontrada) {
      setPilarId(encontrada.pilar_id.toString());
      setAcaoId(encontrada.acao_id.toString());
      setPrazo(encontrada.data.split('T')[0]);
      setDescricao(encontrada.descricao);
    } else {
      alert('Atividade não encontrada');
    }
  };

  useEffect(() => {
    fetchPilares();
    if (atividadeIdValida) fetchAtividade();
  }, []);

  useEffect(() => {
    if (pilarId) {
      fetchAcoes(pilarId);
    } else {
      setAcoes([]);
    }
  }, [pilarId]);

  useEffect(() => {
    const acaoSelecionada = acoes.find(a => a.id === parseInt(acaoId));
    if (acaoSelecionada?.prazo_conclusao) {
      setPrazoMax(acaoSelecionada.prazo_conclusao.split('T')[0]);
    }
  }, [acaoId, acoes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return alert('Usuário não autenticado');

    const url = atividadeId
      ? `http://localhost:5000/api/atividades/${atividadeId}`
      : 'http://localhost:5000/api/atividades';

    const method = atividadeId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        pilar_id: pilarId,
        acao_id: acaoId,
        data: prazo,
        descricao
      })
    });

    const data = await response.json();
    if (response.ok) {
      alert(atividadeId ? 'Atividade atualizada com sucesso!' : 'Atividade cadastrada com sucesso!');
      localStorage.removeItem('atividadeEdicaoId');
      navigate('/dashboard');
    } else {
      alert(data.message || 'Erro ao salvar atividade');
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
                <button onClick={() => { localStorage.removeItem('acaoEdicaoId'); navigate('/cadastro-acoes'); }} className="block w-full text-left px-2 py-1 rounded hover:bg-yellow-100 text-sm">Cadastrar Ação</button>
                <button className="block w-full text-left px-2 py-1 rounded bg-yellow-200 text-sm">Cadastrar Atividades</button>
              </>
            )}
            <button onClick={() => navigate('/relatorios')} className="block w-full text-left px-2 py-1 rounded hover:bg-yellow-100 text-sm">Relatórios</button>
          </nav>
        </div>
      </aside>

      <main className="flex-1 bg-white p-10 text-black">
        <h1 className="text-2xl mb-6">{atividadeIdValida ? 'Editar Atividade' : 'Cadastro de Atividade'}</h1>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <select value={pilarId} onChange={(e) => setPilarId(e.target.value)} required className="w-full p-2 rounded border bg-transparent border-gray-400">
            <option value="">Selecione um Pilar</option>
            {pilares.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>

          <select value={acaoId} onChange={(e) => setAcaoId(e.target.value)} required disabled={!pilarId} className="w-full p-2 rounded border bg-transparent border-gray-400">
            <option value="">Selecione uma Ação</option>
            {acoes.map(a => <option key={a.id} value={a.id}>{a.titulo}</option>)}
          </select>

          <input type="date" value={prazo} max={prazoMax} onChange={(e) => setPrazo(e.target.value)} required className="w-full p-2 rounded border bg-transparent border-gray-400" />

          <textarea placeholder="Descrição da atividade" value={descricao} onChange={(e) => setDescricao(e.target.value)} required className="w-full p-2 rounded border bg-transparent border-gray-400" />

          <button type="submit" className="w-full bg-yellow-400 text-black font-bold py-2 rounded hover:bg-yellow-500">
            {atividadeId ? 'Salvar Alterações' : 'Cadastrar'}
          </button>
        </form>
      </main>
    </div>
  );
}




