'use strict';
const express = require('express');
const router = express.Router();
router.get('/', async (res, req, next) => {
  console.log('well done!!!');
  res.send('Hello!!!');
});
module.exports = router;
