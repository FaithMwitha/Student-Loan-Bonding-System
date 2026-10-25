import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {
    // Set up a test email account using Ethereal (no real password needed)
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

  // Generate 6-digit OTP and send email
  async sendOtpEmail(email: string, otp: string) {
    if (!this.transporter) {
      this.logger.error('Email transporter not ready yet');
      return;
    }

    const info = await this.transporter.sendMail({
      from: '"Student Loan System" <noreply@studentloan.com>',
      to: email,
      subject: 'Your Email Verification Code',
      text: `Your OTP code is: ${otp}. It expires in 15 minutes.`,
      html: `<b>Your OTP code is: <span style="font-size: 24px; color: blue;">${otp}</span></b>`,
    });

    // Print the Ethereal link in terminal so you can view the email
    this.logger.log(`OTP Email sent! Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    return info;
  }

  // Trigger when a loan status changes
  async sendLoanStatusAlert(userId: string, status: string, reason?: string) {
    const message = reason 
      ? `Your loan status changed to ${status}. Reason: ${reason}` 
      : `Your loan status changed to ${status}.`;
      
    return this.createNotification(userId, message);
  }
}