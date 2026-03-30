import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ConservadorService } from '../../services/conservador.service';
import { CaratulasResponseDto } from '../../dto/caratulas-response.dto';

function soloNumerosValidator(control: AbstractControl): ValidationErrors | null {
  const val = control.value?.toString().trim();
  if (val && isNaN(Number(val))) {
    return { soloNumeros: true };
  }
  return null;
}

@Component({
  selector: 'app-carga-caratula',
  standalone: false,
  templateUrl: './carga-caratula.component.html',
  styleUrl: './carga-caratula.component.css'
})
export class CargaCaratulaComponent {

  /** Emits the newly created/updated caratula so the parent can refresh the list */
  @Output() cargaExitosa = new EventEmitter<CaratulasResponseDto>();

  cargaForm: FormGroup;
  isLoading = false;
  resultadoCarga: CaratulasResponseDto | null = null;
  errorCarga: string | null = null;

  constructor(private fb: FormBuilder, private conservadorService: ConservadorService) {
    this.cargaForm = this.fb.group({
      numeroCaratula: ['', [Validators.required, soloNumerosValidator]],
      rut: ['', [Validators.required, Validators.minLength(9)]]
    });
  }

  get f() { return this.cargaForm.controls; }

  async onGenerate() {
    this.cargaForm.markAllAsTouched();
    if (this.cargaForm.invalid) return;

    this.isLoading = true;
    this.resultadoCarga = null;
    this.errorCarga = null;

    const { numeroCaratula, rut } = this.cargaForm.value;

    try {
      const result = await this.conservadorService.consultarCaratula({
        caratula: Number(numeroCaratula),
        rut: rut.trim()
      });
      this.resultadoCarga = result;
      this.cargaExitosa.emit(result);
      this.cargaForm.reset({ numeroCaratula: '', rut: '' });
    } catch (err: any) {
      this.errorCarga = err?.error?.message ?? 'Ocurrió un error al procesar la carátula. Intenta nuevamente.';
    } finally {
      this.isLoading = false;
    }
  }

  dismissResult() {
    this.resultadoCarga = null;
    this.errorCarga = null;
  }
}
