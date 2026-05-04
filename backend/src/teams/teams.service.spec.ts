import { PrismaService } from '@/prisma/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';

import { TeamsService } from './teams.service';

jest.mock('@/prisma/prisma.service', () => {
  return {
    PrismaService: jest.fn(),
  };
});

describe('TeamsService', () => {
  let service: TeamsService;

  beforeAll(async () => {});

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TeamsService, PrismaService],
    }).compile();

    service = module.get<TeamsService>(TeamsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get team by id', async () => {});

  it('should create invitation', async () => {});

  afterEach(async () => {});

  afterAll(async () => {});
});
