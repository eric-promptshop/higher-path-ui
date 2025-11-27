// API utility for connecting to Railway backend

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Generic fetch wrapper with error handling
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Authenticated fetch for admin endpoints
async function authFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

  return apiFetch<T>(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

// ============ Products ============

export interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string;
  basePrice: string;
  variants: any;
  thcContent: string | null;
  cbdContent: string | null;
  imageUrl: string | null;
  inStock: boolean;
  stockQuantity: number;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function fetchProducts(): Promise<Product[]> {
  return apiFetch<Product[]>('/api/products');
}

export async function fetchProduct(id: string): Promise<Product> {
  return apiFetch<Product>(`/api/products/${id}`);
}

// ============ Authentication ============

export interface AdminUser {
  id: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  user: AdminUser;
}

export async function adminLogin(email: string, password: string): Promise<LoginResponse> {
  const response = await apiFetch<LoginResponse>('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  // Store token in localStorage
  if (typeof window !== 'undefined' && response.token) {
    localStorage.setItem('admin_token', response.token);
  }

  return response;
}

export function adminLogout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admin_token');
  }
}

export async function verifyAdminToken(): Promise<AdminUser | null> {
  try {
    return await authFetch<AdminUser>('/api/admin/me');
  } catch {
    adminLogout();
    return null;
  }
}

// Customer magic link auth
export async function requestMagicLink(
  identifier: string,
  method: 'email' | 'sms'
): Promise<{ success?: boolean; sent?: boolean; message: string }> {
  // Backend expects email/phone fields and deliveryMethod
  const body = method === 'email'
    ? { email: identifier, deliveryMethod: 'email' }
    : { phone: identifier, deliveryMethod: 'sms' };

  return apiFetch('/api/auth/magic-link', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export interface VerifyMagicLinkResponse {
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  token: string;
}

export async function verifyMagicLink(token: string): Promise<VerifyMagicLinkResponse> {
  return apiFetch('/api/auth/verify-token', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

// ============ Orders ============

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  status: string;
  subtotal: string;
  discountAmount: string;
  discountCodeId: string | null;
  taxAmount: string;
  total: string;
  paymentMethod: string;
  paymentStatus: string;
  fulfillmentDate: string | null;
  fulfillmentTimeSlot: string | null;
  notes: string | null;
  specialInstructions: string | null;
  substitutionPreference: string | null;
  deliveryAddress: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function fetchOrders(): Promise<Order[]> {
  return authFetch<Order[]>('/api/orders');
}

export async function fetchOrder(id: string): Promise<Order> {
  return authFetch<Order>(`/api/orders/${id}`);
}

export async function updateOrderStatus(id: string, status: string): Promise<Order> {
  return authFetch<Order>(`/api/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// ============ Customers ============

export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  privacyLevel: string;
  notes: string | null;
  savedCart: any;
  createdAt: string;
  updatedAt: string;
}

export async function fetchCustomers(): Promise<Customer[]> {
  return authFetch<Customer[]>('/api/customers');
}

export async function fetchCustomer(id: string): Promise<Customer> {
  return authFetch<Customer>(`/api/customers/${id}`);
}

// ============ Checkout ============

export interface CheckoutPayload {
  customerId?: string;
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  items: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
    unitPrice: number;
  }>;
  paymentMethod: string;
  deliveryAddress?: string;
  notes?: string;
  specialInstructions?: string;
  substitutionPreference?: string;
  discountCode?: string;
}

export async function submitCheckout(payload: CheckoutPayload): Promise<Order> {
  return apiFetch<Order>('/api/checkout', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ============ Admin Users ============

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  return authFetch<AdminUser[]>('/api/admin/users');
}

export async function createAdminUser(
  email: string,
  password: string,
  role: string
): Promise<AdminUser> {
  return authFetch<AdminUser>('/api/admin/users', {
    method: 'POST',
    body: JSON.stringify({ email, password, role }),
  });
}

// ============ Reports ============

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  pendingOrders: number;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  return authFetch<DashboardStats>('/api/admin/reports/dashboard');
}

// ============ Discount Codes ============

export interface DiscountCode {
  id: string;
  code: string;
  description: string | null;
  discountType: string;
  discountValue: string;
  minimumOrder: string | null;
  maxUses: number | null;
  currentUses: number;
  validFrom: string | null;
  validUntil: string | null;
  active: boolean;
  createdAt: string;
}

export async function fetchDiscountCodes(): Promise<DiscountCode[]> {
  return authFetch<DiscountCode[]>('/api/discount-codes');
}

export async function validateDiscountCode(code: string): Promise<DiscountCode> {
  return apiFetch<DiscountCode>(`/api/discount-codes/validate/${code}`);
}

// ============ Checkout Discount Validation ============

export interface DiscountValidationResult {
  valid: boolean;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  discountAmount: number;
}

export async function validateCheckoutDiscount(
  code: string,
  subtotal: number
): Promise<DiscountValidationResult> {
  return apiFetch<DiscountValidationResult>('/api/checkout/validate-discount', {
    method: 'POST',
    body: JSON.stringify({ code, subtotal }),
  });
}

// ============ Customer Portal ============

// Authenticated fetch for customer endpoints
function customerAuthFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('customer_token') : null;

  return apiFetch<T>(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

export interface OrderWithItems extends Order {
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
  }>;
}

export async function fetchCustomerOrders(): Promise<OrderWithItems[]> {
  return customerAuthFetch<OrderWithItems[]>('/api/customer/me/orders');
}

export async function fetchCustomerOrder(id: string): Promise<OrderWithItems> {
  return customerAuthFetch<OrderWithItems>(`/api/customer/me/orders/${id}`);
}
