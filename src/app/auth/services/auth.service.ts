import { Injectable } from "@angular/core";
import { TokenResponseDto } from "../dto/token-response.dto";
import { firstValueFrom } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { LoginDto } from "../dto/login.dto";
import { API_URL } from "../../../environments/environments";

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private readonly URL = API_URL;

    constructor(private http: HttpClient) { }

    async login(loginDto: LoginDto): Promise<TokenResponseDto> {

        const response: TokenResponseDto = await firstValueFrom(this.http.post<TokenResponseDto>(`${this.URL}/auth/login`, loginDto));

        this.saveToken(response);

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
     * Confirma contra el backend (GET /auth/me) que la sesión es válida.
     * Cachea la última validación exitosa por 5 minutos para no golpear
     * el backend en cada navegación.
     */
    async validateSession(): Promise<boolean> {
        const CACHE_MS = 5 * 60 * 1000;
        if (this.lastValidatedAt && (Date.now() - this.lastValidatedAt) < CACHE_MS) {
            return true;
        }

        try {
            await firstValueFrom(this.http.get(`${this.URL}/auth/me`));
            this.lastValidatedAt = Date.now();
            return true;
        } catch {
            this.lastValidatedAt = null;
            return false;
        }
    }

    private lastValidatedAt: number | null = null;

    register() {

    }

    forgotPassword() {

    }

    resetPassword() {

    }

    verifyEmail() {

    }

    resendVerificationEmail() {

    }


    saveToken(tokenResponseDto: TokenResponseDto) {
        // Login recién hecho: la sesión queda validada
        this.lastValidatedAt = Date.now();
        localStorage.setItem('access_token', tokenResponseDto.access_token);
        localStorage.setItem('refresh_token', tokenResponseDto.refresh_token);
        localStorage.setItem('expires_in', tokenResponseDto.expires_in.toString());
        localStorage.setItem('refresh_expires_in', tokenResponseDto.refresh_expires_in.toString());
        localStorage.setItem('token_type', tokenResponseDto.token_type);
    }

    removeToken() {
        this.lastValidatedAt = null;
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('expires_in');
        localStorage.removeItem('refresh_expires_in');
        localStorage.removeItem('token_type');
    }

}