import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';
import { LoadingOverlayComponent } from './components/loading-overlay/loading-overlay.component';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@NgModule({
  declarations: [
    ThemeToggleComponent,
    LoadingOverlayComponent,
    PageHeaderComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    TooltipModule
  ],
  exports: [
    ThemeToggleComponent,
    LoadingOverlayComponent,
    PageHeaderComponent
  ]
})
export class SharedModule { }
