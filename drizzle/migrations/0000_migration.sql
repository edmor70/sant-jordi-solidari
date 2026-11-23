CREATE TABLE public.quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE,
  idempotency_key text NOT NULL UNIQUE,
  lang text NOT NULL,
  mode text NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  buyer_type text NOT NULL,
  company text,
  needs_invoice boolean NOT NULL DEFAULT false,
  notes text,
  destinations jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_roses integer NOT NULL,
  bookmarks integer NOT NULL DEFAULT 0,
  breakdown jsonb NOT NULL,
  needs_review boolean NOT NULL DEFAULT false,
  ip_hash text,
  email_status text NOT NULL DEFAULT 'pending',
  email_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  buyer_email_status text NOT NULL DEFAULT 'pending',
  rose_type text NOT NULL DEFAULT 'natural_red',
  reservation_status text NOT NULL DEFAULT 'pending' CHECK (reservation_status IN ('pending','confirmed','paid','cancelled','delivered')),
  pdf_status text NOT NULL DEFAULT 'pending' CHECK (pdf_status IN ('pending','generated','failed'))
);
CREATE SEQUENCE public.invoice_number_seq START 1;
ALTER TABLE public.quote_requests ADD COLUMN invoice_number integer UNIQUE DEFAULT nextval('public.invoice_number_seq');
ALTER SEQUENCE public.invoice_number_seq OWNED BY public.quote_requests.invoice_number;
GRANT ALL ON public.quote_requests TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.invoice_number_seq TO service_role;
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;
CREATE INDEX quote_requests_ip_created_idx ON public.quote_requests (ip_hash, created_at);