import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { Payment } from './entities/payment.entity';
import { LoanApplication } from '@app/loans';
import { ApplicationStatus } from '@app/loans';
import { NotificationsService } from '../../notifications/src/notifications.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly notificationsService: NotificationsService,
    @InjectRepository(LoanApplication)
    private readonly loanRepository: Repository<LoanApplication>,
  ) {}

  async create(createPaymentDto: CreatePaymentDto, userId: string) {
    const newPayment = this.paymentRepository.create({
      ...createPaymentDto,
      userId,
      status: 'PENDING',
    });
    const savedPayment = await this.paymentRepository.save(newPayment);

    await this.notificationsService.createNotification(
      userId,
      `Your payment of K${savedPayment.amount} is pending. Reference: ${savedPayment.transactionReference || 'N/A'}`
    );

    return savedPayment;
  }

  async findMyPayments(userId: string) {
    return await this.paymentRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async verifyPayment(reference: string) {
    const payment = await this.paymentRepository.findOne({
      where: { transactionReference: reference },
    });
    if (!payment) {
      throw new NotFoundException(
        `Payment with reference ${reference} not found`,
      );
    }
    return payment;
  }

  async findOne(id: string) {
    const payment = await this.paymentRepository.findOne({ where: { id } });
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return payment;
  }

  async updateStatus(id: string, status: string) {
    const payment = await this.findOne(id);
    payment.status = status;
    const updatedPayment = await this.paymentRepository.save(payment);

    if (status === 'COMPLETED' && updatedPayment.userId) {
      await this.notificationsService.createNotification(
        updatedPayment.userId,
        `Your payment of K${updatedPayment.amount} was successful!`
      );
    }

    return updatedPayment;
  }

  async handleWebhook(payload: PaymentWebhookDto) {
    const { transactionReference, status, amount } = payload;

    const payment = await this.paymentRepository.findOne({
      where: { transactionReference },
    });

    if (payment) {
      payment.status = status;
      const savedPayment = await this.paymentRepository.save(payment);

      // Auto-unlock loan for review after successful payment
      if (status === 'COMPLETED' && savedPayment.applicationId) {
        await this.loanRepository.update(
          { id: savedPayment.applicationId },
          { status: ApplicationStatus.SUBMITTED },
        );
      }

      if (status === 'COMPLETED' && savedPayment.userId) {
        await this.notificationsService.createNotification(
          savedPayment.userId,
          `Payment confirmed via webhook. Amount: K${savedPayment.amount}`
        );
      }

      return {
        received: true,
        message: 'Payment status updated via webhook',
        payment: savedPayment,
      };
    }

    const newPayment = this.paymentRepository.create({
      transactionReference,
      status,
      amount,
    });
    const savedNewPayment = await this.paymentRepository.save(newPayment);
    
    return {
      received: true,
      message: 'New payment recorded via webhook',
      payment: savedNewPayment,
    };
  }
}