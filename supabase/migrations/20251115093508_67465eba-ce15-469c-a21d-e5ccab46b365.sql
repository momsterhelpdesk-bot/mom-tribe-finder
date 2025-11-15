-- Update the handle_new_user trigger to also create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  -- Insert default user role
  insert into public.user_roles (user_id, role)
  values (new.id, 'user');
  
  -- Create initial profile
  insert into public.profiles (
    id,
    full_name,
    email,
    city,
    area,
    child_age_group,
    match_preference,
    children,
    profile_completed
  ) values (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    COALESCE(new.email, ''),
    '',
    '',
    '',
    '',
    '[]'::jsonb,
    false
  );
  
  return new;
end;
$function$;