import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseService } from './database/database.service';
import { DatabaseModule } from './database/database.module';
import { ClaimPayeeModule } from './claim-payee/claim-payee.module';

@Module({
  imports: [ DatabaseModule, ClaimPayeeModule],
  controllers: [AppController],
  providers: [AppService, DatabaseService],
})
export class AppModule {}
