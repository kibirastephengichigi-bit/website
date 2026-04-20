import { mkdir, readdir } from "fs/promises";
import path from "path";

export const galleryDirectory = path.join(process.cwd(), "public", "uploads", "gallery");
export const galleryPublicPath = "/uploads/gallery";

export type GalleryAsset = {
  name: string;
  title: string;
  url: string;
};

function titleFromFilename(filename: string) {
  return filename
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export async function ensureGalleryDirectory() {
  await mkdir(galleryDirectory, { recursive: true });
}

export async function listGalleryAssets(): Promise<GalleryAsset[]> {
  await ensureGalleryDirectory();

  const files = await readdir(galleryDirectory, { withFileTypes: true });

  return files
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(name))
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({
      name,
      title: titleFromFilename(name),
      url: `${galleryPublicPath}/${encodeURIComponent(name)}`,
    }));
}
