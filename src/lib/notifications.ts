import { supabase } from "@/integrations/supabase/client";

export async function sendOrderNotification(order: any, items: any[], type: 'confirmation' | 'cancellation') {
  try {
    // 1. Get user email if not provided in order
    let email = order.shipping_email;
    if (!email && order.user_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('user_id', order.user_id)
        .single();
      email = profile?.email;
    }

    if (!email) {
      console.warn('No email found for order notification');
      return;
    }

    // 2. Format items for the email
    const formattedItems = items.map(item => {
      // Handle different item structures from Checkout and Orders pages
      const product = Array.isArray(item.products) ? item.products[0] : item.products;
      const imageUrl = item.image_url || item.image || product?.image_url || product?.images?.[0];
      
      return {
        product_name: product?.name || item.product_name || item.name || 'Artifact',
        quantity: item.quantity,
        price: item.price,
        size: item.size || null,
        image_url: imageUrl || null
      };
    });

    // 3. Invoke the Edge Function
    const { data, error } = await supabase.functions.invoke('send-order-notification', {
      body: {
        order: {
          id: order.id,
          shipping_name: order.shipping_name,
          shipping_email: email,
          total_amount: order.total_amount,
          shipping_address: order.shipping_address,
          shipping_city: order.shipping_city,
          shipping_postal_code: order.shipping_postal_code,
          shipping_country: order.shipping_country,
          shipping_fee: order.shipping_fee || 0,
          discount_amount: order.discount_amount || 0,
          coupon_code: order.coupons?.code || order.coupon_code || null,
          created_at: order.created_at || new Date().toISOString(),
          status: order.status
        },
        items: formattedItems,
        type: type
      }
    });

    if (error) throw error;
    console.log(`${type} email response:`, data);
  } catch (err) {
    console.error('Failed to send order notification:', err);
  }
}
