-- Aplicado no projeto exclusivo financas-app. Nunca usar service_role no navegador.
create table public.finance_months (
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  month text not null check (month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
  data jsonb not null check (jsonb_typeof(data->'income') = 'array' and jsonb_typeof(data->'expense') = 'array'),
  revision integer not null default 1,
  updated_at timestamptz not null default now(),
  primary key (user_id, month)
);
alter table public.finance_months enable row level security;
revoke all on public.finance_months from anon;
grant select, insert, update, delete on public.finance_months to authenticated;
create policy own_months on public.finance_months for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Controle de versão evita sobrescrever alterações feitas em outro dispositivo.
create function public.save_finance_month(p_month text, p_data jsonb, p_revision integer)
returns integer language plpgsql security invoker set search_path = '' as $$
declare new_revision integer;
begin
  if auth.uid() is null then raise exception 'Login necessário'; end if;
  if p_revision = 0 then
    insert into public.finance_months (user_id, month, data) values (auth.uid(), p_month, p_data)
      on conflict do nothing returning revision into new_revision;
  else
    update public.finance_months set data = p_data, revision = revision + 1, updated_at = now()
      where user_id = auth.uid() and month = p_month and revision = p_revision
      returning revision into new_revision;
  end if;
  if new_revision is null then raise exception 'CONFLICT: Este mês foi alterado em outro dispositivo. Recarregue antes de editar.'; end if;
  return new_revision;
end;
$$;
revoke all on function public.save_finance_month(text,jsonb,integer) from public, anon;
grant execute on function public.save_finance_month(text,jsonb,integer) to authenticated;
