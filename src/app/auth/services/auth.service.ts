import { Injectable } from "@angular/core";
import { TokenResponseDto } from "../dto/token-response.dto";
import { BehaviorSubject, firstValueFrom } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { LoginDto } from "../dto/login.dto";
import { API_URL } from "../../../environments/environments";
import { CodigoModulo, PerfilUsuario } from "../../core/permisos/modulos";

/** Clave donde se recuerda el correo si el usuario marca "Recordar mi correo". */
const CLAVE_EMAIL_RECORDADO = 'paz-email-recordado';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private readonly URL = API_URL;

    private readonly perfilSubject = new BehaviorSubject<PerfilUsuario | null>(null);
    /** Perfil de la sesión (rol y módulos). null hasta validar la sesión. */
    readonly perfil$ = this.perfilSubject.asObservable();

    private lastValidatedAt: number | null = null;

    constructor(private http: HttpClient) { }

    get perfil(): PerfilUsuario | null {
        return this.perfilSubject.value;
    }

    get esAdmin(): boolean {
        return this.perfil?.rol === 'admin';
    }

    /** Un admin accede a todo; un usuario, solo a sus módulos asignados. */
    tieneModulo(modulo: CodigoModulo): boolean {
        const p = this.perfil;
        return !!p && (p.rol === 'admin' || p.modulos.includes(modulo));
    }

    async login(loginDto: LoginDto): Promise<TokenResponseDto> {

        const response: TokenResponseDto = await firstValueFrom(this.http.post<TokenResponseDto>(`${this.URL}/auth/login`, loginDto));

        this.saveToken(response);
        // Carga rol y módulos de inmediato para armar el menú sin esperar.
        await this.validateSession(true);

        return response;
    }

    logout() {
        this.removeToken();
    }

    /**
     * Verifica localmente si el access_token está expirado decodificando
     * el payload del JWT (claim `exp`). Aplica un margen de 30s para no
     * aceptar tokens a punto de vencer.
     */
    isTokenExpired(): boolean {
        const token = localStorage.getItem('access_token');
        if (!token) return true;

        try {
            const payloadBase64 = token.split('.')[1];
            const payload = JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')));
            if (!payload.exp) return false; // sin exp: no podemos validar localmente
            const margenMs = 30 * 1000;
            return (payload.exp * 1000) - margenMs <= Date.now();
        } catch {
            // Token malformado: tratarlo como expirado
            return true;
        }
    }

    /**
     * Confirma contra el backend (GET /auth/me) que la sesión es válida y trae
     * el perfil (rol y módulos). Cachea la última validación exitosa por 5
     * minutos para no golpear el backend en cada navegación; `forzar` la omite.
     */
    async validateSession(forzar = false): Promise<boolean> {
        const CACHE_MS = 5 * 60 * 1000;
        if (!forzar && this.perfil && this.lastValidatedAt && (Date.now() - this.lastValidatedAt) < CACHE_MS) {
            return true;
        }

        try {
            const perfil = await firstValueFrom(this.http.get<PerfilUsuario>(`${this.URL}/auth/me`));
            this.perfilSubject.next({
                sub: perfil.sub,
                email: perfil.email,
                nombre: perfil.nombre,
                rol: perfil.rol,
                modulos: perfil.modulos ?? [],
            });
            this.lastValidatedAt = Date.now();
            return true;
        } catch {
            this.lastValidatedAt = null;
            this.perfilSubject.next(null);
            return false;
        }
    }

    // ─── "Recordar mi correo" ────────────────────────────────────────────────

    get emailRecordado(): string | null {
        try { return localStorage.getItem(CLAVE_EMAIL_RECORDADO); } catch { return null; }
    }

    recordarEmail(email: string | null): void {
        try {
            if (email) localStorage.setItem(CLAVE_EMAIL_RECORDADO, email);
            else localStorage.removeItem(CLAVE_EMAIL_RECORDADO);
        } catch { /* sin storage: no se recuerda */ }
    }

    saveToken(tokenResponseDto: TokenResponseDto) {
        localStorage.setItem('access_token', tokenResponseDto.access_token);
        localStorage.setItem('refresh_token', tokenResponseDto.refresh_token);
        localStorage.setItem('expires_in', tokenResponseDto.expires_in.toString());
        localStorage.setItem('refresh_expires_in', tokenResponseDto.refresh_expires_in.toString());
        localStorage.setItem('token_type', tokenResponseDto.token_type);
    }

    removeToken() {
        this.lastValidatedAt = null;
        this.perfilSubject.next(null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('expires_in');
        localStorage.removeItem('refresh_expires_in');
        localStorage.removeItem('token_type');
    }

}
