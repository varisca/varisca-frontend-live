import { motion } from 'framer-motion';
import { Mail, Phone, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { GeneralConfig } from '@/lib/maintenance';

interface MaintenanceProps {
  config?: Pick<GeneralConfig, 'storeName' | 'storeEmail' | 'storePhone'>;
}

const Maintenance = ({
  config = {
    storeName: 'Varisca',
    storeEmail: 'varisca.team@gmail.com',
    storePhone: '+91 88668 60624',
  },
}: MaintenanceProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg text-center"
        >
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
            <Wrench className="h-10 w-10 text-accent" aria-hidden />
          </div>

          <img
            src="/Varisca light mode.svg"
            alt={config.storeName}
            className="mx-auto mb-8 h-10 w-auto dark:hidden"
          />
          <img
            src="/varisca dark mode.svg"
            alt={config.storeName}
            className="mx-auto mb-8 hidden h-10 w-auto dark:block"
          />

          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            We&apos;ll be back soon
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-8">
            {config.storeName} is undergoing scheduled maintenance to improve your
            shopping experience. Please check back shortly.
          </p>

          {/* <div className="rounded-xl border border-border/50 bg-card/80 p-6 text-left space-y-4 mb-8">
            <p className="text-sm text-muted-foreground">
              Need urgent help? Reach out and we&apos;ll get back to you as soon as we can.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={`mailto:${config.storeEmail}`}
                className="inline-flex items-center gap-2 text-sm font-medium hover:text-accent transition-colors"
              >
                <Mail className="h-4 w-4 shrink-0" />
                {config.storeEmail}
              </a>
              <a
                href={`tel:${config.storePhone.replace(/\s/g, '')}`}
                className="inline-flex items-center gap-2 text-sm font-medium hover:text-accent transition-colors"
              >
                <Phone className="h-4 w-4 shrink-0" />
                {config.storePhone}
              </a>
            </div>
          </div> */}

          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="min-w-[140px]"
          >
            Refresh page
          </Button>
        </motion.div>
      </main>

      <footer className="py-6 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} {config.storeName}. All rights reserved.
      </footer>
    </div>
  );
};

export default Maintenance;
