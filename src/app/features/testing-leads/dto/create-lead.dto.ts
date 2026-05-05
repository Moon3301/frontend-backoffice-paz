export interface CreateLeadDto {
  Run: string;
  Nombre: string;
  Apellido: string;
  Observacion: string;
  CodComuna: string;
  Comuna: string;
  CodProyecto: string;
  Proyecto: string;
  Email: string;
  Fono: string;
  Origen1: string;
  Origen2: string;
  Titulo: string;
  Uf: number;
  Depto: string;
  Campana: string;
  Fuente: string;
  Medio: string;
  Tipolead: string;
  Dormitorios: string;
  TituloVisita: string;
  Salaventa: string;
  TipoVisita: string;
  Visita: boolean;
  Genero: number;
  FechaLeadExterno_KUT: string;
  IDsales: number;
  VisitaAfluencia: string;
  VisitaMedio: string;
  VisitaOwner: string;
  Propietario: string;
  Clasificacion: string;
  Corredor: boolean;
}

export interface CreateLeadResponseDto {
  [key: string]: any;
}
