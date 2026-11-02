# MediVault Frontend Documentation

> **Healthcare Patient Portal & JWE Token Inspector**  
> Framework: **Angular 17+ (Standalone Components)**  
> Language: **TypeScript 5.4+**  
> Styling: **Modern Responsive CSS (Dark Mode / Glassmorphism)**  
> Security Standard: **RFC 7516 (JSON Web Encryption)**

---

## 1. Directory Structure

```text
frontend/
├── angular.json                      # Angular workspace & build configuration
├── package.json                      # Dependencies, scripts (ng serve, ng build)
├── tsconfig.json                     # Root TypeScript compiler options
├── tsconfig.app.json                 # Application-specific TypeScript compilation
│
└── src/
    ├── index.html                    # Root HTML file with web fonts & app-root selector
    ├── styles.css                    # Global design tokens, theme variables, animations
    ├── main.ts                       # Application bootstrap entry point
    │
    ├── environments/                 # Environment-specific configuration
    │   ├── environment.ts            # Development config (e.g. apiUrl: 'http://localhost:3000/api')
    │   └── environment.prod.ts       # Production config (e.g. apiUrl: '/api')
    │
    └── app/
        ├── app.component.ts          # Root component (Navbar, RouterOutlet, Footer, JweModal)
        ├── app.config.ts             # Application providers (Router, HttpClient + Interceptors)
        ├── app.routes.ts             # Route definitions with guards
        │
        ├── components/               # Reusable presentational components
        │   ├── navbar/
        │   │   └── navbar.component.ts   # Top navbar, patient chip, JWE pill, logout
        │   └── jwe-modal/
        │       └── jwe-modal.component.ts# Interactive 5-part JWE token inspector modal
        │
        ├── pages/                    # Feature views (routable pages)
        │   ├── landing/
        │   │   └── landing.component.ts  # Landing page, demo accounts, JWS vs JWE comparison
        │   ├── login/
        │   │   └── login.component.ts    # Sign-in & Registration form with 1-click prefill
        │   └── profile/
        │       └── profile.component.ts  # Medical records dashboard, vitals, allergies, meds
        │
        ├── services/                 # Business logic, state management, HTTP communication
        │   ├── auth.service.ts       # Authentication state, login/register, token storage
        │   └── profile.service.ts    # Patient profile & medical record CRUD operations
        │
        ├── guards/                   # Route protection middleware
        │   └── auth.guard.ts         # Functional CanActivateFn protecting /profile
        │
        ├── interceptors/             # HTTP request/response pipeline middleware
        │   └── auth.interceptor.ts   # Functional HttpInterceptorFn injecting JWE Bearer header
        │
        └── models/                   # Strongly-typed domain models & interfaces
            └── user.model.ts         # User, MedicalRecord, Address, JweInspection, AuthResponse
```

---

## 2. Core Modules & Files

### 2.1 Application Bootstrap & Configuration
- **`main.ts`**: Invokes `bootstrapApplication(AppComponent, appConfig)`. Uses standalone components without `NgModule` declarations.
- **`app.config.ts`**:
  - `provideRouter(routes)`: Configures client-side routing.
  - `provideHttpClient(withInterceptors([authInterceptor]))`: Registers the functional HTTP interceptor.
  - `provideAnimations()`: Enables Angular UI transitions.
- **`app.routes.ts`**:
  - `''` $\rightarrow$ `LandingComponent` (Public)
  - `'login'` $\rightarrow$ `LoginComponent` (Public)
  - `'profile'` $\rightarrow$ `ProfileComponent` (Protected by `authGuard`)
  - `'**'` $\rightarrow$ Redirects to `''`

---

### 2.2 Security Pipeline: Guards & Interceptors

#### `guards/auth.guard.ts`
A modern functional guard (`CanActivateFn`):
```typescript
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};
```
- Inspects `localStorage` for the presence of `jwe_access_token`.
- Blocks unauthenticated visitors from accessing `/profile`.

#### `interceptors/auth.interceptor.ts`
A functional HTTP interceptor (`HttpInterceptorFn`):
- Intercepts all outgoing HTTP calls directed to the API (`environment.apiUrl`).
- Automatically injects:
  ```http
  Authorization: Bearer <5-part-jwe-token>
  ```
- Catches `401 Unauthorized` responses and automatically triggers `authService.logout()`, wiping expired tokens and redirecting to `/login`.

---

### 2.3 State Management & Services

#### `services/auth.service.ts`
- Uses RxJS `BehaviorSubject<User | null>` to maintain client-side session state.
- **`currentUser$`**: Observable that emits the logged-in user profile across the navbar and dashboard.
- **`login(credentials)`**: Posts to `/api/auth/login`. Receives the **minimal JWE token response** (`{ accessToken, tokenType: 'Bearer' }`) and stores it securely in `localStorage`.
- **`register(userData)`**: Registers a new patient and saves the newly generated JWE session token.
- **`logout()`**: Clears all session keys from `localStorage`, resets reactive subjects, and routes to `/login`.
- **`getDemoUsers()`**: Retrieves the seeded demo accounts for 1-click test login.
- **`inspectToken(token)`**: Queries `/api/auth/inspect?token=...` to retrieve the cryptographic breakdown for the inspector modal.

#### `services/profile.service.ts`
- **`getProfile()`**: Issues `GET /api/profile`. The backend decrypts the JWE ciphertext and returns the full patient profile, address, and medical records.
- **`updateProfile(data)`**: Issues `PUT /api/profile` to update contact/address data.
- **`addAllergy(allergy)`**: Issues `POST /api/profile/allergies` to add an allergy alert.
- **`addMedication(med)`**: Issues `POST /api/profile/medications` to add a prescription record.

---

### 2.4 Views & Pages

#### 1. Landing Page (`pages/landing/`)
- **Hero Section**: Explains medical data confidentiality and RFC 7516.
- **1-Click Test Cards**: Shows Alex Rivera (Asthma / Blood O-) and Dr. Sarah Jenkins (Blood A+); clicking pre-fills credentials immediately.
- **JWS vs JWE Comparison Table**: Highlights the 3-part vs 5-part architecture and why Base64 tokens are unsafe for medical data.

#### 2. Sign In & Register Page (`pages/login/`)
- Clean tab switcher between **Sign In** and **Register New Patient**.
- Instant 1-click demo prefill buttons.
- Submits credentials, receives strictly the JWE token, and transitions to `/profile`.

#### 3. Patient Medical Dashboard (`pages/profile/`)
- **Patient Identity**: Avatar image, full legal name, patient ID, online status.
- **Verified Residence**: Street address, city, state, ZIP, country.
- **Emergency Contacts & Physician Details**: Primary doctor, clinic name, emergency phone.
- **Clinical Vitals & Blood Profile**: Blood type badge (O-, A+, etc.), Blood Pressure, Heart Rate, Oxygen Saturation, Height, Weight.
- **Allergies & Contraindications**: Visual alert tags with a quick-add form.
- **Active Prescriptions**: Medication cards (dosage, frequency, prescriber) with a quick-add form.
- **Chronic Conditions & Immunizations**: Historical health record.

---

### 2.5 Components

#### `components/navbar/`
- Top navigation bar.
- Shows the MediVault logo and brand status.
- When logged in, displays:
  - Patient avatar chip and full name.
  - Pulsing **"JWE Token Active [AES-256]"** pill.
  - **Logout** button.

#### `components/jwe-modal/`
- Deep-dive cryptographic inspector modal.
- Breaks down the active JWE token into its **5 RFC 7516 segments**:
  1. 🔴 **Header**: Algorithms used (`A256GCMKW` + `A256GCM`).
  2. 🟢 **Encrypted Key**: 32-byte wrapped CEK.
  3. 🔵 **IV**: 96-bit random nonce.
  4. 🟣 **Ciphertext**: Unreadable AES-256 encrypted patient claims.
  5. 🟡 **Auth Tag**: 128-bit integrity MAC.
- Includes a 1-click **Copy Token** button.

---

## 3. Environment Configuration

Defined in `src/environments/`:
- **`environment.ts` (Development)**:
  ```typescript
  export const environment = {
    production: false,
    apiUrl: 'http://localhost:3000/api',
  };
  ```
- **`environment.prod.ts` (Production)**:
  ```typescript
  export const environment = {
    production: true,
    apiUrl: '/api',
  };
  ```

---

## 4. Development & Build Commands

Inside `frontend/`:

```bash
# Start development server (serves on http://localhost:4200)
npm start

# Build for production (outputs optimized bundles to dist/frontend)
npm run build

# Watch mode for continuous development compilation
npm run watch
```

