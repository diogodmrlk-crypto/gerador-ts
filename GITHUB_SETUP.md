# 📱 GitHub Setup - Mobile Friendly

## Passo 1: Criar um repositório vazio no GitHub

1. Acesse https://github.com/new
2. Nome: `html-to-ts-generator`
3. Descrição: `Gerador de keys - React + TypeScript`
4. Deixe **Public** (ou Private se preferir)
5. **NÃO** marque "Add README"
6. Clique em **Create repository**

## Passo 2: Copiar o comando de setup

Após criar, você verá uma tela com comandos. Copie EXATAMENTE isto:

```bash
git init
git add .
git commit -m "Initial commit: HTML to React conversion"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/html-to-ts-generator.git
git push -u origin main
```

**Substitua `SEU_USUARIO` pelo seu username do GitHub**

## Passo 3: Executar no terminal

```bash
cd /home/ubuntu/html-to-ts-generator
```

Cole o comando acima (todo de uma vez ou linha por linha)

## Passo 4: Pronto! 🎉

Seu código está no GitHub! Acesse:
```
https://github.com/SEU_USUARIO/html-to-ts-generator
```

## Agora no Vercel (Mobile-friendly)

1. Acesse https://vercel.com/new
2. Clique em "Import Git Repository"
3. Cole: `https://github.com/SEU_USUARIO/html-to-ts-generator`
4. Clique em "Import"
5. Framework: **Vite**
6. Build Command: `pnpm build`
7. Output Directory: `dist`
8. Clique em **Deploy**

Pronto! Seu site estará em:
```
https://seu-projeto.vercel.app
```

---

**Dica:** Se der erro de autenticação no GitHub, use um **Personal Access Token**:
1. GitHub → Settings → Developer settings → Personal access tokens
2. Gere um novo token com permissão `repo`
3. Use assim:
```
git remote add origin https://SEU_TOKEN@github.com/SEU_USUARIO/html-to-ts-generator.git
```
