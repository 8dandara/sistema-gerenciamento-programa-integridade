import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';



export default function CadastroPilar() {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [prazo, setPrazo] = useState('');
  const navigate = useNavigate();
  const funcao = localStorage.getItem('funcao');

  useEffect(() => {
    const pilarId = localStorage.getItem('pilarEdicaoId');
    if (pilarId) {
      const token = localStorage.getItem('token');
      fetch(`http://localhost:5000/api/pilares`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          const pilar = data.find(p => p.id === parseInt(pilarId));
          if (pilar) {
            setNome(pilar.nome);
            setDescricao(pilar.descricao);
            if (pilar.prazo) setPrazo(pilar.prazo.split('T')[0]);
          }
        });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Usuário não autenticado');
      return;
    }

    const pilarId = localStorage.getItem('pilarEdicaoId');
    const url = pilarId
      ? `http://localhost:5000/api/pilares/${pilarId}`
      : 'http://localhost:5000/api/pilares';
    const method = pilarId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ nome, descricao, prazo })
    });

    const data = await response.json();
    if (response.ok) {
      alert(pilarId ? 'Pilar atualizado com sucesso!' : 'Pilar cadastrado com sucesso!');
      localStorage.removeItem('pilarEdicaoId');
      navigate('/dashboard');
    } else {
      alert(data.message || 'Erro ao cadastrar pilar');
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
                <button className="block w-full text-left px-2 py-1 rounded bg-yellow-200 text-sm">Cadastrar Pilar</button>
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
      </aside>

      <main className="flex-1 bg-white p-10 text-black">
        <h1 className="text-2xl mb-6">Cadastro de Pilar</h1>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <input
            type="text"
            placeholder="Nome do Pilar"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className="w-full p-2 rounded border bg-transparent border-gray-400"
          />

          <textarea
            placeholder="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            required
            className="w-full p-2 rounded border bg-transparent border-gray-400"
          />

          <input
            type="date"
            value={prazo}
            onChange={(e) => setPrazo(e.target.value)}
            required
            className="w-full p-2 rounded border bg-transparent border-gray-400"
          />

          <button
            type="submit"
            className="w-full bg-yellow-400 text-black font-bold py-2 rounded hover:bg-yellow-500"
          >
            {localStorage.getItem('pilarEdicaoId') ? 'Atualizar' : 'Cadastrar'}
          </button>
        </form>
      </main>
    </div>
  );
}


