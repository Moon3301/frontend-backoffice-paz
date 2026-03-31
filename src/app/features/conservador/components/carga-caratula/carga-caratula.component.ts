import { Component, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ConservadorService, PayloadBatchItem, BatchResponse, BatchResultItem } from '../../services/conservador.service';
import { CaratulasResponseDto } from '../../dto/caratulas-response.dto';
import * as XLSX from 'xlsx';

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

  @ViewChild('fileInputBatch') fileInputBatch!: ElementRef<HTMLInputElement>;

  cargaForm: FormGroup;
  isLoading = false;
  resultadoCarga: CaratulasResponseDto | null = null;
  errorCarga: string | null = null;

  // Batch state
  isBatchLoading = false;
  batchResult: BatchResponse | null = null;
  errorBatch: string | null = null;
  archivoNombre: string | null = null;
  mostrarDetalleBatch = false;

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

  // ─── BATCH ───────────────────────────────────────────────────────────────────

  triggerFileInput() {
    this.fileInputBatch.nativeElement.value = '';
    this.fileInputBatch.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.archivoNombre = file.name;
    this.batchResult = null;
    this.errorBatch = null;
    this.mostrarDetalleBatch = false;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Leer como array de arrays para mayor control
        const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Saltar la fila de encabezados (primera fila)
        const payload: PayloadBatchItem[] = [];
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          // Columna A = numero de caratula (índice 0), Columna B = rut (índice 1)
          const rutRaw = row[0]?.toString().trim();
          const caratulaRaw = row[1]?.toString().trim();

          if (!rutRaw || !caratulaRaw) continue;

          const caratulaNum = Number(caratulaRaw);
          if (isNaN(caratulaNum)) continue;

          payload.push({ caratula: caratulaNum, rut: rutRaw });
        }

        if (payload.length === 0) {
          this.errorBatch = 'El archivo no contiene filas válidas. Verifica que las columnas sean: número de carátula (A) y RUT (B).';
          return;
        }

        await this.procesarBatch(payload);
      } catch (err: any) {
        this.errorBatch = 'Error al leer el archivo Excel. Asegúrate de que sea un archivo .xlsx o .xls válido.';
      }
    };
    reader.readAsArrayBuffer(file);
  }

  private async procesarBatch(payload: PayloadBatchItem[]) {
    this.isBatchLoading = true;
    this.batchResult = null;
    this.errorBatch = null;

    try {
      const result = await this.conservadorService.consultarCaratulasBatch(payload);
      this.batchResult = result;
      if (result.exitosos > 0) {
        this.cargaExitosa.emit(undefined as any);
      }
    } catch (err: any) {
      this.errorBatch = err?.error?.message ?? 'Ocurrió un error al procesar el lote. Intenta nuevamente.';
    } finally {
      this.isBatchLoading = false;
    }
  }

  dismissBatchResult() {
    this.batchResult = null;
    this.errorBatch = null;
    this.archivoNombre = null;
    this.mostrarDetalleBatch = false;
  }

  toggleDetalleBatch() {
    this.mostrarDetalleBatch = !this.mostrarDetalleBatch;
  }

  trackByIndex(index: number): number {
    return index;
  }

  getBatchItemRows(): BatchResultItem[] {
    return this.batchResult?.resultados ?? [];
  }
}
