import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { Payment } from './entities/payment.entity';
import { randomUUID } from 'crypto';
import { NotificationsService } from '../../notifications/src/notifications.service';
import { ReceiptService } from './receipt/receipt.service';
import { LoanApplication } from '../../loans/src/entities/loan-application.entity';
import { ApplicationStatus } from '../../loans/src/enums/application-status.enum';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    
    @InjectRepository(LoanApplication)
    private readonly loanRepo: Repository<LoanApplication>,
    private readonly receiptService: ReceiptService,

    private readonly notificationsService: NotificationsService, 
  ) {}

  async create(createPaymentDto: CreatePaymentDto, userId: string) {
    const transactionReference = `PAY-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`;

    const newPayment = this.paymentRepository.create({
      ...createPaymentDto,
      userId,
      status: 'PENDING',
      transactionReference,
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

    if (status === 'COMPLETED') {
      if (updatedPayment.userId) {
        await this.notificationsService.createNotification(
          updatedPayment.userId,
          `Your payment of K${updatedPayment.amount} was successful!`
        );
      }

      if (updatedPayment.applicationId) {
        await this.loanRepo.update(
          { id: updatedPayment.applicationId },
          { status: ApplicationStatus.SUBMITTED }
        );
      }
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

      if (status === 'COMPLETED') {
        if (savedPayment.userId) {
          await this.notificationsService.createNotification(
            savedPayment.userId,
            `Payment confirmed via webhook. Amount: K${savedPayment.amount}`
          );
        }

        if (savedPayment.applicationId) {
          await this.loanRepo.update(
            { id: savedPayment.applicationId },
            { status: ApplicationStatus.SUBMITTED }
          );
        }
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

  async getReceiptBuffer(id: string, userId: string, isAdmin: boolean): Promise<Buffer> {
    const payment = await this.findOne(id);

    if (!isAdmin && payment.userId !== userId) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    if (payment.status !== 'COMPLETED') {
      throw new NotFoundException(
        `Receipt available only for completed payments (current status: ${payment.status})`,
      );
    }

    return this.receiptService.generateReceipt(payment);
  }
}
