CREATE OR REPLACE FUNCTION public.demo_class_subject_names(_class_name text)
RETURNS text[] LANGUAGE sql IMMUTABLE SET search_path = public AS $$
 SELECT CASE
 WHEN _class_name ~ '^Form [12][ABC]$' THEN ARRAY['Mathematics','English Language','Shona','Combined Science','Heritage Studies','History','Geography','Agriculture','Computer Science']
 WHEN _class_name ~ '^Form [34][ABC]$' THEN ARRAY['Mathematics','English Language','Shona','Combined Science','History','Geography','Principles of Accounting','Commerce','Computer Science']
 WHEN _class_name ~ '^Form [56]A$' THEN ARRAY['Pure Mathematics','Physics','Chemistry','Biology']
 WHEN _class_name ~ '^Form [56]B$' THEN ARRAY['Accounting','Business Studies','Economics','Geography']
 ELSE NULL::text[] END;
$$;
CREATE OR REPLACE FUNCTION public.guard_demo_class_subject()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE class_name text; subject_name text; allowed text[];
BEGIN
 SELECT name INTO class_name FROM public.classes WHERE id=NEW.class_id;
 SELECT name INTO subject_name FROM public.subjects WHERE id=NEW.subject_id;
 allowed := public.demo_class_subject_names(class_name);
 IF allowed IS NOT NULL AND EXISTS (SELECT 1 FROM public.students st JOIN public.student_classes sc ON sc.student_id=st.id WHERE sc.class_id=NEW.class_id AND lower(st.email) LIKE '%@student.schooldemo.com')
 AND NOT (subject_name = ANY(allowed)) THEN
   RETURN NULL;
 END IF;
 RETURN NEW;
END;
$$;
CREATE TRIGGER guard_demo_class_subject BEFORE INSERT OR UPDATE ON public.class_subjects FOR EACH ROW EXECUTE FUNCTION public.guard_demo_class_subject();
REVOKE ALL ON FUNCTION public.guard_demo_class_subject() FROM PUBLIC;
COMMENT ON FUNCTION public.demo_class_subject_names(text) IS 'Demo curriculum: 9 O-Level subjects or 4 A-Level subjects. Study Hall is not an enrolled subject.';