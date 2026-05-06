import { Test, TestingModule } from '@nestjs/testing';
import { ActivationCodesController } from './activation-codes.controller';

describe('ActivationCodesController', () => {
  let controller: ActivationCodesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivationCodesController],
    }).compile();

    controller = module.get<ActivationCodesController>(ActivationCodesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
