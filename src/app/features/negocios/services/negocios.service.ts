import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../../../../environments/environments';

export type TipoCampo = 'texto' | 'fecha' | 'numero' | 'decimal';
export type Valor = string | number | null;

export interface ResultadoBusqueda {
  rut: string;
  nombre: string | null;
  email: string | null;
  negocios: number;
  proyectos: string[];
}

export interface CampoVista { campo: string; etiqueta: string; tipo: TipoCampo; valor: Valor }

export interface SeccionVista {
  codigo: string;
  titulo: string;
  area: string | null;
  icono: string | null;
  disposicion: 'campos' | 'tabla' | 'linea_tiempo';
  campos?: CampoVista[];
  columnas?: { campo: string; etiqueta: string; tipo: TipoCampo }[];
  filas?: { codigoInmueble: string; valores: Record<string, Valor> }[];
}

export interface NegocioVista {
  contrato: string;
  proyecto: string | null;
  codigoProyecto: string | null;
  estado: string | null;
  cantidadInmuebles: number;
  secciones: SeccionVista[];
}

export interface FichaCliente {
  actualizado: string | null;
  cliente: { rut: string | null; nombre: string | null; seccion: SeccionVista | null };
  negocios: NegocioVista[];
}

export interface EstadoDatos {
  actualizado: string | null;
  enCursoId: number | null;
  ultima: { id: number; resultado: string; inicio: string; fin: string | null; negocios: number | null; clientes: number | null } | null;
}

/**
 * Búsqueda y ficha usan POST: el RUT, nombre o correo viajan en el cuerpo y
 * no en la URL (que queda registrada en los logs del servidor y del navegador).
 */
@Injectable({ providedIn: 'root' })
export class NegociosService {
  private readonly base = `${API_URL}/negocios`;

  constructor(private http: HttpClient) {}

  buscar(texto: string): Promise<{ resultados: ResultadoBusqueda[]; sinDatos?: boolean }> {
    return firstValueFrom(this.http.post<{ resultados: ResultadoBusqueda[]; sinDatos?: boolean }>(`${this.base}/buscar`, { texto }));
  }

  ficha(rut: string): Promise<FichaCliente> {
    return firstValueFrom(this.http.post<FichaCliente>(`${this.base}/ficha`, { rut }));
  }

  estado(): Promise<EstadoDatos> {
    return firstValueFrom(this.http.get<EstadoDatos>(`${this.base}/estado`));
  }

  sincronizar(): Promise<{ id: number; yaEnCurso: boolean }> {
    return firstValueFrom(this.http.post<{ id: number; yaEnCurso: boolean }>(`${this.base}/sincronizar`, {}));
  }
}
