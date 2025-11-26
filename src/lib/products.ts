import type { Product } from "./store"

export const products: Product[] = [
  {
    id: "1",
    name: "Purple Haze Premium",
    price: 45,
    description:
      "A classic sativa-dominant strain known for its dreamy, euphoric effects. Earthy with sweet undertones and hints of berry.",
    image: "/purple-cannabis-flower-buds-premium-quality.jpg",
    category: "Flowers",
    inventory: 25,
    featured: true,
  },
  {
    id: "2",
    name: "Northern Lights",
    price: 40,
    description:
      "An indica strain famous for its resinous buds and fast flowering. Sweet and spicy aromas with a relaxing effect.",
    image: "/green-cannabis-flower-buds-northern-lights-strain.jpg",
    category: "Flowers",
    inventory: 18,
    featured: true,
  },
  {
    id: "3",
    name: "Blue Dream",
    price: 42,
    description:
      "A balanced hybrid offering full-body relaxation with gentle cerebral invigoration. Berry aroma with hints of haze.",
    image: "/blue-dream-cannabis-flower-buds-high-quality.jpg",
    category: "Flowers",
    inventory: 5,
  },
  {
    id: "4",
    name: "OG Kush",
    price: 50,
    description:
      "A legendary strain with a complex aroma of fuel, skunk, and spice. Delivers heavy euphoria and relaxation.",
    image: "/og-kush-cannabis-flower-buds-premium.jpg",
    category: "Flowers",
    inventory: 12,
    featured: true,
  },
  {
    id: "5",
    name: "Classic Pre-Roll Pack",
    price: 25,
    description: "Pack of 5 premium pre-rolled joints. Perfect for convenience without sacrificing quality.",
    image: "/cannabis-pre-rolled-joints-pack-elegant.jpg",
    category: "Pre-Rolls",
    inventory: 30,
  },
  {
    id: "6",
    name: "Infused Pre-Rolls",
    price: 35,
    description: "Pre-rolls infused with concentrate for enhanced potency. Slow-burning and flavorful.",
    image: "/infused-cannabis-pre-roll-joints-premium.jpg",
    category: "Pre-Rolls",
    inventory: 0,
  },
  {
    id: "7",
    name: "Gummy Bears 100mg",
    price: 30,
    description: "10 delicious gummy bears, 10mg each. Perfect for precise dosing and discreet consumption.",
    image: "/cannabis-gummy-bears-edibles-colorful.jpg",
    category: "Edibles",
    inventory: 22,
  },
  {
    id: "8",
    name: "Chocolate Bar 200mg",
    price: 40,
    description: "Premium dark chocolate bar divided into 20 squares. Rich flavor with consistent effects.",
    image: "/cannabis-chocolate-bar-edible-premium-dark.jpg",
    category: "Edibles",
    inventory: 8,
  },
  {
    id: "9",
    name: "Sour Worms 150mg",
    price: 28,
    description: "Tangy sour worm gummies with a sweet finish. 15 pieces at 10mg each.",
    image: "/sour-worm-gummies-cannabis-edibles-colorful.jpg",
    category: "Edibles",
    inventory: 3,
  },
  {
    id: "10",
    name: "Sativa Vape Cart",
    price: 55,
    description: "Premium sativa extract cartridge. Uplifting and energizing effects perfect for daytime use.",
    image: "/cannabis-vape-cartridge-gold-oil.jpg",
    category: "Vapes",
    inventory: 15,
  },
  {
    id: "11",
    name: "Indica Vape Cart",
    price: 55,
    description: "Premium indica extract cartridge. Relaxing effects ideal for evening unwinding.",
    image: "/cannabis-vape-cartridge-purple-indica.jpg",
    category: "Vapes",
    inventory: 0,
  },
  {
    id: "12",
    name: "Hybrid Vape Cart",
    price: 55,
    description: "Balanced hybrid cartridge for any time of day. Smooth vapor with full-spectrum effects.",
    image: "/cannabis-vape-cartridge-hybrid-clear.jpg",
    category: "Vapes",
    inventory: 20,
  },
]

export const categories = ["All", "Flowers", "Pre-Rolls", "Edibles", "Vapes"]

export function getProductsByCategory(category: string): Product[] {
  if (category === "All") return products
  return products.filter((p) => p.category === category)
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id)
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured)
}
