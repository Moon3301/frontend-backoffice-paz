import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './main-layout/main-layout.component';

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
        loadChildren: () => import('../features/conservador/conservador.module').then(m => m.ConservadorModule)
      },
      {
        path: 'copropiedad',
        loadChildren: () => import('../features/copropiedad/copropiedad.module').then(m => m.CopropiedadModule)
      },
      {
        path: 'leads',
        loadChildren: () => import('../features/testing-leads/testing-leads.module').then(m => m.TestingLeadsModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule { }
