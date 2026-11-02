import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page-container">
      <div class="auth-card glass-panel">
        <!-- Logo / Title -->
        <div class="auth-header">
          <div class="auth-icon-badge">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <circle cx="12" cy="11" r="3"/>
            </svg>
          </div>
          <h2>{{ isRegister ? 'Register Patient Account' : 'Secure Patient Login' }}</h2>
          <p class="auth-subtitle">
            {{ isRegister ? 'Create encrypted medical identity with Bcrypt & JWE' : 'Enter credentials to generate your encrypted JWE session token' }}
          </p>
        </div>

        <!-- Mode Switcher -->
        <div class="tab-switcher">
          <button [class.active]="!isRegister" (click)="setMode(false)" type="button">Sign In</button>
          <button [class.active]="isRegister" (click)="setMode(true)" type="button">Register New Patient</button>
        </div>

        <!-- Demo Accounts Quick Prefill Buttons (Sign In Mode) -->
        <div class="demo-prefill-box" *ngIf="!isRegister">
          <span class="prefill-title">⚡ Instant Demo Prefill:</span>
          <div class="prefill-buttons">
            <button type="button" class="btn-prefill" (click)="prefill('alex.rivera@medivault.io', 'password123')">
              Alex Rivera (Asthma / O-)
            </button>
            <button type="button" class="btn-prefill" (click)="prefill('sarah.jenkins@healthgrid.org', 'password123')">
              Dr. Sarah Jenkins (A+)
            </button>
          </div>
        </div>

        <!-- Error Notification -->
        <div class="error-banner animate-fade-in" *ngIf="errorMessage">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Login Form -->
        <form *ngIf="!isRegister" (ngSubmit)="handleLogin()" class="auth-form">
          <div class="form-group">
            <label class="form-label" for="login-email">Patient Email Address</label>
            <input
              id="login-email"
              type="email"
              [(ngModel)]="loginEmail"
              name="email"
              required
              class="form-control"
              placeholder="e.g. alex.rivera@medivault.io"
              autocomplete="email"
            />
          </div>

          <div class="form-group">
            <div class="label-flex">
              <label class="form-label" for="login-password">Password</label>
              <span class="password-hint">Bcrypt Protected</span>
            </div>
            <input
              id="login-password"
              type="password"
              [(ngModel)]="loginPassword"
              name="password"
              required
              class="form-control"
              placeholder="••••••••••••"
              autocomplete="current-password"
            />
          </div>

          <button type="submit" [disabled]="loading" class="btn btn-primary btn-submit">
            <span *ngIf="loading" class="spinner"></span>
            <span *ngIf="!loading">Sign In & Generate JWE Token</span>
          </button>
        </form>

        <!-- Register Form -->
        <form *ngIf="isRegister" (ngSubmit)="handleRegister()" class="auth-form">
          <div class="form-group">
            <label class="form-label" for="reg-name">Full Legal Name</label>
            <input
              id="reg-name"
              type="text"
              [(ngModel)]="regFullName"
              name="fullName"
              required
              class="form-control"
              placeholder="e.g. Jane Doe, M.D."
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="reg-email">Email Address</label>
            <input
              id="reg-email"
              type="email"
              [(ngModel)]="regEmail"
              name="email"
              required
              class="form-control"
              placeholder="e.g. jane.doe@hospital.org"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="reg-phone">Phone Number</label>
            <input
              id="reg-phone"
              type="tel"
              [(ngModel)]="regPhone"
              name="phone"
              class="form-control"
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="reg-pass">Create Password (min 6 characters)</label>
            <input
              id="reg-pass"
              type="password"
              [(ngModel)]="regPassword"
              name="password"
              required
              minlength="6"
              class="form-control"
              placeholder="Enter strong password"
            />
          </div>

          <div class="form-row">
            <div class="form-group form-col">
              <label class="form-label">City</label>
              <input type="text" [(ngModel)]="regCity" name="city" class="form-control" placeholder="City" />
            </div>
            <div class="form-group form-col">
              <label class="form-label">State / Region</label>
              <input type="text" [(ngModel)]="regState" name="state" class="form-control" placeholder="State" />
            </div>
          </div>

          <button type="submit" [disabled]="loading" class="btn btn-primary btn-submit">
            <span *ngIf="loading" class="spinner"></span>
            <span *ngIf="!loading">Register & Issue JWE Token</span>
          </button>
        </form>

        <!-- Cryptographic Footer Note -->
        <div class="auth-crypto-footer">
          <div class="crypto-note">
            <span class="crypto-icon">🔒</span>
            <span>
              <strong>JWE Authentication Standard:</strong> Tokens issued are 5-part encrypted JSON Web Tokens (AES-256-GCM). Passwords are never stored in plaintext and hashed with <strong>Bcrypt</strong>.
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page-container {
      min-height: calc(100vh - 120px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2.5rem 1rem;
    }
    .auth-card {
      max-width: 520px;
      width: 100%;
      padding: 2.5rem;
      border-radius: var(--radius-lg);
    }
    .auth-header {
      text-align: center;
      margin-bottom: 1.75rem;
    }
    .auth-icon-badge {
      width: 54px;
      height: 54px;
      border-radius: 16px;
      background: linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%);
      color: #fff;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
      box-shadow: 0 8px 20px rgba(14, 165, 233, 0.35);
    }
    .auth-header h2 {
      font-size: 1.75rem;
      margin-bottom: 0.4rem;
    }
    .auth-subtitle {
      font-size: 0.875rem;
      color: var(--text-muted);
      line-height: 1.5;
    }

    .tab-switcher {
      display: flex;
      background: rgba(11, 15, 25, 0.8);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 4px;
      margin-bottom: 1.5rem;
    }
    .tab-switcher button {
      flex: 1;
      padding: 0.65rem 0.5rem;
      border: none;
      background: none;
      color: var(--text-muted);
      font-weight: 600;
      font-size: 0.875rem;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all 0.2s;
    }
    .tab-switcher button.active {
      background: rgba(14, 165, 233, 0.2);
      color: #38bdf8;
      border: 1px solid rgba(14, 165, 233, 0.3);
    }

    .demo-prefill-box {
      background: rgba(14, 165, 233, 0.06);
      border: 1px dashed rgba(14, 165, 233, 0.3);
      border-radius: var(--radius-sm);
      padding: 0.75rem;
      margin-bottom: 1.5rem;
    }
    .prefill-title {
      display: block;
      font-size: 0.75rem;
      font-weight: 700;
      color: #7dd3fc;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .prefill-buttons {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .btn-prefill {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #f1f5f9;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.35rem 0.65rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-prefill:hover {
      background: rgba(14, 165, 233, 0.25);
      border-color: #38bdf8;
      color: #fff;
    }

    .error-banner {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      background: rgba(244, 63, 94, 0.15);
      border: 1px solid rgba(244, 63, 94, 0.35);
      color: #fb7185;
      padding: 0.75rem 1rem;
      border-radius: var(--radius-sm);
      margin-bottom: 1.25rem;
      font-size: 0.85rem;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
    }
    .label-flex {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .password-hint {
      font-size: 0.75rem;
      color: #34d399;
      font-weight: 500;
    }
    .form-row {
      display: flex;
      gap: 0.75rem;
    }
    .form-col {
      flex: 1;
    }
    .btn-submit {
      width: 100%;
      margin-top: 0.5rem;
      padding: 0.85rem;
    }

    .auth-crypto-footer {
      margin-top: 2rem;
      padding-top: 1.25rem;
      border-top: 1px solid var(--border-subtle);
    }
    .crypto-note {
      display: flex;
      gap: 0.65rem;
      font-size: 0.78rem;
      color: var(--text-dim);
      line-height: 1.5;
    }
    .crypto-icon {
      font-size: 1rem;
    }

    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class LoginComponent implements OnInit {
  isRegister = false;
  loading = false;
  errorMessage = '';

  loginEmail = '';
  loginPassword = '';

  regFullName = '';
  regEmail = '';
  regPhone = '';
  regPassword = '';
  regCity = 'San Francisco';
  regState = 'California';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/profile']);
      return;
    }

    this.route.queryParams.subscribe((params) => {
      if (params['email']) {
        this.loginEmail = params['email'];
        this.loginPassword = 'password123';
      }
    });
  }

  setMode(register: boolean) {
    this.isRegister = register;
    this.errorMessage = '';
  }

  prefill(email: string, pass: string) {
    this.loginEmail = email;
    this.loginPassword = pass;
    this.errorMessage = '';
  }

  handleLogin() {
    if (!this.loginEmail || !this.loginPassword) {
      this.errorMessage = 'Please provide both email and password.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login({ email: this.loginEmail, password: this.loginPassword }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/profile']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Authentication failed. Please verify credentials.';
      },
    });
  }

  handleRegister() {
    if (!this.regFullName || !this.regEmail || !this.regPassword) {
      this.errorMessage = 'Please complete all required fields.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService
      .register({
        fullName: this.regFullName,
        email: this.regEmail,
        password: this.regPassword,
        phone: this.regPhone,
        address: {
          city: this.regCity,
          state: this.regState,
          country: 'United States',
          street: '123 Medical Park Ave',
          zipCode: '90001',
        },
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/profile']);
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err?.error?.message || 'Registration failed.';
        },
      });
  }
}

