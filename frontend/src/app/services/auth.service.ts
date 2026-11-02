import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { User, AuthResponse, JweInspection } from '../models/user.model';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'jwe_access_token';
  private readonly USER_KEY = 'jwe_user_profile';
  private readonly INSPECTION_KEY = 'jwe_token_inspection';

  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  private inspectionSubject = new BehaviorSubject<JweInspection | null>(this.getStoredInspection());
  public inspection$ = this.inspectionSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  private getStoredUser(): User | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  private getStoredInspection(): JweInspection | null {
    const raw = localStorage.getItem(this.INSPECTION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getDemoUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/demo-users`);
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res) => {
        if (res.accessToken) {
          localStorage.setItem(this.TOKEN_KEY, res.accessToken);
          if (res.user) {
            localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
            this.currentUserSubject.next(res.user);
          }
          if (res.tokenInspection) {
            localStorage.setItem(this.INSPECTION_KEY, JSON.stringify(res.tokenInspection));
            this.inspectionSubject.next(res.tokenInspection);
          }
        }
      }),
      catchError((err) => {
        return throwError(() => err);
      }),
    );
  }

  register(userData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap((res) => {
        if (res.accessToken) {
          localStorage.setItem(this.TOKEN_KEY, res.accessToken);
          if (res.user) {
            localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
            this.currentUserSubject.next(res.user);
          }
          if (res.tokenInspection) {
            localStorage.setItem(this.INSPECTION_KEY, JSON.stringify(res.tokenInspection));
            this.inspectionSubject.next(res.tokenInspection);
          }
        }
      }),
      catchError((err) => {
        return throwError(() => err);
      }),
    );
  }

  inspectToken(token: string): Observable<JweInspection> {
    return this.http.get<JweInspection>(`${this.apiUrl}/inspect?token=${encodeURIComponent(token)}`);
  }

  updateStoredUser(user: User) {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.INSPECTION_KEY);
    this.currentUserSubject.next(null);
    this.inspectionSubject.next(null);
    this.router.navigate(['/login']);
  }
}

