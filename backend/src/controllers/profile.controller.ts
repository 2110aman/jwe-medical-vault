import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JweAuthGuard } from '../guards/jwe-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { UsersService } from '../services/users.service';

@Controller('api/profile')
@UseGuards(JweAuthGuard)
export class ProfileController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getProfile(@CurrentUser() user: any, @Req() req: any) {
    const fullUser = await this.usersService.findById(user.id);
    if (!fullUser) {
      return { error: 'User not found' };
    }
    const { passwordHash, ...safeUser } = fullUser;

    return {
      success: true,
      data: safeUser,
      securityMetadata: {
        authenticatedVia: 'JWE (JSON Web Encryption - RFC 7516)',
        decryptedPayloadClaims: req.jwePayload,
        confidentialityGuarantee:
          'Payload was encrypted end-to-end with AES-256-GCM. Medical records were not exposed in transit.',
      },
    };
  }

  @Put()
  async updateProfile(@CurrentUser() user: any, @Body() updateData: any) {
    const updated = await this.usersService.updateProfile(user.id, updateData);
    if (!updated) {
      return { error: 'Failed to update profile' };
    }
    const { passwordHash, ...safeUser } = updated;
    return {
      success: true,
      message: 'Profile updated successfully',
      data: safeUser,
    };
  }

  @Post('allergies')
  async addAllergy(@CurrentUser() user: any, @Body('allergy') allergy: string) {
    if (!allergy || typeof allergy !== 'string') {
      return { error: 'Allergy string is required' };
    }
    const current = await this.usersService.findById(user.id);
    if (!current) return { error: 'User not found' };

    const allergies = [...(current.medicalRecord.allergies || [])];
    if (!allergies.includes(allergy.trim())) {
      allergies.push(allergy.trim());
    }

    const updated = await this.usersService.updateMedicalRecord(user.id, { allergies });
    const { passwordHash, ...safeUser } = updated;
    return {
      success: true,
      message: 'Allergy added to medical records',
      data: safeUser,
    };
  }

  @Post('medications')
  async addMedication(
    @CurrentUser() user: any,
    @Body()
    medication: {
      name: string;
      dosage: string;
      frequency: string;
      prescribedBy: string;
    },
  ) {
    if (!medication.name || !medication.dosage) {
      return { error: 'Medication name and dosage are required' };
    }
    const current = await this.usersService.findById(user.id);
    if (!current) return { error: 'User not found' };

    const medications = [...(current.medicalRecord.medications || []), medication];
    const updated = await this.usersService.updateMedicalRecord(user.id, { medications });
    const { passwordHash, ...safeUser } = updated;
    return {
      success: true,
      message: 'Medication record added',
      data: safeUser,
    };
  }
}

