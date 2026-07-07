-- Migration 0001: Initial D1 schema for blog-vradvogados lead engine
-- Tables: leads, lead_events, pipedrive_outbox

create table leads (
  id text primary key,
  created_at text not null,
  updated_at text,
  name text not null,
  phone text not null,
  email text,
  person_type text check(person_type in ('PF', 'PJ')),
  problem_type text not null,
  bank_or_financial_institution text,
  approx_debt_value_range text,
  has_lawsuit integer check(has_lawsuit in (0, 1)),
  has_vehicle_seized integer check(has_vehicle_seized in (0, 1)),
  contract_available integer check(contract_available in (0, 1)),
  message text,
  landing_page text not null,
  source_article text,
  cluster text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  referrer text,
  user_agent text,
  ip_hash text,
  lgpd_consent integer not null check(lgpd_consent = 1),
  pipedrive_person_id integer,
  pipedrive_lead_id text,
  pipedrive_deal_id integer,
  pipedrive_status text,
  status text not null default 'new',
  qualified integer check(qualified in (0, 1)),
  disqualification_reason text
);

create index leads_created_at_idx on leads(created_at);
create index leads_phone_idx on leads(phone);
create index leads_pipedrive_lead_idx on leads(pipedrive_lead_id);
create index leads_cluster_idx on leads(cluster);
create index leads_status_idx on leads(status);

create table lead_events (
  id text primary key,
  lead_id text not null references leads(id),
  created_at text not null,
  event_name text not null,
  payload_json text
);

create index lead_events_lead_idx on lead_events(lead_id);
create index lead_events_created_idx on lead_events(created_at);

create table pipedrive_outbox (
  id text primary key,
  lead_id text references leads(id),
  created_at text not null,
  next_attempt_at text not null,
  attempts integer not null default 0,
  action text not null,
  payload_json text not null,
  last_error text,
  status text not null default 'pending' check(status in ('pending', 'done', 'failed'))
);

create index outbox_status_next_idx on pipedrive_outbox(status, next_attempt_at);
create index outbox_lead_idx on pipedrive_outbox(lead_id);