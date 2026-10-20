import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { AutoCompleteCompleteEvent, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import {
  CampoVista, EstadoDatos, FichaCliente, NegocioVista, NegociosService,
  ResultadoBusqueda, SeccionVista, TipoCampo, Valor,
} from '../../services/negocios.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { TOAST_GLOBAL } from '../../../../core/services/actualizacion-caratulas.service';

@Component({
  selector: 'app-negocios-page',
  standalone: false,
  templateUrl: './negocios-page.component.html',
  styleUrl: './negocios-page.component.css',
})
export class NegociosPageComponent implements OnInit, OnDestroy {
  // Búsqueda
  texto: string | ResultadoBusqueda = '';
  sugerencias: ResultadoBusqueda[] = [];
  mensajeVacio = 'No se encontraron clientes.';

  // Ficha
  ficha: FichaCliente | null = null;
  negocioActivo: NegocioVista | null = null;
  cargandoFicha = false;
  errorFicha: string | null = null;

  // Datos
  estado: EstadoDatos | null = null;
  sincronizando = false;
  private sondeo: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private negociosService: NegociosService,
    private authService: AuthService,
    private messageService: MessageService,
    private zone: NgZone,
  ) {}

  get esAdmin(): boolean { return this.authService.esAdmin; }

  async ngOnInit(): Promise<void> {
    await this.cargarEstado();
    if (this.estado?.enCursoId) this.seguirSincronizacion();
  }

  ngOnDestroy(): void {
    if (this.sondeo) clearTimeout(this.sondeo);
  }

  // ─── Búsqueda ──────────────────────────────────────────────────────────────

  async buscar(event: AutoCompleteCompleteEvent): Promise<void> {
    try {
      const r = await this.negociosService.buscar(event.query);
      this.mensajeVacio = r.sinDatos
        ? 'Aún no hay datos cargados en el módulo.'
        : 'No se encontraron clientes con ese RUT, nombre, contrato o correo.';
      this.sugerencias = r.resultados;
    } catch {
      this.mensajeVacio = 'No se pudo buscar. Intenta nuevamente.';
      this.sugerencias = [];
    }
  }

  async seleccionar(event: AutoCompleteSelectEvent): Promise<void> {
    const cliente = event.value as ResultadoBusqueda;
    await this.abrirFicha(cliente.rut);
  }

  limpiar(): void {
    this.texto = '';
    this.ficha = null;
    this.negocioActivo = null;
    this.errorFicha = null;
  }

  private async abrirFicha(rut: string): Promise<void> {
    this.cargandoFicha = true;
    this.errorFicha = null;
    try {
      this.ficha = await this.negociosService.ficha(rut);
      this.negocioActivo = this.ficha.negocios[0] ?? null;
    } catch (e) {
      this.ficha = null;
      this.negocioActivo = null;
      this.errorFicha = (e as HttpErrorResponse)?.error?.message ?? 'No se pudo cargar la información del cliente.';
    } finally {
      this.cargandoFicha = false;
    }
  }

  elegirNegocio(n: NegocioVista): void {
    this.negocioActivo = n;
  }

  // ─── Presentación ──────────────────────────────────────────────────────────

  iniciales(nombre: string | null): string {
    return (nombre ?? '').split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join('') || '?';
  }

  /** Clase de la insignia según el estado del negocio. */
  claseEstado(estado: string | null): string {
    const e = (estado ?? '').toLowerCase();
    if (e.startsWith('escritur')) return 'paz-estado--ok';
    if (e.startsWith('promes')) return 'paz-estado--proceso';
    if (e.startsWith('reserv')) return 'paz-estado--alerta';
    return 'paz-estado--neutro';
  }

  seccion(n: NegocioVista, disposicion: SeccionVista['disposicion']): SeccionVista[] {
    return n.secciones.filter((s) => s.disposicion === disposicion);
  }

  tieneDatos(s: SeccionVista): boolean {
    return (s.campos ?? []).some((c) => c.valor !== null && c.valor !== '');
  }

  /** Último hito cumplido de la línea de tiempo (para destacar en qué va el negocio). */
  ultimoHito(s: SeccionVista): number {
    let ultimo = -1;
    (s.campos ?? []).forEach((c, i) => { if (c.valor) ultimo = i; });
    return ultimo;
  }

  formatear(valor: Valor, tipo: TipoCampo): string {
    if (valor === null || valor === undefined || valor === '') return '—';
    if (tipo === 'fecha') {
      const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(valor));
      return m ? `${m[3]}/${m[2]}/${m[1]}` : String(valor);
    }
    if (tipo === 'decimal' || tipo === 'numero') {
      const n = Number(valor);
      if (Number.isNaN(n)) return String(valor);
      return n.toLocaleString('es-CL', { maximumFractionDigits: tipo === 'decimal' ? 2 : 0 });
    }
    return String(valor);
  }

  esCorreo(c: CampoVista): boolean {
    return c.campo.startsWith('email') && !!c.valor;
  }

  async copiar(texto: Valor): Promise<void> {
    if (!texto) return;
    try {
      await navigator.clipboard.writeText(String(texto));
      this.messageService.add({ key: TOAST_GLOBAL, severity: 'success', summary: 'Copiado', detail: String(texto), life: 2500 });
    } catch { /* sin portapapeles: no se hace nada */ }
  }

  // ─── Estado y actualización de los datos ───────────────────────────────────

  private async cargarEstado(): Promise<void> {
    try { this.estado = await this.negociosService.estado(); } catch { /* no crítico */ }
  }

  async actualizarDatos(): Promise<void> {
    try {
      const r = await this.negociosService.sincronizar();
      this.messageService.add({
        key: TOAST_GLOBAL, severity: 'info',
        summary: r.yaEnCurso ? 'Ya había una actualización en curso' : 'Actualizando datos',
        detail: 'Toma alrededor de medio minuto. Puedes seguir consultando mientras tanto.', life: 6000,
      });
      this.seguirSincronizacion();
    } catch (e) {
      const m = (e as HttpErrorResponse)?.error?.message;
      this.messageService.add({ key: TOAST_GLOBAL, severity: 'error', summary: 'No se pudo actualizar', detail: m ?? 'Intenta nuevamente.', life: 8000 });
    }
  }

  private seguirSincronizacion(): void {
    this.sincronizando = true;
    const consultar = async () => {
      await this.cargarEstado();
      if (this.estado?.enCursoId) {
        this.zone.runOutsideAngular(() => { this.sondeo = setTimeout(() => this.zone.run(consultar), 3000); });
        return;
      }
      this.sincronizando = false;
      const u = this.estado?.ultima;
      if (u?.resultado === 'ok') {
        this.messageService.add({ key: TOAST_GLOBAL, severity: 'success', summary: 'Datos actualizados',
          detail: `${u.negocios?.toLocaleString('es-CL')} negocio-inmueble de ${u.clientes?.toLocaleString('es-CL')} clientes.`, life: 8000 });
        // Si hay una ficha abierta, se recarga con los datos nuevos.
        if (this.ficha?.cliente.rut) await this.abrirFicha(this.ficha.cliente.rut);
      } else if (u) {
        this.messageService.add({ key: TOAST_GLOBAL, severity: 'warn', summary: 'La actualización no se completó',
          detail: 'Se siguen mostrando los datos anteriores. Revisa la bitácora de sincronizaciones.', sticky: true });
      }
    };
    consultar();
  }
}
