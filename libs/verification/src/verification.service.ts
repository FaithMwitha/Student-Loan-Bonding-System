import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHmac, randomInt, timingSafeEqual } from 'crypto';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { UsersService } from '@app/users';
import { EmailSender } from './email-sender';
import { EmailVerification } from './entities/email-verification.entity';

const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;
const MAX_PER_HOUR = 5;

@Injectable()
export class VerificationService {
  constructor(
    @InjectRepository(EmailVerification)
    private readonly repo: Repository<EmailVerification>,
    private readonly users: UsersService,
    private readonly mail: EmailSender,
    private readonly config: ConfigService,
  ) {}

  private hash(userId: string, code: string) {
    const secret = this.config.getOrThrow<string>('OTP_SECRET');
    return createHmac('sha256', secret).update(`${userId}:${code}`).digest('hex');
  }

  /** Silently does nothing when rate-limited, so callers can't probe accounts. */
  async issue(userId: string, email: string): Promise<void> {
    const now = Date.now();
    const recent = await this.repo.find({
      where: { userId, createdAt: MoreThan(new Date(now - 60 * 60 * 1000)) },
      order: { createdAt: 'DESC' },
    });
    if (recent.length >= MAX_PER_HOUR) return;
    if (recent[0] && now - recent[0].createdAt.getTime() < RESEND_COOLDOWN_MS) return;

    // only the newest code stays valid
    await this.repo.update({ userId, consumedAt: IsNull() }, { consumedAt: new Date() });

    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    await this.repo.save(
      this.repo.create({
        userId,
        codeHash: this.hash(userId, code),
        expiresAt: new Date(now + OTP_TTL_MS),
        attempts: 0,
        consumedAt: null,
      }),
    );
    await this.mail.send(
      email,
      'Verify your email',
      `Your verification code is ${code}. It expires in 10 minutes. If you did not register, ignore this message.`,
    );
  }

  async resend(email: string): Promise<{ message: string }> {
    const user = await this.users.findByEmail(email);
    if (user && !user.emailVerified) await this.issue(user.id, user.email);
    return { message: 'If the account exists and is unverified, a new code was sent.' };
  }

  async confirm(email: string, code: string): Promise<{ message: string }> {
    const fail = () => new BadRequestException('Invalid or expired code');
    const user = await this.users.findByEmail(email);
    if (!user || user.emailVerified) throw fail();

    const record = await this.repo.findOne({
      where: { userId: user.id, consumedAt: IsNull(), expiresAt: MoreThan(new Date()) },
      order: { createdAt: 'DESC' },
    });
    if (!record || record.attempts >= MAX_ATTEMPTS) throw fail();

    await this.repo.increment({ id: record.id }, 'attempts', 1);

    const expected = Buffer.from(record.codeHash);
    const actual = Buffer.from(this.hash(user.id, code));
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) throw fail();

    await this.repo.update({ id: record.id }, { consumedAt: new Date() });
    await this.users.markEmailVerified(user.id);
    return { message: 'Email verified' };
  }
}