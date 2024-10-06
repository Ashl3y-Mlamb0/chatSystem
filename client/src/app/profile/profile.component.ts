import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  imports: [ReactiveFormsModule, CommonModule], // Import necessary modules for the component
})
export class ProfileComponent implements OnInit {
  user: User | null = null; // Holds the current user data
  profileForm: FormGroup; // Form for handling avatar upload
  selectedFile: File | null = null; // Holds the selected file for the avatar
  avatarPreview: string | ArrayBuffer | null = null; // For previewing the avatar

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService
  ) {
    // Initialize the profile form with the avatar control
    this.profileForm = this.fb.group({
      avatar: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  // Load current user information
  loadCurrentUser(): void {
    this.userService.getCurrentUser().subscribe({
      next: (user: User) => {
        this.user = user;
        this.avatarPreview = user?.avatar
          ? `${environment.apiRoot}${user?.avatar}`
          : null; // Current avatar
      },
      error: (err) => {
        console.error('Error loading current user:', err);
      },
    });
  }

  // Handle file input change and show avatar preview
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.avatarPreview = reader.result; // Preview the new avatar
      };
      reader.readAsDataURL(file);
    }
  }

  // Submit the form to upload a new avatar
  onSubmit(): void {
    if (this.profileForm.invalid || !this.selectedFile) {
      return;
    }

    this.userService.updateAvatar(this.selectedFile).subscribe({
      next: (updatedUser: User) => {
        this.user = updatedUser;
        alert('Avatar updated successfully!');
        this.loadCurrentUser(); // Reload user data
      },
      error: (err) => {
        console.error('Error updating avatar:', err);
        alert('Error uploading avatar.');
      },
    });
  }
}
