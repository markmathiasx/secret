import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar
} from "drizzle-orm/pg-core";

export const contactPreferenceEnum = pgEnum("contact_preference", ["whatsapp", "email", "phone"]);
export const paymentMethodEnum = pgEnum("payment_method", ["pix", "card", "cash", "other"]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "waiting_proof",
  "paid",
  "declined",
  "canceled",
  "refunded"
]);
export const operationalStatusEnum = pgEnum("operational_status", [
  "new_order",
  "waiting_payment",
  "payment_confirmed",
  "preparing_model",
  "in_production",
  "completed",
  "shipped",
  "delivered",
  "canceled"
]);
export const imageStatusEnum = pgEnum("image_status", ["pending", "imported", "placeholder", "failed"]);
export const orderEventTypeEnum = pgEnum("order_event_type", [
  "order_created",
  "payment_status_changed",
  "operational_status_changed",
  "note_added",
  "manual_order_created",
  "payment_reference_created",
  "payment_webhook_received",
  "customer_updated"
]);
export const analyticsEventNameEnum = pgEnum("analytics_event_name", [
  "view_home",
  "view_category",
  "view_product",
  "search",
  "filter_change",
  "add_to_cart",
  "begin_checkout",
  "order_payment_selected",
  "create_order",
  "order_created",
  "click_whatsapp",
  "admin_order_status_updated"
]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
};

export const sourceChannels = pgTable("source_channels", {
  id: varchar("id", { length: 40 }).primaryKey(),
  label: varchar("label", { length: 80 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const products = pgTable(
  "products",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    sku: varchar("sku", { length: 60 }).notNull(),
    slug: varchar("slug", { length: 160 }).notNull(),
    name: varchar("name", { length: 180 }).notNull(),
    category: varchar("category", { length: 80 }).notNull(),
    theme: varchar("theme", { length: 120 }).notNull(),
    collection: varchar("collection", { length: 120 }).notNull(),
    description: text("description").notNull(),
    merchandising: text("merchandising"),
    tags: jsonb("tags").$type<string[]>().default(sql`'[]'::jsonb`).notNull(),
    colors: jsonb("colors").$type<string[]>().default(sql`'[]'::jsonb`).notNull(),
    materials: jsonb("materials").$type<string[]>().default(sql`'[]'::jsonb`).notNull(),
    finishNotes: text("finish_notes"),
    grams: integer("grams").notNull(),
    hours: numeric("hours", { precision: 10, scale: 2, mode: "number" }).notNull(),
    complexity: numeric("complexity", { precision: 10, scale: 2, mode: "number" }).notNull(),
    productionWindow: varchar("production_window", { length: 80 }).notNull(),
    pricePix: numeric("price_pix", { precision: 10, scale: 2, mode: "number" }).notNull(),
    priceCard: numeric("price_card", { precision: 10, scale: 2, mode: "number" }).notNull(),
    marketplaceSuggested: numeric("marketplace_suggested", { precision: 10, scale: 2, mode: "number" }),
    published: boolean("published").default(false).notNull(),
    featured: boolean("featured").default(false).notNull(),
    imagePath: varchar("image_path", { length: 255 }),
    imageStatus: imageStatusEnum("image_status").default("pending").notNull(),
    imageAlt: varchar("image_alt", { length: 200 }),
    sortOrder: integer("sort_order").default(0).notNull(),
    metadata: jsonb("metadata").$type<Record<string, string | number | boolean | null>>().default(sql`'{}'::jsonb`).notNull(),
    ...timestamps
  },
  (table) => ({
    skuIdx: uniqueIndex("products_sku_idx").on(table.sku),
    slugIdx: uniqueIndex("products_slug_idx").on(table.slug),
    publishedIdx: index("products_published_idx").on(table.published, table.sortOrder),
    categoryIdx: index("products_category_idx").on(table.category)
  })
);

export const catalogImageMappings = pgTable(
  "catalog_image_mappings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: varchar("product_id", { length: 64 })
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    provider: varchar("provider", { length: 80 }).notNull(),
    sourceUrl: text("source_url").notNull(),
    localPath: varchar("local_path", { length: 255 }),
    query: varchar("query", { length: 255 }),
    status: imageStatusEnum("status").default("pending").notNull(),
    isPrimary: boolean("is_primary").default(true).notNull(),
    downloadedAt: timestamp("downloaded_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    productIdx: index("catalog_image_mappings_product_idx").on(table.productId)
  })
);

export const customers = pgTable(
  "customers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fullName: varchar("full_name", { length: 160 }).notNull(),
    whatsapp: varchar("whatsapp", { length: 32 }).notNull(),
    email: varchar("email", { length: 160 }),
    contactPreference: contactPreferenceEnum("contact_preference").default("whatsapp").notNull(),
    notes: text("notes"),
    ...timestamps
  },
  (table) => ({
    whatsappIdx: index("customers_whatsapp_idx").on(table.whatsapp),
    emailIdx: index("customers_email_idx").on(table.email)
  })
);

export const addresses = pgTable(
  "addresses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    customerId: uuid("customer_id")
      .references(() => customers.id, { onDelete: "cascade" })
      .notNull(),
    postalCode: varchar("postal_code", { length: 16 }).notNull(),
    street: varchar("street", { length: 180 }).notNull(),
    number: varchar("number", { length: 20 }).notNull(),
    complement: varchar("complement", { length: 120 }),
    reference: varchar("reference", { length: 160 }),
    neighborhood: varchar("neighborhood", { length: 120 }).notNull(),
    city: varchar("city", { length: 120 }).notNull(),
    state: varchar("state", { length: 2 }).notNull(),
    ...timestamps
  },
  (table) => ({
    customerIdx: index("addresses_customer_idx").on(table.customerId)
  })
);

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderNumber: varchar("order_number", { length: 32 }).notNull(),
    customerId: uuid("customer_id")
      .references(() => customers.id, { onDelete: "restrict" })
      .notNull(),
    addressId: uuid("address_id").references(() => addresses.id, { onDelete: "restrict" }),
    sourceChannelId: varchar("source_channel_id", { length: 40 })
      .references(() => sourceChannels.id, { onDelete: "restrict" })
      .notNull(),
    operationalStatus: operationalStatusEnum("operational_status").default("new_order").notNull(),
    paymentStatus: paymentStatusEnum("payment_status").default("pending").notNull(),
    paymentMethod: paymentMethodEnum("payment_method").default("pix").notNull(),
    subtotalPix: numeric("subtotal_pix", { precision: 10, scale: 2, mode: "number" }).notNull(),
    subtotalCard: numeric("subtotal_card", { precision: 10, scale: 2, mode: "number" }).notNull(),
    shippingAmount: numeric("shipping_amount", { precision: 10, scale: 2, mode: "number" }).default(0).notNull(),
    totalAmount: numeric("total_amount", { precision: 10, scale: 2, mode: "number" }).notNull(),
    customerNotes: text("customer_notes"),
    internalNotes: text("internal_notes"),
    whatsappReference: varchar("whatsapp_reference", { length: 160 }),
    marketplaceReference: varchar("marketplace_reference", { length: 160 }),
    placedAt: timestamp("placed_at", { withTimezone: true }).defaultNow().notNull(),
    ...timestamps
  },
  (table) => ({
    orderNumberIdx: uniqueIndex("orders_order_number_idx").on(table.orderNumber),
    customerIdx: index("orders_customer_idx").on(table.customerId),
    channelIdx: index("orders_channel_idx").on(table.sourceChannelId),
    operationalStatusIdx: index("orders_operational_status_idx").on(table.operationalStatus),
    paymentStatusIdx: index("orders_payment_status_idx").on(table.paymentStatus)
  })
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .references(() => orders.id, { onDelete: "cascade" })
      .notNull(),
    productId: varchar("product_id", { length: 64 }).references(() => products.id, { onDelete: "set null" }),
    productName: varchar("product_name", { length: 180 }).notNull(),
    sku: varchar("sku", { length: 60 }).notNull(),
    quantity: integer("quantity").notNull(),
    unitPricePix: numeric("unit_price_pix", { precision: 10, scale: 2, mode: "number" }).notNull(),
    unitPriceCard: numeric("unit_price_card", { precision: 10, scale: 2, mode: "number" }).notNull(),
    lineTotalPix: numeric("line_total_pix", { precision: 10, scale: 2, mode: "number" }).notNull(),
    lineTotalCard: numeric("line_total_card", { precision: 10, scale: 2, mode: "number" }).notNull(),
    imagePath: varchar("image_path", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    orderIdx: index("order_items_order_idx").on(table.orderId)
  })
);

export const adminSessions = pgTable(
  "admin_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 160 }).notNull(),
    sessionTokenHash: varchar("session_token_hash", { length: 128 }).notNull(),
    ipAddress: varchar("ip_address", { length: 80 }),
    userAgent: text("user_agent"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    sessionHashIdx: uniqueIndex("admin_sessions_hash_idx").on(table.sessionTokenHash),
    emailIdx: index("admin_sessions_email_idx").on(table.email)
  })
);

export const paymentRecords = pgTable(
  "payment_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .references(() => orders.id, { onDelete: "cascade" })
      .notNull(),
    method: paymentMethodEnum("method").notNull(),
    status: paymentStatusEnum("status").default("pending").notNull(),
    pixReference: varchar("pix_reference", { length: 160 }),
    cardBrand: varchar("card_brand", { length: 40 }),
    cardLast4: varchar("card_last4", { length: 4 }),
    cardHolderName: varchar("card_holder_name", { length: 160 }),
    verificationNote: text("verification_note"),
    provider: varchar("provider", { length: 80 }),
    providerPaymentId: varchar("provider_payment_id", { length: 120 }),
    amount: numeric("amount", { precision: 10, scale: 2, mode: "number" }).notNull(),
    rawPayload: jsonb("raw_payload").$type<Record<string, unknown>>().default(sql`'{}'::jsonb`).notNull(),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
    ...timestamps
  },
  (table) => ({
    orderIdx: index("payment_records_order_idx").on(table.orderId),
    providerIdx: index("payment_records_provider_idx").on(table.providerPaymentId)
  })
);

export const orderEvents = pgTable(
  "order_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .references(() => orders.id, { onDelete: "cascade" })
      .notNull(),
    eventType: orderEventTypeEnum("event_type").notNull(),
    description: text("description").notNull(),
    previousOperationalStatus: operationalStatusEnum("previous_operational_status"),
    nextOperationalStatus: operationalStatusEnum("next_operational_status"),
    previousPaymentStatus: paymentStatusEnum("previous_payment_status"),
    nextPaymentStatus: paymentStatusEnum("next_payment_status"),
    adminSessionId: uuid("admin_session_id").references(() => adminSessions.id, { onDelete: "set null" }),
    adminActor: varchar("admin_actor", { length: 160 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    orderIdx: index("order_events_order_idx").on(table.orderId),
    eventTypeIdx: index("order_events_event_type_idx").on(table.eventType)
  })
);

export const adminNotes = pgTable(
  "admin_notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .references(() => orders.id, { onDelete: "cascade" })
      .notNull(),
    author: varchar("author", { length: 160 }).notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    orderIdx: index("admin_notes_order_idx").on(table.orderId)
  })
);

export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventName: analyticsEventNameEnum("event_name").notNull(),
    scope: varchar("scope", { length: 40 }).default("store").notNull(),
    path: varchar("path", { length: 255 }),
    sessionId: varchar("session_id", { length: 120 }),
    ipAddress: varchar("ip_address", { length: 80 }),
    userAgent: text("user_agent"),
    orderId: uuid("order_id").references(() => orders.id, { onDelete: "set null" }),
    productId: varchar("product_id", { length: 64 }).references(() => products.id, { onDelete: "set null" }),
    customerId: uuid("customer_id").references(() => customers.id, { onDelete: "set null" }),
    adminSessionId: uuid("admin_session_id").references(() => adminSessions.id, { onDelete: "set null" }),
    payload: jsonb("payload").$type<Record<string, unknown>>().default(sql`'{}'::jsonb`).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    eventNameIdx: index("analytics_events_event_name_idx").on(table.eventName),
    orderIdx: index("analytics_events_order_idx").on(table.orderId),
    productIdx: index("analytics_events_product_idx").on(table.productId),
    createdAtIdx: index("analytics_events_created_at_idx").on(table.createdAt)
  })
);

export const productRelations = relations(products, ({ many }) => ({
  imageMappings: many(catalogImageMappings),
  orderItems: many(orderItems)
}));

export const catalogImageMappingRelations = relations(catalogImageMappings, ({ one }) => ({
  product: one(products, {
    fields: [catalogImageMappings.productId],
    references: [products.id]
  })
}));

export const customerRelations = relations(customers, ({ many }) => ({
  addresses: many(addresses),
  orders: many(orders)
}));

export const addressRelations = relations(addresses, ({ one, many }) => ({
  customer: one(customers, {
    fields: [addresses.customerId],
    references: [customers.id]
  }),
  orders: many(orders)
}));

export const orderRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id]
  }),
  address: one(addresses, {
    fields: [orders.addressId],
    references: [addresses.id]
  }),
  sourceChannel: one(sourceChannels, {
    fields: [orders.sourceChannelId],
    references: [sourceChannels.id]
  }),
  items: many(orderItems),
  paymentRecords: many(paymentRecords),
  events: many(orderEvents),
  adminNotes: many(adminNotes)
}));

export const orderItemRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id]
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id]
  })
}));

export const paymentRecordRelations = relations(paymentRecords, ({ one }) => ({
  order: one(orders, {
    fields: [paymentRecords.orderId],
    references: [orders.id]
  })
}));

export const orderEventRelations = relations(orderEvents, ({ one }) => ({
  order: one(orders, {
    fields: [orderEvents.orderId],
    references: [orders.id]
  }),
  adminSession: one(adminSessions, {
    fields: [orderEvents.adminSessionId],
    references: [adminSessions.id]
  })
}));

export const adminNoteRelations = relations(adminNotes, ({ one }) => ({
  order: one(orders, {
    fields: [adminNotes.orderId],
    references: [orders.id]
  })
}));

export const adminSessionRelations = relations(adminSessions, ({ many }) => ({
  orderEvents: many(orderEvents),
  analyticsEvents: many(analyticsEvents)
}));

export const analyticsEventRelations = relations(analyticsEvents, ({ one }) => ({
  order: one(orders, {
    fields: [analyticsEvents.orderId],
    references: [orders.id]
  }),
  product: one(products, {
    fields: [analyticsEvents.productId],
    references: [products.id]
  }),
  customer: one(customers, {
    fields: [analyticsEvents.customerId],
    references: [customers.id]
  }),
  adminSession: one(adminSessions, {
    fields: [analyticsEvents.adminSessionId],
    references: [adminSessions.id]
  })
}));

export type ProductRow = typeof products.$inferSelect;
export type CustomerRow = typeof customers.$inferSelect;
export type AddressRow = typeof addresses.$inferSelect;
export type OrderRow = typeof orders.$inferSelect;
export type OrderItemRow = typeof orderItems.$inferSelect;
export type PaymentRecordRow = typeof paymentRecords.$inferSelect;
export type OrderEventRow = typeof orderEvents.$inferSelect;
export type AdminNoteRow = typeof adminNotes.$inferSelect;
export type AnalyticsEventRow = typeof analyticsEvents.$inferSelect;
