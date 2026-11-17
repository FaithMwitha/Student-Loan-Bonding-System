import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Notification } from './entities/notification.entity';
import { UsersService } from '../../users/src/users.service'; // Make sure this path is correct

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService, // <-- Inject UsersService
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
      secure: true,
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });
    this.logger.log('Real Email Service Ready (Nodemailer)');
  }

  async send(to: string, subject: string, text: string): Promise<void> {
    try {
      const mailOptions = {
        from: `"Malawi Student Loans" <${this.configService.get('MAIL_USER')}>`,
        to,
        subject,
        text,
        html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
                 <h2>${subject}</h2>
                 <p>${text}</p>
               </div>`,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`REAL EMAIL SENT TO: ${to} | Subject: ${subject}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
      this.logger.log(`FAKE EMAIL FALLBACK: ${to} | ${subject} | ${text}`);
    }
  }

  async createNotification(userId: string, message: string) {

    const notification = this.notificationRepo.create({ userId, message });
    const savedNotification = await this.notificationRepo.save(notification);

    try {
      const user = await this.usersService.findById(userId);
      if (user && user.email) {
        await this.send(user.email, 'Student Loan Update', message);
      }
    } catch (error) {
      this.logger.error(`Could not fetch user for email notification: ${userId}`);
    }

    return savedNotification;
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