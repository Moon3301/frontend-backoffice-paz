import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@NgModule({
  declarations: [
    ThemeToggleComponent
  ],
  imports: [
    CommonModule,
    ButtonModule,
    TooltipModule
  ],
  exports: [
    ThemeToggleComponent
  ]
})
export class SharedModule { }
