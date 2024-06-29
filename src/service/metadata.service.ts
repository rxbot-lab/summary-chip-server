import Vibrant from "node-vibrant";
import urlMetadata from "url-metadata";

interface WebsiteMetadata {
  title: string;
  description: string;
  colors: string[];
}

export async function getWebsiteMetadata(
  url: string
): Promise<WebsiteMetadata> {
  try {
    // Fetch metadata
    const metadata = await urlMetadata(url);

    // Extract the title
    const title = metadata.title || "";

    // Extract the og:image URL
    const ogImageUrl = metadata["og:image"] || "";
    const description = metadata.description || "";

    // Get the main colors from the og:image
    let colors: string[] = [];
    if (ogImageUrl) {
      const palette = await Vibrant.from(ogImageUrl).getPalette();
      colors = Object.values(palette)
        .filter((swatch) => swatch !== null)
        .map((swatch) => swatch!.getHex());
    }
    return {
      title,
      colors,
      description,
    };
  } catch (error) {
    console.error("Error fetching metadata:", error);
    throw error;
  }
}
