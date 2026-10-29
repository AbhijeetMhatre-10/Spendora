const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const axios = require('axios');
const cron = require('node-cron');

// import the sanitizeMiddleware
const { sanitizeMiddleware } = require("./middleware/sanitizeMiddleware")

// Load environment variables
dotenv.config();

require('./cron');

// Connect to database
connectDB();

const app = express();

app.use(
  cors({
    origin: function (origin, callback) {
      callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());

// sanitizeMiddleware
app.use(sanitizeMiddleware());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/receipts', require('./routes/receiptRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/budgets', require('./routes/budgetRoutes'));
app.use('/api/recurring', require('./routes/recurringTransactionRoutes'));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.send('API is Running');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () =>
  console.log(`Server started on port ${PORT}`)
);

if (process.env.NODE_ENV !== "test") {
  let keepAliveInProgress = false;

  cron.schedule("*/10 * * * *", async () => {
    if (keepAliveInProgress) {
      console.warn("Skipping keep-alive ping because the previous ping is still running.");
      return;
    }

    const keepAliveUrl = process.env.KEEP_ALIVE_URL;
    if (!keepAliveUrl) {
      console.error(
        "KEEP_ALIVE_URL environment variable is not set. Skipping keep-alive ping."
      );
      return;
    }

    try {
      keepAliveInProgress = true;
      await axios.get(keepAliveUrl, { timeout: 10000 });
      console.log("Keep-alive ping sent!");
    } catch (error) {
      console.error("Keep-alive FAILED!", error.message);
    } finally {
      keepAliveInProgress = false;
    }
  });
}

module.exports = { app, server };
