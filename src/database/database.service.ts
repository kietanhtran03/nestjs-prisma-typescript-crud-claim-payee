import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma';

@Injectable()
export class DatabaseService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
//   constructor() {
//     super({
//       log: ['query', 'info', 'warn', 'error'],
//     });
//   }

  async onModuleInit() {
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$connect;
  }
}
export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
