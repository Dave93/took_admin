import { drive_type, organization_system_type, user_status } from "./enums";
import { GraphQLScalarType } from "graphql";

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

  organization_id: string;
  organization?: organization;
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

  name: string;

  active: boolean;

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

export class ITerminals {
  id: string;

  name: string;

  active: boolean;

  phone: string | null;

  address: string | null;

  latitude: number;

  longitude: number;

  external_id: string;

  organization_id: string;

  organization?: organization;

  created_at: Date;

  updated_at: Date;

  created_by: string | null;

  updated_by: string | null;
}

export class IUsers {
  [x: string]: any;
  id: string;

  phone: string;

  first_name?: string | null;

  last_name?: string | null;

  password?: string | null;

  is_super_user: boolean;

  status: keyof typeof user_status;

  drive_type?: keyof typeof drive_type | null;

  card_name?: string | null;

  card_number?: string | null;

  birth_date?: Date | null;

  car_model?: string | null;

  car_number?: string | null;

  is_online: boolean;

  latitude?: number | null;

  longitude?: number | null;

  created_at: Date;

  updated_at: Date;

  otp?: Array<otp>;

  permissions_permissions_created_byTousers?: Array<permissions>;

  permissions_permissions_updated_byTousers?: Array<permissions>;

  post_post_created_byTousers?: Array<post>;

  post_updated_byTousers?: Array<post>;

  post_post_user_idTousers?: Array<post>;

  roles_roles_created_byTousers?: Array<roles>;

  roles_roles_updated_byTousers?: Array<roles>;

  roles_permissions_roles_permissions_created_byTousers?: Array<roles_permissions>;

  roles_permissions_roles_permissions_updated_byTousers?: Array<roles_permissions>;

  users_permissions_usersTousers_permissions_created_by?: Array<users_permissions>;

  users_permissions_usersTousers_permissions_updated_by?: Array<users_permissions>;

  users_permissions_usersTousers_permissions_user_id?: Array<users_permissions>;

  users_roles_usersTousers_roles_created_by?: Array<users_roles>;

  users_roles_usersTousers_roles_updated_by?: Array<users_roles>;

  users_roles_usersTousers_roles_user_id?: Array<users_roles>;

  post_prop_types_created_byTousers?: Array<post_prop_types>;

  post_prop_types_updated_byTousers?: Array<post_prop_types>;

  delivery_pricing_created_byTousers?: Array<delivery_pricing>;

  delivery_pricing_updated_byTousers?: Array<delivery_pricing>;

  city_created_byTousers?: Array<city>;

  city_updated_byTousers?: Array<city>;

  organization_created_byTousers?: Array<organization>;

  organization_updated_byTousers?: Array<organization>;

  work_schedules_created_byTousers?: Array<work_schedules>;

  work_schedules_updated_byTousers?: Array<work_schedules>;

  terminals_created_byTousers?: Array<terminals>;

  terminals_updated_byTousers?: Array<terminals>;

  users_terminals?: Array<users_terminals>;

  users_work_schedules?: Array<users_work_schedules>;

  _count?: UsersCount;
}

class WorkScheduleEntriesReportCouriers {
  id: string;

  first_name: string;

  last_name: string;
}

export class WorkScheduleEntriesReportForPeriod {
  users: WorkScheduleEntriesReportCouriers[];

  work_schedule_entries: WorkScheduleEntriesReportRecord[];
}

class WorkScheduleEntriesReportRecord {
  user_id: string;

  duration: number;

  day: Date;

  late: boolean;

  first_name: string;

  last_name: string;
}

export class ICustomers {
  id: string;

  name: string;

  phone: string;

  customers_comments_customers?: Array<customers_comments>;

  _count?: CustomersCount;
}

export class customers_comments {
  id: string;

  customer_id: string;

  comment: string;

  created_at: Date;

  created_by: string | null;

  customers_comments_created_byTousers?: users | null;

  customers_comments_customers?: customers;
}

export class IOrderStatus {
  id: string;

  name: string;

  sort: number;

  organization_id: string;

  finish: boolean;

  cancel: boolean;

  waiting: boolean;

  order_status_organization?: organization;
}

export class IOrders {
  id: string;

  organization_id: string;

  customer_id: string;

  courier_id: string;

  terminal_id: string;

  order_status_id: string;

  delivery_type: keyof typeof drive_type;

  from_lat: number;

  from_lon: number;

  to_lat: number;

  to_lon: number;

  pre_distance: number;

  pre_duration: number;

  order_number: string;

  distance: number | null;

  duration: number | null;

  order_price: number;

  delivery_price: number;

  delivery_address: string;

  delivery_date: Date;

  finished_date: Date | null;

  delivery_comment: string | null;

  delivery_phone: string;

  delivery_name: string;

  payment_type_id: string;

  payment_type: string;

  delivery_pricing_id: string;

  cancel_reason: string | null;

  order_items: any | null;

  created_at: Date;

  updated_at: Date;

  created_by: string | null;

  updated_by: string | null;

  orders_created_byTousers?: users | null;

  orders_updated_byTousers?: users | null;

  orders_customers?: customers;

  orders_couriers?: users;

  orders_order_status?: order_status;

  orders_organization?: organization;

  orders_terminals?: terminals;
}

export class IOrderActions {
  id: string;

  order_id: string;

  action: string | null;
  duration: number;

  action_text: string;

  terminal_id: string;

  created_at: Date;

  created_by: string | null;

  order_actions_created_byTousers?: users | null;

  order_actions_orders?: orders;

  order_actions_terminals?: terminals;
}

export class IOrderLocation {
  order_id: string;

  terminal_id: string;

  courier_id: string;

  created_at: Date;

  location: any;

  order_status_id: string;

  status_color: string;

  status_name: string;
}

export class IGroupedLocations {
  order_status: string;

  location: IOrderLocation[];
}

export class IApiTokens {
  id: string;

  active: boolean;

  token: string;

  organization_id: string;

  created_at: Date;

  updated_at: Date;

  created_by: string | null;

  updated_by: string | null;

  api_tokens_created_byTousers?: users | null;

  api_tokens_updated_byTousers?: users | null;

  api_tokens_organization?: organization;
}

export class ICouriersByTerminal {
  name: string;

  couriers: IUsers[];
}

export class ISystemConfigs {
  id: string;

  name: string;

  value: string;
}

export class IBrands {
  id: string;

  name: string;

  sign: string;

  api_url: string;

  logo_path: string | null;

  created_at: Date;

  updated_at: Date;
}

class GarantDeliveryPriceTerminal {
  terminal_id: string;

  terminal_name: string;

  delivery_price: number;
}

class GarantDeliveryPriceOrg {
  id: string;

  name: string;

  children: GarantDeliveryPriceTerminal[];
}

export class GarantReportItem {
  begin_date: Date;
  last_order_date: Date;
  delivery_price: number;
  courier: string;
  orders_count: number;
  avg_delivery_time: string;
  table_name: string;

  formatted_avg_delivery_time: string;

  orders_dates: Date[];
  courier_id: string;
  created_at: Date;
  status!: keyof typeof user_status;

  possible_day_offs: number;

  garant_price: number;

  order_dates_count: number;

  actual_day_offs: number;

  drive_type: keyof typeof drive_type;
  delivery_price_orgs: GarantDeliveryPriceOrg[];
}

export class RollCallCourier {
  id: string;

  first_name: string;

  last_name: string;

  created_at?: Date;

  date?: Date;

  is_late: boolean;

  is_online: boolean;

  drive_type: keyof typeof drive_type;
  phone: string;

  app_version: string;
}

export class RollCallItem {
  id: string;

  name: string;

  couriers: RollCallCourier[];
}

export class WalletStatus {
  id!: string;

  courier_id!: string;

  terminal_id!: string;

  organization_id!: string;

  balance!: number;

  created_at!: Date;

  created_by!: string | null;

  courier_terminal_balance_created_byTousers?: users | null;

  courier_terminal_balance_couriers?: users;

  courier_terminal_balance_terminals?: terminals;
  courier_terminal_balance_organizations?: organization;
}

export class CourierEfficiencyTerminalItem {
  terminal_id: string;

  terminal_name: string;

  courier_count: number;

  total_count: number;

  efficiency: number;

  hour_period: string;

  courier_ids: string[] | null;
}

export class CourierEfficiencyReportItem {
  courier_id: string;

  first_name: string;

  last_name: string;

  phone: string;

  drive_type: string;

  courier_count: number;

  total_count: number;

  efficiency: number;

  terminals: CourierEfficiencyTerminalItem[];

  period: string;
}

export class ITimesheet {
  id: string;

  user_id: string;

  is_late: boolean;

  date: Date;

  created_at: Date;

  updated_at: Date;

  timesheet_users?: users;
}

export class IManagerWithdraw {
  id: string;

  manager_id: string;

  courier_id: string;

  terminal_id: string;

  organization_id: string;

  amount: number;

  amount_before: number;

  amount_after: number;

  created_at: Date;

  payed_date: Date | null;

  created_by: string | null;

  manager_withdraw_created_byTousers?: users | null;

  manager_withdraw_managers?: users;

  manager_withdraw_organizations?: organization;

  manager_withdraw_couriers?: users;

  manager_withdraw_terminals?: terminals;

  manager_withdraw_transactions_withdraw?: Array<manager_withdraw_transactions>;

  _count?: Manager_withdrawCount;
}

export class IManagerWithdrawTransactions {
  id: string;

  withdraw_id: string;

  transaction_id: string;

  amount: number;

  created_at: Date;

  payed_date: Date | null;

  manager_withdraw_transactions_withdraw?: manager_withdraw;

  manager_withdraw_transactions_transaction?: order_transactions;
}

export class INotifications {
  id: string;

  title: string;

  body: string;

  created_at: Date;

  send_at: Date;

  status: string;

  role: string;
}

export class ICourierEfficiencyReportPerDayItem {
  courier_id: string;

  order_day: string;

  efficiency: number;

  hour_period?: CourierEfficiencyReportItem[];
}
