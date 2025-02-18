import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma-clients/auth';
import { PrismaService } from '../prisma/prisma.service';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

bcrypt.setRandomFallback((len: number) => {
  return Array.from(crypto.randomBytes(len));
});

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  private readonly logger = new Logger(UsersService.name);

  async getUserByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: { email },
    });
  }

  async getUser(args: Prisma.UserWhereUniqueInput) {
    return this.prismaService.user.findUniqueOrThrow({
      where: args,
    });
  }

  async getUserById(id: number) {
    return this.prismaService.user.findUnique({
      where: { id },
    });
  }

  async getUsers() {
    return this.prismaService.user.findMany();
  }

  async upsertUser(data: Prisma.UserCreateInput & { newPassword?: string }) {
    if (!data.password) {
      throw new Error('Password is required');
    }

    const existingUser = await this.getUserByEmail(data.email);

    if (existingUser) {
      // Verify current password
      if (!bcrypt.compareSync(data.password, existingUser.password)) {
        throw new Error('Invalid current password');
      }

      // Fields to exclude from comparison
      const excludedFields = [
        'id',
        'email',
        'createdAt',
        'updatedAt',
        'password',
        'newPassword',
      ];

      // Prepare update data
      const updateData: Prisma.UserUpdateInput & { newPassword?: string } = {
        ...data,
      };
      delete updateData.newPassword; // Remove newPassword from the data to update

      // Handle password update if newPassword is provided
      if (data.newPassword) {
        const salt = bcrypt.genSaltSync(10);
        updateData.password = bcrypt.hashSync(data.newPassword, salt);
      } else {
        delete updateData.password; // Don't update password if newPassword isn't provided
      }

      // Compare existing user with new data
      const hasChanges = Object.keys(updateData).some((key) => {
        if (excludedFields.includes(key)) return false;
        return updateData[key] !== existingUser[key];
      });

      if (!hasChanges && !data.newPassword) {
        return existingUser;
      }

      updateData.updatedAt = new Date();

      return this.prismaService.user.update({
        where: { email: data.email },
        data: updateData,
      });
    }

    // Create new user (ignore newPassword for creation)
    const salt = bcrypt.genSaltSync(10);
    const newUserData = {
      ...data,
      password: bcrypt.hashSync(data.password, salt),
      updatedAt: new Date(),
    };
    delete newUserData.newPassword;

    return this.prismaService.user.create({
      data: newUserData,
    });
  }
}
