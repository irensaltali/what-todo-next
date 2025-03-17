create table public.tags (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid not null,
  name text not null,
  color text null,
  created_at timestamp with time zone null default now(),
  constraint tags_pkey primary key (id),
  constraint tags_user_id_fkey foreign KEY (user_id) references auth.users (id)
) TABLESPACE pg_default;
