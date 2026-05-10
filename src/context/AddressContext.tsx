import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from '@/lib/api/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  type: 'home' | 'work' | 'other';
  isDefault?: boolean;
  is_default?: boolean; // map from DB
  /** Set by Delhivery pincode check when continuing checkout */
  pincode_servicable?: boolean;
}

interface AddressContextType {
  addresses: Address[];
  selectedAddressId: string | null;
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  updateAddress: (id: string, address: Partial<Address>) => Promise<void>;
  removeAddress: (id: string) => Promise<void>;
  selectAddress: (id: string) => void;
  setDefaultAddress: (id: string) => Promise<void>;
  getSelectedAddress: () => Address | undefined;
  /** Merge server fields into a saved address (e.g. after pincode verify) without a full PUT. */
  mergeAddress: (id: string, patch: Partial<Address>) => void;
  loading: boolean;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

const STORAGE_KEY = 'Varisca_addresses';

export const AddressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch from DB if logged in, else localStorage
  useEffect(() => {
    async function loadAddresses() {
      if (isAuthenticated && user?.id) {
        setLoading(true);
        try {
          const data = await api.get<Address[]>(`/customers/${user.id}/addresses`);

          const savedGuest = localStorage.getItem(STORAGE_KEY);
          const parsedGuest: { addresses?: Address[]; selectedAddressId?: string | null } | null = savedGuest
            ? (() => {
                try {
                  return JSON.parse(savedGuest);
                } catch {
                  return null;
                }
              })()
            : null;

          const guestAddresses = (parsedGuest?.addresses || []).filter(Boolean);
          const guestSelectedId = parsedGuest?.selectedAddressId || null;

          // If customer has no addresses yet, migrate any guest-saved addresses into the account.
          // This preserves the address-details data users entered before being forced to login.
          if (data.length === 0 && guestAddresses.length > 0) {
            const created: Address[] = [];
            let selectedAfter: string | null = null;

            for (const g of guestAddresses) {
              const { id: _id, is_default: _is_default, ...rest } = g as any;
              const payload = { ...rest, is_default: !!g.isDefault };
              const newAddr = await api.post<Address>(`/customers/${user.id}/addresses`, payload);
              newAddr.isDefault = newAddr.is_default || newAddr.isDefault;
              created.push(newAddr);

              if (guestSelectedId && g.id === guestSelectedId) {
                selectedAfter = newAddr.id;
              }
            }

            localStorage.removeItem(STORAGE_KEY);

            const def = created.find(a => a.isDefault);
            setAddresses(created);
            setSelectedAddressId(selectedAfter || def?.id || created[0]?.id || null);
            toast.success('Saved address restored', { description: 'We restored your saved address after login.' });
            return;
          }

          // map is_default to isDefault for frontend usage
          const mapped = data.map(a => ({ ...a, isDefault: a.is_default || a.isDefault }));
          setAddresses(mapped);

          const def = mapped.find(a => a.isDefault);
          if (def) setSelectedAddressId(def.id);
          else if (mapped.length > 0 && !selectedAddressId) setSelectedAddressId(mapped[0].id);
        } catch (err: any) {
          console.error('Failed to load addresses:', err.message);
        } finally {
          setLoading(false);
          setIsHydrated(true);
        }
      } else {
        // Guest functionality
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setAddresses(parsed.addresses || []);
            setSelectedAddressId(parsed.selectedAddressId || null);
          } catch {
            localStorage.removeItem(STORAGE_KEY);
          }
        }
        setIsHydrated(true);
      }
    }
    loadAddresses();
  }, [isAuthenticated, user?.id]);

  // Save to localStorage ONLY IF GUEST
  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ addresses, selectedAddressId }));
    }
  }, [addresses, selectedAddressId, isHydrated, isAuthenticated]);

  const addAddress = useCallback(async (address: Omit<Address, 'id'>) => {
    if (isAuthenticated && user?.id) {
      try {
        const { isDefault, ...rest } = address;
        const payload = { ...rest, is_default: isDefault };
        const newAddr = await api.post<Address>(`/customers/${user.id}/addresses`, payload);
        newAddr.isDefault = newAddr.is_default;
        
        setAddresses(prev => {
          if (newAddr.isDefault || prev.length === 0) {
            return [...prev.map(a => ({ ...a, isDefault: false })), newAddr];
          }
          return [...prev, newAddr];
        });
        if (newAddr.isDefault || addresses.length === 0) {
          setSelectedAddressId(newAddr.id);
        }
        toast.success('Address added successfully');
        window.dispatchEvent(new Event('customers-updated'));
      } catch (err: any) {
        toast.error('Failed to add address', { description: err.message });
      }
    } else {
      // Guest
      const newAddress: Address = { ...address, id: `addr_${Date.now()}` };
      setAddresses(prev => {
        if (address.isDefault || prev.length === 0) {
          return [...prev.map(a => ({ ...a, isDefault: false })), { ...newAddress, isDefault: true }];
        }
        return [...prev, newAddress];
      });
      if (address.isDefault || addresses.length === 0) {
        setSelectedAddressId(newAddress.id);
      }
    }
  }, [isAuthenticated, user?.id, addresses.length]);

  const updateAddress = useCallback(async (id: string, updates: Partial<Address>) => {
    if (isAuthenticated && user?.id) {
      try {
        const { isDefault, ...rest } = updates;
        const payload = { ...rest, is_default: isDefault !== undefined ? isDefault : undefined };
        const updated = await api.put<Address>(`/customers/${user.id}/addresses/${id}`, payload);
        updated.isDefault = updated.is_default;
        setAddresses(prev => {
          let next = prev.map(addr => addr.id === id ? { ...addr, ...updated } : addr);
          if (updated.isDefault) {
             next = next.map(a => a.id === id ? a : { ...a, isDefault: false });
          }
          return next;
        });
        toast.success('Address updated');
        window.dispatchEvent(new Event('customers-updated'));
      } catch (err: any) {
        toast.error('Failed to update address', { description: err.message });
      }
    } else {
      setAddresses(prev => prev.map(addr => addr.id === id ? { ...addr, ...updates } : addr));
    }
  }, [isAuthenticated, user?.id]);

  const removeAddress = useCallback(async (id: string) => {
    if (isAuthenticated && user?.id) {
      try {
        await api.delete(`/customers/${user.id}/addresses/${id}`);
        setAddresses(prev => prev.filter(addr => addr.id !== id));
        if (selectedAddressId === id) setSelectedAddressId(null);
        toast.success('Address removed');
        window.dispatchEvent(new Event('customers-updated'));
      } catch (err: any) {
        toast.error('Failed to remove address', { description: err.message });
      }
    } else {
      setAddresses(prev => prev.filter(addr => addr.id !== id));
      if (selectedAddressId === id) setSelectedAddressId(null);
    }
  }, [isAuthenticated, user?.id, selectedAddressId]);

  const selectAddress = useCallback((id: string) => {
    setSelectedAddressId(id);
  }, []);

  const setDefaultAddress = useCallback(async (id: string) => {
    await updateAddress(id, { isDefault: true });
    setSelectedAddressId(id);
  }, [updateAddress]);

  const getSelectedAddress = useCallback(() => {
    return addresses.find(a => a.id === selectedAddressId);
  }, [addresses, selectedAddressId]);

  const mergeAddress = useCallback((id: string, patch: Partial<Address>) => {
    setAddresses(prev =>
      prev.map(a => {
        if (a.id !== id) return a;
        const next = { ...a, ...patch };
        if (patch.is_default !== undefined) next.isDefault = !!patch.is_default;
        return next;
      }),
    );
  }, []);

  return (
    <AddressContext.Provider value={{
      addresses,
      selectedAddressId,
      addAddress,
      updateAddress,
      removeAddress,
      selectAddress,
      setDefaultAddress,
      getSelectedAddress,
      mergeAddress,
      loading
    }}>
      {children}
    </AddressContext.Provider>
  );
};

export const useAddress = () => {
  const context = useContext(AddressContext);
  if (!context) {
    throw new Error('useAddress must be used within an AddressProvider');
  }
  return context;
};
