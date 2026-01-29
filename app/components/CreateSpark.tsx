import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { ActionSheetIOS } from 'react-native';

const { width } = Dimensions.get('window');

interface CreateSparkProps {
  visible: boolean;
  onClose: () => void;
  onPost: (spark: { title: string; videoUri: string; thumbnailUri?: string }) => void;
}

export function CreateSpark({ visible, onClose, onPost }: CreateSparkProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const handleSelectVideo = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancelar', 'Gravar Vídeo', 'Escolher da Galeria'],
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) {
            await handleRecordVideo();
          } else if (buttonIndex === 2) {
            await handlePickFromGallery();
          }
        }
      );
    } else {
      Alert.alert(
        'Selecionar Vídeo',
        'Escolha uma opção',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Gravar Vídeo', onPress: handleRecordVideo },
          { text: 'Escolher da Galeria', onPress: handlePickFromGallery },
        ]
      );
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
        aspect: [9, 16], // Formato vertical estilo TikTok
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setVideoUri(result.assets[0].uri);
        // Gerar thumbnail (simulado - em produção, usar biblioteca de vídeo)
        setThumbnailUri(result.assets[0].uri);
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
        mediaTypes: ['videos'],
        allowsEditing: true,
        quality: 0.8,
        videoMaxDuration: 60,
        aspect: [9, 16],
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setVideoUri(result.assets[0].uri);
        setThumbnailUri(result.assets[0].uri);
      }
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível selecionar o vídeo');
    }
  };

  const handlePost = async () => {
    if (!videoUri) {
      Alert.alert('Atenção', 'Selecione ou grave um vídeo para postar');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Atenção', 'Digite um título para o Spark');
      return;
    }

    setIsPosting(true);
    try {
      // Simular upload
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onPost({
        title: title.trim(),
        videoUri,
        thumbnailUri: thumbnailUri || videoUri,
      });
      
      // Reset
      setTitle('');
      setVideoUri(null);
      setThumbnailUri(null);
      onClose();
      
      Alert.alert('Sucesso!', 'Spark publicado com sucesso!');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível publicar o Spark');
    } finally {
      setIsPosting(false);
    }
  };

  const handleClose = () => {
    if (!isPosting) {
      setTitle('');
      setVideoUri(null);
      setThumbnailUri(null);
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
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Criar Spark</Text>
          <TouchableOpacity
            onPress={handlePost}
            disabled={isPosting || !videoUri || !title.trim()}
            style={[styles.postButton, (!videoUri || !title.trim() || isPosting) && styles.postButtonDisabled]}
          >
            {isPosting ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <Text style={[styles.postButtonText, (!videoUri || !title.trim() || isPosting) && styles.postButtonTextDisabled]}>
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
                <Ionicons name="person" size={20} color="#007AFF" />
              ) : (
                <Ionicons name="person" size={20} color="#007AFF" />
              )}
            </View>
            <Text style={styles.userName}>{user?.name || 'Usuário'}</Text>
          </View>

          {/* Video Preview/Selector */}
          {videoUri ? (
            <View style={styles.videoContainer}>
              <View style={styles.videoPreview}>
                <Ionicons name="play-circle" size={64} color="#fff" />
                <Text style={styles.videoLabel}>Vídeo selecionado</Text>
              </View>
              <TouchableOpacity
                style={styles.removeVideoButton}
                onPress={() => {
                  setVideoUri(null);
                  setThumbnailUri(null);
                }}
                disabled={isPosting}
              >
                <Ionicons name="close-circle" size={32} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.selectVideoButton}
              onPress={handleSelectVideo}
              disabled={isPosting}
            >
              <Ionicons name="videocam" size={48} color="#007AFF" />
              <Text style={styles.selectVideoText}>Gravar ou Selecionar Vídeo</Text>
              <Text style={styles.selectVideoSubtext}>
                Vídeos verticais (9:16) funcionam melhor
              </Text>
            </TouchableOpacity>
          )}

          {/* Title Input */}
          <View style={styles.section}>
            <Text style={styles.label}>Título do Spark *</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="Adicione um título criativo..."
              placeholderTextColor="#999"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
              editable={!isPosting}
            />
            <Text style={styles.charCount}>{title.length}/100</Text>
          </View>

          {/* Tips */}
          <View style={styles.tipsContainer}>
            <Ionicons name="bulb-outline" size={20} color="#FFA726" />
            <View style={styles.tipsContent}>
              <Text style={styles.tipsTitle}>Dicas para um Spark incrível:</Text>
              <Text style={styles.tipsText}>• Vídeos verticais (9:16) têm melhor visualização</Text>
              <Text style={styles.tipsText}>• Mantenha o vídeo entre 15-60 segundos</Text>
              <Text style={styles.tipsText}>• Use títulos criativos e chamativos</Text>
            </View>
          </View>
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
    marginBottom: 24,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  videoContainer: {
    position: 'relative',
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  videoPreview: {
    width: '100%',
    height: width * 1.78, // 9:16 aspect ratio
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoLabel: {
    color: '#fff',
    marginTop: 8,
    fontSize: 14,
  },
  removeVideoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
  },
  selectVideoButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    borderRadius: 12,
    marginBottom: 24,
    backgroundColor: '#f9f9f9',
  },
  selectVideoText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginTop: 12,
  },
  selectVideoSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  titleInput: {
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  tipsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    gap: 12,
    marginBottom: 24,
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6F00',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 12,
    color: '#E65100',
    lineHeight: 18,
    marginBottom: 4,
  },
});
