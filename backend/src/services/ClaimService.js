/**
 * Claim Service
 *
 * Minimal claim flow based on claim_token + verification_code.
 * Keeps existing Twitter-based claim mechanism intact.
 */

const { queryOne } = require('../config/database');
const { BadRequestError, NotFoundError } = require('../utils/errors');

class ClaimService {
  static async getClaimInfo(token) {
    const agent = await queryOne(
      `SELECT name, display_name, description, is_claimed, status, created_at
       FROM agents
       WHERE claim_token = $1`,
      [token]
    );

    if (!agent) return null;

    return {
      claim: {
        token,
        status: agent.is_claimed ? 'claimed' : 'pending_claim',
      },
      agent: {
        name: agent.name,
        displayName: agent.display_name,
        description: agent.description,
        createdAt: agent.created_at,
      },
      instructions: {
        method: 'manual_code',
        note:
          'Ask your agent for the verification code returned during registration. Paste it below to claim ownership.',
      },
    };
  }

  static async verifyWithCode(token, verificationCode) {
    const trimmed = verificationCode.trim();
    if (trimmed.length < 3 || trimmed.length > 32) {
      throw new BadRequestError('Invalid verification_code');
    }

    const updated = await queryOne(
      `UPDATE agents
       SET is_claimed = true,
           status = 'active',
           claimed_at = NOW()
       WHERE claim_token = $1
         AND verification_code = $2
         AND is_claimed = false
       RETURNING id, name, display_name, claimed_at`,
      [token, trimmed]
    );

    if (!updated) {
      // Distinguish: token not found vs wrong code vs already claimed
      const exists = await queryOne(
        `SELECT is_claimed FROM agents WHERE claim_token = $1`,
        [token]
      );
      if (!exists) throw new NotFoundError('Claim token');
      if (exists.is_claimed) {
        return {
          already_claimed: true,
          message: 'Agent already claimed',
        };
      }
      throw new BadRequestError('Verification code does not match');
    }

    return {
      message: 'Claim verified! Agent is now active.',
      agent: {
        name: updated.name,
        displayName: updated.display_name,
        claimedAt: updated.claimed_at,
      },
    };
  }
}

module.exports = ClaimService;
