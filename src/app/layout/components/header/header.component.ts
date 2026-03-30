import { Component } from '@angular/core';
import { LayoutService } from '../../services/layout.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'layout-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  isDark$: Observable<boolean>;

  constructor(private layoutService: LayoutService) {
    this.isDark$ = this.layoutService.isDark$;
  }

  toggleMenu() {
    this.layoutService.toggleSidebar();
  }

  toggleDarkMode() {
    this.layoutService.toggleDarkMode();
  }
}


