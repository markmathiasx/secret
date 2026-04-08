import { Prisma, InventoryPolicy, MediaType, PaymentMethod, ProductStatus, ProductVisibility, Role } from "@prisma/client";
import { hashSync } from "bcryptjs";
import { getProductLongDescription, buildProductSearchText } from "@/lib/catalog-content";
import { catalog } from "@/lib/catalog";
import { buildProductImageAlt } from "@/lib/catalog-media";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

function toDecimal(value: number) {
  return new Prisma.Decimal(value.toFixed(2));
}

async function upsertCategoriesAndCollections() {
  const categoryIds = new Map<string, string>();
  const collectionIds = new Map<string, string>();

  for (const item of catalog) {
    if (!categoryIds.has(item.category)) {
      const category = await prisma.category.upsert({
        where: { slug: slugify(item.category) },
        update: { name: item.category },
        create: {
          name: item.category,
          slug: slugify(item.category),
          description: `Categoria ${item.category} importada do catálogo atual da MDH 3D Store.`,
        },
      });
      categoryIds.set(item.category, category.id);
    }

    if (!collectionIds.has(item.collection)) {
      const collection = await prisma.collection.upsert({
        where: { slug: slugify(item.collection) },
        update: {
          name: item.collection,
          isFeatured: item.featured,
        },
        create: {
          name: item.collection,
          slug: slugify(item.collection),
          description: `Coleção ${item.collection} importada do catálogo atual.`,
          isFeatured: item.featured,
        },
      });
      collectionIds.set(item.collection, collection.id);
    }
  }

  return { categoryIds, collectionIds };
}

async function ensureAdminUser() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase() || "admin@mdh3d.local";
  const password = process.env.ADMIN_PASSWORD?.trim() || "admin123456";

  return prisma.user.upsert({
    where: { email },
    update: {
      role: Role.ADMIN,
      passwordHash: hashSync(password, 10),
      emailVerified: new Date(),
      isActive: true,
    },
    create: {
      email,
      name: "Admin MDH 3D",
      role: Role.ADMIN,
      passwordHash: hashSync(password, 10),
      emailVerified: new Date(),
      isActive: true,
      buyerProfile: {
        create: {},
      },
    },
  });
}

async function ensureSellerUser() {
  const email = (process.env.SEED_SELLER_EMAIL || "seller@mdh3d.local").trim().toLowerCase();
  const password = process.env.SEED_SELLER_PASSWORD?.trim() || "seller123456";
  const slug = process.env.SEED_SELLER_SLUG?.trim() || "mdh-3d";

  return prisma.user.upsert({
    where: { email },
    update: {
      role: Role.SELLER,
      isInternalSeller: true,
      passwordHash: hashSync(password, 10),
      emailVerified: new Date(),
      isActive: true,
    },
    create: {
      email,
      name: "MDH 3D Store",
      role: Role.SELLER,
      isInternalSeller: true,
      passwordHash: hashSync(password, 10),
      emailVerified: new Date(),
      isActive: true,
      buyerProfile: {
        create: {},
      },
      sellerProfile: {
        create: {
          displayName: "MDH 3D Store",
          slug,
          storeName: "MDH 3D Store",
          bio: "Loja de impressão 3D de alto desempenho no Rio de Janeiro.",
          isApproved: true,
          approvedAt: new Date(),
          supportEmail: process.env.STAFF_NOTIFY_EMAIL?.trim() || "mdhatendimento@gmail.com",
          supportPhone: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() || "5521920137249",
        },
      },
    },
  });
}

async function seedCatalog() {
  const { categoryIds, collectionIds } = await upsertCategoriesAndCollections();
  const seller = await ensureSellerUser();

  for (const item of catalog) {
    const product = await prisma.product.upsert({
      where: { id: item.id },
      update: {
        slug: item.slug,
        sku: item.sku,
        title: item.name,
        description: item.description,
        longDescription: getProductLongDescription(item),
        searchText: buildProductSearchText(item),
        subcategory: item.subcategory,
        theme: item.theme,
        productionWindow: item.productionWindow,
        imageHint: item.imageHint,
        imageAlt: item.imageAlt || buildProductImageAlt(item.name),
        licenseType: item.licenseType || "personal",
        material: item.material,
        finish: item.finish,
        colors: item.colors,
        materials: Array.from(new Set([item.material])),
        sizes: [],
        tags: item.tags,
        grams: item.grams,
        hours: toDecimal(item.hours),
        complexity: item.complexity,
        printTimeLabel: item.printTime,
        plaWeightLabel: item.plaWeight,
        dimensions: item.dimensions,
        pricePix: toDecimal(item.pricePix),
        priceCard: toDecimal(item.priceCard),
        marketplaceSuggested: toDecimal(item.marketplaceSuggested),
        estimatedUnitCost: item.estimatedUnitCost ? toDecimal(item.estimatedUnitCost) : null,
        estimatedUnitProfit: item.estimatedUnitProfit ? toDecimal(item.estimatedUnitProfit) : null,
        stock: item.stock,
        featured: item.featured,
        customizable: item.customizable,
        readyToShip: item.readyToShip ?? false,
        status: item.readyToShip ? ProductStatus.READY_TO_SHIP : item.customizable ? ProductStatus.CUSTOMIZABLE : ProductStatus.MADE_TO_ORDER,
        visibility: ProductVisibility.PUBLIC,
        sellerId: seller.id,
        categoryId: categoryIds.get(item.category),
      },
      create: {
        id: item.id,
        slug: item.slug,
        sku: item.sku,
        title: item.name,
        description: item.description,
        longDescription: getProductLongDescription(item),
        searchText: buildProductSearchText(item),
        subcategory: item.subcategory,
        theme: item.theme,
        productionWindow: item.productionWindow,
        imageHint: item.imageHint,
        imageAlt: item.imageAlt || buildProductImageAlt(item.name),
        licenseType: item.licenseType || "personal",
        material: item.material,
        finish: item.finish,
        colors: item.colors,
        materials: Array.from(new Set([item.material])),
        sizes: [],
        tags: item.tags,
        grams: item.grams,
        hours: toDecimal(item.hours),
        complexity: item.complexity,
        printTimeLabel: item.printTime,
        plaWeightLabel: item.plaWeight,
        dimensions: item.dimensions,
        pricePix: toDecimal(item.pricePix),
        priceCard: toDecimal(item.priceCard),
        marketplaceSuggested: toDecimal(item.marketplaceSuggested),
        estimatedUnitCost: item.estimatedUnitCost ? toDecimal(item.estimatedUnitCost) : null,
        estimatedUnitProfit: item.estimatedUnitProfit ? toDecimal(item.estimatedUnitProfit) : null,
        stock: item.stock,
        featured: item.featured,
        customizable: item.customizable,
        readyToShip: item.readyToShip ?? false,
        status: item.readyToShip ? ProductStatus.READY_TO_SHIP : item.customizable ? ProductStatus.CUSTOMIZABLE : ProductStatus.MADE_TO_ORDER,
        visibility: ProductVisibility.PUBLIC,
        sellerId: seller.id,
        categoryId: categoryIds.get(item.category),
      },
    });

    await prisma.productCollection.deleteMany({ where: { productId: product.id } });
    await prisma.productCollection.create({
      data: {
        productId: product.id,
        collectionId: collectionIds.get(item.collection)!,
      },
    });

    await prisma.productMedia.deleteMany({ where: { productId: product.id } });
    await prisma.productMedia.createMany({
      data: item.images.map((url, index) => ({
        productId: product.id,
        type: index === 1 ? MediaType.THUMBNAIL : MediaType.IMAGE,
        url,
        altText: buildProductImageAlt(item.name, index + 1),
        sortOrder: index,
        source: url.includes("picsum.photos") ? "picsum" : "catalog",
        isPrimary: index === 0,
      })),
    });

    await prisma.productVariant.deleteMany({ where: { productId: product.id } });
    if (item.variants?.length) {
      await prisma.productVariant.createMany({
        data: item.variants.map((variant) => ({
          productId: product.id,
          name: `${item.name} - ${variant.color}`,
          optionName: "color",
          optionValue: variant.color,
          color: variant.color,
          priceDelta: new Prisma.Decimal(0),
          stock: variant.available ? Math.max(1, item.stock) : 0,
          available: variant.available,
        })),
      });
    }

    await prisma.inventory.upsert({
      where: { productId: product.id },
      update: {
        quantity: item.stock,
        policy: item.readyToShip ? InventoryPolicy.DENY : InventoryPolicy.PREORDER,
        leadTimeDays: item.readyToShip ? 1 : 3,
      },
      create: {
        productId: product.id,
        quantity: item.stock,
        policy: item.readyToShip ? InventoryPolicy.DENY : InventoryPolicy.PREORDER,
        leadTimeDays: item.readyToShip ? 1 : 3,
      },
    });
  }
}

async function seedCoupons() {
  await prisma.coupon.upsert({
    where: { code: "BEMVINDO10" },
    update: {
      title: "Boas-vindas",
      value: new Prisma.Decimal(10),
      freeShipping: false,
      active: true,
    },
    create: {
      code: "BEMVINDO10",
      title: "Boas-vindas",
      type: "PERCENT",
      value: new Prisma.Decimal(10),
      freeShipping: false,
      active: true,
      eligibleCategoryIds: [],
      eligibleCollectionIds: [],
    },
  });

  await prisma.coupon.upsert({
    where: { code: "FRETEGRATISRJ" },
    update: {
      title: "Frete grátis no RJ",
      value: new Prisma.Decimal(0),
      freeShipping: true,
      active: true,
    },
    create: {
      code: "FRETEGRATISRJ",
      title: "Frete grátis no RJ",
      type: "SHIPPING",
      value: new Prisma.Decimal(0),
      freeShipping: true,
      active: true,
      eligibleCategoryIds: [],
      eligibleCollectionIds: [],
    },
  });
}

async function seedSampleBuyer() {
  const email = (process.env.SEED_BUYER_EMAIL || "buyer@mdh3d.local").trim().toLowerCase();
  const password = process.env.SEED_BUYER_PASSWORD?.trim() || "buyer123456";
  const seller = await ensureSellerUser();
  const featured = catalog[0];

  const buyer = await prisma.user.upsert({
    where: { email },
    update: {
      role: Role.BUYER,
      passwordHash: hashSync(password, 10),
      emailVerified: new Date(),
      isActive: true,
    },
    create: {
      email,
      name: "Cliente Demo",
      role: Role.BUYER,
      passwordHash: hashSync(password, 10),
      emailVerified: new Date(),
      isActive: true,
      buyerProfile: {
        create: {
          totalOrders: 0,
        },
      },
      wishlist: {
        create: {},
      },
    },
  });

  await prisma.address.upsert({
    where: { id: `seed-address-${buyer.id}` },
    update: {
      label: "Principal",
      recipientName: buyer.name || "Cliente Demo",
      zipCode: "20000-000",
      line1: "Rua das Impressões, 3D",
      neighborhood: "Centro",
      city: "Rio de Janeiro",
      state: "RJ",
      isDefaultShipping: true,
      isDefaultBilling: true,
    },
    create: {
      id: `seed-address-${buyer.id}`,
      userId: buyer.id,
      label: "Principal",
      recipientName: buyer.name || "Cliente Demo",
      zipCode: "20000-000",
      line1: "Rua das Impressões, 3D",
      neighborhood: "Centro",
      city: "Rio de Janeiro",
      state: "RJ",
      country: "BR",
      isDefaultShipping: true,
      isDefaultBilling: true,
    },
  });

  const wishlist = await prisma.wishlist.upsert({
    where: { userId: buyer.id },
    update: {},
    create: { userId: buyer.id },
  });

  if (featured) {
    await prisma.wishlistItem.upsert({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId: featured.id,
        },
      },
      update: {},
      create: {
        wishlistId: wishlist.id,
        productId: featured.id,
      },
    });

    const cart = await prisma.cart.upsert({
      where: { sessionToken: `seed-cart-${buyer.id}` },
      update: { userId: buyer.id },
      create: {
        userId: buyer.id,
        sessionToken: `seed-cart-${buyer.id}`,
      },
    });

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: featured.id,
        quantity: 1,
        unitPrice: toDecimal(featured.pricePix),
      },
    });

    const order = await prisma.order.upsert({
      where: { orderNumber: "MDH-SEED-0001" },
      update: {
        buyerId: buyer.id,
        sellerId: seller.id,
        paymentMethod: PaymentMethod.PIX,
        status: "PAID",
        subtotal: toDecimal(featured.pricePix),
        grandTotal: toDecimal(featured.pricePix),
        paidAt: new Date(),
      },
      create: {
        orderNumber: "MDH-SEED-0001",
        buyerId: buyer.id,
        sellerId: seller.id,
        paymentMethod: PaymentMethod.PIX,
        status: "PAID",
        subtotal: toDecimal(featured.pricePix),
        grandTotal: toDecimal(featured.pricePix),
        paidAt: new Date(),
      },
    });

    await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: featured.id,
        title: featured.name,
        sku: featured.sku,
        quantity: 1,
        unitPrice: toDecimal(featured.pricePix),
        totalPrice: toDecimal(featured.pricePix),
      },
    });

    await prisma.payment.upsert({
      where: { externalReference: "MDH-SEED-0001" },
      update: {
        orderId: order.id,
        method: PaymentMethod.PIX,
        provider: "MANUAL",
        status: "PAID",
        amount: toDecimal(featured.pricePix),
        paidAt: new Date(),
      },
      create: {
        orderId: order.id,
        method: PaymentMethod.PIX,
        provider: "MANUAL",
        status: "PAID",
        amount: toDecimal(featured.pricePix),
        externalReference: "MDH-SEED-0001",
        paidAt: new Date(),
      },
    });
  }
}

async function main() {
  await ensureAdminUser();
  await seedCatalog();
  await seedCoupons();
  await seedSampleBuyer();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Prisma seed falhou:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
