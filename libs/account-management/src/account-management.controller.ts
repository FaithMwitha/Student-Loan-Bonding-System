import {
  Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Role } from '@app/common';
import { JwtAuthGuard, RolesGuard, Roles } from '@app/auth';
import { Audit, AuditAction, AuditEntity } from '@app/audit';
import { AccountManagementService } from './account-management.service';
import { CreateOfficerDto } from './dto/create-officer.dto';
import { UpdateAccountStatusDto } from './dto/update-account-status.dto';

interface AuthRequest extends Request {
  user: { sub: string; role: Role };
}

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AccountManagementController {
  constructor(private readonly service: AccountManagementService) {}

  @ApiOperation({ summary: 'Create a new officer account' })
  @Post('officers')
  @HttpCode(HttpStatus.CREATED)
  @Audit({
    action: AuditAction.OFFICER_ACCOUNT_CREATED,
    entity: AuditEntity.User,
    entityIdFrom: 'response.user.id',
  })
  createOfficer(@Body() dto: CreateOfficerDto) {
    return this.service.createOfficer(dto);
  }

  @ApiOperation({ summary: 'Get user information' })
  @Get('users/:id')
  getUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getUser(id);
  }

  @ApiOperation({ summary: 'Update user account status' })
  @Patch('users/:id/status')
  @Audit({
    action: AuditAction.ACCOUNT_STATUS_CHANGED,
    entity: AuditEntity.User,
    entityIdFrom: 'params.id',
  })
  setStatus(
    @Req() req: AuthRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAccountStatusDto,
  ) {
    return this.service.setStatus(req.user.sub, id, dto.status);
  }
}
