import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  toggleLikePost,
  hasUserLikedPost,
  addCommentToPost,
  getPostComments,
  type Comment,
} from '../lib/post-interactions';

const { width, height } = Dimensions.get('window');

interface Spark {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  videoUrl: string;
  thumbnailUrl: string;
  caption: string;
  likes: number;
  comments: number;
  shares: number;
  audioName: string;
  duration: number;
}

// Mock data para Sparks
const mockSparks: Spark[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Alice Johnson',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    caption: 'Explorando a cidade hoje! 🏛️✨ #travel #adventure',
    likes: 1250,
    comments: 89,
    shares: 45,
    audioName: 'Áudio original - Alice Johnson',
    duration: 15,
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Bob Smith',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
    caption: 'Workout session completa! 💪 Quem mais treina hoje?',
    likes: 890,
    comments: 67,
    shares: 23,
    audioName: 'Áudio original - Bob Smith',
    duration: 20,
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Charlie Brown',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80',
    caption: 'Nova receita testada! 🍳✨ Ficou incrível!',
    likes: 2100,
    comments: 156,
    shares: 78,
    audioName: 'Áudio original - Charlie Brown',
    duration: 12,
  },
  {
    id: '4',
    userId: 'user4',
    userName: 'Diana Prince',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    caption: 'Pôr do sol incrível hoje! 🌅 Momentos assim são especiais',
    likes: 3400,
    comments: 234,
    shares: 120,
    audioName: 'Áudio original - Diana Prince',
    duration: 18,
  },
];

interface SparkItemProps {
  spark: Spark;
  isActive: boolean;
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  onShare: (id: string) => void;
}

function SparkItem({ spark, isActive, onLike, onComment, onShare }: SparkItemProps) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [isLiked, setIsLiked] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [likeCount, setLikeCount] = useState(spark.likes);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentCount, setCommentCount] = useState(spark.comments);

  useEffect(() => {
    if (user?.id && spark.id) {
      checkLikeStatus();
    }
  }, [user, spark.id]);

  const checkLikeStatus = async () => {
    if (!user?.id) return;
    try {
      const hasLiked = await hasUserLikedPost(spark.id, user.id);
      setIsLiked(hasLiked);
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const handleLike = async () => {
    if (!user?.id) {
      Alert.alert('Atenção', 'Você precisa estar logado para curtir.');
      return;
    }

    if (isLiking) return;

    setIsLiking(true);
    try {
      const newLiked = await toggleLikePost(spark.id, user.id);
      setIsLiked(newLiked);
      setLikeCount(prev => newLiked ? prev + 1 : prev - 1);
      onLike(spark.id);
    } catch (error) {
      console.error('Error toggling like:', error);
      Alert.alert('Erro', 'Não foi possível curtir. Tente novamente.');
    } finally {
      setIsLiking(false);
    }
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleOpenComments = async () => {
    setShowComments(true);
    if (comments.length === 0) {
      await loadComments();
    }
  };

  const loadComments = async () => {
    setIsLoadingComments(true);
    try {
      const fetchedComments = await getPostComments(spark.id);
      setComments(fetchedComments);
    } catch (error) {
      console.error('Error loading comments:', error);
      Alert.alert('Erro', 'Não foi possível carregar os comentários.');
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !user || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      await addCommentToPost(
        spark.id,
        user.id,
        user.name || user.username || 'Usuário',
        user.photoURL || undefined,
        commentText.trim()
      );
      setCommentText('');
      setCommentCount(prev => prev + 1);
      await loadComments();
    } catch (error) {
      console.error('Error submitting comment:', error);
      Alert.alert('Erro', 'Não foi possível enviar o comentário.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return 'agora';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 8640000);
      
      if (minutes < 1) return 'agora';
      if (minutes < 60) return `${minutes}m`;
      if (hours < 24) return `${hours}h`;
      if (days < 7) return `${days}d`;
      return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
    } catch {
      return 'agora';
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <View style={styles.sparkContainer}>
      {/* Thumbnail/Video Placeholder */}
      <TouchableOpacity
        style={styles.videoContainer}
        activeOpacity={1}
        onPress={handlePause}
      >
        <Image
          source={{ uri: spark.thumbnailUrl }}
          style={styles.videoThumbnail}
          resizeMode="cover"
        />
        {isPaused && (
          <View style={styles.pauseOverlay}>
            <Ionicons name="play" size={64} color="#fff" />
          </View>
        )}
      </TouchableOpacity>


      {/* Right Side Actions */}
      <View style={styles.rightActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleLike}
          activeOpacity={0.7}
          disabled={isLiking}
        >
          {isLiking ? (
            <ActivityIndicator size="small" color="#E91E63" />
          ) : (
            <>
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={32}
                color={isLiked ? '#E91E63' : '#fff'}
              />
              <Text style={styles.actionCount}>{formatNumber(likeCount)}</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleOpenComments}
          activeOpacity={0.7}
        >
          <Ionicons name="chatbubble-outline" size={28} color="#fff" />
          <Text style={styles.actionCount}>{formatNumber(commentCount)}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onShare(spark.id)}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-redo-outline" size={28} color="#fff" />
          <Text style={styles.actionCount}>{formatNumber(spark.shares)}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
          <View style={styles.actionIconContainer}>
            <Ionicons name="bookmark-outline" size={28} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Bottom Info */}
      <View style={styles.bottomInfo}>
        {/* User Info com Avatar e Caption */}
        <View style={styles.userInfoBottom}>
          <TouchableOpacity style={styles.followButtonBottom} activeOpacity={0.8}>
            <Image
              source={{ uri: spark.userAvatar || 'https://via.placeholder.com/50' }}
              style={styles.userAvatarBottom}
            />
            <Ionicons name="add-circle" size={18} color="#E91E63" style={styles.followIconBottom} />
          </TouchableOpacity>
          <View style={styles.userInfoContent}>
            <View style={styles.userInfoHeader}>
              <Text style={styles.userNameBottom}>@{spark.userName}</Text>
              <TouchableOpacity style={styles.followTextButton} activeOpacity={0.7}>
                <Text style={styles.followText}>Seguir</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.caption} numberOfLines={3}>
              {spark.caption}
            </Text>
            <View style={styles.audioContainer}>
              <Ionicons name="musical-notes" size={13} color="#fff" />
              <Text style={styles.audioName} numberOfLines={1}>
                {spark.audioName}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Modal de Comentários */}
      <Modal
        visible={showComments}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowComments(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.modalContent}>
            {/* Header do Modal */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Comentários</Text>
              <TouchableOpacity
                onPress={() => setShowComments(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Lista de Comentários */}
            <ScrollView
              style={styles.commentsList}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {isLoadingComments ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#007AFF" />
                </View>
              ) : comments.length > 0 ? (
                comments.map((comment) => (
                  <View key={comment.commentId} style={styles.commentItem}>
                    <Image
                      source={{
                        uri: comment.userAvatar || 'https://via.placeholder.com/40'
                      }}
                      style={styles.commentAvatar}
                    />
                    <View style={styles.commentContent}>
                      <View style={styles.commentHeader}>
                        <Text style={styles.commentUserName}>{comment.userName}</Text>
                        <Text style={styles.commentTime}>
                          {formatTime(comment.createdAt)}
                        </Text>
                      </View>
                      <Text style={styles.commentText}>{comment.text}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyComments}>
                  <Ionicons name="chatbubble-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyCommentsText}>
                    Nenhum comentário ainda
                  </Text>
                  <Text style={styles.emptyCommentsSubtext}>
                    Seja o primeiro a comentar!
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Input de Comentário */}
            {user && (
              <View style={styles.commentInputContainer}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Escreva um comentário..."
                  placeholderTextColor="#000000"
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                  maxLength={500}
                  editable={!isSubmittingComment && !!user}
                />
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    (!commentText.trim() || isSubmittingComment || !user) && styles.sendButtonDisabled
                  ]}
                  onPress={handleSubmitComment}
                  disabled={!commentText.trim() || isSubmittingComment || !user}
                >
                  {isSubmittingComment ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="send" size={20} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

export default function SparksScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [sparks, setSparks] = useState<Spark[]>(mockSparks);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'foryou' | 'following'>('foryou');
  const flatListRef = useRef<FlatList>(null);
  const [viewableItems, setViewableItems] = useState<Set<string>>(new Set());

  const onViewableItemsChanged = useRef(({ viewableItems: items }: any) => {
    if (items.length > 0) {
      const visibleIds = new Set<string>(items.map((item: any) => item.key as string));
      setViewableItems(visibleIds);
      setCurrentIndex(items[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleLike = (id: string) => {
    // Atualização já feita no componente
  };

  const handleComment = (id: string) => {
    // Comentários abertos via modal no componente
  };

  const handleShare = (id: string) => {
    // Compartilhar (implementar depois)
    console.log('Share spark:', id);
  };

  const renderItem = ({ item, index }: { item: Spark; index: number }) => {
    const isActive = viewableItems.has(item.id) && index === currentIndex;
    return (
      <SparkItem
        spark={item}
        isActive={isActive}
        onLike={handleLike}
        onComment={handleComment}
        onShare={handleShare}
      />
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Botão de Voltar */}
      <TouchableOpacity
        style={[styles.backButton, { top: insets.top + 12 }]}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <View style={styles.backButtonContainer}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </View>
      </TouchableOpacity>

      {/* Header com Tabs - Refinado */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => setActiveTab('foryou')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'foryou' && styles.tabTextActive]}>
              Para Você
            </Text>
            {activeTab === 'foryou' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
          <View style={styles.tabDivider} />
          <TouchableOpacity
            style={styles.tab}
            onPress={() => setActiveTab('following')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'following' && styles.tabTextActive]}>
              Seguindo
            </Text>
            {activeTab === 'following' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={sparks}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: height,
          offset: height * index,
          index,
        })}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
        removeClippedSubviews={true}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    zIndex: 200,
  },
  backButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    zIndex: 100,
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 28,
    padding: 1,
    gap: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  tab: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 110,
    position: 'relative',
    borderRadius: 24,
  },
  tabText: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  tabTextActive: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 3,
    left: 40,
    right: 40,
    height: 2.5,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  tabDivider: {
    width: 1,
    height: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginVertical: 6,
  },
  listContent: {
    // No padding needed, items fill full height
  },
  sparkContainer: {
    width,
    height,
    position: 'relative',
  },
  videoContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  pauseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfoBottom: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  followButtonBottom: {
    position: 'relative',
  },
  userAvatarBottom: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#fff',
  },
  followIconBottom: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#000',
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  userInfoContent: {
    flex: 1,
    gap: 6,
  },
  userInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 2,
  },
  userNameBottom: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  followTextButton: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 18,
    backgroundColor: '#E91E63',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  followText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  rightActions: {
    position: 'absolute',
    right: 16,
    bottom: 120,
    alignItems: 'center',
    gap: 28,
    zIndex: 10,
  },
  actionButton: {
    alignItems: 'center',
    gap: 6,
    padding: 4,
  },
  actionIconContainer: {
    // Container para ícones de ação se necessário
  },
  actionCount: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 80,
    padding: 16,
    paddingBottom: 50,
    zIndex: 10,
  },
  caption: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  audioName: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '500',
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    flex: 0.9,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  commentsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  commentItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  commentTime: {
    fontSize: 12,
    color: '#999',
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  emptyComments: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyCommentsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 4,
  },
  emptyCommentsSubtext: {
    fontSize: 14,
    color: '#999',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    marginRight: 8,
    fontSize: 14,
    color: '#333',
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
    backgroundColor: '#ccc',
  },
});
