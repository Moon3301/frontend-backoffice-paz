export type ProyectoInmobiliario = {
  id_proyecto: string;
  activo: boolean;
  nombre_proyecto: string;
  cod_comuna: string | null;
  crm: string | null;
  crm_rol: string | null;
  Descripcion: string | null;
  sociedad: string | null;
};

export type Reglamento = {
  id: number;
  id_proyecto: string;
  nombre_documento: string;
  nombre_archivo: string;
  ruta_local: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PlantillaCorreo = {
  id: number;
  id_proyecto: string;
  asunto: string | null;
  cuerpo_html: string | null;
  es_borrador: boolean;
  createdAt: string;
  updatedAt: string;
};

export type EstadoEnvio = 'Enviado' | 'Programado' | 'Fallido';

export type EnvioCorreo = {
  id: number;
  id_proyecto: string | null;
  nombre_proyecto: string | null;
  asunto: string | null;
  nombre_documento: string | null;
  destinatario: string | null;
  cc_asesor: string | null;
  estado: EstadoEnvio;
  error_mensaje: string | null;
  negocio_codigo: string | null;
  fecha_envio: string | null;
  createdAt: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    totalRecords: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type EnviosFilter = {
  proyecto?: string;
  desde?: string;
  hasta?: string;
  page?: number;
  limit?: number;
};
