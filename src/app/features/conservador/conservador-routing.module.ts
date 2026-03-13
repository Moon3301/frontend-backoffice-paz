import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CaratulasPageComponent } from './pages/caratulas-page/caratulas-page.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'caratulas',
    pathMatch: 'full'
  },
  {
    path: 'caratulas',
    component: CaratulasPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConservadorRoutingModule { }
