import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from './context/AuthContext';

const { width, height } = Dimensions.get('window');

export default function LiveViewerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [isLive, setIsLive] = useState(true);
  const [viewers, setViewers] = useState(1250);
  const [comments, setComments] = useState<Array<{ id: string; user: string; text: string; time: string }>>([
    { id: '1', user: 'Alice', text: 'Ótima transmissão!', time: '1m' },
    { id: '2', user: 'Bob', text: 'Muito interessante!', time: '30s' },
  ]);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    // Simular aumento de visualizadores
    const interval = setInterval(() => {
      if (isLive) {
        setViewers(prev => prev + Math.floor(Math.random() * 5));
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive]);

  const handleEndLive = () => {
    setIsLive(false);
    router.back();
  };

  const handleSendComment = () => {
    if (commentText.trim()) {
      setComments([
        {
          id: Date.now().toString(),
          user: user?.name || 'Você',
          text: commentText.trim(),
          time: 'agora',
        },
        ...comments,
      ]);
      setCommentText('');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Video Container (simulado) */}
      <View style={styles.videoContainer}>
        <View style={styles.videoPlaceholder}>
          <Ionicons name="radio" size={64} color="#fff" />
          <Text style={styles.liveLabel}>AO VIVO</Text>
        </View>

        {/* Live Indicator */}
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>AO VIVO</Text>
        </View>

        {/* Top Controls */}
        <View style={[styles.topControls, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.viewerCount}>
            <Ionicons name="eye" size={16} color="#fff" />
            <Text style={styles.viewerCountText}>{viewers.toLocaleString()}</Text>
          </View>
        </View>

        {/* Streamer Info */}
        <View style={styles.streamerInfo}>
          <View style={styles.streamerAvatar}>
            <Ionicons name="person" size={20} color="#007AFF" />
          </View>
          <View style={styles.streamerDetails}>
            <Text style={styles.streamerName}>{user?.name || 'Usuário'}</Text>
            <Text style={styles.streamTitle}>Tutorial de React Native</Text>
          </View>
        </View>

        {/* Right Side Actions */}
        <View style={styles.rightActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="heart-outline" size={28} color="#fff" />
            <Text style={styles.actionCount}>1.2K</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={28} color="#fff" />
            <Text style={styles.actionCount}>{comments.length}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Comments Sidebar */}
        <View style={styles.commentsContainer}>
          <ScrollView
            style={styles.commentsList}
            showsVerticalScrollIndicator={false}
            inverted
          >
            {comments.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <Text style={styles.commentUser}>{comment.user}:</Text>
                <Text style={styles.commentText}>{comment.text}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Bottom Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.commentInput}
            placeholder="Digite um comentário..."
            placeholderTextColor="#999"
            value={commentText}
            onChangeText={setCommentText}
            multiline
            maxLength={200}
          />
          <TouchableOpacity
            style={[styles.sendButton, !commentText.trim() && styles.sendButtonDisabled]}
            onPress={handleSendComment}
            disabled={!commentText.trim()}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* End Live Button (for streamer) */}
      {user && (
        <TouchableOpacity
          style={styles.endLiveButton}
          onPress={handleEndLive}
        >
          <Ionicons name="stop-circle" size={24} color="#fff" />
          <Text style={styles.endLiveText}>Encerrar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveLabel: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
  liveIndicator: {
    position: 'absolute',
    top: 60,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  liveText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  topControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewerCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  viewerCountText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  streamerInfo: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  streamerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streamerDetails: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  streamerName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  streamTitle: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
  },
  rightActions: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    alignItems: 'center',
    gap: 24,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  commentsContainer: {
    position: 'absolute',
    left: 16,
    bottom: 100,
    width: width * 0.6,
    maxHeight: 200,
  },
  commentsList: {
    flex: 1,
  },
  commentItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
    gap: 4,
  },
  commentUser: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  commentText: {
    color: '#fff',
    fontSize: 12,
    flex: 1,
  },
  inputContainer: {
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#333',
  },
  endLiveButton: {
    position: 'absolute',
    top: 100,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  endLiveText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
