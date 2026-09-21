import { Component, EventEmitter, Output, ViewChild, ElementRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConservadorService, PayloadBatchItem, BatchResponse, BatchResultItem, EstadoCuota } from '../../services/conservador.service';
import { CaratulasResponseDto } from '../../dto/caratulas-response.dto';
import {
  CARATULA_MAX_DIGITOS,
  motivoCaratulaInvalida,
  motivoRutInvalido,
  normalizarRut,
  numeroCaratulaValidator,
  rutValidator,
} from '../../validators/caratula.validators';
import * as XLSX from 'xlsx';

/** Fila del Excel que no pasó la validación. */
export interface FilaInvalida {
  /** Número de fila tal como se ve en Excel (la 1 es el encabezado). */
  fila: number;
  caratula: string;
  rut: string;
  motivos: string[];
}

@Component({
  selector: 'app-carga-caratula',
  standalone: false,
  templateUrl: './carga-caratula.component.html',
  styleUrl: './carga-caratula.component.css'
})
export class CargaCaratulaComponent implements OnInit {

  /** Emits the newly created/updated caratula so the parent can refresh the list */
  @Output() cargaExitosa = new EventEmitter<CaratulasResponseDto>();

  /** Cuota diaria de la API del Conservador (para avisar antes de cargar). */
  cuota: EstadoCuota | null = null;

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
  /** Filas del Excel rechazadas por validación (el archivo no se procesa). */
  filasInvalidas: FilaInvalida[] = [];

  readonly caratulaMaxDigitos = CARATULA_MAX_DIGITOS;

  constructor(private fb: FormBuilder, private conservadorService: ConservadorService) {
    this.cargaForm = this.fb.group({
      numeroCaratula: ['', [Validators.required, numeroCaratulaValidator]],
      rut: ['', [Validators.required, rutValidator]]
    });
  }

  async ngOnInit(): Promise<void> {
    await this.cargarCuota();
  }

  /** Refresca el estado de la cuota diaria. */
  async cargarCuota(): Promise<void> {
    try {
      this.cuota = await this.conservadorService.getCuota();
    } catch {
      this.cuota = null; // si falla, no bloqueamos la carga
    }
  }

  get f() { return this.cargaForm.controls; }

  /** Impide escribir o pegar cualquier cosa que no sea un dígito. */
  onCaratulaInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const soloDigitos = input.value.replace(/\D/g, '').slice(0, CARATULA_MAX_DIGITOS);
    if (soloDigitos !== input.value) {
      input.value = soloDigitos;
      this.f['numeroCaratula'].setValue(soloDigitos);
    }
  }

  /** Solo admite dígitos, K, puntos y guion mientras se escribe. */
  onRutInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const permitido = input.value.toUpperCase().replace(/[^0-9K.\-]/g, '').slice(0, 12);
    if (permitido !== input.value) {
      input.value = permitido;
      this.f['rut'].setValue(permitido);
    }
  }

  /** Al salir del campo deja el RUT en el formato de la base: 12345678-9. */
  onRutBlur(): void {
    const normalizado = normalizarRut(this.f['rut'].value);
    if (normalizado && normalizado !== this.f['rut'].value) {
      this.f['rut'].setValue(normalizado);
    }
  }

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
        rut: normalizarRut(rut)!,
      });
      this.resultadoCarga = result;
      this.cargaExitosa.emit(result);
      this.cargaForm.reset({ numeroCaratula: '', rut: '' });
    } catch (err: any) {
      this.errorCarga = this.mensajeError(err, 'Ocurrió un error al procesar la carátula. Intenta nuevamente.');
    } finally {
      this.isLoading = false;
      await this.cargarCuota();
    }
  }

  /**
   * El backend responde las validaciones como arreglo de mensajes
   * (ej. ["[3] El dígito verificador del RUT no es correcto."]).
   */
  private mensajeError(err: any, porDefecto: string): string {
    const mensaje = err?.error?.message;
    if (Array.isArray(mensaje)) return mensaje.join(' · ');
    return mensaje ?? porDefecto;
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
    this.filasInvalidas = [];

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Leer como array de arrays para mayor control
        const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Saltar la fila de encabezados (primera fila).
        // Columna A = RUT (índice 0), Columna B = número de carátula (índice 1).
        const payload: PayloadBatchItem[] = [];
        const invalidas: FilaInvalida[] = [];

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i] ?? [];
          const rutRaw = (row[0] ?? '').toString().trim();
          const caratulaRaw = (row[1] ?? '').toString().trim();

          // Filas completamente vacías (típicas al final del Excel) se ignoran.
          if (!rutRaw && !caratulaRaw) continue;

          // Cualquier otra fila se valida con las mismas reglas del formulario.
          // Antes las filas con datos inválidos se descartaban en silencio.
          const motivos = [motivoCaratulaInvalida(caratulaRaw), motivoRutInvalido(rutRaw)]
            .filter((m): m is string => m !== null);

          if (motivos.length > 0) {
            invalidas.push({ fila: i + 1, caratula: caratulaRaw, rut: rutRaw, motivos });
            continue;
          }

          payload.push({ caratula: Number(caratulaRaw), rut: normalizarRut(rutRaw)! });
        }

        // Si hay filas inválidas no se procesa nada: se corrige el Excel y se
        // vuelve a subir. Así no quedan cargas parciales ni se consume cuota
        // del Conservador con un archivo que igual hay que repetir.
        if (invalidas.length > 0) {
          this.filasInvalidas = invalidas;
          this.errorBatch = `El archivo tiene ${invalidas.length} fila(s) con datos inválidos. Corrígelas y vuelve a subirlo; no se procesó ninguna carátula.`;
          return;
        }

        if (payload.length === 0) {
          this.errorBatch = 'El archivo no contiene filas con datos. Verifica que las columnas sean: RUT (A) y número de carátula (B).';
          return;
        }

        // Validar la cuota diaria del Conservador antes de empezar, para no
        // fallar a mitad de la carga.
        await this.cargarCuota();
        const disponibles = this.cuota?.caratulasDisponiblesUsuario;
        if (disponibles != null && payload.length > disponibles) {
          this.errorBatch = disponibles === 0
            ? 'Se alcanzó el límite diario de consultas al Conservador. Intenta nuevamente mañana.'
            : `El archivo tiene ${payload.length} carátulas y hoy solo puedes procesar ${disponibles}. Reduce el archivo o continúa mañana.`;
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
      this.errorBatch = this.mensajeError(err, 'Ocurrió un error al procesar el lote. Intenta nuevamente.');
    } finally {
      this.isBatchLoading = false;
      await this.cargarCuota();
    }
  }

  dismissBatchResult() {
    this.batchResult = null;
    this.errorBatch = null;
    this.archivoNombre = null;
    this.mostrarDetalleBatch = false;
    this.filasInvalidas = [];
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
