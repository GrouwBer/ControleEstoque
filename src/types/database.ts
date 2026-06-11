export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      products: {
        Row: ProductRow;
        Insert: ProductInsert;
        Update: ProductUpdate;
      };
      carts: {
        Row: CartRow;
        Insert: CartInsert;
        Update: CartUpdate;
      };
      cart_items: {
        Row: CartItemRow;
        Insert: CartItemInsert;
        Update: CartItemUpdate;
      };
      reservations: {
        Row: ReservationRow;
        Insert: ReservationInsert;
        Update: ReservationUpdate;
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export interface ProductRow {
  id: number;
  user_id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  condition: "New" | "Like New" | "Good" | "Fair" | "Poor";
  cost_price: number;
  list_price: number;
  status: "available" | "reserved" | "sold";
  image_url: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface ProductInsert {
  user_id: string;
  sku: string;
  name: string;
  description?: string;
  category?: string;
  condition: "New" | "Like New" | "Good" | "Fair" | "Poor";
  cost_price?: number;
  list_price?: number;
  status?: "available" | "reserved" | "sold";
  image_url?: string;
  notes?: string;
}

export interface ProductUpdate {
  name?: string;
  description?: string;
  category?: string;
  condition?: "New" | "Like New" | "Good" | "Fair" | "Poor";
  cost_price?: number;
  list_price?: number;
  status?: "available" | "reserved" | "sold";
  image_url?: string;
  notes?: string;
}

export interface CartRow {
  id: number;
  user_id: string;
  buyer_name: string;
  buyer_phone: string;
  discount_type: "none" | "percent" | "fixed";
  discount_value: number;
  subtotal: number;
  discount_amount: number;
  final_total: number;
  notes: string;
  sale_notes: string;
  status: "active" | "finalized" | "cancelled";
  created_at: string;
  finalized_at: string | null;
  cancelled_at: string | null;
}

export interface CartInsert {
  user_id: string;
  buyer_name?: string;
  buyer_phone?: string;
  discount_type?: "none" | "percent" | "fixed";
  discount_value?: number;
  subtotal?: number;
  discount_amount?: number;
  final_total?: number;
  notes?: string;
  sale_notes?: string;
  status?: "active" | "finalized" | "cancelled";
}

export interface CartUpdate {
  buyer_name?: string;
  buyer_phone?: string;
  discount_type?: "none" | "percent" | "fixed";
  discount_value?: number;
  subtotal?: number;
  discount_amount?: number;
  final_total?: number;
  notes?: string;
  sale_notes?: string;
  status?: "active" | "finalized" | "cancelled";
  finalized_at?: string;
  cancelled_at?: string;
}

export interface CartItemRow {
  id: number;
  cart_id: number;
  product_id: number;
  list_price_at_time: number;
  final_price: number;
}

export interface CartItemInsert {
  cart_id: number;
  product_id: number;
  list_price_at_time: number;
  final_price?: number;
}

export interface CartItemUpdate {
  final_price?: number;
}

export interface ReservationRow {
  id: number;
  user_id: string;
  product_id: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  reserved_at: string;
  deadline: string | null;
  status: "active" | "converted" | "cancelled";
}

export interface ReservationInsert {
  user_id: string;
  product_id: number;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  deadline?: string | null;
  status?: "active" | "converted" | "cancelled";
}

export interface ReservationUpdate {
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  deadline?: string | null;
  status?: "active" | "converted" | "cancelled";
}

// Helper types
export type ProductStatus = ProductRow["status"];
export type CartStatus = CartRow["status"];
export type ReservationStatus = ReservationRow["status"];
export type Condition = ProductRow["condition"];
export type DiscountType = CartRow["discount_type"];
