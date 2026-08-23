const CATEGORIES = ['Skincare', 'Fragrance', 'Makeup', 'Cleanser'] as const;

export interface ValidatedProduct {
  name: string;
  category: (typeof CATEGORIES)[number];
  sku: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  imageUrl: string | null;
}

/**
 * Validates and normalizes a product payload from the client.
 * Returns either { data } or { error } — never throws.
 */
export function validateProductInput(body: unknown): { data: ValidatedProduct } | { error: string } {
  if (typeof body !== 'object' || body === null) {
    return { error: 'Invalid request body.' };
  }
  const b = body as Record<string, unknown>;

  const name = typeof b.name === 'string' ? b.name.trim() : '';
  if (!name) return { error: 'Product name is required.' };

  const category = typeof b.category === 'string' ? b.category : '';
  if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
    return { error: `Category must be one of: ${CATEGORIES.join(', ')}.` };
  }

  const sku = typeof b.sku === 'string' ? b.sku.trim() : '';
  if (!sku) return { error: 'SKU is required.' };

  const costPrice = Number(b.costPrice);
  if (!Number.isFinite(costPrice) || costPrice < 0) {
    return { error: 'Cost price must be a non-negative number.' };
  }

  const sellingPrice = Number(b.sellingPrice);
  if (!Number.isFinite(sellingPrice) || sellingPrice < 0) {
    return { error: 'Selling price must be a non-negative number.' };
  }

  const stockQuantity = Number(b.stockQuantity);
  if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
    return { error: 'Stock quantity must be a non-negative whole number.' };
  }

  const imageUrl = typeof b.imageUrl === 'string' && b.imageUrl.trim() ? b.imageUrl.trim() : null;

  return {
    data: {
      name,
      category: category as (typeof CATEGORIES)[number],
      sku,
      costPrice,
      sellingPrice,
      stockQuantity,
      imageUrl,
    },
  };
}

export function statusForQuantity(stockQuantity: number): 'In_Stock' | 'Low_Stock' {
  return stockQuantity <= 5 ? 'Low_Stock' : 'In_Stock';
}
