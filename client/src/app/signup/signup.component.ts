import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

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

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  onSignup() {
    // Call signup method from AuthService and handle response
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
          // Show alert or error message
          alert(
            'Signup failed. Username might be taken or other error occurred.'
          );
        },
      });
  }
}
