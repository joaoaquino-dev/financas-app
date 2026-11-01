# Finanças pessoais

Planejamento mensal em React + Vite + Tailwind, publicado no GitHub Pages:
https://joaoaquino-dev.github.io/financas-app/

## Como usar

1. Entre na sua conta. No navegador com dados da versão antiga, escolha o mês e use **Importar dados antigos para este mês**. Confira e salve. O original `financasApp_v2` fica preservado no navegador.
2. Cadastre rendas e contas do **mês de pagamento**. Os valores são editáveis. Em **Repetição e vencimento**, classifique cada despesa como fixa, variável, parcelada, cartão ou só neste mês. As despesas antigas começam como variáveis, sem alterar os valores salvos.
3. Para renda recorrente, informe a previsão. Ao marcar **Recebido**, ajuste o **valor recebido de verdade**. O resumo considera esse valor e mantém a previsão original. No próximo mês, o último recebido é sugerido como nova previsão.
4. Para uma compra parcelada avulsa, use o tipo **Parcelada**, com valor de uma parcela e a parcela atual/total do mês selecionado (ex.: 4/10).
5. Para um cartão, informe a **fatura total**, já incluindo as parcelas. Dentro de **Configurar e ver parcelas**, cadastre e edite as compras parceladas. O cadastro não soma ao total por padrão; só marque a opção de somar se a parcela ainda não estiver incluída. Remover ou editar um detalhamento não muda o total informado da fatura. Não cadastre a mesma parcela também como despesa separada.
6. **Somar compra** acrescenta uma compra avulsa ao total atual. A fatura total continua podendo ser substituída manualmente. A máscara usa centavos: digitar `10000` resulta em R$ 100,00.
7. Informe vencimentos opcionais, marque contas como **Pago** e use os filtros para ver pendentes, quitadas ou vencidas. Dias 29–31 são ajustados ao último dia dos meses mais curtos. Não há pagamentos parciais nem controle de saldo bancário.
8. Clique em **Salvar alterações**. Depois, use **Preparar próximo mês**: revise os valores, vencimentos e itens sugeridos antes de confirmar. A confirmação já salva o novo mês. O mês de origem não é alterado e um mês existente nunca é sobrescrito por esse fluxo.

### O que vai para o próximo mês

- **Fixa e variável:** repetem o valor como previsão, com vencimento e status pendente.
- **Parcelada:** avança uma parcela; deixa de aparecer após a última.
- **Cartão:** continua com total igual à soma das parcelas restantes. Compras avulsas não se repetem. Cartões sem parcelas restantes começam zerados.
- **Só neste mês:** não se repete.
- **Renda recorrente:** usa o último recebido ou, se não recebeu, a previsão. Começa como não recebida.

O resumo mostra rendas consideradas, despesas totais, saldo previsto e valores que faltam pagar/receber. O saldo previsto não é o saldo de uma conta bancária. Marcar uma conta paga não remove essa despesa do planejamento.

No outro dispositivo, use a mesma conta. O app carrega os dados ao abrir e atualiza ao voltar à aba e a cada 30 segundos, sem edições locais pendentes. Edições pendentes recebem aviso antes de sair, trocar de mês ou recarregar. Sem conexão, permanecem na tela, mas precisam ser salvas antes de fechar; não há edição offline persistente.

**Exportar backup** inclui rascunhos, parcelas, vencimentos e recebimentos. **Importar backup** aceita arquivos novos e antigos. A importação substitui os itens do mês selecionado após confirmação e exige salvar em seguida.

## Banco e autenticação

Projeto Supabase exclusivo `financas-app` (`liajnsmwmnodczdwtnhk`). A tabela `finance_months` guarda um documento por usuário e mês, com chave composta e RLS por `auth.uid()`. A função `save_finance_month` usa controle de versão atômico: um dispositivo desatualizado recebe conflito em vez de sobrescrever os dados. Exporte o rascunho, atualize e confira os valores em caso de conflito.

`database/schema.sql` contém o schema aplicado. O documento JSON na versão 2 mantém rendas, valores efetivamente recebidos, recorrência, vencimentos, pagamentos e parcelas. A leitura adapta documentos antigos sem modificar o histórico no banco; o novo formato é persistido ao salvar. A chave **publishable** é pública por definição e só permite acesso aos dados do usuário autenticado. Nunca coloque uma chave secret/service_role no frontend. Dados financeiros não são gravados no localStorage; somente a sessão de autenticação persiste no navegador. O acesso ao antigo localStorage serve exclusivamente à migração manual.

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
