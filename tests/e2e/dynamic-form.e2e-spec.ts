import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Dynamic Form E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should create and fetch dynamic form configuration', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/admission-track/form-config')
      .send({ type: 'text', label: 'Test Field' })
      .expect(201);

    expect(createResponse.body).toBeDefined();

    const fetchResponse = await request(app.getHttpServer())
      .get('/admission-track/form-config')
      .expect(200);

    expect(fetchResponse.body).toEqual(
      expect.arrayContaining([expect.objectContaining({ label: 'Test Field' })])
    );
  });

  afterAll(async () => {
    await app.close();
  });
});
