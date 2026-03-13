import { Component, OnDestroy, OnInit } from '@angular/core';
import { LayoutService } from '../../services/layout.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'layout-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit, OnDestroy {
  
  sidebarVisible: boolean = false;
  private subscription: Subscription = new Subscription();

  constructor(public layoutService: LayoutService) {}

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

}

