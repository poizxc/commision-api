import { Controller, Post, Body } from '@nestjs/common';
import { CommisionsService } from './commisions.service';
import { CalculateCommisionDto } from './dto/calculate-commision.dto';

@Controller('commisions')
export class CommisionsController {
  constructor(private readonly commisionsService: CommisionsService) {}

  @Post('calculate')
  calculateCommision(@Body() calculateCommisionDto: CalculateCommisionDto) {
    return this.commisionsService.calculateCommision(calculateCommisionDto);
  }
}
