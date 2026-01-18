export interface Supplier {
  id?: number;
  society: string;
  address: string;
  socialReason: string;
  contactAgent: string;
  email: string;
  phone: string;
  city: string;
  ice: string;
}

export interface SupplierSearchParams {
  query?: string;
  page?: number;
  size?: number;
}
