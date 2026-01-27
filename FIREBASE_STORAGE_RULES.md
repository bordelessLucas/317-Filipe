# Firebase Storage Rules

Para que o upload de imagens funcione corretamente, você precisa configurar as regras de segurança do Firebase Storage.

## Regras Necessárias

Acesse o [Firebase Console](https://console.firebase.google.com/) > Storage > Rules e configure:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Permite que usuários autenticados façam upload de suas próprias imagens
    match /users/{userId}/{allPaths=**} {
      // Permite leitura para qualquer pessoa (ou ajuste conforme necessário)
      allow read: if true;
      
      // Permite escrita apenas para o próprio usuário
      allow write: if request.auth != null && request.auth.uid == userId
        && request.resource.size < 5 * 1024 * 1024  // Limite de 5MB
        && request.resource.contentType.matches('image/.*');
    }
    
    // Regra padrão: nega acesso a tudo que não corresponda às regras acima
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## Verificações

1. ✅ Usuário está autenticado (`request.auth != null`)
2. ✅ Usuário só pode fazer upload em sua própria pasta (`request.auth.uid == userId`)
3. ✅ Arquivo é uma imagem (`contentType.matches('image/.*')`)
4. ✅ Tamanho máximo de 5MB (`size < 5 * 1024 * 1024`)

## Como Aplicar

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá em **Storage** > **Rules**
4. Cole as regras acima
5. Clique em **Publicar**

## Teste

Após aplicar as regras, tente fazer upload de uma imagem novamente. Se ainda houver erro, verifique:

- Se o usuário está autenticado
- Se o tamanho da imagem não excede 5MB
- Se o formato é uma imagem (JPEG, PNG, etc.)
- Se as regras foram publicadas corretamente
