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
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { PrimengModule } from '../../primeng/primeng.module';
import { ModalCaratulaComponent } from './components/modal-caratula/modal-caratula.component';

@NgModule({
  declarations: [
    CaratulasPageComponent,
    CargaCaratulaComponent,
    CaratulasGeneradasComponent,
    ModalCaratulaComponent
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
    TagModule,
    DialogModule,
    TooltipModule,
    PrimengModule
  ]
})
export class ConservadorModule { }
