import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NegociosPageComponent } from './pages/negocios-page/negocios-page.component';

const routes: Routes = [{ path: '', component: NegociosPageComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NegociosRoutingModule {}
