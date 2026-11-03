export function getDatasProva4Bimestre(nomeTurma = "", ano) {
  const turma = nomeTurma.toUpperCase().replace(/\s/g, "").replace(/[º°ª]/g, "").replace("ANO", "");
  const fundamental1 = /^[1-5][A-Z]?$/.test(turma);
  const permiteDia13 = ["1A", "2A", "2B", "3A", "3B", "4A", "5A", "5B"].includes(turma);
  const fundamental2 = ["6A", "6B", "7A", "7B", "8A", "8B", "8C", "9A", "9B", "9C"].includes(turma);
  const dias = fundamental1
    ? [...(permiteDia13 ? [13] : []), ...(turma.startsWith("5") ? [17, 18, 19, 24, 25] : [17, 18, 19, 23, 24])]
    : fundamental2 ? [13, 14, 15, 16, 17, 18, 19]
    : [13, 14, 15, 16, 17, 18, 19, 23, 24];
  return dias.map(dia => `${ano}-11-${dia}`).filter(data => {
    const diaSemana = new Date(`${data}T12:00:00Z`).getUTCDay();
    return diaSemana !== 0 && diaSemana !== 6;
  });
}

export function descreverDatasProva(datas) {
  return datas.map(data => data.slice(-2)).join(", ") + "/11";
}
