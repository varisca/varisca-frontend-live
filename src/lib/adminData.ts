// ─── Mock Data for Admin Panel ──────────────────────────────────────

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

// Re-export Product type from shared data
export type { Product } from './data';

export interface Order {
  id: string;
  orderNumber: string;
  customer: { name: string; email: string; avatar?: string };
  date: string;
  status: OrderStatus;
  total: number;
  items: { name: string; qty: number; price: number; image?: string }[];
  shippingAddress: string;
  paymentMethod: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  ordersCount: number;
  totalSpent: number;
  joinedDate: string;
  lastOrderDate: string;
  address: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'order' | 'stock' | 'customer' | 'system';
}

// ─── Stat Cards ─────────────────────────────────────────────────────

export const dashboardStats = [
  { title: 'Total Revenue', value: '₹12,45,890', change: '+12.5%', trend: 'up' as const, icon: 'indian-rupee' },
  { title: 'Orders Today', value: '48', change: '+8.2%', trend: 'up' as const, icon: 'shopping-bag' },
  { title: 'Active Customers', value: '2,340', change: '+4.1%', trend: 'up' as const, icon: 'users' },
  { title: 'Conversion Rate', value: '3.24%', change: '-0.4%', trend: 'down' as const, icon: 'trending-up' },
];

// ─── Chart Data ─────────────────────────────────────────────────────

export const revenueChartData = [
  { date: 'Jan 1', revenue: 42000, orders: 18 },
  { date: 'Jan 5', revenue: 38000, orders: 15 },
  { date: 'Jan 10', revenue: 55000, orders: 24 },
  { date: 'Jan 15', revenue: 47000, orders: 20 },
  { date: 'Jan 20', revenue: 63000, orders: 28 },
  { date: 'Jan 25', revenue: 58000, orders: 25 },
  { date: 'Feb 1', revenue: 72000, orders: 32 },
  { date: 'Feb 5', revenue: 68000, orders: 30 },
  { date: 'Feb 10', revenue: 85000, orders: 38 },
  { date: 'Feb 15', revenue: 79000, orders: 35 },
  { date: 'Feb 20', revenue: 92000, orders: 42 },
  { date: 'Feb 22', revenue: 88000, orders: 40 },
];

export const orderStatusChartData = [
  { status: 'Pending', count: 24, fill: 'hsl(45 93% 47%)' },
  { status: 'Processing', count: 18, fill: 'hsl(217 91% 60%)' },
  { status: 'Shipped', count: 32, fill: 'hsl(271 81% 56%)' },
  { status: 'Delivered', count: 86, fill: 'hsl(142 71% 45%)' },
  { status: 'Cancelled', count: 8, fill: 'hsl(0 84% 60%)' },
];

export const categoryChartData = [
  { name: 'Sarees', value: 35, fill: 'hsl(16 90% 55%)' },
  { name: 'Lehengas', value: 25, fill: 'hsl(217 91% 60%)' },
  { name: 'Suits', value: 20, fill: 'hsl(142 71% 45%)' },
  { name: 'Dupattas', value: 12, fill: 'hsl(271 81% 56%)' },
  { name: 'Accessories', value: 8, fill: 'hsl(45 93% 47%)' },
];

export const customerGrowthData = [
  { month: 'Aug', customers: 1200 },
  { month: 'Sep', customers: 1380 },
  { month: 'Oct', customers: 1520 },
  { month: 'Nov', customers: 1750 },
  { month: 'Dec', customers: 1980 },
  { month: 'Jan', customers: 2180 },
  { month: 'Feb', customers: 2340 },
];

// ─── Orders ─────────────────────────────────────────────────────────

export const mockOrders: Order[] = [
  {
    id: 'ord-001', orderNumber: 'VRN-2024-001',
    customer: { name: 'Priya Sharma', email: 'priya@email.com' },
    date: '2026-02-22', status: 'delivered', total: 12500,
    items: [{ name: 'Banarasi Silk Saree', qty: 1, price: 12500 }],
    shippingAddress: '42 MG Road, Mumbai, Maharashtra 400001',
    paymentMethod: 'UPI',
  },
  {
    id: 'ord-002', orderNumber: 'VRN-2024-002',
    customer: { name: 'Anita Desai', email: 'anita@email.com' },
    date: '2026-02-22', status: 'processing', total: 8750,
    items: [{ name: 'Chanderi Cotton Saree', qty: 1, price: 4500 }, { name: 'Silk Dupatta', qty: 1, price: 4250 }],
    shippingAddress: '15 Park Street, Kolkata, West Bengal 700016',
    paymentMethod: 'Credit Card',
  },
  {
    id: 'ord-003', orderNumber: 'VRN-2024-003',
    customer: { name: 'Meera Patel', email: 'meera@email.com' },
    date: '2026-02-21', status: 'shipped', total: 22000,
    items: [{ name: 'Bridal Lehenga Set', qty: 1, price: 22000 }],
    shippingAddress: '88 CG Road, Ahmedabad, Gujarat 380009',
    paymentMethod: 'Net Banking',
  },
  {
    id: 'ord-004', orderNumber: 'VRN-2024-004',
    customer: { name: 'Divya Nair', email: 'divya@email.com' },
    date: '2026-02-21', status: 'pending', total: 6800,
    items: [{ name: 'Kanchipuram Silk Saree', qty: 1, price: 6800 }],
    shippingAddress: '23 Anna Salai, Chennai, Tamil Nadu 600002',
    paymentMethod: 'UPI',
  },
  {
    id: 'ord-005', orderNumber: 'VRN-2024-005',
    customer: { name: 'Ritu Kapoor', email: 'ritu@email.com' },
    date: '2026-02-20', status: 'delivered', total: 15200,
    items: [{ name: 'Anarkali Suit Set', qty: 1, price: 8200 }, { name: 'Embroidered Dupatta', qty: 1, price: 7000 }],
    shippingAddress: '67 Sector 18, Noida, Uttar Pradesh 201301',
    paymentMethod: 'Credit Card',
  },
  {
    id: 'ord-006', orderNumber: 'VRN-2024-006',
    customer: { name: 'Sunita Reddy', email: 'sunita@email.com' },
    date: '2026-02-20', status: 'cancelled', total: 9400,
    items: [{ name: 'Georgette Saree', qty: 1, price: 9400 }],
    shippingAddress: '12 Banjara Hills, Hyderabad, Telangana 500034',
    paymentMethod: 'Debit Card',
  },
  {
    id: 'ord-007', orderNumber: 'VRN-2024-007',
    customer: { name: 'Kavita Singh', email: 'kavita@email.com' },
    date: '2026-02-19', status: 'delivered', total: 18600,
    items: [{ name: 'Designer Lehenga', qty: 1, price: 18600 }],
    shippingAddress: '45 MI Road, Jaipur, Rajasthan 302001',
    paymentMethod: 'UPI',
  },
  {
    id: 'ord-008', orderNumber: 'VRN-2024-008',
    customer: { name: 'Neha Gupta', email: 'neha@email.com' },
    date: '2026-02-19', status: 'processing', total: 5600,
    items: [{ name: 'Cotton Kurti Set', qty: 2, price: 2800 }],
    shippingAddress: '89 Civil Lines, Lucknow, Uttar Pradesh 226001',
    paymentMethod: 'Cash on Delivery',
  },
  {
    id: 'ord-009', orderNumber: 'VRN-2024-009',
    customer: { name: 'Lakshmi Iyer', email: 'lakshmi@email.com' },
    date: '2026-02-18', status: 'shipped', total: 11200,
    items: [{ name: 'Tussar Silk Saree', qty: 1, price: 11200 }],
    shippingAddress: '34 Koramangala, Bangalore, Karnataka 560034',
    paymentMethod: 'Credit Card',
  },
  {
    id: 'ord-010', orderNumber: 'VRN-2024-010',
    customer: { name: 'Pooja Mehta', email: 'pooja@email.com' },
    date: '2026-02-18', status: 'refunded', total: 7300,
    items: [{ name: 'Chiffon Saree', qty: 1, price: 7300 }],
    shippingAddress: '56 SG Highway, Ahmedabad, Gujarat 380054',
    paymentMethod: 'Net Banking',
  },
];

// ─── Customers ──────────────────────────────────────────────────────

export const mockCustomers: Customer[] = [
  { id: 'cust-001', name: 'Priya Sharma', email: 'priya@email.com', phone: '+91 98765 43210', ordersCount: 12, totalSpent: 145000, joinedDate: '2025-06-15', lastOrderDate: '2026-02-22', address: '42 MG Road, Mumbai' },
  { id: 'cust-002', name: 'Anita Desai', email: 'anita@email.com', phone: '+91 87654 32109', ordersCount: 8, totalSpent: 86500, joinedDate: '2025-07-20', lastOrderDate: '2026-02-22', address: '15 Park Street, Kolkata' },
  { id: 'cust-003', name: 'Meera Patel', email: 'meera@email.com', phone: '+91 76543 21098', ordersCount: 5, totalSpent: 62000, joinedDate: '2025-08-10', lastOrderDate: '2026-02-21', address: '88 CG Road, Ahmedabad' },
  { id: 'cust-004', name: 'Divya Nair', email: 'divya@email.com', phone: '+91 65432 10987', ordersCount: 15, totalSpent: 198000, joinedDate: '2025-04-01', lastOrderDate: '2026-02-21', address: '23 Anna Salai, Chennai' },
  { id: 'cust-005', name: 'Ritu Kapoor', email: 'ritu@email.com', phone: '+91 54321 09876', ordersCount: 3, totalSpent: 34200, joinedDate: '2025-10-05', lastOrderDate: '2026-02-20', address: '67 Sector 18, Noida' },
  { id: 'cust-006', name: 'Sunita Reddy', email: 'sunita@email.com', phone: '+91 43210 98765', ordersCount: 7, totalSpent: 78900, joinedDate: '2025-05-18', lastOrderDate: '2026-02-20', address: '12 Banjara Hills, Hyderabad' },
  { id: 'cust-007', name: 'Kavita Singh', email: 'kavita@email.com', phone: '+91 32109 87654', ordersCount: 20, totalSpent: 256000, joinedDate: '2025-03-12', lastOrderDate: '2026-02-19', address: '45 MI Road, Jaipur' },
  { id: 'cust-008', name: 'Neha Gupta', email: 'neha@email.com', phone: '+91 21098 76543', ordersCount: 4, totalSpent: 28400, joinedDate: '2025-09-22', lastOrderDate: '2026-02-19', address: '89 Civil Lines, Lucknow' },
];

// ─── Notifications ──────────────────────────────────────────────────

export const mockNotifications: Notification[] = [
  { id: 'n1', title: 'New Order', message: 'Order VRN-2024-004 received from Divya Nair', time: '2 min ago', read: false, type: 'order' },
  { id: 'n2', title: 'Low Stock Alert', message: 'Embroidered Clutch - Gold has only 3 units left', time: '15 min ago', read: false, type: 'stock' },
  { id: 'n3', title: 'New Customer', message: 'Asha Verma created an account', time: '1 hour ago', read: false, type: 'customer' },
  { id: 'n4', title: 'Order Delivered', message: 'Order VRN-2024-001 delivered to Priya Sharma', time: '3 hours ago', read: true, type: 'order' },
  { id: 'n5', title: 'System Update', message: 'Payment gateway updated successfully', time: '5 hours ago', read: true, type: 'system' },
];

// ─── Top Products (reads from localStorage store) ───────────────────

import { getAllProducts } from './productStore';

export const getTopProducts = () => {
  return getAllProducts()
    .filter((p) => !p.status || p.status === 'active')
    .sort((a, b) => (b.reviews || 0) - (a.reviews || 0))
    .slice(0, 5);
};

// Keep for backward compat — but now dynamic
export const topProducts = getTopProducts();

// ─── Recent Activity ────────────────────────────────────────────────

export const recentActivity = [
  { id: 'a1', action: 'Order VRN-2024-004 placed', user: 'Divya Nair', time: '2 min ago', type: 'order' as const },
  { id: 'a2', action: 'Product "Silk Dupatta" stock updated', user: 'Admin', time: '30 min ago', type: 'product' as const },
  { id: 'a3', action: 'Order VRN-2024-001 marked as delivered', user: 'Admin', time: '1 hour ago', type: 'order' as const },
  { id: 'a4', action: 'New customer Asha Verma registered', user: 'System', time: '2 hours ago', type: 'customer' as const },
  { id: 'a5', action: 'Refund processed for Order VRN-2024-010', user: 'Admin', time: '4 hours ago', type: 'refund' as const },
];
