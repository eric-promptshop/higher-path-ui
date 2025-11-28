"use client"

import { format } from "date-fns"

interface OrderItem {
  productName: string
  quantity: number
  unitPrice: string
}

interface PrintSlipOrder {
  id: string
  orderNumber: string
  customerName: string
  customerPhone?: string | null
  customerEmail?: string | null
  deliveryAddress?: string | null
  status: string
  subtotal: string
  shippingFee?: string
  discountAmount?: string
  total: string
  paymentMethod?: string
  notes?: string | null
  substitutionPreference?: string | null
  createdAt: string | Date
  items: OrderItem[]
}

interface OrderPrintSlipProps {
  order: PrintSlipOrder
}

export function OrderPrintSlip({ order }: OrderPrintSlipProps) {
  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num || 0)
  }

  const createdDate = typeof order.createdAt === "string" ? new Date(order.createdAt) : order.createdAt

  return (
    <div className="print-slip p-8 max-w-md mx-auto bg-white text-black font-serif">
      <style jsx>{`
        @media print {
          .print-slip {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background: white;
            z-index: 9999;
          }
          .no-print {
            display: none !important;
          }
        }
        @media screen {
          .print-slip {
            border: 1px solid #e5e5e5;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
        }
      `}</style>

      {/* Header */}
      <div className="text-center border-b border-gray-300 pb-4 mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Higher Path Flower</h1>
        <p className="text-sm text-gray-600 mt-1">Order Packing Slip</p>
      </div>

      {/* Order Info */}
      <div className="border-b border-gray-300 pb-4 mb-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-lg font-bold">#{order.orderNumber}</p>
            <p className="text-sm text-gray-600">
              {format(createdDate, "MMMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block px-2 py-1 bg-gray-100 rounded text-sm font-medium capitalize">
              {order.status}
            </span>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="border-b border-gray-300 pb-4 mb-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-2">Customer</h2>
        <p className="font-medium">{order.customerName}</p>
        {order.customerPhone && <p className="text-sm">{order.customerPhone}</p>}
        {order.customerEmail && <p className="text-sm text-gray-600">{order.customerEmail}</p>}
      </div>

      {/* Delivery Address */}
      {order.deliveryAddress && (
        <div className="border-b border-gray-300 pb-4 mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-2">Delivery Address</h2>
          <p className="text-sm whitespace-pre-line">{order.deliveryAddress}</p>
        </div>
      )}

      {/* Order Items */}
      <div className="border-b border-gray-300 pb-4 mb-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-3">Items</h2>
        <div className="space-y-3">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between items-start">
              <div className="flex-1">
                <p className="font-medium">{item.productName}</p>
                <p className="text-sm text-gray-600">
                  Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
                </p>
              </div>
              <p className="font-medium ml-4">
                {formatCurrency(parseFloat(item.unitPrice) * item.quantity)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Order Totals */}
      <div className="border-b border-gray-300 pb-4 mb-4 space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span>{formatCurrency(order.subtotal)}</span>
        </div>
        {order.shippingFee && parseFloat(order.shippingFee) > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span>{formatCurrency(order.shippingFee)}</span>
          </div>
        )}
        {order.discountAmount && parseFloat(order.discountAmount) > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount</span>
            <span>-{formatCurrency(order.discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
          <span>Total</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
      </div>

      {/* Payment Method */}
      {order.paymentMethod && (
        <div className="border-b border-gray-300 pb-4 mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-1">Payment Method</h2>
          <p className="capitalize">{order.paymentMethod}</p>
        </div>
      )}

      {/* Special Instructions */}
      {(order.notes || order.substitutionPreference) && (
        <div className="border-b border-gray-300 pb-4 mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-2">Special Instructions</h2>
          {order.substitutionPreference && (
            <p className="text-sm mb-1">
              <span className="font-medium">Substitutions:</span> {order.substitutionPreference}
            </p>
          )}
          {order.notes && (
            <p className="text-sm">
              <span className="font-medium">Notes:</span> {order.notes}
            </p>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 pt-2">
        <p>Thank you for your order!</p>
        <p className="mt-1">Questions? Contact us at support@higherpathflower.com</p>
      </div>
    </div>
  )
}

// Function to open print slip in a new window and trigger print
export function printOrderSlip(order: PrintSlipOrder) {
  const printWindow = window.open("", "_blank", "width=500,height=700")

  if (!printWindow) {
    alert("Please allow pop-ups to print the order slip")
    return
  }

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num || 0)
  }

  const createdDate = typeof order.createdAt === "string" ? new Date(order.createdAt) : order.createdAt
  const formattedDate = format(createdDate, "MMMM d, yyyy 'at' h:mm a")

  const itemsHtml = order.items.map(item => `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
      <div style="flex: 1;">
        <p style="margin: 0; font-weight: 500;">${item.productName}</p>
        <p style="margin: 4px 0 0; font-size: 14px; color: #666;">
          Qty: ${item.quantity} × ${formatCurrency(item.unitPrice)}
        </p>
      </div>
      <p style="margin: 0; font-weight: 500; margin-left: 16px;">
        ${formatCurrency(parseFloat(item.unitPrice) * item.quantity)}
      </p>
    </div>
  `).join("")

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order #${order.orderNumber} - Packing Slip</title>
      <style>
        body {
          font-family: Georgia, 'Times New Roman', serif;
          max-width: 400px;
          margin: 0 auto;
          padding: 24px;
          color: #333;
        }
        .header {
          text-align: center;
          border-bottom: 1px solid #ccc;
          padding-bottom: 16px;
          margin-bottom: 16px;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          letter-spacing: -0.5px;
        }
        .header p {
          margin: 8px 0 0;
          font-size: 14px;
          color: #666;
        }
        .section {
          border-bottom: 1px solid #ccc;
          padding-bottom: 16px;
          margin-bottom: 16px;
        }
        .section-title {
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #666;
          margin: 0 0 8px;
        }
        .order-info {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .order-number {
          font-size: 18px;
          font-weight: bold;
          margin: 0;
        }
        .order-date {
          font-size: 14px;
          color: #666;
          margin: 4px 0 0;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 8px;
          background: #f3f3f3;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
          text-transform: capitalize;
        }
        .totals-row {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          margin-bottom: 4px;
        }
        .totals-row.total {
          font-size: 18px;
          font-weight: bold;
          border-top: 1px solid #eee;
          padding-top: 8px;
          margin-top: 8px;
        }
        .footer {
          text-align: center;
          font-size: 14px;
          color: #666;
          padding-top: 8px;
        }
        @media print {
          body { margin: 0; padding: 16px; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Higher Path Flower</h1>
        <p>Order Packing Slip</p>
      </div>

      <div class="section">
        <div class="order-info">
          <div>
            <p class="order-number">#${order.orderNumber}</p>
            <p class="order-date">${formattedDate}</p>
          </div>
          <span class="status-badge">${order.status}</span>
        </div>
      </div>

      <div class="section">
        <p class="section-title">Customer</p>
        <p style="margin: 0; font-weight: 500;">${order.customerName}</p>
        ${order.customerPhone ? `<p style="margin: 4px 0 0; font-size: 14px;">${order.customerPhone}</p>` : ""}
        ${order.customerEmail ? `<p style="margin: 4px 0 0; font-size: 14px; color: #666;">${order.customerEmail}</p>` : ""}
      </div>

      ${order.deliveryAddress ? `
      <div class="section">
        <p class="section-title">Delivery Address</p>
        <p style="margin: 0; font-size: 14px; white-space: pre-line;">${order.deliveryAddress}</p>
      </div>
      ` : ""}

      <div class="section">
        <p class="section-title">Items</p>
        ${itemsHtml}
      </div>

      <div class="section">
        <div class="totals-row">
          <span style="color: #666;">Subtotal</span>
          <span>${formatCurrency(order.subtotal)}</span>
        </div>
        ${order.shippingFee && parseFloat(order.shippingFee) > 0 ? `
        <div class="totals-row">
          <span style="color: #666;">Shipping</span>
          <span>${formatCurrency(order.shippingFee)}</span>
        </div>
        ` : ""}
        ${order.discountAmount && parseFloat(order.discountAmount) > 0 ? `
        <div class="totals-row" style="color: #16a34a;">
          <span>Discount</span>
          <span>-${formatCurrency(order.discountAmount)}</span>
        </div>
        ` : ""}
        <div class="totals-row total">
          <span>Total</span>
          <span>${formatCurrency(order.total)}</span>
        </div>
      </div>

      ${order.paymentMethod ? `
      <div class="section">
        <p class="section-title">Payment Method</p>
        <p style="margin: 0; text-transform: capitalize;">${order.paymentMethod}</p>
      </div>
      ` : ""}

      ${order.notes || order.substitutionPreference ? `
      <div class="section">
        <p class="section-title">Special Instructions</p>
        ${order.substitutionPreference ? `<p style="margin: 0 0 4px; font-size: 14px;"><strong>Substitutions:</strong> ${order.substitutionPreference}</p>` : ""}
        ${order.notes ? `<p style="margin: 0; font-size: 14px;"><strong>Notes:</strong> ${order.notes}</p>` : ""}
      </div>
      ` : ""}

      <div class="footer">
        <p style="margin: 0;">Thank you for your order!</p>
        <p style="margin: 8px 0 0;">Questions? Contact us at support@higherpathflower.com</p>
      </div>
    </body>
    </html>
  `

  printWindow.document.write(html)
  printWindow.document.close()

  // Wait for content to load then print
  printWindow.onload = () => {
    printWindow.print()
    // Close window after printing (or if user cancels)
    printWindow.onafterprint = () => {
      printWindow.close()
    }
  }
}
