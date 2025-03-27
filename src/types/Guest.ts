export interface Guest {
  id: string;
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  email?: string;
  table_id?: string;
  created_by: string;
}
