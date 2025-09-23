const express = require('express');
const router = express.Router();

const { signup, signin } = require('../../controllers/admin/admin.controllers');
const {
  validateSignupRequest,
  isRequestValidated,
  validateSiginRequest,
} = require('../../validators/auth.validators');

router.post('/signup', validateSignupRequest, isRequestValidated, signup);
router.post('/signin', validateSiginRequest, isRequestValidated, signin);

module.exports = router;
