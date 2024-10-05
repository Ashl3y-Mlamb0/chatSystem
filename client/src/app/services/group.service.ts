import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Group } from '../models/group.model';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment'; // Adjust path if necessary

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private apiUrl = `${environment.apiUrl}/groups`; // Base URL for group management

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Get all groups from the server (Admin only)
  getGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(this.apiUrl, {
      headers: this.authService.getHeaders(),
    });
  }

  // Get groups accessible by the current user
  getAccessibleGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(`${this.apiUrl}/accessible`, {
      headers: this.authService.getHeaders(),
    });
  }

  // Add a new group (Admin only)
  addGroup(groupName: string): Observable<Group> {
    const newGroup = {
      name: groupName,
      admins: [this.authService.getCurrentUser().id],
      channels: [],
      joinRequests: [],
    };
    return this.http.post<Group>(this.apiUrl, newGroup, {
      headers: this.authService.getHeaders(),
    });
  }

  // Fetch a specific group by ID
  getGroupById(groupId: string): Observable<Group> {
    return this.http.get<Group>(`${this.apiUrl}/${groupId}`, {
      headers: this.authService.getHeaders(),
    });
  }

  // Update an existing group (Admin only)
  updateGroup(updatedGroup: Group): Observable<Group> {
    return this.http.put<Group>(
      `${this.apiUrl}/${updatedGroup._id}`,
      updatedGroup,
      { headers: this.authService.getHeaders() }
    );
  }

  // Delete a group (Admin only)
  deleteGroup(groupId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${groupId}`, {
      headers: this.authService.getHeaders(),
    });
  }

  // Add a join request to a group
  addJoinRequest(groupId: string, userId: string): Observable<Group> {
    return this.http.post<Group>(
      `${this.apiUrl}/${groupId}/join`,
      { userId },
      { headers: this.authService.getHeaders() }
    );
  }

  // Get join requests for a specific group
  getJoinRequests(groupId: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/${groupId}/joinRequests`, {
      headers: this.authService.getHeaders(),
    });
  }

  // Approve a join request (Admin only)
  approveJoinRequest(groupId: string, userId: string): Observable<Group> {
    return this.http.put<Group>(
      `${this.apiUrl}/${groupId}/joinRequests/approve`,
      { userId },
      { headers: this.authService.getHeaders() }
    );
  }

  // Reject a join request (Admin only)
  rejectJoinRequest(groupId: string, userId: string): Observable<Group> {
    return this.http.put<Group>(
      `${this.apiUrl}/${groupId}/joinRequests/reject`,
      { userId },
      { headers: this.authService.getHeaders() }
    );
  }
}
