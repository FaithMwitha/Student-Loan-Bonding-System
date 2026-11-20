import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';

import { VerificationsService } from './verification.service';

@Controller('verifications')
export class VerificationsController {
  constructor(
    private readonly verificationsService: VerificationsService,
  ) {}

  // Get all students in the verification module
  @Get()
  findAll() {
    return this.verificationsService.findAll();
  }

  // Get students awaiting verification
  @Get('pending')
  findPending() {
    return this.verificationsService.findPending();
  }

  // Get a single verification record
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.verificationsService.findOne(id);
  }
}