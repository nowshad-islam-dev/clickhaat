'use strict';
const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();

app.use(express.json({ limit: '10mb' }));

async function initDB() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('DB Connected');
}
initDB();
const port = process.env.PORT;
app.listen(port, () => console.log(`Server running on port:${port} `));
