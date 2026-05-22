
do $$ begin
  create type public.subscription_plan_type as enum ('monthly','term','custom');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.subscription_status as enum ('active','expired','pending','suspended','complimentary','trial','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_method as enum ('ecocash','onemoney','telecash','paynow_web','bank_transfer','visa_mastercard','manual');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum ('pending','paid','failed','cancelled','refunded','awaiting_verification','rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.grant_type as enum ('paid','complimentary','trial','suspended');
exception when duplicate_object then null; end $$;

create table if not exists public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan_type public.subscription_plan_type not null,
  amount_usd numeric(12,2) not null,
  duration_days integer not null,
  is_recommended boolean not null default false,
  is_active boolean not null default true,
  sibling_discount_2 numeric(5,2) not null default 0,
  sibling_discount_3_plus numeric(5,2) not null default 0,
  description text,
  features jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null,
  student_id uuid not null,
  plan_id uuid references public.subscription_plans(id) on delete set null,
  plan_type public.subscription_plan_type not null,
  amount_usd numeric(12,2) not null,
  amount_zwg numeric(14,2),
  currency_paid text not null default 'USD',
  payment_method public.payment_method,
  transaction_id text,
  paynow_reference text,
  status public.subscription_status not null default 'pending',
  access_start timestamptz,
  access_end timestamptz,
  term text,
  academic_year text,
  auto_renew boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists subscriptions_parent_idx on public.subscriptions(parent_id);
create index if not exists subscriptions_student_idx on public.subscriptions(student_id);
create index if not exists subscriptions_status_idx on public.subscriptions(status);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid references public.subscriptions(id) on delete cascade,
  parent_id uuid not null,
  amount numeric(12,2) not null,
  currency text not null default 'USD',
  payment_method public.payment_method not null,
  mobile_number text,
  transaction_id text,
  paynow_reference text,
  paynow_poll_url text,
  payment_status public.payment_status not null default 'pending',
  proof_of_payment_url text,
  verified_by uuid,
  verified_at timestamptz,
  rejection_reason text,
  receipt_number text unique,
  receipt_url text,
  ip_address text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists payments_parent_idx on public.payments(parent_id);
create index if not exists payments_status_idx on public.payments(payment_status);
create index if not exists payments_subscription_idx on public.payments(subscription_id);

create table if not exists public.access_grants (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null,
  student_id uuid not null,
  grant_type public.grant_type not null default 'paid',
  granted_by uuid,
  reason text,
  access_start timestamptz not null default now(),
  access_end timestamptz,
  is_active boolean not null default true,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists access_grants_parent_idx on public.access_grants(parent_id);
create index if not exists access_grants_student_idx on public.access_grants(student_id);
create index if not exists access_grants_active_idx on public.access_grants(is_active);

create table if not exists public.payment_reminders (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null,
  student_id uuid,
  reminder_type text not null,
  sent_at timestamptz not null default now(),
  delivery_method text not null default 'in_app',
  status text not null default 'sent',
  ai_generated_message text,
  created_by uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.exchange_rates (
  id uuid primary key default gen_random_uuid(),
  usd_to_zwg numeric(14,4) not null,
  source text not null default 'manual',
  fetched_at timestamptz not null default now(),
  set_by_admin uuid,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.school_bank_details (
  id uuid primary key default gen_random_uuid(),
  bank_name text not null,
  account_name text not null,
  account_number text not null,
  branch text,
  swift_code text,
  paynow_integration_id text,
  paynow_integration_key_secret_ref text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$ begin
  create trigger trg_sub_plans_uat before update on public.subscription_plans
    for each row execute function public.tt_set_updated_at();
exception when duplicate_object then null; end $$;
do $$ begin
  create trigger trg_subscriptions_uat before update on public.subscriptions
    for each row execute function public.tt_set_updated_at();
exception when duplicate_object then null; end $$;
do $$ begin
  create trigger trg_payments_uat before update on public.payments
    for each row execute function public.tt_set_updated_at();
exception when duplicate_object then null; end $$;
do $$ begin
  create trigger trg_access_grants_uat before update on public.access_grants
    for each row execute function public.tt_set_updated_at();
exception when duplicate_object then null; end $$;
do $$ begin
  create trigger trg_bank_uat before update on public.school_bank_details
    for each row execute function public.tt_set_updated_at();
exception when duplicate_object then null; end $$;

alter table public.subscription_plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.access_grants enable row level security;
alter table public.payment_reminders enable row level security;
alter table public.exchange_rates enable row level security;
alter table public.school_bank_details enable row level security;

create or replace function public.is_finance_admin(_uid uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists(
    select 1 from public.user_roles
    where user_id = _uid
      and role in ('admin'::app_role,'supervisor'::app_role)
  );
$$;

drop policy if exists "plans_read_all" on public.subscription_plans;
create policy "plans_read_all" on public.subscription_plans for select to authenticated using (true);
drop policy if exists "plans_admin_write" on public.subscription_plans;
create policy "plans_admin_write" on public.subscription_plans for all to authenticated
  using (public.is_finance_admin(auth.uid())) with check (public.is_finance_admin(auth.uid()));

drop policy if exists "sub_parent_select" on public.subscriptions;
create policy "sub_parent_select" on public.subscriptions for select to authenticated
  using (parent_id = auth.uid() or student_id = auth.uid() or public.is_finance_admin(auth.uid()));
drop policy if exists "sub_parent_insert" on public.subscriptions;
create policy "sub_parent_insert" on public.subscriptions for insert to authenticated
  with check (parent_id = auth.uid() or public.is_finance_admin(auth.uid()));
drop policy if exists "sub_admin_update" on public.subscriptions;
create policy "sub_admin_update" on public.subscriptions for update to authenticated
  using (public.is_finance_admin(auth.uid())) with check (public.is_finance_admin(auth.uid()));
drop policy if exists "sub_admin_delete" on public.subscriptions;
create policy "sub_admin_delete" on public.subscriptions for delete to authenticated
  using (public.is_finance_admin(auth.uid()));

drop policy if exists "pay_parent_select" on public.payments;
create policy "pay_parent_select" on public.payments for select to authenticated
  using (parent_id = auth.uid() or public.is_finance_admin(auth.uid()));
drop policy if exists "pay_parent_insert" on public.payments;
create policy "pay_parent_insert" on public.payments for insert to authenticated
  with check (parent_id = auth.uid() or public.is_finance_admin(auth.uid()));
drop policy if exists "pay_admin_update" on public.payments;
create policy "pay_admin_update" on public.payments for update to authenticated
  using (public.is_finance_admin(auth.uid())) with check (public.is_finance_admin(auth.uid()));

drop policy if exists "grants_select" on public.access_grants;
create policy "grants_select" on public.access_grants for select to authenticated
  using (parent_id = auth.uid() or student_id = auth.uid() or public.is_finance_admin(auth.uid()));
drop policy if exists "grants_admin_write" on public.access_grants;
create policy "grants_admin_write" on public.access_grants for all to authenticated
  using (public.is_finance_admin(auth.uid())) with check (public.is_finance_admin(auth.uid()));

drop policy if exists "reminders_select" on public.payment_reminders;
create policy "reminders_select" on public.payment_reminders for select to authenticated
  using (parent_id = auth.uid() or public.is_finance_admin(auth.uid()));
drop policy if exists "reminders_admin_write" on public.payment_reminders;
create policy "reminders_admin_write" on public.payment_reminders for all to authenticated
  using (public.is_finance_admin(auth.uid())) with check (public.is_finance_admin(auth.uid()));

drop policy if exists "rates_read_all" on public.exchange_rates;
create policy "rates_read_all" on public.exchange_rates for select to authenticated using (true);
drop policy if exists "rates_admin_write" on public.exchange_rates;
create policy "rates_admin_write" on public.exchange_rates for all to authenticated
  using (public.is_finance_admin(auth.uid())) with check (public.is_finance_admin(auth.uid()));

drop policy if exists "bank_read_all" on public.school_bank_details;
create policy "bank_read_all" on public.school_bank_details for select to authenticated using (true);
drop policy if exists "bank_admin_write" on public.school_bank_details;
create policy "bank_admin_write" on public.school_bank_details for all to authenticated
  using (public.is_finance_admin(auth.uid())) with check (public.is_finance_admin(auth.uid()));

insert into public.subscription_plans (name, plan_type, amount_usd, duration_days, is_recommended, sibling_discount_2, sibling_discount_3_plus, description, features)
select 'Monthly Access','monthly',10.00,30,false,10,20,
  'Full Parent + Student portal access, billed monthly.',
  '["Full timetable (Period, Teacher, Venue)","Lesson plans & learning materials","Assignments and homework","Exam timetable and results","Downloadable report cards","School notifications & updates","Teacher messaging","Attendance records","Student portal full access","Activity & event calendar"]'::jsonb
where not exists (select 1 from public.subscription_plans where name='Monthly Access');

insert into public.subscription_plans (name, plan_type, amount_usd, duration_days, is_recommended, sibling_discount_2, sibling_discount_3_plus, description, features)
select 'Term Access','term',25.00,90,true,10,20,
  'Full Parent + Student portal access for one academic term. Save $5.',
  '["Full timetable (Period, Teacher, Venue)","Lesson plans & learning materials","Assignments and homework","Exam timetable and results","Downloadable report cards","School notifications & updates","Teacher messaging","Attendance records","Student portal full access","Activity & event calendar","Save $5 vs monthly"]'::jsonb
where not exists (select 1 from public.subscription_plans where name='Term Access');

insert into public.exchange_rates (usd_to_zwg, source, is_active)
select 350.0000,'seed',true
where not exists (select 1 from public.exchange_rates where is_active = true);

insert into public.school_bank_details (bank_name, account_name, account_number, branch, swift_code, is_active)
select 'CBZ Bank','MavingTech Business Solutions','01234567890123','Harare Main','CBZWZWHA',true
where not exists (select 1 from public.school_bank_details where is_active = true);
