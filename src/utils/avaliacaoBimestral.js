export function getDatasProva4Bimestre(nomeTurma = "", ano) {
  const turma = nomeTurma.toUpperCase().replace(/\s/g, "").replace(/[º°ª]/g, "").replace("ANO", "");
  const fundamental1 = /^[1-5][A-Z]?$/.test(turma);
  const dias = fundamental1
    ? turma.startsWith("5") ? [17, 18, 19, 24, 25] : [17, 18, 19, 23, 24]
    : [13, 14, 15, 16, 17, 18, 19, 23, 24];
  return dias.map(dia => `${ano}-11-${dia}`);
}

export function descreverDatasProva(datas) {
  return datas.map(data => data.slice(-2)).join(", ") + "/11";
}
