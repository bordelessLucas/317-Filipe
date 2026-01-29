import { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, Alert, Modal, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { 
  toggleLikePost, 
  hasUserLikedPost, 
  repostPost, 
  addInspirationToPost, 
  savePost,
  addCommentToPost,
  getPostComments,
  type Comment
} from '../lib/post-interactions';

interface Post {
  id: string;
  userName: string;
  userAvatar?: string;
  timeAgo: string;
  text: string;
  imageUrl?: string;
  videoUrl?: string;
  likes: number;
  comments: number;
  shares: number;
  type?: 'default' | 'photo' | 'video' | 'poll' | 'live' | 'spark';
  poll?: {
    question: string;
    options: Array<{ id: string; text: string; votes: number }>;
    allowMultiple: boolean;
    userVotes?: string[];
  };
  isLive?: boolean;
  viewers?: number;
}

interface PostCardProps {
  post: Post;
}

const { width } = Dimensions.get('window');

export function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [isReposting, setIsReposting] = useState(false);
  const [inspired, setInspired] = useState(false);
  const [isInspiring, setIsInspiring] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [repostCount, setRepostCount] = useState(post.shares);
  const [imageError, setImageError] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Verifica se o usuário já curtiu o post ao carregar
  useEffect(() => {
    if (user?.id) {
      checkLikeStatus();
    }
  }, [user, post.id]);

  const checkLikeStatus = async () => {
    if (!user?.id) return;
    try {
      const hasLiked = await hasUserLikedPost(post.id, user.id);
      setLiked(hasLiked);
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const handleLike = async () => {
    if (!user?.id) {
      Alert.alert('Atenção', 'Você precisa estar logado para curtir posts.');
      return;
    }

    if (isLiking) return;

    setIsLiking(true);
    try {
      const newLiked = await toggleLikePost(post.id, user.id);
      setLiked(newLiked);
      setLikeCount(prev => newLiked ? prev + 1 : prev - 1);
    } catch (error) {
      console.error('Error toggling like:', error);
      Alert.alert('Erro', 'Não foi possível curtir o post. Tente novamente.');
    } finally {
      setIsLiking(false);
    }
  };

  const handleRepost = async () => {
    if (!user?.id) {
      Alert.alert('Atenção', 'Você precisa estar logado para republicar posts.');
      return;
    }

    if (isReposting) return;

    setIsReposting(true);
    try {
      const newReposted = await repostPost(post.id, user.id);
      setReposted(newReposted);
      setRepostCount(prev => newReposted ? prev + 1 : prev - 1);
      Alert.alert('Sucesso!', newReposted ? 'Post republicado no seu feed!' : 'Repost removido.');
    } catch (error) {
      console.error('Error reposting:', error);
      Alert.alert('Erro', 'Não foi possível republicar o post.');
    } finally {
      setIsReposting(false);
    }
  };

  const handleInspiration = async () => {
    if (!user?.id) {
      Alert.alert('Atenção', 'Você precisa estar logado para adicionar inspirações.');
      return;
    }

    if (isInspiring) return;

    setIsInspiring(true);
    try {
      const newInspired = await addInspirationToPost(post.id, user.id);
      setInspired(newInspired);
    } catch (error) {
      console.error('Error adding inspiration:', error);
      Alert.alert('Erro', 'Não foi possível adicionar inspiração.');
    } finally {
      setIsInspiring(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) {
      Alert.alert('Atenção', 'Você precisa estar logado para salvar posts.');
      return;
    }

    if (isSaving) return;

    setIsSaving(true);
    try {
      const newSaved = await savePost(post.id, user.id);
      setSaved(newSaved);
      Alert.alert('Sucesso!', newSaved ? 'Post salvo!' : 'Post removido dos salvos.');
    } catch (error) {
      console.error('Error saving post:', error);
      Alert.alert('Erro', 'Não foi possível salvar o post.');
    } finally {
      setIsSaving(false);
    }
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
      const fetchedComments = await getPostComments(post.id);
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
        post.id,
        user.id,
        user.name || user.username || 'Usuário',
        user.avatar || undefined,
        commentText.trim()
      );
      setCommentText('');
      Alert.alert('Sucesso!', 'Comentário publicado!');
      await loadComments(); // Recarrega comentários
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
      const days = Math.floor(diff / 86400000);
      
      if (minutes < 1) return 'agora';
      if (minutes < 60) return `${minutes}m`;
      if (hours < 24) return `${hours}h`;
      if (days < 7) return `${days}d`;
      return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
    } catch {
      return 'agora';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header do Post */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            {post.userAvatar ? (
              <Image 
                source={{ uri: post.userAvatar }} 
                style={styles.avatarImage}
                onError={() => setImageError(true)}
              />
            ) : (
              <Ionicons name="person" size={18} color="#007AFF" />
            )}
          </View>
          <View>
            <Text style={styles.userName}>{post.userName}</Text>
            <Text style={styles.timeAgo}>{post.timeAgo}</Text>
          </View>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={18} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Texto do Post */}
      {post.text && (
        <Text style={styles.postText}>{post.text}</Text>
      )}

      {/* Live Indicator */}
      {post.isLive && (
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>AO VIVO</Text>
          {post.viewers && (
            <Text style={styles.viewersText}>{post.viewers.toLocaleString()} assistindo</Text>
          )}
        </View>
      )}

      {/* Poll */}
      {post.type === 'poll' && post.poll && (
        <View style={styles.pollContainer}>
          <Text style={styles.pollQuestion}>{post.poll.question}</Text>
          {post.poll.options.map((option) => {
            const totalVotes = post.poll!.options.reduce((sum, opt) => sum + opt.votes, 0);
            const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
            const isVoted = post.poll!.userVotes?.includes(option.id);
            
            return (
              <TouchableOpacity
                key={option.id}
                style={[styles.pollOption, isVoted && styles.pollOptionVoted]}
                activeOpacity={0.7}
              >
                <View style={styles.pollOptionContent}>
                  <Text style={styles.pollOptionText}>{option.text}</Text>
                  <Text style={styles.pollPercentage}>{percentage.toFixed(0)}%</Text>
                </View>
                <View style={[styles.pollBar, { width: `${percentage}%` }]} />
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Imagem do Post */}
      {post.imageUrl && !imageError && post.type !== 'spark' && (
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: post.imageUrl }} 
            style={styles.postImage}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        </View>
      )}

      {/* Video do Post */}
      {post.videoUrl && post.type !== 'spark' && (
        <View style={styles.videoContainer}>
          <View style={styles.videoPlaceholder}>
            <Ionicons name="play-circle" size={48} color="#fff" />
            <Text style={styles.videoLabel}>Vídeo</Text>
          </View>
        </View>
      )}

      {/* Spark Video (vertical format) */}
      {post.type === 'spark' && post.videoUrl && (
        <View style={styles.sparkContainer}>
          <View style={styles.sparkVideoPlaceholder}>
            <Ionicons name="play-circle" size={64} color="#fff" />
            <Text style={styles.sparkLabel}>Spark</Text>
          </View>
        </View>
      )}

      {/* Divisor */}
      <View style={styles.divider} />

      {/* Ações */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleLike}
          activeOpacity={0.6}
          disabled={isLiking}
        >
          {isLiking ? (
            <ActivityIndicator size="small" color="#E91E63" />
          ) : (
            <>
              <Ionicons 
                name={liked ? "heart" : "heart-outline"} 
                size={20} 
                color={liked ? "#E91E63" : "#666"} 
              />
              {likeCount > 0 && (
                <Text style={[styles.actionCount, liked && styles.actionCountLiked]}>
                  {likeCount}
                </Text>
              )}
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleOpenComments}
          activeOpacity={0.6}
        >
          <Ionicons 
            name={showComments ? "chatbubble" : "chatbubble-outline"} 
            size={20} 
            color={showComments ? "#007AFF" : "#666"} 
          />
          {(comments.length > 0 || post.comments > 0) && (
            <Text style={[styles.actionCount, showComments && styles.actionCountActive]}>
              {comments.length || post.comments}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleRepost}
          activeOpacity={0.6}
          disabled={isReposting}
        >
          {isReposting ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <>
              <Ionicons 
                name={reposted ? "repeat" : "repeat-outline"} 
                size={20} 
                color={reposted ? "#007AFF" : "#666"} 
              />
              {repostCount > 0 && (
                <Text style={[styles.actionCount, reposted && styles.actionCountActive]}>
                  {repostCount}
                </Text>
              )}
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleSave}
          activeOpacity={0.6}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFA726" />
          ) : (
            <Ionicons 
              name={saved ? "bookmark" : "bookmark-outline"} 
              size={20} 
              color={saved ? "#FFA726" : "#666"} 
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleInspiration}
          activeOpacity={0.6}
          disabled={isInspiring}
        >
          {isInspiring ? (
            <ActivityIndicator size="small" color="#9C27B0" />
          ) : (
            <Ionicons 
              name={inspired ? "sparkles" : "sparkles-outline"} 
              size={20} 
              color={inspired ? "#9C27B0" : "#666"} 
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Modal de Comentários */}
      <Modal
        visible={showComments}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowComments(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Comentários</Text>
            <TouchableOpacity onPress={() => setShowComments(false)}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.commentsList}>
            {isLoadingComments ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
              </View>
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <View key={comment.commentId} style={styles.commentItem}>
                  <View style={styles.commentAvatar}>
                    <Ionicons name="person-circle" size={40} color="#007AFF" />
                  </View>
                  <View style={styles.commentContent}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.commentUserName}>{comment.userName}</Text>
                      <Text style={styles.commentTime}>{formatTime(comment.createdAt)}</Text>
                    </View>
                    <Text style={styles.commentText}>{comment.text}</Text>
                    {comment.likes > 0 && (
                      <Text style={styles.commentLikes}>{comment.likes} curtidas</Text>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyComments}>
                <Ionicons name="chatbubble-outline" size={64} color="#ccc" />
                <Text style={styles.emptyCommentsText}>Nenhum comentário ainda</Text>
                <Text style={styles.emptyCommentsSubtext}>Seja o primeiro a comentar!</Text>
              </View>
            )}
          </ScrollView>

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
              style={[styles.sendButton, (!commentText.trim() || isSubmittingComment || !user) && styles.sendButtonDisabled]}
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
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 8,
    borderBottomColor: '#f5f5f5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#007AFF',
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  timeAgo: {
    fontSize: 11,
    color: '#999',
    marginTop: 1,
  },
  postText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  imageContainer: {
    width: width,
    marginBottom: 8,
  },
  postImage: {
    width: '100%',
    height: width * 0.6,
    backgroundColor: '#f0f0f0',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 10,
    marginBottom: 8,
    borderRadius: 20,
    gap: 6,
    alignSelf: 'flex-start',
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
  viewersText: {
    color: '#fff',
    fontSize: 11,
    opacity: 0.9,
  },
  pollContainer: {
    marginHorizontal: 10,
    marginBottom: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
  },
  pollQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  pollOption: {
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    position: 'relative',
  },
  pollOptionVoted: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  pollOptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    zIndex: 1,
  },
  pollOptionText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  pollPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  pollBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: '#E3F2FD',
    zIndex: 0,
  },
  videoContainer: {
    width: width,
    marginBottom: 8,
  },
  videoPlaceholder: {
    width: '100%',
    height: width * 0.6,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoLabel: {
    color: '#fff',
    marginTop: 8,
    fontSize: 14,
  },
  sparkContainer: {
    width: width,
    marginBottom: 8,
    alignItems: 'center',
  },
  sparkVideoPlaceholder: {
    width: width * 0.6,
    height: width * 1.07, // 9:16 aspect ratio
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  sparkLabel: {
    color: '#fff',
    marginTop: 8,
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 10,
    marginVertical: 6,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    gap: 4,
  },
  actionCount: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginLeft: 2,
  },
  actionCountLiked: {
    color: '#E91E63',
  },
  actionCountActive: {
    color: '#007AFF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  commentsList: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  commentAvatar: {
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  commentTime: {
    fontSize: 12,
    color: '#999',
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 4,
  },
  commentLikes: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  emptyComments: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyCommentsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptyCommentsSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
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
