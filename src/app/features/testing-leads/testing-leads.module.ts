import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TestingLeadsRoutingModule } from './testing-leads-routing.module';
import { TestingLeadsPageComponent } from './pages/testing-leads-page/testing-leads-page.component';
import { CrearLeadComponent } from './components/crear-lead/crear-lead.component';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';

@NgModule({
  declarations: [
    TestingLeadsPageComponent,
    CrearLeadComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TestingLeadsRoutingModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    TooltipModule
  ]
})
export class TestingLeadsModule { }
