create table public.task_lists (
  task_id uuid not null,
  list_id uuid not null,
  constraint task_lists_pkey primary key (task_id, list_id),
  constraint task_lists_list_id_fkey foreign KEY (list_id) references lists (id),
  constraint task_lists_task_id_fkey foreign KEY (task_id) references tasks (id)
) TABLESPACE pg_default;
