'use strict';
const router = require('express').Router();
const db = require('../lib/supabase');

// GET /v1/wine-pairings?dish=salmon&cuisine=japanese
router.get('/', async (req, res) => {
  const { dish, cuisine, type } = req.query;
  let q = db.from('pairings')
    .select('*, spirits(name,category), wines(name,varietal,region)')
  if (dish)    q = q.ilike('dish', '%' + dish + '%');
  if (cuisine) q = q.ilike('cuisine', '%' + cuisine + '%');
  if (type)    q = q.eq('type', type);
  const { data, error } = await q.order('type');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data, count: data.length });
});

module.exports = router;
