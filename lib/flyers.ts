import type { FlyerImage } from "@/components/flyer/flyer";
import { getImageSize } from "@/lib/api";

/**
 * An uploaded image as a flyer, with the width and height read from the
 * image itself, so its box is the right shape before it loads. A size that
 * cannot be read still makes a flyer: it is shown whole in a 4:5 box.
 */
export async function flyerOf(imageUrl: string | null | undefined): Promise<FlyerImage | null> {
  if (!imageUrl) return null;
  const size = await getImageSize(imageUrl);
  return { src: imageUrl, width: size?.width ?? null, height: size?.height ?? null };
}
