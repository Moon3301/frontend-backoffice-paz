import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import * as XLSX from 'xlsx';
import { CopropiedadService } from '../../services/copropiedad.service';
import { EnvioCorreo, EstadoEnvio, ProyectoInmobiliario } from '../../dto/copropiedad.dto';

@Component({
  selector: 'app-historial-envios',
  standalone: false,
  templateUrl: './historial-envios.component.html',
  styleUrl: './historial-envios.component.css',
})
export class HistorialEnviosComponent implements OnInit {
  envios: EnvioCorreo[] = [];
  proyectos: ProyectoInmobiliario[] = [];

  // Filtros
  filtroProyecto: string | null = null;
  rangoFechas: Date[] | null = null;

  // Paginación
  totalRecords = 0;
  rows = 10;
  first = 0;
  isLoading = false;

  // Modal detalle
  modalVisible = false;
  selectedEnvio: EnvioCorreo | null = null;

  constructor(
    private copropiedadService: CopropiedadService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      this.proyectos = await this.copropiedadService.getProyectos();
    } catch {
      /* silencioso: el filtro de proyecto queda vacío */
    }
  }

  private buildFilter(page: number, limit: number) {
    const desde = this.rangoFechas?.[0] ? this.toIsoDate(this.rangoFechas[0], false) : undefined;
    const hasta = this.rangoFechas?.[1] ? this.toIsoDate(this.rangoFechas[1], true) : undefined;
    return {
      proyecto: this.filtroProyecto ?? undefined,
      desde,
      hasta,
      page,
      limit,
    };
  }

  private toIsoDate(d: Date, endOfDay: boolean): string {
    const date = new Date(d);
    if (endOfDay) date.setHours(23, 59, 59, 999);
    else date.setHours(0, 0, 0, 0);
    return date.toISOString();
  }

  async fetchEnvios(page: number, limit: number): Promise<void> {
    this.isLoading = true;
    try {
      const res = await this.copropiedadService.listarEnvios(this.buildFilter(page, limit));
      this.envios = res.data;
      this.totalRecords = res.meta.totalRecords;
    } catch {
      this.envios = [];
      this.totalRecords = 0;
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el historial.' });
    } finally {
      this.isLoading = false;
    }
  }

  cargarLazy(event: any): void {
    const page = Math.floor(event.first / event.rows) + 1;
    this.rows = event.rows;
    this.fetchEnvios(page, event.rows);
  }

  aplicarFiltros(): void {
    this.first = 0;
    this.fetchEnvios(1, this.rows);
  }

  limpiarFiltros(): void {
    this.filtroProyecto = null;
    this.rangoFechas = null;
    this.first = 0;
    this.fetchEnvios(1, this.rows);
  }

  getSeverity(estado: EstadoEnvio): 'success' | 'warn' | 'danger' | 'info' {
    switch (estado) {
      case 'Enviado': return 'success';
      case 'Programado': return 'warn';
      case 'Fallido': return 'danger';
      default: return 'info';
    }
  }

  verDetalle(envio: EnvioCorreo): void {
    this.selectedEnvio = envio;
    this.modalVisible = true;
  }

  eliminar(envio: EnvioCorreo): void {
    this.confirmationService.confirm({
      message: `¿Eliminar el registro de envío a "${envio.destinatario}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      accept: async () => {
        try {
          await this.copropiedadService.eliminarEnvio(envio.id);
          this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Registro eliminado.' });
          this.fetchEnvios(Math.floor(this.first / this.rows) + 1, this.rows);
        } catch {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar.' });
        }
      },
    });
  }

  async exportar(): Promise<void> {
    try {
      // Trae hasta 10.000 registros con el filtro actual para exportar
      const res = await this.copropiedadService.listarEnvios(this.buildFilter(1, 10000));
      const rows = res.data.map((e) => ({
        Proyecto: e.nombre_proyecto,
        Asunto: e.asunto,
        Documento: e.nombre_documento,
        Destinatario: e.destinatario,
        Copia: e.cc_asesor,
        Estado: e.estado,
        'Fecha de Envío': e.fecha_envio,
        Creado: e.createdAt,
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Envios');
      XLSX.writeFile(wb, `historial-copropiedad-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo exportar.' });
    }
  }
}
