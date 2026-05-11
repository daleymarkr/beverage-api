'use strict';
const router = require('express').Router();
const db = require('../lib/supabase');

// GET /v1/seasonal?season=fall&format=cocktails|wines|spirits
// Returns seasonally appropriate beverage recommendations
router.get('/', async (req, res) => {
  const { season, format = 'all' } = req.query;

  // Map seasons to flavor profiles and serving styles
  const seasonMap = {
    spring: { flavor_profiles: ['floral', 'citrus', 'herbal', 'light'], serve: 'cocktail' },
    summer: { flavor_profiles: ['citrus', 'tropical', 'refreshing', 'light'], serve: 'cocktail' },
    fall:   { flavor_profiles: ['smoky', 'spice', 'caramel', 'rich'], serve: 'neat' },
    winter: { flavor_profiles: ['smoky', 'rich', 'caramel', 'bitter', 'herbal'], serve: 'neat' }
  };

  const currentSeason = season || (() => {
    const m = new Date().getMonth();
    if (m >= 2 && m <= 4) return 'spring';
    if (m >= 5 && m <= 7) return 'summer';
    if (m >= 8 && m <= 10) return 'fall';
    return 'winter';
  })();

  const profile = seasonMap[currentSeason] || seasonMap.fall;
  const results = {};

  if (format === 'all' || format === 'cocktails') {
    const { data } = await db.from('cocktails')
      .select('id,name,flavor_profile,occasion,complexity,garnish,glassware')
      .overlaps('flavor_profile', profile.flavor_profiles)
      .limit(6);
    results.cocktails = data || [];
  }

  if (format === 'all' || format === 'spirits') {
    const { data } = await db.from('spirits')
      .select('id,name,category,region,tasting_notes,serving_style')
      .contains('serving_style', [profile.serve])
      .limit(6);
    results.spirits = data || [];
  }

  if (format === 'all' || format === 'wines') {
    const { data } = await db.from('wines')
      .select('id,name,varietal,region,producer,vintage')
      .limit(6);
    results.wines = data || [];
  }

  res.json({ season: currentSeason, format, ...results });
});

module.exports = router;
