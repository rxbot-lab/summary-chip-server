import Vibrant from "node-vibrant";
import urlMetadata from "url-metadata";

interface WebsiteMetadata {
  title: string;
  description: string;
  colors: string[];
  theme: "light" | "dark";
}

export async function getWebsiteMetadata(
  url: string
): Promise<WebsiteMetadata> {
  try {
    // Fetch metadata
    const metadata = await urlMetadata(url);

    // Extract the title
    const title = metadata.title || "";
    let theme: "light" | "dark" = "light";

    // Extract the og:image URL
    const ogImageUrl = metadata["og:image"] || "";
    const description = metadata.description || "";

    // Get the main colors from the og:image
    let colors: string[] = [];
    if (ogImageUrl) {
      const palette = await Vibrant.from(ogImageUrl).getPalette();
      const dominantSwatch =
        palette.Vibrant || palette.DarkVibrant || palette.LightVibrant;

      if (!dominantSwatch) {
        throw new Error("Could not extract dominant color from the image");
      }

      const [r, g, b] = dominantSwatch.getRgb();

      // Calculate perceived brightness using the formula:
      // (0.299*R + 0.587*G + 0.114*B)
      const perceivedBrightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

      // Consider the image light if perceived brightness is greater than 0.5
      theme = perceivedBrightness > 0.5 ? "light" : "dark";
      colors = Object.values(palette)
        .filter((swatch) => swatch !== null)
        .map((swatch) => swatch!.hex);
    }
    return {
      title,
      colors,
      description,
      theme,
    };
  } catch (error) {
    console.error("Error fetching metadata:", error);
    throw error;
  }
}
