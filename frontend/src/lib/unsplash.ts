// Utility for fetching images from Unsplash
const UNSPLASH_ACCESS_KEY = "your-unsplash-access-key-here"; // You'll need to add this to your .env

export interface UnsplashImage {
  id: string;
  urls: {
    small: string;
    regular: string;
    full: string;
  };
  alt_description?: string;
  description?: string;
  user: {
    name: string;
    username: string;
  };
}

export const getUnsplashImage = async (
  query: string,
  orientation?: "landscape" | "portrait" | "squarish"
): Promise<string> => {
  try {
    // For demo purposes, return a fallback image if no API key
    if (!UNSPLASH_ACCESS_KEY || UNSPLASH_ACCESS_KEY === "your-unsplash-access-key-here") {
      return getRandomFallbackImage(query);
    }

    const response = await fetch(
      `https://api.unsplash.com/photos/random?query=${query}&orientation=${orientation || 'landscape'}`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from Unsplash');
    }

    const data: UnsplashImage = await response.json();
    return data.urls.regular;
  } catch (error) {
    console.warn('Failed to fetch Unsplash image, using fallback:', error);
    return getRandomFallbackImage(query);
  }
};

// Fallback images for demo purposes
const getRandomFallbackImage = (query: string): string => {
  const fallbackImages: Record<string, string[]> = {
    coding: [
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop",
    ],
    testing: [
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&h=600&fit=crop",
    ],
    developer: [
      "https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&h=600&fit=crop",
    ],
    automation: [
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop",
    ],
    ai: [
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=600&fit=crop",
    ],
    team: [
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop",
    ],
  };

  const images = fallbackImages[query] || fallbackImages.coding;
  return images[Math.floor(Math.random() * images.length)];
};

export const getMultipleUnsplashImages = async (
  queries: string[],
  orientation?: "landscape" | "portrait" | "squarish"
): Promise<string[]> => {
  const promises = queries.map(query => getUnsplashImage(query, orientation));
  return Promise.all(promises);
};
