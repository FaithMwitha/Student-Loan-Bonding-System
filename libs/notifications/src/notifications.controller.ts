import { Controller, Get, Req, UseGuards, Patch, Delete, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { Role } from '@app/common';
import { JwtAuthGuard } from '../../auth/src/jwt/jwtauthguard';
import { RolesGuard } from '../../auth/src/roles/roles.guard';
import { Roles } from '../../auth/src/roles/roles.decorators';
import { NotificationsService } from './notifications.service';

interface AuthRequest extends Request {
  user: { sub: string; role: Role };
}

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.STUDENT) // 👈 Applies to all endpoints in this controller
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get my notifications',
    description: 'Retrieves a list of in-app notifications for the logged-in student. You can optionally filter by read/unread status.',
  })
  @ApiQuery({ 
    name: 'isRead', 
    required: false, 
    type: Boolean, 
    description: 'Filter by read status (true = read, false = unread)',
    example: false
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Success! Returns an array of notifications.',
    schema: {
      example: [
        {
          id: "b2fce3b4-9e0b-4743-8d7e-14e10398268a",
          userId: "13f462bb-4d85-4681-bbf6-d59d984415d8",
          message: "Your loan status changed to APPROVED.",
          isRead: false,
          createdAt: "2026-10-25T05:30:00.000Z"
        }
      ]
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized. Missing or invalid JWT token.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Only students can access this.' })
  getMyNotifications(@Req() req: AuthRequest, @Query('isRead') isRead?: boolean) {
    return this.notificationsService.getUserNotifications(req.user.sub, isRead);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a specific notification as read' })
  @ApiResponse({ 
    status: 200, 
    description: 'Notification marked as read successfully.',
    schema: {
      example: {
        id: "b2fce3b4-9e0b-4743-8d7e-14e10398268a",
        userId: "13f462bb-4d85-4681-bbf6-d59d984415d8",
        message: "Your loan status changed to APPROVED.",
        isRead: true,
        createdAt: "2026-10-25T05:30:00.000Z"
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Notification not found or does not belong to you.' })
  markAsRead(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.notificationsService.markAsRead(id, req.user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a specific notification' })
  @ApiResponse({ 
    status: 200, 
    description: 'Notification deleted successfully.',
    schema: {
      example: {
        id: "b2fce3b4-9e0b-4743-8d7e-14e10398268a",
        userId: "13f462bb-4d85-4681-bbf6-d59d984415d8",
        message: "Your loan status changed to APPROVED.",
        isRead: true,
        createdAt: "2026-10-25T05:30:00.000Z"
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Notification not found or does not belong to you.' })
  remove(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.notificationsService.remove(id, req.user.sub);
  }
}