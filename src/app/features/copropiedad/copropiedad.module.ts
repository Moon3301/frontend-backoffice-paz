import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CopropiedadRoutingModule } from './copropiedad-routing.module';

// PrimeNG
import { TabsModule } from 'primeng/tabs';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { EditorModule } from 'primeng/editor';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { DatePickerModule } from 'primeng/datepicker';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

// Componentes
import { CopropiedadPageComponent } from './pages/copropiedad-page/copropiedad-page.component';
import { GestionCampanaComponent } from './components/gestion-campana/gestion-campana.component';
import { HistorialEnviosComponent } from './components/historial-envios/historial-envios.component';
import { ModalEnvioComponent } from './components/modal-envio/modal-envio.component';

@NgModule({
  declarations: [
    CopropiedadPageComponent,
    GestionCampanaComponent,
    HistorialEnviosComponent,
    ModalEnvioComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    CopropiedadRoutingModule,
    TabsModule,
    DropdownModule,
    InputTextModule,
    ButtonModule,
    FileUploadModule,
    EditorModule,
    TableModule,
    TagModule,
    DialogModule,
    DatePickerModule,
    TooltipModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
})
export class CopropiedadModule {}
