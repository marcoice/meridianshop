// Printify API types

export interface PrintifyImage {
  src: string;
  variant_ids: number[];
  position: string;
  is_default: boolean;
}

export interface PrintifyOption {
  name: string;
  type: string;
  values: { id: number; title: string }[];
}

export interface PrintifyVariant {
  id: number;
  title: string;
  sku: string;
  cost: number;
  price: number;
  is_enabled: boolean;
  is_default: boolean;
  options: number[];
  quantity: number;
}

export interface PrintifyProduct {
  id: string;
  title: string;
  description: string;
  tags: string[];
  options: PrintifyOption[];
  variants: PrintifyVariant[];
  images: PrintifyImage[];
  created_at: string;
  updated_at: string;
  visible: boolean;
  blueprint_id: number;
  print_provider_id: number;
  shop_id: number;
}

export interface PrintifyProductsResponse {
  current_page: number;
  data: PrintifyProduct[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface PrintifyShop {
  id: number;
  title: string;
  sales_channel: string;
}

// Cart types
export interface CartItem {
  productId: string;
  variantId: number;
  title: string;
  variantTitle: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

// Order types
export interface OrderAddress {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country: string;
  region: string;
  address1: string;
  address2?: string;
  city: string;
  zip: string;
}

export interface OrderLineItem {
  product_id: string;
  variant_id: number;
  quantity: number;
}

export interface CreateOrderPayload {
  external_id: string;
  label: string;
  line_items: OrderLineItem[];
  shipping_method: number;
  send_shipping_notification: boolean;
  address_to: OrderAddress;
}
