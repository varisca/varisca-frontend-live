import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AuthProvider } from "@/context/AuthContext";
import { RecentlyViewedProvider } from "@/context/RecentlyViewedContext";
import { CouponProvider } from "@/context/CouponContext";
import { AddressProvider } from "@/context/AddressContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { ScrollToTop } from "@/components/ScrollToTop";

// Pages
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Account from "./pages/Account";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import SizeGuide from "./pages/SizeGuide";
import ShippingInfo from "./pages/ShippingInfo";
import Returns from "./pages/Returns";
import CustomOrder from "./pages/CustomOrder";
import Policy from "./pages/Policy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="varisca-theme">
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <RecentlyViewedProvider>
                <CouponProvider>
                  <AddressProvider>
                  <Toaster />
                  <Sonner position="top-right" closeButton richColors />
                  <BrowserRouter>
                    <ScrollToTop />
                    <Header />
                    <CartDrawer />
                    <Routes>
                      {/* Main Pages */}
                      <Route path="/" element={<Index />} />
                      <Route path="/shop" element={<Shop />} />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/wishlist" element={<Wishlist />} />
                      
                      {/* Checkout Flow */}
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/order-confirmation" element={<OrderConfirmation />} />
                      
                      {/* Auth */}
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/account" element={<Account />} />
                      
                      {/* Static Pages */}
                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/faq" element={<FAQ />} />
                      <Route path="/size-guide" element={<SizeGuide />} />
                      <Route path="/shipping" element={<ShippingInfo />} />
                      <Route path="/returns" element={<Returns />} />
                      <Route path="/custom-order" element={<CustomOrder />} />
                      <Route path="/policy" element={<Policy />} />
                      <Route path="/policy/:slug" element={<Policy />} />
                      
                      {/* 404 */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                    <Footer />
                  </BrowserRouter>
                  </AddressProvider>
                </CouponProvider>
              </RecentlyViewedProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
