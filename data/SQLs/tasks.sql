create table public.tasks (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid not null,
  parent_task_id uuid null,
  title text not null,
  description text null,
  deadline timestamp with time zone null,
  priority integer null,
  outcome_value text null,
  difficulty integer null,
  is_recursive boolean null default false,
  recursion_count integer null,
  recursion_end timestamp with time zone null,
  is_deleted boolean null default false,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  status public.task_status not null default 'ongoing'::task_status,
  constraint tasks_pkey primary key (id),
  constraint tasks_parent_task_id_fkey foreign KEY (parent_task_id) references tasks (id),
  constraint tasks_user_id_fkey foreign KEY (user_id) references auth.users (id),
  constraint tasks_check check (
    (
      (not is_recursive)
      or (deadline is null)
    )
  )
) TABLESPACE pg_default;
