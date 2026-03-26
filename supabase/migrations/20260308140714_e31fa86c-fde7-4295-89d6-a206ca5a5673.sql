
-- Inventory Categories
CREATE TABLE public.inventory_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.inventory_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage inventory_categories" ON public.inventory_categories FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Authenticated read inventory_categories" ON public.inventory_categories FOR SELECT TO authenticated USING (true);

-- Inventory Items
CREATE TABLE public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.inventory_categories(id) ON DELETE SET NULL,
  item_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'piece',
  reorder_level INTEGER DEFAULT 10,
  location TEXT,
  supplier TEXT,
  supplier_contact TEXT,
  purchase_price_usd NUMERIC(10,2) DEFAULT 0,
  purchase_price_zig NUMERIC(10,2) DEFAULT 0,
  barcode TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage inventory_items" ON public.inventory_items FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Teachers read inventory_items" ON public.inventory_items FOR SELECT TO authenticated USING (has_role(auth.uid(), 'teacher'::app_role));

-- Textbook Issues
CREATE TABLE public.textbook_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE NOT NULL,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  return_date DATE,
  condition_on_issue TEXT DEFAULT 'good',
  condition_on_return TEXT,
  fine_amount_usd NUMERIC(10,2) DEFAULT 0,
  fine_amount_zig NUMERIC(10,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'issued',
  issued_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.textbook_issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage textbook_issues" ON public.textbook_issues FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Teachers manage textbook_issues" ON public.textbook_issues FOR ALL USING (has_role(auth.uid(), 'teacher'::app_role));
CREATE POLICY "Students read own textbook_issues" ON public.textbook_issues FOR SELECT USING (student_id IN (SELECT s.id FROM students s WHERE s.user_id = auth.uid()));

-- Inventory Transactions
CREATE TABLE public.inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE NOT NULL,
  transaction_type TEXT NOT NULL DEFAULT 'received',
  quantity INTEGER NOT NULL,
  reference TEXT,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage inventory_transactions" ON public.inventory_transactions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Teachers read inventory_transactions" ON public.inventory_transactions FOR SELECT TO authenticated USING (has_role(auth.uid(), 'teacher'::app_role));
