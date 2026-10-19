import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ActualizarUsuarioPayload, Usuario, UsuariosService } from '../../services/usuarios.service';
import { CodigoModulo, MODULOS, ModuloInfo, ROL_ETIQUETA, Rol } from '../../../../core/permisos/modulos';
import { normalizarRut, rutValidator } from '../../../../core/validators/rut.validators';
import { TOAST_GLOBAL } from '../../../../core/services/actualizacion-caratulas.service';
import { AuthService } from '../../../../auth/services/auth.service';

/** Mismas reglas que el backend (user/dto/usuario.dto.ts). */
const PASSWORD_PATRON = /^(?=.*[A-Za-z])(?=.*\d).{8,64}$/;
const TELEFONO_PATRON = /^\+?\d{8,11}$/;

function passwordValidator(control: AbstractControl): ValidationErrors | null {
  const v = String(control.value ?? '');
  return !v || PASSWORD_PATRON.test(v) ? null : { password: true };
}

@Component({
  selector: 'app-usuarios-page',
  standalone: false,
  templateUrl: './usuarios-page.component.html',
  styleUrl: './usuarios-page.component.css',
})
export class UsuariosPageComponent implements OnInit {
  readonly modulos: ModuloInfo[] = MODULOS;
  readonly rolOpciones = [
    { label: ROL_ETIQUETA.usuario, value: 'usuario' as Rol, icon: 'pi pi-user' },
    { label: ROL_ETIQUETA.admin, value: 'admin' as Rol, icon: 'pi pi-shield' },
  ];

  usuarios: Usuario[] = [];
  filtro = '';
  cargando = false;

  // Diálogo crear / editar
  formVisible = false;
  editando: Usuario | null = null;
  guardando = false;
  form: FormGroup;

  // Diálogo contraseña
  passwordVisible = false;
  passwordUsuario: Usuario | null = null;
  passwordNueva = '';
  passwordGuardando = false;

  constructor(
    private fb: FormBuilder,
    private usuariosService: UsuariosService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private authService: AuthService,
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(70)]],
      taxId: ['', [Validators.required, rutValidator]],
      phone: ['', [Validators.pattern(TELEFONO_PATRON)]],
      password: ['', [passwordValidator]],
      rol: ['usuario' as Rol, Validators.required],
      modulos: [[] as CodigoModulo[]],
    });
  }

  async ngOnInit(): Promise<void> {
    await this.cargar();
  }

  get f() { return this.form.controls; }

  get usuariosFiltrados(): Usuario[] {
    const q = this.filtro.trim().toLowerCase();
    if (!q) return this.usuarios;
    return this.usuarios.filter((u) =>
      [u.nombre, u.email, u.taxId].some((v) => (v ?? '').toLowerCase().includes(q)),
    );
  }

  get totalActivos(): number { return this.usuarios.filter((u) => u.isActive).length; }
  get totalAdmins(): number { return this.usuarios.filter((u) => u.rol === 'admin').length; }

  esYo(u: Usuario): boolean {
    return (this.authService.perfil?.sub ?? '').toLowerCase() === u.uuid.toLowerCase();
  }

  iniciales(nombre: string): string {
    return (nombre ?? '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]!.toUpperCase())
      .join('');
  }

  etiquetaRol(rol: Rol): string { return ROL_ETIQUETA[rol] ?? rol; }

  nombreModulo(codigo: CodigoModulo): string {
    return MODULOS.find((m) => m.codigo === codigo)?.nombre ?? codigo;
  }

  async cargar(): Promise<void> {
    this.cargando = true;
    try {
      this.usuarios = await this.usuariosService.listar();
    } catch (e) {
      this.error('No se pudo cargar la lista de usuarios.', e);
    } finally {
      this.cargando = false;
    }
  }

  // ─── Crear / editar ──────────────────────────────────────────────────────────

  abrirNuevo(): void {
    this.editando = null;
    this.form.reset({ nombre: '', email: '', taxId: '', phone: '', password: '', rol: 'usuario', modulos: [] });
    this.form.get('email')!.enable();
    this.form.get('rol')!.enable();
    this.form.get('taxId')!.setValidators([Validators.required, rutValidator]);
    this.form.get('taxId')!.updateValueAndValidity();
    this.form.get('password')!.setValidators([Validators.required, passwordValidator]);
    this.form.get('password')!.updateValueAndValidity();
    this.formVisible = true;
  }

  abrirEditar(u: Usuario): void {
    this.editando = u;
    this.form.reset({
      nombre: u.nombre,
      email: u.email,
      taxId: u.taxId,
      phone: u.phone,
      password: '',
      rol: u.rol,
      modulos: [...u.modulos],
    });
    // El correo identifica la cuenta y la contraseña tiene su propia acción.
    this.form.get('email')!.disable();
    // Un RUT ya registrado (aunque sea antiguo y con formato distinto) no debe
    // impedir guardar otros cambios: solo se valida si se modifica.
    const rutOriginal = u.taxId;
    this.form.get('taxId')!.setValidators([
      Validators.required,
      (c: AbstractControl) => (c.value === rutOriginal ? null : rutValidator(c)),
    ]);
    this.form.get('taxId')!.updateValueAndValidity();
    // Un admin no puede cambiarse su propio rol (no quedaría admin para revertirlo).
    if (this.esYo(u)) this.form.get('rol')!.disable(); else this.form.get('rol')!.enable();
    this.form.get('password')!.setValidators([passwordValidator]);
    this.form.get('password')!.updateValueAndValidity();
    this.formVisible = true;
  }

  moduloMarcado(codigo: CodigoModulo): boolean {
    return (this.form.value.modulos as CodigoModulo[]).includes(codigo);
  }

  alternarModulo(codigo: CodigoModulo, marcado: boolean): void {
    const actuales = new Set<CodigoModulo>(this.form.value.modulos as CodigoModulo[]);
    if (marcado) actuales.add(codigo); else actuales.delete(codigo);
    // Orden del catálogo, para que la vista no cambie según el orden de clic.
    this.form.patchValue({ modulos: MODULOS.map((m) => m.codigo).filter((c) => actuales.has(c)) });
  }

  /** Un admin edita su propio rol: se bloquea para que no se deje sin acceso. */
  get rolBloqueado(): boolean {
    return !!this.editando && this.esYo(this.editando);
  }

  async guardar(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const v = this.form.getRawValue();
    const base = {
      nombre: String(v.nombre).trim(),
      taxId: normalizarRut(v.taxId) ?? String(v.taxId).trim(),
      phone: String(v.phone ?? '').trim() || undefined,
      rol: v.rol as Rol,
      modulos: v.modulos as CodigoModulo[],
    };

    this.guardando = true;
    try {
      if (this.editando) {
        const payload: ActualizarUsuarioPayload = { ...base };
        if (this.rolBloqueado) delete payload.rol;
        if (v.taxId === this.editando.taxId) delete payload.taxId;
        await this.usuariosService.actualizar(this.editando.uuid, payload);
        this.ok('Usuario actualizado', `Se guardaron los cambios de ${base.nombre}.`);
      } else {
        await this.usuariosService.crear({
          ...base,
          email: String(v.email).trim().toLowerCase(),
          password: String(v.password),
        });
        this.ok('Usuario creado', `${base.nombre} ya puede iniciar sesión.`);
      }
      this.formVisible = false;
      await this.cargar();
      // Si el admin se editó a sí mismo, refresca su perfil (nombre del menú).
      if (this.editando && this.esYo(this.editando)) await this.authService.validateSession(true);
    } catch (e) {
      this.error('No se pudo guardar el usuario.', e);
    } finally {
      this.guardando = false;
    }
  }

  // ─── Activar / desactivar ────────────────────────────────────────────────────

  alternarActivo(u: Usuario): void {
    const activar = !u.isActive;
    this.confirmationService.confirm({
      header: activar ? 'Activar usuario' : 'Desactivar usuario',
      message: activar
        ? `${u.nombre} podrá volver a iniciar sesión con sus permisos actuales.`
        : `${u.nombre} no podrá iniciar sesión y su sesión abierta se cerrará en el próximo minuto. Puedes reactivarlo cuando quieras.`,
      icon: activar ? 'pi pi-check-circle' : 'pi pi-ban',
      acceptLabel: activar ? 'Activar' : 'Desactivar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: activar ? '' : 'p-button-danger',
      accept: async () => {
        try {
          await this.usuariosService.actualizar(u.uuid, { isActive: activar });
          this.ok(activar ? 'Usuario activado' : 'Usuario desactivado', u.nombre);
          await this.cargar();
        } catch (e) {
          this.error('No se pudo cambiar el estado del usuario.', e);
        }
      },
    });
  }

  // ─── Contraseña ──────────────────────────────────────────────────────────────

  abrirPassword(u: Usuario): void {
    this.passwordUsuario = u;
    this.passwordNueva = '';
    this.passwordVisible = true;
  }

  get passwordValida(): boolean {
    return PASSWORD_PATRON.test(this.passwordNueva);
  }

  async guardarPassword(): Promise<void> {
    if (!this.passwordUsuario || !this.passwordValida) return;
    this.passwordGuardando = true;
    try {
      await this.usuariosService.cambiarPassword(this.passwordUsuario.uuid, this.passwordNueva);
      this.ok('Contraseña restablecida', `Comunica la nueva contraseña a ${this.passwordUsuario.nombre} por un canal seguro.`);
      this.passwordVisible = false;
    } catch (e) {
      this.error('No se pudo restablecer la contraseña.', e);
    } finally {
      this.passwordGuardando = false;
    }
  }

  // ─── Feedback ────────────────────────────────────────────────────────────────

  private ok(summary: string, detail: string): void {
    this.messageService.add({ key: TOAST_GLOBAL, severity: 'success', summary, detail, life: 5000 });
  }

  private error(summary: string, e: unknown): void {
    const m = (e as HttpErrorResponse)?.error?.message;
    const detail = Array.isArray(m) ? m.join(' · ') : (m ?? 'Intenta nuevamente.');
    this.messageService.add({ key: TOAST_GLOBAL, severity: 'error', summary, detail, life: 8000 });
  }
}
