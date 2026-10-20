import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { moduloPorCodigo } from '../../../core/permisos/modulos';

@Component({
  selector: 'app-login-page',
  standalone: false,
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent implements OnInit {

  loginForm: FormGroup;
  isLoading = false;
  loginError: string | null = null;
  /** Aviso cuando se llega al login porque la sesión expiró. */
  avisoSesion: string | null = null;
  readonly anio = new Date().getFullYear();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    const recordado = this.authService.emailRecordado;
    this.loginForm = this.fb.group({
      email:      [recordado ?? '', [Validators.required, Validators.email]],
      password:   ['', [Validators.required]],
      rememberMe: [!!recordado]
    });
  }

  ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.get('motivo') === 'sesion') {
      this.avisoSesion = 'Tu sesión expiró o fue cerrada. Vuelve a ingresar para continuar.';
    }
  }

  get f() { return this.loginForm.controls; }

  async onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.loginError = null;

    const { email, password, rememberMe } = this.loginForm.value;
    const correo = String(email).trim();

    try {
      const response = await this.authService.login({ email: correo, password });
      // "Recordarme" guarda solo el correo (nunca la contraseña).
      this.authService.recordarEmail(rememberMe ? correo : null);
      if (response) {
        await this.router.navigateByUrl(this.destinoTrasLogin());
      }
    } catch (err) {
      this.loginError = this.mensajeError(err as HttpErrorResponse);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Vuelve a la página que se intentaba abrir (la deja el guard en returnUrl).
   * Antes siempre iba a /home. Solo se aceptan rutas internas para no
   * permitir redirecciones a sitios externos.
   */
  private destinoTrasLogin(): string {
    const url = this.route.snapshot.queryParamMap.get('returnUrl');
    const esInterna = !!url && url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/auth');
    if (esInterna) return url!;

    // Un usuario con acceso a un solo módulo (ej. solo Avance de Negocios)
    // entra directo a ese módulo: Inicio no le aporta nada.
    const perfil = this.authService.perfil;
    if (perfil?.rol === 'usuario' && perfil.modulos.length === 1) {
      return moduloPorCodigo(perfil.modulos[0])?.ruta ?? '/home';
    }
    return '/home';
  }

  private mensajeError(err: HttpErrorResponse): string {
    if (err?.status === 0) return 'No se pudo conectar con el servidor. Revisa tu conexión e intenta nuevamente.';
    const m = err?.error?.message;
    if (Array.isArray(m)) return m.join(' · ');
    if (typeof m === 'string' && m) return m;
    return 'No se pudo iniciar sesión. Intenta nuevamente.';
  }
}
