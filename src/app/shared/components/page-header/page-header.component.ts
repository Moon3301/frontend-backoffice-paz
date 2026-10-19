import { Component, Input } from '@angular/core';

/**
 * Encabezado estándar de página: ícono, ruta de navegación, título y
 * descripción, con espacio a la derecha para acciones (contenido proyectado).
 *
 *   <app-page-header icono="pi pi-building" titulo="Carátulas"
 *                    [migas]="['Conservador de Bienes']" subtitulo="...">
 *     <button ...>Acción</button>
 *   </app-page-header>
 */
@Component({
  selector: 'app-page-header',
  standalone: false,
  template: `
    <div class="paz-page-header">
      <div class="flex align-items-center gap-3 min-w-0">
        <div class="paz-page-header-icon" *ngIf="icono"><i [class]="icono"></i></div>
        <div class="min-w-0">
          <nav class="paz-breadcrumb" *ngIf="migas.length" aria-label="Ruta de navegación">
            <a routerLink="/home">Inicio</a>
            <ng-container *ngFor="let m of migas">
              <i class="pi pi-angle-right"></i><span>{{ m }}</span>
            </ng-container>
          </nav>
          <h1 class="paz-page-title">{{ titulo }}</h1>
          <p class="paz-page-subtitle" *ngIf="subtitulo">{{ subtitulo }}</p>
        </div>
      </div>
      <div class="paz-page-actions"><ng-content></ng-content></div>
    </div>
  `,
})
export class PageHeaderComponent {
  @Input({ required: true }) titulo = '';
  @Input() subtitulo = '';
  @Input() icono = '';
  /** Niveles intermedios entre "Inicio" y el título. */
  @Input() migas: string[] = [];
}
