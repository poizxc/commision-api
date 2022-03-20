import { Test, TestingModule } from '@nestjs/testing';
import { CurrencyModule } from '../currency/currency.module';
import { CommisionRulesService } from './commision-rules.service';
import { CommisionTurnoverService } from './commision-turnover.service';
import { CommisionsController } from './commisions.controller';
import { CommisionsService } from './commisions.service';
import { CalculateCommisionDto } from './dto/calculate-commision.dto';

describe('CommisionsController', () => {
  let controller: CommisionsController;
  let commisionsService: CommisionsService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommisionsController],
      imports: [CurrencyModule],
      providers: [
        CommisionsService,
        CommisionRulesService,
        CommisionTurnoverService,
      ],
    }).compile();

    controller = module.get<CommisionsController>(CommisionsController);
    commisionsService = module.get<CommisionsService>(CommisionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('calculateCommision method', () => {
    it('shouldCall calculateCommision on commisionsService with correct params', async () => {
      const mockedResponse = {
        amount: '1',
        currency: 'EUR',
      };
      const dto: CalculateCommisionDto = {
        date: 'string',
        amount: 'string',
        currency: 'string',
        client_id: 1,
      };

      jest
        .spyOn(commisionsService, 'calculateCommision')
        .mockResolvedValueOnce(mockedResponse);

      await controller.calculateCommision(dto);

      expect(commisionsService.calculateCommision).toBeCalledTimes(1);

      expect(commisionsService.calculateCommision).toBeCalledWith(dto);
    });
  });
});
