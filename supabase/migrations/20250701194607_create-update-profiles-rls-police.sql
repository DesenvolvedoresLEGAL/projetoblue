DROP POLICY IF EXISTS "Enable update for users based on email" ON public.profiles;
create policy "Enable update for users based on email"
on public.profiles
to public
using (
  ((( SELECT auth.jwt() AS jwt) ->> 'email'::text) = email)
)
with check (
  ((( SELECT auth.jwt() AS jwt) ->> 'email'::text) = email)
);
