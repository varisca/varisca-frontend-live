import { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, Filter, Download, Eye, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Checkbox } from '@/components/ui/checkbox';
import { getOrders, updateOrderStatus, updateOrderPaymentStatus, type Order, type OrderStatus } from '@/lib/orderStore';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/data';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 8;

  // Load orders from store
  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getOrders();
      const data = Array.isArray(res) ? res : (res as any)?.data || [];
      setOrders(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load orders. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    const handler = () => loadOrders();
    window.addEventListener('orders-updated', handler);
    return () => window.removeEventListener('orders-updated', handler);
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        (order.order_number || '').toLowerCase().includes(search.toLowerCase()) ||
        (order.customer_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (order.customer_email || '').toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const totalPages = Math.ceil(filteredOrders.length / perPage);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * perPage, currentPage * perPage);

  const toggleSelect = (id: string) => {
    setSelectedOrders((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedOrders.size === paginatedOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(paginatedOrders.map((o) => o.id)));
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const updated = await updateOrderStatus(orderId, newStatus);
      if (updated) {
        toast.success('Status Updated', { description: `Order ${updated.order_number || orderId} → ${newStatus}` });
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(updated);
        }
        loadOrders();
      }
    } catch { toast.error('Failed to update status'); }
  };

  const handlePaymentUpdate = async (orderId: string, paymentStatus: string) => {
    try {
      const updated = await updateOrderPaymentStatus(orderId, paymentStatus);
      if (updated) {
        toast.success('Payment Status Updated', { description: `Order ${updated.order_number || orderId} → ${paymentStatus}` });
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(updated);
        }
        loadOrders();
      }
    } catch { toast.error('Failed to update payment status'); }
  };

  const handleBulkAction = async (action: 'shipped' | 'cancelled') => {
    try {
      await Promise.all([...selectedOrders].map(id => updateOrderStatus(id, action)));
      toast.success(`${selectedOrders.size} orders marked as ${action}`);
      setSelectedOrders(new Set());
      loadOrders();
    } catch { toast.error('Failed to update orders'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">{orders.length} total orders</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="pl-9 h-9 bg-muted/30 border-border/50"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
          <SelectTrigger className="w-[160px] h-9 bg-muted/30 border-border/50">
            <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk actions */}
      {selectedOrders.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-accent/30 bg-accent/5 px-4 py-2.5">
          <span className="text-sm font-medium">{selectedOrders.size} selected</span>
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleBulkAction('shipped')}>
            Mark Shipped
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-xs text-red-500 hover:text-red-600" onClick={() => handleBulkAction('cancelled')}>
            Cancel Orders
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Eye className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No orders yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Orders placed by customers will appear here in real time.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30">
                    <th className="px-4 py-3 text-left">
                      <Checkbox
                        checked={paginatedOrders.length > 0 && selectedOrders.size === paginatedOrders.length}
                        onCheckedChange={toggleSelectAll}
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Order #</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Payment</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Payment Status</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((order) => (
                    <tr key={order.id} className="border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3.5">
                        <Checkbox checked={selectedOrders.has(order.id)} onCheckedChange={() => toggleSelect(order.id)} />
                      </td>
                      <td className="px-4 py-3.5 text-sm font-semibold">{order.order_number}</td>
                      <td className="px-4 py-3.5">
                        <div>
                          <p className="text-sm font-medium">{order.customer_name}</p>
                          <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-muted-foreground">{new Date(order.created_at || '').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3.5 text-sm font-semibold text-right">{formatPrice(order.total)}</td>
                      <td className="px-4 py-3.5 text-sm text-muted-foreground">{order.payment_method}</td>
                      <td className="px-4 py-3.5">
                        <span className={order.payment_status === 'paid' ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>
                          {order.payment_status === 'paid' ? 'Paid' : (order.payment_status || 'Pending')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setSelectedOrder(order)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-border/50">
                <span className="text-xs text-muted-foreground">
                  Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filteredOrders.length)} of {filteredOrders.length}
                </span>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`h-8 w-8 rounded-md text-xs font-medium transition-colors ${
                        currentPage === i + 1
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted/50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Order Detail Sheet */}
      <Sheet open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedOrder && (
            <>
              <SheetHeader>
                <SheetTitle>Order {selectedOrder.order_number}</SheetTitle>
                <SheetDescription>Placed on {new Date(selectedOrder.created_at || '').toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <StatusBadge status={selectedOrder.status} />
                </div>

                {/* Status Update */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Update Status</label>
                  <Select value={selectedOrder.status} onValueChange={(v) => handleStatusUpdate(selectedOrder.id, v as OrderStatus)}>
                    <SelectTrigger className="h-9 bg-muted/30 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />

                {/* Customer */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Customer</h4>
                  <p className="text-sm">{selectedOrder.customer_name}</p>
                  <p className="text-xs text-muted-foreground">{selectedOrder.customer_email}</p>
                  {selectedOrder.customer_phone && (
                    <p className="text-xs text-muted-foreground">{selectedOrder.customer_phone}</p>
                  )}
                </div>
                <Separator />

                {/* Items */}
                <div>
                  <h4 className="text-sm font-semibold mb-3">Items ({(selectedOrder.items || []).length})</h4>
                  <div className="space-y-3">
                    {(selectedOrder.items || []).map((item, idx) => (
                      <div key={idx} className="flex gap-3 items-center">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-12 h-12 rounded-md object-cover border border-border/30" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.size && `Size: ${item.size}`}{item.size && item.color ? ' · ' : ''}{item.color && `Color: ${item.color}`} · Qty: {item.qty}
                          </p>
                        </div>
                        <span className="text-sm font-semibold">{formatPrice(item.price * item.qty)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />

                {/* Shipping */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Shipping Address</h4>
                  <p className="text-sm text-muted-foreground">{selectedOrder.shipping_address || 'Not provided'}</p>
                </div>

                {/* Payment */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Payment Method</h4>
                    <p className="text-sm text-muted-foreground">{selectedOrder.payment_method}</p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <h4 className="text-sm font-semibold mb-1">Payment Status</h4>
                    <p className="text-sm mb-1">
                      <span className={selectedOrder.payment_status === 'paid' ? 'text-green-600 font-bold' : 'text-yellow-600 font-bold'}>
                        {selectedOrder.payment_status?.toUpperCase() || 'PENDING'}
                      </span>
                    </p>
                    {selectedOrder.payment_status !== 'paid' && (
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handlePaymentUpdate(selectedOrder.id, 'paid')}>
                        Mark Received
                      </Button>
                    )}
                  </div>
                </div>
                <Separator />

                {/* Total */}
                <div className="flex justify-between items-center rounded-lg bg-muted/50 px-4 py-3">
                  <span className="text-sm font-semibold">Total</span>
                  <span className="text-lg font-bold">{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminOrders;
