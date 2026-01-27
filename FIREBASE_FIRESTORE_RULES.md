# Firebase Firestore Rules

Para que o app funcione corretamente, você precisa configurar as regras de segurança do Firestore.

## Regras Necessárias

Acesse o [Firebase Console](https://console.firebase.google.com/) > Firestore Database > Rules e configure:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regras para a coleção de usuários
    match /users/{userId} {
      // Permite leitura para qualquer pessoa autenticada
      allow read: if request.auth != null;
      
      // Permite escrita apenas para o próprio usuário
      allow create, update: if request.auth != null && request.auth.uid == userId;
      
      // Permite leitura de subcoleções (savedPosts, etc.)
      match /{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Regras para a coleção de posts
    match /posts/{postId} {
      // Permite leitura para qualquer pessoa autenticada
      allow read: if request.auth != null;
      
      // Permite escrita para qualquer pessoa autenticada (para criar posts)
      allow create: if request.auth != null;
      
      // Permite atualização apenas pelo criador do post (ou ajuste conforme necessário)
      allow update: if request.auth != null;
      
      // Permite leitura e escrita de subcoleções (likes, comments, reposts, inspirations)
      match /{subcollection=**} {
        allow read: if request.auth != null;
        allow write: if request.auth != null;
      }
    }
    
    // Regra padrão: nega acesso a tudo que não corresponda às regras acima
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Explicação das Regras

### Coleção `users`
- **Leitura**: Qualquer usuário autenticado pode ler dados de outros usuários (para exibir perfis)
- **Escrita**: Apenas o próprio usuário pode criar/atualizar seus dados
- **Subcoleções**: Apenas o próprio usuário pode acessar suas subcoleções (como `savedPosts`)

### Coleção `posts`
- **Leitura**: Qualquer usuário autenticado pode ler posts
- **Criação**: Qualquer usuário autenticado pode criar posts
- **Atualização**: Qualquer usuário autenticado pode atualizar posts (para interações como likes, comments)
- **Subcoleções**: Qualquer usuário autenticado pode ler e escrever em subcoleções (likes, comments, etc.)

## Como Aplicar

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá em **Firestore Database** > **Rules**
4. Cole as regras acima
5. Clique em **Publicar**

## Teste

Após aplicar as regras, o erro "Missing or insufficient permissions" deve desaparecer. Se ainda houver erro, verifique:

- Se o usuário está autenticado corretamente
- Se o `userId` corresponde ao `request.auth.uid`
- Se as regras foram publicadas corretamente

## Regras Mais Restritivas (Opcional)

Se você quiser regras mais restritivas, pode usar:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários: apenas leitura pública, escrita apenas pelo próprio usuário
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
      
      match /{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Posts: leitura pública, escrita apenas pelo criador
    match /posts/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      
      match /{subcollection=**} {
        allow read: if request.auth != null;
        allow write: if request.auth != null;
      }
    }
  }
}
```
