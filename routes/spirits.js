'use strict';
const router = require('express').Router();
const db = require('../lib/supabase');

// GET /v1/spirits
router.get('/', async (req, res) => {
  const { category, price_tier, region } = req.query;
  let q = db.from('spirits').select('*');
  if (category)   q = q.eq('category', category);
  if (price_tier) q = q.eq('price_tier', price_tier);
  if (region)     q = q.ilike('region', '%' + region + '%');
  const { data, error } = await q.order('name');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data, count: data.length });
});

// GET /v1/spirits/:id
router.get('/:id', async (req, res) => {
  const { data, error } = await db
    .from('spirits')
    .select('*')
    .eq('id', req.params.id)
    .single();
  if (error) return res.status(404).json({ error: 'Not found' });
  res.json({ data });
});

module.exports = router;
