export type CaratulasResponseDto = {
    id: number;
    numero_caratula: number;
    anio: number;
    estado_actual: string;
    ruta_documento: string;
    rut: string;
    estado_codigo: string;
    seccion_codigo: string;
    seccion_nombre: string;
    fecha_estado: string;
    historiales: CaratulaHistorial[];
    documentos: Documento[];
    createdAt: Date;
    updatedAt: Date;
}


export type CaratulaHistorial = {
    id: number;
    estado_registrado: string;
    observacion: string;
    fecha_registro: string;
}

export type Documento = {
    id: number;
    tipoDocumento: string;
    key: string;
    enlace: string;
    ruta_local: string;
    createdAt: Date;
}


