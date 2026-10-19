import { inject } from '@angular/core';
import { CanActivateFn, NavigationEnd, Router } from '@angular/router';
import { filter, take } from 'rxjs';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../auth/services/auth.service';
import { CodigoModulo, moduloPorCodigo } from '../permisos/modulos';
import { TOAST_GLOBAL } from '../services/actualizacion-caratulas.service';

/**
 * Guards de permisos. Corren DESPUÉS de authGuard (que ya validó la sesión y
 * cargó el perfil), así que aquí solo se decide por rol y módulos.
 *
 * Son una comodidad de UI: la protección real está en el backend, que
 * responde 403 a cualquier llamada a un módulo no asignado.
 */
function denegar(mensaje: string) {
  const router = inject(Router);
  const messageService = inject(MessageService);

  // El aviso se emite al terminar la redirección: si se entra escribiendo la
  // URL (recarga completa), el contenedor de notificaciones del layout todavía
  // no existe cuando corre el guard y el mensaje se perdería.
  router.events
    .pipe(filter((e) => e instanceof NavigationEnd), take(1))
    .subscribe(() =>
      setTimeout(() =>
        messageService.add({
          key: TOAST_GLOBAL,
          severity: 'warn',
          summary: 'Acceso no permitido',
          detail: mensaje,
          life: 6000,
        }),
      ),
    );

  return router.createUrlTree(['/home']);
}

/** Permite entrar solo si el usuario tiene asignado el módulo (o es admin). */
export function moduloGuard(modulo: CodigoModulo): CanActivateFn {
  return async () => {
    const auth = inject(AuthService);
    if (!auth.perfil) await auth.validateSession();
    if (auth.tieneModulo(modulo)) return true;
    const nombre = moduloPorCodigo(modulo)?.nombre ?? modulo;
    return denegar(`No tienes acceso al módulo ${nombre}. Si lo necesitas, solicítalo al administrador.`);
  };
}

/** Solo administradores. */
export const adminGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  if (!auth.perfil) await auth.validateSession();
  if (auth.esAdmin) return true;
  return denegar('Esta sección es solo para administradores.');
};
