/**
 * Catálogo de módulos del backoffice (espejo de backend: auth/permisos/permisos.ts).
 * Si se agrega un módulo, hay que agregarlo en ambos lados.
 *
 * - 'admin'   → ve todos los módulos y la administración de usuarios.
 * - 'usuario' → solo los módulos que tenga asignados.
 */
export type CodigoModulo = 'conservador' | 'copropiedad' | 'leads';
export type Rol = 'admin' | 'usuario';

export interface ModuloInfo {
  codigo: CodigoModulo;
  nombre: string;
  descripcion: string;
  ruta: string;
  icono: string;
}

export const MODULOS: ModuloInfo[] = [
  {
    codigo: 'conservador',
    nombre: 'Conservador de Bienes',
    descripcion: 'Carga y seguimiento de carátulas del CBR, con documentos y trazabilidad.',
    ruta: '/conservador',
    icono: 'pi pi-building',
  },
  {
    codigo: 'copropiedad',
    nombre: 'Copropiedad',
    descripcion: 'Reglamentos, plantillas de correo e historial de envíos al promesar.',
    ruta: '/copropiedad',
    icono: 'pi pi-users',
  },
  {
    codigo: 'leads',
    nombre: 'Testing Leads',
    descripcion: 'Ingreso de leads de prueba al CRM.',
    ruta: '/leads',
    icono: 'pi pi-briefcase',
  },
];

export const ROL_ETIQUETA: Record<Rol, string> = {
  admin: 'Administrador',
  usuario: 'Usuario',
};

/** Perfil de la sesión (GET /auth/me). */
export interface PerfilUsuario {
  sub: string;
  email: string;
  nombre: string;
  rol: Rol;
  modulos: CodigoModulo[];
}

export function moduloPorCodigo(codigo: CodigoModulo): ModuloInfo | undefined {
  return MODULOS.find((m) => m.codigo === codigo);
}
