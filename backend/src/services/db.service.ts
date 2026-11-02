import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { User } from '../models/user.interface';

@Injectable()
export class DbService implements OnModuleInit {
  private readonly logger = new Logger(DbService.name);
  private dbFilePath: string;

  constructor() {
    // Resolve path to the backend/db directory
    const candidates = [
      path.resolve(process.cwd(), 'db', 'users.json'),
      path.resolve(process.cwd(), 'backend', 'db', 'users.json'),
      path.resolve(__dirname, '..', '..', 'db', 'users.json'),
      path.resolve(__dirname, '..', 'db', 'users.json'),
    ];

    // Pick first candidate or default to process.cwd() / db
    this.dbFilePath = candidates.find((p) => fs.existsSync(path.dirname(p))) || candidates[0];
  }

  onModuleInit() {
    this.ensureDbExists();
  }

  private ensureDbExists(): void {
    const dir = path.dirname(this.dbFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(this.dbFilePath)) {
      this.logger.warn(`Local database file not found at ${this.dbFilePath}. Initializing empty dataset.`);
      fs.writeFileSync(this.dbFilePath, JSON.stringify([], null, 2), 'utf-8');
    } else {
      this.logger.log(`Local JSON database connected: ${this.dbFilePath}`);
    }
  }

  /**
   * Reads all users from backend/db/users.json
   */
  async getAllUsers(): Promise<User[]> {
    try {
      this.ensureDbExists();
      const raw = await fs.promises.readFile(this.dbFilePath, 'utf-8');
      if (!raw || !raw.trim()) return [];
      return JSON.parse(raw);
    } catch (err: any) {
      this.logger.error(`Error reading from local database: ${err.message}`);
      return [];
    }
  }

  /**
   * Overwrites backend/db/users.json with the provided users list
   */
  async saveUsers(users: User[]): Promise<void> {
    try {
      this.ensureDbExists();
      const data = JSON.stringify(users, null, 2);
      await fs.promises.writeFile(this.dbFilePath, data, 'utf-8');
      this.logger.log(`Persisted ${users.length} user records to local DB folder: ${this.dbFilePath}`);
    } catch (err: any) {
      this.logger.error(`Error saving to local database: ${err.message}`);
      throw err;
    }
  }
}

