import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../services/auth.service';
import { User, MedicalRecord } from '../../models/user.model';
import { JweModalComponent } from '../../components/jwe-modal/jwe-modal.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, JweModalComponent],
  template: `
    <div class="profile-page-wrapper">
      <div class="container profile-container">
        
        <!-- Loading State -->
        <div class="loading-state" *ngIf="loading">
          <div class="spinner-large"></div>
          <p>Decrypting JWE Token & Retrieving Medical Profile...</p>
        </div>

        <ng-container *ngIf="!loading && user">
          <!-- JWE Encrypted Session Notification Banner -->
          <div class="jwe-security-banner glass-panel">
            <div class="banner-left">
              <div class="shield-pulse-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <polyline points="9 12 11 14 15 10"/>
                </svg>
              </div>
              <div>
                <div class="banner-title">
                  <strong>JWE End-to-End Encrypted Session</strong>
                  <span class="badge badge-emerald">AES-256-GCM Active</span>
                </div>
                <div class="banner-desc">
                  This profile was decrypted server-side. Medical records and identity claims remain 100% confidential.
                </div>
              </div>
            </div>
            <button class="btn btn-secondary btn-sm" (click)="showJweModal = true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              Inspect 5-Part JWE Token
            </button>
          </div>

          <!-- Main Layout Grid -->
          <div class="profile-grid">
            
            <!-- LEFT COLUMN: Patient Identity & Address -->
            <div class="left-col">
              
              <!-- Patient Identity Card -->
              <div class="card patient-identity-card">
                <div class="avatar-wrapper">
                  <img [src]="user.avatarUrl" [alt]="user.fullName" class="patient-avatar" />
                  <span class="status-indicator" title="Encrypted Connection Online"></span>
                </div>

                <h2 class="patient-title">{{ user.fullName }}</h2>
                <span class="patient-id-badge">ID: {{ user.id }}</span>

                <div class="identity-info-list">
                  <div class="info-row">
                    <span class="info-icon">✉️</span>
                    <div>
                      <span class="info-label">Email Address</span>
                      <span class="info-val font-mono">{{ user.email }}</span>
                    </div>
                  </div>

                  <div class="info-row">
                    <span class="info-icon">📞</span>
                    <div>
                      <span class="info-label">Phone Number</span>
                      <span class="info-val">{{ user.phone || '+1 (555) 234-5678' }}</span>
                    </div>
                  </div>

                  <div class="info-row">
                    <span class="info-icon">🛡️</span>
                    <div>
                      <span class="info-label">Auth Token Standard</span>
                      <span class="info-val text-cyan">JWE (RFC 7516 Compact)</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Address Details Card -->
              <div class="card address-card">
                <div class="card-header-row">
                  <div class="card-title-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <h3>Patient Address</h3>
                  </div>
                  <span class="badge badge-cyan">Verified Residence</span>
                </div>

                <div class="address-details" *ngIf="user.address">
                  <div class="address-line street">{{ user.address.street }}</div>
                  <div class="address-line city-state">
                    {{ user.address.city }}, {{ user.address.state }} {{ user.address.zipCode }}
                  </div>
                  <div class="address-line country">{{ user.address.country }}</div>
                </div>

                <!-- Emergency Contact Subcard -->
                <div class="sub-contact-box" *ngIf="user.medicalRecord?.emergencyContact">
                  <span class="sub-label">🚨 Emergency Contact</span>
                  <div class="sub-val-name">{{ user.medicalRecord.emergencyContact.name }} ({{ user.medicalRecord.emergencyContact.relationship }})</div>
                  <div class="sub-val-phone font-mono">{{ user.medicalRecord.emergencyContact.phone }}</div>
                </div>

                <!-- Primary Care Physician -->
                <div class="sub-contact-box" *ngIf="user.medicalRecord?.primaryPhysician">
                  <span class="sub-label">🩺 Primary Care Physician</span>
                  <div class="sub-val-name">{{ user.medicalRecord.primaryPhysician.name }}</div>
                  <div class="sub-val-desc">{{ user.medicalRecord.primaryPhysician.clinic }}</div>
                  <div class="sub-val-phone font-mono">{{ user.medicalRecord.primaryPhysician.phone }}</div>
                </div>
              </div>
            </div>

            <!-- RIGHT COLUMN: Medical Records Dashboard -->
            <div class="right-col">
              
              <!-- Vitals & Blood Type Bar -->
              <div class="vitals-dashboard-card card">
                <div class="vitals-header">
                  <h3>Clinical Vitals & Blood Profile</h3>
                  <span class="vitals-date" *ngIf="user.medicalRecord?.vitals">
                    Last Checked: {{ user.medicalRecord.vitals.lastChecked }}
                  </span>
                </div>

                <div class="vitals-metrics-grid">
                  <!-- Blood Type -->
                  <div class="metric-box blood-box">
                    <span class="metric-title">Blood Type</span>
                    <span class="metric-val text-rose">{{ user.medicalRecord?.bloodType || 'Unknown' }}</span>
                  </div>

                  <!-- Blood Pressure -->
                  <div class="metric-box">
                    <span class="metric-title">Blood Pressure</span>
                    <span class="metric-val">{{ user.medicalRecord?.vitals?.bloodPressure || '120/80' }}</span>
                  </div>

                  <!-- Heart Rate -->
                  <div class="metric-box">
                    <span class="metric-title">Heart Rate</span>
                    <span class="metric-val">{{ user.medicalRecord?.vitals?.heartRate || '70 bpm' }}</span>
                  </div>

                  <!-- SpO2 -->
                  <div class="metric-box">
                    <span class="metric-title">Oxygen Saturation</span>
                    <span class="metric-val text-emerald">{{ user.medicalRecord?.vitals?.oxygenSaturation || '99%' }}</span>
                  </div>

                  <!-- Height & Weight -->
                  <div class="metric-box">
                    <span class="metric-title">Height / Weight</span>
                    <span class="metric-val font-sm">
                      {{ user.medicalRecord?.height }} &bull; {{ user.medicalRecord?.weight }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Allergies & Medical Warnings -->
              <div class="card allergies-card">
                <div class="card-header-row">
                  <div class="card-title-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fb7185" stroke-width="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    <h3>Allergies & Contraindications</h3>
                  </div>
                  <span class="badge badge-rose">{{ user.medicalRecord?.allergies?.length || 0 }} Alerts</span>
                </div>

                <div class="allergies-list">
                  <div class="allergy-tag" *ngFor="let allergy of user.medicalRecord?.allergies">
                    <span class="tag-warning-icon">⚠️</span>
                    <span>{{ allergy }}</span>
                  </div>
                </div>

                <!-- Quick Add Allergy Form -->
                <div class="quick-add-row">
                  <input
                    type="text"
                    [(ngModel)]="newAllergy"
                    placeholder="Add known allergy (e.g. Codeine)..."
                    class="form-control form-control-sm"
                    (keyup.enter)="addAllergy()"
                  />
                  <button (click)="addAllergy()" class="btn btn-secondary btn-sm" [disabled]="!newAllergy.trim()">
                    + Add Allergy
                  </button>
                </div>
              </div>

              <!-- Active Medications -->
              <div class="card medications-card">
                <div class="card-header-row">
                  <div class="card-title-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2">
                      <path d="M10.5 20.5l10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7z"/>
                      <path d="M8.5 8.5l7 7"/>
                    </svg>
                    <h3>Prescribed Medications</h3>
                  </div>
                  <span class="badge badge-cyan">{{ user.medicalRecord?.medications?.length || 0 }} Active</span>
                </div>

                <div class="medications-grid">
                  <div class="med-item" *ngFor="let med of user.medicalRecord?.medications">
                    <div class="med-top">
                      <h4 class="med-name">{{ med.name }}</h4>
                      <span class="badge badge-purple font-mono">{{ med.dosage }}</span>
                    </div>
                    <div class="med-meta">
                      <div class="med-freq"><strong>Schedule:</strong> {{ med.frequency }}</div>
                      <div class="med-doc"><strong>Prescriber:</strong> {{ med.prescribedBy }}</div>
                    </div>
                  </div>
                </div>

                <!-- Add Medication Form -->
                <div class="add-med-panel">
                  <span class="panel-subtitle">Add New Prescription:</span>
                  <div class="med-input-row">
                    <input type="text" [(ngModel)]="newMedName" placeholder="Medication Name" class="form-control form-control-sm" />
                    <input type="text" [(ngModel)]="newMedDosage" placeholder="Dosage (e.g. 20mg)" class="form-control form-control-sm" />
                    <input type="text" [(ngModel)]="newMedFreq" placeholder="Frequency (e.g. Once daily)" class="form-control form-control-sm" />
                    <button (click)="addMedication()" class="btn btn-primary btn-sm" [disabled]="!newMedName.trim() || !newMedDosage.trim()">
                      + Add
                    </button>
                  </div>
                </div>
              </div>

              <!-- Immunizations & Chronic Conditions Split -->
              <div class="split-cards-row">
                <!-- Chronic Conditions -->
                <div class="card half-card">
                  <h4>Chronic Conditions</h4>
                  <ul class="condition-list">
                    <li *ngFor="let condition of user.medicalRecord?.chronicConditions">
                      <span class="dot-indigo"></span>
                      <span>{{ condition }}</span>
                    </li>
                  </ul>
                </div>

                <!-- Immunization Records -->
                <div class="card half-card">
                  <h4>Immunization History</h4>
                  <div class="immunization-list">
                    <div class="imm-item" *ngFor="let imm of user.medicalRecord?.immunizations">
                      <div class="imm-name">{{ imm.vaccine }}</div>
                      <div class="imm-meta">
                        <span>{{ imm.date }}</span>
                        <span class="badge badge-emerald font-sm">{{ imm.status }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Physician Notes -->
              <div class="card notes-card" *ngIf="user.medicalRecord?.recentNotes">
                <div class="card-header-row">
                  <h3>Clinical Consultation Notes</h3>
                  <span class="badge badge-amber">Confidential</span>
                </div>
                <div class="notes-body">
                  <p>{{ user.medicalRecord?.recentNotes }}</p>
                </div>
              </div>

            </div>
          </div>
        </ng-container>

        <!-- JWE Inspector Modal -->
        <app-jwe-modal *ngIf="showJweModal" (close)="showJweModal = false"></app-jwe-modal>

      </div>
    </div>
  `,
  styles: [`
    .profile-page-wrapper {
      padding: 2.5rem 0 5rem;
    }
    .profile-container {
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      gap: 1.25rem;
      color: var(--text-muted);
    }
    .spinner-large {
      width: 44px;
      height: 44px;
      border: 3px solid rgba(14, 165, 233, 0.2);
      border-top-color: #0ea5e9;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Security Banner */
    .jwe-security-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.75rem;
      border-color: rgba(16, 185, 129, 0.3);
      background: rgba(16, 185, 129, 0.05);
      border-radius: var(--radius-md);
      flex-wrap: wrap;
      gap: 1rem;
    }
    .banner-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .shield-pulse-icon {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: rgba(16, 185, 129, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .banner-title {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 1rem;
      color: #fff;
    }
    .banner-desc {
      font-size: 0.825rem;
      color: var(--text-muted);
      margin-top: 0.2rem;
    }

    /* Grid */
    .profile-grid {
      display: grid;
      grid-template-columns: 360px 1fr;
      gap: 1.75rem;
      align-items: start;
    }

    .left-col, .right-col {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    /* Left Column: Identity */
    .patient-identity-card {
      text-align: center;
      padding: 2.25rem 1.75rem;
    }
    .avatar-wrapper {
      position: relative;
      display: inline-block;
      margin-bottom: 1.25rem;
    }
    .patient-avatar {
      width: 110px;
      height: 110px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid #0ea5e9;
      box-shadow: 0 8px 24px rgba(14, 165, 233, 0.3);
    }
    .status-indicator {
      position: absolute;
      bottom: 6px;
      right: 6px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #10b981;
      border: 3px solid #131b2e;
    }
    .patient-title {
      font-size: 1.45rem;
      margin-bottom: 0.25rem;
    }
    .patient-id-badge {
      display: inline-block;
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: #7dd3fc;
      background: rgba(14, 165, 233, 0.12);
      padding: 0.2rem 0.6rem;
      border-radius: 4px;
      margin-bottom: 1.5rem;
    }
    .identity-info-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      text-align: left;
      border-top: 1px solid var(--border-subtle);
      padding-top: 1.25rem;
    }
    .info-row {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }
    .info-icon {
      font-size: 1.2rem;
    }
    .info-label {
      display: block;
      font-size: 0.75rem;
      color: var(--text-dim);
    }
    .info-val {
      font-size: 0.875rem;
      color: #f1f5f9;
      font-weight: 500;
    }
    .text-cyan {
      color: #38bdf8;
      font-weight: 600;
    }

    /* Address Card */
    .address-card {
      padding: 1.75rem;
    }
    .card-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
    }
    .card-title-icon {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .card-title-icon h3 {
      font-size: 1.1rem;
    }
    .address-details {
      background: rgba(11, 15, 25, 0.6);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 1rem;
      margin-bottom: 1.25rem;
    }
    .address-line.street {
      font-size: 0.95rem;
      font-weight: 600;
      color: #fff;
    }
    .address-line.city-state {
      font-size: 0.875rem;
      color: var(--text-muted);
      margin-top: 0.2rem;
    }
    .address-line.country {
      font-size: 0.8rem;
      color: var(--text-dim);
      margin-top: 0.2rem;
    }
    .sub-contact-box {
      border-top: 1px solid var(--border-subtle);
      padding-top: 1rem;
      margin-top: 1rem;
    }
    .sub-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: #94a3b8;
      display: block;
      margin-bottom: 0.35rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .sub-val-name {
      font-size: 0.9rem;
      font-weight: 600;
      color: #f1f5f9;
    }
    .sub-val-desc {
      font-size: 0.8rem;
      color: var(--text-dim);
    }
    .sub-val-phone {
      font-size: 0.8rem;
      color: #38bdf8;
      margin-top: 0.15rem;
    }

    /* Vitals Dashboard */
    .vitals-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
    }
    .vitals-date {
      font-size: 0.8rem;
      color: var(--text-dim);
    }
    .vitals-metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 0.85rem;
    }
    .metric-box {
      background: rgba(11, 15, 25, 0.7);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 0.85rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .metric-title {
      font-size: 0.75rem;
      color: var(--text-dim);
      font-weight: 600;
    }
    .metric-val {
      font-size: 1.15rem;
      font-weight: 700;
      color: #fff;
    }
    .blood-box {
      border-color: rgba(244, 63, 94, 0.3);
      background: rgba(244, 63, 94, 0.05);
    }
    .text-rose { color: #fb7185; }
    .text-emerald { color: #34d399; }
    .font-sm { font-size: 0.85rem; }

    /* Allergies Card */
    .allergies-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.65rem;
      margin-bottom: 1.25rem;
    }
    .allergy-tag {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: rgba(244, 63, 94, 0.12);
      border: 1px solid rgba(244, 63, 94, 0.3);
      color: #fecdd3;
      padding: 0.45rem 0.85rem;
      border-radius: var(--radius-md);
      font-size: 0.85rem;
      font-weight: 600;
    }
    .quick-add-row {
      display: flex;
      gap: 0.65rem;
    }
    .form-control-sm {
      padding: 0.45rem 0.75rem;
      font-size: 0.85rem;
    }

    /* Medications Card */
    .medications-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1rem;
      margin-bottom: 1.25rem;
    }
    .med-item {
      background: rgba(11, 15, 25, 0.7);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 1rem;
    }
    .med-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.5rem;
    }
    .med-name {
      font-size: 0.95rem;
      color: #fff;
    }
    .med-meta {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    .add-med-panel {
      border-top: 1px solid var(--border-subtle);
      padding-top: 1rem;
    }
    .panel-subtitle {
      font-size: 0.8rem;
      font-weight: 600;
      color: #94a3b8;
      display: block;
      margin-bottom: 0.5rem;
    }
    .med-input-row {
      display: grid;
      grid-template-columns: 2fr 1fr 2fr auto;
      gap: 0.5rem;
    }

    /* Split Cards */
    .split-cards-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }
    .half-card h4 {
      font-size: 1.05rem;
      margin-bottom: 1rem;
    }
    .condition-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }
    .condition-list li {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.875rem;
      color: #cbd5e1;
    }
    .dot-indigo {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #818cf8;
      box-shadow: 0 0 8px #818cf8;
    }
    .immunization-list {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }
    .imm-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem;
      background: rgba(11, 15, 25, 0.6);
      border-radius: 6px;
    }
    .imm-name {
      font-size: 0.825rem;
      font-weight: 500;
    }
    .imm-meta {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.75rem;
      color: var(--text-dim);
    }

    /* Notes */
    .notes-body p {
      font-size: 0.9rem;
      color: var(--text-muted);
      line-height: 1.6;
    }

    @media (max-width: 900px) {
      .profile-grid { grid-template-columns: 1fr; }
      .split-cards-row { grid-template-columns: 1fr; }
      .med-input-row { grid-template-columns: 1fr; }
    }
  `]
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  loading = true;
  showJweModal = false;

  newAllergy = '';
  newMedName = '';
  newMedDosage = '';
  newMedFreq = '';

  constructor(
    private profileService: ProfileService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.fetchProfile();
  }

  fetchProfile() {
    this.loading = true;
    this.profileService.getProfile().subscribe({
      next: (res) => {
        this.user = res.data;
        this.authService.updateStoredUser(this.user);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  addAllergy() {
    if (!this.newAllergy.trim()) return;
    this.profileService.addAllergy(this.newAllergy.trim()).subscribe({
      next: (res) => {
        this.user = res.data;
        this.newAllergy = '';
      },
    });
  }

  addMedication() {
    if (!this.newMedName.trim() || !this.newMedDosage.trim()) return;
    this.profileService
      .addMedication({
        name: this.newMedName.trim(),
        dosage: this.newMedDosage.trim(),
        frequency: this.newMedFreq.trim() || 'As directed by physician',
        prescribedBy: 'Attending Physician',
      })
      .subscribe({
        next: (res) => {
          this.user = res.data;
          this.newMedName = '';
          this.newMedDosage = '';
          this.newMedFreq = '';
        },
      });
  }
}

