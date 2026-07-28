import { useEffect, useState } from "react";
import api from "./api";

const eventosPadrao = [
  { data: "27/07/2026", dia: "2ª Feira", evento: "Início do 3º Bimestre" },
  { data: "03/08/2026", dia: "2ª Feira", evento: "Simulado Saresp 2º anos" },
  { data: "04/08/2026", dia: "3ª Feira", evento: "Simulado Saresp 2º anos" },
  { data: "05/08/2026", dia: "4ª Feira", evento: "Simulado Saresp 2º anos" },
  { data: "06/08/2026", dia: "5ª Feira", evento: "Simulado Saresp 2º anos" },
  { data: "07/08/2026", dia: "6ª Feira", evento: "Simulado Saresp 2º anos" },
  { data: "07/08/2026", dia: "6ª Feira", evento: "Entrega MÁXIMA de conteúdo do Simulado mensal e conteúdos essenciais." },
  { data: "18 a 21/08", dia: "3ª a 6ª Feira", evento: "Simulados SAEB (5º e 9º anos - Mat/LP e CN/CH)", obs: "Prévia" },
  { data: "19/08/2026", dia: "Quarta-feira", evento: "Simulado mensal - 6º ao 9º ano - Caderno A" },
  { data: "20/08/2026", dia: "Quinta-feira", evento: "Simulado mensal - 6º ao 9º ano - Caderno B" },
  { data: "21/08/2026", dia: "Sexta-feira", evento: "Simulado mensal - 6º ao 9º ano - Redação" },
  { data: "24 a 28/08", dia: "Seg a Sex", evento: "Período do Abraço" },
  { data: "25/08/2026", dia: "3ª Feira", evento: "5º OBMEP Mirim - 1º Fase" },
  { data: "27/08/2026", dia: "5ª Feira", evento: "Simulado substitutiva - 6º ao 9º ano." },
  { data: "28/08/2026", dia: "6ª Feira", evento: "Simulado substitutiva - 6º ao 9º ano." },
  { data: "28/08/2026", dia: "6ª Feira", evento: "Prazo final Sicoob" },
  { data: "03/09/2026", dia: "5ª Feira", evento: "5º OBMEP Mirim - 1º Fase - Prazo final para correção." },
  { data: "04/09/2026", dia: "6ª Feira", evento: "SICOOB - Prazo final para entrega na SE." },
  { data: "07/09/2026", dia: "2ª Feira", evento: "Independência do Brasil - Feriado (Evento Cívico)", obs: "Sem Aula" },
  { data: "08/09/2026", dia: "3ª Feira", evento: "Simulado SAEB 2º ano", obs: "Prévia" },
  { data: "09/09/2026", dia: "4ª Feira", evento: "Avaliação Diagnóstica Processual" },
  { data: "10/09/2026", dia: "5ª Feira", evento: "Avaliação Diagnóstica Processual" },
  { data: "14 a 18/09", dia: "2ª a 6ª Feira", evento: "Simulados SARESP Digital (Plataforma Jovens Notáveis - 2º, 5º e 9º anos)", obs: "Prévia" },
  { data: "14 a 18/09", dia: "", evento: "Avaliações Bimestrais" },
  { data: "18/09/2026", dia: "6ª Feira", evento: "Parecer descritivo - Prazo final." },
  { data: "21/09/2026", dia: "2ª Feira", evento: "Dia da Árvore" },
  { data: "24 e 25/09/2026", dia: "2ª e 3ª Feira", evento: "Avaliações Bimestrais - Substitutiva" },
  { data: "26/09/2026", dia: "Sábado", evento: "FIEB TECH das 9h às 15h" },
  { data: "28/09/2026", dia: "2ª Feira", evento: "Conselho de Classe 6º ao 9º (3º Bim)" },
  { data: "29/09/2026", dia: "3ª Feira", evento: "Conselho de Classe 1º ao 5º (3º Bim)" },
  { data: "30/09/2026", dia: "4ª Feira", evento: "Término do 3º Bimestre (48 Dias)" },
  { data: "01/10/2026", dia: "5ª Feira", evento: "Início do 4º Bimestre" },
  { data: "01/10/2026", dia: "5ª Feira", evento: "Entrega MÁXIMA de conteúdo do Simulado mensal e conteúdos essenciais." },
  { data: "07/10/2026", dia: "4ª Feira", evento: "Prova ITB" },
  { data: "08 e 09/10", dia: "5ª e 6ª Feira", evento: "Simulado SAEB Impresso (2º, 5º e 9º anos)" },
  { data: "12/10/2026", dia: "2ª Feira", evento: "Nossa Senhora Aparecida - Feriado", obs: "Sem Aula" },
  { data: "15/10/2026", dia: "5ª Feira", evento: "Dia dos Professores", obs: "Sem Aula" },
  { data: "17/10/2026", dia: "Sábado", evento: "Reunião de Pais" },
  { data: "17/10/2026", dia: "Sábado", evento: "OBMEP - 2ª Fase" },
  { data: "19/10/2026", dia: "2ª Feira", evento: "Simulado mensal - 6º ao 9º ano - Caderno A" },
  { data: "20/10/2026", dia: "3ª Feira", evento: "Simulado mensal - 6º ao 9º ano - Caderno B" },
  { data: "21/10/2026", dia: "4ª Feira", evento: "Simulado mensal - 6º ao 9º ano - Redação" },
  { data: "28/10/2026", dia: "4ª Feira", evento: "Dia do Funcionário Público - Ponto Facultativo", obs: "Sem Aula" },
  { data: "29/10/2026", dia: "5ª Feira", evento: "Simulado substitutiva - 6º ao 9º ano." },
  { data: "30/10/2026", dia: "6ª Feira", evento: "Simulado substitutiva - 6º ao 9º ano." },
  { data: "02/11/2026", dia: "2ª Feira", evento: "Finados - Feriado", obs: "Sem Aula" },
  { data: "10/11/2026", dia: "3ª Feira", evento: "OBMEP Mirim - 2ª Fase" },
  { data: "13 a 19/11", dia: "", evento: "Avaliações Bimestrais" },
  { data: "19/11/2026", dia: "6ª Feira", evento: "Parecer descritivo - Prazo final." },
  { data: "17/11/2026", dia: "3ª Feira", evento: "SARESP 2º e 5º anos (Impressa) / 9º anos (Digital)", obs: "Prévia" },
  { data: "17/11 a 04/12", dia: "Período", evento: "Fluência Leitora - SEDUC/SP (Alfabetiza Juntos)", obs: "Prévia" },
  { data: "20/11/2026", dia: "6ª Feira", evento: "Consciência Negra - Feriado", obs: "Sem Aula" },
  { data: "21/11/2026", dia: "Sábado", evento: "Nossa Senhora da Escada - Ponto Facultativo", obs: "Sem Aula" },
  { data: "25/11/2026", dia: "5ª Feira", evento: "4º Avaliação Diagnóstica Processual" },
  { data: "26/11/2026", dia: "6ª Feira", evento: "4º Avaliação Diagnóstica Processual" },
  { data: "26 e 27/11/2026", dia: "", evento: "Avaliações Bimestrais - Substitutiva" },
  { data: "03/12/2026", dia: "5ª Feira", evento: "Conselho de Classe 6º ao 9º (4º Bim)" },
  { data: "04/12/2026", dia: "6ª Feira", evento: "Conselho de Classe 1º ao 5º (4º Bim)" },
  { data: "12/12/2026", dia: "Sábado", evento: "Reunião de Pais/Responsáveis (Encerramento)" },
  { data: "14/12/2026", dia: "2ª Feira", evento: "Colação de Grau" },
  { data: "15/12/2026", dia: "3ª Feira", evento: "Divulgação Premiados OBMEP" },
  { data: "18/12/2026", dia: "6ª Feira", evento: "Término do 4º Bimestre (54 Dias)" }
];

const meses = [
  { id: "07", nome: "Julho", totalDias: 31 },
  { id: "08", nome: "Agosto", totalDias: 31 },
  { id: "09", nome: "Setembro", totalDias: 30 },
  { id: "10", nome: "Outubro", totalDias: 31 },
  { id: "11", nome: "Novembro", totalDias: 30 },
  { id: "12", nome: "Dezembro", totalDias: 31 }
];

const diasSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

function getMes(data) {
  const match = data.match(/(?:\d{2}\/)?(\d{2})(?:\/\d{4})?$/);
  return match?.[1] || "08";
}

function criarData(dia, mes, ano = 2026) {
  return new Date(Number(ano), Number(mes) - 1, Number(dia));
}

function listarPeriodo(inicio, fim) {
  const datas = [];
  const atual = new Date(inicio);

  while (atual <= fim) {
    datas.push(new Date(atual));
    atual.setDate(atual.getDate() + 1);
  }

  return datas;
}

function getDatasEvento(evento) {
  const data = evento.data;
  const dataUnica = data.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

  if (dataUnica) {
    return [criarData(dataUnica[1], dataUnica[2], dataUnica[3])];
  }

  const periodoEntreMeses = data.match(/^(\d{1,2})\/(\d{1,2})\s*a\s*(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?$/i);

  if (periodoEntreMeses) {
    const [, diaInicio, mesInicio, diaFim, mesFim, ano = 2026] = periodoEntreMeses;
    return listarPeriodo(criarData(diaInicio, mesInicio, ano), criarData(diaFim, mesFim, ano));
  }

  const periodoMesmoMes = data.match(/^(\d{1,2})\s*a\s*(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?$/i);

  if (periodoMesmoMes) {
    const [, diaInicio, diaFim, mes, ano = 2026] = periodoMesmoMes;
    return listarPeriodo(criarData(diaInicio, mes, ano), criarData(diaFim, mes, ano));
  }

  const doisDias = data.match(/^(\d{1,2})\s*e\s*(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?$/i);

  if (doisDias) {
    const [, diaUm, diaDois, mes, ano = 2026] = doisDias;
    return [criarData(diaUm, mes, ano), criarData(diaDois, mes, ano)];
  }

  return [];
}

function getMesesEvento(evento) {
  const mesesEvento = getDatasEvento(evento).map(data => String(data.getMonth() + 1).padStart(2, "0"));
  return [...new Set(mesesEvento.length ? mesesEvento : [getMes(evento.data)])];
}

function getDiasEvento(evento, mesId) {
  return getDatasEvento(evento)
    .filter(data => String(data.getMonth() + 1).padStart(2, "0") === mesId)
    .map(data => data.getDate());
}

function getTipo(evento, obs = "") {
  const texto = `${evento} ${obs}`.toLowerCase();
  if (texto.includes("feriado") || texto.includes("sem aula") || texto.includes("ponto facultativo")) return "sem-aula";
  if (texto.includes("simulado") || texto.includes("saeb") || texto.includes("saresp")) return "simulado";
  if (texto.includes("avalia")) return "avaliacao";
  if (texto.includes("conselho")) return "conselho";
  if (texto.includes("prazo") || texto.includes("entrega")) return "prazo";
  return "evento";
}

function getTipoLabel(tipo) {
  const labels = {
    simulado: "Simulado",
    avaliacao: "Avaliação",
    "sem-aula": "Sem aula",
    conselho: "Conselho",
    prazo: "Prazo",
    evento: "Evento"
  };
  return labels[tipo] || "Evento";
}

function getCalendarioMes(mes) {
  const primeiroDia = new Date(2026, Number(mes.id) - 1, 1).getDay();
  const deslocamento = primeiroDia === 0 ? 6 : primeiroDia - 1;
  const celulas = Array.from({ length: deslocamento }, () => null);

  for (let dia = 1; dia <= mes.totalDias; dia += 1) {
    celulas.push(dia);
  }

  while (celulas.length % 7 !== 0) {
    celulas.push(null);
  }

  return celulas;
}

function CalendarioEscolar() {
  const [eventos, setEventos] = useState(eventosPadrao);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    api.get("/calendario-escolar")
      .then(response => {
        if (!ativo) return;

        const dados = Array.isArray(response.data) ? response.data : [];
        setEventos(dados.length ? dados : eventosPadrao);
        setErro("");
      })
      .catch(() => {
        if (!ativo) return;
        setEventos(eventosPadrao);
        setErro("Não foi possível atualizar pela planilha agora. Mostrando a última versão salva.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  const eventosPorMes = meses.map(mes => {
    const lista = eventos.filter(evento => getMesesEvento(evento).includes(mes.id));

    return {
      ...mes,
      eventos: lista,
      eventosPorDia: lista.reduce((acc, evento) => {
        const dias = getDiasEvento(evento, mes.id);

        dias.forEach(dia => {
          acc[dia] = [...(acc[dia] || []), evento];
        });

        return acc;
      }, {})
    };
  });

  return (
    <div className="planner-page">
      <style>{css}</style>

      <header className="planner-title">
        <span>Calendário Escolar</span>
        <h1>Planner 2º Semestre 2026</h1>
        <p>{carregando ? "Atualizando pela planilha..." : "Takaoka"}</p>
      </header>

      {erro && <div className="planner-alert">{erro}</div>}

      <div className="semester-strip">
        {meses.map(mes => (
          <a key={mes.id} href={`#mes-${mes.id}`}>{mes.nome}</a>
        ))}
      </div>

      <main className="planner-stack">
        {eventosPorMes.map(mes => (
          <PlannerMes key={mes.id} mes={mes} />
        ))}
      </main>
    </div>
  );
}

function PlannerMes({ mes }) {
  const diasAgenda = Object.entries(mes.eventosPorDia)
    .map(([dia, eventos]) => ({ dia: Number(dia), eventos }))
    .sort((a, b) => a.dia - b.dia);

  return (
    <section id={`mes-${mes.id}`} className="planner-sheet">
      <div className="rings" aria-hidden="true">
        {Array.from({ length: 26 }, (_, index) => (
          <span key={index} />
        ))}
      </div>

      <div className="sheet-head">
        <div className="planner-label">Calendário Mensal</div>
        <label>
          Mês
          <strong>{mes.nome}</strong>
        </label>
        <label>
          Ano
          <strong>2026</strong>
        </label>
      </div>

      <div className="sheet-body">
        <div className="calendar-board">
          <div className="weekday-row">
            {diasSemana.map(dia => (
              <span key={dia}>{dia}</span>
            ))}
          </div>

          <div className="day-grid">
            {getCalendarioMes(mes).map((dia, index) => (
              <DiaCelula key={`${mes.id}-${index}`} dia={dia} eventos={dia ? mes.eventosPorDia[dia] || [] : []} />
            ))}
          </div>
        </div>

        <div className="mobile-agenda">
          {diasAgenda.map(({ dia, eventos }) => (
            <div key={`${mes.id}-agenda-${dia}`} className="agenda-day">
              <div className="agenda-date">
                <strong>{String(dia).padStart(2, "0")}</strong>
                <span>{mes.nome}</span>
              </div>

              <div className="agenda-events">
                {eventos.map((evento, index) => (
                  <MiniEvento key={`${evento.evento}-${index}`} evento={evento} />
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

function DiaCelula({ dia, eventos }) {
  return (
    <div className={`day-cell ${!dia ? "empty" : ""}`}>
      {dia && <span className="day-number">{dia}</span>}
      <div className="day-events">
        {eventos.slice(0, 3).map((evento, index) => (
          <MiniEvento key={`${evento.evento}-${index}`} evento={evento} compact />
        ))}
        {eventos.length > 3 && <span className="more-events">+{eventos.length - 3}</span>}
      </div>
    </div>
  );
}

function MiniEvento({ evento, compact = false }) {
  const tipo = getTipo(evento.evento, evento.obs);

  return (
    <div className={`mini-event ${tipo} ${compact ? "compact" : ""}`}>
      <span className="event-date">{evento.data}</span>
      <span className="event-name">{compact ? evento.evento.replace(" - 6º ao 9º ano", "") : evento.evento}</span>
      {!compact && <span className="event-kind">{getTipoLabel(tipo)}</span>}
      {evento.obs && (
        <span className="obs-tip" data-tooltip={evento.obs} tabIndex={0}>
          Obs
        </span>
      )}
    </div>
  );
}

const css = `
  .planner-page {
    min-height: 100%;
    padding: 18px 18px 36px;
    color: #2f3440;
    background-color: #f7fbff;
    background-image:
      linear-gradient(#d8eef2 1px, transparent 1px),
      linear-gradient(90deg, #d8eef2 1px, transparent 1px);
    background-size: 24px 24px;
  }

  .planner-title {
    text-align: center;
    margin: 4px auto 16px;
  }

  .planner-title span {
    display: block;
    color: #7e8da6;
    font-size: 13px;
    font-weight: 800;
    text-transform: uppercase;
  }

  .planner-title h1 {
    margin: 2px 0 0;
    color: #242736;
    font-family: "Comic Sans MS", "Segoe Print", cursive;
    font-size: 40px;
    font-weight: 700;
    line-height: 1.1;
  }

  .planner-title p {
    margin: 2px 0 0;
    color: #4a5264;
    font-size: 14px;
    font-weight: 800;
    text-transform: uppercase;
  }

  .semester-strip {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px;
    margin: 0 auto 18px;
  }

  .semester-strip a {
    color: #3d5369;
    background: #fff7bd;
    border: 1px solid #f0d982;
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 13px;
    font-weight: 800;
    text-decoration: none;
    box-shadow: 0 2px 0 #efb6ca;
  }

  .planner-stack {
    display: grid;
    gap: 28px;
    max-width: 1160px;
    margin: 0 auto;
  }

  .planner-sheet {
    position: relative;
    padding: 32px 16px 16px;
    border: 8px solid #f59abd;
    border-radius: 8px;
    background: #fffdfd;
    box-shadow: 0 12px 22px rgba(172, 92, 123, 0.22);
  }

  .planner-sheet::before {
    content: "";
    position: absolute;
    inset: 10px;
    border: 2px solid #fbd1df;
    border-radius: 4px;
    pointer-events: none;
  }

  .rings {
    position: absolute;
    left: 22px;
    right: 22px;
    top: -19px;
    display: flex;
    justify-content: space-between;
    pointer-events: none;
  }

  .rings span {
    width: 12px;
    height: 30px;
    border: 3px solid #b8c4d6;
    border-bottom: 0;
    border-radius: 8px 8px 0 0;
    background: linear-gradient(#eef4fb, #c8d3e2);
  }

  .sheet-head {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: minmax(190px, 1fr) minmax(160px, 0.6fr) minmax(110px, 0.35fr);
    gap: 10px;
    margin-bottom: 10px;
  }

  .planner-label,
  .sheet-head label {
    min-height: 38px;
    border: 2px solid #a2dce2;
    border-radius: 8px;
    background: #fff0f7;
    padding: 8px 12px;
    color: #3c4a58;
    font-size: 13px;
    font-weight: 800;
  }

  .planner-label {
    font-family: "Comic Sans MS", "Segoe Print", cursive;
    font-size: 17px;
  }

  .sheet-head strong {
    display: block;
    color: #1f2937;
    font-size: 16px;
  }

  .sheet-body {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 220px;
    gap: 12px;
  }

  .calendar-board {
    border: 2px solid #b9e1e6;
    border-radius: 8px;
    overflow: hidden;
    background: white;
  }

  .weekday-row,
  .day-grid {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
  }

  .weekday-row span {
    min-height: 32px;
    display: grid;
    place-items: center;
    color: #49566b;
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    border-right: 1px solid #e8c9d5;
  }

  .weekday-row span:nth-child(1) { background: #bfeef2; }
  .weekday-row span:nth-child(2) { background: #ffe5a4; }
  .weekday-row span:nth-child(3) { background: #ffc3dc; }
  .weekday-row span:nth-child(4) { background: #bfedf2; }
  .weekday-row span:nth-child(5) { background: #ffe7a8; }
  .weekday-row span:nth-child(6) { background: #ffc1d7; }
  .weekday-row span:nth-child(7) { background: #c6eef0; border-right: 0; }

  .day-cell {
    position: relative;
    min-height: 116px;
    padding: 20px 5px 6px;
    border-top: 1px solid #e3e8ee;
    border-right: 1px solid #e3e8ee;
    background:
      linear-gradient(90deg, transparent 18px, rgba(247, 182, 205, 0.3) 19px, transparent 20px),
      white;
  }

  .day-cell:nth-child(7n) {
    border-right: 0;
  }

  .day-cell.empty {
    background: #fafafa;
  }

  .day-number {
    position: absolute;
    top: 5px;
    left: 7px;
    color: #6b7280;
    font-size: 12px;
    font-weight: 900;
  }

  .day-events {
    display: grid;
    gap: 4px;
  }

  .mini-event {
    position: relative;
    display: grid;
    gap: 3px;
    padding: 7px;
    border: 1px solid #e7d7df;
    border-left: 5px solid #9fb2c8;
    border-radius: 7px;
    background: #ffffff;
    color: #384252;
    font-size: 12px;
    box-shadow: 0 2px 0 rgba(227, 168, 191, 0.22);
  }

  .mini-event.compact {
    padding: 5px;
    border-left-width: 4px;
    font-size: 10px;
  }

  .mini-event.simulado { border-left-color: #74c7d5; background: #f0fbfd; }
  .mini-event.avaliacao { border-left-color: #f090b8; background: #fff4f8; }
  .mini-event.sem-aula { border-left-color: #f4b45c; background: #fff8e8; }
  .mini-event.conselho { border-left-color: #8fcf9b; background: #f3fff5; }
  .mini-event.prazo { border-left-color: #d6b84d; background: #fffbe8; }

  .event-date {
    color: #6b7280;
    font-size: 10px;
    font-weight: 900;
  }

  .event-name {
    color: #2f3440;
    font-weight: 800;
    line-height: 1.2;
  }

  .event-kind {
    width: max-content;
    max-width: 100%;
    padding: 2px 7px;
    border-radius: 999px;
    background: #f5ecff;
    color: #695275;
    font-size: 10px;
    font-weight: 900;
  }

  .more-events {
    width: max-content;
    border-radius: 999px;
    background: #eff6ff;
    color: #315b84;
    padding: 2px 7px;
    font-size: 10px;
    font-weight: 900;
  }

  .empty-note {
    margin: 0;
    color: #667085;
    font-size: 12px;
    font-weight: 700;
  }

  .obs-tip {
    position: relative;
    justify-self: start;
    padding: 3px 8px;
    border: 1px solid #d783a3;
    border-radius: 999px;
    background: #fff;
    color: #9a4264;
    font-size: 10px;
    font-weight: 900;
    cursor: help;
    outline: none;
  }

  .obs-tip::after {
    content: attr(data-tooltip);
    position: absolute;
    right: 0;
    top: calc(100% + 7px);
    width: max-content;
    max-width: 230px;
    padding: 8px 10px;
    border: 1px solid #f0c0d0;
    border-radius: 8px;
    background: #fffdfd;
    color: #384252;
    font-size: 12px;
    line-height: 1.3;
    box-shadow: 0 10px 24px rgba(93, 59, 75, 0.2);
    opacity: 0;
    pointer-events: none;
    transform: translateY(-3px);
    transition: 140ms ease;
    z-index: 20;
  }

  .obs-tip:hover::after,
  .obs-tip:focus::after {
    opacity: 1;
    transform: translateY(0);
  }

  @media (max-width: 980px) {
    .sheet-body {
      grid-template-columns: 1fr;
    }

  }

  @media (max-width: 720px) {
    .planner-page {
      padding: 12px 8px 28px;
    }

    .planner-title h1 {
      font-size: 30px;
    }

    .planner-sheet {
      padding: 28px 8px 10px;
      border-width: 5px;
      overflow-x: auto;
    }

    .rings {
      left: 12px;
      right: 12px;
    }

    .rings span {
      width: 8px;
      height: 24px;
      border-width: 2px;
    }

    .sheet-head,
    .sheet-body {
      min-width: 760px;
    }

    .day-cell {
      min-height: 104px;
    }

  }

  .planner-page {
    padding: 24px;
    color: #111827;
    background: #f3f6fa;
    background-image: none;
  }

  .planner-title {
    max-width: 1180px;
    margin: 0 auto 18px;
    padding: 24px 28px;
    border: 1px solid #d8dee8;
    border-radius: 8px;
    background: #ffffff;
    text-align: left;
    box-shadow: 0 10px 28px rgba(15, 23, 42, 0.08);
  }

  .planner-title span {
    color: #2563eb;
    letter-spacing: 0;
  }

  .planner-title h1 {
    color: #111827;
    font-family: Arial, "Segoe UI", sans-serif;
    font-size: 32px;
  }

  .planner-title p {
    color: #64748b;
    letter-spacing: 0;
  }

  .semester-strip {
    max-width: 1180px;
    justify-content: flex-start;
  }

  .planner-alert {
    max-width: 1180px;
    margin: 0 auto 12px;
    padding: 10px 12px;
    border: 1px solid #f59e0b;
    border-radius: 8px;
    background: #fffbeb;
    color: #92400e;
    font-size: 13px;
  }

  .semester-strip a {
    border: 1px solid #d8dee8;
    background: #ffffff;
    color: #334155;
    box-shadow: none;
  }

  .planner-stack {
    max-width: 1180px;
  }

  .planner-sheet {
    padding: 0;
    border: 1px solid #d8dee8;
    background: #ffffff;
    box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06);
  }

  .planner-sheet::before,
  .rings {
    display: none;
  }

  .sheet-head {
    grid-template-columns: minmax(0, 1fr) 160px 100px;
    gap: 12px;
    margin: 0;
    padding: 18px 20px;
    border-bottom: 1px solid #e2e8f0;
    background: #f8fafc;
  }

  .planner-label,
  .sheet-head label {
    min-height: auto;
    border: 0;
    border-radius: 0;
    background: transparent;
    padding: 0;
    color: #64748b;
    font-family: Arial, "Segoe UI", sans-serif;
    font-size: 12px;
    text-transform: uppercase;
  }

  .planner-label {
    color: #0f172a;
    font-size: 22px;
    text-transform: none;
  }

  .sheet-head strong {
    color: #0f172a;
  }

  .sheet-body {
    padding: 18px;
    grid-template-columns: minmax(0, 1fr);
  }

  .calendar-board {
    border-color: #d8dee8;
  }

  .weekday-row span {
    background: #eaf0f8 !important;
    border-color: #d8dee8;
    color: #334155;
  }

  .day-cell {
    border-color: #e2e8f0;
    background: #ffffff;
  }

  .day-cell.empty {
    background: #f8fafc;
  }

  .mini-event {
    border-color: #e2e8f0;
    box-shadow: none;
  }

  .obs-tip {
    border-color: #cbd5e1;
    background: #0f172a;
    color: #ffffff;
  }

  .planner-page {
    background: #f5f7fb;
  }

  .planner-title {
    position: relative;
    overflow: hidden;
    border: 0;
    background: linear-gradient(135deg, #ffffff 0%, #eef7ff 48%, #fff7ed 100%);
    box-shadow: 0 18px 36px rgba(15, 23, 42, 0.12);
  }

  .planner-title::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    width: 8px;
    height: 100%;
    background: linear-gradient(#2563eb, #14b8a6, #f59e0b);
  }

  .planner-title span {
    color: #0f766e;
  }

  .planner-title h1 {
    color: #0f172a;
    font-size: 36px;
  }

  .semester-strip a {
    border: 0;
    background: #ffffff;
    color: #1f2937;
    box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
    transition: transform 140ms ease, box-shadow 140ms ease, background 140ms ease;
  }

  .semester-strip a:nth-child(1) { border-top: 4px solid #2563eb; }
  .semester-strip a:nth-child(2) { border-top: 4px solid #0f766e; }
  .semester-strip a:nth-child(3) { border-top: 4px solid #f59e0b; }
  .semester-strip a:nth-child(4) { border-top: 4px solid #db2777; }
  .semester-strip a:nth-child(5) { border-top: 4px solid #7c3aed; }
  .semester-strip a:nth-child(6) { border-top: 4px solid #dc2626; }

  .semester-strip a:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
    background: #f8fafc;
  }

  .planner-sheet {
    border: 0;
    box-shadow: 0 16px 34px rgba(15, 23, 42, 0.10);
  }

  .planner-sheet:nth-child(1) .sheet-head { background: linear-gradient(135deg, #eff6ff, #dbeafe); }
  .planner-sheet:nth-child(2) .sheet-head { background: linear-gradient(135deg, #f0fdfa, #ccfbf1); }
  .planner-sheet:nth-child(3) .sheet-head { background: linear-gradient(135deg, #fffbeb, #fef3c7); }
  .planner-sheet:nth-child(4) .sheet-head { background: linear-gradient(135deg, #fdf2f8, #fce7f3); }
  .planner-sheet:nth-child(5) .sheet-head { background: linear-gradient(135deg, #f5f3ff, #ede9fe); }
  .planner-sheet:nth-child(6) .sheet-head { background: linear-gradient(135deg, #fff1f2, #ffe4e6); }

  .planner-label {
    font-size: 24px;
    font-weight: 900;
  }

  .planner-sheet:nth-child(1) .planner-label { color: #1d4ed8; }
  .planner-sheet:nth-child(2) .planner-label { color: #0f766e; }
  .planner-sheet:nth-child(3) .planner-label { color: #b45309; }
  .planner-sheet:nth-child(4) .planner-label { color: #be185d; }
  .planner-sheet:nth-child(5) .planner-label { color: #6d28d9; }
  .planner-sheet:nth-child(6) .planner-label { color: #b91c1c; }

  .calendar-board {
    border: 1px solid #cbd5e1;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
  }

  .mobile-agenda {
    display: none;
  }

  .weekday-row span {
    min-height: 38px;
    color: #0f172a;
    border-color: rgba(255, 255, 255, 0.64);
  }

  .weekday-row span:nth-child(1) { background: #bfdbfe !important; }
  .weekday-row span:nth-child(2) { background: #99f6e4 !important; }
  .weekday-row span:nth-child(3) { background: #fde68a !important; }
  .weekday-row span:nth-child(4) { background: #fbcfe8 !important; }
  .weekday-row span:nth-child(5) { background: #ddd6fe !important; }
  .weekday-row span:nth-child(6) { background: #fecaca !important; }
  .weekday-row span:nth-child(7) { background: #bae6fd !important; }

  .day-cell {
    min-height: 132px;
    background: #ffffff;
    transition: background 140ms ease;
  }

  .day-cell:hover {
    background: #f8fafc;
  }

  .day-number {
    display: inline-grid;
    place-items: center;
    width: 24px;
    height: 24px;
    border-radius: 999px;
    background: #eef2ff;
    color: #334155;
  }

  .mini-event {
    border: 0;
    border-left: 5px solid #64748b;
    box-shadow: 0 6px 14px rgba(15, 23, 42, 0.08);
  }

  .mini-event.compact {
    padding: 7px;
  }

  .mini-event.simulado {
    border-left-color: #2563eb;
    background: #dbeafe;
  }

  .mini-event.avaliacao {
    border-left-color: #7c3aed;
    background: #ede9fe;
  }

  .mini-event.sem-aula {
    border-left-color: #dc2626;
    background: #fee2e2;
  }

  .mini-event.conselho {
    border-left-color: #0f766e;
    background: #ccfbf1;
  }

  .mini-event.prazo {
    border-left-color: #ca8a04;
    background: #fef3c7;
  }

  .event-name {
    color: #111827;
  }

  .event-date {
    color: #475569;
  }

  .obs-tip {
    background: #ffffff;
    color: #1e293b;
    box-shadow: 0 1px 0 rgba(15, 23, 42, 0.08);
  }

  @media (max-width: 760px) {
    .planner-page {
      padding: 12px;
    }

    .planner-title {
      margin-bottom: 12px;
      padding: 18px 16px 18px 22px;
    }

    .planner-title h1 {
      font-size: 26px;
      line-height: 1.12;
    }

    .planner-title p {
      font-size: 13px;
    }

    .semester-strip {
      display: flex;
      flex-wrap: nowrap;
      gap: 8px;
      overflow-x: auto;
      padding: 2px 2px 12px;
      margin-bottom: 12px;
      scroll-snap-type: x proximity;
    }

    .semester-strip a {
      flex: 0 0 auto;
      min-width: 94px;
      text-align: center;
      scroll-snap-align: start;
    }

    .planner-stack {
      gap: 18px;
    }

    .planner-sheet {
      overflow: hidden;
      border-radius: 8px;
    }

    .sheet-head {
      grid-template-columns: 1fr;
      gap: 8px;
      padding: 14px;
    }

    .planner-label {
      font-size: 20px;
    }

    .sheet-head label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 8px;
      border-top: 1px solid rgba(15, 23, 42, 0.08);
    }

    .sheet-body {
      display: block;
      min-width: 0;
      padding: 10px;
      overflow-x: visible;
    }

    .calendar-board {
      display: none;
    }

    .mobile-agenda {
      display: grid;
      gap: 10px;
    }

    .agenda-day {
      display: grid;
      grid-template-columns: 64px minmax(0, 1fr);
      gap: 10px;
      align-items: start;
      padding: 10px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: #ffffff;
      box-shadow: 0 8px 18px rgba(15, 23, 42, 0.06);
    }

    .agenda-date {
      display: grid;
      place-items: center;
      min-height: 58px;
      border-radius: 8px;
      background: #eef2ff;
      color: #334155;
    }

    .agenda-date strong {
      font-size: 22px;
      line-height: 1;
      font-weight: 600;
    }

    .agenda-date span {
      font-size: 10px;
      text-transform: uppercase;
    }

    .agenda-events {
      display: grid;
      gap: 8px;
      min-width: 0;
    }

    .agenda-events .mini-event {
      padding: 9px;
    }

    .agenda-events .event-name {
      font-size: 13px;
    }

    .agenda-events .event-date {
      font-size: 10px;
    }
  }

  .planner-title h1 {
    font-weight: 600;
  }

  .planner-title span,
  .planner-title p,
  .semester-strip a,
  .weekday-row span,
  .planner-label,
  .sheet-head label,
  .sheet-head strong,
  .day-number,
  .event-date,
  .event-name,
  .event-kind,
  .more-events,
  .obs-tip {
    font-weight: 500;
  }

  .event-name {
    line-height: 1.25;
  }
`;

export default CalendarioEscolar;
