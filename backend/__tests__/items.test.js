const request = require('supertest');
const express = require('express');
const itemsRouter = require('../src/routes/items');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(express.json());
app.use('/api/items', itemsRouter);

const testDataPath = path.join(__dirname, '../../data/items.json');
const originalData = [
  { id: 1, name: 'Test Item 1', category: 'Electronics', price: 99.99 },
  { id: 2, name: 'Test Item 2', category: 'Books', price: 19.99 },
  { id: 3, name: 'Another Item', category: 'Electronics', price: 149.99 }
];

describe('Items Routes', () => {
  beforeEach(async () => {
    await fs.writeFile(testDataPath, JSON.stringify(originalData, null, 2));
  });

  afterEach(async () => {
    try {
      await fs.unlink(testDataPath);
    } catch (err) {
      // File might not exist
    }
  });

  describe('GET /api/items', () => {
    test('should return all items', async () => {
      const response = await request(app)
        .get('/api/items')
        .expect(200);

      expect(response.body.items).toBeDefined();
      expect(response.body.items).toHaveLength(3);
      expect(response.body.pagination).toBeDefined();
    });

    test('should filter items by search query', async () => {
      const response = await request(app)
        .get('/api/items?q=Test')
        .expect(200);

      expect(response.body.items).toHaveLength(2);
      expect(response.body.items[0].name).toContain('Test');
    });

    test('should limit results', async () => {
      const response = await request(app)
        .get('/api/items?limit=1')
        .expect(200);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.pagination.limit).toBe(1);
    });

    test('should handle pagination', async () => {
      const response = await request(app)
        .get('/api/items?limit=2&page=2')
        .expect(200);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.pagination.page).toBe(2);
    });
  });

  describe('GET /api/items/:id', () => {
    test('should return specific item', async () => {
      const response = await request(app)
        .get('/api/items/1')
        .expect(200);

      expect(response.body.id).toBe(1);
      expect(response.body.name).toBe('Test Item 1');
    });

    test('should return 404 for non-existent item', async () => {
      const response = await request(app)
        .get('/api/items/999')
        .expect(404);

      expect(response.body.error).toBe('Item not found');
    });

    test('should return 400 for invalid ID', async () => {
      const response = await request(app)
        .get('/api/items/invalid')
        .expect(400);

      expect(response.body.error).toBe('Invalid item ID');
    });
  });

  describe('POST /api/items', () => {
    test('should create new item', async () => {
      const newItem = {
        name: 'New Test Item',
        category: 'Test',
        price: 29.99
      };

      const response = await request(app)
        .post('/api/items')
        .send(newItem)
        .expect(201);

      expect(response.body.name).toBe(newItem.name);
      expect(response.body.id).toBeDefined();
    });

    test('should validate required fields', async () => {
      const invalidItem = { name: 'Test' };

      const response = await request(app)
        .post('/api/items')
        .send(invalidItem)
        .expect(400);

      expect(response.body.error).toContain('required');
    });
  });
});