import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule,],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) { }

  onLogin() {
    // For Phase 1, simulate authentication (replace with actual backend call in Phase 2)
    if (this.authService.authenticate(this.username, this.password)) {
      this.router.navigate(['/chat']); // Navigate to chat component on successful login
    } else {
      // Handle invalid login (display error message, etc.)
      alert('Invalid username or password. Please try again.');
    }
  }
}