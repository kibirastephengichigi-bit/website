import bcrypt from "bcryptjs";

import { db, hasDatabaseUrl } from "@/lib/db";
import { blogPosts } from "@/lib/content/blog-data";
import { siteContent } from "@/lib/content/site-content";

async function main() {
  if (!hasDatabaseUrl || !db) {
    console.log("DATABASE_URL is not set. Skipping Prisma seed.");
    return;
  }

  const passwordHash = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || "ChangeMe123!",
    10,
  );

  const admin = await db.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || "admin@localhost" },
    update: {
      name: "Dr. Stephen Asatsa Admin",
      passwordHash,
    },
    create: {
      name: "Dr. Stephen Asatsa Admin",
      email: process.env.ADMIN_EMAIL || "admin@stephenasatsa.com",
      passwordHash,
      role: "ADMIN",
    },
  });

  for (const post of blogPosts) {
    await db.blogPost.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        category: post.category,
        featuredImage: post.featuredImage,
        published: true,
        publishedAt: new Date(post.publishedAt),
      },
      create: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.excerpt,
        category: post.category,
        featuredImage: post.featuredImage,
        published: true,
        publishedAt: new Date(post.publishedAt),
        authorId: admin.id,
      },
    });
  }

  for (const testimonial of siteContent.testimonials) {
    await db.testimonial.create({
      data: testimonial,
    }).catch(() => null);
  }

  for (const project of siteContent.researchProjects) {
    await db.researchProject.upsert({
      where: { slug: project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") },
      update: {
        summary: project.summary,
        category: project.category,
        status: project.status,
      },
      create: {
        title: project.title,
        slug: project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        summary: project.summary,
        category: project.category,
        status: project.status,
      },
    });
  }

  for (const publication of siteContent.publications) {
    await db.publication.upsert({
      where: { slug: publication.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") },
      update: {
        abstract: publication.summary,
        category: publication.type,
        year: Number(publication.year),
        fileUrl: publication.fileUrl,
      },
      create: {
        title: publication.title,
        slug: publication.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        abstract: publication.summary,
        category: publication.type,
        year: Number(publication.year),
        fileUrl: publication.fileUrl,
        authors: "Dr. Stephen Asatsa",
      },
    });
  }

  await db.siteContent.upsert({
    where: { key: "about" },
    update: {
      title: "Who We Are",
      body: siteContent.aboutFull.join("\n\n"),
    },
    create: {
      key: "about",
      title: "Who We Are",
      body: siteContent.aboutFull.join("\n\n"),
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    if (db) {
      await db.$disconnect();
    }
  });
