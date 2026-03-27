import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { API_URL } from "../../../../environments/environments";

@Injectable({
    providedIn: 'root'
})
export class ConservadorService {
    constructor(private http: HttpClient) { }



    async getCaratulasGeneradas() {
        const response = await firstValueFrom(this.http.get<any>(`${API_URL}/caratulas/lista`));
        return response;
    }
}