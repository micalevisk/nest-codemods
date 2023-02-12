
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, VersioningType } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('All routes at "controllers.ts" file', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('api');
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
      prefix: 'v',
    });

    await app.init();
  });

  afterAll(() => {
    return app.close();
  })

  describe('Routes without tenant prefix', () => {
    it('GET /api/v1/cat', () => {
      return request(app.getHttpServer())
        .get('/api/v1/cat')
        .expect(200)
        .expect({
          orgId: null,
        });
    });

    it('GET /api/v1/dog1', () => {
      return request(app.getHttpServer())
        .get('/api/v1/dog1')
        .expect(200)
        .expect({
          orgId: null,
        });
    });

    it('GET /api/v1/dog2', () => {
      return request(app.getHttpServer())
        .get('/api/v1/dog2')
        .expect(200)
        .expect({
          orgId: null,
        });
    });

    it('GET /api/v1/fish', () => {
      return request(app.getHttpServer())
        .get('/api/v1/fish')
        .expect(200)
        .expect({
          orgId: null,
        });
    });
  });


  describe('Routes with tenant prefix', () => {
    it('GET /api/v1/orgs/123/cat', () => {
      return request(app.getHttpServer())
        .get('/api/v1/orgs/123/cat')
        .expect(200)
        .expect({
          orgId: '123',
        });
    });

    it('GET /api/v1/orgs/123/dog1', () => {
      return request(app.getHttpServer())
        .get('/api/v1/orgs/123/dog1')
        .expect(200)
        .expect({
          orgId: '123',
        });
    });

    it('GET /api/v1/orgs/123/dog2', () => {
      return request(app.getHttpServer())
        .get('/api/v1/orgs/123/dog2')
        .expect(200)
        .expect({
          orgId: '123',
        });
    });

    it('GET /api/v1/orgs/123/fish', () => {
      return request(app.getHttpServer())
        .get('/api/v1/orgs/123/fish')
        .expect(200)
        .expect({
          orgId: '123',
        });
    });
  });
});
