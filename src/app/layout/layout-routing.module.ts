import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './main-layout/main-layout.component';
import { adminGuard, moduloGuard } from '../core/guards/permisos.guard';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        loadChildren: () => import('../features/home/home.module').then(m => m.HomeModule)
      },
      {
        path: 'conservador',
        canActivate: [moduloGuard('conservador')],
        loadChildren: () => import('../features/conservador/conservador.module').then(m => m.ConservadorModule)
      },
      {
        path: 'copropiedad',
        canActivate: [moduloGuard('copropiedad')],
        loadChildren: () => import('../features/copropiedad/copropiedad.module').then(m => m.CopropiedadModule)
      },
      {
        path: 'negocios',
        canActivate: [moduloGuard('negocios')],
        loadChildren: () => import('../features/negocios/negocios.module').then(m => m.NegociosModule)
      },
      {
        path: 'leads',
        canActivate: [moduloGuard('leads')],
        loadChildren: () => import('../features/testing-leads/testing-leads.module').then(m => m.TestingLeadsModule)
      },
      {
        path: 'usuarios',
        canActivate: [adminGuard],
        loadChildren: () => import('../features/usuarios/usuarios.module').then(m => m.UsuariosModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule { }
