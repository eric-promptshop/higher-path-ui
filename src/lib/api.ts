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
  price: string;
  sku: string;
  imageUrl: string | null;
  inventory: number;
  lowStockThreshold: number;
  active: boolean;
  createdAt: string;
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
  shippingFee?: string;
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

export async function updateOrderStatus(id: string, status: string, notes?: string): Promise<Order> {
  return authFetch<Order>(`/api/admin/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, notes }),
  });
}

// ============ Admin Orders ============

export interface AdminOrdersParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface AdminOrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
}

export interface AdminOrderWithDetails extends Order {
  customerName: string;
  customerPhone: string | null;
  customerEmail: string | null;
  items: AdminOrderItem[];
  statusHistory?: Array<{
    id: string;
    status: string;
    notes: string | null;
    changedBy: string | null;
    createdAt: string;
  }>;
}

export interface AdminOrdersResponse {
  orders: AdminOrderWithDetails[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export async function fetchAdminOrders(params: AdminOrdersParams = {}): Promise<AdminOrdersResponse> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.status && params.status !== 'all') searchParams.set('status', params.status);
  if (params.search) searchParams.set('search', params.search);
  if (params.startDate) searchParams.set('startDate', params.startDate);
  if (params.endDate) searchParams.set('endDate', params.endDate);

  const query = searchParams.toString();
  return authFetch<AdminOrdersResponse>(`/api/admin/orders${query ? `?${query}` : ''}`);
}

export async function fetchAdminOrder(id: string): Promise<AdminOrderWithDetails> {
  return authFetch<AdminOrderWithDetails>(`/api/admin/orders/${id}`);
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

// ============ Admin Customers ============

export interface AdminCustomer extends Customer {
  orderCount: number;
  totalSpent: number;
  lastOrderDate: string | null;
}

export async function fetchAdminCustomers(): Promise<AdminCustomer[]> {
  return authFetch<AdminCustomer[]>('/api/admin/customers');
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

// Admin discount management
export interface CreateDiscountCodePayload {
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumOrder?: number;
  maxUses?: number;
  validFrom?: string;
  validUntil?: string;
  active?: boolean;
}

export async function createDiscountCode(payload: CreateDiscountCodePayload): Promise<DiscountCode> {
  return authFetch<DiscountCode>('/api/admin/discount-codes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateDiscountCode(id: string, payload: Partial<CreateDiscountCodePayload>): Promise<DiscountCode> {
  return authFetch<DiscountCode>(`/api/admin/discount-codes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteDiscountCode(id: string): Promise<void> {
  return authFetch<void>(`/api/admin/discount-codes/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchAdminDiscountCodes(): Promise<DiscountCode[]> {
  return authFetch<DiscountCode[]>('/api/admin/discount-codes');
}

// ============ Business Settings ============

export interface BusinessSettings {
  businessName: string;
  contactPhone: string;
  supportEmail: string;
  standardDeliveryFee: number;
  expressDeliveryFee: number;
  standardDeliveryDays: string;
  expressCutoffTime: string;
  lowStockThreshold: number;
  autoConfirmations: boolean;
  autoStatusUpdates: boolean;
  requireAddress: boolean;
  allowNotes: boolean;
  enableTipping: boolean;
  smsNewOrders: boolean;
  emailLowStock: boolean;
  emailDailySummary: boolean;
  smsSystemAlerts: boolean;
}

export async function fetchBusinessSettings(): Promise<BusinessSettings> {
  return authFetch<BusinessSettings>('/api/admin/settings');
}

export async function updateBusinessSettings(settings: Partial<BusinessSettings>): Promise<BusinessSettings> {
  return authFetch<BusinessSettings>('/api/admin/settings', {
    method: 'PATCH',
    body: JSON.stringify(settings),
  });
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

// ============ Admin Products ============

export async function fetchAdminProducts(): Promise<Product[]> {
  return authFetch<Product[]>('/api/admin/products');
}

export async function fetchAdminProduct(id: string): Promise<Product> {
  return authFetch<Product>(`/api/admin/products/${id}`);
}

export interface CreateProductPayload {
  name: string;
  description?: string;
  category: string;
  price: number;
  sku?: string;
  imageUrl?: string;
  inventory?: number;
  lowStockThreshold?: number;
  active?: boolean;
}

export async function createProduct(payload: CreateProductPayload): Promise<Product> {
  return authFetch<Product>('/api/admin/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateProduct(id: string, payload: Partial<CreateProductPayload>): Promise<Product> {
  return authFetch<Product>(`/api/admin/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteProduct(id: string): Promise<void> {
  return authFetch<void>(`/api/admin/products/${id}`, {
    method: 'DELETE',
  });
}

// ============ Inventory Adjustments ============

export interface InventoryAdjustment {
  adjustment: number;
  reason: string;
  notes?: string;
}

export interface InventoryTransaction {
  id: string;
  productId: string;
  productName: string;
  quantityChange: number;
  reason: string;
  notes: string | null;
  performedBy: string | null;
  createdAt: string;
}

export async function adjustProductInventory(
  productId: string,
  adjustment: InventoryAdjustment
): Promise<{ product: Product; transaction: InventoryTransaction }> {
  return authFetch<{ product: Product; transaction: InventoryTransaction }>(
    `/api/admin/products/${productId}/inventory`,
    {
      method: 'POST',
      body: JSON.stringify(adjustment),
    }
  );
}

export async function fetchInventoryTransactions(productId?: string): Promise<InventoryTransaction[]> {
  const endpoint = productId
    ? `/api/admin/inventory/transactions?productId=${productId}`
    : '/api/admin/inventory/transactions';
  return authFetch<InventoryTransaction[]>(endpoint);
}

// ============ Send Order Update Notification ============

export interface SendUpdateResponse {
  success: boolean;
  message: string;
  messageId?: string;
  error?: string;
}

export async function sendOrderUpdate(
  orderId: string,
  method: 'email' | 'sms'
): Promise<SendUpdateResponse> {
  return authFetch<SendUpdateResponse>(`/api/admin/orders/${orderId}/send-update`, {
    method: 'POST',
    body: JSON.stringify({ method }),
  });
}

// ============ Chef's Choice ============

export type TierType = 'dollar' | 'volume';
export type SubscriptionFrequency = 'one-time' | 'weekly' | 'biweekly' | 'monthly';
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled';

export interface ChefsChoiceTier {
  id: string;
  type: TierType;
  value: string;
  label: string;
  description: string | null;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChefsChoiceTemplateItem {
  id: string;
  templateId: string;
  productId: string;
  productName: string;
  quantity: number;
  notes: string | null;
}

export interface ChefsChoiceTemplate {
  id: string;
  tierId: string;
  name: string;
  description: string | null;
  effectiveFrom: string;
  effectiveUntil: string | null;
  active: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  items?: ChefsChoiceTemplateItem[];
  tierLabel?: string;
  tierType?: TierType;
  tierValue?: string;
  itemCount?: number;
}

export interface ChefsChoiceSubscription {
  id: string;
  customerId: string;
  tierId: string;
  frequency: SubscriptionFrequency;
  status: SubscriptionStatus;
  nextDeliveryDate: string | null;
  lastDeliveryDate: string | null;
  deliveryAddress: string | null;
  substitutionPreference: string | null;
  paymentMethod: string;
  notes: string | null;
  pausedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  // Enriched fields
  tierLabel?: string;
  tierType?: TierType;
  tierValue?: string;
  templateName?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export interface ChefsChoiceOrder {
  id: string;
  orderNumber: string;
  subscriptionId: string | null;
  customerId: string;
  templateId: string;
  tierId: string;
  status: string;
  subtotal: string;
  deliveryFee: string;
  total: string;
  deliveryAddress: string | null;
  substitutionPreference: string | null;
  paymentMethod: string;
  notes: string | null;
  fulfilledAt: string | null;
  createdAt: string;
  updatedAt: string;
  // Enriched fields
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  tierLabel?: string;
  templateName?: string;
}

// Public endpoints (no auth required)
export async function fetchChefsChoiceTiers(): Promise<ChefsChoiceTier[]> {
  return apiFetch<ChefsChoiceTier[]>('/api/chefs-choice/tiers');
}

export async function fetchChefsChoiceTierTemplate(tierId: string): Promise<ChefsChoiceTemplate> {
  return apiFetch<ChefsChoiceTemplate>(`/api/chefs-choice/tiers/${tierId}/template`);
}

// Customer endpoints (requires customer auth)
export async function fetchCustomerChefsChoiceSubscriptions(): Promise<ChefsChoiceSubscription[]> {
  return customerAuthFetch<ChefsChoiceSubscription[]>('/api/customer/chefs-choice/subscriptions');
}

export interface CreateSubscriptionPayload {
  tierId: string;
  frequency: SubscriptionFrequency;
  deliveryAddress?: string;
  substitutionPreference?: string;
  paymentMethod?: string;
  notes?: string;
}

export async function createChefsChoiceSubscription(payload: CreateSubscriptionPayload): Promise<ChefsChoiceSubscription> {
  return customerAuthFetch<ChefsChoiceSubscription>('/api/customer/chefs-choice/subscriptions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function pauseChefsChoiceSubscription(id: string): Promise<ChefsChoiceSubscription> {
  return customerAuthFetch<ChefsChoiceSubscription>(`/api/customer/chefs-choice/subscriptions/${id}/pause`, {
    method: 'PATCH',
  });
}

export async function resumeChefsChoiceSubscription(id: string): Promise<ChefsChoiceSubscription> {
  return customerAuthFetch<ChefsChoiceSubscription>(`/api/customer/chefs-choice/subscriptions/${id}/resume`, {
    method: 'PATCH',
  });
}

export async function cancelChefsChoiceSubscription(id: string): Promise<{ success: boolean }> {
  return customerAuthFetch<{ success: boolean }>(`/api/customer/chefs-choice/subscriptions/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchCustomerChefsChoiceOrders(): Promise<ChefsChoiceOrder[]> {
  return customerAuthFetch<ChefsChoiceOrder[]>('/api/customer/chefs-choice/orders');
}

// Admin endpoints (requires admin auth)
export async function fetchAdminChefsChoiceTiers(): Promise<ChefsChoiceTier[]> {
  return authFetch<ChefsChoiceTier[]>('/api/admin/chefs-choice/tiers');
}

export interface CreateTierPayload {
  type: TierType;
  value: number;
  label: string;
  description?: string;
  active?: boolean;
  sortOrder?: number;
}

export async function createChefsChoiceTier(payload: CreateTierPayload): Promise<ChefsChoiceTier> {
  return authFetch<ChefsChoiceTier>('/api/admin/chefs-choice/tiers', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateChefsChoiceTier(id: string, payload: Partial<CreateTierPayload>): Promise<ChefsChoiceTier> {
  return authFetch<ChefsChoiceTier>(`/api/admin/chefs-choice/tiers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteChefsChoiceTier(id: string): Promise<{ success: boolean }> {
  return authFetch<{ success: boolean }>(`/api/admin/chefs-choice/tiers/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchAdminChefsChoiceTemplates(): Promise<ChefsChoiceTemplate[]> {
  return authFetch<ChefsChoiceTemplate[]>('/api/admin/chefs-choice/templates');
}

export async function fetchAdminChefsChoiceTemplate(id: string): Promise<ChefsChoiceTemplate> {
  return authFetch<ChefsChoiceTemplate>(`/api/admin/chefs-choice/templates/${id}`);
}

export interface CreateTemplatePayload {
  tierId: string;
  name: string;
  description?: string;
  effectiveFrom: string;
  effectiveUntil?: string;
  active?: boolean;
  items?: Array<{
    productId: string;
    productName: string;
    quantity: number;
    notes?: string;
  }>;
}

export async function createChefsChoiceTemplate(payload: CreateTemplatePayload): Promise<ChefsChoiceTemplate> {
  return authFetch<ChefsChoiceTemplate>('/api/admin/chefs-choice/templates', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateChefsChoiceTemplate(id: string, payload: Partial<CreateTemplatePayload>): Promise<ChefsChoiceTemplate> {
  return authFetch<ChefsChoiceTemplate>(`/api/admin/chefs-choice/templates/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteChefsChoiceTemplate(id: string): Promise<{ success: boolean }> {
  return authFetch<{ success: boolean }>(`/api/admin/chefs-choice/templates/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchAdminChefsChoiceSubscriptions(): Promise<ChefsChoiceSubscription[]> {
  return authFetch<ChefsChoiceSubscription[]>('/api/admin/chefs-choice/subscriptions');
}

export async function updateAdminChefsChoiceSubscription(
  id: string,
  payload: { status?: SubscriptionStatus; nextDeliveryDate?: string; notes?: string }
): Promise<ChefsChoiceSubscription> {
  return authFetch<ChefsChoiceSubscription>(`/api/admin/chefs-choice/subscriptions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function fetchAdminChefsChoiceOrders(): Promise<ChefsChoiceOrder[]> {
  return authFetch<ChefsChoiceOrder[]>('/api/admin/chefs-choice/orders');
}

export async function updateChefsChoiceOrderStatus(id: string, status: string): Promise<ChefsChoiceOrder> {
  return authFetch<ChefsChoiceOrder>(`/api/admin/chefs-choice/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
