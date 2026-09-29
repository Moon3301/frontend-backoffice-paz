import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
import { MessageService } from 'primeng/api';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule
  ],
  providers: [
    provideHttpClient(withInterceptors([jwtInterceptor]), withInterceptorsFromDi()),
    provideAnimationsAsync(),
    // Instancia raíz para el toast global del layout (key "global"). Los módulos
    // que proveen su propio MessageService (ej. Copropiedad) siguen usando el suyo.
    MessageService,
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.dark-theme'
        }
      }
    })
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
