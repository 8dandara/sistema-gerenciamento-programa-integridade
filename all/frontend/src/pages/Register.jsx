import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [funcao, setFuncao] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/auth/cadastrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha, funcao })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Cadastro realizado com sucesso!');
        navigate('/'); // vai para login
      } else {
        alert(data.message || 'Erro ao cadastrar usuário');
      }
    } catch (error) {
      console.error(error);
      alert('Erro na requisição de cadastro');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B4C94]">
      <div className="bg-[#002F6C] p-10 rounded-lg w-full max-w-sm shadow-md text-white">
        <h1 className="text-3xl font-mono mb-6 text-center">Cadastro</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nome"
            className="w-full p-2 rounded border border-white bg-transparent text-white placeholder-white focus:outline-none"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 rounded border border-white bg-transparent text-white placeholder-white focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            className="w-full p-2 rounded border border-white bg-transparent text-white placeholder-white focus:outline-none"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
          <select
  className="w-full p-2 rounded border border-white bg-transparent text-white"
  value={funcao}
  onChange={(e) => setFuncao(e.target.value)}
  required
>
  <option value="">Selecione uma função</option>
  <option value="analista">Analista</option>
  <option value="coordenador">Coordenador</option>
  <option value="gestor">Gestor</option>
</select>

          <button
            type="submit"
            className="w-full bg-yellow-400 text-black py-2 font-bold rounded hover:bg-yellow-500 transition"
          >
            Cadastrar
          </button>
        </form>
        <p className="text-center mt-4 text-sm">
          ou{' '}
          <span
            onClick={() => navigate('/')}
            className="text-white font-bold cursor-pointer underline"
          >
            login
          </span>
        </p>
      </div>
    </div>
  );
}
