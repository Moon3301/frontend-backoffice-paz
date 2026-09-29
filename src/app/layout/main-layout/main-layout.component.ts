import { Component } from '@angular/core';
import { ActualizacionCaratulasService } from '../../core/services/actualizacion-caratulas.service';

@Component({
  selector: 'app-main-layout',
  standalone: false,
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {

  // Se inyecta aquí para que el servicio exista en toda la sesión: así retoma
  // el seguimiento de una actualización de carátulas si el usuario recarga la
  // página estando en cualquier módulo, y la notificación llega igual.
  constructor(_actualizacion: ActualizacionCaratulasService) {}
}
