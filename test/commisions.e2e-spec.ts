import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CurrencyModule } from '../src/currency/currency.module';
import { CalculateCommisionDto } from '../src/commisions/dto/calculate-commision.dto';

describe('app tests (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, CurrencyModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  describe('/commisions/calculate (Post)', () => {
    it('should fail on validation error', () => {
      return request(app.getHttpServer())
        .post('/commisions/calculate')
        .expect(400)
        .expect({
          statusCode: 400,
          message: [
            'date must be a valid ISO 8601 date string',
            'amount must be a number string',
            'currency must be a valid enum value',
            'currency must be a string',
            'client_id must not be less than 1',
            'client_id must be an integer number',
          ],
          error: 'Bad Request',
        });
    });

    it('should fail when amount is 0', () => {
      const dto: CalculateCommisionDto = {
        date: '2022-02-22',
        amount: '0',
        currency: 'EUR',
        client_id: 1,
      };

      return request(app.getHttpServer())
        .post('/commisions/calculate')
        .send(dto)
        .expect(400)
        .expect({
          statusCode: 400,
          message: 'Amount must be bigger than 0',
          error: 'Bad Request',
        });
    });

    it('should fail when amount is less than 0', () => {
      const dto: CalculateCommisionDto = {
        date: '2022-02-22',
        amount: '-22',
        currency: 'EUR',
        client_id: 1,
      };

      return request(app.getHttpServer())
        .post('/commisions/calculate')
        .send(dto)
        .expect(400)
        .expect({
          statusCode: 400,
          message: 'Amount must be bigger than 0',
          error: 'Bad Request',
        });
    });

    it('should calculate small request', () => {
      const dto: CalculateCommisionDto = {
        date: '2022-02-22',
        amount: '1',
        currency: 'EUR',
        client_id: 1,
      };
      const expected = { amount: '0.05', currency: 'EUR' };

      return request(app.getHttpServer())
        .post('/commisions/calculate')
        .send(dto)
        .expect(200)
        .expect(expected);
    });

    it('should have discount for small request after turnover', () => {
      const dto1: CalculateCommisionDto = {
        date: '2022-02-22',
        amount: '1000',
        currency: 'EUR',
        client_id: 1,
      };
      const dto2: CalculateCommisionDto = {
        date: '2022-02-22',
        amount: '1',
        currency: 'EUR',
        client_id: 1,
      };
      const expected = { amount: '0.03', currency: 'EUR' };

      return request(app.getHttpServer())
        .post('/commisions/calculate')
        .send(dto1)
        .then(() => {
          return request(app.getHttpServer())
            .post('/commisions/calculate')
            .send(dto2)
            .expect(200)
            .expect(expected);
        });
    });

    it('should not have discount for small request before turnover', () => {
      const dto1: CalculateCommisionDto = {
        date: '2022-02-22',
        amount: '999',
        currency: 'EUR',
        client_id: 1,
      };
      const dto2: CalculateCommisionDto = {
        date: '2022-02-22',
        amount: '1',
        currency: 'EUR',
        client_id: 1,
      };
      const expected = { amount: '0.05', currency: 'EUR' };

      return request(app.getHttpServer())
        .post('/commisions/calculate')
        .send(dto1)
        .then(() => {
          return request(app.getHttpServer())
            .post('/commisions/calculate')
            .send(dto2)
            .expect(200)
            .expect(expected);
        });
    });

    it('should have fixed price for client 42', () => {
      const dto: CalculateCommisionDto = {
        date: '2022-02-22',
        amount: '999',
        currency: 'EUR',
        client_id: 42,
      };
      const expected = { amount: '0.05', currency: 'EUR' };

      return request(app.getHttpServer())
        .post('/commisions/calculate')
        .send(dto)
        .expect(200)
        .expect(expected);
    });

    it('should have discount on fixed price for client 42', () => {
      const dto1: CalculateCommisionDto = {
        date: '2022-02-22',
        amount: '11111',
        currency: 'EUR',
        client_id: 42,
      };
      const dto2: CalculateCommisionDto = {
        date: '2022-02-23',
        amount: '11111',
        currency: 'EUR',
        client_id: 42,
      };
      const expected = { amount: '0.03', currency: 'EUR' };

      return request(app.getHttpServer())
        .post('/commisions/calculate')
        .send(dto1)
        .then(() => {
          return request(app.getHttpServer())
            .post('/commisions/calculate')
            .send(dto2)
            .expect(200)
            .expect(expected);
        });
    });

    it('should handle big amount', () => {
      const dto: CalculateCommisionDto = {
        date: '2022-02-22',
        amount: '200',
        currency: 'EUR',
        client_id: 1,
      };
      const expected = { amount: '1.00', currency: 'EUR' };

      return request(app.getHttpServer())
        .post('/commisions/calculate')
        .send(dto)
        .expect(200)
        .expect(expected);
    });

    it('should handle currency changes', () => {
      const dto: CalculateCommisionDto = {
        date: '2022-02-22',
        amount: '1000',
        currency: 'PLN',
        client_id: 1,
      };
      const expected = { amount: '1.09', currency: 'EUR' };

      return request(app.getHttpServer())
        .post('/commisions/calculate')
        .send(dto)
        .expect(200)
        .expect(expected);
    });
  });
});
