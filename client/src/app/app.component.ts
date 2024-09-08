import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router, RouterLink, RouterOutlet, NavigationStart, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common'; // Import CommonModule


@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [RouterOutlet, RouterLink, CommonModule]
})
export class AppComponent implements OnInit {
  constructor(public authService: AuthService, private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        if (!this.authService.getCurrentUser()) {
          // If not logged in, redirect to login except when on the login or signup pages
          if (this.router.url !== '/login' && this.router.url !== '/signup') {
            this.router.navigate(['/login']);
          }
        } else {
          // If logged in, redirect to home when on the login page
          if (this.router.url === '/login') {
            this.router.navigate(['/']);
          }
        }
      });
  }

  ngOnInit() {
    if (!this.authService.getCurrentUser()) {
      // On initial load, if not logged in, and not on login or signup, redirect to login
      if (this.router.url !== '/login' && this.router.url !== '/signup') {
        this.router.navigate(['/login']);
      }
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}