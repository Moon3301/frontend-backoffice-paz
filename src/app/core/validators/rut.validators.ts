import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/*
 * Validación de RUT chileno (módulo 11), compartida por Carátulas, Usuarios
 * y Testing Leads.
 */

/** Deja solo dígitos, K y guion; quita puntos y espacios. */
export function limpiarRut(valor: unknown): string {
  return String(valor ?? '')
    .toUpperCase()
    .replace(/[^0-9K-]/g, '');
}

/** Dígito verificador de un RUT chileno (módulo 11). */
export function calcularDvRut(cuerpo: string): string {
  let suma = 0;
  let multiplo = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }
  const resto = 11 - (suma % 11);
  if (resto === 11) return '0';
  if (resto === 10) return 'K';
  return String(resto);
}

/**
 * Normaliza un RUT al formato que se guarda en la base: `12345678-9`, sin
 * puntos y con K mayúscula. Acepta la entrada con o sin puntos y con o sin
 * guion. Devuelve null si no tiene forma de RUT (el DV no se valida aquí).
 */
export function normalizarRut(valor: unknown): string | null {
  const limpio = limpiarRut(valor);
  // Si viene guion, debe separar exactamente el DV. Sin esta regla un RUT a
  // medio escribir como "76701870-" se reinterpretaría como "7670187-0".
  const match = limpio.includes('-')
    ? /^(\d{7,8})-([\dK])$/.exec(limpio)
    : /^(\d{7,8})([\dK])$/.exec(limpio);
  return match ? `${match[1]}-${match[2]}` : null;
}

/** true si el RUT tiene formato válido y su dígito verificador es correcto. */
export function esRutValido(valor: unknown): boolean {
  const rut = normalizarRut(valor);
  if (!rut) return false;
  const [cuerpo, dv] = rut.split('-');
  return calcularDvRut(cuerpo) === dv;
}

/** Motivo por el que un RUT no es válido, o null si lo es. */
export function motivoRutInvalido(valor: unknown): string | null {
  const texto = String(valor ?? '').trim();
  if (!texto) return 'El RUT es obligatorio.';
  if (!normalizarRut(texto)) return 'El RUT no tiene un formato válido (ej: 76701870-3).';
  if (!esRutValido(texto)) return 'El dígito verificador del RUT no es correcto.';
  return null;
}

/** Validador reactivo del RUT (formato + dígito verificador). Error: `{ rut: motivo }`. */
export const rutValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (control.value == null || String(control.value).trim() === '') return null; // lo cubre `required`
  const motivo = motivoRutInvalido(control.value);
  return motivo ? { rut: motivo } : null;
};
