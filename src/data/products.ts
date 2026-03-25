export interface Product {
  id: string;
  name: string;
  category: string;
  categorySlug: string;
  images: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  description: string;
  isNew?: boolean;
  discount?: number;
  isPopular?: boolean;
  isLaunch?: boolean;
  isClearance?: boolean;
}

export interface Category {
  name: string;
  slug: string;
  image: string;
}

export const categories: Category[] = [];

const shoeImages = [
  "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1596703263926-eb0762ee17e4?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1562273138-f46be4ebdf33?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1598033036844-27849cf69a80?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1600369672770-985fd30004eb?w=600&h=600&fit=crop",
];

const defaultSizes = ["33", "34", "35", "36", "37", "38", "39", "40"];
const defaultColors = [
  { name: "Preto", hex: "#222222" },
  { name: "Nude", hex: "#D2B48C" },
  { name: "Branco", hex: "#FFFFFF" },
  { name: "Rosa", hex: "#E8909C" },
];

function makeProduct(id: number, name: string, catIdx: number, flags: Partial<Product> = {}): Product {
  const cat = categories[catIdx];
  return {
    id: `prod-${id}`,
    name,
    category: cat.name,
    categorySlug: cat.slug,
    images: [shoeImages[id % shoeImages.length], shoeImages[(id + 1) % shoeImages.length], shoeImages[(id + 2) % shoeImages.length]],
    sizes: defaultSizes,
    colors: defaultColors,
    description: `${name} da coleção AUTENTICA FASHIONF. Produto de alta qualidade ideal para revenda. Disponível em diversas cores e tamanhos. Compre no atacado com os melhores preços do mercado.`,
    ...flags,
  };
}

export const products: Product[] = [];
