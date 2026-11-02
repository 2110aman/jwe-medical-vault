import { Injectable, Logger } from '@nestjs/common';
import * as jose from 'jose';
import * as crypto from 'crypto';
import { JwePayload, JweTokenInspection } from '../models/jwe.interface';

@Injectable()
export class JweService {
  private readonly logger = new Logger(JweService.name);
  private readonly secretKey: Uint8Array;

  constructor() {
    // 32-byte secret (256 bits) for AES-256 key management
    const secret = process.env.JWE_SECRET || 'a-super-secret-key-32-chars-long-1234567890!';
    const hash = crypto.createHash('sha256').update(secret).digest();
    this.secretKey = new Uint8Array(hash);
    this.logger.log('JWE Service initialized with AES-256-GCM encryption.');
  }

  /**
   * Generates a 5-part JWE (JSON Web Encryption) token (RFC 7516).
   */
  async createToken(payload: JwePayload, expiresIn = '8h'): Promise<string> {
    const jwt = new jose.EncryptJWT(payload)
      .setProtectedHeader({ alg: 'A256GCMKW', enc: 'A256GCM' })
      .setIssuedAt()
      .setIssuer('jwe-medical-auth-system')
      .setAudience('jwe-medical-client')
      .setExpirationTime(expiresIn);

    const token = await jwt.encrypt(this.secretKey);
    return token;
  }

  /**
   * Decrypts and verifies the JWE token.
   */
  async verifyAndDecrypt(token: string): Promise<JwePayload> {
    try {
      const { payload } = await jose.jwtDecrypt(token, this.secretKey, {
        issuer: 'jwe-medical-auth-system',
        audience: 'jwe-medical-client',
      });
      return payload as unknown as JwePayload;
    } catch (err: any) {
      this.logger.error(`Failed to decrypt JWE: ${err.message}`);
      throw new Error(`Invalid or expired JWE token: ${err.message}`);
    }
  }

  /**
   * Inspects the 5 segments of a JWE compact token according to RFC 7516.
   */
  inspectToken(token: string): JweTokenInspection {
    const segments = token.split('.');
    if (segments.length !== 5) {
      throw new Error(`Invalid JWE format. Expected 5 segments, got ${segments.length}`);
    }

    const [headerB64, encKeyB64, ivB64, cipherB64, tagB64] = segments;

    let decodedHeader = {};
    try {
      const headerStr = Buffer.from(headerB64, 'base64url').toString('utf8');
      decodedHeader = JSON.parse(headerStr);
    } catch (e) {
      decodedHeader = { raw: headerB64 };
    }

    return {
      token,
      partsCount: 5,
      parts: {
        header: {
          raw: headerB64,
          decoded: decodedHeader,
          description: 'Protected Header: algorithm (A256GCMKW) and encryption algorithm (A256GCM)',
        },
        encryptedKey: {
          raw: encKeyB64,
          byteLength: Buffer.from(encKeyB64, 'base64url').length,
          description: 'Encrypted Content Encryption Key (CEK), protected with AES-256 Key Wrap',
        },
        iv: {
          raw: ivB64,
          byteLength: Buffer.from(ivB64, 'base64url').length,
          description: 'Initialization Vector (IV): random nonce ensuring ciphertext uniqueness',
        },
        ciphertext: {
          raw: cipherB64,
          byteLength: Buffer.from(cipherB64, 'base64url').length,
          sample: cipherB64.slice(0, 30) + '...',
          description: 'Encrypted Payload: the claims (sub, email, name) are fully encrypted and concealed',
        },
        authTag: {
          raw: tagB64,
          byteLength: Buffer.from(tagB64, 'base64url').length,
          description: 'Authentication Tag (MAC): validates ciphertext integrity and prevents tampering',
        },
      },
      securityComparison: {
        standardJwt_JWS:
          '3-part token (header.payload.signature). The payload is ONLY Base64 encoded, meaning anyone who captures it can read user details and sensitive medical claims.',
        encryptedJwt_JWE:
          '5-part token (header.encryptedKey.iv.ciphertext.authTag). The payload is strongly encrypted via AES-256-GCM. Third parties cannot inspect any user or medical info without the decryption key.',
      },
    };
  }
}

