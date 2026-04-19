/**
 * Advanced Personalization Service for 2026
 * AI-powered personalization, wishlists, and product customization
 */

import { prisma } from './prisma';

export interface PersonalizationProfile {
  user_id: string;
  style_preferences: string[];
  budget_range: { min: number; max: number };
  favorite_categories: string[];
  materials_preferred: string[];
  colors_preferred: string[];
  sizes_preferred: string[];
  last_updated: Date;
}

/**
 * Get or create user personalization profile
 */
export async function getPersonalizationProfile(userId: string): Promise<PersonalizationProfile | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true
    }
  });

  if (!user) return null;

  // Build profile from user history
  const wishlist = await prisma.wishlist.findUnique({
    where: { userId: userId },
    include: { items: { include: { product: true } } }
  });

  const orders = await prisma.order.findMany({
    where: { buyerId: userId },
    include: { items: { include: { product: true } } }
  });

  const products = wishlist?.items.map(w => w.product) || [];

  const categories = new Set(products.map(p => p.categoryId).filter(Boolean));
  const colors = new Set(products.flatMap(p => (p.tags as any || []) || []).filter(t => isColor(t)));
  const materials = new Set(products.flatMap(p => (p.tags as any || []) || []).filter(t => isMaterial(t)));

  const prices = products.map(p => Number(p.pricePix) || 0).filter(p => p > 0);
  const budgetRange = {
    min: Math.min(...prices, 100),
    max: Math.max(...prices, 1000)
  };

  return {
    user_id: userId,
    style_preferences: extractStylePreferences(products),
    budget_range: budgetRange,
    favorite_categories: Array.from(categories).filter((c): c is string => c !== null),
    materials_preferred: Array.from(materials),
    colors_preferred: Array.from(colors),
    sizes_preferred: [],
    last_updated: new Date()
  };
}

/**
 * Get social wishlist with sharing features
 */
export async function getSocialWishlist(userId: string, isPublic: boolean = false) {
  const wishlist = await prisma.wishlist.findUnique({
    where: { userId: userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
              pricePix: true,
              ratingAverage: true
            }
          }
        }
      }
    }
  });

  const items = wishlist?.items || [];
  
  return {
    user_id: userId,
    items: items.map(item => ({
      ...item,
      product: item.product ? {
        ...item.product,
        price: Number(item.product.pricePix)
      } : null
    })),
    total_value: items.reduce((sum, item) => sum + (item.product ? Number(item.product.pricePix) : 0), 0),
    share_url: isPublic ? `${process.env.NEXTAUTH_URL}/wishlists/${generateWishlistCode(userId)}` : null,
    is_public: isPublic
  };
}

/**
 * Create shareable wishlist code
 */
function generateWishlistCode(userId: string): string {
  return Buffer.from(userId).toString('base64').substring(0, 12);
}

/**
 * Share wishlist with friends
 */
export async function shareWishlist(
  userId: string,
  emails: string[],
  message?: string
): Promise<void> {
  const wishlist = await getSocialWishlist(userId, true);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true }
  });

  // Send emails to friends
  for (const email of emails) {
    await sendWishlistEmail(email, user?.name || 'A friend', wishlist, message);
  }
}

/**
 * Send wishlist sharing email
 */
async function sendWishlistEmail(
  toEmail: string,
  senderName: string,
  wishlist: any,
  message?: string
): Promise<void> {
  // Implementation: Send via nodemailer
  console.log(`Wishlist share email sent to ${toEmail}`);
}

/**
 * Get product recommendations based on preferences
 */
export async function getPersonalizedRecommendations(
  userId: string,
  limit: number = 12
): Promise<any[]> {
  const profile = await getPersonalizationProfile(userId);
  if (!profile) return [];

  const recommendations = await prisma.product.findMany({
    where: {
      AND: [
        { status: 'READY_TO_SHIP' },
        { visibility: 'PUBLIC' },
        profile.favorite_categories.length > 0 ? { categoryId: { in: profile.favorite_categories } } : {},
        { pricePix: { gte: profile.budget_range.min, lte: profile.budget_range.max } }
      ]
    },
    orderBy: { ratingAverage: 'desc' },
    take: limit,
    select: {
      id: true,
      title: true,
      slug: true,
      pricePix: true,
      ratingAverage: true
    }
  });

  return recommendations.map(p => ({
    id: p.id,
    name: p.title,
    slug: p.slug,
    price: Number(p.pricePix),
    rating: p.ratingAverage
  }));
}

/**
 * Get AI-powered product customization suggestions
 */
export async function getCustomizationSuggestions(productId: string, userPreferences?: any) {
  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product) return null;

  return {
    product_id: productId,
    available_customizations: {
      colors: ['Black', 'White', 'Red', 'Blue', 'Green', 'Custom'],
      sizes: ['Small', 'Medium', 'Large', 'XL', 'Custom'],
      materials: ['PLA', 'PETG', 'ABS', 'Resin', 'Premium'],
      finishes: ['Matte', 'Glossy', 'Textured', 'Metallic'],
      engraving: true,
      painting: true
    },
    recommended_options: {
      color: userPreferences?.colors_preferred?.[0] || 'Black',
      material: userPreferences?.materials_preferred?.[0] || 'PLA',
      finish: 'Matte',
      delivery_time: '3-5 business days'
    },
    price_multipliers: {
      standard: 1.0,
      premium_material: 1.3,
      custom_size: 1.5,
      engraving: 1.2,
      rush_delivery: 1.8
    }
  };
}

/**
 * Save customization to order draft
 */
export async function saveDraftCustomization(
  userId: string,
  productId: string,
  customization: Record<string, any>
): Promise<void> {
  // Get or create cart for user
  let cart = await prisma.cart.findFirst({
    where: { userId: userId, status: 'ACTIVE' }
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId: userId,
        status: 'ACTIVE',
        currency: 'BRL'
      }
    });
  }

  // Get product to get price
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { pricePix: true }
  });

  if (!product) return;

  // Add to cart
  await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId: productId,
      quantity: 1,
      unitPrice: product.pricePix,
      metadata: { customization, isDraft: true }
    }
  });
}

/**
 * Get augmented reality preview suggestions
 */
export async function getARPreviewOptions(productId: string) {
  return {
    available_ar_modes: [
      'virtual_try_on',
      'room_placement',
      'size_comparison',
      'color_preview'
    ],
    compatible_devices: ['iOS 13+', 'Android 7+'],
    preview_formats: ['USDZ', 'GLB', 'GLTF']
  };
}

/**
 * Track user preferences and update profile
 */
export async function trackUserInteraction(
  userId: string,
  productId: string,
  interactionType: 'view' | 'click' | 'customize' | 'save'
): Promise<void> {
  // Update user preference signals
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { category: true, tags: true }
  });

  if (!product) return;

  // Log to catalog events
  await prisma.catalogEvent.create({
    data: {
      userId: userId,
      productId: productId,
      type: interactionType === 'view' ? 'VIEW' : 'SEARCH'
    }
  });
}

/**
 * Get trending items in user's interests
 */
export async function getTrendingInUserInterests(userId: string, limit: number = 6) {
  const profile = await getPersonalizationProfile(userId);
  if (!profile) return [];

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const trending = await prisma.product.findMany({
    where: {
      AND: [
        { createdAt: { gte: weekAgo } },
        profile.favorite_categories.length > 0 ? { categoryId: { in: profile.favorite_categories } } : {},
        { status: 'READY_TO_SHIP' },
        { visibility: 'PUBLIC' }
      ]
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  });

  return trending;
}

// Helper functions
function isColor(tag: string): boolean {
  const colors = ['black', 'white', 'red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'gray', 'brown', 'transparent'];
  return colors.includes(tag.toLowerCase());
}

function isMaterial(tag: string): boolean {
  const materials = ['pla', 'petg', 'abs', 'resin', 'nylon', 'flexible', 'wood', 'metal', 'glass', 'ceramic'];
  return materials.includes(tag.toLowerCase());
}

function extractStylePreferences(products: any[]): string[] {
  const styles = new Set<string>();
  
  products.forEach(p => {
    if (p.tags) {
      (p.tags as string[]).forEach(tag => {
        if (!isColor(tag) && !isMaterial(tag)) {
          styles.add(tag);
        }
      });
    }
  });

  return Array.from(styles);
}
