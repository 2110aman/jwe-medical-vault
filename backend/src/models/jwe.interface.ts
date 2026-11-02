export interface JwePayload {
  sub: string;
  email: string;
  fullName: string;
  role?: string;
  iat?: number;
  exp?: number;
  [key: string]: any;
}

export interface JweTokenInspection {
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

