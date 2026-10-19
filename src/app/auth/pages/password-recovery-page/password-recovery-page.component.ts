import { Component } from '@angular/core';

/**
 * Recuperación de contraseña.
 *
 * El backend no envía correos de recuperación (ese flujo está deshabilitado),
 * así que antes esta pantalla pedía un correo y no hacía nada: el usuario
 * creía haber solicitado un enlace que nunca llegaba. Ahora explica el
 * proceso real: un administrador la restablece desde Usuarios y permisos.
 */
@Component({
  selector: 'app-password-recovery-page',
  standalone: false,
  templateUrl: './password-recovery-page.component.html',
  styleUrl: './password-recovery-page.component.css'
})
export class PasswordRecoveryPageComponent {
  readonly anio = new Date().getFullYear();
}
