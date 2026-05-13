import { Link } from 'react-router-dom';
import { Instagram, Facebook } from 'lucide-react';
import { POLICIES } from '@/lib/policyConfig';

const footerLinks = {
  shop: [
    { name: 'Men', href: '/shop?category=men' },
    { name: 'Women', href: '/shop?category=women' },
  ],
  help: [
    { name: 'Shipping Info', href: '/shipping' },
    { name: 'Returns & Exchanges', href: '/returns' },
    { name: 'Size Guide', href: '/size-guide' },
    { name: 'FAQ', href: '/faq' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Contact Us', href: '/contact' },
  ],
  policies: [{ name: 'All policies', href: '/policy' }, ...POLICIES.map((p) => ({ name: p.name, href: `/policy/${p.slug}` }))],
};

const XIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const socialLinks = [
  { icon: Instagram, href: 'https://www.instagram.com/_varisca_?igsh=MXRtYzJwYm43ZmFyNg==', label: 'Instagram' },
  { icon: XIcon, href: 'https://x.com/_varisca_', label: 'X' },
  { icon: Facebook, href: 'https://www.facebook.com/share/1Gx7i2NsS9/', label: 'Facebook' },
];

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Links Section */}
      <div className="container-custom py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-2 flex flex-col items-center text-center">
            <Link to="/" className="inline-flex mb-4 justify-center" aria-label="Varisca home">
              <img
                src="/varisca%20dark%20mode.svg"
                alt="Varisca"
                className="h-36 w-36 object-contain sm:h-40 sm:w-40 dark:hidden"
              />
              <img
                src="/Varisca%20light%20mode.svg"
                alt="Varisca"
                className="hidden h-36 w-36 object-contain sm:h-40 sm:w-40 dark:block"
              />
            </Link>
            <p className="text-primary-foreground/70 mb-6 max-w-sm">
              Mastered in the Mill. Tailored for You.
            </p>
            <div className="flex gap-4 justify-center">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent transition-colors"
                  aria-label={label}
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Shop</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map(link => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Help</h4>
            <ul className="space-y-3">
              {footerLinks.help.map(link => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map(link => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies — each legal page */}
          <div className="sm:col-span-2 md:col-span-1">
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Policies</h4>
            <ul className="space-y-3">
              {footerLinks.policies.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/60">
            <p>© 2026 Varisca. All rights reserved.</p>
            <div className="flex flex-wrap gap-6 justify-center md:justify-end">
              <Link to="/policy/privacy" className="hover:text-primary-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-primary-foreground transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
