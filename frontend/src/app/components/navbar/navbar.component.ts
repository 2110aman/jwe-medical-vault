import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="navbar-wrapper">
      <div class="container navbar-inner">
        <a routerLink="/" class="brand-logo">
          <div class="logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <circle cx="12" cy="11" r="3"/>
            </svg>
          </div>
          <div class="brand-text">
            <span class="brand-title">MediVault</span>
            <span class="brand-badge">JWE SECURED</span>
          </div>
        </a>

        <nav class="nav-links">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">Home</a>
          
          <ng-container *ngIf="authService.currentUser$ | async as user; else guestNav">
            <a routerLink="/profile" routerLinkActive="active" class="nav-link">Patient Profile</a>
            
            <button (click)="openJweInspector.emit()" class="jwe-pill-btn" title="Inspect your 5-part JWE encrypted auth token">
              <span class="jwe-dot"></span>
              <span class="jwe-text">JWE Token Active</span>
              <span class="jwe-badge">AES-256</span>
            </button>

            <div class="user-chip">
              <img [src]="user.avatarUrl" [alt]="user.fullName" class="chip-avatar" />
              <span class="chip-name">{{ user.fullName }}</span>
            </div>

            <button (click)="authService.logout()" class="btn btn-outline-danger btn-sm">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </button>
          </ng-container>

          <ng-template #guestNav>
            <a routerLink="/login" class="nav-link">Why JWE?</a>
            <a routerLink="/login" class="btn btn-primary btn-sm">Sign In / Access Portal</a>
          </ng-template>
        </nav>
      </div>
    </header>
  `,
  styles: [`
    .navbar-wrapper {
      position: sticky;
      top: 0;
      z-index: 50;
      background: rgba(11, 15, 25, 0.85);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border-subtle);
    }
    .navbar-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 72px;
    }
    .brand-logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
    }
    .logo-icon {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(14, 165, 233, 0.35);
    }
    .brand-title {
      font-size: 1.25rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #fff;
      display: block;
      line-height: 1.1;
    }
    .brand-badge {
      font-size: 0.625rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #38bdf8;
      background: rgba(14, 165, 233, 0.15);
      padding: 0.1rem 0.4rem;
      border-radius: 4px;
      display: inline-block;
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }
    .nav-link {
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--text-muted);
      transition: color 0.2s;
    }
    .nav-link:hover, .nav-link.active {
      color: #fff;
    }
    .jwe-pill-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 0.85rem;
      background: rgba(20, 184, 166, 0.1);
      border: 1px solid rgba(20, 184, 166, 0.3);
      border-radius: var(--radius-full);
      color: #5eead4;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .jwe-pill-btn:hover {
      background: rgba(20, 184, 166, 0.2);
      box-shadow: 0 0 12px rgba(20, 184, 166, 0.25);
    }
    .jwe-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 8px #10b981;
      animation: pulse 2s infinite;
    }
    .jwe-badge {
      background: rgba(20, 184, 166, 0.25);
      padding: 0.1rem 0.35rem;
      border-radius: 4px;
      font-size: 0.7rem;
      font-family: var(--font-mono);
    }
    .user-chip {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.25rem 0.75rem 0.25rem 0.35rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-full);
    }
    .chip-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      object-fit: cover;
    }
    .chip-name {
      font-size: 0.85rem;
      font-weight: 600;
      color: #f1f5f9;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }
  `]
})
export class NavbarComponent {
  @Output() openJweInspector = new EventEmitter<void>();

  constructor(public authService: AuthService) {}
}

