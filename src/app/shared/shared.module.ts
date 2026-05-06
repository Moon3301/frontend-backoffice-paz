import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';
import { LoadingOverlayComponent } from './components/loading-overlay/loading-overlay.component';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@NgModule({
  declarations: [
    ThemeToggleComponent,
    LoadingOverlayComponent
  ],
  imports: [
    CommonModule,
    ButtonModule,
    TooltipModule
  ],
  exports: [
    ThemeToggleComponent,
    LoadingOverlayComponent
  ]
})
export class SharedModule { }
