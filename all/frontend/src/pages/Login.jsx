import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, senha })
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('funcao', data.usuario.funcao);
        alert('Login realizado com sucesso!');
        navigate('/dashboard');
      } else {
        alert(data.message || 'Erro ao fazer login');
      }
    } catch (error) {
      alert('Erro na requisição de login');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B4C94]">
      <div className="bg-[#002F6C] p-10 rounded-lg w-full max-w-sm shadow-md text-white">
        <h1 className="text-3xl font-mono mb-6 text-center">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <button
            type="submit"
            className="w-full bg-yellow-400 text-black py-2 font-bold rounded hover:bg-yellow-500 transition"
          >
            Entrar
          </button>
        </form>
        <p className="text-center mt-4 text-sm">
          ou{' '}
          <span
            onClick={() => navigate('/cadastro')}
            className="text-white font-bold cursor-pointer underline"
          >
            cadastre-se
          </span>
        </p>
      </div>
    </div>
  );
}

