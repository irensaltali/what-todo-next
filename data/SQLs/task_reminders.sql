create table public.task_reminders (
  id uuid not null default extensions.uuid_generate_v4 (),
  task_id uuid not null,
  reminder_time timestamp with time zone not null,
  created_at timestamp with time zone null default now(),
  constraint task_reminders_pkey primary key (id),
  constraint task_reminders_task_id_fkey foreign KEY (task_id) references tasks (id)
) TABLESPACE pg_default;
