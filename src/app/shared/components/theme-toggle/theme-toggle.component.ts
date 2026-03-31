import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: false,
  template: `
    <button pButton pRipple type="button"
            [ngClass]="'p-button-rounded p-button-text p-button-plain ' + customClass"
            [icon]="(isDark$ | async) ? 'pi pi-sun' : 'pi pi-moon'"
            [pTooltip]="(isDark$ | async) ? 'Modo claro' : 'Modo oscuro'"
            tooltipPosition="bottom"
            (click)="toggleDarkMode()">
    </button>
  `,
  styles: []
})
export class ThemeToggleComponent implements OnInit {
  @Input() customClass: string = 'text-white';
  isDark$!: Observable<boolean>;

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.isDark$ = this.themeService.isDark$;
  }

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }
}
