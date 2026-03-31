import { Component } from '@angular/core';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend-backoffice-paz';

  constructor(private themeService: ThemeService) {
    // ThemeService is injected to auto-initialize the theme on app load based on localstorage
  }
}
