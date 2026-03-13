import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ConservadorRoutingModule } from './conservador-routing.module';
import { CaratulasPageComponent } from './pages/caratulas-page/caratulas-page.component';
import { CargaCaratulaComponent } from './components/carga-caratula/carga-caratula.component';
import { CaratulasGeneradasComponent } from './components/caratulas-generadas/caratulas-generadas.component';

// PrimeNG
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

@NgModule({
  declarations: [
    CaratulasPageComponent,
    CargaCaratulaComponent,
    CaratulasGeneradasComponent
  ],
  imports: [
    CommonModule,
    ConservadorRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    DropdownModule,
    InputTextModule,
    ButtonModule,
    TagModule
  ]
})
export class ConservadorModule { }
