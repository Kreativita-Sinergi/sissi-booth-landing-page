/** Bentuk data API fotobox-service (docs/api.md §7) yang dipakai dashboard. */

export type Point = { date: string; revenue: number; transactions: number };
export type Group = { key: string; label: string; transactions: number; revenue: number };

export type Totals = { transactions: number; abandoned: number; revenue: number; sheets: number; gifs: number };

export type Money = Totals & {
  event_revenue: number;
  events: number;
  total_revenue: number;
  paper_cost: number;
  other_cost: number;
  subscription_cost: number;
  profit: number;
};

export type OwnerOverview = {
  from: string;
  to: string;
  current: Money;
  previous: Money;
  daily: Point[];
  by_layout: Group[];
  by_device: Group[];
  by_frame?: Group[];
  by_filter?: Group[];
  /** 24 baris, jam WIB 0–23. */
  by_hour?: Hour[];
  paper_cost_per_sheet: number;
};

export type Hour = { hour: number; transactions: number; revenue: number };

export type Expiring = { license_id: string; owner_id: string; owner_name: string; owner_email: string; owner_phone: string; plan: string; ends_at: string };

export type AdminOverview = {
  from: string;
  to: string;
  counts: {
    owners: number;
    owners_new: number;
    subscribers: number;
    licenses_active: number;
    licenses_expiring_7d: number;
    licenses_expired: number;
    licenses_suspended: number;
    devices: number;
    devices_active_24h: number;
  };
  subscription_revenue: number;
  subscription_payments: number;
  previous_subscription_revenue: number;
  subscription_daily: Point[];
  by_plan: Group[];
  booth: Totals;
  booth_daily: Point[];
  top_owners: Group[];
  expiring: Expiring[];
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  status: "active" | "expired" | "suspended" | "none";
  active_until: string | null;
  licenses: number;
  devices: number;
  last_seen_at: string | null;
  paid_total: number;
  last_paid_at: string | null;
  transactions_30d: number;
  revenue_30d: number;
};

export type License = {
  id: string;
  owner_id: string;
  plan: "daily" | "monthly" | "yearly";
  starts_at: string;
  ends_at: string;
  max_devices: number;
  active_devices: number;
  status: "scheduled" | "active" | "expired" | "suspended";
  key_hint: string;
  created_at: string;
  owner_name?: string;
  owner_email?: string;
};

export type Device = { id: string; license_id: string; name: string; platform: string; last_seen_at: string | null; created_at: string };

export type Booth = {
  id: string;
  name: string;
  platform: string;
  app_version: string;
  paper_left: number | null;
  paper_capacity: number | null;
  last_seen_at: string | null;
  created_at: string;
  license_id: string;
  key_hint: string;
  owner_id: string;
  owner_name: string;
  transactions_30d: number;
  revenue_30d: number;
};

export type Payment = {
  id: string;
  owner_id: string;
  owner_name: string;
  owner_email: string;
  license_id: string | null;
  key_hint: string;
  amount: number;
  method: string;
  plan: string;
  periods: number;
  paid_at: string;
  note: string;
  status: "valid" | "void";
  recorded_by: string;
};

export type Transaction = {
  id: string;
  device_id: string;
  device_name: string;
  owner_id: string;
  owner_name?: string;
  session_code: string;
  occurred_at: string;
  mode: "kiosk" | "event";
  layout: string;
  frame: string;
  shots: number;
  gif: boolean;
  amount: number;
  payment_method: string;
  status: "completed" | "abandoned";
  sheets: number;
};

export type OwnerProfile = { id: string; name: string; email: string; phone: string; paper_cost: number; created_at: string };

export type BoothEvent = {
  id: string;
  device_id: string | null;
  name: string;
  client_name: string;
  starts_on: string;
  ends_on: string;
  contract_amount: number;
  other_cost: number;
  note: string;
  transactions: number;
  revenue: number;
  sheets: number;
};

export type GallerySession = {
  code: string;
  url: string;
  device_id: string;
  device_name: string;
  created_at: string;
  expires_at: string;
  files: number;
  size_bytes: number;
  preview_url: string;
};

export type AuditEntry = { id: string; actor_kind: string; actor_name: string; action: string; target: string; detail: string; created_at: string };

export type AdminAccount = { id: string; name: string; email: string; created_at: string };
