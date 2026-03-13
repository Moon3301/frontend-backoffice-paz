import { Component } from '@angular/core';
import { LayoutService } from '../../services/layout.service';

@Component({
  selector: 'layout-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  constructor(private layoutService: LayoutService) {}

  toggleMenu() {
    this.layoutService.toggleSidebar();
  }
}

