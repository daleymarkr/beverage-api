'use strict';
const router = require('express').Router();

/**
 * POST /v1/cost-calc
 * Body: { items: [{name, cost_per_unit, pour_oz, bottle_oz, menu_price}] }
 * Returns: pour cost %, recommended price, GP per item
 */
router.post('/', (req, res) => {
  const { items = [] } = req.body;
  if (!items.length) return res.status(400).json({ error: 'items array required' });

  const results = items.map(item => {
    const { name, cost_per_unit, pour_oz, bottle_oz = 750, menu_price } = item;
    if (!cost_per_unit || !pour_oz) return { name, error: 'cost_per_unit and pour_oz required' };

    // Convert bottle volume (ml default) to oz if needed
    const bottle_oz_calc = bottle_oz > 100 ? bottle_oz / 29.5735 : bottle_oz;
    const cost_per_oz = cost_per_unit / bottle_oz_calc;
    const pour_cost = cost_per_oz * pour_oz;
    const pour_cost_pct = menu_price ? ((pour_cost / menu_price) * 100).toFixed(1) : null;
    // Industry standard: 18-22% pour cost target
    const recommended_price = +(pour_cost / 0.20).toFixed(2);
    const gp = menu_price ? +(menu_price - pour_cost).toFixed(2) : null;

    return {
      name,
      pour_cost: +pour_cost.toFixed(4),
      pour_cost_pct: pour_cost_pct ? +pour_cost_pct : null,
      recommended_price_at_20pct: recommended_price,
      gp_per_pour: gp,
      rating: pour_cost_pct
        ? +pour_cost_pct < 18 ? 'excellent' : +pour_cost_pct < 22 ? 'good' : +pour_cost_pct < 28 ? 'watch' : 'above-target'
        : null
    };
  });

  res.json({ data: results, calculated_at: new Date().toISOString() });
});

module.exports = router;
