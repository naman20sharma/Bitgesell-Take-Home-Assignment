const express = require('express');
const { promises: fs } = require('fs');
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

let dataCache = null;
let lastModified = null;

async function readData() {
  try {
    const stats = await fs.stat(DATA_PATH);
    
    if (!dataCache || stats.mtime > lastModified) {
      const raw = await fs.readFile(DATA_PATH, 'utf8');
      dataCache = JSON.parse(raw);
      lastModified = stats.mtime;
    }
    
    return dataCache;
  } catch (error) {
    throw new Error('Unable to read data file');
  }
}

router.get('/', async (req, res, next) => {
  try {
    const data = await readData();
    const { limit, q, page = 1 } = req.query;
    let results = data;

    if (q && q.trim()) {
      const searchTerm = q.toLowerCase().trim();
      results = results.filter(item => 
        item.name.toLowerCase().includes(searchTerm) ||
        item.category.toLowerCase().includes(searchTerm)
      );
    }

    const totalCount = results.length;
    const pageSize = parseInt(limit) || 50;
    const pageNum = parseInt(page);
    const startIndex = (pageNum - 1) * pageSize;
    
    results = results.slice(startIndex, startIndex + pageSize);

    res.json({
      items: results,
      pagination: {
        page: pageNum,
        limit: pageSize,
        total: totalCount,
        totalPages: Math.ceil(totalCount / pageSize)
      }
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const data = await readData();
    const itemId = parseInt(req.params.id);
    
    if (isNaN(itemId)) {
      return res.status(400).json({ error: 'Invalid item ID' });
    }
    
    const item = data.find(i => i.id === itemId);
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

    const data = await readData();
    const newItem = {
      id: Date.now(),
      name: name.trim(),
      category: category.trim(),
      price: parseFloat(price)
    };
    
    data.push(newItem);
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
    
    dataCache = data;
    lastModified = new Date();
    
    res.status(201).json(newItem);
  } catch (err) {
    next(err);
  }
});

module.exports = router;