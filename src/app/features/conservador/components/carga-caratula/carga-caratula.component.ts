import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-carga-caratula',
  standalone: false,
  templateUrl: './carga-caratula.component.html',
  styleUrl: './carga-caratula.component.css'
})
export class CargaCaratulaComponent {
  
  cargaForm: FormGroup;
  tiposCarga = [
    { label: 'Carga Manual', value: 'manual' },
    { label: 'Por Lotes', value: 'lotes' }
  ];

  constructor(private fb: FormBuilder) {
    this.cargaForm = this.fb.group({
      tipoCarga: ['manual', Validators.required],
      numeroCaratula: [''],
      rut: ['']
    });
  }

  onGenerate() {
    console.log('Generating with payload: ', this.cargaForm.value);
  }

}

