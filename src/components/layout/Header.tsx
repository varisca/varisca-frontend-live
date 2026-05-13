import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  ShoppingBag,
  Menu,
  X,
  User,
  Package,
  LogOut,
  Settings,
  Shirt,
  MapPin,
  Grid2X2,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const primaryNavLinks = [
  { name: 'Collections', href: '/shop' },
  { name: 'Custom Order', href: '/custom-order' },
  { name: 'About Us', href: '/about' },
];

const mobileBottomNavLinks = [
  { name: 'Collections', href: '/shop', icon: Grid2X2 },
  { name: 'Custom Order', href: '/custom-order', icon: Shirt },
];

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  const { totalItems } = useCart();
  const { totalItems: wishlistItems } = useWishlist();
  const { isAuthenticated, user, logout } = useAuth();

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    navigate('/');
  };

  const isActivePath = (href: string) =>
    location.pathname === href || (href !== '/' && location.pathname.startsWith(`${href}/`));

  return (
    <>
    <header className="sticky top-0 z-[100] bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container-custom">
        <div className="flex items-center h-16 md:h-20">
          {/* Left Section - Logo only */}
          <div className="flex items-center gap-2 flex-1">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <span className="font-display text-2xl md:text-3xl font-bold tracking-tight">
                Varisca
                {/* <span className="text-accent">.</span> */}
              </span>
            </Link>
          </div>

          {/* Center - Desktop: main links only (policies are in the footer) */}
          <nav
            className="hidden md:flex items-center justify-center flex-wrap gap-x-1 gap-y-2 max-w-[min(100%,52rem)]"
            aria-label="Main"
          >
            {primaryNavLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="nav-link text-sm font-medium uppercase tracking-wide px-3"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center justify-end gap-1 sm:gap-2 md:gap-3 flex-1">
            {/* Mobile Menu Button - Right Side */}
            <button
              className="md:hidden p-2 hover:bg-muted rounded-full transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-1 sm:gap-2 md:gap-3">
            <ThemeToggle />

            {/* Wishlist - Requires login */}
            <Link
              to={isAuthenticated ? "/wishlist" : "/login?redirect=wishlist"}
              className="p-2 hover:bg-muted rounded-full transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart size={20} />
              {wishlistItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {wishlistItems}
                </span>
              )}
            </Link>

            {/* Bag - goes to Cart page */}
            <Link
              to="/cart"
              className="p-2 hover:bg-muted rounded-full transition-colors relative"
              aria-label="Bag"
            >
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
                aria-label="Profile"
              >
                <User size={20} />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-background border border-border rounded-xl shadow-lg overflow-hidden z-50"
                  >
                    {isAuthenticated ? (
                      <>
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-border bg-muted/30">
                          <p className="font-semibold text-sm">Hello {user?.first_name || 'Customer'}</p>
                          <p className="text-xs text-muted-foreground">{user?.email}</p>
                        </div>

                        {/* Menu Items */}
                        <div className="py-1">
                          <Link
                            to="/account#orders"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                          >
                            <Package size={16} className="text-muted-foreground" />
                            Orders
                          </Link>
                          <Link
                            to="/wishlist"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                          >
                            <Heart size={16} className="text-muted-foreground" />
                            Wishlist
                          </Link>
                          <Link
                            to="/account"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                          >
                            <Settings size={16} className="text-muted-foreground" />
                            Edit Profile
                          </Link>
                        </div>

                        {/* Logout */}
                        <div className="border-t border-border py-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors w-full text-left text-destructive"
                          >
                            <LogOut size={16} />
                            Logout
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="px-4 py-3 border-b border-border bg-muted/30">
                          <p className="font-semibold text-sm">Welcome</p>
                          <p className="text-xs text-muted-foreground">Login to access your account</p>
                        </div>
                        <div className="p-3">
                          <Link
                            to="/login"
                            onClick={() => setIsProfileOpen(false)}
                            className="block w-full py-2 px-4 bg-accent text-accent-foreground rounded-lg text-center text-sm font-medium hover:bg-accent/90 transition-colors"
                          >
                            Login / Sign Up
                          </Link>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Mobile Menu Drawer - Slides from Right */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[110] md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 right-0 w-full bg-background/95 backdrop-blur-lg border-b border-border z-[120] md:hidden overflow-y-auto shadow-2xl max-h-[90vh]"
            >
            <div className="container-custom py-4 flex flex-col gap-1">
              {/* Drawer Header with Brand and Close Button */}
              <div className="flex items-center justify-between pb-4 border-b border-border mb-2">
                <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2">
                  <span className="font-display text-2xl font-bold tracking-tight">
                    Varisca<span className="text-accent">.</span>
                  </span>
                </Link>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                  aria-label="Close menu"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Track Order - Mobile only */}
              <Link
                to="/track-order"
                className="py-3 px-4 text-base font-medium hover:bg-muted rounded-lg transition-colors flex items-center gap-3"
                onClick={() => setIsMenuOpen(false)}
              >
                <MapPin size={20} />
                Track Order
              </Link>

              {primaryNavLinks
                .filter((link) => link.name === 'About Us')
                .map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="py-3 px-4 text-base font-medium hover:bg-muted rounded-lg transition-colors flex items-center gap-3"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Shirt size={20} />
                  {link.name}
                </Link>
              ))}

              {/* Bag */}
              <Link
                to="/cart"
                className="py-3 px-4 text-base font-medium hover:bg-muted rounded-lg transition-colors flex items-center gap-3 justify-between"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag size={20} />
                  Bag
                </div>
                {totalItems > 0 && (
                  <span className="bg-accent text-accent-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* Dark Mode Toggle */}
              <div className="py-3 px-4 text-base font-medium hover:bg-muted rounded-lg transition-colors flex items-center gap-3 justify-between">
                <span>Theme</span>
                <ThemeToggle />
              </div>

            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>

    <nav
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-border bg-background/95 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_30px_-18px_hsl(var(--foreground)/0.45)] backdrop-blur-md md:hidden"
      aria-label="Mobile quick navigation"
    >
      <div className="grid grid-cols-4 gap-1">
        {mobileBottomNavLinks.map((link) => {
          const Icon = link.icon;
          const isActive = isActivePath(link.href);

          return (
            <Link
              key={link.name}
              to={link.href}
              onClick={() => setIsMenuOpen(false)}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-md px-1 text-[11px] font-medium transition-colors ${
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon size={19} aria-hidden="true" />
              <span className="leading-tight text-center">{link.name}</span>
            </Link>
          );
        })}

        <Link
          to={isAuthenticated ? '/wishlist' : '/login?redirect=wishlist'}
          onClick={() => setIsMenuOpen(false)}
          className={`relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-md px-1 text-[11px] font-medium transition-colors ${
            isActivePath('/wishlist')
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <span className="relative">
            <Heart size={19} aria-hidden="true" />
            {wishlistItems > 0 && (
              <span className="absolute -right-2.5 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold leading-none text-black">
                {wishlistItems}
              </span>
            )}
          </span>
          <span className="leading-tight text-center">Wishlist</span>
        </Link>

        <Link
          to={isAuthenticated ? '/account' : '/login'}
          onClick={() => setIsMenuOpen(false)}
          className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-md px-1 text-[11px] font-medium transition-colors ${
            isActivePath('/account') || (!isAuthenticated && isActivePath('/login'))
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <User size={19} aria-hidden="true" />
          <span className="leading-tight text-center">Account</span>
        </Link>
      </div>
    </nav>
    </>
  );
};
