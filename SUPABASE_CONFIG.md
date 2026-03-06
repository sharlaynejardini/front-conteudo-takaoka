# Configuração do Supabase para Login com Google

## Problema Identificado
Erro: "Database error saving new user"

Isso acontece porque o Supabase está tentando criar usuários automaticamente na tabela auth.users, mas há um problema de configuração.

## Solução

### 1. Acesse o Dashboard do Supabase
https://supabase.com/dashboard/project/ekqoaouowjavmnmsjkwu

### 2. Configure o Google OAuth

**Authentication > Providers > Google**

- ✅ Enable Google provider
- Adicione as URLs de redirect:
  - `http://localhost:5173/auth/callback`
  - `https://front-conteudo-takaoka-2026.vercel.app/auth/callback`
  - `https://*.vercel.app/auth/callback` (para todos os deploys)

### 3. Configure Email Confirmation

**Authentication > Settings > Email Auth**

- ❌ Desabilite "Enable email confirmations" 
  OU
- ✅ Habilite "Enable email confirmations" mas adicione os domínios permitidos:
  - `professor.barueri.br`
  - `educbarueri.sp.gov.br`

### 4. Configure Auto Confirm

**Authentication > Settings**

- ✅ Enable "Auto Confirm" para novos usuários
- Ou adicione uma função SQL para auto-confirmar emails dos domínios permitidos

### 5. SQL para Auto-Confirmar Domínios Específicos

Execute no SQL Editor:

```sql
-- Função para auto-confirmar emails dos domínios permitidos
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  IF NEW.email LIKE '%@professor.barueri.br' OR NEW.email LIKE '%@educbarueri.sp.gov.br' THEN
    NEW.email_confirmed_at = NOW();
    NEW.confirmed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para executar a função
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 6. Verifique as Políticas RLS

Certifique-se de que as tabelas `users` e `login_logs` têm políticas RLS corretas:

```sql
-- Permitir inserção na tabela users
CREATE POLICY "Permitir inserção de novos usuários"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Permitir leitura na tabela users
CREATE POLICY "Permitir leitura de usuários"
ON public.users
FOR SELECT
TO authenticated
USING (true);

-- Permitir inserção na tabela login_logs
CREATE POLICY "Permitir inserção de logs"
ON public.login_logs
FOR INSERT
TO authenticated
WITH CHECK (true);
```

### 7. Teste Novamente

Após fazer essas configurações, teste o login novamente.

## Alternativa Rápida

Se você não conseguir configurar o Supabase, podemos:
1. Remover a tentativa de salvar no Supabase
2. Usar apenas o OAuth do Google para autenticação
3. Salvar usuários apenas no backend (PostgreSQL separado)
