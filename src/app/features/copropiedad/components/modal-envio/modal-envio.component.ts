import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EnvioCorreo, EstadoEnvio } from '../../dto/copropiedad.dto';

@Component({
  selector: 'app-modal-envio',
  standalone: false,
  templateUrl: './modal-envio.component.html',
  styleUrl: './modal-envio.component.css',
})
export class ModalEnvioComponent {
  @Input() envio: EnvioCorreo | null = null;
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  close(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  getSeverity(estado?: EstadoEnvio | null): 'success' | 'warn' | 'danger' | 'info' {
    switch (estado) {
      case 'Enviado': return 'success';
      case 'Programado': return 'warn';
      case 'Fallido': return 'danger';
      default: return 'info';
    }
  }
}
