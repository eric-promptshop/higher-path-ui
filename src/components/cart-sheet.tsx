"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useCartStore } from "@/lib/store"

const DELIVERY_FEE = 15

export function CartSheet() {
  const router = useRouter()
  const { items, isCartOpen, closeCart, removeItem, updateQuantity, getTotal } = useCartStore()

  const subtotal = getTotal()
  const total = subtotal + (items.length > 0 ? DELIVERY_FEE : 0)

  const handleCheckout = () => {
    closeCart()
    router.push("/checkout")
  }

  return (
    <Sheet open={isCartOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-semibold">Your Cart</SheetTitle>
            <Button variant="ghost" size="icon" onClick={closeCart}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground mb-1">Your cart is empty</h3>
            <p className="text-sm text-muted-foreground mb-6">Start adding items to place an order</p>
            <Button onClick={closeCart}>Continue Shopping</Button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-3 p-3 bg-secondary/50 rounded-xl">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                    <Image
                      src={item.product.image || "/placeholder.svg"}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-foreground line-clamp-2">{item.product.name}</h4>
                    <p className="text-primary font-semibold mt-1">${item.product.price.toFixed(2)}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-border rounded-lg bg-background">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1.5 hover:bg-secondary transition-colors rounded-l-lg"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.inventory}
                          className="p-1.5 hover:bg-secondary disabled:opacity-50 transition-colors rounded-r-lg"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="p-6 border-t border-border bg-background space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-medium">${DELIVERY_FEE.toFixed(2)}</span>
                </div>
                <div className="h-px bg-border my-2" />
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </div>

              <Button onClick={handleCheckout} size="lg" className="w-full h-12 text-base">
                Proceed to Checkout
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
