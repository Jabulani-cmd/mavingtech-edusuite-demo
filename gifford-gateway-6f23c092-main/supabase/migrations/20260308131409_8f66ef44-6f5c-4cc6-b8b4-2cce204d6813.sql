CREATE OR REPLACE FUNCTION public.get_exam_rankings(p_exam_id uuid, p_student_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
BEGIN
  WITH student_totals AS (
    SELECT student_id, SUM(mark) as total_mark, COUNT(*) as subject_count
    FROM exam_results
    WHERE exam_id = p_exam_id
    GROUP BY student_id
  ),
  ranked_totals AS (
    SELECT student_id, total_mark, subject_count,
           RANK() OVER (ORDER BY total_mark DESC) as overall_rank,
           COUNT(*) OVER () as total_students
    FROM student_totals
  ),
  subject_ranks AS (
    SELECT student_id, subject_id, mark,
           RANK() OVER (PARTITION BY subject_id ORDER BY mark DESC) as subject_rank,
           COUNT(*) OVER (PARTITION BY subject_id) as subject_total
    FROM exam_results
    WHERE exam_id = p_exam_id
  )
  SELECT jsonb_build_object(
    'overall_rank', rt.overall_rank,
    'total_students', rt.total_students,
    'subject_rankings', (
      SELECT jsonb_object_agg(sr.subject_id::text, jsonb_build_object('rank', sr.subject_rank, 'total', sr.subject_total))
      FROM subject_ranks sr
      WHERE sr.student_id = p_student_id
    )
  ) INTO result
  FROM ranked_totals rt
  WHERE rt.student_id = p_student_id;

  RETURN COALESCE(result, '{}'::jsonb);
END;
$$;