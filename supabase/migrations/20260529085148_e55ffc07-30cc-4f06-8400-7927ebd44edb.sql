CREATE OR REPLACE FUNCTION public.delete_student_cascade(_student_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT user_id INTO v_user_id FROM public.students WHERE id = _student_id;
    DELETE FROM public.students WHERE id = _student_id;
    RETURN;
END;
$function$;

DROP TABLE IF EXISTS public.student_verification_codes CASCADE;
DROP TABLE IF EXISTS public.verification_codes CASCADE;