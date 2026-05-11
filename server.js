require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { paymentMiddleware } = require('@x402/express');

const spiritsRouter = require('./routes/spirits');
const winesRouter = require('./routes/wines');
const cocktailsRouter = require('./routes/cocktails');
const pairingsRouter = require('./routes/pairings');
const menuBuildRouter = require('./routes/menuBuild');
const costCalcRouter = require('./routes/costCalc');
const seasonalRouter = require('./routes/seasonal');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

const WALLET = process.env.CDP_WALLET_ADDRESS;

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'beverage-api' }));

// $0.10 endpoints
app.use('/v1/spirits', paymentMiddleware(WALLET, { amount: '0.10', currency: 'USDC' }), spiritsRouter);
app.use('/v1/wines', paymentMiddleware(WALLET, { amount: '0.10', currency: 'USDC' }), winesRouter);

// $0.25 endpoints
app.use('/v1/cocktails', paymentMiddleware(WALLET, { amount: '0.25', currency: 'USDC' }), cocktailsRouter);
app.use('/v1/wine-pairings', paymentMiddleware(WALLET, { amount: '0.25', currency: 'USDC' }), pairingsRouter);
app.use('/v1/seasonal', paymentMiddleware(WALLET, { amount: '0.25', currency: 'USDC' }), seasonalRouter);

// $1.00 endpoints
app.use('/v1/menu-build', paymentMiddleware(WALLET, { amount: '1.00', currency: 'USDC' }), menuBuildRouter);
app.use('/v1/cost-calc', paymentMiddleware(WALLET, { amount: '1.00', currency: 'USDC' }), costCalcRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Beverage API running on port ${PORT}`));

module.exports = app;
