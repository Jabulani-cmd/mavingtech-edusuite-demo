
-- SMS Templates
CREATE TABLE public.sms_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  template_text TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  category TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.sms_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage sms_templates" ON public.sms_templates FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Teachers read sms_templates" ON public.sms_templates FOR SELECT TO authenticated USING (has_role(auth.uid(), 'teacher'::app_role));

-- Communication Logs
CREATE TABLE public.communication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_type TEXT NOT NULL DEFAULT 'parent',
  recipient_ids TEXT[] DEFAULT '{}',
  recipient_count INTEGER NOT NULL DEFAULT 0,
  message TEXT NOT NULL,
  subject TEXT,
  channel TEXT NOT NULL DEFAULT 'sms',
  status TEXT NOT NULL DEFAULT 'pending',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  sent_by UUID,
  template_id UUID REFERENCES public.sms_templates(id) ON DELETE SET NULL,
  reference TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.communication_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage communication_logs" ON public.communication_logs FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Teachers read communication_logs" ON public.communication_logs FOR SELECT TO authenticated USING (has_role(auth.uid(), 'teacher'::app_role));
