import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function Relatorios() {
  const [relatorio, setRelatorio] = useState([]);
  const navigate = useNavigate();
  const funcao = localStorage.getItem('funcao');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return alert('Usuário não autenticado');

    fetch('http://localhost:5000/api/relatorios', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setRelatorio(data))
      .catch(err => {
        console.error(err);
        alert('Erro ao buscar relatório');
      });
  }, []);

  const excluirAcao = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta ação?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/acoes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Ação excluída com sucesso!');
        setRelatorio(relatorio.filter(r => r.id !== id));
      } else {
        const erro = await res.json();
        alert(erro.message || 'Erro ao excluir ação');
      }
    } catch (error) {
      console.error(error);
      alert('Erro de conexão');
    }
  };

  const excluirAtividade = async (id) => {
    if (!window.confirm('Deseja realmente excluir esta atividade?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/atividades/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Atividade excluída!');
        window.location.reload();
      } else {
        const erro = await res.json();
        alert(erro.message || 'Erro ao excluir atividade');
      }
    } catch (error) {
      console.error(error);
      alert('Erro de conexão');
    }
  };

  const exportarPDF = (pilar) => {
    const doc = new jsPDF();
    doc.text(`Relatório do Pilar: ${pilar.nome_pilar}`, 10, 10);
    const rows = [];
    pilar.acoes.forEach((acao) => {
      rows.push([acao.titulo_acao, acao.situacao, acao.nome_responsavel, new Date(acao.prazo_acao).toLocaleDateString()]);
      acao.atividades.forEach((at) => {
        rows.push([`- ${at.descricao}`, '', '', new Date(at.prazo).toLocaleDateString()]);
      });
    });
    autoTable(doc, {
      head: [['Ação/Atividade', 'Situação', 'Responsável', 'Prazo']],
      body: rows,
      startY: 20
    });
    doc.save(`${pilar.nome_pilar}_relatorio.pdf`);
  };

  const exportarExcel = (pilar) => {
    const wsData = [['Ação/Atividade', 'Situação', 'Responsável', 'Prazo']];
    pilar.acoes.forEach((acao) => {
      wsData.push([
        acao.titulo_acao,
        acao.situacao,
        acao.nome_responsavel,
        new Date(acao.prazo_acao).toLocaleDateString()
      ]);
      acao.atividades.forEach((at) => {
        wsData.push([
          `- ${at.descricao}`,
          '',
          '',
          new Date(at.prazo).toLocaleDateString()
        ]);
      });
    });
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório');
    XLSX.writeFile(wb, `${pilar.nome_pilar}_relatorio.xlsx`);
  };

  const exportarWord = (pilar) => {
    let conteudo = `Relatório do Pilar: ${pilar.nome_pilar}\n\n`;
    pilar.acoes.forEach((acao) => {
      conteudo += `Ação: ${acao.titulo_acao}\nSituação: ${acao.situacao}\nResponsável: ${acao.nome_responsavel}\nPrazo: ${new Date(acao.prazo_acao).toLocaleDateString()}\n`;
      acao.atividades.forEach((at) => {
        conteudo += `  - Atividade: ${at.descricao} (Prazo: ${new Date(at.prazo).toLocaleDateString()})\n`;
      });
      conteudo += `\n`;
    });
    const blob = new Blob([conteudo], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pilar.nome_pilar}_relatorio.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const agrupado = relatorio.reduce((acc, item) => {
    const pilar = acc.find(p => p.pilar_id === item.pilar_id);
    if (!pilar) {
      acc.push({
        pilar_id: item.pilar_id,
        nome_pilar: item.nome_pilar,
        acoes: [{
          id: item.acao_id,
          titulo_acao: item.titulo_acao,
          situacao: item.situacao,
          nome_responsavel: item.nome_responsavel,
          prazo_acao: item.prazo_acao,
          atividades: item.descricao_atividade ? [{
            id: item.atividade_id,
            descricao: item.descricao_atividade,
            prazo: item.prazo_atividade
          }] : []
        }]
      });
    } else {
      const acao = pilar.acoes.find(a => a.titulo_acao === item.titulo_acao);
      if (!acao) {
        pilar.acoes.push({
          id: item.acao_id,
          titulo_acao: item.titulo_acao,
          situacao: item.situacao,
          nome_responsavel: item.nome_responsavel,
          prazo_acao: item.prazo_acao,
          atividades: item.descricao_atividade ? [{
            id: item.atividade_id,
            descricao: item.descricao_atividade,
            prazo: item.prazo_atividade
          }] : []
        });
      } else if (item.descricao_atividade) {
        acao.atividades.push({
          id: item.atividade_id,
          descricao: item.descricao_atividade,
          prazo: item.prazo_atividade
        });
      }
    }
    return acc;
  }, []);

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
                <button onClick={() => navigate('/cadastro-atividades')} className="block w-full text-left px-2 py-1 rounded hover:bg-yellow-100 text-sm">Cadastrar Atividades</button>
              </>
            )}
            <button className="block w-full text-left px-2 py-1 rounded bg-yellow-200 text-sm">Relatórios</button>
          </nav>
        </div>
        
      </aside>

      <main className="flex-1 bg-white p-8">
        <h1 className="text-2xl font-bold text-blue-900 mb-6">Relatório</h1>

        {agrupado.map((pilar, index) => (
          <div key={index} className="mb-6 border border-gray-300 p-4 rounded shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Pilar: {pilar.nome_pilar}</h2>

            {funcao === 'Gestor' && (
              <div className="mb-2 space-x-2">
                <button onClick={() => exportarPDF(pilar)} className="text-sm px-3 py-1 bg-red-500 text-white rounded">Exportar PDF</button>
                <button onClick={() => exportarWord(pilar)} className="text-sm px-3 py-1 bg-blue-500 text-white rounded">Exportar Word</button>
                <button onClick={() => exportarExcel(pilar)} className="text-sm px-3 py-1 bg-green-500 text-white rounded">Exportar Excel</button>
              </div>
            )}

            {pilar.acoes.map((acao, i) => (
              <div key={i} className="mb-4 ml-4">
                <p className="font-semibold text-gray-700">Ação: {acao.titulo_acao}</p>
                <p className="text-sm text-gray-600">Situação: {acao.situacao}</p>
                <p>Responsável: {acao.nome_responsavel}</p>
                <p>Prazo: {new Date(acao.prazo_acao).toLocaleDateString()}</p>

                {(funcao === 'Analista' || funcao === 'Coordenador') && (
                  <div className="mt-1 space-x-2">
                    <button className="text-blue-600 hover:underline text-sm" onClick={() => {
                      if (!acao.id) return alert('Erro: Ação sem ID');
                      localStorage.setItem('acaoEdicaoId', acao.id.toString());
                      navigate('/cadastro-acoes');
                    }}>Editar Ação</button>
                    <button className="text-red-600 hover:underline text-sm" onClick={() => excluirAcao(acao.id)}>Excluir Ação</button>
                  </div>
                )}

                {acao.atividades.length > 0 && (
                  <ul className="list-disc ml-6 mt-2">
                    {acao.atividades.map((atividade, idx) => (
                      <li key={idx} className="mb-1">
                        <span className="font-medium">Atividade:</span> {atividade.descricao} |{" "}
                        <span className="text-sm text-gray-600">Prazo: {new Date(atividade.prazo).toLocaleDateString()}</span>
                        {(funcao === 'Analista' || funcao === 'Coordenador') && (
                          <div className="space-x-2">
                            <button className="text-blue-600 hover:underline text-sm" onClick={() => {
                              localStorage.setItem('atividadeEdicaoId', atividade.id);
                              navigate('/cadastro-atividades');
                            }}>Editar</button>
                            <button className="text-red-600 hover:underline text-sm" onClick={() => excluirAtividade(atividade.id)}>Excluir</button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ))}
      </main>
    </div>
  );
}

