import { randomBytes } from 'crypto';
import { prisma } from '../utils/prisma';

const DEFAULT_COUNT = 50;
const DEFAULT_REWARD_TYPE = 'nemu_ai_voucher';
const DEFAULT_TITLE = 'Voucher belanja Nemu Marketplace';
const DEFAULT_DESCRIPTION = 'Kode voucher untuk ditukar menjadi benefit belanja di Nemu Marketplace setelah klaim disetujui.';
const DEFAULT_REDEEM_URL = 'https://nemu-ai.com/';

function positiveInt(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return fallback;
  return parsed;
}

function makeCode(prefix: string) {
  return `${prefix}-${randomBytes(4).toString('hex').toUpperCase()}`;
}

async function main() {
  const requestedCount = positiveInt(process.argv[2] || process.env.REWARD_VOUCHER_SEED_COUNT, DEFAULT_COUNT);
  const prefix = (process.env.REWARD_VOUCHER_CODE_PREFIX || 'OC-NEMU').replace(/[^A-Z0-9-]/gi, '').toUpperCase() || 'OC-NEMU';
  const rewardType = process.env.REWARD_TYPE || DEFAULT_REWARD_TYPE;
  const title = process.env.REWARD_VALUE_LABEL || DEFAULT_TITLE;
  const description = process.env.REWARD_DESCRIPTION || DEFAULT_DESCRIPTION;
  const redeemUrl = process.env.REWARD_REDEEM_URL || DEFAULT_REDEEM_URL;

  let created = 0;
  let attempts = 0;

  while (created < requestedCount && attempts < requestedCount * 10) {
    attempts += 1;
    const code = makeCode(prefix);

    try {
      await prisma.rewardVoucher.create({
        data: {
          code,
          rewardType,
          title,
          description,
          redeemUrl,
          status: 'available',
        },
      });
      created += 1;
    } catch (error: any) {
      if (error?.code !== 'P2002') throw error;
    }
  }

  const [total, available, reserved, redeemed] = await Promise.all([
    prisma.rewardVoucher.count({ where: { rewardType } }),
    prisma.rewardVoucher.count({ where: { rewardType, status: 'available' } }),
    prisma.rewardVoucher.count({ where: { rewardType, status: 'reserved' } }),
    prisma.rewardVoucher.count({ where: { rewardType, status: 'redeemed' } }),
  ]);

  console.log(JSON.stringify({ requested: requestedCount, created, total, available, reserved, redeemed }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
