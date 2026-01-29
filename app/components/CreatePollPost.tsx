import { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

interface PollOption {
  id: string;
  text: string;
}

interface CreatePollPostProps {
  visible: boolean;
  onClose: () => void;
  onPost: (post: { text: string; question: string; options: PollOption[]; allowMultiple: boolean }) => void;
}

export function CreatePollPost({ visible, onClose, onPost }: CreatePollPostProps) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<PollOption[]>([
    { id: '1', text: '' },
    { id: '2', text: '' },
  ]);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, { id: Date.now().toString(), text: '' }]);
    } else {
      Alert.alert('Limite', 'Você pode adicionar no máximo 6 opções');
    }
  };

  const handleRemoveOption = (id: string) => {
    if (options.length > 2) {
      setOptions(options.filter(opt => opt.id !== id));
    } else {
      Alert.alert('Atenção', 'A enquete deve ter pelo menos 2 opções');
    }
  };

  const handleUpdateOption = (id: string, text: string) => {
    setOptions(options.map(opt => opt.id === id ? { ...opt, text } : opt));
  };

  const handlePost = async () => {
    if (!question.trim()) {
      Alert.alert('Atenção', 'Digite a pergunta da enquete');
      return;
    }

    const validOptions = options.filter(opt => opt.text.trim());
    if (validOptions.length < 2) {
      Alert.alert('Atenção', 'Adicione pelo menos 2 opções');
      return;
    }

    setIsPosting(true);
    try {
      // Simular postagem
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onPost({
        text: text.trim(),
        question: question.trim(),
        options: validOptions,
        allowMultiple,
      });
      
      // Reset
      setText('');
      setQuestion('');
      setOptions([
        { id: '1', text: '' },
        { id: '2', text: '' },
      ]);
      setAllowMultiple(false);
      onClose();
      
      Alert.alert('Sucesso!', 'Enquete publicada com sucesso!');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível publicar a enquete');
    } finally {
      setIsPosting(false);
    }
  };

  const handleClose = () => {
    if (!isPosting) {
      setText('');
      setQuestion('');
      setOptions([
        { id: '1', text: '' },
        { id: '2', text: '' },
      ]);
      setAllowMultiple(false);
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
          <Text style={styles.headerTitle}>Criar Enquete</Text>
          <TouchableOpacity
            onPress={handlePost}
            disabled={isPosting}
            style={[styles.postButton, isPosting && styles.postButtonDisabled]}
          >
            {isPosting ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <Text style={[styles.postButtonText, isPosting && styles.postButtonTextDisabled]}>
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

          {/* Text Input (optional) */}
          <TextInput
            style={styles.textInput}
            placeholder="Adicione um texto (opcional)"
            placeholderTextColor="#999"
            value={text}
            onChangeText={setText}
            multiline
            maxLength={500}
            editable={!isPosting}
          />

          {/* Question Input */}
          <View style={styles.section}>
            <Text style={styles.label}>Pergunta da Enquete *</Text>
            <TextInput
              style={styles.questionInput}
              placeholder="Ex: Qual é a sua cor favorita?"
              placeholderTextColor="#999"
              value={question}
              onChangeText={setQuestion}
              maxLength={200}
              editable={!isPosting}
            />
          </View>

          {/* Options */}
          <View style={styles.section}>
            <Text style={styles.label}>Opções *</Text>
            {options.map((option, index) => (
              <View key={option.id} style={styles.optionContainer}>
                <TextInput
                  style={styles.optionInput}
                  placeholder={`Opção ${index + 1}`}
                  placeholderTextColor="#999"
                  value={option.text}
                  onChangeText={(text) => handleUpdateOption(option.id, text)}
                  maxLength={100}
                  editable={!isPosting}
                />
                {options.length > 2 && (
                  <TouchableOpacity
                    onPress={() => handleRemoveOption(option.id)}
                    disabled={isPosting}
                    style={styles.removeButton}
                  >
                    <Ionicons name="close-circle" size={24} color="#FF3B30" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            
            {options.length < 6 && (
              <TouchableOpacity
                style={styles.addOptionButton}
                onPress={handleAddOption}
                disabled={isPosting}
              >
                <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
                <Text style={styles.addOptionText}>Adicionar opção</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Allow Multiple Selection */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setAllowMultiple(!allowMultiple)}
              disabled={isPosting}
            >
              <View style={[styles.checkbox, allowMultiple && styles.checkboxChecked]}>
                {allowMultiple && <Ionicons name="checkmark" size={16} color="#fff" />}
              </View>
              <Text style={styles.checkboxLabel}>
                Permitir múltipla escolha
              </Text>
            </TouchableOpacity>
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
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  textInput: {
    fontSize: 16,
    color: '#333',
    minHeight: 60,
    marginBottom: 16,
    textAlignVertical: 'top',
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
  questionInput: {
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  optionInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  removeButton: {
    padding: 4,
  },
  addOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 8,
    marginTop: 8,
  },
  addOptionText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
  },
});
