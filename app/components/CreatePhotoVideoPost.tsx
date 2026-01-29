import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { pickImageFromGallery, takePhotoWithCamera } from '../lib/image-upload';
import * as ImagePicker from 'expo-image-picker';
import { ActionSheetIOS } from 'react-native';

interface CreatePhotoVideoPostProps {
  visible: boolean;
  onClose: () => void;
  onPost: (post: { text: string; mediaUri: string; mediaType: 'photo' | 'video' }) => void;
}

export function CreatePhotoVideoPost({ visible, onClose, onPost }: CreatePhotoVideoPostProps) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');
  const [isPosting, setIsPosting] = useState(false);

  const handleSelectMedia = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancelar', 'Tirar Foto', 'Gravar Vídeo', 'Escolher da Galeria'],
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) {
            await handleTakePhoto();
          } else if (buttonIndex === 2) {
            await handleRecordVideo();
          } else if (buttonIndex === 3) {
            await handlePickFromGallery();
          }
        }
      );
    } else {
      Alert.alert(
        'Selecionar Mídia',
        'Escolha uma opção',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Tirar Foto', onPress: handleTakePhoto },
          { text: 'Gravar Vídeo', onPress: handleRecordVideo },
          { text: 'Escolher da Galeria', onPress: handlePickFromGallery },
        ]
      );
    }
  };

  const handleTakePhoto = async () => {
    try {
      const uri = await takePhotoWithCamera();
      if (uri) {
        setMediaUri(uri);
        setMediaType('photo');
      }
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível tirar a foto');
    }
  };

  const handleRecordVideo = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar a câmera');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['videos'],
        allowsEditing: true,
        quality: 0.8,
        videoMaxDuration: 60,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setMediaUri(result.assets[0].uri);
        setMediaType('video');
      }
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível gravar o vídeo');
    }
  };

  const handlePickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar a galeria');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsEditing: true,
        quality: 0.8,
        videoMaxDuration: 60,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setMediaUri(asset.uri);
        setMediaType(asset.type === 'video' ? 'video' : 'photo');
      }
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível selecionar a mídia');
    }
  };

  const handlePost = async () => {
    if (!mediaUri) {
      Alert.alert('Atenção', 'Selecione uma foto ou vídeo para postar');
      return;
    }

    setIsPosting(true);
    try {
      // Simular upload (substituir por upload real depois)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onPost({
        text: text.trim(),
        mediaUri,
        mediaType,
      });
      
      // Reset
      setText('');
      setMediaUri(null);
      setMediaType('photo');
      onClose();
      
      Alert.alert('Sucesso!', 'Post publicado com sucesso!');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível publicar o post');
    } finally {
      setIsPosting(false);
    }
  };

  const handleClose = () => {
    if (!isPosting) {
      setText('');
      setMediaUri(null);
      setMediaType('photo');
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} disabled={isPosting}>
            <Text style={[styles.cancelButton, isPosting && styles.cancelButtonDisabled]}>
              Cancelar
            </Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nova Publicação</Text>
          <TouchableOpacity
            onPress={handlePost}
            disabled={isPosting || !mediaUri}
            style={[styles.postButton, (!mediaUri || isPosting) && styles.postButtonDisabled]}
          >
            {isPosting ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <Text style={[styles.postButtonText, (!mediaUri || isPosting) && styles.postButtonTextDisabled]}>
                Publicar
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* User Info */}
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              {user?.photoURL ? (
                <Image source={{ uri: user.photoURL }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={20} color="#007AFF" />
              )}
            </View>
            <Text style={styles.userName}>{user?.name || 'Usuário'}</Text>
          </View>

          {/* Text Input */}
          <TextInput
            style={styles.textInput}
            placeholder="O que está acontecendo?"
            placeholderTextColor="#999"
            value={text}
            onChangeText={setText}
            multiline
            maxLength={500}
            editable={!isPosting}
          />
          <Text style={styles.charCount}>{text.length}/500</Text>

          {/* Media Preview */}
          {mediaUri && (
            <View style={styles.mediaContainer}>
              {mediaType === 'photo' ? (
                <Image source={{ uri: mediaUri }} style={styles.mediaPreview} resizeMode="cover" />
              ) : (
                <View style={styles.videoContainer}>
                  <Ionicons name="play-circle" size={64} color="#fff" />
                  <Text style={styles.videoLabel}>Vídeo selecionado</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.removeMediaButton}
                onPress={() => setMediaUri(null)}
                disabled={isPosting}
              >
                <Ionicons name="close-circle" size={32} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          {/* Select Media Button */}
          {!mediaUri && (
            <TouchableOpacity
              style={styles.selectMediaButton}
              onPress={handleSelectMedia}
              disabled={isPosting}
            >
              <Ionicons name="image-outline" size={32} color="#007AFF" />
              <Text style={styles.selectMediaText}>
                Adicionar {mediaType === 'photo' ? 'Foto' : 'Vídeo'}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cancelButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  cancelButtonDisabled: {
    color: '#ccc',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  postButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#007AFF',
  },
  postButtonDisabled: {
    backgroundColor: '#ccc',
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  postButtonTextDisabled: {
    color: '#999',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  textInput: {
    fontSize: 16,
    color: '#333',
    minHeight: 100,
    marginBottom: 8,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginBottom: 16,
  },
  mediaContainer: {
    position: 'relative',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mediaPreview: {
    width: '100%',
    height: 300,
    backgroundColor: '#f0f0f0',
  },
  videoContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoLabel: {
    color: '#fff',
    marginTop: 8,
    fontSize: 14,
  },
  removeMediaButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
  },
  selectMediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    borderRadius: 12,
    gap: 12,
  },
  selectMediaText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
});
