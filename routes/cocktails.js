'use strict';
const router = require('express').Router();
const db = require('../lib/supabase');

router.get('/', async (req, res) => {
  const { base_spirit_id, method, occasion, complexity } = req.query;
  let q = db.from('cocktails').select('*, spirits(name, category)');
  if (base_spirit_id) q = q.eq('base_spirit_id', base_spirit_id);
  if (method)  q = q.eq('method', method);
  if (complexity) q = q.eq('complexity', parseInt(complexity));
  if (occasion) q = q.contains('occasion', [occasion]);
  const { data, error } = await q.order('name');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data, count: data.length });
});

router.get('/:id', async (req, res) => {
  const { data, error } = await db
    .from('cocktails')
    .select('*, spirits(name, category)')
    .eq('id', req.params.id)
    .single();
  if (error) return res.status(404).json({ error: 'Not found' });
  res.json({ data });
});

module.exports = router;
