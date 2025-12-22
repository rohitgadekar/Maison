import { Price } from '@/components/Price';
import { calculateOrderTotals } from '@/lib/calculations';
import { Truck } from 'lucide-react';
import { createPortal } from 'react-dom';

interface InvoiceProps {
    order: {
        id: string;
        created_at: string;
        status: string;
        shipping_name: string | null;
        shipping_address: string | null;
        shipping_city: string | null;
        shipping_postal_code: string | null;
        shipping_country: string | null;
        shipping_phone: string | null;
        shipping_fee: number | null;
        discount_amount: number | null;
        total_amount: number;
        tracking_number: string | null;
        shipping_method_name: string | null;
        coupons?: { code: string } | null;
    };
    items: {
        id: string;
        quantity: number;
        size: string | null;
        price: number;
        products: {
            name: string;
            image_url: string | null;
            images: string[] | null;
        };
    }[];
    customer?: {
        name: string | null;
        email: string | null;
        phone: string | null;
    };
    paymentInfo?: {
        payment_method: string;
        status: string;
        transaction_id: string;
    } | null;
}

export const Invoice = ({ order, items, customer, paymentInfo }: InvoiceProps) => {
    const shipping = Number(order.shipping_fee || 0);
    const discount = Number(order.discount_amount || 0);

    let gross = items?.length > 0
        ? items.reduce((sum, item) => sum + Number(item.price), 0)
        : 0;

    if (gross === 0 && Number(order.total_amount) > 0) {
        gross = (Number(order.total_amount) - shipping + discount) / 1.08;
    }

    const { tax, total, gross: calculatedGross } = calculateOrderTotals(gross, shipping, discount);

    const printRoot = document.getElementById('print-root');
    if (!printRoot) return null;

    return createPortal(
        <div id="invoice-print-area" className="p-16 bg-[#FFFAF5] text-primary min-h-screen relative font-sans">
            {/* Authenticity Watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.05] rotate-[-15deg] pointer-events-none select-none">
                <h1 className="font-heading text-[20rem] font-black leading-none">MAISON</h1>
            </div>

            <header className="mb-12 relative z-10">
                <div className="flex justify-between items-start mb-10">
                    <div>
                        <h1 className="font-heading text-6xl font-black tracking-tighter text-primary mb-2">
                            MAISON<span className="text-accent">.</span>
                        </h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent mt-1">Luxury Fine Goods Atelier</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.8em] text-accent mb-6">Acquisition Receipt</h2>
                        <div className="space-y-1 text-[10px] font-bold uppercase tracking-widest text-[#1a1a1a]">
                            <p className="opacity-40 inline-block mr-2">Registry ID:</p>
                            <span className="font-sans font-black text-primary">#{order.id.slice(0, 8).toUpperCase()}</span>
                            <div className="h-0.5" />
                            <p className="opacity-40 inline-block mr-2">Dated:</p>
                            <span className="font-sans font-black text-primary">
                                {new Date(order.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                }).toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="w-full h-px bg-primary/10" />
            </header>

            <div className="grid grid-cols-2 gap-20 mb-16 relative z-10">
                <div>
                    <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-accent mb-6 flex items-center gap-3">
                        <span className="w-8 h-px bg-accent/20" /> Consignee
                    </h3>
                    <div className="ml-11">
                        <p className="font-heading text-2xl font-black text-primary mb-2">{order.shipping_name || customer?.name || customer?.email || "Anonymous Collector"}</p>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-primary/40 space-y-1">
                            <p className="italic underline">{customer?.email}</p>
                            {customer?.phone && <p>{customer.phone}</p>}
                        </div>
                        <div className="mt-6 text-sm font-medium italic text-primary/70 leading-relaxed max-w-xs">
                            {order.shipping_address || "Atelier Collection Point"}<br />
                            {order.shipping_city}{order.shipping_postal_code ? `, ${order.shipping_postal_code}` : ''}<br />
                            {order.shipping_country || "Global Distribution"}
                        </div>
                    </div>
                </div>
                <div>
                    <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-accent mb-6 flex items-center gap-3">
                        <span className="w-8 h-px bg-accent/20" /> Registry Parameters
                    </h3>
                    <div className="ml-11 grid grid-cols-2 gap-8">
                        <div className="space-y-1">
                            <p className="text-[8px] font-black uppercase tracking-widest text-primary/30">Registry Status</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-accent italic">{order.status}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[8px] font-black uppercase tracking-widest text-primary/30">Payment Protocol</p>
                            <div className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                {paymentInfo?.payment_method || 'Online Secure'}
                                {paymentInfo?.status === 'pending' && <span className="text-amber-500 italic">(Pending)</span>}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[8px] font-black uppercase tracking-widest text-primary/30">Valuation Reference</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary">USD (Credit)</p>
                        </div>
                        {order.tracking_number && (
                            <div className="col-span-2 pt-2 border-t border-accent/5">
                                <p className="text-[8px] font-black uppercase tracking-widest text-primary/30 mb-1">Logistics Reference</p>
                                <p className="font-mono text-[10px] font-bold text-primary bg-accent/5 px-3 py-1.5 rounded inline-block">
                                    {order.tracking_number}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="relative z-10">
                <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-accent mb-8 flex items-center gap-3">
                    <span className="w-8 h-px bg-accent/20" /> Artifact Manifest
                </h3>
                <table className="w-full mb-16 border-collapse">
                    <thead>
                        <tr className="border-b border-accent/10">
                            <th className="text-left py-6 text-[8px] font-black uppercase tracking-[0.4em] text-primary/30 w-16">Item</th>
                            <th className="text-left py-6 text-[8px] font-black uppercase tracking-[0.4em] text-primary/30 px-6">Archival Designation</th>
                            <th className="text-center py-6 text-[8px] font-black uppercase tracking-[0.4em] text-primary/30 w-24">Dim.</th>
                            <th className="text-center py-6 text-[8px] font-black uppercase tracking-[0.4em] text-primary/30 w-24">Qty</th>
                            <th className="text-right py-6 text-[8px] font-black uppercase tracking-[0.4em] text-primary/30 w-32">Valuation</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-accent/5">
                        {items?.map((item) => {
                            const product = Array.isArray(item.products) ? item.products[0] : item.products;
                            if (!product) return null;

                            return (
                                <tr key={item.id}>
                                    <td className="py-8">
                                        <div className="w-12 h-16 bg-white rounded border border-accent/5 overflow-hidden">
                                            <img
                                                src={
                                                    product.image_url ||
                                                    product.images?.[0] ||
                                                    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=750&fit=crop'
                                                }
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </td>
                                    <td className="py-8 px-6 text-left">
                                        <p className="font-heading text-lg font-bold tracking-tight text-primary leading-tight">{product.name}</p>
                                        <p className="text-[8px] text-primary/30 mt-2 font-black uppercase tracking-widest">Entry UID: {item.id.slice(0, 8).toUpperCase()}</p>
                                    </td>
                                    <td className="text-center py-8 text-[10px] font-black uppercase tracking-widest text-primary/60">{item.size || "STD"}</td>
                                    <td className="text-center py-8 text-[10px] font-black uppercase tracking-widest text-primary/60">{item.quantity}</td>
                                    <td className="text-right py-8 font-sans text-lg font-bold text-primary">
                                        <Price amount={Number(item.price)} />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end mb-24 relative z-10">
                <div className="w-72 space-y-4">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-primary/40">
                        <span>Gross Valuation</span>
                        <Price amount={calculatedGross} className="text-primary" />
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-primary/40">
                        <span>Logistics ({order.shipping_method_name || 'Standard'})</span>
                        <Price amount={shipping} className="text-primary" />
                    </div>
                    {discount > 0 && (
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-accent">
                            <span>Incentive {order.coupons?.code ? `(${order.coupons.code})` : ''} Applied</span>
                            <span className="text-accent flex gap-1 justify-end">-<Price amount={discount} /></span>
                        </div>
                    )}
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-primary/40 pb-4 border-b border-accent/10">
                        <span>Fiscal Duty (8%)</span>
                        <Price amount={tax} className="text-primary" />
                    </div>
                    <div className="flex justify-between items-baseline pt-2">
                        <span className="text-[12px] font-black uppercase tracking-[0.4em] text-accent">Net Total</span>
                        <Price amount={Number(order.total_amount)} className="font-sans text-4xl font-black text-primary" />
                    </div>
                </div>
            </div>

            <footer className="mt-auto pt-16 border-t border-primary/5 relative z-10 flex justify-between items-end">
                <div className="space-y-4">
                    <p className="font-heading text-lg font-bold text-accent italic">
                        Authenticated by Maison Atelier Management.
                    </p>
                    <p className="text-[9px] text-primary/30 font-black uppercase tracking-[0.3em] leading-relaxed max-w-sm">
                        THIS REGISTRY RECEIPT SERVES AS THE OFFICIAL ARCHIVAL RECORD OF TRANSFER FOR THE ARTIFACTS LISTED ABOVE.
                    </p>
                </div>
                <div className="flex flex-col items-end">
                    <div className="w-20 h-20 rounded-full bg-accent/5 border border-accent/10 flex items-center justify-center mb-6 backdrop-blur-sm">
                        <span className="text-accent text-sm font-black italic tracking-tighter">V1.0</span>
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-primary/10">
                        © MMXXV MAISON ATELIER
                    </p>
                </div>
            </footer>

            {/* Print Specific Overrides */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    body {
                        background-color: #FFFAF5 !important;
                        -webkit-print-color-adjust: exact;
                    }
                    @page {
                        margin: 0;
                        size: auto;
                    }
                    #invoice-print-area {
                        display: block !important;
                        position: relative !important;
                        margin: 0 !important;
                        padding: 60px !important;
                        width: 100% !important;
                        height: auto !important;
                        overflow: visible !important;
                    }
                }
            `}} />
        </div>,
        printRoot
    );
};
