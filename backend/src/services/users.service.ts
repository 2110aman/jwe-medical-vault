import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { User, MedicalRecord } from '../models/user.interface';
import { DbService } from './db.service';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly dbService: DbService) {}

  async onModuleInit() {
    await this.ensureSeedData();
  }

  private async ensureSeedData() {
    const existing = await this.dbService.getAllUsers();
    if (existing && existing.length > 0) {
      this.logger.log(`Loaded ${existing.length} existing users from local DB folder.`);
      return;
    }

    this.logger.log('Seeding initial users into local DB folder...');
    const saltRounds = 10;
    const defaultPasswordHash = await bcrypt.hash('password123', saltRounds);

    const user1: User = {
      id: 'usr_01h8x93k2v',
      email: 'alex.rivera@medivault.io',
      passwordHash: defaultPasswordHash,
      fullName: 'Alex Rivera, M.Sc.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      phone: '+1 (555) 234-5678',
      address: {
        street: '742 Evergreen Terrace, Suite 4B',
        city: 'San Francisco',
        state: 'California',
        zipCode: '94107',
        country: 'United States',
      },
      medicalRecord: {
        bloodType: 'O-Negative (Universal Donor)',
        height: '178 cm (5\' 10")',
        weight: '72.5 kg (160 lbs)',
        allergies: ['Penicillin (Severe anaphylaxis)', 'Peanuts (Moderate urticaria)', 'Latex'],
        chronicConditions: ['Asthma (Exercise-induced)', 'Mild Seasonal Allergic Rhinitis'],
        medications: [
          {
            name: 'Albuterol Sulfate Inhalation Aerosol',
            dosage: '90 mcg/actuation',
            frequency: '2 puffs PRN before exercise',
            prescribedBy: 'Dr. Evelyn Reed, Pulmonologist',
          },
          {
            name: 'Montelukast Sodium',
            dosage: '10 mg tablet',
            frequency: 'Once daily at bedtime',
            prescribedBy: 'Dr. Evelyn Reed, Pulmonologist',
          },
          {
            name: 'Cetirizine Hydrochloride',
            dosage: '10 mg tablet',
            frequency: 'Once daily as needed for allergies',
            prescribedBy: 'Dr. Evelyn Reed, Pulmonologist',
          },
        ],
        vitals: {
          bloodPressure: '118/76 mmHg (Optimal)',
          heartRate: '68 bpm (Resting)',
          temperature: '98.4 °F (36.9 °C)',
          oxygenSaturation: '99% on room air',
          lastChecked: '2026-10-18',
        },
        immunizations: [
          { vaccine: 'COVID-19 Updated Bivalent Booster', date: '2025-11-04', status: 'Up to Date' },
          { vaccine: 'Tdap (Tetanus, Diphtheria, Pertussis)', date: '2024-05-12', status: 'Valid until 2034' },
          { vaccine: 'Hepatitis B Series (3 doses)', date: '2021-08-20', status: 'Completed & Immune' },
          { vaccine: 'Influenza Annual Quadrivalent', date: '2026-09-15', status: 'Current Season' },
        ],
        emergencyContact: {
          name: 'Elena Rivera',
          relationship: 'Spouse',
          phone: '+1 (555) 891-2345',
        },
        primaryPhysician: {
          name: 'Dr. Jonathan Vance, MD',
          clinic: 'Pacific Heights Medical Center',
          phone: '+1 (555) 443-1200',
        },
        recentNotes:
          'Annual physical exam completed in October 2026. Patient reports excellent cardiovascular endurance. Spirometry test values normal. Continue current asthma maintenance protocol.',
      },
      createdAt: new Date().toISOString(),
    };

    const user2: User = {
      id: 'usr_02k9m71p4w',
      email: 'sarah.jenkins@healthgrid.org',
      passwordHash: defaultPasswordHash,
      fullName: 'Dr. Sarah Jenkins',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      phone: '+1 (555) 345-9876',
      address: {
        street: '1200 Beacon Street, Apt 15C',
        city: 'Boston',
        state: 'Massachusetts',
        zipCode: '02446',
        country: 'United States',
      },
      medicalRecord: {
        bloodType: 'A-Positive',
        height: '167 cm (5\' 6")',
        weight: '61 kg (134 lbs)',
        allergies: ['Sulfa drugs', 'Tree nuts'],
        chronicConditions: ['Migraine with aura (Controlled)', 'Vitamin D Deficiency'],
        medications: [
          {
            name: 'Sumatriptan Succinate',
            dosage: '50 mg oral tablet',
            frequency: 'At onset of migraine attack',
            prescribedBy: 'Dr. Mark Chen, Neurologist',
          },
          {
            name: 'Cholecalciferol (Vitamin D3)',
            dosage: '2000 IU softgel',
            frequency: 'Daily with meal',
            prescribedBy: 'Dr. Rachel Adams, PCP',
          },
        ],
        vitals: {
          bloodPressure: '112/72 mmHg (Normal)',
          heartRate: '64 bpm (Resting)',
          temperature: '98.6 °F (37.0 °C)',
          oxygenSaturation: '100%',
          lastChecked: '2026-09-29',
        },
        immunizations: [
          { vaccine: 'MMR (Measles, Mumps, Rubella)', date: '2019-02-14', status: 'Immunity Confirmed' },
          { vaccine: 'Varicella (Chickenpox)', date: '2018-06-10', status: 'Immunity Confirmed' },
          { vaccine: 'Influenza Annual Quadrivalent', date: '2026-10-02', status: 'Current Season' },
        ],
        emergencyContact: {
          name: 'David Jenkins',
          relationship: 'Brother',
          phone: '+1 (555) 776-5432',
        },
        primaryPhysician: {
          name: 'Dr. Rachel Adams, MD',
          clinic: 'Beacon Health & Wellness Clinic',
          phone: '+1 (555) 232-8800',
        },
        recentNotes:
          'Migraine episodes have decreased to < 1 per quarter under prophylactic regimen. Vitamin D levels have normalized to 48 ng/mL.',
      },
      createdAt: new Date().toISOString(),
    };

    await this.dbService.saveUsers([user1, user2]);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const users = await this.dbService.getAllUsers();
    const normalized = email.trim().toLowerCase();
    return users.find((u) => u.email.toLowerCase() === normalized);
  }

  async findById(id: string): Promise<User | undefined> {
    const users = await this.dbService.getAllUsers();
    return users.find((u) => u.id === id);
  }

  async create(userData: Partial<User> & { password: string }): Promise<User> {
    const users = await this.dbService.getAllUsers();
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(userData.password, saltRounds);

    const newUser: User = {
      id: `usr_${Math.random().toString(36).substring(2, 11)}`,
      email: userData.email.trim().toLowerCase(),
      passwordHash,
      fullName: userData.fullName || 'New Patient',
      avatarUrl:
        userData.avatarUrl ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
      phone: userData.phone || '+1 (555) 000-0000',
      address: userData.address || {
        street: '100 Medical Center Way',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States',
      },
      medicalRecord: userData.medicalRecord || {
        bloodType: 'B-Positive',
        height: '172 cm',
        weight: '68 kg',
        allergies: ['No Known Drug Allergies (NKDA)'],
        chronicConditions: ['None Reported'],
        medications: [],
        vitals: {
          bloodPressure: '120/80 mmHg',
          heartRate: '72 bpm',
          temperature: '98.6 °F',
          oxygenSaturation: '99%',
          lastChecked: new Date().toISOString().split('T')[0],
        },
        immunizations: [
          { vaccine: 'COVID-19 Booster', date: '2025-10-10', status: 'Up to Date' },
          { vaccine: 'Tetanus Booster', date: '2023-04-15', status: 'Valid' },
        ],
        emergencyContact: {
          name: 'Contact Person',
          relationship: 'Family Member',
          phone: '+1 (555) 999-1111',
        },
        primaryPhysician: {
          name: 'Dr. Gregory House, MD',
          clinic: 'General Health Partners',
          phone: '+1 (555) 123-4567',
        },
        recentNotes: 'Initial medical intake completed upon registration.',
      },
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    await this.dbService.saveUsers(users);
    return newUser;
  }

  async updateMedicalRecord(userId: string, update: Partial<MedicalRecord>): Promise<User | null> {
    const users = await this.dbService.getAllUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) return null;

    users[index].medicalRecord = {
      ...users[index].medicalRecord,
      ...update,
    };
    await this.dbService.saveUsers(users);
    return users[index];
  }

  async updateProfile(userId: string, update: Partial<User>): Promise<User | null> {
    const users = await this.dbService.getAllUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) return null;

    if (update.fullName) users[index].fullName = update.fullName;
    if (update.phone) users[index].phone = update.phone;
    if (update.avatarUrl) users[index].avatarUrl = update.avatarUrl;
    if (update.address) {
      users[index].address = { ...users[index].address, ...update.address };
    }

    await this.dbService.saveUsers(users);
    return users[index];
  }
}

