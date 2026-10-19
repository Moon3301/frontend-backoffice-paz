import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../../../../environments/environments';
import { CodigoModulo, Rol } from '../../../core/permisos/modulos';

export interface Usuario {
  uuid: string;
  nombre: string;
  email: string;
  taxId: string;
  phone: string;
  rol: Rol;
  modulos: CodigoModulo[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CrearUsuarioPayload {
  nombre: string;
  email: string;
  taxId: string;
  phone?: string;
  password: string;
  rol: Rol;
  modulos: CodigoModulo[];
}

export type ActualizarUsuarioPayload = Partial<Pick<Usuario, 'nombre' | 'taxId' | 'phone' | 'rol' | 'modulos' | 'isActive'>>;

/** Administración de usuarios (solo admin). */
@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly base = `${API_URL}/usuarios`;

  constructor(private http: HttpClient) {}

  listar(): Promise<Usuario[]> {
    return firstValueFrom(this.http.get<Usuario[]>(this.base));
  }

  crear(payload: CrearUsuarioPayload): Promise<Usuario> {
    return firstValueFrom(this.http.post<Usuario>(this.base, payload));
  }

  actualizar(uuid: string, payload: ActualizarUsuarioPayload): Promise<Usuario> {
    return firstValueFrom(this.http.patch<Usuario>(`${this.base}/${uuid}`, payload));
  }

  cambiarPassword(uuid: string, password: string): Promise<void> {
    return firstValueFrom(this.http.post<void>(`${this.base}/${uuid}/password`, { password }));
  }
}
