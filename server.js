require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

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
const NETWORK = process.env.NETWORK || 'base';

// x402 payment gate middleware factory
function x402Gate(amountUSDC) {
  return (req, res, next) => {
    const paymentHeader = req.headers['x-payment'];
    if (paymentHeader) {
      // Payment header present — pass to route handler
      // In production, verify payment here via facilitator
      return next();
    }
    // Return 402 with payment requirements
    res.status(402).json({
      x402Version: 1,
      error: 'Payment Required',
      accepts: [
        {
          scheme: 'exact',
          network: NETWORK,
          maxAmountRequired: String(Math.round(parseFloat(amountUSDC) * 1e6)),
          resource: req.originalUrl,
          description: 'Beverage API access',
          mimeType: 'application/json',
          payTo: WALLET,
          maxTimeoutSeconds: 300,
          asset: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base
          extra: { name: 'USD Coin', version: '2' }
        }
      ]
    });
  };
}

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'beverage-api' }));

// $0.10 endpoints
app.use('/v1/spirits', x402Gate('0.10'), spiritsRouter);
app.use('/v1/wines', x402Gate('0.10'), winesRouter);

// $0.25 endpoints
app.use('/v1/cocktails', x402Gate('0.25'), cocktailsRouter);
app.use('/v1/wine-pairings', x402Gate('0.25'), pairingsRouter);
app.use('/v1/seasonal', x402Gate('0.25'), seasonalRouter);

// $1.00 endpoints
app.use('/v1/menu-build', x402Gate('1.00'), menuBuildRouter);
app.use('/v1/cost-calc', x402Gate('1.00'), costCalcRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Beverage API running on port ' + PORT));

module.exports = app;
