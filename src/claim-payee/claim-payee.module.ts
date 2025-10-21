import { Module } from '@nestjs/common';
import { ClaimPayeeService } from './claim-payee.service';
import { ClaimPayeeController } from './claim-payee.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ClaimPayeeController],
  providers: [ClaimPayeeService],
})
export class ClaimPayeeModule {}
