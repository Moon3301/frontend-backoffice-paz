import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CaratulasResponseDto, Documento, Observacion } from '../../dto/caratulas-response.dto';
import { ConservadorService } from '../../services/conservador.service';

@Component({
  selector: 'app-modal-caratula',
  standalone: false,
  templateUrl: './modal-caratula.component.html',
  styleUrl: './modal-caratula.component.css'
})
export class ModalCaratulaComponent {

  @Input() caratula: CaratulasResponseDto | null = null;
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  /** Repositorio local de estados de descarga por doc.id */
  descargandoIds: Set<number> = new Set();
  errorDescargaId: number | null = null;

  /** doc.id cuyo enlace se acaba de copiar (para feedback en el botón) */
  enlaceCopiadoId: number | null = null;

  constructor(private conservadorService: ConservadorService) {}

  close() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  /**
   * Lista de observaciones (rechazos y otros eventos del repertorio) que llega
   * desde el backend como arreglo relacional. Devuelve [] si no hay.
   */
  get observacionesList(): Observacion[] {
    const obs = this.caratula?.observaciones;
    return Array.isArray(obs) ? obs : [];
  }

  /** Estilo del badge segun el tipo de evento de la observacion. */
  getTipoEventoStyle(tipoEvento: string): { [key: string]: string } {
    switch ((tipoEvento || '').toLowerCase()) {
      case 'rechazo':
        return { 'background-color': '#fecaca', 'color': '#991b1b' };
      case 'aprobado':
      case 'aprobacion':
        return { 'background-color': '#bbf7d0', 'color': '#166534' };
      default:
        return { 'background-color': '#e0f2fe', 'color': '#0369a1' };
    }
  }

  getFechaMovimiento(fechaMovimiento: string): { fecha: string; hora: string } {
    if (!fechaMovimiento) return { fecha: '—', hora: '—' };
    const partes = fechaMovimiento.split(' ');
    return {
      fecha: partes[0] ?? fechaMovimiento,
      hora: partes[1] ?? ''
    };
  }

  getEstadoStyle(estado: string): { [key: string]: string } {
    switch (estado) {
      case 'Finalizada':
        return { 'background-color': '#bbf7d0', 'color': '#166534' };
      case 'Procesando':
        return { 'background-color': '#fef08a', 'color': '#854d0e' };
      case 'Error':
        return { 'background-color': '#fecaca', 'color': '#991b1b' };
      default:
        return { 'background-color': '#e0f2fe', 'color': '#0369a1' };
    }
  }

  isDescargando(docId: number): boolean {
    return this.descargandoIds.has(docId);
  }

  /** Copia la URL pública firmada del documento al portapapeles. */
  async copiarEnlace(doc: Documento) {
    if (!doc.url_publica) return;
    try {
      await navigator.clipboard.writeText(doc.url_publica);
    } catch {
      // Fallback para navegadores/contextos sin Clipboard API
      const ta = document.createElement('textarea');
      ta.value = doc.url_publica;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    this.enlaceCopiadoId = doc.id;
    setTimeout(() => {
      if (this.enlaceCopiadoId === doc.id) this.enlaceCopiadoId = null;
    }, 2000);
  }

  async descargarDocumento(doc: Documento) {
    if (this.descargandoIds.has(doc.id)) return;

    this.descargandoIds.add(doc.id);
    this.errorDescargaId = null;

    const nombreArchivo = `${doc.tipoDocumento.replace(/\s+/g, '_')}_${doc.id}.pdf`;

    try {
      await this.conservadorService.descargarDocumento(doc.id, nombreArchivo);
    } catch (err: any) {
      this.errorDescargaId = doc.id;
    } finally {
      this.descargandoIds.delete(doc.id);
    }
  }
}
