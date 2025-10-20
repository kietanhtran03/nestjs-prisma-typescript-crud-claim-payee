import { Injectable, Scope } from '@nestjs/common';
import { CreateClaimPayeeDto } from './dto/create-claim-payee.dto';
import { UpdateClaimPayeeDto } from './dto/update-claim-payee.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class ClaimPayeeService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createClaimPayeeDto: CreateClaimPayeeDto) {
    const { paymentAccounts, addresses, ...rest } = createClaimPayeeDto;

    return this.databaseService.claimPayee.create({
      data: {
        ...rest,
        paymentAccounts: paymentAccounts
          ? { create: paymentAccounts }
          : undefined,
        addresses: addresses ? { create: addresses } : undefined,
      },
      include: {
        paymentAccounts: true,
        addresses: true,
      },
    });
  }

  async findAll() {
    return this.databaseService.claimPayee.findMany({
      include: {
        paymentAccounts: true,
        addresses: true,
      },
    });
  }

  async findOne(id: number) {
    return this.databaseService.claimPayee.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        paymentAccounts: true,
        addresses: true,
      },
    });
  }

  async update(id: number, updateClaimPayeeDto: UpdateClaimPayeeDto) {
    const { paymentAccounts, addresses, ...rest } = updateClaimPayeeDto;

    return this.databaseService.$transaction(async (tx) => {
      const updated = await tx.claimPayee.update({
        where: { id },
        data: { ...rest },
      });

      if (paymentAccounts && paymentAccounts.length > 0) {
        for (const acc of paymentAccounts) {
          await tx.paymentAccount.updateMany({
            where: { claimPayeeId: id, accountName: acc.accountName },
            data: {
              ...acc,
            },
          });
        }
      }

      if (addresses && addresses.length > 0) {
        for (const adr of addresses) {
          await tx.address.updateMany({
            where: { claimPayeeId: id, city: adr.city },
            data: {
              ...adr,
            },
          });
        }
      }
      return updated
    });
  }

  async remove(id: number) {
    return this.databaseService.$transaction(async (tx) => {
      await tx.paymentAccount.deleteMany({ where: { claimPayeeId: id } });
      await tx.address.deleteMany({ where: { claimPayeeId: id } });
      return await tx.claimPayee.delete({ where: { id } });
    });
  }
}
