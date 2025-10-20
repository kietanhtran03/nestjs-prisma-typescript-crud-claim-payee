import { Test, TestingModule } from '@nestjs/testing';
import { ClaimPayeeController } from './claim-payee.controller';
import { ClaimPayeeService } from './claim-payee.service';

describe('ClaimPayeeController', () => {
  let controller: ClaimPayeeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClaimPayeeController],
      providers: [ClaimPayeeService],
    }).compile();

    controller = module.get<ClaimPayeeController>(ClaimPayeeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
