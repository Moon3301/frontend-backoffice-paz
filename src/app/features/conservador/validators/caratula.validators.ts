import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import {
  calcularDvRut,
  esRutValido,
  limpiarRut,
  motivoRutInvalido,
  normalizarRut,
  rutValidator,
} from '../../../core/validators/rut.validators';

// Las funciones de RUT viven en core/validators (las usan también Usuarios y
// Testing Leads); se re-exportan aquí para no romper los imports existentes.
export { calcularDvRut, esRutValido, limpiarRut, motivoRutInvalido, normalizarRut, rutValidator };

/**
 * Largo permitido del número de carátula (hoy todas son de 8 dígitos).
 * Debe coincidir con el backend: common/validators/caratula.validator.ts.
 */
export const CARATULA_MIN_DIGITOS = 6;
export const CARATULA_MAX_DIGITOS = 8;

/**
 * Motivo por el que un número de carátula no es válido, o null si lo es.
 * Se comparte entre el formulario y la carga masiva para que ambos rechacen
 * exactamente lo mismo.
 */
export function motivoCaratulaInvalida(valor: unknown): string | null {
  const texto = String(valor ?? '').trim();
  if (!texto) return 'El número de carátula es obligatorio.';
  if (!/^\d+$/.test(texto)) return 'El número de carátula solo admite dígitos (sin letras, puntos ni signos).';
  if (texto.length < CARATULA_MIN_DIGITOS || texto.length > CARATULA_MAX_DIGITOS) {
    return `El número de carátula debe tener entre ${CARATULA_MIN_DIGITOS} y ${CARATULA_MAX_DIGITOS} dígitos.`;
  }
  return null;
}

/** Validador reactivo del número de carátula. Error: `{ caratula: motivo }`. */
export const numeroCaratulaValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (control.value == null || String(control.value).trim() === '') return null; // lo cubre `required`
  const motivo = motivoCaratulaInvalida(control.value);
  return motivo ? { caratula: motivo } : null;
};

