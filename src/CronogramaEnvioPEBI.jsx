const meses = [
  {
    nome: "Julho",
    cor: "#2563eb",
    periodos: [
      { datas: "27 a 31", turmas: "1ºA e 4ºA" },
    ],
  },
  {
    nome: "Agosto",
    cor: "#16a34a",
    periodos: [
      { datas: "03 a 08", turmas: "2ºA e 2ºB" },
      { datas: "10 a 14", turmas: "3ºA e 3ºB" },
      { datas: "17 a 21", turmas: "5ºA e 5ºB" },
      { datas: "24 a 28", turmas: "1ºA e 4ºA" },
    ],
  },
  {
    nome: "Setembro",
    cor: "#dc2626",
    periodos: [
      { datas: "01 a 04", turmas: "2ºA e 2ºB" },
      { datas: "07 a 11", turmas: "3ºA e 3ºB" },
      { datas: "14 a 18", turmas: "5ºA e 5ºB" },
      { datas: "21 a 25", turmas: "1ºA e 4ºA" },
      { datas: "28 a 02/10", turmas: "2ºA e 2ºB" },
    ],
  },
  {
    nome: "Outubro",
    cor: "#f59e0b",
    periodos: [
      { datas: "05 a 09", turmas: "3ºA e 3ºB" },
      { datas: "12 a 16", turmas: "5ºA e 5ºB" },
      { datas: "19 a 23", turmas: "1ºA e 4ºA" },
      { datas: "26 a 30", turmas: "2ºA e 2ºB" },
    ],
  },
  {
    nome: "Novembro",
    cor: "#7c3aed",
    periodos: [
      { datas: "02 a 06", turmas: "3ºA e 3ºB" },
      { datas: "09 a 13", turmas: "5ºA e 5ºB" },
      { datas: "16 a 20", turmas: "1ºA e 4ºA" },
      { datas: "23 a 30", turmas: "2ºA e 2ºB" },
    ],
  },
  {
    nome: "Dezembro",
    cor: "#0891b2",
    periodos: [
      { datas: "01 a 04", turmas: "3ºA e 3ºB" },
      { datas: "07 a 11", turmas: "5ºA e 5ºB" },
      { datas: "14 a 18", turmas: "1ºA e 4ºA" },
    ],
  },
];

const registros = [
  "Cantinho da leitura",
  "Elefante letrado",
  "Matific",
  "Cultura 10",
  "Biblioteca",
  "Atividades com alunos de inclusão",
  'PEE (Reforço) "professoras do ciclo"',
];

function CronogramaEnvioPEBI() {
  return (
    <main className="envio-pebi-page">
      <section className="envio-pebi-hero">
        <div>
          <p className="envio-pebi-kicker">Professores PEBI</p>
          <h1>Cronograma de Envio dos Registros 2026</h1>
          <p className="envio-pebi-subtitle">2º semestre</p>
        </div>
        <div className="envio-pebi-seal">
          <span>Coord.</span>
          <strong>Mª Aparecida</strong>
          <small>28/07/2026</small>
        </div>
      </section>

      <section className="envio-pebi-notice">
        <span>Atenção</span>
        <p>Avaliações externas e diagnósticas, quando houver, devem ser registradas e enviadas por todos.</p>
      </section>

      <section className="envio-pebi-grid" aria-label="Cronograma de envio por mês">
        {meses.map((mes) => (
          <article className="envio-pebi-month" key={mes.nome} style={{ "--month-color": mes.cor }}>
            <header>
              <h2>{mes.nome}</h2>
              <span>Turmas</span>
            </header>

            <div className="envio-pebi-periods">
              {mes.periodos.map((periodo) => (
                <div className="envio-pebi-period" key={`${mes.nome}-${periodo.datas}-${periodo.turmas}`}>
                  <div className="envio-pebi-date">{periodo.datas}</div>
                  <div className="envio-pebi-classes">{periodo.turmas}</div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="envio-pebi-records">
        <div>
          <p className="envio-pebi-kicker">Lista de controle</p>
          <h2>Registros obrigatórios</h2>
        </div>
        <div className="envio-pebi-tags">
          {registros.map((registro) => (
            <span key={registro}>{registro}</span>
          ))}
        </div>
      </section>

      <style>{`
        .envio-pebi-page {
          max-width: 1180px;
          margin: 0 auto;
          color: #14213d;
          font-family: Arial, Helvetica, sans-serif;
        }

        .envio-pebi-hero {
          display: flex;
          align-items: stretch;
          justify-content: space-between;
          gap: 20px;
          padding: 28px;
          border-radius: 14px;
          background:
            linear-gradient(135deg, rgba(37, 99, 235, 0.95), rgba(14, 165, 233, 0.86)),
            linear-gradient(90deg, #2563eb, #16a34a);
          color: white;
          box-shadow: 0 18px 40px rgba(30, 64, 175, 0.18);
          overflow: hidden;
        }

        .envio-pebi-kicker {
          margin: 0 0 8px;
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 700;
          color: inherit;
          opacity: 0.84;
        }

        .envio-pebi-hero h1 {
          margin: 0;
          font-size: clamp(1.8rem, 3vw, 3rem);
          line-height: 1.05;
          letter-spacing: 0;
        }

        .envio-pebi-subtitle {
          margin: 12px 0 0;
          font-size: 1.15rem;
          font-weight: 600;
        }

        .envio-pebi-seal {
          min-width: 180px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 4px;
          padding: 18px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.16);
          border: 1px solid rgba(255, 255, 255, 0.24);
        }

        .envio-pebi-seal span,
        .envio-pebi-seal small {
          opacity: 0.86;
        }

        .envio-pebi-seal strong {
          font-size: 1.25rem;
        }

        .envio-pebi-notice {
          display: flex;
          align-items: center;
          gap: 14px;
          margin: 18px 0;
          padding: 14px 18px;
          border-left: 5px solid #f59e0b;
          border-radius: 10px;
          background: #fff7ed;
          color: #7c2d12;
        }

        .envio-pebi-notice span {
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .envio-pebi-notice p {
          margin: 0;
        }

        .envio-pebi-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        .envio-pebi-month {
          background: #ffffff;
          border: 1px solid #dbe5f4;
          border-top: 6px solid var(--month-color);
          border-radius: 12px;
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.07);
          overflow: hidden;
        }

        .envio-pebi-month header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 16px 18px 10px;
          border-bottom: 1px solid #e2e8f0;
        }

        .envio-pebi-month h2 {
          margin: 0;
          color: var(--month-color);
          font-size: 1.24rem;
          letter-spacing: 0;
        }

        .envio-pebi-month header span {
          color: #64748b;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .envio-pebi-periods {
          display: grid;
          gap: 8px;
          padding: 14px;
        }

        .envio-pebi-period {
          display: grid;
          grid-template-columns: 96px 1fr;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 10px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
        }

        .envio-pebi-date {
          color: #0f172a;
          font-weight: 800;
          font-size: 1.02rem;
        }

        .envio-pebi-classes {
          color: #174ea6;
          font-weight: 800;
          font-size: 1.08rem;
        }

        .envio-pebi-records {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 18px;
          margin-top: 18px;
          padding: 22px;
          border-radius: 12px;
          background: #ffffff;
          border: 1px solid #dbe5f4;
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.07);
        }

        .envio-pebi-records h2 {
          margin: 0;
          font-size: 1.45rem;
          color: #b91c1c;
          letter-spacing: 0;
        }

        .envio-pebi-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .envio-pebi-tags span {
          padding: 9px 12px;
          border-radius: 999px;
          background: #eef6ff;
          border: 1px solid #bfdbfe;
          color: #1e3a8a;
          font-weight: 700;
          line-height: 1.2;
        }

        @media (max-width: 980px) {
          .envio-pebi-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 720px) {
          .envio-pebi-page {
            margin: -4px;
          }

          .envio-pebi-hero,
          .envio-pebi-notice,
          .envio-pebi-records {
            border-radius: 10px;
          }

          .envio-pebi-hero {
            flex-direction: column;
            padding: 20px;
          }

          .envio-pebi-seal {
            min-width: 0;
          }

          .envio-pebi-notice {
            align-items: flex-start;
            flex-direction: column;
            gap: 6px;
          }

          .envio-pebi-grid {
            grid-template-columns: 1fr;
          }

          .envio-pebi-period {
            grid-template-columns: 86px 1fr;
            padding: 10px;
          }

          .envio-pebi-records {
            grid-template-columns: 1fr;
            padding: 18px;
          }
        }

        @media (max-width: 420px) {
          .envio-pebi-period {
            grid-template-columns: 1fr;
            gap: 4px;
          }

          .envio-pebi-date,
          .envio-pebi-classes {
            font-size: 1rem;
          }
        }
      `}</style>
    </main>
  );
}

export default CronogramaEnvioPEBI;
