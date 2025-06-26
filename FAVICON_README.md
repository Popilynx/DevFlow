# Favicon DevFlow

## Ícones Criados

✅ **favicon.svg** - Favicon principal em SVG (32x32)  
⏳ **favicon.ico** - Favicon ICO para compatibilidade  
⏳ **icon-192x192.png** - Ícone PWA 192x192  
⏳ **icon-512x512.png** - Ícone PWA 512x512  
⏳ **apple-touch-icon.png** - Ícone Apple Touch 180x180  

## Design do Favicon

O favicon representa:
- **Código**: Chaves `{ }` em branco
- **Desenvolvimento**: Símbolo de código `<>` 
- **Flow**: Seta dourada representando fluxo/produtividade
- **Cores**: Azul (#3b82f6) com borda azul escura (#1d4ed8)

## Como Gerar os PNGs

### Opção 1: Ferramentas Online
1. Acesse [favicon.io](https://favicon.io/favicon-converter/)
2. Faça upload do `favicon.svg`
3. Baixe os ícones gerados
4. Substitua os arquivos placeholder

### Opção 2: Figma/Sketch
1. Abra o `favicon.svg` no Figma
2. Exporte em diferentes tamanhos:
   - 16x16, 32x32 (favicon.ico)
   - 192x192 (icon-192x192.png)
   - 512x512 (icon-512x512.png)
   - 180x180 (apple-touch-icon.png)

### Opção 3: Command Line (se tiver ImageMagick)
```bash
# Converter SVG para PNG
convert favicon.svg -resize 192x192 icon-192x192.png
convert favicon.svg -resize 512x512 icon-512x512.png
convert favicon.svg -resize 180x180 apple-touch-icon.png
```

## Configuração Atual

O `layout.tsx` já está configurado para usar:
- SVG como favicon principal
- ICO como fallback
- Manifest.json para PWA
- Apple Touch Icon para iOS

## Próximos Passos

1. Gerar os arquivos PNG a partir do SVG
2. Substituir os placeholders
3. Testar em diferentes navegadores
4. Verificar PWA no mobile

---

**Nota**: O favicon SVG já está funcionando e será exibido nos navegadores modernos! 