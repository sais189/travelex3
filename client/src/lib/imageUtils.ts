// Utility functions for handling destination images and preventing duplicates

export interface ImageSuggestion {
  url: string;
  description: string;
  category: string;
}

// Generate unique Unsplash URLs based on destination characteristics
export function generateUniqueImageSuggestions(destinationName: string, country: string): ImageSuggestion[] {
  const baseParams = "ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";
  const timestamp = Date.now();
  
  // Create search terms based on destination and country
  const searchTerms = [
    `${destinationName.toLowerCase().replace(/\s+/g, '-')}`,
    `${country.toLowerCase()}-landscape`,
    `${country.toLowerCase()}-travel`,
    `${destinationName.toLowerCase().replace(/\s+/g, '-')}-${country.toLowerCase()}`,
    `${country.toLowerCase()}-architecture`,
    `${country.toLowerCase()}-culture`
  ];

  return searchTerms.map((term, index) => ({
    url: `https://images.unsplash.com/photo-${timestamp + index}?${baseParams}&q=${encodeURIComponent(term)}`,
    description: `${destinationName} - ${term.replace(/-/g, ' ')}`,
    category: index < 2 ? 'primary' : 'alternative'
  }));
}

// Validate if an image URL is accessible
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

// Extract search terms from destination for better image matching
export function extractImageSearchTerms(destination: { name: string; country: string; description?: string }): string[] {
  const terms = new Set<string>();
  
  // Add destination name words
  destination.name.toLowerCase().split(/\s+/).forEach(word => {
    if (word.length > 3) terms.add(word);
  });
  
  // Add country
  terms.add(destination.country.toLowerCase());
  
  // Extract keywords from description
  if (destination.description) {
    const keywords = destination.description.toLowerCase().match(/\b(beach|mountain|city|temple|palace|desert|forest|lake|ocean|historic|ancient|modern|cultural|adventure|luxury|nature|wildlife)\b/g);
    keywords?.forEach(keyword => terms.add(keyword));
  }
  
  return Array.from(terms);
}

// Generate fallback image URL if primary fails
export function generateFallbackImageUrl(country: string): string {
  const countryCode = getCountryCode(country);
  const baseParams = "ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";
  return `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?${baseParams}&country=${countryCode}`;
}

// Simple country code mapping for image categorization
function getCountryCode(country: string): string {
  const codes: Record<string, string> = {
    'japan': 'jp',
    'maldives': 'mv',
    'switzerland': 'ch',
    'canada': 'ca',
    'kenya': 'ke',
    'peru': 'pe',
    'iceland': 'is',
    'china': 'cn',
    'australia': 'au',
    'brazil': 'br',
    'morocco': 'ma',
    'norway': 'no',
    'egypt': 'eg',
    'nepal': 'np',
    'argentina': 'ar',
    'myanmar': 'mm',
    'italy': 'it',
    'greece': 'gr',
    'india': 'in',
    'south korea': 'kr',
    'tanzania': 'tz',
    'scotland': 'gb',
    'vietnam': 'vn',
    'bolivia': 'bo',
    'finland': 'fi',
    'chile': 'cl',
    'cambodia': 'kh',
    'indonesia': 'id',
    'colombia': 'co',
    'turkey': 'tr',
    'madagascar': 'mg',
    'jordan': 'jo',
    'ireland': 'ie',
    'ecuador': 'ec',
    'poland': 'pl',
    'costa rica': 'cr'
  };
  
  return codes[country.toLowerCase()] || 'global';
}