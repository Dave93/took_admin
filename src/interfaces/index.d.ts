import { drive_type, organization_system_type } from "./enums";

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

export interface IDeliveryPricing {
  id: string;

  active: boolean;

  default: boolean;

  name: string;

  drive_type: keyof typeof drive_type;

  days: Array<string>;

  start_time: Date;

  end_time: Date;

  min_price?: number | null;

  rules: any;

  price_per_km: number;
}

export class IOrganization {
  id: string;

  name: string;

  active: boolean;

  system_type: keyof typeof organization_system_type;

  phone: string;

  webhook?: string | null;

  group_id?: string | null;

  apelsin_login?: string | null;

  apelsin_password?: string | null;

  sender_name?: string | null;

  sender_number?: string | null;

  description?: string | null;

  created_at: Date;

  updated_at: Date;

  created_by?: string | null;

  updated_by?: string | null;

  _count?: OrganizationCount;
}

export class IWorkSchedules {
  id: string;

  organization_id: string;

  organization?: organization;

  days: Array<string>;

  start_time: Date;

  end_time: Date;

  max_start_time: Date;

  created_at: Date;

  updated_at: Date;

  created_by?: string | null;

  updated_by?: string | null;

  work_schedules_created_byTousers?: users | null;

  work_schedules_updated_byTousers?: users | null;
}
