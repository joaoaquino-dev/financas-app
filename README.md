# Finanças pessoais

Planejamento mensal em React + Vite + Tailwind, publicado no GitHub Pages:
https://joaoaquino-dev.github.io/financas-app/

## Como usar

1. Crie sua conta e confirme o e-mail. Se necessário, copie o endereço do botão recebido no e-mail e use **Já recebi o link** no app. Para recuperar a senha, solicite o e-mail e cole o link recebido no próprio app.
2. No navegador onde usava a versão anterior, entre na mesma conta e escolha o **mês de pagamento**. Clique em **Importar dados antigos para este mês**, confira e salve. O original `financasApp_v2` é preservado e nunca é publicado no repositório.
3. Edite o total previsto das rendas e despesas. Em uma fatura, **Somar compra** acrescenta o valor ao total existente. Valores usam máscara de centavos: digitar `10000` resulta em R$ 100,00.
4. Clique em **Salvar alterações**. No outro dispositivo, entre com a mesma conta. O app carrega os dados ao abrir e atualiza ao voltar à aba e a cada 30 segundos, desde que não haja alterações locais pendentes.
5. Use **Copiar mês anterior** em um mês vazio para reaproveitar contas e valores sem mudar o histórico. Importar/copiar exige salvar em seguida.

Edições pendentes recebem aviso antes de sair, trocar de mês ou recarregar. Sem conexão, as alterações continuam na tela, mas precisam ser salvas antes de fechar. O app não oferece edição offline persistente. **Exportar backup** salva também os rascunhos; arquivos JSON podem ser importados para o mês selecionado.

## Banco e autenticação

Projeto Supabase exclusivo `financas-app` (`liajnsmwmnodczdwtnhk`). A tabela `finance_months` guarda um documento por usuário e mês, com chave composta e RLS por `auth.uid()`. A função `save_finance_month` usa controle de versão atômico: um dispositivo desatualizado recebe conflito em vez de sobrescrever os dados. Exporte o rascunho, atualize e confira os valores em caso de conflito.

`database/schema.sql` contém o schema aplicado. A chave **publishable** é pública por definição e só permite acesso aos dados do usuário autenticado. Nunca coloque uma chave secret/service_role no frontend. Dados financeiros não são gravados no localStorage; somente a sessão de autenticação persiste no navegador. O acesso ao antigo localStorage serve exclusivamente à migração manual.

O app pode validar os links de confirmação/recuperação diretamente, sem depender do redirecionamento do provedor. Para abrir diretamente os links de e-mail no app, configure no painel Supabase > Authentication > URL Configuration:

- Site URL: `https://joaoaquino-dev.github.io/financas-app/`
- Redirect URL: `https://joaoaquino-dev.github.io/financas-app/`

O serviço padrão de e-mail do Supabase tem limites e restringe os destinatários aos membros da organização. Para disponibilizar cadastros a outros usuários, configure um SMTP próprio em Authentication antes de divulgar. Esse projeto é separado da Pellum.

## Desenvolvimento

```sh
npm ci
npm run dev
npm test
npm run build
```

Configuração pública padrão em `src/lib/supabase.js`. Para outro projeto, defina `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` em `.env.local` e aplique o schema no projeto de destino.

O workflow `.github/workflows/deploy.yml` continua publicando `main` no GitHub Pages, com a base `/financas-app/`. Não é necessário migrar hospedagem.
