import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Zap, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

export const FlashSaleBanner = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ hours: 5, minutes: 32, seconds: 48 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const totalSeconds = prev.hours * 3600 + prev.minutes * 60 + prev.seconds - 1;
        
        if (totalSeconds <= 0) {
          // Reset to a new flash sale period
          return { hours: 23, minutes: 59, seconds: 59 };
        }

        return {
          hours: Math.floor(totalSeconds / 3600),
          minutes: Math.floor((totalSeconds % 3600) / 60),
          seconds: totalSeconds % 60,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="py-8 bg-gradient-to-r from-accent via-coral-light to-accent relative overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ x: ['0%', '100%'] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 opacity-20"
          style={{
            background: 'repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.1) 40px, rgba(255,255,255,0.1) 80px)',
          }}
        />
      </div>

      <div className="container-custom relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-white">
          {/* Flash Sale Icon */}
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
            className="flex items-center gap-2"
          >
            <Zap size={28} className="fill-white" />
            <span className="text-xl md:text-2xl font-display font-bold uppercase tracking-wider">
              Flash Sale
            </span>
          </motion.div>

          {/* Timer */}
          <div className="flex items-center gap-3">
            <Clock size={20} className="hidden sm:block" />
            <div className="flex items-center gap-2">
              <TimeBlock value={formatNumber(timeLeft.hours)} label="HRS" />
              <span className="text-2xl font-bold animate-pulse">:</span>
              <TimeBlock value={formatNumber(timeLeft.minutes)} label="MIN" />
              <span className="text-2xl font-bold animate-pulse">:</span>
              <TimeBlock value={formatNumber(timeLeft.seconds)} label="SEC" />
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-4 mt-2 md:mt-0">
            <span className="text-sm md:text-base font-medium">
              Up to 60% OFF
            </span>
            <Button
              asChild
              variant="secondary"
              size="sm"
              className="bg-white text-accent hover:bg-white/90 font-bold px-6 shadow-lg"
            >
              <Link to="/shop?collection=sale">Shop Now</Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

const TimeBlock = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-col items-center">
    <motion.div
      key={value}
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 min-w-[48px]"
    >
      <span className="text-xl md:text-2xl font-bold font-mono">{value}</span>
    </motion.div>
    <span className="text-[10px] font-medium mt-1 opacity-80">{label}</span>
  </div>
);
