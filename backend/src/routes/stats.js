const express = require('express');
const fs = require('fs');
const path = require('path');
const { mean } = require('../utils/stats');

const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

let cache = { data: null, ts: 0 };
const TTL_MS = 5 * 60 * 1000;

router.get('/', async (req, res, next) => {
  try {
    const now = Date.now();
    if (cache.data && now - cache.ts < TTL_MS) {
      return res.json(cache.data);
    }

    const raw = await fs.promises.readFile(DATA_PATH, 'utf8');
    const items = JSON.parse(raw);

    if (!items || items.length === 0) {
      const empty = { total: 0, averagePrice: 0 };
      cache = { data: empty, ts: now };
      return res.json(empty);
    }

    const prices = items.map(item => item.price).filter(p => !isNaN(p));
    const categories = [...new Set(items.map(item => item.category))];

    const stats = {
      total: items.length,
      averagePrice: prices.length > 0 ? mean(prices) : 0,
      categoryCount: categories.length,
      priceRange: {
        min: Math.min(...prices),
        max: Math.max(...prices)
      }
    };

    cache = { data: stats, ts: now };
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

