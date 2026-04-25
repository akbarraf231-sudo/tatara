export type Product = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  status: "active" | "inactive" | "discontinued";
  variants: Variant[];
};

export type Variant = {
  id: string;
  name: string;
  price: number;
  stock_conversion: number;
  status: "active" | "inactive";
  stock?: { quantity_available: number } | { quantity_available: number }[] | null;
};

export type CartItem = {
  variantId: string;
  productId: string;
  productName: string;
  variantName: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
  maxStock: number;
};
