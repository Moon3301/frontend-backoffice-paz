import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TestingLeadsService } from '../../services/testing-leads.service';

export interface SelectOption {
  label: string;
  value: string;
}

interface ProyectoData {
  id_proyecto: string;
  nombre_proyecto: string;
  cod_comuna: string;
  nombre_comuna: string;
  crm: string | null;
  crm_rol: string | null;
}

const PROYECTOS_DATA: ProyectoData[] = [
  { id_proyecto: 'I2021', nombre_proyecto: 'MOSAIC ART',                       cod_comuna: '130101', nombre_comuna: 'Santiago Centro',  crm: 'Z31', crm_rol: 'Z111' },
  { id_proyecto: 'I2291', nombre_proyecto: 'SAN FRANCISCO 211',                 cod_comuna: '130101', nombre_comuna: 'Santiago Centro',  crm: 'Z46', crm_rol: 'Z111' },
  { id_proyecto: 'I2341', nombre_proyecto: 'MERCADO SERRANO 245',               cod_comuna: '130101', nombre_comuna: 'Santiago Centro',  crm: 'Z53', crm_rol: null   },
  { id_proyecto: 'I1371', nombre_proyecto: 'TRADICIÓN',                         cod_comuna: '130101', nombre_comuna: 'Santiago Centro',  crm: 'Z40', crm_rol: 'Z111' },
  { id_proyecto: 'I1661', nombre_proyecto: 'NEO ART',                           cod_comuna: '130101', nombre_comuna: 'Santiago Centro',  crm: 'Z32', crm_rol: 'Z111' },
  { id_proyecto: 'I1731', nombre_proyecto: 'PLAZA LIRA SANTA VICTORIA 382',     cod_comuna: '130101', nombre_comuna: 'Santiago Centro',  crm: 'Z52', crm_rol: null   },
  { id_proyecto: 'I1771', nombre_proyecto: 'SANTA ELVIRA 46',                   cod_comuna: '130101', nombre_comuna: 'Santiago Centro',  crm: 'Z36', crm_rol: 'Z111' },
  { id_proyecto: 'I1221', nombre_proyecto: 'REVELACIÓN',                        cod_comuna: '130101', nombre_comuna: 'Santiago Centro',  crm: 'Z35', crm_rol: 'Z111' },
  { id_proyecto: 'I1351', nombre_proyecto: 'POP ART',                           cod_comuna: '130101', nombre_comuna: 'Santiago Centro',  crm: 'Z34', crm_rol: 'Z111' },
  { id_proyecto: 'I1701', nombre_proyecto: 'CAIQUÉN',                           cod_comuna: '130106', nombre_comuna: 'Estación Central', crm: 'Z25', crm_rol: 'Z111' },
  { id_proyecto: 'I1911', nombre_proyecto: 'ZORZAL',                            cod_comuna: '130106', nombre_comuna: 'Estación Central', crm: 'Z43', crm_rol: 'Z111' },
  { id_proyecto: 'I1551', nombre_proyecto: 'CARRIÓN',                           cod_comuna: '130108', nombre_comuna: 'Independencia',    crm: 'Z26', crm_rol: 'Z111' },
  { id_proyecto: 'I1561', nombre_proyecto: 'CARRIÓN 2',                         cod_comuna: '130108', nombre_comuna: 'Independencia',    crm: 'Z27', crm_rol: 'Z111' },
  { id_proyecto: 'I1251', nombre_proyecto: 'VISIÓN URBANA',                     cod_comuna: '130110', nombre_comuna: 'La Florida',       crm: 'Z41', crm_rol: 'Z111' },
  { id_proyecto: 'I1261', nombre_proyecto: 'VISIÓN URBANA 2',                   cod_comuna: '130110', nombre_comuna: 'La Florida',       crm: 'Z42', crm_rol: 'Z111' },
  { id_proyecto: 'I1691', nombre_proyecto: 'COLOMBIA 7664',                     cod_comuna: '130110', nombre_comuna: 'La Florida',       crm: 'Z28', crm_rol: 'Z111' },
  { id_proyecto: 'I1711', nombre_proyecto: 'EDIFICIO IV CENTENARIO 1025',       cod_comuna: '130114', nombre_comuna: 'Las Condes',       crm: 'Z48', crm_rol: null   },
  { id_proyecto: 'I1131', nombre_proyecto: 'VERDECE',                           cod_comuna: '130115', nombre_comuna: 'Lo Barnechea',     crm: 'Z20', crm_rol: 'Z105' },
  { id_proyecto: 'I1321', nombre_proyecto: 'VISTA GOLF LA DEHESA',              cod_comuna: '130115', nombre_comuna: 'Lo Barnechea',     crm: 'Z23', crm_rol: 'Z105' },
  { id_proyecto: 'I1361', nombre_proyecto: 'VERDECE II',                        cod_comuna: '130115', nombre_comuna: 'Lo Barnechea',     crm: 'Z21', crm_rol: 'Z105' },
  { id_proyecto: 'I1461', nombre_proyecto: 'LIVIN',                             cod_comuna: '130115', nombre_comuna: 'Lo Barnechea',     crm: 'Z30', crm_rol: 'Z111' },
  { id_proyecto: 'I1741', nombre_proyecto: 'WORKIN OFICINAS',                   cod_comuna: '130115', nombre_comuna: 'Lo Barnechea',     crm: 'Z19', crm_rol: 'Z112' },
  { id_proyecto: 'I1651', nombre_proyecto: 'POETA HUIDOBRO',                    cod_comuna: '130118', nombre_comuna: 'Macul',            crm: 'Z33', crm_rol: 'Z111' },
  { id_proyecto: 'I2211', nombre_proyecto: 'EXEQUIEL FERNÁNDEZ 3.430',          cod_comuna: '130118', nombre_comuna: 'Macul',            crm: 'Z29', crm_rol: null   },
  { id_proyecto: 'I1781', nombre_proyecto: 'SEVEN',                             cod_comuna: '130120', nombre_comuna: 'Ñuñoa',            crm: 'Z38', crm_rol: 'Z111' },
  { id_proyecto: 'I1961', nombre_proyecto: 'SEMINARIO 850',                     cod_comuna: '130120', nombre_comuna: 'Ñuñoa',            crm: 'Z37', crm_rol: 'Z111' },
  { id_proyecto: 'I1971', nombre_proyecto: 'SEMINARIO 2',                       cod_comuna: '130120', nombre_comuna: 'Ñuñoa',            crm: 'Z51', crm_rol: null   },
  { id_proyecto: 'I2271', nombre_proyecto: 'ATELIER ÑUÑOA',                     cod_comuna: '130120', nombre_comuna: 'Ñuñoa',            crm: 'Z54', crm_rol: null   },
  { id_proyecto: 'I1501', nombre_proyecto: 'BARTOLO 2',                         cod_comuna: '130130', nombre_comuna: 'San Miguel',       crm: 'Z24', crm_rol: 'Z111' },
  { id_proyecto: 'I2141', nombre_proyecto: 'TERESA VIAL 1139',                  cod_comuna: '130130', nombre_comuna: 'San Miguel',       crm: 'Z39', crm_rol: 'Z111' },
  { id_proyecto: 'I1141', nombre_proyecto: 'PARQUE ARBOLEDA LO CURRO',          cod_comuna: '130132', nombre_comuna: 'Vitacura',         crm: 'Z22', crm_rol: 'Z105' },
  { id_proyecto: 'I1521', nombre_proyecto: 'PARQUE ARBOLEDA LO CURRO ET. 2',   cod_comuna: '130132', nombre_comuna: 'Vitacura',         crm: 'Z50', crm_rol: 'Z105' },
];

@Component({
  selector: 'app-crear-lead',
  standalone: false,
  templateUrl: './crear-lead.component.html',
  styleUrl: './crear-lead.component.css'
})
export class CrearLeadComponent {

  @Output() leadCreado = new EventEmitter<void>();

  leadForm: FormGroup;
  isLoading = false;
  resultadoExito: string | null = null;
  errorEnvio: string | null = null;

  // Mapa id_proyecto → datos completos (para resolver al enviar)
  private proyectoDataMap = new Map<string, ProyectoData>(
    PROYECTOS_DATA.map(p => [p.id_proyecto, p])
  );

  // Mapa cod_comuna → nombre (para resolver al enviar)
  private comunaMap = new Map<string, string>(
    PROYECTOS_DATA.map(p => [p.cod_comuna, p.nombre_comuna])
  );

  // Opciones de dropdowns
  proyectoOptions = PROYECTOS_DATA.map(p => ({
    label: `${p.nombre_proyecto}`,
    value: p.id_proyecto
  }));

  comunaOptions: SelectOption[] = (() => {
    const seen = new Map<string, string>();
    PROYECTOS_DATA.forEach(p => seen.set(p.cod_comuna, p.nombre_comuna));
    return Array.from(seen.entries())
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([code, name]) => ({ label: name, value: code }));
  })();

  origen2Options: SelectOption[] = (() => {
    const seen = new Map<string, string>();
    PROYECTOS_DATA.forEach(p => { if (p.crm) seen.set(p.crm, p.nombre_proyecto); });
    return Array.from(seen.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([code, proyecto]) => ({ label: `${code} — ${proyecto}`, value: code }));
  })();

  origen1Options: SelectOption[] = [
    { label: 'Z04 — Contacto directo',        value: 'Z04' },
    { label: 'Z14 — Enlace',                  value: 'Z14' },
    { label: 'Z06 — Landing',                 value: 'Z06' },
    { label: 'Z09 — Landing High end',        value: 'Z09' },
    { label: 'Z08 — Landing Inversionistas',  value: 'Z08' },
    { label: 'Z07 — Landing Oficinas',        value: 'Z07' },
    { label: 'Z17 — Lidz',                    value: 'Z17' },
    { label: 'Z16 — Migración',               value: 'Z16' },
    { label: 'Z02 — Portal Inmobiliario',     value: 'Z02' },
    { label: 'Z18 — Portal PM',               value: 'Z18' },
    { label: 'Z15 — RRSS',                    value: 'Z15' },
    { label: 'Z03 — Toc Toc',                 value: 'Z03' },
    { label: 'Z12 — Web Arboleda',            value: 'Z12' },
    { label: 'Z01 — Web Paz',                 value: 'Z01' },
    { label: 'Z10 — Web Verdece',             value: 'Z10' },
    { label: 'Z13 — Web Verdece 2',           value: 'Z13' },
    { label: 'Z11 — Web Vista Golf',          value: 'Z11' },
  ];

  fuenteOptions: SelectOption[] = [
    { label: 'GOOGLE',                                value: 'GOOGLE' },
    { label: 'LIDZ',                                  value: 'LIDZ' },
    { label: 'Sistema Broker',                        value: 'Sistema Broker' },
    { label: 'Minisitio',                             value: 'Minisitio' },
    { label: 'Portal Inmobiliario',                   value: 'Portal Inmobiliario' },
    { label: 'Landing',                               value: 'Landing' },
    { label: 'Minisitio Alianza',                     value: 'Minisitio Alianza' },
    { label: 'Facebook',                              value: 'Facebook' },
    { label: 'Minisitio Alianza Santander',           value: 'Minisitio Alianza Santander' },
    { label: 'Minisitio Convenio Banco Estado-Paz',   value: 'Minisitio Convenio Banco Estado-Paz' },
    { label: 'Instagram',                             value: 'Instagram' },
    { label: 'Minisitio Alianza banco estado',        value: 'Minisitio Alianza banco estado' },
    { label: 'Yellow',                                value: 'Yellow' },
    { label: 'Mailing',                               value: 'Mailing' },
    { label: 'Banco de Chile',                        value: 'Banco de Chile' },
    { label: 'Minisitio Subsidio a la Tasa',          value: 'Minisitio Subsidio a la Tasa' },
  ];

  tipoLeadOptions: SelectOption[] = [
    { label: 'Lidz',                  value: 'Lidz' },
    { label: 'SVO',                   value: 'SVO' },
    { label: 'Landing',               value: 'Landing' },
    { label: 'ASDF',                  value: 'ASDF' },
    { label: 'PTI',                   value: 'PTI' },
    { label: 'WhatsApp',              value: 'WhatsApp' },
    { label: 'Broker',                value: 'Broker' },
    { label: 'Solicitud Información', value: 'Solicitud Información' },
    { label: 'Yellow',                value: 'Yellow' },
    { label: 'Enlace',                value: 'Enlace' },
    { label: 'Meta',                  value: 'Meta' },
    { label: 'TocToc',                value: 'TocToc' },
  ];

  generoOptions = [
    { label: 'Sin especificar', value: 3 },
    { label: 'Masculino',       value: 1 },
    { label: 'Femenino',        value: 2 }
  ];

  constructor(
    private fb: FormBuilder,
    private testingLeadsService: TestingLeadsService
  ) {
    this.leadForm = this.fb.group({
      Run:                  ['', [Validators.required]],
      Nombre:               ['', [Validators.required]],
      Apellido:             ['', [Validators.required]],
      Email:                ['', [Validators.required, Validators.email]],
      Fono:                 ['', [Validators.required]],
      Observacion:          [''],
      proyectoSelected:     [null, [Validators.required]],
      comunaSelected:       [null, [Validators.required]],
      Origen1:              ['', [Validators.required]],
      Origen2:              ['', [Validators.required]],
      Fuente:               ['', [Validators.required]],
      Tipolead:             ['', [Validators.required]],
      Genero:               [null, [Validators.required]],
      FechaLeadExterno_KUT: ['', [Validators.required]]
    });
  }

  get f() { return this.leadForm.controls; }

  // Al seleccionar proyecto → auto-rellena Comuna y Origen 2
  onProyectoChange(event: { value: string | null }) {
    const proyecto = event.value ? this.proyectoDataMap.get(event.value) : null;
    this.leadForm.patchValue({
      comunaSelected: proyecto?.cod_comuna ?? null,
      Origen2:        proyecto?.crm        ?? ''
    });
  }

  private formatDateTime(dateStr: string): string {
    if (!dateStr) return '';
    const dt = new Date(dateStr);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}.000`;
  }

  async onSubmit() {
    this.leadForm.markAllAsTouched();
    if (this.leadForm.invalid) return;

    this.isLoading = true;
    this.resultadoExito = null;
    this.errorEnvio = null;

    const v = this.leadForm.value;
    const proyectoData = this.proyectoDataMap.get(v.proyectoSelected);
    const comunaNombre = this.comunaMap.get(v.comunaSelected) ?? '';

    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const fechaHoy = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

    const payload = {
      Run:                    v.Run.trim(),
      Nombre:                 v.Nombre.trim(),
      Apellido:               v.Apellido.trim(),
      Observacion:            v.Observacion?.trim() ?? '',
      CodComuna:              v.comunaSelected ?? '',
      Comuna:                 comunaNombre,
      CodProyecto:            v.proyectoSelected ?? '',
      Proyecto:               proyectoData?.nombre_proyecto ?? '',
      Email:                  v.Email.trim(),
      Fono:                   v.Fono.trim(),
      Origen1:                v.Origen1,
      Origen2:                v.Origen2,
      Titulo:                 `Lead ${v.Nombre.trim()} ${v.Apellido.trim()}, ${fechaHoy}`,
      Uf:                     0,
      Depto:                  '',
      Campana:                '',
      Fuente:                 v.Fuente.trim(),
      Medio:                  '',
      Tipolead:               v.Tipolead,
      Dormitorios:            '',
      TituloVisita:           '',
      Salaventa:              '',
      TipoVisita:             '',
      Visita:                 false,
      Genero:                 v.Genero,
      FechaLeadExterno_KUT:   this.formatDateTime(v.FechaLeadExterno_KUT),
      IDsales:                0,
      VisitaAfluencia:        '',
      VisitaMedio:            '',
      VisitaOwner:            '',
      Propietario:            '',
      Clasificacion:          '',
      Corredor:               false
    };

    try {
      await this.testingLeadsService.crearLead(payload as any);
      this.resultadoExito = `Lead de ${v.Nombre.trim()} ${v.Apellido.trim()} enviado correctamente al CRM.`;
      this.leadCreado.emit();
      this.leadForm.reset();
    } catch (err: any) {
      this.errorEnvio = err?.error?.message ?? 'Ocurrió un error al enviar el lead al CRM. Intenta nuevamente.';
    } finally {
      this.isLoading = false;
    }
  }

  dismissFeedback() {
    this.resultadoExito = null;
    this.errorEnvio = null;
  }
}
