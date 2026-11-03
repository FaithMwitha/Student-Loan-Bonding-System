import { NestFactory } from '@nestjs/core';
import { ApiModule } from '../apps/api/src/api.module';
import { UsersService } from '../libs/users/src/users.service';
import { Role } from '../libs/common/src/enums/role.enum';

async function seedAdmin() {
  const app = await NestFactory.createApplicationContext(ApiModule);

  try {
    const name = process.env.INITIAL_ADMIN_NAME?.trim();
    const email = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.INITIAL_ADMIN_PASSWORD;

    if (!name || !email || !password) {
      throw new Error('Please configure the initial Admin environment variables.');
    }

    if (password.length < 8) {
      throw new Error('Admin password must be at least 8 characters.');
    }

    const usersService = app.get(UsersService, { strict: false });

    // Check whether this email already exists.
    const existingUser = await usersService.findByEmail(email);

    if (existingUser) {
      if (existingUser.primaryRole !== Role.ADMIN) {
        throw new Error(
          'This email already belongs to a non-Admin account. No changes were made.',
        );
      }

      console.log('An Admin account with this email already exists.');
      return;
    }

    // Create the Admin account.
    const admin = await usersService.createAdmin({
      name,
      email,
      password,
    });

    // Mark the Admin email as verified.
    await usersService.markEmailVerified(admin.id);

    console.log('Initial Admin account created successfully.');
    console.log(`Admin email: ${admin.email}`);
  } finally {
    await app.close();
  }
}

seedAdmin().catch((error) => {
  console.error('Admin seeding failed:', error.message);
  process.exitCode = 1;
});