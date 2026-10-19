import { Component, OnDestroy, OnInit } from '@angular/core';
import { LayoutService } from '../../services/layout.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { MODULOS, ModuloInfo, PerfilUsuario } from '../../../core/permisos/modulos';

@Component({
  selector: 'layout-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit, OnDestroy {

  sidebarVisible: boolean = false;
  perfil: PerfilUsuario | null = null;
  /** Solo los módulos a los que el usuario tiene acceso. */
  modulosVisibles: ModuloInfo[] = [];

  private subscription: Subscription = new Subscription();

  constructor(public layoutService: LayoutService, private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.layoutService.sidebarVisible$.subscribe((visible) => this.sidebarVisible = visible)
    );
    this.subscription.add(
      this.authService.perfil$.subscribe((perfil) => {
        this.perfil = perfil;
        this.modulosVisibles = MODULOS.filter((m) => this.authService.tieneModulo(m.codigo));
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onHide() {
    this.layoutService.setSidebarVisibility(false);
  }

  /** Cierra el menú al elegir una opción (en pantallas chicas tapa el contenido). */
  navegar() {
    this.layoutService.setSidebarVisibility(false);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
    this.layoutService.setSidebarVisibility(false);
  }
}
