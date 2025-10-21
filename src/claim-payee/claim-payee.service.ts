import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClaimPayeeDto } from './dto/create-claim-payee.dto';
import { UpdateClaimPayeeDto } from './dto/update-claim-payee.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class ClaimPayeeService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createClaimPayeeDto: CreateClaimPayeeDto, userId: number) {
    const { paymentAccounts, addresses, ...rest } = createClaimPayeeDto;

    return this.databaseService.claimPayee.create({
      data: {
        ...rest,
        createdBy: userId,
        updatedBy: userId,
        paymentAccounts: paymentAccounts
          ? { create: paymentAccounts }
          : undefined,
        addresses: addresses ? { create: addresses } : undefined,
      },
      include: {
        paymentAccounts: true,
        addresses: true,
        createdByUser: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        updatedByUser: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.databaseService.claimPayee.findMany({
      where: {
        isDeleted: false,
      },
      include: {
        paymentAccounts: {
          where: { isActive: true },
        },
        addresses: {
          where: { isActive: true },
        },
        createdByUser: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        updatedByUser: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const claimPayee = await this.databaseService.claimPayee.findFirst({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        paymentAccounts: true,
        addresses: true,
        createdByUser: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        updatedByUser: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        deletedByUser: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });

    if (!claimPayee) {
      throw new NotFoundException(`Claim payee with ID ${id} not found`);
    }

    return claimPayee;
  }

  async update(
    id: number,
    updateClaimPayeeDto: UpdateClaimPayeeDto,
    userId: number,
  ) {
    // Check if exists
    await this.findOne(id);

    const { paymentAccounts, addresses, ...rest } = updateClaimPayeeDto;

    return this.databaseService.$transaction(async (tx) => {
      // Update main entity
      const updated = await tx.claimPayee.update({
        where: { id },
        data: {
          ...rest,
          updatedBy: userId,
        },
      });

      // Update payment accounts if provided
      if (paymentAccounts && paymentAccounts.length > 0) {
        for (const acc of paymentAccounts) {
          const { id: accId, ...accData } = acc as any;
          
          if (accId) {
            // Update existing
            await tx.paymentAccount.update({
              where: { id: accId },
              data: accData,
            });
          } else {
            // Create new
            await tx.paymentAccount.create({
              data: {
                ...accData,
                claimPayeeId: id,
              },
            });
          }
        }
      }

      // Update addresses if provided
      if (addresses && addresses.length > 0) {
        for (const addr of addresses) {
          const { id: addrId, ...addrData } = addr as any;
          
          if (addrId) {
            // Update existing
            await tx.address.update({
              where: { id: addrId },
              data: addrData,
            });
          } else {
            // Create new
            await tx.address.create({
              data: {
                ...addrData,
                claimPayeeId: id,
              },
            });
          }
        }
      }

      // Return updated entity with relations
      return tx.claimPayee.findUnique({
        where: { id },
        include: {
          paymentAccounts: true,
          addresses: true,
          updatedByUser: {
            select: {
              id: true,
              username: true,
              fullName: true,
            },
          },
        },
      });
    });
  }

  async remove(id: number, userId: number) {
    // Check if exists
    await this.findOne(id);

    // Soft delete
    return this.databaseService.claimPayee.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
      },
      include: {
        deletedByUser: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });
  }

  async restore(id: number, userId: number) {
    const claimPayee = await this.databaseService.claimPayee.findUnique({
      where: { id },
    });

    if (!claimPayee) {
      throw new NotFoundException(`Claim payee with ID ${id} not found`);
    }

    if (!claimPayee.isDeleted) {
      throw new NotFoundException(`Claim payee with ID ${id} is not deleted`);
    }

    return this.databaseService.claimPayee.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
        updatedBy: userId,
      },
      include: {
        updatedByUser: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });
  }

  // Hard delete (only for SUPER_ADMIN)
  async hardDelete(id: number) {
    return this.databaseService.$transaction(async (tx) => {
      await tx.paymentAccount.deleteMany({ where: { claimPayeeId: id } });
      await tx.address.deleteMany({ where: { claimPayeeId: id } });
      return await tx.claimPayee.delete({ where: { id } });
    });
  }
}

