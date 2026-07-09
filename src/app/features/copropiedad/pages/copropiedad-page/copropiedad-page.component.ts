import { Component } from '@angular/core';

@Component({
  selector: 'app-copropiedad-page',
  standalone: false,
  templateUrl: './copropiedad-page.component.html',
  styleUrl: './copropiedad-page.component.css',
})
export class CopropiedadPageComponent {
  activeTab: number = 0;
}
