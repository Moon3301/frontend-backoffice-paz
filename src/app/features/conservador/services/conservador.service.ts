import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { API_URL } from "../../../../environments/environments";
import { CaratulasResponseDto } from "../dto/caratulas-response.dto";

export interface CaratulasFilter {
    rut?: string;
    codigo?: string;
    // Prepared for future pagination
    // page?: number;
    // limit?: number;
}

export interface PayloadConsultarCaratula {
    caratula: number;
    rut: string;
}

@Injectable({
    providedIn: 'root'
})
export class ConservadorService {
    constructor(private http: HttpClient) { }

    async getCaratulasGeneradas(filter: CaratulasFilter = {}): Promise<CaratulasResponseDto[]> {
        let params = new HttpParams();
        if (filter.rut?.trim()) {
            params = params.set('rut', filter.rut.trim());
        }
        if (filter.codigo?.trim()) {
            params = params.set('codigo', filter.codigo.trim());
        }
        // Future pagination:
        // if (filter.page != null) params = params.set('page', filter.page);
        // if (filter.limit != null) params = params.set('limit', filter.limit);

        const response = await firstValueFrom(
            this.http.get<CaratulasResponseDto[]>(`${API_URL}/caratulas/lista`, { params })
        );
        return response;
    }

    async consultarCaratula(payload: PayloadConsultarCaratula): Promise<CaratulasResponseDto> {
        const response = await firstValueFrom(
            this.http.post<CaratulasResponseDto>(`${API_URL}/caratulas/cargar`, payload)
        );
        return response;
    }
}

