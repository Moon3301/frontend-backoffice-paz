import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {

  private sidebarVisibleSource = new BehaviorSubject<boolean>(false);
  sidebarVisible$ = this.sidebarVisibleSource.asObservable();

  private isDarkSource = new BehaviorSubject<boolean>(false);
  isDark$ = this.isDarkSource.asObservable();

  constructor() {
    // Restore saved preference on startup
    const saved = localStorage.getItem('paz-dark-mode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = saved !== null ? saved === 'true' : prefersDark;
    this.applyDarkMode(dark);
  }

  toggleSidebar() {
    this.sidebarVisibleSource.next(!this.sidebarVisibleSource.value);
  }

  setSidebarVisibility(visible: boolean) {
    this.sidebarVisibleSource.next(visible);
  }

  toggleDarkMode() {
    this.applyDarkMode(!this.isDarkSource.value);
  }

  private applyDarkMode(dark: boolean) {
    const html = document.documentElement;
    if (dark) {
      html.classList.add('dark-theme');
    } else {
      html.classList.remove('dark-theme');
    }
    this.isDarkSource.next(dark);
    localStorage.setItem('paz-dark-mode', String(dark));
  }
}

