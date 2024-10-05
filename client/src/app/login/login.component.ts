import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';  // To display any error message

  constructor(private authService: AuthService, private router: Router) { }

  onLogin() {
    this.authService.authenticate(this.username, this.password).subscribe({
      next: (user) => {
        // If login is successful, navigate to the chat page
        this.router.navigate(['/chat']);
      },
      error: (err) => {
        // Handle error, such as invalid credentials
        this.errorMessage = 'Invalid username or password. Please try again.';
        console.error('Login error:', err);
      }
    });
  }
}
