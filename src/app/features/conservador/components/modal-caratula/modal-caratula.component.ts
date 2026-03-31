import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CaratulasResponseDto, Documento } from '../../dto/caratulas-response.dto';
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

  constructor(private conservadorService: ConservadorService) {}

  close() {
    this.visible = false;
    this.visibleChange.emit(false);
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
