'use strict';
const router = require('express').Router();
const db = require('../lib/supabase');

router.get('/', async (req, res) => {
  const { varietal, price_tier, region, producer } = req.query;
  let q = db.from('wines').select('*');
  if (varietal)   q = q.ilike('varietal', '%' + varietal + '%');
  if (price_tier) q = q.eq('price_tier', price_tier);
  if (region)     q = q.ilike('region', '%' + region + '%');
  if (producer)   q = q.ilike('producer', '%' + producer + '%');
  const { data, error } = await q.order('name');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data, count: data.length });
});

router.get('/:id', async (req, res) => {
  const { data, error } = await db
    .from('wines').select('*').eq('id', req.params.id).single();
  if (error) return res.status(404).json({ error: 'Not found' });
  res.json({ data });
});

module.exports = router;
