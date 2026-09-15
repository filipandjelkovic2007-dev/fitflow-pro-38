ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username text;

UPDATE public.profiles p
SET username = sub.uname
FROM (
  SELECT id, lower(regexp_replace(split_part(coalesce(email, 'vezbac'), '@', 1), '[^a-zA-Z0-9_]', '', 'g'))
         || '_' || substr(id::text, 1, 4) AS uname
  FROM public.profiles
) sub
WHERE p.id = sub.id AND (p.username IS NULL OR p.username = '');

ALTER TABLE public.profiles ALTER COLUMN username SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_key
  ON public.profiles (lower(username));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, username)
  VALUES (
    NEW.id,
    coalesce(nullif(NEW.raw_user_meta_data ->> 'name', ''), split_part(NEW.email, '@', 1), 'Vežbač'),
    NEW.email,
    coalesce(
      nullif(NEW.raw_user_meta_data ->> 'username', ''),
      split_part(NEW.email, '@', 1) || '_' || substr(NEW.id::text, 1, 4)
    )
  );
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;