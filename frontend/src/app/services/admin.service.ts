import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[]; // User's explicit custom permissions
  roleDefaultPermissions: string[]; // Permissions inherited from role
  active?: boolean;
}

export interface Permission {
  id: number;
  name: string;
  description?: string;
  category?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/tricol/api/v2'}/admin`;

  getAllUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.apiUrl}/users`);
  }

  assignRole(userId: number, roleName: string): Observable<string> {
    const params = new HttpParams().set('roleName', roleName);
    return this.http.post(`${this.apiUrl}/users/${userId}/assign-role`, null, { 
      params,
      responseType: 'text'
    });
  }

  updateUserPermission(userId: number, permissionId: number, granted: boolean): Observable<string> {
    const params = new HttpParams().set('granted', granted.toString());
    return this.http.post(`${this.apiUrl}/users/${userId}/permissions/${permissionId}`, null, { 
      params,
      responseType: 'text'
    });
  }

  removeUserPermission(userId: number, permissionId: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/users/${userId}/permissions/${permissionId}`, {
      responseType: 'text'
    });
  }
}
