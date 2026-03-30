import { Component, ViewChild } from '@angular/core';
import { CaratulasGeneradasComponent } from '../../components/caratulas-generadas/caratulas-generadas.component';

@Component({
  selector: 'app-caratulas-page',
  standalone: false,
  templateUrl: './caratulas-page.component.html',
  styleUrl: './caratulas-page.component.css'
})
export class CaratulasPageComponent {

  @ViewChild(CaratulasGeneradasComponent)
  listaComponent!: CaratulasGeneradasComponent;

  onCargaExitosa() {
    // Refresh the list keeping any active filter
    this.listaComponent?.fetchCaratulas(this.listaComponent.currentFilter);
  }
}
