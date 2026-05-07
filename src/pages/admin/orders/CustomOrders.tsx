import { useEffect, useState } from 'react';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Download, Shirt } from 'lucide-react';
import { exportToCsv } from '@/lib/admin/utils/export';
import { api } from '@/lib/api/client';
import { getCustomOrders, updateCustomOrder, type CustomOrderRecord } from '@/lib/customOrderStore';
import { addOrder, type Order } from '@/lib/orderStore';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const CustomOrders = () => {
  const [orders, setOrders] = useState<CustomOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<CustomOrderRecord | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const load = async (): Promise<CustomOrderRecord[]> => {
    setLoading(true);
    try {
      const r = await api.get<{ data: CustomOrderRecord[] }>('/custom-orders');
      const list = Array.isArray(r.data) ? r.data : [];
      setOrders(list);
      return list;
    } catch {
      const fallback = getCustomOrders();
      setOrders(fallback);
      return fallback;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const handler = () => {
      load();
    };
    window.addEventListener('custom-orders-updated', handler);
    return () => window.removeEventListener('custom-orders-updated', handler);
  }, []);

  const columns: Column<CustomOrderRecord>[] = [
    {
      key: 'createdAt',
      header: 'Date',
      render: (r) =>
        new Date(r.createdAt).toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (r) => (
        <div className="flex flex-col">
          <span className="font-medium text-sm">{r.customer.name}</span>
          <span className="text-xs text-muted-foreground">{r.customer.phone}</span>
        </div>
      ),
    },
    {
      key: 'productType',
      header: 'Product',
      render: (r) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{r.productType}</span>
          <span className="text-xs text-muted-foreground">{r.variety}</span>
        </div>
      ),
    },
    {
      key: 'color',
      header: 'Color',
    },
    {
      key: 'lines',
      header: 'Sizes',
      render: (r) => (
        <span className="text-xs">
          {r.lines.map((l) => `${l.size}(${l.quantity})`).join(', ')}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => {
        const base = 'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium';
        const color =
          r.status === 'confirmed'
            ? 'bg-green-500/10 text-green-600'
            : r.status === 'cancelled'
            ? 'bg-red-500/10 text-red-600'
            : 'bg-amber-500/10 text-amber-600';
        const label =
          r.status === 'confirmed'
            ? 'Confirmed'
            : r.status === 'cancelled'
            ? 'Cancelled'
            : 'Awaiting confirmation';
        return <span className={`${base} ${color}`}>{label}</span>;
      },
    },
    {
      key: 'total',
      header: 'Total',
      render: (r) => <span className="font-semibold">₹{r.total.toFixed(2)}</span>,
    },
  ];

  const handleStatusChange = async (order: CustomOrderRecord, nextStatus: CustomOrderRecord['status']) => {
    if (order.status === nextStatus) return;
    setUpdatingStatusId(order.id);
    try {
      let backendOrderId = order.backendOrderId;
      let backendOrderNumber = order.backendOrderNumber;

      // When confirming for the first time, create a real order in the main orders API
      if (nextStatus === 'confirmed' && !backendOrderId) {
        const shippingAddress = `${order.customer.name}, ${order.customer.address}, ${order.customer.city}, ${order.customer.state} - ${order.customer.pincode}`;

        const items: Order['items'] = order.lines.map((line) => ({
          name: `${order.productType} - ${order.variety} (${order.color})`,
          qty: line.quantity,
          price: order.unitPrice,
          size: line.size,
          color: order.color,
        }));

        const created = await addOrder({
          customer_name: order.customer.name,
          customer_email: order.customer.email || '',
          customer_phone: order.customer.phone,
          status: 'pending',
          subtotal: order.itemsTotal,
          discount: 0,
          shipping_cost: order.shipping,
          tax: 0,
          total: order.total,
          shipping_address: shippingAddress,
          payment_method: 'custom-order',
          items,
          notes: order.notes,
        });

        backendOrderId = created.id;
        backendOrderNumber = created.order_number;

        // Let other admin views (and possibly customer views) refresh orders
        window.dispatchEvent(new Event('orders-updated'));
      }

      if (UUID_REGEX.test(order.id)) {
        await api.patch(`/custom-orders/${order.id}/status`, {
          status: nextStatus,
          ...(backendOrderId
            ? { backend_order_id: backendOrderId, backend_order_number: backendOrderNumber }
            : {}),
        });
      } else {
        updateCustomOrder(order.id, {
          status: nextStatus,
          backendOrderId,
          backendOrderNumber,
        });
      }

      toast.success('Custom order updated', {
        description:
          nextStatus === 'confirmed'
            ? 'Order confirmed and created in Orders.'
            : `Status changed to ${nextStatus}.`,
      });

      const updatedList = await load();
      if (selected) {
        setSelected(updatedList.find((o) => o.id === selected.id) || null);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update custom order');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Shirt className="h-5 w-5" /> Custom Orders
          </h1>
          <p className="text-muted-foreground text-sm">
            All custom t-shirt orders placed via the Custom Order flow.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() =>
            exportToCsv(
              orders.map((o) => ({
                Date: new Date(o.createdAt).toISOString(),
                Name: o.customer.name,
                Phone: o.customer.phone,
                City: o.customer.city,
                Product: o.productType,
                Variety: o.variety,
                Color: o.color,
                PrintType: o.printType,
                Positions: o.printPositions.join(', '),
                Sizes: o.lines.map((l) => `${l.size}(${l.quantity})`).join(', '),
                Total: o.total,
              })),
              'custom-orders'
            )
          }
          className="gap-2"
        >
          <Download className="h-4 w-4" /> Export
        </Button>
      </div>

      <div className="rounded-md border p-4">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <DataTable
            data={orders}
            columns={columns}
            searchPlaceholder="Search custom orders..."
            searchFields={['customer.name', 'customer.phone', 'productType', 'variety']}
            emptyMessage="No custom orders yet"
            emptyIcon={<Shirt className="h-10 w-10" />}
            onRowClick={(row) => {
              setSelected(row);
              setDetailOpen(true);
            }}
          />
        )}
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>Custom Order Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2 text-sm">
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground">Status</p>
                  <div className="flex items-center gap-2">
                    <select
                      className="h-8 rounded-md border border-border bg-background px-2 text-xs"
                      value={selected.status}
                      onChange={(e) =>
                        handleStatusChange(selected, e.target.value as CustomOrderRecord['status'])
                      }
                      disabled={updatingStatusId === selected.id}
                    >
                      <option value="awaiting_confirmation">Awaiting confirmation</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground">Customer</p>
                    <p className="font-medium">{selected.customer.name}</p>
                    <p className="text-xs text-muted-foreground">{selected.customer.phone}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Placed</p>
                    <p className="font-medium">
                      {new Date(selected.createdAt).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Shipping address</p>
                    <p>
                      {selected.customer.address}, {selected.customer.city},{' '}
                      {selected.customer.state} - {selected.customer.pincode}
                    </p>
                  </div>
                </div>

                <div className="border-t border-border pt-3 space-y-2">
                  <p className="font-semibold">Product</p>
                  <p>
                    {selected.productType} � {selected.variety}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Print: {selected.printType || '-'} | Positions:{' '}
                    {selected.printPositions.join(', ') || '-'}
                  </p>
                  <p className="text-sm text-muted-foreground">Color: {selected.color}</p>
                </div>

                <div className="border-t border-border pt-3 space-y-2">
                  <p className="font-semibold">Sizes & quantities</p>
                  <ul className="space-y-1 text-sm">
                    {selected.lines.map((l) => (
                      <li key={l.size} className="flex justify-between">
                        <span>Size {l.size}</span>
                        <span>Qty: {l.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-border pt-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Unit price</span>
                    <span className="font-medium">?{selected.unitPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Items total</span>
                    <span className="font-semibold">?{selected.itemsTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-semibold">?{selected.shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-border">
                    <span className="font-semibold">Estimated total</span>
                    <span className="text-lg font-bold">?{selected.total.toFixed(2)}</span>
                  </div>
                </div>

                {selected.notes && (
                  <div className="border-t border-border pt-3 text-sm">
                    <p className="font-semibold mb-1">Customer notes</p>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {selected.notes}
                    </p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDetailOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomOrders;
