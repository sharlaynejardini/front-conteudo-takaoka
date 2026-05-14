export function getBimestreAtual(data = new Date()) {
  const mes = data.getMonth() + 1;

  if (mes <= 4) return 1;
  if (mes <= 7) return 2;
  if (mes <= 9) return 3;

  return 4;
}
