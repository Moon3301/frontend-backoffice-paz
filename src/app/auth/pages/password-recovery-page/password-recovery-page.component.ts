import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-password-recovery-page',
  standalone: false,
  templateUrl: './password-recovery-page.component.html',
  styleUrl: './password-recovery-page.component.css'
})
export class PasswordRecoveryPageComponent {

  recoveryForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.recoveryForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.recoveryForm.valid) {
      console.log('Recovery form submitted:', this.recoveryForm.value);
      // Here you would typically call your password recovery service
    } else {
      this.recoveryForm.markAllAsTouched();
    }
  }

}
