import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CopropiedadService } from '../../services/copropiedad.service';
import { ProyectoInmobiliario, Reglamento } from '../../dto/copropiedad.dto';

@Component({
  selector: 'app-gestion-campana',
  standalone: false,
  templateUrl: './gestion-campana.component.html',
  styleUrl: './gestion-campana.component.css',
})
export class GestionCampanaComponent implements OnInit {
  proyectos: ProyectoInmobiliario[] = [];
  selectedProyecto: string | null = null;
  nombreDocumento: string = '';

  reglamentos: Reglamento[] = [];

  asunto: string = '';
  cuerpoHtml: string = '';
  plantillaGuardada: boolean = false;
  /** Fecha del último guardado de la plantilla (para mostrar en pantalla). */
  plantillaActualizada: Date | null = null;

  loadingProyectos = false;
  loadingReglamentos = false;
  subiendo = false;
  guardando = false;
  descargandoIds = new Set<number>();

  // Dialog envío de prueba
  pruebaVisible = false;
  pruebaDestinatario = '';
  pruebaCc = '';
  enviandoPrueba = false;

  constructor(
    private copropiedadService: CopropiedadService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.loadingProyectos = true;
    try {
      this.proyectos = await this.copropiedadService.getProyectos();
    } catch {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los proyectos.' });
    } finally {
      this.loadingProyectos = false;
    }
  }

  async onProyectoChange(): Promise<void> {
    this.reglamentos = [];
    this.asunto = '';
    this.cuerpoHtml = '';
    this.plantillaGuardada = false;
    this.plantillaActualizada = null;
    if (!this.selectedProyecto) return;

    this.loadingReglamentos = true;
    try {
      const [reglamentos, plantilla] = await Promise.all([
        this.copropiedadService.listarReglamentos(this.selectedProyecto),
        this.copropiedadService.getPlantilla(this.selectedProyecto),
      ]);
      this.reglamentos = reglamentos;
      if (plantilla) {
        this.asunto = plantilla.asunto ?? '';
        this.cuerpoHtml = plantilla.cuerpo_html ?? '';
        this.plantillaGuardada = !plantilla.es_borrador;
        this.plantillaActualizada = plantilla.updatedAt ? new Date(plantilla.updatedAt) : null;
      }
    } catch {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la información del proyecto.' });
    } finally {
      this.loadingReglamentos = false;
    }
  }

  async onUpload(event: { files: File[] }): Promise<void> {
    const file = event.files?.[0];
    if (!this.selectedProyecto) {
      this.messageService.add({ severity: 'warn', summary: 'Falta proyecto', detail: 'Seleccione un proyecto antes de subir el PDF.' });
      return;
    }
    if (!this.nombreDocumento.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Falta nombre', detail: 'Ingrese el nombre del documento (código negocio + proyecto).' });
      return;
    }
    if (!file) return;

    this.subiendo = true;
    try {
      await this.copropiedadService.subirReglamento(this.selectedProyecto, this.nombreDocumento.trim(), file);
      this.messageService.add({ severity: 'success', summary: 'Cargado', detail: 'Reglamento subido correctamente.' });
      this.nombreDocumento = '';
      this.reglamentos = await this.copropiedadService.listarReglamentos(this.selectedProyecto);
    } catch (err: any) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message ?? 'No se pudo subir el archivo.' });
    } finally {
      this.subiendo = false;
    }
  }

  async descargar(reg: Reglamento): Promise<void> {
    this.descargandoIds.add(reg.id);
    try {
      await this.copropiedadService.descargarReglamento(reg.id, reg.nombre_archivo);
    } catch {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo descargar el archivo.' });
    } finally {
      this.descargandoIds.delete(reg.id);
    }
  }

  isDescargando(id: number): boolean {
    return this.descargandoIds.has(id);
  }

  eliminarReglamento(reg: Reglamento): void {
    this.confirmationService.confirm({
      message: `¿Eliminar el reglamento "${reg.nombre_documento}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      accept: async () => {
        try {
          await this.copropiedadService.eliminarReglamento(reg.id);
          this.reglamentos = this.reglamentos.filter((r) => r.id !== reg.id);
          this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Reglamento eliminado.' });
        } catch {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar.' });
        }
      },
    });
  }

  async guardarPlantilla(esBorrador: boolean): Promise<void> {
    if (!this.selectedProyecto) {
      this.messageService.add({ severity: 'warn', summary: 'Falta proyecto', detail: 'Seleccione un proyecto.' });
      return;
    }
    this.guardando = true;
    try {
      const plantilla = await this.copropiedadService.guardarPlantilla(this.selectedProyecto, {
        asunto: this.asunto,
        cuerpo_html: this.cuerpoHtml,
        es_borrador: esBorrador,
      });
      this.plantillaGuardada = !esBorrador;
      this.plantillaActualizada = plantilla?.updatedAt ? new Date(plantilla.updatedAt) : new Date();
      this.messageService.add({
        severity: 'success',
        summary: esBorrador ? 'Borrador guardado' : 'Guardado',
        detail: esBorrador ? 'El borrador se guardó correctamente.' : 'La plantilla se guardó correctamente.',
      });
    } catch {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar la plantilla.' });
    } finally {
      this.guardando = false;
    }
  }

  abrirPrueba(): void {
    if (!this.selectedProyecto) {
      this.messageService.add({ severity: 'warn', summary: 'Falta proyecto', detail: 'Seleccione un proyecto.' });
      return;
    }
    if (!this.asunto?.trim() || !this.textoPlano(this.cuerpoHtml)) {
      this.messageService.add({ severity: 'warn', summary: 'Falta contenido', detail: 'Escribe el asunto y el cuerpo del correo antes de enviar la prueba.' });
      return;
    }
    this.pruebaDestinatario = '';
    this.pruebaCc = '';
    this.pruebaVisible = true;
  }

  /** Quita etiquetas HTML para saber si el cuerpo tiene texto real (Quill deja <p><br></p>). */
  private textoPlano(html: string): string {
    return (html ?? '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  }

  async enviarPrueba(): Promise<void> {
    if (!this.selectedProyecto || !this.pruebaDestinatario.trim()) return;
    this.enviandoPrueba = true;
    try {
      // Guarda la plantilla actual para que la prueba use lo que está en pantalla
      await this.copropiedadService.guardarPlantilla(this.selectedProyecto, {
        asunto: this.asunto,
        cuerpo_html: this.cuerpoHtml,
        es_borrador: !this.plantillaGuardada,
      });

      const envio = await this.copropiedadService.enviarPrueba({
        id_proyecto: this.selectedProyecto,
        destinatario: this.pruebaDestinatario.trim(),
        cc: this.pruebaCc.trim() || undefined,
      });
      if (envio.estado === 'Enviado') {
        this.messageService.add({ severity: 'success', summary: 'Enviado', detail: 'Correo de prueba enviado correctamente.' });
        this.pruebaVisible = false;
      } else {
        this.messageService.add({ severity: 'error', summary: 'Fallido', detail: envio.error_mensaje ?? 'No se pudo enviar el correo.' });
      }
    } catch (err: any) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message ?? 'No se pudo enviar el correo de prueba.' });
    } finally {
      this.enviandoPrueba = false;
    }
  }
}
