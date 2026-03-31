import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {

  private sidebarVisibleSource = new BehaviorSubject<boolean>(false);
  sidebarVisible$ = this.sidebarVisibleSource.asObservable();

  constructor() {
    // Other layout initiations if needed
  }

  toggleSidebar() {
    this.sidebarVisibleSource.next(!this.sidebarVisibleSource.value);
  }

  setSidebarVisibility(visible: boolean) {
    this.sidebarVisibleSource.next(visible);
  }
}

