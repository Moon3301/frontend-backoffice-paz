import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-caratulas-generadas',
  standalone: false,
  templateUrl: './caratulas-generadas.component.html',
  styleUrl: './caratulas-generadas.component.css'
})
export class CaratulasGeneradasComponent {

  searchForm: FormGroup;
  
  caratulas = [
    { id: '123456789', rut: '12.345.678-9', estatus: 'Generado', usuario: 'Juan Pérez', fecha: '12-05-2025' },
    { id: '987654321', rut: '98.765.432-1', estatus: 'Generado', usuario: 'María González', fecha: '12-05-2025' },
    { id: '456789123', rut: '11.222.333-K', estatus: 'Procesando', usuario: 'Carlos Rodriguez', fecha: '11-05-2025' },
    { id: '789123456', rut: '15.555.444-2', estatus: 'Error', usuario: 'Ana Lopez', fecha: '10-05-2025' }
  ];

  constructor(private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      numeroCaratula: [''],
      rut: ['']
    });
  }

  onSearch() {
    console.log('Searching with: ', this.searchForm.value);
  }

  getSeverity(status: string) {
    switch (status) {
      case 'Generado':
        return 'success';
      case 'Procesando':
        return 'warning';
      case 'Error':
        return 'danger';
      default:
        return 'info';
    }
  }
}

