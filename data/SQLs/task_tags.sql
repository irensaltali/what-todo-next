create table public.task_tags (
  task_id uuid not null,
  tag_id uuid not null,
  constraint task_tags_pkey primary key (task_id, tag_id),
  constraint task_tags_tag_id_fkey foreign KEY (tag_id) references tags (id),
  constraint task_tags_task_id_fkey foreign KEY (task_id) references tasks (id)
) TABLESPACE pg_default;
