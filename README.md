# Gerador TS - HTML to TypeScript Conversion

Um gerador de keys moderno convertido de HTML vanilla para **React 19 + TypeScript + Vite**, pronto para deploy na Vercel.

## 🎯 Características

- ✅ **100% Funcional** - Toda a lógica original preservada
- ✅ **Visual Idêntico** - Design exatamente como o original
- ✅ **TypeScript** - Type-safe em toda a aplicação
- ✅ **Zustand Store** - Gerenciamento de estado com persistência localStorage
- ✅ **Vercel Ready** - Configurado para deploy sem portas expostas
- ✅ **Responsivo** - Mobile-first design
- ✅ **Sem Backend** - Aplicação 100% frontend

## 📦 Stack

- **React 19** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Zustand** - State Management
- **Tailwind CSS 4** - Styling
- **shadcn/ui** - Components

## 🚀 Início Rápido

### Instalação

```bash
cd /home/ubuntu/html-to-ts-generator
pnpm install
```

### Desenvolvimento

```bash
pnpm dev
```

Acesse `http://localhost:3000`

### Build

```bash
pnpm build
```

### Preview

```bash
pnpm preview
```

## 📁 Estrutura do Projeto

```
client/
  src/
    pages/          # Páginas principais (Home, Keys, Devices, etc)
    components/     # Componentes reutilizáveis
    store/          # Zustand store para gerenciamento de estado
    lib/            # Utilidades e helpers
    index.css       # Estilos globais (preservados do original)
    App.tsx         # Componente raiz
    main.tsx        # Entry point
  public/           # Arquivos estáticos
  index.html        # HTML template
```

## 🔧 Funcionalidades Implementadas

### Home Page
- ✅ Dashboard com estatísticas
- ✅ Gráfico de últimos 7 dias
- ✅ Keys recentes
- ✅ Limite de keys com barra de progresso
- ✅ Botões de ação rápida

### Keys Page
- ✅ Lista de todas as keys
- ✅ Busca e filtro
- ✅ Seleção múltipla
- ✅ Copiar para clipboard
- ✅ Badges de status

### Devices Page
- ✅ Lista de devices conectados
- ✅ Informações de ativação
- ✅ Ações por device (reset, revoke)
- ✅ Keys vinculadas

### Packages Page
- ✅ Gerenciamento de packages
- ✅ Adicionar/remover packages
- ✅ Toggle enable/disable
- ✅ URL protegida

### Profile Page
- ✅ Informações do usuário
- ✅ Logout
- ✅ Versão da app

### Create Modal
- ✅ Geração de keys
- ✅ Seleção de tipo e duração
- ✅ Preview da key
- ✅ Envio para API
- ✅ Resultado com copiar

## 💾 Persistência de Dados

Todos os dados são salvos em **localStorage** automaticamente:
- Keys geradas
- Packages
- Limite de uso
- Dados do gráfico
- Idioma selecionado

## 🌐 Deploy na Vercel

### Pré-requisitos
- Conta no GitHub
- Conta na Vercel

### Passos

1. **Fazer push para GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/seu-usuario/html-to-ts-generator.git
   git push -u origin main
   ```

2. **Conectar no Vercel**
   - Acesse https://vercel.com/new
   - Selecione seu repositório
   - Framework: Vite
   - Build Command: `pnpm build`
   - Output Directory: `dist`
   - Clique em Deploy

3. **Pronto!**
   - Seu site estará disponível em `https://seu-projeto.vercel.app`

## 🔌 API Integration

A aplicação se conecta à API padrão:
```
https://teste-api-mcok.vercel.app/keys
```

Você pode adicionar novos packages com URLs customizadas através da interface.

## 📝 Variáveis de Ambiente

Nenhuma variável de ambiente é necessária para o funcionamento básico. A aplicação funciona 100% no frontend.

## 🎨 Customização

### Cores
Edite as variáveis CSS em `client/src/index.css`:
```css
:root {
  --blue: #1a56e8;
  --green: #22c55e;
  --red: #ef4444;
  /* ... */
}
```

### Fonte
A fonte padrão é **DM Sans**. Para mudar, edite `client/src/index.css`.

## 🐛 Troubleshooting

### Dev server não inicia
```bash
pkill -f "vite"
pnpm dev
```

### Erro de TypeScript
```bash
pnpm check
```

### Limpar cache
```bash
rm -rf node_modules dist
pnpm install
pnpm dev
```

## 📄 Licença

MIT

## 🤝 Suporte

Para dúvidas ou issues, abra uma issue no repositório.

---

**Convertido com ❤️ de HTML para TypeScript**
