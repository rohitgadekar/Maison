import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OrderItem {
  product_name: string;
  quantity: number;
  price: number;
  size: string | null;
  image_url: string | null;
}

interface OrderData {
  id: string;
  shipping_name: string;
  shipping_email: string;
  total_amount: number;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: string;
  shipping_fee: number;
  discount_amount: number;
  coupon_code: string | null;
  created_at: string;
  status: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const { order, items, type } = payload;

    console.log(`Processing ${type} email for order ${order.id}`);

    let subject = "";
    let htmlContent = "";

    if (type === "confirmation") {
      subject = `Order Confirmation #${order.id.slice(0, 8)} | Maison Archive`;
      htmlContent = generateConfirmationTemplate(order, items);
    } else if (type === "cancellation") {
      subject = `Order Dissolution Protocol #${order.id.slice(0, 8)} | Maison Archive`;
      htmlContent = generateCancellationTemplate(order);
    } else {
      throw new Error("Invalid notification type");
    }

    const { data, error } = await resend.emails.send({
      from: "Maison Archive <concierge@maison.rohitgadekar.dev>",
      to: [order.shipping_email || order.user_email],
      subject: subject,
      html: htmlContent,
    });

    if (error) {
      console.error("Resend error:", error);
      throw error;
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

function generateConfirmationTemplate(order: OrderData, items: OrderItem[]) {
  const date = new Date(order.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const subtotal = items.reduce((sum, item) => sum + Number(item.price), 0);
  const tax = subtotal * 0.08;

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 24px 0; border-bottom: 1px solid #f0f0f0; vertical-align: top;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td width="80" style="vertical-align: top;">
              <div style="width: 70px; height: 90px; background-color: #f9f9f9; border-radius: 4px; overflow: hidden; border: 1px solid #f0f0f0;">
                <img src="${item.image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200'}" width="70" height="90" style="object-fit: cover; display: block;" />
              </div>
            </td>
            <td style="padding-left: 20px; vertical-align: top;">
              <div style="font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; color: #111111; margin-bottom: 6px;">${item.product_name}</div>
              <div style="font-size: 10px; color: #999999; text-transform: uppercase; letter-spacing: 1px;">
                ${item.size ? `Dimension: ${item.size} &nbsp;|&nbsp; ` : ''} Quantity: ${item.quantity}
              </div>
            </td>
            <td style="text-align: right; vertical-align: top;">
              <div style="font-weight: 900; font-size: 14px; color: #111111; letter-spacing: -0.5px;">₹${Math.round(Number(item.price))}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Archival Receipt</title>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
    </head>
    <body style="margin: 0; padding: 0; background-color: #fcfcfc; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #111111; -webkit-font-smoothing: antialiased;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fcfcfc;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 0; shadow: 0 10px 30px rgba(0,0,0,0.05); overflow: hidden;">
              <!-- Luxury Header -->
              <tr>
                <td style="padding: 80px 50px 60px 50px; text-align: center; border-bottom: 12px solid #000000;">
                  <div style="font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 400; letter-spacing: 12px; color: #000000; text-transform: uppercase; margin-bottom: 15px;">MAISON ARCHIVE</div>
                  <div style="font-size: 9px; font-weight: 900; letter-spacing: 5px; color: #c4a484; text-transform: uppercase;">Authenticated Acquisition Registry</div>
                </td>
              </tr>

              <!-- Acquisition Status -->
              <tr>
                <td style="padding: 60px 60px 40px 60px;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="text-align: center; margin-bottom: 40px;">
                        <div style="font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 3px; color: #c4a484; margin-bottom: 20px;">Protocol Success</div>
                        <div style="font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 400; color: #111111; line-height: 1.1; margin-bottom: 40px;">Your purchase has been <i>registered.</i></div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 30px; background-color: #faf9f7; border: 1px solid #f0edea; border-radius: 4px;">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                          <tr>
                            <td style="padding-bottom: 15px;">
                              <div style="font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #999999; margin-bottom: 4px;">Archival Entry No.</div>
                              <div style="font-size: 14px; font-weight: 700; color: #111111; font-family: monospace;">#${order.id.slice(0, 8).toUpperCase()}</div>
                            </td>
                            <td style="padding-bottom: 15px; text-align: right;">
                              <div style="font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #999999; margin-bottom: 4px;">Timestamp</div>
                              <div style="font-size: 14px; font-weight: 700; color: #111111;">${date}</div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Items Manifest -->
              <tr>
                <td style="padding: 0 60px;">
                  <div style="font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 4px; color: #111111; margin-bottom: 20px; border-bottom: 2px solid #111111; padding-bottom: 10px;">Artifact Manifest</div>
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    ${itemsHtml}
                  </table>
                </td>
              </tr>

              <!-- Financial Breakdown -->
              <tr>
                <td style="padding: 40px 60px 60px 60px;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="padding: 10px 0;">
                        <span style="font-size: 11px; font-weight: 900; color: #999999; text-transform: uppercase; letter-spacing: 1px;">Archive Subtotal</span>
                      </td>
                      <td style="padding: 10px 0; text-align: right;">
                        <span style="font-size: 13px; font-weight: 700; color: #111111;">₹${Math.round(subtotal)}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0;">
                        <span style="font-size: 11px; font-weight: 900; color: #999999; text-transform: uppercase; letter-spacing: 1px;">Logistics & Handling</span>
                      </td>
                      <td style="padding: 10px 0; text-align: right;">
                        <span style="font-size: 13px; font-weight: 700; color: #111111;">₹${Math.round(Number(order.shipping_fee))}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0;">
                        <span style="font-size: 11px; font-weight: 900; color: #999999; text-transform: uppercase; letter-spacing: 1px;">Administrative (8%)</span>
                      </td>
                      <td style="padding: 10px 0; text-align: right;">
                        <span style="font-size: 13px; font-weight: 700; color: #111111;">₹${Math.round(tax)}</span>
                      </td>
                    </tr>
                    ${order.discount_amount > 0 ? `
                    <tr>
                      <td style="padding: 10px 0;">
                        <span style="font-size: 11px; font-weight: 900; color: #c4a484; text-transform: uppercase; letter-spacing: 1px;">Member Incentive ${order.coupon_code ? `(${order.coupon_code})` : ''}</span>
                      </td>
                      <td style="padding: 10px 0; text-align: right;">
                        <span style="font-size: 13px; font-weight: 700; color: #c4a484;">-₹${Math.round(Number(order.discount_amount))}</span>
                      </td>
                    </tr>
                    ` : ''}
                    <tr>
                      <td style="padding: 30px 0 10px 0; border-top: 1px solid #111111;">
                        <span style="font-size: 12px; font-weight: 900; color: #111111; text-transform: uppercase; letter-spacing: 2px;">Total Investment</span>
                      </td>
                      <td style="padding: 30px 0 10px 0; text-align: right; border-top: 1px solid #111111;">
                        <span style="font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; color: #111111;">₹${Math.round(Number(order.total_amount))}</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Protocol Coordinates -->
              <tr>
                <td style="padding: 50px 60px; background-color: #faf9f7; border-top: 1px solid #f0edea;">
                  <div style="font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 4px; color: #111111; margin-bottom: 25px; text-align: center;">Protocol Coordinates</div>
                  <div style="font-size: 13px; color: #444444; line-height: 1.8; text-align: center; font-style: italic;">
                    ${order.shipping_name}<br>
                    ${order.shipping_address}<br>
                    ${order.shipping_city}, ${order.shipping_postal_code}<br>
                    ${order.shipping_country}
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 60px 40px; background-color: #ffffff; text-align: center;">
                  <div style="font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 400; letter-spacing: 8px; color: #000000; text-transform: uppercase; margin-bottom: 30px;">MAISON ARCHIVE</div>
                  <p style="font-size: 9px; color: #aaaaaa; text-transform: uppercase; letter-spacing: 2px; line-height: 2;">&copy; ${new Date().getFullYear()} MAISON ARCHIVE SHOWROOM<br>AUTHENTICITY GUARANTEED PER ARCHIVAL RECORDS</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function generateCancellationTemplate(order: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Cancelled</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1a1a1a;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border: 1px solid #f0f0f0; border-radius: 8px; overflow: hidden;">
              <!-- Header -->
              <tr>
                <td style="padding: 60px 40px; background-color: #000000; text-align: center;">
                  <h1 style="color: #ffffff; font-size: 24px; font-weight: 300; letter-spacing: 8px; margin: 0; text-transform: uppercase;">MAISON ARCHIVE</h1>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding: 60px 40px;">
                  <div style="text-align: center; margin-bottom: 40px;">
                    <p style="text-transform: uppercase; letter-spacing: 3px; font-size: 10px; font-weight: 900; color: #e11d48; margin-bottom: 15px;">Dissolution Protocol Initiated</p>
                    <h2 style="font-size: 32px; font-weight: 700; letter-spacing: -1px; margin: 0;">Voided Protocol #${order.id.slice(0, 8)}</h2>
                  </div>
                  
                  <p style="font-size: 14px; line-height: 1.6; color: #4a4a4a; margin-bottom: 40px; text-align: center;">
                    Esteemed Archive Member,<br><br>
                    In accordance with our archival security protocols, Order #${order.id.slice(0, 8)} has been successfully dissolved. If funds had been partially allocated, they have been released back to your original source of acquisition.
                  </p>

                  <div style="background-color: #fff1f2; border: 1px solid #fda4af; padding: 25px; border-radius: 12px; text-align: center; margin-bottom: 40px;">
                    <p style="font-size: 12px; font-weight: 700; color: #e11d48; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Status: Registry Entry Expunged</p>
                  </div>

                  <p style="font-size: 12px; color: #999999; text-align: center; line-height: 1.6;">
                    If this dissolution was not intentional, please re-initiate the acquisition protocol in our showroom or contact our concierge immediately.
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="padding: 40px; background-color: #fafafa; border-top: 1px solid #f0f0f0; text-align: center;">
                  <p style="font-size: 10px; color: #999999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">&copy; ${new Date().getFullYear()} Maison Archive. All protocols reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
