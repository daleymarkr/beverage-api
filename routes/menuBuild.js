'use strict';
const router = require('express').Router();
const db = require('../lib/supabase');

/**
 * POST /v1/menu-build
 * Body: { program_type, cuisine, venue_type, budget_tier, seat_count }
 * Returns: curated spirits + wines + cocktails matching the venue profile
 */
router.post('/', async (req, res) => {
  const { program_type = 'full', cuisine, venue_type, budget_tier = 'mid', seat_count } = req.body;

  const [{ data: spirits }, { data: wines }, { data: cocktails }] = await Promise.all([
    db.from('spirits')
      .select('id,name,category,region,price_tier,serving_style')
      .eq('price_tier', budget_tier)
      .limit(12),
    db.from('wines')
      .select('id,name,varietal,region,producer,vintage,price_tier')
      .eq('price_tier', budget_tier)
      .limit(12),
    db.from('cocktails')
      .select('id,name,base_spirit_id,method,glassware,flavor_profile,occasion,complexity')
      .lte('complexity', program_type === 'bar' ? 5 : 3)
      .limit(10)
  ]);

  res.json({
    program: { type: program_type, venue_type, cuisine, budget_tier, seat_count },
    spirits: spirits || [],
    wines: wines || [],
    cocktails: cocktails || [],
    generated_at: new Date().toISOString()
  });
});

module.exports = router;
