-- 1. Criar a tabela de perfis (Linked com Auth)
create table public.perfis (
  id uuid references auth.users on delete cascade primary key,
  nome text,
  email text,
  role text default 'docente' check (role in ('admin', 'coordenacao', 'docente'))
);

-- 2. Habilitar RLS (Row Level Security)
alter table public.perfis enable row level security;

-- 3. Criar políticas de acesso
create policy "Perfis são visíveis para todos os autenticados" on public.perfis
  for select using (auth.role() = 'authenticated');

create policy "Usuários podem editar seu próprio perfil" on public.perfis
  for update using (auth.uid() = id);

-- 4. Função para criar perfil automático ao registrar
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.perfis (id, nome, email, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email, 'docente');
  return new;
end;
$$ language plpgsql security definer;

-- 5. Trigger para a função
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. DICA: Para transformar você em ADM, rode este comando abaixo substituindo SEU_EMAIL:
-- update public.perfis set role = 'admin' where email = 'SEU_EMAIL';
