import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TestingLeadsPageComponent } from './pages/testing-leads-page/testing-leads-page.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'ingreso',
    pathMatch: 'full'
  },
  {
    path: 'ingreso',
    component: TestingLeadsPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TestingLeadsRoutingModule { }
