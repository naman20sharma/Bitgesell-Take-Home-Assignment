const express = require('express');
const { promises: fs } = require('fs');
const path = require('path');
const { mean } = require('../utils/stats');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

let statsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

router.get('/', async (req, res, next) => {
  try {
    const now = Date.now();
    
    if (statsCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
      return res.json(statsCache);
    }

    const raw = await fs.readFile(DATA_PATH, 'utf8');
    const items = JSON.parse(raw);
    
    if (!items || items.length === 0) {
      return res.json({ total: 0, averagePrice: 0 });
    }

    const prices = items.map(item => item.price).filter(price => !isNaN(price));
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

    statsCache = stats;
    cacheTimestamp = now;

    res.json(stats);
  } catch (err) {
    next(err);
  }
});

module.exports = router;