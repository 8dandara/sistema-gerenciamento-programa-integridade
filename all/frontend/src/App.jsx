import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CadastroPilar from './pages/CadastroPilar';
import CadastroAcoes from './pages/CadastroAcoes';
import CadastroAtividades from './pages/CadastroAtividades';
import Relatorios from './pages/Relatorios';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cadastro-pilar" element={<CadastroPilar />} />
        <Route path="/cadastro-acoes" element={<CadastroAcoes />} />
        <Route path="/cadastro-atividades" element={<CadastroAtividades />} />
        <Route path="/relatorios" element={<Relatorios />} />
      </Routes>
    </BrowserRouter>
  );
}

