import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Role } from '@app/common';
import { JwtAuthGuard, Roles, RolesGuard } from '@app/auth';
import { NotificationsService } from './notifications.service';

interface AuthRequest extends Request {
  user: { sub: string; role: Role };
}

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Get my notifications' })
  getMyNotifications(@Req() req: AuthRequest) {
    return this.notificationsService.getUserNotifications(req.user.sub);
  }
}