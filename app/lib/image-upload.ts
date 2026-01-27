import { ref, uploadBytes, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebaseconfig';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

/**
 * Solicita permissão para acessar a galeria de fotos
 */
export async function requestImagePermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
}

/**
 * Solicita permissão para acessar a câmera
 */
export async function requestCameraPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === 'granted';
}

/**
 * Seleciona uma imagem da galeria
 */
export async function pickImageFromGallery(): Promise<string | null> {
  try {
    const hasPermission = await requestImagePermission();
    if (!hasPermission) {
      throw new Error('Permissão para acessar a galeria foi negada');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      return result.assets[0].uri;
    }
    return null;
  } catch (error) {
    console.error('Error picking image:', error);
    throw error;
  }
}

/**
 * Tira uma foto com a câmera
 */
export async function takePhotoWithCamera(): Promise<string | null> {
  try {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      throw new Error('Permissão para acessar a câmera foi negada');
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      return result.assets[0].uri;
    }
    return null;
  } catch (error) {
    console.error('Error taking photo:', error);
    throw error;
  }
}

/**
 * Converte uma URI local para Blob (compatível com React Native)
 */
async function uriToBlob(uri: string): Promise<Blob> {
  try {
    // No React Native, fetch funciona com URIs locais (file://)
    // Primeiro tenta com fetch direto
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const blob = await response.blob();
    
    // Verifica se o blob é válido
    if (!blob || blob.size === 0) {
      throw new Error('A imagem está vazia ou corrompida');
    }
    
    return blob;
  } catch (error: any) {
    console.error('Error converting URI to blob with fetch:', error);
    
    // Se fetch falhar, tenta ler como base64 e converter
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (!base64) {
        throw new Error('Não foi possível ler a imagem');
      }

      // Converte base64 para bytes manualmente
      const chars = base64.split('');
      const bytes = new Uint8Array(chars.length);
      
      // Para cada caractere base64, converte para byte
      // Base64 usa A-Z, a-z, 0-9, +, / e = para padding
      const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      
      let byteIndex = 0;
      for (let i = 0; i < chars.length; i += 4) {
        const enc1 = base64Chars.indexOf(chars[i]);
        const enc2 = base64Chars.indexOf(chars[i + 1]);
        const enc3 = base64Chars.indexOf(chars[i + 2]);
        const enc4 = base64Chars.indexOf(chars[i + 3]);
        
        const chr1 = (enc1 << 2) | (enc2 >> 4);
        const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        const chr3 = ((enc3 & 3) << 6) | enc4;
        
        bytes[byteIndex++] = chr1;
        if (enc3 !== 64) bytes[byteIndex++] = chr2;
        if (enc4 !== 64) bytes[byteIndex++] = chr3;
      }
      
      const blob = new Blob([bytes.slice(0, byteIndex)], { type: 'image/jpeg' });
      return blob;
    } catch (fallbackError: any) {
      console.error('Error with base64 fallback:', fallbackError);
      throw new Error('Não foi possível processar a imagem. Verifique se o arquivo existe e tente novamente.');
    }
  }
}

/**
 * Faz upload de uma imagem para o Firebase Storage
 */
export async function uploadImageToStorage(
  userId: string,
  imageUri: string,
  type: 'avatar' | 'banner'
): Promise<string> {
  if (!storage) {
    throw new Error('Firebase Storage não está inicializado');
  }

  try {
    // Verifica se a URI é válida
    if (!imageUri) {
      throw new Error('URI de imagem inválida');
    }

    console.log('📤 Iniciando upload de imagem:', { userId, type, uri: imageUri.substring(0, 50) + '...' });

    // Lê o arquivo como base64 usando expo-file-system
    let base64: string;
    try {
      base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      if (!base64 || base64.length === 0) {
        throw new Error('Não foi possível ler a imagem');
      }
      
      console.log('✅ Arquivo lido com sucesso, tamanho:', base64.length, 'caracteres');
    } catch (error: any) {
      console.error('❌ Erro ao ler arquivo:', error);
      throw new Error('Não foi possível ler a imagem. Verifique se o arquivo existe e tente novamente.');
    }

    // Cria referência no Storage
    const timestamp = Date.now();
    const filename = `${type}_${timestamp}.jpg`;
    const storageRef = ref(storage, `users/${userId}/${filename}`);

    console.log('📁 Referência criada:', `users/${userId}/${filename}`);

    // Faz upload usando uploadString com base64
    // Formato: 'data:image/jpeg;base64,{base64}'
    const base64DataUrl = `data:image/jpeg;base64,${base64}`;
    
    try {
      await uploadString(storageRef, base64DataUrl, 'data_url', {
        contentType: 'image/jpeg',
      });
      
      console.log('✅ Upload concluído com sucesso');
    } catch (uploadError: any) {
      console.error('❌ Erro no upload:', uploadError);
      console.error('❌ Detalhes do erro:', {
        code: uploadError.code,
        message: uploadError.message,
        serverResponse: uploadError.serverResponse,
      });
      
      // Se uploadString falhar, tenta com Blob como fallback
      try {
        console.log('🔄 Tentando fallback com Blob...');
        const blob = await uriToBlob(imageUri);
        await uploadBytes(storageRef, blob, {
          contentType: 'image/jpeg',
        });
        console.log('✅ Upload com Blob concluído');
      } catch (blobError: any) {
        console.error('❌ Erro no fallback Blob:', blobError);
        throw uploadError; // Lança o erro original
      }
    }

    // Obtém a URL de download
    const downloadURL = await getDownloadURL(storageRef);
    console.log('✅ URL de download obtida:', downloadURL.substring(0, 50) + '...');
    
    return downloadURL;
  } catch (error: any) {
    console.error('❌ Erro completo no upload:', error);
    console.error('❌ Stack:', error.stack);
    
    // Mensagens de erro mais amigáveis
    if (error.code === 'storage/unauthorized') {
      throw new Error('Você não tem permissão para fazer upload. Verifique as regras do Firebase Storage.');
    } else if (error.code === 'storage/canceled') {
      throw new Error('Upload cancelado.');
    } else if (error.code === 'storage/unknown') {
      const errorMessage = error.message || 'Erro desconhecido';
      const serverResponse = error.serverResponse || 'Nenhuma resposta do servidor';
      console.error('❌ Resposta do servidor:', serverResponse);
      throw new Error(`Erro no upload: ${errorMessage}. Verifique as regras do Firebase Storage e sua conexão.`);
    } else if (error.message) {
      throw error;
    } else {
      throw new Error('Erro ao fazer upload da imagem. Tente novamente.');
    }
  }
}

/**
 * Deleta uma imagem do Firebase Storage
 */
export async function deleteImageFromStorage(imageUrl: string): Promise<void> {
  if (!storage) {
    throw new Error('Firebase Storage não está inicializado');
  }

  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    // Não lança erro se a imagem não existir
    if ((error as any).code !== 'storage/object-not-found') {
      throw error;
    }
  }
}
