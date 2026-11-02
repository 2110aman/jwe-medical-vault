export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
}

export interface Immunization {
  vaccine: string;
  date: string;
  status: string;
}

export interface Vitals {
  bloodPressure: string;
  heartRate: string;
  temperature: string;
  oxygenSaturation: string;
  lastChecked: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface PrimaryPhysician {
  name: string;
  clinic: string;
  phone: string;
}

export interface MedicalRecord {
  bloodType: string;
  height: string;
  weight: string;
  allergies: string[];
  chronicConditions: string[];
  medications: Medication[];
  vitals: Vitals;
  immunizations: Immunization[];
  emergencyContact: EmergencyContact;
  primaryPhysician: PrimaryPhysician;
  recentNotes: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  phone: string;
  address: Address;
  medicalRecord: MedicalRecord;
  createdAt?: string;
}

export interface JweInspection {
  token: string;
  partsCount: number;
  parts: {
    header: { raw: string; decoded: any; description: string };
    encryptedKey: { raw: string; byteLength: number; description: string };
    iv: { raw: string; byteLength: number; description: string };
    ciphertext: { raw: string; byteLength: number; description: string; sample: string };
    authTag: { raw: string; byteLength: number; description: string };
  };
  securityComparison: {
    standardJwt_JWS: string;
    encryptedJwt_JWE: string;
  };
}

export interface AuthResponse {
  accessToken: string;
  tokenType?: string;
  success?: boolean;
  message?: string;
  user?: User;
  tokenInspection?: JweInspection;
}

