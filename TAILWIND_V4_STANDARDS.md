# Tailwind CSS v4 Syntax Standards

Este documento define as regras estritas para edição de estilos e configuração CSS neste projeto, seguindo a arquitetura **Tailwind CSS v4**. Todo agente ou desenvolvedor deve seguir estas diretrizes ao modificar a UI.

## 1. Configuração e Entry Point

### ❌ O que NÃO fazer (Legacy v3)
- Não usar `tailwind.config.js` para estender temas.
- Não usar `@tailwind base;`, `@tailwind components;` ou `@tailwind utilities;`.
- Não depender de `postcss.config.js` se estiver usando o plugin Vite nativo.

### ✅ O que fazer (Standard v4)
No arquivo CSS principal (`index.css`), utilize a importação nativa e blocos de tema CSS:

```css
@import "tailwindcss";

@theme {
  /* Definição de Cores do Projeto */
  --color-brand-primary: #007AFF;
  --color-brand-secondary: #5AC8FA;
  
  /* Definição de Fontes */
  --font-sans: "Inter", system-ui, sans-serif;

  /* Espaçamentos customizados (se necessário) */
  --spacing-4xl: 20rem;
}
```

## 2. Safe Areas (Mobile/Capacitor)

Para aplicações móveis (iOS/Android), utilize utilitários customizados dentro da camada `@utility` para lidar com o "Notch" e a barra de navegação.

```css
@utility safe-top {
  padding-top: env(safe-area-inset-top);
}

@utility safe-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

@utility safe-padding {
  padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
}
```

**Uso no HTML/JSX:**
```tsx
<div className="h-full w-full bg-slate-50 safe-top safe-bottom">
  {/* Conteúdo */}
</div>
```

## 3. Sintaxe de Cores e Opacidade

O Tailwind v4 utiliza variáveis CSS nativas para cores.

- **Opacidade:** Use a sintaxe de modificador `/`.
  - ✅ `bg-blue-500/50`
  - ✅ `text-slate-900/80`

- **Cores Customizadas (definidas no @theme):**
  - ✅ `bg-brand-primary` (mapeia para `--color-brand-primary`)
  - ✅ `border-brand-secondary`

## 4. Container Queries

O v4 suporta container queries nativamente sem plugins extras.

- Marque o pai: `@container` (classe: `size-container` ou apenas `container` dependendo do setup).
- Estilize o filho: `ur-pai:bg-red-500`.

## 5. Gradientes e Animações

### Animações
Defina keyframes diretamente no CSS dentro de `@theme` se forem globais, ou use valores arbitrários para casos únicos.

```css
@theme {
  --animate-float: float 3s ease-in-out infinite;
  
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
}
```
**Uso:** `className="animate-float"`

### Gradientes
A sintaxe de gradiente permanece similar, mas a interpolação de cores é melhorada.
`bg-gradient-to-b from-blue-100 to-transparent`

## 6. Whitelisting e Classes Dinâmicas

O Tailwind v4 detecta classes estáticas. Evite construir strings de classes dinamicamente se possível.

### ❌ Evitar
```tsx
const color = "blue";
return <div className={`bg-${color}-500`} /> // O scanner pode não detectar
```

### ✅ Preferir (Mapas ou Classes Completas)
```tsx
const colors = {
  primary: "bg-blue-500",
  secondary: "bg-red-500"
};
return <div className={colors[type]} />
```

## 7. Reset e Defaults

Se precisar resetar estilos de formulário ou base, faça isso explicitamente após o import:

```css
@import "tailwindcss";

@layer base {
  html, body {
    @apply h-full w-full antialiased bg-slate-50 text-slate-900;
  }
}
```

---
**Nota:** Ao migrar componentes antigos, remova referências a `theme('colors.gray.500')` dentro de blocos `style={{}}` e prefira sempre classes utilitárias ou variáveis CSS (`var(--color-gray-500)`).
