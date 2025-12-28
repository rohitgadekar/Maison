import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as crypto from "https://deno.land/std@0.177.0/node/crypto.ts"

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const RAZORPAY_WEBHOOK_SECRET = Deno.env.get('RAZORPAY_WEBHOOK_SECRET')

const supabase = createClient(SUPABASE_URL || '', SUPABASE_SERVICE_ROLE_KEY || '')

// Helper to validate UUID
const isUUID = (str: any) => {
  if (!str || typeof str !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

serve(async (req) => {
  try {
    const signature = req.headers.get('x-razorpay-signature')
    const rawBody = await req.text()

    if (RAZORPAY_WEBHOOK_SECRET && signature) {
      const expectedSignature = crypto
        .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
        .update(rawBody)
        .digest("hex");
        
      if (signature !== expectedSignature) {
        return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 401 })
      }
    }

    const payload = JSON.parse(rawBody)
    const event = payload.event
    const payment = payload.payload.payment?.entity
    const order = payload.payload.order?.entity
    
    // 1. Identify OUR Internal Order ID (The UUID)
    // We store this in 'receipt' or 'notes' when creating the order.
    // We NEVER use Razorpay's 'order_id' (order_...) as our internal ID because it's not a UUID.
    const internalOrderId = payment?.notes?.order_id || order?.receipt || payment?.receipt;
    const userId = payment?.notes?.user_id || null;

    console.log(`Webhook Event: ${event}`);
    console.log(`Internal Order Reference found: ${internalOrderId}`);

    // 2. Log to Payments table
    // Even if it's a test ping with no internal ID, we can still log the transaction if we want, 
    // but the 'order_id' column REQUIRES a UUID.
    if (payment) {
      const paymentData: any = {
        transaction_id: payment.id,
        payment_method: payment.method || 'razorpay',
        amount: payment.amount / 100,
        currency: payment.currency || 'INR',
        status: payment.status || 'captured',
        rzp_payment_id: payment.id,
        raw_response: payload
      };

      // Only add order_id and user_id if they are valid UUIDs to avoid DB errors
      if (isUUID(internalOrderId)) {
        paymentData.order_id = internalOrderId;
      }
      if (isUUID(userId)) {
        paymentData.user_id = userId;
      }

      const { error: logError } = await supabase
        .from('payments')
        .upsert(paymentData, { onConflict: 'transaction_id' })
        
      if (logError) console.error('DATABASE ERROR (Payments Table):', logError)
    }

    // 3. Fulfill order status (Only if we have a valid internal Order ID)
    if (isUUID(internalOrderId) && (event === 'order.paid' || event === 'payment.captured' || event === 'payment.authorized')) {
      console.log(`Processing fulfillment for order: ${internalOrderId}`)
      
      // CRITICAL: Prevent Double Deduction
      // Razorpay sends multiple events. We must ensure we only process the order once.
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('status')
        .eq('id', internalOrderId)
        .single()

      if (existingOrder && existingOrder.status === 'processing') {
        console.log(`Order ${internalOrderId} is already processing. Skipping duplicate webhook event.`);
        return new Response(JSON.stringify({ received: true, note: 'Idempotency check: Already processed' }), { status: 200 })
      }

      // Update order status to 'processing' (Valid Enum Value)
      const { error: orderError } = await supabase
        .from('orders')
        .update({ status: 'processing', updated_at: new Date().toISOString() })
        .eq('id', internalOrderId)

      if (orderError) console.error('Order Status Update Error:', orderError)

      // Fetch order details for inventory and coupon updates
      const { data: orderDetails } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', internalOrderId)
        .single()

      if (orderDetails && orderDetails.order_items?.length > 0) {
        // DEDUCT INVENTORY
        // For online orders, we only deduct stock once the payment is confirmed.
        const inventoryItems = orderDetails.order_items.map((item: any) => ({
          product_id: item.product_id,
          size: item.size?.trim() || 'N/A',
          quantity: item.quantity
        }))
        
        const { error: stockError } = await supabase.rpc('deduct_inventory', { p_items: inventoryItems })
        if (stockError) console.error('Webhook Inventory Deduction Error:', stockError)
        else console.log('Webhook Stock Deduction Successful for Order:', internalOrderId)

        // INCREMENT COUPON USAGE
        if (orderDetails.coupon_id) {
          const { error: couponError } = await supabase.rpc('increment_coupon_usage', { p_coupon_id: orderDetails.coupon_id })
          if (couponError) console.error('Coupon usage increment failed:', couponError)
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (error: any) {
    console.error('Webhook processing failed:', error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 200 }) 
  }
})
