import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LayoutService } from '../../services/layout.service';
import { AuthService } from '../../../auth/services/auth.service';
import { PerfilUsuario, ROL_ETIQUETA } from '../../../core/permisos/modulos';

@Component({
  selector: 'layout-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  readonly perfil$: Observable<PerfilUsuario | null>;
  readonly rolEtiqueta = ROL_ETIQUETA;

  constructor(
    private layoutService: LayoutService,
    private authService: AuthService,
    private router: Router,
  ) {
    this.perfil$ = this.authService.perfil$;
  }

  toggleMenu() {
    this.layoutService.toggleSidebar();
  }

  iniciales(nombre: string | undefined): string {
    return (nombre ?? '').split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join('');
  }

  logout() {
    this.authService.logout();
    this.layoutService.setSidebarVisibility(false);
    this.router.navigate(['/auth/login']);
  }
}
