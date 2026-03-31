import { Component, OnDestroy, OnInit } from '@angular/core';
import { LayoutService } from '../../services/layout.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'layout-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit, OnDestroy {
  
  sidebarVisible: boolean = false;
  private subscription: Subscription = new Subscription();

  constructor(public layoutService: LayoutService, private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.subscription = this.layoutService.sidebarVisible$.subscribe(
      (visible) => this.sidebarVisible = visible
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onHide() {
    this.layoutService.setSidebarVisibility(false);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
    this.layoutService.setSidebarVisibility(false);
  }



}

