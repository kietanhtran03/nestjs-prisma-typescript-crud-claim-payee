import { Test, TestingModule } from '@nestjs/testing';
import { ClaimPayeeService } from './claim-payee.service';

describe('ClaimPayeeService', () => {
  let service: ClaimPayeeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClaimPayeeService],
    }).compile();

    service = module.get<ClaimPayeeService>(ClaimPayeeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
