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
