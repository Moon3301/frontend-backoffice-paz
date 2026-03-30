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

  // Stores the active filter so future pagination can reuse it
  currentFilter: CaratulasFilter = {};

  constructor(private fb: FormBuilder, private conservadorService: ConservadorService) {
    this.searchForm = this.fb.group({
      numeroCaratula: [''],
      rut: ['']
    });
  }

  ngOnInit(): void {
    this.fetchCaratulas({});
  }

  async fetchCaratulas(filter: CaratulasFilter) {
    this.isLoading = true;
    this.currentFilter = filter;
    try {
      this.caratulas = await this.conservadorService.getCaratulasGeneradas(filter);
    } catch (err) {
      console.error('Error fetching carátulas:', err);
      this.caratulas = [];
    } finally {
      this.isLoading = false;
    }
  }

  onSearch() {
    const { numeroCaratula, rut } = this.searchForm.value;
    const filter: CaratulasFilter = {};
    if (rut?.trim()) filter.rut = rut.trim();
    if (numeroCaratula?.trim()) filter.codigo = numeroCaratula.trim();
    this.hasSearched = !!(filter.rut || filter.codigo);
    this.fetchCaratulas(filter);
  }

  clearSearch() {
    this.searchForm.reset({ numeroCaratula: '', rut: '' });
    this.hasSearched = false;
    this.fetchCaratulas({});
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
