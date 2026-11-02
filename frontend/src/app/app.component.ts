import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { JweModalComponent } from './components/jwe-modal/jwe-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, JweModalComponent],
  template: `
    <app-navbar (openJweInspector)="showJweInspector = true"></app-navbar>
    <main>
      <router-outlet></router-outlet>
    </main>
    <app-jwe-modal *ngIf="showJweInspector" (close)="showJweInspector = false"></app-jwe-modal>

    <footer class="app-footer">
      <div class="container footer-content">
        <div class="footer-left">
          <strong>MediVault Secure Healthcare Identity</strong> &bull; Protected with JWE (RFC 7516) & Bcrypt
        </div>
        <div class="footer-right">
          <span>Standard: NIST SP 800-38D AES-GCM</span>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    main {
      min-height: calc(100vh - 72px - 60px);
    }
    .app-footer {
      border-top: 1px solid var(--border-subtle);
      background: rgba(11, 15, 25, 0.95);
      padding: 1.25rem 0;
      font-size: 0.8rem;
      color: var(--text-dim);
    }
    .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .footer-left strong {
      color: var(--text-muted);
    }
  `]
})
export class AppComponent {
  showJweInspector = false;
}

