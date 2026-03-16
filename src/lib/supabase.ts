npx supabase@latest login
npx supabase@latest db push// Supabase client configuration
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Quote {
  id?: string
  quote_id: string
  product_id: string
  product_name: string
  customername: string
  phone: string
  cep: string
  neighborhood: string
  distancekm: number
  colorpreference: string
  paymentmethod: string
  notes: string
  estimated_price_pix: number
  estimated_price_card: number
  estimated_delivery_fee: number
  estimated_total_pix: number
  created_at?: string
}

export interface Order {
  id?: string
  order_code: string
  product_id: string
  product_name: string
  quantity: number
  customer_name: string
  email: string
  phone: string
  neighborhood: string
  cep: string
  payment_method: string
  notes: string
  total_pix: number
  total_card: number
  status: string
  created_at?: string
}

export interface QuoteRequest {
  id?: number
  quote_id: string
  request_type: string
  customer_name: string
  phone: string
  email?: string
  project_description: string
  project_size: string
  preferred_material: string
  preferred_color: string
  desired_deadline: string
  quantity: number
  reference_image_name?: string
  reference_image_size?: number
  model_file_name?: string
  model_file_size?: number
  source: string
  storage_mode: string
  created_at?: string
}