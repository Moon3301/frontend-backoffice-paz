import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CreateLeadDto, CreateLeadResponseDto } from '../dto/create-lead.dto';
import { CRM_API_URL } from '../../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class TestingLeadsService {
  constructor(private http: HttpClient) {}

  async crearLead(payload: CreateLeadDto): Promise<CreateLeadResponseDto> {
    const response = await firstValueFrom(
      this.http.post<CreateLeadResponseDto>(`${CRM_API_URL}/lead/ingreso`, payload)
    );
    return response;
  }
}
