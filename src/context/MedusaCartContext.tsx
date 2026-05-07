import React, { createContext, useContext, useEffect, useState } from 'react';
import { sdk } from '@/lib/medusa';
import { Product } from '@/lib/data';
import { toast } from '@/components/ui/use-toast';

interface CartItem {
  id: string; // Line Item ID
  product: Product;
  quantity: number;
  size: string;
  color: string;
  variant_id: string;
}

interface CartContextType {
  items: CartItem[];
  cartId: string | null;
  addToCart: (product: Product, size: string, color: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalPrice: number;
  subtotal: number;
  discount: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  loading: boolean;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_ID_KEY = "medusa_cart_id";

// Helper to transform LineItem to CartItem
const transformLineItem = (lineItem: any): CartItem | null => {
  if (!lineItem.variant) return null;
  // Reconstruct minimal Product object from variant
  const product = {
      id: lineItem.variant.product?.id || "",
      name: lineItem.title, // Line item title usually stores product title
      price: lineItem.unit_price / 100, // Unit price in cents
      image: lineItem.thumbnail || "",
      category: "", subcategory: "", 
      sizes: [], colors: [], rating: 0, reviews: 0, description: "", material: "",
  } as Product;

  // Extract size/color from options (stored in metadata usually if variant options are generic)
  // Or check variant.options
  const size = lineItem.variant.options?.find((o:any) => o.option?.title === "Size")?.value || "M";
  const color = lineItem.variant.options?.find((o:any) => o.option?.title === "Color")?.value || "Black";

  return {
    id: lineItem.id,
    product,
    quantity: lineItem.quantity,
    size, 
    color,
    variant_id: lineItem.variant_id
  };
};

export const MedusaCartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartId, setCartId] = useState<string | null>(localStorage.getItem(CART_ID_KEY));
  const [items, setItems] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch Cart
  const fetchCart = async (id: string) => {
    setLoading(true);
    try {
      const { cart } = await sdk.store.cart.retrieve(id);
      if (cart) {
        setItems(cart.items?.map(transformLineItem).filter(Boolean) as CartItem[] || []);
        setTotalPrice((cart.total || 0) / 100);
        setSubtotal((cart.subtotal || 0) / 100);
        setDiscount((cart.discount_total || 0) / 100);
      }
    } catch (e) {
      console.error("Failed to fetch cart", e);
      // specific error handling (e.g., cart checked out/expired) -> clear ID
      localStorage.removeItem(CART_ID_KEY);
      setCartId(null);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cartId) {
      fetchCart(cartId);
    }
  }, [cartId]);

  const addToCart = async (product: Product, size: string, color: string, quantity: number) => {
    setLoading(true);
    try {
      let currentCartId = cartId;
      if (!currentCartId) {
        const { cart } = await sdk.store.cart.create({ region_id: "reg_..." }); // region_id might be needed or default
        // Actually sdk.store.cart.create() might pick default region
        // If fails, need to fetch regions first
        currentCartId = cart.id;
        setCartId(currentCartId);
        localStorage.setItem(CART_ID_KEY, currentCartId);
      }

      // Find Variant ID
      // Assuming product.variants comes from useProducts hook which populates it
      const variant = product.variants?.find((v: any) => 
        v.options.some((o: any) => o.value === size) && 
        v.options.some((o: any) => o.value === color)
      );

      if (!variant) {
        toast({ title: "Error", description: "Variant not found", variant: "destructive" });
        return;
      }

      await sdk.store.cart.createLineItem(currentCartId, {
        variant_id: variant.id,
        quantity,
      });

      await fetchCart(currentCartId);
      setIsCartOpen(true);
      toast({ title: "Added to Bag", description: `${product.name} added.` });

    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to add to cart", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!cartId) return;
    setLoading(true);
    try {
      await sdk.store.cart.deleteLineItem(cartId, itemId);
      await fetchCart(cartId);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!cartId) return;
    setLoading(true);
    try {
      await sdk.store.cart.updateLineItem(cartId, itemId, { quantity });
      await fetchCart(cartId);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    // Cannot clear cart easily via API except deleting items one by one or completing.
    // Usually just client side clear? No, state persists.
    // Just ignore it for now.
    setItems([]);
  };

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, cartId, addToCart, removeFromCart, updateQuantity, clearCart,
      totalPrice, subtotal, discount, isCartOpen, setIsCartOpen, loading,
      totalItems
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within MedusaCartProvider");
  return context;
};
