import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { MessageService } from 'primeng/api';
import { BehaviorSubject, Subject, firstValueFrom } from 'rxjs';
import { API_URL } from '../../../environments/environments';

/** Corrida de actualización de estados (espejo de EjecucionActualizacionVista del backend). */
export interface EjecucionActualizacion {
  id: number;
  /** 'en_curso' | 'ok' | 'rate_limit' | 'error' | 'interrumpida'. */
  estado: string;
  enCurso: boolean;
  /** 'cron' | 'programada' | 'usuario' (histórico: 'manual' = Tarea Programada). */
  origen: string;
  usuario: string | null;
  inicio: string;
  fin: string | null;
  duracionMs: number | null;
  total: number;
  revisadas: number;
  cambios: number;
  conError: number;
  detalle: string | null;
}

/** Key del <p-toast> global del layout. */
export const TOAST_GLOBAL = 'global';

/** Corrida que este navegador está esperando para notificar (sobrevive a recargas). */
const STORAGE_KEY = 'actualizacion_caratulas_id';
const INTERVALO_MS = 4000;
/** Tras estos errores seguidos de red al consultar el avance se deja de insistir. */
const MAX_FALLOS = 5;

/**
 * Actualización manual de estados de carátulas en segundo plano.
 *
 * El backend responde de inmediato con el id de la corrida y la ejecuta en su
 * proceso; aquí se consulta su avance cada pocos segundos (polling: bajo IIS /
 * iisnode es más confiable que WebSockets o SSE) y al terminar se muestra una
 * notificación en el toast global.
 *
 * Es un servicio raíz para que el seguimiento continúe aunque el usuario cambie
 * de módulo, y guarda el id en localStorage para retomarlo si recarga la página.
 */
@Injectable({ providedIn: 'root' })
export class ActualizacionCaratulasService implements OnDestroy {

  private readonly estadoSubject = new BehaviorSubject<EjecucionActualizacion | null>(null);
  private readonly finalizadaSubject = new Subject<EjecucionActualizacion>();
  private readonly iniciandoSubject = new BehaviorSubject<boolean>(false);

  /** Última corrida conocida (en curso o terminada). */
  readonly estado$ = this.estadoSubject.asObservable();
  /** Emite cuando termina una corrida seguida por este navegador (para refrescar listados). */
  readonly finalizada$ = this.finalizadaSubject.asObservable();
  /** true mientras se espera la respuesta del POST que inicia la corrida. */
  readonly iniciando$ = this.iniciandoSubject.asObservable();

  private timer: ReturnType<typeof setTimeout> | null = null;
  private idSeguido: number | null = null;
  private fallos = 0;

  constructor(
    private http: HttpClient,
    private messageService: MessageService,
    private zone: NgZone,
  ) {
    // Si el usuario recargó (o cerró y volvió a abrir) con una corrida pendiente
    // de notificar, se retoma su seguimiento.
    const pendiente = this.leerIdPendiente();
    if (pendiente != null) this.seguir(pendiente);
  }

  ngOnDestroy(): void {
    this.detener();
  }

  get enCurso(): boolean {
    return !!this.estadoSubject.value?.enCurso;
  }

  /** Carga la última corrida (para mostrarla junto al botón) y retoma la que siga en curso. */
  async cargarUltima(): Promise<void> {
    try {
      const ultima = await firstValueFrom(
        this.http.get<EjecucionActualizacion | null>(`${API_URL}/caratulas/actualizacion/ultima`),
      );
      // No pisar el estado de una corrida que ya se está siguiendo.
      if (this.idSeguido == null || ultima?.id === this.idSeguido) {
        this.estadoSubject.next(ultima ?? null);
      }
      // Corrida en curso lanzada por otro medio (cron, otro usuario): se sigue
      // para mantener el botón bloqueado, pero sin notificar al terminar.
      if (ultima?.enCurso && this.idSeguido == null) this.seguir(ultima.id);
    } catch {
      // No es crítico: el botón sigue disponible.
    }
  }

  /** Botón "Actualizar estados". */
  async iniciar(): Promise<void> {
    if (this.enCurso || this.iniciandoSubject.value) return;
    this.iniciandoSubject.next(true);

    try {
      const { id, yaEnCurso } = await firstValueFrom(
        this.http.post<{ id: number; yaEnCurso: boolean }>(`${API_URL}/caratulas/actualizacion`, {}),
      );

      this.guardarIdPendiente(id);
      this.toast(
        'info',
        yaEnCurso ? 'Ya había una actualización en curso' : 'Actualización iniciada',
        'Se ejecuta en segundo plano; puedes seguir trabajando. Te avisaremos cuando termine.',
      );
      this.seguir(id);
    } catch (err) {
      const e = err as HttpErrorResponse;
      const mensaje = this.mensajeDeError(e);
      if (e.status === 429) {
        this.toast('warn', 'No es posible actualizar ahora', mensaje, 8000);
      } else if (e.status !== 401) {
        this.toast('error', 'No se pudo iniciar la actualización', mensaje, 8000);
      }
    } finally {
      this.iniciandoSubject.next(false);
    }
  }

  // ─── Seguimiento ─────────────────────────────────────────────────────────────

  private seguir(id: number): void {
    this.detener();
    this.idSeguido = id;
    this.fallos = 0;
    this.consultar();
  }

  private detener(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.idSeguido = null;
  }

  private programar(): void {
    // Fuera de la zona de Angular: un timer pendiente no debe mantener la app
    // "inestable" (afecta hidratación, pruebas y detección de cambios).
    this.zone.runOutsideAngular(() => {
      this.timer = setTimeout(() => this.zone.run(() => this.consultar()), INTERVALO_MS);
    });
  }

  private async consultar(): Promise<void> {
    const id = this.idSeguido;
    if (id == null) return;

    try {
      const ejecucion = await firstValueFrom(
        this.http.get<EjecucionActualizacion>(`${API_URL}/caratulas/actualizacion/${id}`),
      );
      if (this.idSeguido !== id) return; // se empezó a seguir otra mientras tanto
      this.fallos = 0;
      this.estadoSubject.next(ejecucion);

      if (ejecucion.enCurso) {
        this.programar();
        return;
      }

      // Terminó. Solo se notifica si este navegador la solicitó (o se sumó a ella).
      this.detener();
      if (this.leerIdPendiente() === id) {
        this.limpiarIdPendiente();
        this.notificarResultado(ejecucion);
      }
      this.finalizadaSubject.next(ejecucion);
    } catch (err) {
      const e = err as HttpErrorResponse;
      // 401: sesión vencida (el interceptor ya redirige al login). 404: la corrida
      // ya no existe. En ambos casos no tiene sentido seguir preguntando.
      if (e.status === 401 || e.status === 404 || ++this.fallos >= MAX_FALLOS) {
        this.detener();
        if (e.status === 404) this.limpiarIdPendiente();
        return;
      }
      this.programar();
    }
  }

  private notificarResultado(e: EjecucionActualizacion): void {
    const noActualizadas = e.conError > 0
      ? ` ${e.conError} no pudieron actualizarse y se reintentarán en la próxima corrida.`
      : '';

    switch (e.estado) {
      case 'ok':
        if (e.total === 0) {
          this.toast('success', 'Actualización finalizada', 'No había carátulas pendientes de actualizar.', 10000);
        } else {
          const cambios = e.cambios === 0
            ? 'ninguna cambió de estado'
            : e.cambios === 1 ? '1 cambió de estado' : `${e.cambios} cambiaron de estado`;
          this.toast(
            'success',
            'Actualización finalizada',
            `Se revisaron ${e.revisadas} carátula(s) pendiente(s); ${cambios}.${noActualizadas}`,
            12000,
          );
        }
        break;

      case 'rate_limit':
        this.toast(
          'warn',
          'Actualización parcial',
          `Se revisaron ${e.revisadas} de ${e.total} carátula(s): se alcanzó el límite de consultas ` +
          `al Conservador. Las restantes se actualizarán en la próxima corrida automática.`,
        );
        break;

      case 'interrumpida':
        this.toast(
          'warn',
          'La actualización se interrumpió',
          'El servidor se reinició antes de que terminara. Puedes intentarlo nuevamente.',
        );
        break;

      default:
        this.toast(
          'error',
          'La actualización terminó con errores',
          `Se revisaron ${e.revisadas} de ${e.total} carátula(s).${noActualizadas}`,
        );
    }
  }

  // ─── Utilidades ──────────────────────────────────────────────────────────────

  /** Sin `life` el toast queda fijo hasta que el usuario lo cierre. */
  private toast(severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string, life?: number): void {
    this.messageService.add({
      key: TOAST_GLOBAL,
      severity,
      summary,
      detail,
      ...(life ? { life } : { sticky: true }),
    });
  }

  private mensajeDeError(e: HttpErrorResponse): string {
    const m = e?.error?.message;
    if (Array.isArray(m)) return m.join(' · ');
    return m ?? 'Intenta nuevamente en unos minutos.';
  }

  private leerIdPendiente(): number | null {
    try {
      const valor = Number(localStorage.getItem(STORAGE_KEY));
      return Number.isInteger(valor) && valor > 0 ? valor : null;
    } catch {
      return null;
    }
  }

  private guardarIdPendiente(id: number): void {
    try { localStorage.setItem(STORAGE_KEY, String(id)); } catch { /* sin storage: se sigue igual */ }
  }

  private limpiarIdPendiente(): void {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
  }
}
