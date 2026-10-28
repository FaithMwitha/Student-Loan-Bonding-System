import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import * as nodemailer from 'nodemailer';
import { EmailSender } from '../../verification/src/email-sender';

@Injectable()
export class NotificationsService extends EmailSender {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {
    super(); // Required because we are extending EmailSender
    nodemailer.createTestAccount().then((account) => {
      this.transporter = nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: {
          user: account.user,
          pass: account.pass,
        },
      });
      this.logger.log('Test email account ready');
    });
  }

  // THIS IS THE METHOD THEY ASKED FOR
  async send(to: string, subject: string, text: string): Promise<void> {
    if (!this.transporter) {
      this.logger.error('Email transporter not ready yet');
      return;
    }

    const info = await this.transporter.sendMail({
      from: '"Student Loan System" <noreply@studentloan.com>',
      to,
      subject,
      text,
    });

    this.logger.log(`Email sent! Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  }

  // Save a notification to the DB
  async createNotification(userId: string, message: string) {
    const notification = this.notificationRepo.create({ userId, message });
    return this.notificationRepo.save(notification);
  }

  // Get all notifications for a specific user
  async getUserNotifications(userId: string) {
    return this.notificationRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  // Mark a notification as read
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

  // Delete a notification
  async remove(id: string, userId: string) {
    const notification = await this.notificationRepo.findOne({ 
      where: { id, userId } 
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.notificationRepo.remove(notification);
  }

  // Generate 6-digit OTP and send email (Kept for backwards compatibility)
  async sendOtpEmail(email: string, otp: string) {
    await this.send(
      email, 
      'Your Email Verification Code', 
      `Your OTP code is: ${otp}. It expires in 15 minutes.`
    );
  }

  // Trigger when a loan status changes
  async sendLoanStatusAlert(userId: string, status: string, reason?: string) {
    const message = reason 
      ? `Your loan status changed to ${status}. Reason: ${reason}` 
      : `Your loan status changed to ${status}.`;
      
    return this.createNotification(userId, message);
  }
}