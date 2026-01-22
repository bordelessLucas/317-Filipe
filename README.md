# CONNECT - Expo App

Aplicativo mobile CONNECT convertido para Expo/React Native.

## 🚀 Como Rodar

### Pré-requisitos
- Node.js instalado
- Expo Go app no celular ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) | [iOS](https://apps.apple.com/app/expo-go/id982107779))

### Instalação

```bash
npm install
```

### Iniciar o Servidor

```bash
npm start
```

Ou comandos específicos:

```bash
npm run android   # Abre no Android
npm run ios      # Abre no iOS (Mac only)
npm run web      # Abre no navegador
```

### Testar no Celular

1. Execute `npm start`
2. Abra o app **Expo Go** no seu celular
3. Escaneie o QR Code que aparece no terminal
4. O app será carregado no seu celular!

## 📱 Estrutura

```
app/
├── _layout.tsx          # Layout raiz
├── (tabs)/              # Navegação por tabs
│   ├── _layout.tsx      # Layout das tabs
│   ├── index.tsx        # Feed
│   ├── communities.tsx  # Comunidades
│   ├── events.tsx       # Eventos
│   └── profile.tsx      # Perfil
└── login.tsx           # Tela de login
```

## 🛠️ Tecnologias

- **Expo** - Framework React Native
- **Expo Router** - Navegação baseada em arquivos
- **React Native** - Framework mobile
- **TypeScript** - Tipagem estática
- **Firebase** - Backend (configuração pendente)

## 📝 Status

✅ Estrutura base configurada  
✅ Navegação por tabs funcionando  
✅ Telas principais criadas  
🔄 Componentes UI em desenvolvimento  
🔄 Integração Firebase pendente  

## 🎯 Próximos Passos

1. Implementar componentes UI nativos
2. Conectar com Firebase
3. Adicionar autenticação
4. Implementar funcionalidades completas

---

**Nota**: A pasta `src/` contém código legado do Next.js e pode ser ignorada ou removida.
