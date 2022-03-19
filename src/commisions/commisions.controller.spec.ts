import { Test, TestingModule } from '@nestjs/testing';
import { CommisionsController } from './commisions.controller';
import { CommisionsService } from './commisions.service';

describe('CommisionsController', () => {
  let controller: CommisionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommisionsController],
      providers: [CommisionsService],
    }).compile();

    controller = module.get<CommisionsController>(CommisionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
