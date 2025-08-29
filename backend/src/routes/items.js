const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

async function readItems() {
  const raw = await fs.promises.readFile(DATA_PATH, 'utf8');
  return JSON.parse(raw);
}

router.get('/', async (req, res, next) => {
  try {
    let items = await readItems();

    const limit = Math.max(1, parseInt(req.query.limit || '20', 10));
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const q = (req.query.q || '').trim().toLowerCase();

    if (q) {
      items = items.filter(it =>
        it.name.toLowerCase().includes(q) ||
        it.category.toLowerCase().includes(q)
      );
    }

    const total = items.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const pageItems = items.slice(start, end);

    res.json({
      items: pageItems,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      hasPrev: page > 1,
      hasNext: end < total,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const items = await readItems();
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid item ID' });
    }

    const item = items.find(i => i.id === id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(item);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, category, price } = req.body;

    if (!name || !category || typeof price !== 'number') {
      return res.status(400).json({
        error: 'Name, category, and numeric price are required'
      });
    }

    const items = await readItems();
    const newItem = {
      id: Date.now(),
      name: name.trim(),
      category: category.trim(),
      price: parseFloat(price)
    };

    items.push(newItem);
    await fs.promises.writeFile(DATA_PATH, JSON.stringify(items, null, 2));

    res.status(201).json(newItem);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

