CREATE OR REPLACE FUNCTION public.validate_student_subject_load()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE n integer; minimum integer; maximum integer;
BEGIN
 IF TG_OP='UPDATE' AND NEW.subject_combination IS NOT DISTINCT FROM OLD.subject_combination AND NEW.form IS NOT DISTINCT FROM OLD.form THEN RETURN NEW; END IF;
 IF nullif(btrim(NEW.subject_combination),'') IS NULL THEN RETURN NEW; END IF;
 SELECT count(DISTINCT lower(btrim(s))) INTO n FROM unnest(string_to_array(NEW.subject_combination,',')) s WHERE btrim(s)<>'';
 minimum:=CASE WHEN NEW.form IN ('Form 5','Form 6') THEN 1 ELSE 7 END;
 maximum:=CASE WHEN NEW.form IN ('Form 5','Form 6') THEN 4 ELSE 10 END;
 IF n<minimum OR n>maximum THEN RAISE EXCEPTION '% requires % to % subjects', NEW.form, minimum, maximum USING ERRCODE='23514'; END IF;
 RETURN NEW;
END;
$$;
CREATE TRIGGER validate_student_subject_load BEFORE INSERT OR UPDATE OF subject_combination,form ON public.students FOR EACH ROW EXECUTE FUNCTION public.validate_student_subject_load();
REVOKE ALL ON FUNCTION public.validate_student_subject_load() FROM PUBLIC;