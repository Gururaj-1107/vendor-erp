-- =========================================================================
-- VENDORBRIDGE DATABASE SCHEMA
-- Copy and paste this script into the Supabase SQL Editor (Dashboard > SQL Editor)
-- and click "Run" to initialize all tables and relationships.
-- =========================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES Table (Extends Supabase Auth users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  first_name text not null,
  last_name text not null,
  role text not null default 'Procurement Officer',
  country text not null default 'India',
  phone text,
  additional_info text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. VENDORS Table
create table if not exists public.vendors (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text not null,
  gst_no text not null unique,
  contact_no text not null,
  email text not null,
  status text not null default 'pending', -- pending, active, blocked
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. RFQS (Request for Quotations) Table
create table if not exists public.rfqs (
  id uuid default gen_random_uuid() primary key,
  rfq_number text not null unique,
  title text not null,
  category text not null,
  deadline date not null,
  description text,
  status text not null default 'draft', -- draft, active, closed, awarded
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. RFQ_ITEMS Table (Line items inside an RFQ)
create table if not exists public.rfq_items (
  id uuid default gen_random_uuid() primary key,
  rfq_id uuid references public.rfqs(id) on delete cascade not null,
  item_name text not null,
  quantity numeric not null,
  unit text not null
);

-- 5. QUOTATIONS Table
create table if not exists public.quotations (
  id uuid default gen_random_uuid() primary key,
  rfq_id uuid references public.rfqs(id) on delete cascade not null,
  vendor_id uuid references public.vendors(id) on delete cascade not null,
  delivery_days integer not null,
  tax_percent numeric not null default 18,
  note_terms text,
  subtotal numeric not null,
  gst_amount numeric not null,
  grand_total numeric not null,
  status text not null default 'submitted', -- submitted, selected, rejected
  submitted_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. QUOTATION_ITEMS Table (Individual item prices within a quotation)
create table if not exists public.quotation_items (
  id uuid default gen_random_uuid() primary key,
  quotation_id uuid references public.quotations(id) on delete cascade not null,
  rfq_item_id uuid references public.rfq_items(id) on delete cascade not null,
  unit_price numeric not null,
  total_price numeric not null
);

-- 7. APPROVALS Table
create table if not exists public.approvals (
  id uuid default gen_random_uuid() primary key,
  rfq_id uuid references public.rfqs(id) on delete cascade not null,
  vendor_id uuid references public.vendors(id) on delete cascade not null,
  stage integer not null default 1, -- 1: Submitted, 2: L1 Review, 3: L2 Approved
  remarks text,
  status text not null default 'pending', -- pending, approved, rejected
  submitted_by uuid references auth.users(id) on delete set null,
  approved_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. PURCHASE_ORDERS Table
create table if not exists public.purchase_orders (
  id uuid default gen_random_uuid() primary key,
  po_number text not null unique,
  rfq_id uuid references public.rfqs(id) on delete set null,
  quotation_id uuid references public.quotations(id) on delete set null,
  vendor_id uuid references public.vendors(id) on delete set null,
  vendor_name text not null,
  amount numeric not null,
  po_date date not null default current_date,
  status text not null default 'Pending Approval', -- Pending Approval, Approved, Delivered, Cancelled
  billing_company text not null default 'VendorBridge Corp',
  billing_address text not null default 'Tech Park, Suite 400, Mumbai, India',
  gst_percent numeric not null default 18,
  subtotal numeric not null,
  gst_amount numeric not null,
  grand_total numeric not null
);

-- 9. INVOICES Table
create table if not exists public.invoices (
  id uuid default gen_random_uuid() primary key,
  invoice_number text not null unique,
  po_number text not null,
  vendor_name text not null,
  amount numeric not null,
  invoice_date date not null default current_date,
  due_date date not null,
  status text not null default 'Pending' -- Pending, Paid, Overdue
);

-- 10. ACTIVITY_LOG Table
create table if not exists public.activity_log (
  id uuid default gen_random_uuid() primary key,
  description text not null,
  user_name text not null,
  type text not null, -- RFQ, Approvals, Invoices, Vendors
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (Row Level Security) on profiles
alter table public.profiles enable row level security;

-- Create basic RLS policies for profiles
create policy "Allow public read access to profiles" on public.profiles
  for select using (true);

create policy "Allow users to update their own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Allow users to insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Create trigger to automatically insert profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name, last_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', 'First'),
    coalesce(new.raw_user_meta_data->>'last_name', 'Last'),
    coalesce(new.raw_user_meta_data->>'role', 'Procurement Officer')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Seed some mock data into vendors table for testing
insert into public.vendors (name, category, gst_no, contact_no, email, status)
values 
  ('TechCore Ltd', 'IT', '27AABCS1429B1Z0', '8583896838', 'info@techcore.com', 'active'),
  ('InfraSupplies Ltd', 'Furniture', '27AABCX5621K1Z5', '9876543210', 'contact@infra.com', 'active'),
  ('OfficeNeeds Co.', 'Operations', '27AABCO1234B1Z1', '7701234567', 'sales@officeneeds.com', 'active')
on conflict (gst_no) do nothing;
