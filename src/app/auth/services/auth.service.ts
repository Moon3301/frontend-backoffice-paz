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

    private readonly URL = 'http://172.30.201.81:8999/api';

    constructor(private http: HttpClient) { }

    async login(loginDto: LoginDto): Promise<TokenResponseDto> {

        const response: TokenResponseDto = await firstValueFrom(this.http.post<TokenResponseDto>(`${this.URL}/auth/login`, loginDto));

        this.saveToken(response);

        return response;
    }

    logout() {
        this.removeToken();
    }

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
        localStorage.setItem('access_token', tokenResponseDto.access_token);
        localStorage.setItem('refresh_token', tokenResponseDto.refresh_token);
        localStorage.setItem('expires_in', tokenResponseDto.expires_in.toString());
        localStorage.setItem('refresh_expires_in', tokenResponseDto.refresh_expires_in.toString());
        localStorage.setItem('token_type', tokenResponseDto.token_type);
    }

    removeToken() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('expires_in');
        localStorage.removeItem('refresh_expires_in');
        localStorage.removeItem('token_type');
    }

}