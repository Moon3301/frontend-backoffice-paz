import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ConservadorService, CaratulasFilter } from '../../services/conservador.service';
import { CaratulasResponseDto } from '../../dto/caratulas-response.dto';

@Component({
  selector: 'app-caratulas-generadas',
  standalone: false,
  templateUrl: './caratulas-generadas.component.html',
  styleUrl: './caratulas-generadas.component.css'
})
export class CaratulasGeneradasComponent implements OnInit {

  searchForm: FormGroup;
  caratulas: CaratulasResponseDto[] = [];

  selectedCaratula: CaratulasResponseDto | null = null;
  modalVisible: boolean = false;

  isLoading: boolean = false;
  hasSearched: boolean = false;

  // Pagination state
  totalRecords: number = 0;
  rows: number = 10;
  first: number = 0;

  // Stores the active filter so lazy load can reuse it across page changes
  currentFilter: CaratulasFilter = {};

  constructor(private fb: FormBuilder, private conservadorService: ConservadorService) {
    this.searchForm = this.fb.group({
      numeroCaratula: [''],
      rut: ['']
    });
  }

  ngOnInit(): void {
    // Trigger initial load via the table's onLazyLoad event (first emission)
    this.fetchCaratulas({ page: 1, limit: this.rows });
  }

  async fetchCaratulas(filter: CaratulasFilter) {
    this.isLoading = true;
    this.currentFilter = filter;
    try {
      const response = await this.conservadorService.getCaratulasGeneradas(filter);
      this.caratulas = response.data;
      this.totalRecords = response.meta.totalRecords;
    } catch (err) {
      console.error('Error fetching carátulas:', err);
      this.caratulas = [];
      this.totalRecords = 0;
    } finally {
      this.isLoading = false;
    }
  }

  /** Called by p-table [lazy] on every page change */
  cargarCaratulasLazy(event: any) {
    const page = Math.floor(event.first / event.rows) + 1;
    const limit = event.rows;
    this.rows = limit;
    this.fetchCaratulas({ ...this.currentFilter, page, limit });
  }

  onSearch() {
    const { numeroCaratula, rut } = this.searchForm.value;
    const filter: CaratulasFilter = {};
    if (rut?.trim()) filter.rut = rut.trim();
    if (numeroCaratula?.trim()) filter.codigo = numeroCaratula.trim();
    this.hasSearched = !!(filter.rut || filter.codigo);
    // Reset to first page on new search
    this.first = 0;
    this.fetchCaratulas({ ...filter, page: 1, limit: this.rows });
  }

  clearSearch() {
    this.searchForm.reset({ numeroCaratula: '', rut: '' });
    this.hasSearched = false;
    this.first = 0;
    this.fetchCaratulas({ page: 1, limit: this.rows });
  }

  openModal(caratula: CaratulasResponseDto) {
    this.selectedCaratula = caratula;
    this.modalVisible = true;
  }

  getSeverity(status: string) {
    switch (status) {
      case 'Generado':   return 'success';
      case 'Procesando': return 'warning';
      case 'Error':      return 'danger';
      default:           return 'info';
    }
  }
}
