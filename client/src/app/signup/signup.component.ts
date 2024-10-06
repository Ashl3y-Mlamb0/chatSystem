import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent {
  username = '';
  email = '';
  password = '';
  errorMessage = ''; // To store the error message

  constructor(private authService: AuthService, private router: Router) {}

  onSignup() {
    this.authService
      .signup(this.username, this.email, this.password)
      .subscribe({
        next: (response) => {
          console.log('Signup successful:', response);
          // Redirect to home or another page after successful signup
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('Signup failed:', err);
          // Set the error message
          this.errorMessage =
            'Signup failed. Username or email might already be in use.';
        },
      });
  }
}
