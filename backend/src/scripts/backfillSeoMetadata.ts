import { prisma } from '../utils/prisma';
import { buildPostSeoMetadata } from '../utils/seo';

async function main() {
  const posts = await prisma.post.findMany({
    where: {
      OR: [{ metaTitle: null }, { metaDescription: null }],
    },
    include: {
      author: { select: { name: true } },
      submolt: { select: { name: true } },
    },
  });

  let updated = 0;

  for (const post of posts) {
    const { metaTitle, metaDescription } = buildPostSeoMetadata({
      id: post.id,
      title: post.title,
      content: post.content,
      authorName: post.author?.name,
      submoltName: post.submolt?.name,
      url: post.url,
    });

    await prisma.post.update({
      where: { id: post.id },
      data: {
        metaTitle: post.metaTitle || metaTitle,
        metaDescription: post.metaDescription || metaDescription,
      },
    });

    updated += 1;
  }

  console.log(`Backfilled SEO metadata for ${updated} posts.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

