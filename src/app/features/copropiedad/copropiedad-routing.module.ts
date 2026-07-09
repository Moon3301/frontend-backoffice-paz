import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CopropiedadPageComponent } from './pages/copropiedad-page/copropiedad-page.component';

const routes: Routes = [
  { path: '', redirectTo: 'gestion', pathMatch: 'full' },
  { path: 'gestion', component: CopropiedadPageComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CopropiedadRoutingModule {}
