export interface IPermissions {
  id: number;

  slug: string;

  description: string;

  active: boolean;

  created_at: Date;

  updated_at: Date;

  created_by: string | null;

  updated_by: string | null;
}

export interface IRoles {
  id: string;

  name: string;

  active: boolean;
}

export enum drive_type {
  car = "car",
  bike = "bike",
  floot = "floot",
}

export interface IDeliveryPricing {
  id: string;

  active: boolean;

  default: boolean;

  name: string;

  drive_type: keyof typeof drive_type;

  days: Array<string>;

  start_time: string;

  end_time: string;

  min_price?: number | null;

  rules: any;

  price_per_km: number;
}
