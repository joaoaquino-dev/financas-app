# Finanças Pessoais

Aplicativo de controle financeiro pessoal — controle renda, despesas e saldo mensal.

**Stack:** React 18 · Vite · Tailwind CSS

## Rodando localmente

npm install
npm run dev

## Deploy no GitHub Pages

1. Crie o repositório no GitHub
2. Em `vite.config.js`, altere `base` para o nome exato do seu repositório:
   ```js
   base: '/nome-do-seu-repo/',
   ```
3. Nas configurações do repositório:
   - Vá em **Settings → Pages**
   - Em **Source**, selecione **GitHub Actions**
4. Faça push para a branch `main` — o deploy acontece automaticamente via GitHub Actions.

## Funcionalidades

- Resumo mensal com saldo, totais e % comprometida
- Barra de progresso com cor dinâmica (verde → amarelo → vermelho)
- Gráfico Renda vs Despesas atualizado em tempo real
- Tabelas editáveis com máscara monetária (R$)
- Dados salvos automaticamente no localStorage
- Responsivo para mobile
