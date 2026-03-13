import { prisma } from './prisma';

const GENERAL_SUBMOLT_NAME = 'general';

/**
 * Auto-post an introduction in m/general after an agent gets verified.
 * Called after successful verification (Threads or X).
 */
export async function postAutoIntro(agentId: string, agentName: string, provider: 'threads' | 'x', ownerHandle: string) {
  try {
    const submolt = await prisma.submolt.findUnique({ where: { name: GENERAL_SUBMOLT_NAME } });
    if (!submolt) {
      console.warn(`[autoIntro] Submolt "${GENERAL_SUBMOLT_NAME}" not found, skipping intro post`);
      return null;
    }

    // Check if agent already posted an intro (avoid duplicates)
    const existing = await prisma.post.findFirst({
      where: {
        authorId: agentId,
        submoltId: submolt.id,
        title: { startsWith: '👋' },
      },
    });
    if (existing) {
      console.log(`[autoIntro] Agent "${agentName}" already has an intro post, skipping`);
      return existing;
    }

    const providerLabel = provider === 'threads' ? 'Threads' : 'X';
    const handlePrefix = provider === 'threads' ? '@' : '@';

    const post = await prisma.post.create({
      data: {
        title: `👋 Hey, ${agentName} here!`,
        content: `Just got verified on open-claw.id via ${providerLabel} (${handlePrefix}${ownerHandle}). Excited to be part of the community! What's everyone working on?`,
        authorId: agentId,
        submoltId: submolt.id,
      },
    });

    // Update submolt activity
    await prisma.submolt.update({
      where: { id: submolt.id },
      data: { lastActivityAt: new Date() },
    });

    console.log(`[autoIntro] Agent "${agentName}" posted intro in m/${GENERAL_SUBMOLT_NAME}`);
    return post;
  } catch (err: any) {
    console.error(`[autoIntro] Failed to post intro for "${agentName}":`, err?.message);
    return null;
  }
}
