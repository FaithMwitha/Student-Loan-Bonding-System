import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {
    this.logger.log('Email service ready (Console Mode)');
  }

  async send(to: string, subject: string, text: string): Promise<void> {
    this.logger.log(`FAKE EMAIL SENT TO: ${to}`);
    this.logger.log(`Subject: ${subject}`);
    this.logger.log(`Content: ${text}`);
    this.logger.log(`-----------------------------------------`);
  }

  async createNotification(userId: string, message: string) {
    const notification = this.notificationRepo.create({ userId, message });
    return this.notificationRepo.save(notification);
  }

  async getUserNotifications(userId: string, isRead?: boolean) {
    const whereClause: any = { userId };
    
    if (isRead !== undefined) {
      whereClause.isRead = isRead;
    }

    return this.notificationRepo.find({
      where: whereClause,
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.notificationRepo.findOne({ 
      where: { id, userId } 
    });
    
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.isRead = true;
    return this.notificationRepo.save(notification);
  }

  async remove(id: string, userId: string) {
    const notification = await this.notificationRepo.findOne({ 
      where: { id, userId } 
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.notificationRepo.remove(notification);
  }

  async sendOtpEmail(email: string, otp: string) {
    await this.send(
      email, 
      'Your Email Verification Code', 
      `Your OTP code is: ${otp}. It expires in 15 minutes.`
    );
  }

  async sendLoanStatusAlert(userId: string, status: string, reason?: string) {
    const message = reason 
      ? `Your loan status changed to ${status}. Reason: ${reason}` 
      : `Your loan status changed to ${status}.`;
      
    return this.createNotification(userId, message);
  }
}