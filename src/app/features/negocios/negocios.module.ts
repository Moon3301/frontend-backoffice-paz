import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NegociosRoutingModule } from './negocios-routing.module';
import { NegociosPageComponent } from './pages/negocios-page/negocios-page.component';
import { SharedModule } from '../../shared/shared.module';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';

@NgModule({
  declarations: [NegociosPageComponent],
  imports: [
    CommonModule,
    FormsModule,
    NegociosRoutingModule,
    SharedModule,
    AutoCompleteModule,
    ButtonModule,
    TooltipModule,
    SkeletonModule,
  ],
})
export class NegociosModule {}
