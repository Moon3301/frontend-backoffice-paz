import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { API_URL } from "../../../../environments/environments";
import { CaratulasResponseDto } from "../dto/caratulas-response.dto";

export interface CaratulasFilter {
    rut?: string;
    codigo?: string;
    page?: number;
    limit?: number;
}

export interface PaginatedMeta {
    totalRecords: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginatedMeta;
}

export interface PayloadConsultarCaratula {
    caratula: number;
    rut: string;
}

export interface PayloadBatchItem {
    caratula: number;
    rut: string;
}

export interface BatchResultItem {
    index: number;
    caratula: number;
    rut: string;
    status: 'ok' | 'error';
    data?: CaratulasResponseDto;
    error?: string;
}

export interface BatchResponse {
    total: number;
    exitosos: number;
    fallidos: number;
    resultados: BatchResultItem[];
}

@Injectable({
    providedIn: 'root'
})
export class ConservadorService {
    constructor(private http: HttpClient) { }

    async getCaratulasGeneradas(filter: CaratulasFilter = {}): Promise<PaginatedResponse<CaratulasResponseDto>> {
        let params = new HttpParams();
        if (filter.rut?.trim()) {
            params = params.set('rut', filter.rut.trim());
        }
        if (filter.codigo?.trim()) {
            params = params.set('codigo', filter.codigo.trim());
        }
        if (filter.page != null) {
            params = params.set('page', filter.page.toString());
        }
        if (filter.limit != null) {
            params = params.set('limit', filter.limit.toString());
        }

        const response = await firstValueFrom(
            this.http.get<PaginatedResponse<CaratulasResponseDto>>(`${API_URL}/caratulas/lista`, { params })
        );
        return response;
    }

    async consultarCaratula(payload: PayloadConsultarCaratula): Promise<CaratulasResponseDto> {
        const response = await firstValueFrom(
            this.http.post<CaratulasResponseDto>(`${API_URL}/caratulas/cargar`, payload)
        );
        return response;
    }

    async consultarCaratulasBatch(payload: PayloadBatchItem[]): Promise<BatchResponse> {
        const response = await firstValueFrom(
            this.http.post<BatchResponse>(`${API_URL}/caratulas/cargar-batch`, payload)
        );
        return response;
    }

    async descargarDocumento(id: number, nombreArchivo: string = `documento-${id}.pdf`): Promise<void> {
        const blob = await firstValueFrom(
            this.http.get(`${API_URL}/caratulas/descargar/${id}`, { responseType: 'blob' })
        );
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = nombreArchivo;
        anchor.click();
        URL.revokeObjectURL(url);
    }
}

