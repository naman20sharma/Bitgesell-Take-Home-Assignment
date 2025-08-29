const request = require('supertest');
const app = require('../src/index');

describe('GET /api/items', () => {
  test('paginates', async () => {
    const r1 = await request(app).get('/api/items?limit=2&page=1');
    expect(r1.status).toBe(200);
    expect(r1.body.items).toHaveLength(2);

    const r2 = await request(app).get('/api/items?limit=2&page=2');
    expect(r2.status).toBe(200);
    expect(r2.body.items).toHaveLength(2);
    expect(r2.body.items[0].id).not.toBe(r1.body.items[0].id);
  });

  test('search filters', async () => {
    const r = await request(app).get('/api/items?q=laptop&limit=50&page=1');
    expect(r.status).toBe(200);
    expect(
      r.body.items.every(i =>
        /laptop/i.test(i.name) || /laptop/i.test(i.category)
      )
    ).toBe(true);
  });

  test('bad params clamp', async () => {
    const r = await request(app).get('/api/items?limit=0&page=0');
    expect(r.status).toBe(200);
    expect(r.body.page).toBe(1);
    expect(r.body.limit).toBeGreaterThanOrEqual(1);
  });
});

