import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="landing-page">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="container hero-content">
          <div class="hero-badge-wrap">
            <span class="hero-pill">
              <span class="pulsing-shield">🛡️</span>
              Next-Gen Medical Data Confidentiality
            </span>
            <span class="spec-pill">RFC 7516 JWE &bull; AES-256-GCM</span>
          </div>

          <h1 class="hero-title">
            Zero-Leak Medical Vault <br/>
            Powered by <span class="gradient-text">Encrypted JWE</span>
          </h1>

          <p class="hero-description">
            Standard JWT (JWS) exposes sensitive patient identity and metadata in plain Base64.
            <strong>MediVault</strong> encrypts the authentication payload with military-grade 
            <strong>AES-256-GCM</strong> and hashes credentials with <strong>Bcrypt</strong>, guaranteeing total 
            HIPAA-level confidentiality across the wire.
          </p>

          <div class="hero-actions">
            <ng-container *ngIf="authService.isLoggedIn(); else guestActions">
              <a routerLink="/profile" class="btn btn-primary btn-lg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Open My Medical Profile
              </a>
            </ng-container>
            <ng-template #guestActions>
              <a routerLink="/login" class="btn btn-primary btn-lg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Secure Sign In & Access Records
              </a>
              <a href="#comparison" class="btn btn-secondary btn-lg">Compare JWS vs JWE</a>
            </ng-template>
          </div>

          <!-- Quick Test Accounts preview -->
          <div class="demo-card-wrap">
            <div class="demo-card-header">
              <span class="quick-test-tag">⚡ Quick 1-Click Test Access</span>
              <span class="note-text">Click any patient to test immediate encrypted login</span>
            </div>
            <div class="demo-grid">
              <div class="demo-patient-card" *ngFor="let user of demoUsers" (click)="quickLogin(user.email, user.password)">
                <div class="patient-card-top">
                  <div>
                    <h4 class="patient-name">{{ user.name }}</h4>
                    <span class="patient-role">{{ user.role }}</span>
                  </div>
                  <span class="badge badge-cyan">{{ user.badge }}</span>
                </div>
                <div class="patient-meta">
                  <span class="email-label">{{ user.email }}</span>
                  <span class="note-pill">{{ user.note }}</span>
                </div>
                <div class="instant-login-action">
                  <span>Log in with this Profile &rarr;</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Key Pillars Section -->
      <section class="features-section">
        <div class="container">
          <div class="section-heading text-center">
            <span class="badge badge-purple">Enterprise Security Architecture</span>
            <h2>Why Healthcare Demands JWE Instead of Ordinary JWT</h2>
            <p class="section-subtext">Ordinary JWT tokens only provide integrity, not confidentiality. JWE provides both.</p>
          </div>

          <div class="features-grid">
            <div class="feature-card">
              <div class="feat-icon feat-cipher">🔐</div>
              <h3>5-Part Ciphertext Payload</h3>
              <p>Unlike 3-part signed tokens, JWE incorporates Header, Encrypted Key, IV, Ciphertext, and Auth Tag to ensure the payload is unreadable without the server key.</p>
            </div>

            <div class="feature-card">
              <div class="feat-icon feat-bcrypt">🔑</div>
              <h3>Bcrypt Salted Hashes</h3>
              <p>User passwords are salted with 10 rounds of cryptographic bcrypt, defending against rainbow tables, brute-force attacks, and credential stuffing.</p>
            </div>

            <div class="feature-card">
              <div class="feat-icon feat-health">📋</div>
              <h3>Comprehensive Health Profile</h3>
              <p>Once authenticated, patients view rich records: Blood Type, Allergies, Active Prescriptions, Vitals, Primary Care Physician, and Immunizations.</p>
            </div>

            <div class="feature-card">
              <div class="feat-icon feat-guard">🛡️</div>
              <h3>NestJS Decryption Guard</h3>
              <p>The backend NestJS guard automatically intercepts incoming JWE Bearer tokens, decrypts the ciphertext in memory, and validates authenticity before returning data.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Architectural Comparison Section -->
      <section id="comparison" class="comparison-section">
        <div class="container">
          <div class="section-heading text-center">
            <span class="badge badge-emerald">Direct Comparison</span>
            <h2>JSON Web Signature (JWS) vs JSON Web Encryption (JWE)</h2>
          </div>

          <div class="comparison-table-wrapper glass-panel">
            <table class="comparison-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Standard JWT (JWS - RFC 7519)</th>
                  <th class="highlight-col">MediVault Token (JWE - RFC 7516)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Token Structure</strong></td>
                  <td>3 parts: <code>header.payload.signature</code></td>
                  <td class="highlight-col"><strong>5 parts:</strong> <code>header.key.iv.ciphertext.tag</code></td>
                </tr>
                <tr>
                  <td><strong>Payload Visibility</strong></td>
                  <td><span class="status-risk">Plaintext Base64</span> (Visible to anyone)</td>
                  <td class="highlight-col"><span class="status-safe">Encrypted AES-256</span> (Totally concealed)</td>
                </tr>
                <tr>
                  <td><strong>Medical Data Suitability</strong></td>
                  <td>Unsafe for sensitive claims / IDs</td>
                  <td class="highlight-col"><strong class="status-safe">HIPAA / GDPR Ready</strong></td>
                </tr>
                <tr>
                  <td><strong>Key Management</strong></td>
                  <td>HMAC / RSA signature only</td>
                  <td class="highlight-col"><code>A256GCMKW</code> symmetric key wrapping</td>
                </tr>
                <tr>
                  <td><strong>Tamper Proofing</strong></td>
                  <td>Cryptographic signature</td>
                  <td class="highlight-col">Authenticated Encryption with Auth Tag (AEAD)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .landing-page {
      padding-bottom: 5rem;
    }
    .hero-section {
      padding: 5rem 0 4rem;
      position: relative;
    }
    .hero-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .hero-badge-wrap {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.75rem;
      flex-wrap: wrap;
      justify-content: center;
    }
    .hero-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(14, 165, 233, 0.12);
      border: 1px solid rgba(14, 165, 233, 0.3);
      padding: 0.4rem 1rem;
      border-radius: var(--radius-full);
      font-size: 0.85rem;
      font-weight: 600;
      color: #38bdf8;
    }
    .spec-pill {
      background: rgba(20, 184, 166, 0.12);
      border: 1px solid rgba(20, 184, 166, 0.3);
      padding: 0.4rem 0.85rem;
      border-radius: var(--radius-full);
      font-size: 0.8rem;
      font-weight: 600;
      color: #5eead4;
      font-family: var(--font-mono);
    }
    .hero-title {
      font-size: 3.5rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      margin-bottom: 1.5rem;
      max-width: 900px;
    }
    .gradient-text {
      background: linear-gradient(135deg, #38bdf8 0%, #2dd4bf 50%, #818cf8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero-description {
      font-size: 1.2rem;
      color: var(--text-muted);
      max-width: 760px;
      margin-bottom: 2.5rem;
      line-height: 1.7;
    }
    .hero-actions {
      display: flex;
      gap: 1rem;
      margin-bottom: 3.5rem;
      flex-wrap: wrap;
      justify-content: center;
    }
    .btn-lg {
      padding: 0.95rem 1.85rem;
      font-size: 1.05rem;
      border-radius: var(--radius-md);
    }

    /* Demo Quick Test Card */
    .demo-card-wrap {
      width: 100%;
      max-width: 860px;
      background: rgba(19, 27, 46, 0.6);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(14, 165, 233, 0.25);
      border-radius: var(--radius-lg);
      padding: 1.75rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    }
    .demo-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .quick-test-tag {
      font-weight: 700;
      font-size: 0.95rem;
      color: #38bdf8;
    }
    .note-text {
      font-size: 0.85rem;
      color: var(--text-dim);
    }
    .demo-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .demo-patient-card {
      background: rgba(11, 15, 25, 0.7);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 1.25rem;
      cursor: pointer;
      text-align: left;
      transition: all 0.25s ease;
    }
    .demo-patient-card:hover {
      border-color: #0ea5e9;
      transform: translateY(-3px);
      box-shadow: 0 10px 25px rgba(14, 165, 233, 0.2);
    }
    .patient-card-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }
    .patient-name {
      font-size: 1.05rem;
      color: #fff;
    }
    .patient-role {
      font-size: 0.8rem;
      color: var(--text-dim);
      display: block;
    }
    .patient-meta {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      margin-bottom: 1rem;
    }
    .email-label {
      font-family: var(--font-mono);
      font-size: 0.8rem;
      color: #7dd3fc;
    }
    .note-pill {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .instant-login-action {
      font-size: 0.825rem;
      font-weight: 600;
      color: #2dd4bf;
    }

    /* Features */
    .features-section {
      padding: 5rem 0;
    }
    .section-heading {
      margin-bottom: 3rem;
    }
    .section-heading h2 {
      font-size: 2.25rem;
      margin: 0.75rem 0 0.5rem;
    }
    .section-subtext {
      color: var(--text-muted);
      font-size: 1.1rem;
    }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1.5rem;
    }
    .feature-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 1.75rem;
      transition: transform 0.2s;
    }
    .feature-card:hover {
      transform: translateY(-4px);
      border-color: rgba(14, 165, 233, 0.3);
    }
    .feat-icon {
      font-size: 2rem;
      margin-bottom: 1rem;
    }
    .feature-card h3 {
      font-size: 1.15rem;
      margin-bottom: 0.6rem;
    }
    .feature-card p {
      font-size: 0.9rem;
      color: var(--text-muted);
      line-height: 1.6;
    }

    /* Comparison Table */
    .comparison-section {
      padding: 4rem 0 2rem;
    }
    .comparison-table-wrapper {
      margin-top: 2rem;
      overflow-x: auto;
      border-radius: var(--radius-lg);
    }
    .comparison-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    .comparison-table th, .comparison-table td {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border-subtle);
      font-size: 0.95rem;
    }
    .comparison-table th {
      background: rgba(255, 255, 255, 0.02);
      font-weight: 700;
      color: #cbd5e1;
    }
    .highlight-col {
      background: rgba(14, 165, 233, 0.05);
      border-left: 1px solid rgba(14, 165, 233, 0.15);
      border-right: 1px solid rgba(14, 165, 233, 0.15);
      color: #fff;
    }
    .status-risk {
      color: #fb7185;
      font-weight: 600;
    }
    .status-safe {
      color: #34d399;
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .hero-title { font-size: 2.25rem; }
      .demo-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class LandingComponent implements OnInit {
  demoUsers: any[] = [];

  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.getDemoUsers().subscribe({
      next: (users) => (this.demoUsers = users),
      error: () => {
        this.demoUsers = [
          {
            email: 'alex.rivera@medivault.io',
            password: 'password123',
            name: 'Alex Rivera, M.Sc.',
            role: 'Patient / Research Scientist',
            badge: 'Blood O-',
            note: 'Has chronic asthma record & penicillin allergy',
          },
          {
            email: 'sarah.jenkins@healthgrid.org',
            password: 'password123',
            name: 'Dr. Sarah Jenkins',
            role: 'Chief of Medicine',
            badge: 'Blood A+',
            note: 'Has migraine records & sulfa allergy',
          },
        ];
      }
    });
  }

  quickLogin(email: string, pass: string) {
    this.router.navigate(['/login'], { queryParams: { email } });
  }
}

