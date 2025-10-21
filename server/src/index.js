'use strict';
const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const compression = require('compression');

const app = express();

const whitelist = ['http://localhost:4000', 'http://localhost:3000'];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '100mb' }));
app.use(compression());

async function initDB() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('DB Connected');
}
initDB();

// Routes
const adminRouter = require('./routes/admin/admin.routes');
const userRouter = require('./routes/user.routes');
const categoryRouter = require('./routes/category.routes');
const productRouter = require('./routes/product.routes');
const cartRouter = require('./routes/cart.routes');
app.use('/api/auth/admin', adminRouter);
app.use('/api/auth', userRouter);
app.use('/api/category', categoryRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);

const port = process.env.PORT;
app.listen(port, () => console.log(`Server running on port:${port}`));
