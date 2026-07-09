import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../../../../environments/environments';
import {
  ProyectoInmobiliario,
  Reglamento,
  PlantillaCorreo,
  EnvioCorreo,
  PaginatedResponse,
  EnviosFilter,
} from '../dto/copropiedad.dto';

export interface GuardarPlantillaPayload {
  asunto?: string;
  cuerpo_html?: string;
  es_borrador?: boolean;
}

export interface EnvioPruebaPayload {
  id_proyecto: string;
  destinatario: string;
  cc?: string;
  reglamento_id?: number;
}

@Injectable({ providedIn: 'root' })
export class CopropiedadService {
  private readonly base = `${API_URL}/copropiedad`;

  constructor(private http: HttpClient) {}

  // Proyectos
  getProyectos(): Promise<ProyectoInmobiliario[]> {
    return firstValueFrom(this.http.get<ProyectoInmobiliario[]>(`${this.base}/proyectos`));
  }

  // Reglamentos
  subirReglamento(idProyecto: string, nombreDocumento: string, file: File): Promise<Reglamento> {
    const form = new FormData();
    form.append('id_proyecto', idProyecto);
    form.append('nombre_documento', nombreDocumento);
    form.append('file', file);
    return firstValueFrom(this.http.post<Reglamento>(`${this.base}/reglamentos`, form));
  }

  listarReglamentos(idProyecto?: string): Promise<Reglamento[]> {
    let params = new HttpParams();
    if (idProyecto) params = params.set('proyecto', idProyecto);
    return firstValueFrom(this.http.get<Reglamento[]>(`${this.base}/reglamentos`, { params }));
  }

  async descargarReglamento(id: number, nombreArchivo: string): Promise<void> {
    const blob = await firstValueFrom(
      this.http.get(`${this.base}/reglamentos/${id}/descargar`, { responseType: 'blob' }),
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    a.click();
    URL.revokeObjectURL(url);
  }

  eliminarReglamento(id: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.base}/reglamentos/${id}`));
  }

  // Plantillas
  getPlantilla(idProyecto: string): Promise<PlantillaCorreo | null> {
    return firstValueFrom(this.http.get<PlantillaCorreo | null>(`${this.base}/plantillas/${idProyecto}`));
  }

  guardarPlantilla(idProyecto: string, payload: GuardarPlantillaPayload): Promise<PlantillaCorreo> {
    return firstValueFrom(this.http.put<PlantillaCorreo>(`${this.base}/plantillas/${idProyecto}`, payload));
  }

  // Envíos
  listarEnvios(filter: EnviosFilter = {}): Promise<PaginatedResponse<EnvioCorreo>> {
    let params = new HttpParams();
    if (filter.proyecto?.trim()) params = params.set('proyecto', filter.proyecto.trim());
    if (filter.desde) params = params.set('desde', filter.desde);
    if (filter.hasta) params = params.set('hasta', filter.hasta);
    if (filter.page != null) params = params.set('page', filter.page.toString());
    if (filter.limit != null) params = params.set('limit', filter.limit.toString());
    return firstValueFrom(this.http.get<PaginatedResponse<EnvioCorreo>>(`${this.base}/envios`, { params }));
  }

  enviarPrueba(payload: EnvioPruebaPayload): Promise<EnvioCorreo> {
    return firstValueFrom(this.http.post<EnvioCorreo>(`${this.base}/envios/prueba`, payload));
  }

  eliminarEnvio(id: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.base}/envios/${id}`));
  }
}
