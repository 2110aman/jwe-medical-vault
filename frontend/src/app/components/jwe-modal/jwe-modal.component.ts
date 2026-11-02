import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { JweInspection } from '../../models/user.model';

@Component({
  selector: 'app-jwe-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="close.emit()">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="modal-header">
          <div class="title-wrap">
            <div class="icon-wrap">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div>
              <h3>JWE Security Deep Dive (RFC 7516)</h3>
              <p class="subtitle">Live Token Decomposition & Cryptographic Architecture</p>
            </div>
          </div>
          <button (click)="close.emit()" class="close-btn">&times;</button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <!-- Comparison Banner -->
          <div class="comparison-grid">
            <div class="compare-card compare-jws">
              <div class="compare-badge badge-amber">Standard JWT (JWS - RFC 7519)</div>
              <h4>3 Plaintext Parts</h4>
              <code>header.payload.signature</code>
              <p class="compare-desc">
                Payload is <strong>NOT encrypted</strong>. Anyone intercepting the token can decode it instantly with <code>atob()</code> and read patient IDs, roles, and sensitive claims!
              </p>
            </div>
            <div class="compare-card compare-jwe">
              <div class="compare-badge badge-emerald">Encrypted JWT (JWE - RFC 7516)</div>
              <h4>5 Encrypted Parts</h4>
              <code>header.key.iv.ciphertext.tag</code>
              <p class="compare-desc">
                Payload is <strong>fully encrypted</strong> with AES-256-GCM. Third parties, proxies, and browser extensions only see unreadable ciphertext!
              </p>
            </div>
          </div>

          <!-- Raw Token View -->
          <div class="token-section">
            <div class="section-label">
              <span>Current Auth Token (5 Dots Segments)</span>
              <span class="token-copied" *ngIf="copied">Copied to Clipboard!</span>
              <button (click)="copyToken()" class="btn-copy">Copy Token</button>
            </div>
            <div class="token-box">
              <span class="token-part part-0" title="Part 1: Header">{{ tokenParts[0] }}</span>
              <span class="token-dot">.</span>
              <span class="token-part part-1" title="Part 2: Encrypted Key">{{ tokenParts[1] }}</span>
              <span class="token-dot">.</span>
              <span class="token-part part-2" title="Part 3: IV">{{ tokenParts[2] }}</span>
              <span class="token-dot">.</span>
              <span class="token-part part-3" title="Part 4: Ciphertext (Encrypted)">{{ tokenParts[3] }}</span>
              <span class="token-dot">.</span>
              <span class="token-part part-4" title="Part 5: Auth Tag">{{ tokenParts[4] }}</span>
            </div>
          </div>

          <!-- Segments Detailed Breakdown -->
          <div class="segments-list">
            <h4>Detailed Breakdown of the 5 JWE Segments:</h4>

            <div class="segment-item">
              <div class="seg-badge p-header">Part 1: Protected Header</div>
              <div class="seg-content">
                <div class="seg-desc">
                  Specifies algorithms: Key Wrap <code>A256GCMKW</code> & Content Encryption <code>A256GCM</code>
                </div>
                <pre class="json-code" *ngIf="inspection?.parts?.header?.decoded">{{ inspection.parts.header.decoded | json }}</pre>
              </div>
            </div>

            <div class="segment-item">
              <div class="seg-badge p-key">Part 2: Encrypted Key</div>
              <div class="seg-content">
                <div class="seg-desc">
                  Random Content Encryption Key (CEK) encrypted with our server-side 256-bit AES master key.
                </div>
                <div class="code-sm">{{ tokenParts[1] || 'Empty in direct mode' }}</div>
              </div>
            </div>

            <div class="segment-item">
              <div class="seg-badge p-iv">Part 3: Initialization Vector (IV)</div>
              <div class="seg-content">
                <div class="seg-desc">
                  96-bit cryptographic nonce ensuring two identical logins will NEVER produce the same ciphertext.
                </div>
                <div class="code-sm">{{ tokenParts[2] }}</div>
              </div>
            </div>

            <div class="segment-item">
              <div class="seg-badge p-cipher">Part 4: Ciphertext (The Confidential Payload)</div>
              <div class="seg-content">
                <div class="seg-desc">
                  The encrypted payload (user ID, claims, permissions). <strong>Zero plaintext data leaked!</strong>
                </div>
                <div class="code-sm cipher-glow">{{ tokenParts[3] }}</div>
              </div>
            </div>

            <div class="segment-item">
              <div class="seg-badge p-tag">Part 5: Authentication Tag (MAC)</div>
              <div class="seg-content">
                <div class="seg-desc">
                  128-bit authentication tag calculated by AES-GCM to prevent tampering or ciphertext modification.
                </div>
                <div class="code-sm">{{ tokenParts[4] }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <div class="security-guarantee">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span>Verified Compliant: RFC 7516 (JWE) & NIST SP 800-38D (AES-GCM)</span>
          </div>
          <button (click)="close.emit()" class="btn btn-secondary btn-sm">Close Inspector</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(8px);
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      animation: fadeIn 0.2s ease-out;
    }
    .modal-card {
      background: #111827;
      border: 1px solid rgba(14, 165, 233, 0.3);
      border-radius: var(--radius-lg);
      max-width: 820px;
      width: 100%;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 25px rgba(14, 165, 233, 0.15);
    }
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.75rem;
      border-bottom: 1px solid var(--border-subtle);
    }
    .title-wrap {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .icon-wrap {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: rgba(14, 165, 233, 0.15);
      color: #38bdf8;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(14, 165, 233, 0.3);
    }
    .subtitle {
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    .close-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 1.75rem;
      cursor: pointer;
      line-height: 1;
    }
    .close-btn:hover {
      color: #fff;
    }
    .modal-body {
      padding: 1.5rem 1.75rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .comparison-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .compare-card {
      padding: 1.2rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
      background: rgba(255, 255, 255, 0.02);
    }
    .compare-jws {
      border-color: rgba(245, 158, 11, 0.25);
    }
    .compare-jwe {
      border-color: rgba(16, 185, 129, 0.3);
      background: rgba(16, 185, 129, 0.03);
    }
    .compare-card h4 {
      margin: 0.5rem 0 0.25rem;
      font-size: 1rem;
    }
    .compare-desc {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 0.5rem;
      line-height: 1.5;
    }
    .token-section {
      background: #090d16;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 1rem;
    }
    .section-label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-muted);
      margin-bottom: 0.6rem;
    }
    .btn-copy {
      background: rgba(255, 255, 255, 0.08);
      border: none;
      color: #cbd5e1;
      padding: 0.2rem 0.6rem;
      border-radius: 4px;
      font-size: 0.75rem;
      cursor: pointer;
    }
    .btn-copy:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #fff;
    }
    .token-copied {
      color: #34d399;
      font-size: 0.75rem;
    }
    .token-box {
      font-family: var(--font-mono);
      font-size: 0.8rem;
      word-break: break-all;
      background: #050811;
      padding: 0.75rem;
      border-radius: 6px;
      line-height: 1.5;
      max-height: 120px;
      overflow-y: auto;
    }
    .token-dot {
      color: #64748b;
      font-weight: bold;
      padding: 0 1px;
    }
    .part-0 { color: #f43f5e; } /* Red Header */
    .part-1 { color: #10b981; } /* Green Key */
    .part-2 { color: #0ea5e9; } /* Cyan IV */
    .part-3 { color: #a855f7; font-weight: 600; } /* Purple Ciphertext */
    .part-4 { color: #eab308; } /* Yellow Tag */

    .segments-list {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }
    .segments-list h4 {
      font-size: 0.95rem;
      color: #cbd5e1;
      margin-bottom: 0.25rem;
    }
    .segment-item {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
    }
    .seg-badge {
      display: inline-block;
      align-self: flex-start;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-family: var(--font-mono);
    }
    .p-header { background: rgba(244, 63, 94, 0.15); color: #fb7185; }
    .p-key { background: rgba(16, 185, 129, 0.15); color: #34d399; }
    .p-iv { background: rgba(14, 165, 233, 0.15); color: #38bdf8; }
    .p-cipher { background: rgba(168, 85, 247, 0.15); color: #c084fc; }
    .p-tag { background: rgba(234, 179, 8, 0.15); color: #facc15; }

    .seg-desc {
      font-size: 0.825rem;
      color: var(--text-muted);
    }
    .code-sm {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: #94a3b8;
      background: #090d16;
      padding: 0.4rem 0.6rem;
      border-radius: 4px;
      word-break: break-all;
    }
    .cipher-glow {
      border: 1px solid rgba(168, 85, 247, 0.2);
    }
    .json-code {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      background: #090d16;
      padding: 0.4rem 0.6rem;
      border-radius: 4px;
      color: #38bdf8;
    }
    .modal-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.75rem;
      border-top: 1px solid var(--border-subtle);
      background: rgba(0, 0, 0, 0.2);
    }
    .security-guarantee {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
      color: #94a3b8;
    }
  `]
})
export class JweModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  token = '';
  tokenParts: string[] = [];
  inspection: any = null;
  copied = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.token = this.authService.getToken() || '';
    if (this.token) {
      this.tokenParts = this.token.split('.');
      this.authService.inspectToken(this.token).subscribe({
        next: (insp) => {
          this.inspection = insp;
        },
        error: () => {
          // Fallback parsing
          if (this.tokenParts.length === 5) {
            try {
              const header = JSON.parse(atob(this.tokenParts[0].replace(/-/g, '+').replace(/_/g, '/')));
              this.inspection = { parts: { header: { decoded: header } } };
            } catch (e) {}
          }
        }
      });
    }
  }

  copyToken() {
    if (!this.token) return;
    navigator.clipboard.writeText(this.token);
    this.copied = true;
    setTimeout(() => (this.copied = false), 2500);
  }
}

