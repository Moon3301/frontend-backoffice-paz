import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';
import { MODULOS, ModuloInfo, PerfilUsuario, ROL_ETIQUETA } from '../../core/permisos/modulos';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {

  perfil: PerfilUsuario | null = null;
  modulos: ModuloInfo[] = [];
  readonly rolEtiqueta = ROL_ETIQUETA;
  readonly hoy = new Date();

  private sub?: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.sub = this.authService.perfil$.subscribe((perfil) => {
      this.perfil = perfil;
      this.modulos = MODULOS.filter((m) => this.authService.tieneModulo(m.codigo));
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get saludo(): string {
    const h = this.hoy.getHours();
    return h < 12 ? 'Buenos días' : h < 20 ? 'Buenas tardes' : 'Buenas noches';
  }

  get primerNombre(): string {
    return (this.perfil?.nombre ?? '').split(/\s+/)[0] ?? '';
  }
}
