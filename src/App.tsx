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
import { AdminAuthProvider, AdminProtectedRoute } from "@/context/AdminAuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AdminLayout } from "@/components/admin/AdminLayout";

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
import TrackOrder from "./pages/TrackOrder";
import NotFound from "./pages/NotFound";

// Admin Pages — Core
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSettings from "./pages/admin/AdminSettings";

// Admin Pages — Catalog
import Categories from "./pages/admin/catalog/Categories";
import Brands from "./pages/admin/catalog/Brands";
import Attributes from "./pages/admin/catalog/Attributes";
import Inventory from "./pages/admin/catalog/Inventory";

// Admin Pages — Orders Sub
import AdminReturns from "./pages/admin/orders/Returns";
import RefundRequests from "./pages/admin/orders/RefundRequests";
import CustomOrders from "./pages/admin/orders/CustomOrders";

// Admin Pages — Marketing
import Coupons from "./pages/admin/marketing/Coupons";
import Banners from "./pages/admin/marketing/Banners";
import EmailCampaigns from "./pages/admin/marketing/EmailCampaigns";

// Admin Pages — Finance
import Transactions from "./pages/admin/finance/Transactions";
import Payouts from "./pages/admin/finance/Payouts";
import RefundLogs from "./pages/admin/finance/RefundLogs";

// Admin Pages — Shipping
import DeliveryZones from "./pages/admin/shipping/DeliveryZones";
import ShippingCharges from "./pages/admin/shipping/ShippingCharges";
import DeliveryPartners from "./pages/admin/shipping/DeliveryPartners";
import DeliveryWarehouses from "./pages/admin/delivery/DeliveryWarehouses";

// Admin Pages — Reports
import SalesReport from "./pages/admin/reports/SalesReport";
import ProductPerformance from "./pages/admin/reports/ProductPerformance";
import CustomerAnalytics from "./pages/admin/reports/CustomerAnalytics";
import RevenueReport from "./pages/admin/reports/RevenueReport";

// Admin Pages — Management
import AdminUsers from "./pages/admin/management/AdminUsers";
import RolesPermissions from "./pages/admin/management/RolesPermissions";

// Admin Pages — Settings
import GeneralSettings from "./pages/admin/settings/GeneralSettings";
import PaymentSettings from "./pages/admin/settings/PaymentSettings";
import TaxSettings from "./pages/admin/settings/TaxSettings";
import NotificationTemplates from "./pages/admin/settings/NotificationTemplates";

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
                  <Sonner position="bottom-right" closeButton richColors duration={4000} />
                  <BrowserRouter>
                    <ScrollToTop />
                    <Routes>
                      {/* ─── Admin Routes ───────────────────────── */}
                      <Route path="/admin/login" element={
                        <AdminAuthProvider>
                          <AdminLogin />
                        </AdminAuthProvider>
                      } />
                      <Route path="/admin/*" element={
                        <AdminAuthProvider>
                          <AdminProtectedRoute>
                            <AdminLayout />
                          </AdminProtectedRoute>
                        </AdminAuthProvider>
                      }>
                        {/* Dashboard */}
                        <Route index element={<AdminDashboard />} />
                        <Route path="analytics" element={<AdminAnalytics />} />

                        {/* Orders */}
                        <Route path="orders" element={<AdminOrders />} />
                        <Route path="orders/custom" element={<CustomOrders />} />
                        <Route path="orders/returns" element={<AdminReturns />} />
                        <Route path="orders/refunds" element={<RefundRequests />} />

                        {/* Catalog */}
                        <Route path="products" element={<AdminProducts />} />
                        <Route path="catalog/categories" element={<Categories />} />
                        <Route path="catalog/brands" element={<Brands />} />
                        <Route path="catalog/attributes" element={<Attributes />} />
                        <Route path="catalog/inventory" element={<Inventory />} />

                        {/* Customers */}
                        <Route path="customers" element={<AdminCustomers />} />

                        {/* Marketing */}
                        <Route path="marketing/coupons" element={<Coupons />} />
                        <Route path="marketing/banners" element={<Banners />} />
                        <Route path="marketing/campaigns" element={<EmailCampaigns />} />

                        {/* Finance */}
                        <Route path="finance/transactions" element={<Transactions />} />
                        <Route path="finance/payouts" element={<Payouts />} />
                        <Route path="finance/refund-logs" element={<RefundLogs />} />

                        {/* Shipping */}
                        <Route path="shipping/zones" element={<DeliveryZones />} />
                        <Route path="shipping/charges" element={<ShippingCharges />} />
                        <Route path="shipping/partners" element={<DeliveryPartners />} />

                        {/* Delivery (Delhivery / logistics) */}
                        <Route path="delivery/warehouses" element={<DeliveryWarehouses />} />

                        {/* Reports */}
                        <Route path="reports/sales" element={<SalesReport />} />
                        <Route path="reports/products" element={<ProductPerformance />} />
                        <Route path="reports/customers" element={<CustomerAnalytics />} />
                        <Route path="reports/revenue" element={<RevenueReport />} />

                        {/* Admin Management */}
                        <Route path="management/users" element={<AdminUsers />} />
                        <Route path="management/roles" element={<RolesPermissions />} />

                        {/* Settings */}
                        <Route path="settings" element={<GeneralSettings />} />
                        <Route path="settings/payment" element={<PaymentSettings />} />
                        <Route path="settings/tax" element={<TaxSettings />} />
                        <Route path="settings/notifications" element={<NotificationTemplates />} />
                      </Route>

                      {/* ─── Storefront Routes ──────────────────── */}
                      <Route path="/" element={<><Header /><CartDrawer /><Index /><Footer /></>} />
                      <Route path="/shop" element={<><Header /><CartDrawer /><Shop /><Footer /></>} />
                      <Route path="/product/:id" element={<><Header /><CartDrawer /><ProductDetail /><Footer /></>} />
                      <Route path="/cart" element={<><Header /><CartDrawer /><Cart /><Footer /></>} />
                      <Route path="/wishlist" element={<><Header /><CartDrawer /><Wishlist /><Footer /></>} />
                      <Route path="/checkout" element={<><Header /><CartDrawer /><Checkout /><Footer /></>} />
                      <Route path="/order-confirmation" element={<><Header /><CartDrawer /><OrderConfirmation /><Footer /></>} />
                      <Route path="/login" element={<><Header /><CartDrawer /><Login /><Footer /></>} />
                      <Route path="/register" element={<><Header /><CartDrawer /><Register /><Footer /></>} />
                      <Route path="/account" element={<><Header /><CartDrawer /><Account /><Footer /></>} />
                      <Route path="/about" element={<><Header /><CartDrawer /><About /><Footer /></>} />
                      <Route path="/contact" element={<><Header /><CartDrawer /><Contact /><Footer /></>} />
                      <Route path="/faq" element={<><Header /><CartDrawer /><FAQ /><Footer /></>} />
                      <Route path="/size-guide" element={<><Header /><CartDrawer /><SizeGuide /><Footer /></>} />
                      <Route path="/shipping" element={<><Header /><CartDrawer /><ShippingInfo /><Footer /></>} />
                      <Route path="/returns" element={<><Header /><CartDrawer /><Returns /><Footer /></>} />
                      <Route path="/custom-order" element={<><Header /><CartDrawer /><CustomOrder /><Footer /></>} />
                      <Route path="/policy" element={<><Header /><CartDrawer /><Policy /><Footer /></>} />
                      <Route path="/policy/:slug" element={<><Header /><CartDrawer /><Policy /><Footer /></>} />
                      <Route path="/track-order" element={<><Header /><CartDrawer /><TrackOrder /><Footer /></>} />
                      <Route path="/privacy" element={<><Header /><CartDrawer /><Policy /><Footer /></>} />
                      <Route path="/terms" element={<><Header /><CartDrawer /><Policy /><Footer /></>} />
                      <Route path="*" element={<><Header /><CartDrawer /><NotFound /><Footer /></>} />
                    </Routes>
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
