const eventos = [
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
  { id: "07", nome: "Julho" },
  { id: "08", nome: "Agosto" },
  { id: "09", nome: "Setembro" },
  { id: "10", nome: "Outubro" },
  { id: "11", nome: "Novembro" },
  { id: "12", nome: "Dezembro" }
];

function getMes(data) {
  const match = data.match(/(?:\d{2}\/)?(\d{2})(?:\/\d{4})?$/);
  return match?.[1] || "08";
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

function CalendarioEscolar() {
  const eventosPorMes = meses.map(mes => ({
    ...mes,
    eventos: eventos.filter(evento => getMes(evento.data) === mes.id)
  }));

  const resumo = [
    { label: "Eventos", value: eventos.length },
    { label: "Sem aula", value: eventos.filter(e => getTipo(e.evento, e.obs) === "sem-aula").length },
    { label: "Avaliações", value: eventos.filter(e => ["simulado", "avaliacao"].includes(getTipo(e.evento, e.obs))).length },
    { label: "Com observação", value: eventos.filter(e => e.obs).length }
  ];

  return (
    <div style={styles.page}>
      <style>{css}</style>

      <section style={styles.hero}>
        <div>
          <span style={styles.kicker}>Calendário Escolar</span>
          <h1 style={styles.title}>2º Semestre de 2026</h1>
          <p style={styles.subtitle}>
            Cronograma oficial organizado por mês, com observações disponíveis ao passar o mouse.
          </p>
        </div>

        <div style={styles.summaryGrid}>
          {resumo.map(item => (
            <div key={item.label} style={styles.summaryItem}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <div style={styles.legend}>
        <Legenda tipo="simulado" label="Simulados" />
        <Legenda tipo="avaliacao" label="Avaliações" />
        <Legenda tipo="sem-aula" label="Sem aula" />
        <Legenda tipo="conselho" label="Conselhos" />
        <Legenda tipo="prazo" label="Prazos" />
        <Legenda tipo="evento" label="Eventos" />
      </div>

      <main style={styles.monthGrid}>
        {eventosPorMes.map(mes => (
          <section key={mes.id} style={styles.monthSection}>
            <div style={styles.monthHeader}>
              <h2>{mes.nome}</h2>
              <span>{mes.eventos.length} item(ns)</span>
            </div>

            <div style={styles.timeline}>
              {mes.eventos.map((evento, index) => (
                <EventoCard key={`${evento.data}-${evento.evento}-${index}`} evento={evento} />
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}

function Legenda({ tipo, label }) {
  return (
    <span style={styles.legendItem}>
      <i className={`dot ${tipo}`} />
      {label}
    </span>
  );
}

function EventoCard({ evento }) {
  const tipo = getTipo(evento.evento, evento.obs);

  return (
    <article className={`event-card ${tipo}`}>
      <div style={styles.dateBlock}>
        <strong>{evento.data}</strong>
        <span>{evento.dia || "Período"}</span>
      </div>

      <div style={styles.eventBody}>
        <div style={styles.eventTop}>
          <span className={`pill ${tipo}`}>{getTipoLabel(tipo)}</span>
          {evento.obs && (
            <span className="obs-tip" data-tooltip={evento.obs} tabIndex={0}>
              Obs
            </span>
          )}
        </div>
        <h3>{evento.evento}</h3>
      </div>
    </article>
  );
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

const styles = {
  page: { minHeight: "100%", color: "#0f172a" },
  hero: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.4fr) minmax(280px, 0.8fr)",
    gap: "24px",
    alignItems: "end",
    padding: "28px",
    borderRadius: "8px",
    background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #155e75 100%)",
    color: "white",
    boxShadow: "0 18px 40px rgba(15, 23, 42, 0.18)"
  },
  kicker: {
    display: "inline-block",
    marginBottom: "10px",
    fontSize: "13px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#bae6fd"
  },
  title: { margin: 0, fontSize: "34px", lineHeight: 1.1 },
  subtitle: { margin: "12px 0 0", maxWidth: "720px", color: "#dbeafe", fontSize: "15px" },
  summaryGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px" },
  summaryItem: {
    padding: "14px",
    borderRadius: "8px",
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.16)"
  },
  legend: { display: "flex", flexWrap: "wrap", gap: "10px", margin: "22px 0" },
  legendItem: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 11px",
    borderRadius: "8px",
    background: "white",
    border: "1px solid #e2e8f0",
    fontSize: "13px",
    fontWeight: 700
  },
  monthGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))", gap: "18px" },
  monthSection: {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    overflow: "visible",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.07)"
  },
  monthHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 18px",
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0"
  },
  timeline: { display: "grid", gap: "10px", padding: "14px" },
  dateBlock: { display: "grid", gap: "4px", alignContent: "start", minWidth: "104px" },
  eventBody: { minWidth: 0 },
  eventTop: { display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", marginBottom: "6px" }
};

const css = `
  .event-card {
    display: grid;
    grid-template-columns: 112px minmax(0, 1fr);
    gap: 12px;
    padding: 13px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    border-left: 5px solid #64748b;
    background: #ffffff;
    transition: transform 160ms ease, box-shadow 160ms ease;
    position: relative;
  }

  .event-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 22px rgba(15, 23, 42, 0.10);
  }

  .event-card h3 {
    margin: 0;
    font-size: 14px;
    line-height: 1.35;
    color: #0f172a;
  }

  .event-card strong { font-size: 14px; color: #1e3a8a; }
  .event-card span { font-size: 12px; color: #64748b; }
  .event-card.simulado { border-left-color: #2563eb; background: #f8fbff; }
  .event-card.avaliacao { border-left-color: #7c3aed; background: #fbf8ff; }
  .event-card.sem-aula { border-left-color: #dc2626; background: #fffafa; }
  .event-card.conselho { border-left-color: #0f766e; background: #f7fffd; }
  .event-card.prazo { border-left-color: #ca8a04; background: #fffdf5; }

  .pill {
    display: inline-flex;
    align-items: center;
    height: 22px;
    padding: 0 8px;
    border-radius: 999px;
    font-size: 11px !important;
    font-weight: 800;
  }

  .pill.simulado { background: #dbeafe; color: #1d4ed8; }
  .pill.avaliacao { background: #ede9fe; color: #6d28d9; }
  .pill.sem-aula { background: #fee2e2; color: #b91c1c; }
  .pill.conselho { background: #ccfbf1; color: #0f766e; }
  .pill.prazo { background: #fef3c7; color: #92400e; }
  .pill.evento { background: #e2e8f0; color: #334155; }

  .dot { width: 10px; height: 10px; border-radius: 999px; background: #64748b; }
  .dot.simulado { background: #2563eb; }
  .dot.avaliacao { background: #7c3aed; }
  .dot.sem-aula { background: #dc2626; }
  .dot.conselho { background: #0f766e; }
  .dot.prazo { background: #ca8a04; }

  .obs-tip {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 22px;
    padding: 0 8px;
    border-radius: 999px;
    background: #0f172a;
    color: white !important;
    font-size: 11px !important;
    font-weight: 800;
    cursor: help;
    outline: none;
  }

  .obs-tip::after {
    content: attr(data-tooltip);
    position: absolute;
    right: 0;
    top: calc(100% + 8px);
    width: max-content;
    max-width: 260px;
    padding: 9px 10px;
    border-radius: 8px;
    background: #111827;
    color: white;
    font-size: 12px;
    line-height: 1.35;
    box-shadow: 0 12px 24px rgba(15, 23, 42, 0.22);
    opacity: 0;
    pointer-events: none;
    transform: translateY(-4px);
    transition: 140ms ease;
    z-index: 20;
  }

  .obs-tip:hover::after,
  .obs-tip:focus::after {
    opacity: 1;
    transform: translateY(0);
  }

  @media (max-width: 760px) {
    .event-card { grid-template-columns: 1fr; }
  }
`;

export default CalendarioEscolar;
