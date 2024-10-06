import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ChatComponent } from './chat/chat.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { GroupListComponent } from './group-list/group-list.component';
import { SignupComponent } from './signup/signup.component';
import { ProfileComponent } from './profile/profile.component';

export const routes: Routes = [
  { path: '', redirectTo: '/chat', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'chat', component: ChatComponent },
  { path: 'groups', component: GroupListComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'admin', component: AdminDashboardComponent },
];
