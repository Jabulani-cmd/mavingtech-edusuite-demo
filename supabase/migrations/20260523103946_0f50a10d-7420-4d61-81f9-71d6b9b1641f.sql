-- Remove orphaned duplicate student auth account (no matching students row)
DELETE FROM public.user_roles WHERE user_id = '8b868e75-d26d-42e9-98b9-1d40ffdbf871';
DELETE FROM public.profiles WHERE id = '8b868e75-d26d-42e9-98b9-1d40ffdbf871';
DELETE FROM auth.users WHERE id = '8b868e75-d26d-42e9-98b9-1d40ffdbf871';