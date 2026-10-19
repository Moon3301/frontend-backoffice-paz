/**
 * Clase visual (.paz-estado--*) para el estado de una carátula.
 *
 * Se decide por el código del Conservador (F/P/R) y, si no viene, por el
 * texto. Antes el listado comparaba contra 'Procesando' y 'Error', valores que
 * nunca llegan, y pintaba todo de verde: una carátula Rechazada se veía igual
 * que una Finalizada.
 */
export function claseEstadoCaratula(codigo?: string | null, texto?: string | null): string {
  switch ((codigo ?? '').toUpperCase()) {
    case 'F': return 'paz-estado--ok';
    case 'R': return 'paz-estado--error';
    case 'P': return 'paz-estado--proceso';
  }
  const t = (texto ?? '').toLowerCase();
  if (t.includes('final')) return 'paz-estado--ok';
  if (t.includes('rechaz')) return 'paz-estado--error';
  if (t.includes('proceso')) return 'paz-estado--proceso';
  return 'paz-estado--neutro';
}
