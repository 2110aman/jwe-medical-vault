# MediVault - JWE Encrypted Medical Authentication & Patient Records

A full-stack, enterprise-grade healthcare portal built with **Angular (TypeScript)**, **NestJS (Node.js)**, **Bcrypt**, and **JWE (JSON Web Encryption - RFC 7516)**.

---

## 🔒 Why JWE (JSON Web Encryption) Instead of Standard JWT (JWS)?

| Feature | Standard JWT (JWS - RFC 7519) | Encrypted JWT (JWE - RFC 7516) |
| :--- | :--- | :--- |
| **Structure** | **3 parts**: `header.payload.signature` | **5 parts**: `header.key.iv.ciphertext.tag` |
| **Payload Visibility** | **Plaintext Base64** (Anyone who intercepts the token can decode patient IDs and medical claims with `atob()`) | **AES-256-GCM Ciphertext** (Payload is 100% confidential and unreadable without server key) |
| **Medical Privacy** | ❌ Violates strict HIPAA / zero-leak standards |  **Compliant with HIPAA / NIST SP 800-38D** |
| **Security Mechanism**| Integrity only (Signed) | **Confidentiality + Authenticated Encryption (AEAD)** |

### The 5 Parts of a JWE Token in MediVault:
1. **Protected Header**: Specifies Key Wrap algorithm (`A256GCMKW`) and Content Encryption algorithm (`A256GCM`).
2. **Encrypted Key**: The Content Encryption Key (CEK), wrapped using a 256-bit AES master key.
3. **Initialization Vector (IV)**: A unique 96-bit cryptographic nonce ensuring no two identical logins produce the same ciphertext.
4. **Ciphertext**: The completely encrypted user claims (sub, email, roles, metadata).
5. **Authentication Tag**: 128-bit MAC tag verifying payload integrity and defending against tampering.

---

## 🛠️ Tech Stack

- **Frontend**:
  - **Angular 17+** (Standalone Components, modern signals/reactive architecture)
  - **TypeScript**
  - **Tailwind-inspired Responsive Design System** with dark mode, glowing accents, and glassmorphism
  - **Live JWE Token Decomposition Inspector Modal**
- **Backend Architecture**:
  - **`backend/db/`**: Local database folder with `users.json` storing all patient and medical data on disk.
  - **`controllers/`**: Dedicated folder for API controllers (`auth.controller.ts`, `profile.controller.ts`).
  - **`services/`**: Dedicated folder for business logic (`auth.service.ts`, `users.service.ts`, `jwe.service.ts`, `db.service.ts`).
  - **`routes/`**: Route modules and route configuration (`auth.module.ts`, `profile.module.ts`, `routes.config.ts`).
  - **`guards/`**: Authentication guards (`jwe-auth.guard.ts`).
  - **`dto/`**: Request validation schemas (`login.dto.ts`, `register.dto.ts`).
  - **`models/`**: TypeScript interfaces & types (`user.interface.ts`, `jwe.interface.ts`).
  - **`decorators/`**: Parameter decorators (`current-user.decorator.ts`).
  - **jose**: Official standard JOSE / RFC 7516 library for AES-256-GCM JWE encryption.
  - **bcryptjs**: 10-round salted password hashing.

---

## 🚀 Quick Start Guide

### 1. Start the NestJS Backend
```bash
cd backend
npm install
npm start
```
*The backend will boot up at `http://localhost:3000`.*

### 2. Start the Angular Frontend
In a new terminal:
```bash
cd frontend
npm install
npm start
```
*The Angular app will launch at `http://localhost:4200`.*

---

## 🧪 Pre-configured Demo Accounts

You can log in instantly using the 1-click test buttons on the Landing page or Login page:

| User | Email | Password | Role & Medical Highlights |
| :--- | :--- | :--- | :--- |
| **Alex Rivera, M.Sc.** | `alex.rivera@medivault.io` | `password123` | **O- (Universal Donor)**, Penicillin & Peanut allergy, Asthma, Inhaler prescription |
| **Dr. Sarah Jenkins** | `sarah.jenkins@healthgrid.org` | `password123` | **A+**, Sulfa allergy, Migraine records, Sumatriptan prescription |

You can also use the **"Register New Patient"** tab to register custom patients with instant Bcrypt hashing and JWE token issuance!

---

## 📋 Features Included

1. **Modern Landing Page**:
   - High-impact hero section with live cryptographic badges.
   - 1-Click test user cards for instantaneous onboarding.
   - Comprehensive technical comparison matrix (JWS vs JWE).
2. **Authentication Flow**:
   - Sign In and Patient Registration with Bcrypt password hashing.
   - Real-time client & server validation with clean feedback.
3. **Medical Profile Dashboard**:
   - **Profile Image & Patient Avatar** with active encrypted connection status.
   - **Full Name, ID, Email, & Phone Number**.
   - **Full Residential Address** & Verified Location card.
   - **Emergency Contacts** & Primary Care Physician cards.
   - **Vitals & Clinical Metrics**: Blood Type (O-, A+, etc.), Blood Pressure, Heart Rate, Oxygen Saturation, Height, and Weight.
   - **Allergies & Contraindications** with visual alert badges and an interactive form to add new allergies.
   - **Active Prescribed Medications** (dosage, frequency, prescriber) with a quick prescription addition form.
   - **Chronic Conditions** and **Immunization History** with validity badges.
   - **Clinical Consultation Notes**.
4. **Interactive JWE Inspector Modal**:
   - Click the green **"JWE Token Active [AES-256]"** pill or **"Inspect 5-Part JWE Token"** button anytime.
   - Visualizes each of the 5 dot-separated segments in distinct cryptographic color codes.
   - Proves how the payload is transformed into unreadable AES-GCM ciphertext.

