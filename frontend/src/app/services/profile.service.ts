import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly apiUrl = `${environment.apiUrl}/profile`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<{ success: boolean; data: User; securityMetadata: any }> {
    return this.http.get<{ success: boolean; data: User; securityMetadata: any }>(this.apiUrl);
  }

  updateProfile(updateData: Partial<User>): Observable<{ success: boolean; data: User }> {
    return this.http.put<{ success: boolean; data: User }>(this.apiUrl, updateData);
  }

  addAllergy(allergy: string): Observable<{ success: boolean; data: User }> {
    return this.http.post<{ success: boolean; data: User }>(`${this.apiUrl}/allergies`, { allergy });
  }

  addMedication(medication: {
    name: string;
    dosage: string;
    frequency: string;
    prescribedBy: string;
  }): Observable<{ success: boolean; data: User }> {
    return this.http.post<{ success: boolean; data: User }>(`${this.apiUrl}/medications`, medication);
  }
}

