import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('StudyForge API Smoke Test', () => {
  it('GET /api/health should return status online', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('online');
    expect(res.body.service).toBe('StudyForge API');
  });

  it('GET /api/v1/auth/me should fail with 401 when unauthorized', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
