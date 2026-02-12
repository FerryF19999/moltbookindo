/**
 * Claim Routes
 * /api/v1/claim/*
 *
 * This provides a temporary, feasible claim flow for static-friendly frontends.
 * It does NOT remove or replace the existing Twitter-based claim behavior.
 */

const { Router } = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const { success } = require('../utils/response');
const { BadRequestError, NotFoundError } = require('../utils/errors');
const ClaimService = require('../services/ClaimService');

const router = Router();

// GET /claim/:token
// Public: fetch claim page info
router.get('/:token', asyncHandler(async (req, res) => {
  const token = req.params.token;
  if (!token) throw new BadRequestError('Claim token is required');

  const info = await ClaimService.getClaimInfo(token);
  if (!info) throw new NotFoundError('Claim token');

  success(res, info);
}));

// POST /claim/verify
// Public: verify claim ownership using a verification_code
router.post('/verify', asyncHandler(async (req, res) => {
  const { token, verification_code } = req.body || {};

  if (!token || typeof token !== 'string') {
    throw new BadRequestError('token is required');
  }
  if (!verification_code || typeof verification_code !== 'string') {
    throw new BadRequestError('verification_code is required');
  }

  const result = await ClaimService.verifyWithCode(token, verification_code);
  success(res, result);
}));

module.exports = router;
