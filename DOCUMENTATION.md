# MediVault | Full Project Documentation & Architectural Specification

> **A Secure Healthcare Identity & Patient Records Platform**  
> Built with **Angular (TypeScript)**, **NestJS (Node.js)**, **Bcrypt**, and **JWE (JSON Web Encryption — RFC 7516)**.

---

## 1. Executive Summary

MediVault is an enterprise-grade medical authentication and patient record management system designed specifically to demonstrate **Zero-Leak Medical Confidentiality**. 

In conventional web applications, standard JSON Web Tokens (JWS — RFC 7519) are used. However, standard JWTs only provide **integrity** (via a cryptographic signature), leaving the payload merely Base64-encoded. Any intermediary, proxy, browser extension, or malicious actor who intercepts the token can decode the patient's identity and sensitive claims in plain text.

MediVault replaces standard JWT with **JWE (JSON Web Encryption — RFC 7516)** using **AES-256-GCM**. The authentication token issued upon login contains an end-to-end encrypted ciphertext payload that is completely unreadable without the server's private 256-bit AES master key.

---

## 2. High-Level Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | **Angular 17+** (Standalone Components) | Reactive UI, typed components, modular architecture |
| **Frontend Language** | **TypeScript** | Strict compile-time typing across models & services |
| **Frontend Styling** | Custom Medical Design System | Dark mode, glassmorphism, responsive cards, glowing status pills |
| **Backend Framework** | **NestJS 10+** (Express platform) | Enterprise modular architecture, controllers, guards, services |
| **Backend Language** | **TypeScript / Node.js (v21)** | Strongly-typed backend business logic & encryption services |
| **Authentication Standard**| **JWE (RFC 7516)** via `jose` | 5-part encrypted JWT with AES-256-GCM & A256GCMKW |
| **Password Security** | **Bcrypt** (`bcryptjs`) | 10-round salted password hashing for credential defense |
| **Database** | **Local File DB** (`backend/db/users.json`)| Disk-persisted, atomic JSON storage with live read/write |

---

## 3. Cryptographic Deep-Dive: JWS vs JWE

### 3.1 Why Ordinary JWT (JWS) Fails Healthcare Privacy

Standard JWT (JWS - RFC 7519) has **3 parts**:
```text
Header . Payload . Signature
```
- **Header**: Base64-encoded JSON (e.g. `{"alg":"HS256","typ":"JWT"}`)
- **Payload**: Base64-encoded JSON (e.g. `{"sub":"user123","email":"patient@med.org"}`)
- **Signature**: HMAC or RSA signature ensuring the token was not modified.

⚠️ **The Security Flaw**: Anyone can run `atob(payload)` or paste it into [jwt.io](https://jwt.io) to read the patient's identity, IDs, and roles. It provides **zero confidentiality**.

---

### 3.2 The MediVault JWE Specification (RFC 7516)

MediVault uses **JSON Web Encryption (JWE)**. A JWE token consists of **5 dot-separated segments**:
```text
Part 1 (Protected Header) . Part 2 (Encrypted Key) . Part 3 (IV) . Part 4 (Ciphertext) . Part 5 (Auth Tag)
```

Here is how each segment is constructed and verified:

```
+-----------------------------------------------------------------------------------+
| 1. BASE64URL(UTF8(JWE Protected Header))                                         |
|    Specifies Key Wrap: "alg":"A256GCMKW" and Encryption: "enc":"A256GCM"          |
+-----------------------------------------------------------------------------------+
                                         .
+-----------------------------------------------------------------------------------+
| 2. BASE64URL(JWE Encrypted Key)                                                  |
|    Content Encryption Key (CEK), encrypted with the master 256-bit AES key        |
+-----------------------------------------------------------------------------------+
                                         .
+-----------------------------------------------------------------------------------+
| 3. BASE64URL(JWE Initialization Vector)                                           |
|    Unique 96-bit random nonce preventing identical ciphertexts for the same data  |
+-----------------------------------------------------------------------------------+
                                         .
+-----------------------------------------------------------------------------------+
| 4. BASE64URL(JWE Ciphertext)                                                     |
|    The user claims (sub, email, roles) fully encrypted via AES-256-GCM            |
+-----------------------------------------------------------------------------------+
                                         .
+-----------------------------------------------------------------------------------+
| 5. BASE64URL(JWE Authentication Tag)                                              |
|    128-bit MAC verifying ciphertext integrity and defending against tampering    |
+-----------------------------------------------------------------------------------+
```

#### Why it guarantees Zero-Leak Privacy:
1. **Unreadable Payload**: Part 4 is authenticated ciphertext. Even if captured in transit or stored in localStorage, it cannot be decoded without the server's master key.
2. **Replay & Modification Defense**: AES-GCM provides **Authenticated Encryption with Associated Data (AEAD)**. If a single bit of the ciphertext is altered, decryption fails immediately.
3. **Unique Ciphertexts**: Because a random 96-bit IV is generated per session, two identical logins produce completely different token strings.

---

## 4. System Architecture & Directory Layout

### 4.1 Backend Architecture (`backend/`)

The backend follows a clean layered folder structure:

```text
backend/
├── db/                               <-- LOCAL FOLDER DATABASE
│   └── users.json                    <-- Live disk-persisted data file (formatted JSON)
│
├── src/
│   ├── controllers/                  <-- ALL CONTROLLERS FOLDER
│   │   ├── auth.controller.ts        <-- Endpoints for login, registration, inspection, demo accounts
│   │   └── profile.controller.ts     <-- Endpoints for profile retrieval, address, and medical records
│   │
│   ├── services/                     <-- ALL BUSINESS & SECURITY SERVICES FOLDER
│   │   ├── auth.service.ts           <-- Bcrypt authentication & token issuance
│   │   ├── users.service.ts          <-- User query, profile mutations, allergy & medication management
│   │   ├── jwe.service.ts            <-- 5-part JWE AES-256-GCM token creation & decryption
│   │   └── db.service.ts             <-- Atomic disk read/write for backend/db/users.json
│   │
│   ├── routes/                       <-- ROUTES & ROUTING MODULES FOLDER
│   │   ├── auth.module.ts            <-- Auth route module (wires AuthController + AuthService)
│   │   ├── profile.module.ts         <-- Profile route module (wires ProfileController)
│   │   └── routes.config.ts          <-- Centralized route constant definitions
│   │
│   ├── guards/                       <-- GUARDS FOLDER
│   │   └── jwe-auth.guard.ts         <-- Intercepts Bearer token & decrypts JWE ciphertext
│   │
│   ├── dto/                          <-- DATA TRANSFER OBJECTS FOLDER
│   │   ├── login.dto.ts              <-- Request validation for login
│   │   └── register.dto.ts           <-- Request validation for new patients
│   │
│   ├── models/                       <-- DATA MODELS & INTERFACES FOLDER
│   │   ├── user.interface.ts         <-- User, Address, MedicalRecord, Vitals, Medications
│   │   └── jwe.interface.ts          <-- JwePayload, JweTokenInspection
│   │
│   ├── decorators/                   <-- CUSTOM PARAMETER DECORATORS FOLDER
│   │   └── current-user.decorator.ts <-- @CurrentUser() decorator
│   │
│   ├── app.module.ts                 <-- Root NestJS module importing routes/
│   └── main.ts                       <-- Server bootstrap & CORS configuration
│
├── test-e2e.js                       <-- Automated end-to-end integration test suite
└── package.json                      <-- Backend dependencies & scripts
```

---

### 4.2 Frontend Architecture (`frontend/`)

Built as an Angular 17+ standalone architecture:

```text
frontend/src/app/
├── components/
│   ├── navbar/                       <-- Main navigation bar, active patient chip, JWE status pill
│   └── jwe-modal/                    <-- Interactive modal breaking down all 5 parts of the token
│
├── pages/
│   ├── landing/                      <-- Landing page with hero, JWS vs JWE comparison, demo prefill cards
│   ├── login/                        <-- Sign in & Patient registration forms with validation
│   └── profile/                      <-- Complete Patient Dashboard (Image, Address, Medical records)
│
├── services/
│   ├── auth.service.ts               <-- Manages login, registration, token persistence, demo accounts
│   └── profile.service.ts            <-- Manages profile fetch, update, adding allergies/medications
│
├── guards/
│   └── auth.guard.ts                 <-- Protects /profile route from unauthenticated users
│
├── interceptors/
│   └── auth.interceptor.ts           <-- Automatically injects Authorization: Bearer <jwe_token>
│
├── models/
│   └── user.model.ts                 <-- TypeScript interfaces for frontend state
│
├── app.routes.ts                     <-- Angular client-side routes
├── app.config.ts                     <-- Global HTTP interceptor & animation providers
└── app.component.ts                  <-- Root layout component
```

---

## 5. End-to-End Authentication & Data Flow

```text
+----------------+                +--------------------+                +-----------------------+
| Angular Client |                |   NestJS Backend   |                | Local DB (users.json) |
+----------------+                +--------------------+                +-----------------------+
       |                                    |                                       |
       | 1. POST /api/auth/login            |                                       |
       |    { email, password }             |                                       |
       |----------------------------------->|                                       |
       |                                    | 2. Read user record                   |
       |                                    |-------------------------------------->|
       |                                    |<--------------------------------------|
       |                                    | 3. bcrypt.compare(password, hash)     |
       |                                    | 4. JweService.createToken(payload)    |
       |                                    |    - alg: A256GCMKW, enc: A256GCM     |
       |                                    |    - 5-part ciphertext generated      |
       | 5. Return ONLY token:              |                                       |
       |    { accessToken, tokenType }      |                                       |
       |<-----------------------------------|                                       |
       |                                    |                                       |
       | 6. Store token in localStorage     |                                       |
       |    Navigate to /profile            |                                       |
       |                                    |                                       |
       | 7. GET /api/profile                |                                       |
       |    Header: Bearer <5-part JWE>     |                                       |
       |----------------------------------->|                                       |
       |                                    | 8. JweAuthGuard:                      |
       |                                    |    - Decrypt token via secretKey      |
       |                                    |    - Extract user.id from claims      |
       |                                    | 9. Read full profile from DB          |
       |                                    |-------------------------------------->|
       |                                    |<--------------------------------------|
       | 10. Return full profile:           |                                       |
       |     - Profile image                |                                       |
       |     - Legal name, email, phone     |                                       |
       |     - Physical address             |                                       |
       |     - Medical records & vitals     |                                       |
       |<-----------------------------------|                                       |
       |                                    |                                       |
       | 11. POST /api/profile/allergies    |                                       |
       |     { allergy: "Penicillin" }      |                                       |
       |----------------------------------->|                                       |
       |                                    | 12. Write update directly to disk     |
       |                                    |-------------------------------------->|
       |                                    |<--------------------------------------|
       | 13. Return updated patient data    |                                       |
       |<-----------------------------------|                                       |
```

---

## 6. API Reference

### 6.1 Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticates credentials with Bcrypt and returns a 5-part JWE token. | No |
| `POST` | `/api/auth/register` | Hashes password with Bcrypt, creates patient in `users.json`, issues JWE token. | No |
| `GET` | `/api/auth/demo-users`| Returns pre-configured demo account profiles for 1-click testing. | No |
| `GET` | `/api/auth/inspect?token=...` | Decomposes any JWE token into its 5 RFC 7516 segments. | No |
| `GET` | `/api/auth/me` | Validates active JWE Bearer token and returns session user. | **Yes (JWE Bearer)** |

#### Minimal Login Response (Confidential Standard):
```json
{
  "accessToken": "eyJhbGciOiJBMjU2R0NNS1ciLCJlbmMiOiJBMjU2R0NNIiwiaXYiOiJLM2JTcFFscWo1cnl0dXpNIiwidGFnIjoiSnVOUGJKTVp1aXdWWndfWVU2U3Q4USJ9.vXRgfPnjG6zB7GuZaY_LvuIvb9CvgXiG-UHuase8W08.yFeXaE98SF2XG080.vnddu2c6UW8uqR360N_AJOhgo5er7-gmTqsG9g5U3_qHHTUMj8Xe_DxPNLk_Rp5Wn5K_BAXUSMR0h3mm9yBm0fs8aCEnJc7_V7LJfAzmVifYlYcMKFKbVKclc-qbVUuhq-5rQkhehD7qDFXpH9sW7mYqqYITYzImvTpHddZ6P3OP14UUSKccamNDfv4ptL_xdrutXhiEFRPvxdV4CE9j2yyEx-mfL5v2sKTuv30BBPzJsIpfLoHpxDmWrmOrP62w8N0i2gLbiNp1.4LalefosDQI3bfDTk1P9og",
  "tokenType": "Bearer"
}
```

---

### 6.2 Patient Profile (`/api/profile`)

*All profile endpoints require `Authorization: Bearer <jwe_token>` header.*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/profile` | Retrieves full decrypted profile: image, name, address, medical records, vitals, allergies. |
| `PUT` | `/api/profile` | Updates patient phone, address, or avatar. |
| `POST` | `/api/profile/allergies` | Adds a new allergy alert to the patient's record in `backend/db/users.json`. |
| `POST` | `/api/profile/medications`| Adds a prescription record (name, dosage, frequency, prescriber). |

---

## 7. User Interface Guide

### 7.1 Landing Page (`/`)
- **Hero Section**: Highlights zero-leak medical data protection and the RFC 7516 standard.
- **Quick 1-Click Test Cards**: Displays Alex Rivera and Dr. Sarah Jenkins; clicking any card automatically pre-fills credentials in the sign-in form.
- **Security Comparison Table**: Interactive table outlining differences between ordinary JWS and JWE.

### 7.2 Patient Login & Registration (`/login`)
- **Sign In Tab**: Email and password fields with Bcrypt verification.
- **Register Tab**: Allows registering a new patient identity, which automatically writes to `db/users.json`.
- **Demo Prefill Buttons**: Instant buttons for testing without typing.

### 7.3 Patient Profile Dashboard (`/profile`)
- **Identity Card**:
  - High-resolution Patient Avatar Image.
  - Full Legal Name & Unique Patient ID.
  - Verified Encrypted Session indicator.
  - Email, Phone, and Auth Token format badge.
- **Address Card**:
  - Street Address, City, State, ZIP code, and Country.
  - Emergency Contact Card (Name, relationship, phone).
  - Primary Care Physician Card (Doctor name, clinic, phone).
- **Medical Records Section**:
  - **Blood Profile**: Blood Type badge (e.g. `O- Negative Universal Donor`, `A+ Positive`).
  - **Clinical Vitals**: Blood Pressure, Resting Heart Rate, Oxygen Saturation, Height, and Weight.
  - **Allergies & Contraindications**: Visual alert tags with a quick-add form.
  - **Active Prescriptions**: Medication cards showing dosage, schedule, prescribing doctor, and a form to add new prescriptions.
  - **Chronic Conditions**: Diagnosed condition list.
  - **Immunization Records**: Vaccine name, date administered, and immunity status.
  - **Consultation Notes**: Clinical history summaries.

### 7.4 Live JWE Inspector Modal
- Accessible via the **"JWE Token Active [AES-256]"** pill in the top navbar or the **"Inspect 5-Part JWE Token"** button in the profile dashboard.
- Highlights all 5 segments with individual color codes:
  - 🔴 **Header**: Decodes algorithm parameters (`A256GCMKW` + `A256GCM`).
  - 🟢 **Encrypted Key**: Displays byte length of wrapped CEK.
  - 🔵 **IV**: Displays random nonce.
  - 🟣 **Ciphertext**: Highlights the encrypted payload, proving no plaintext leaks.
  - 🟡 **Auth Tag**: Displays the integrity MAC.

---

## 8. Pre-configured Demo Accounts

| Account | Email | Password | Medical Profile Highlights |
| :--- | :--- | :--- | :--- |
| **Alex Rivera, M.Sc.** | `alex.rivera@medivault.io` | `password123` | **O- (Universal Donor)**, Penicillin allergy, Asthma, Albuterol inhaler prescription |
| **Dr. Sarah Jenkins** | `sarah.jenkins@healthgrid.org` | `password123` | **A+ Positive**, Sulfa allergy, Migraine records, Sumatriptan prescription |

---

## 9. How to Run the Project

### 9.1 Starting the NestJS Backend
```bash
cd backend
npm install
npm start
```
*The backend server will run on `http://localhost:3000`.*

### 9.2 Starting the Angular Frontend
In a separate terminal:
```bash
cd frontend
npm install
npm start
```
*The frontend application will open on `http://localhost:4200`.*

### 9.3 Running Automated End-to-End Tests
To verify encryption, Bcrypt authentication, and local disk database persistence:
```bash
cd backend
node test-e2e.js
```
*(Runs comprehensive test assertions verifying token structure, rejection of invalid passwords, and file writes to `backend/db/users.json` on disk).*

