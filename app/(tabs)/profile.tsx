import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Dimensions,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import { PostCard } from '../components/PostCard';
import {
  getUserLikedPosts,
  getUserRepostedPosts,
  getUserSavedPosts,
  getPostById,
} from '../lib/post-interactions';
import {
  pickImageFromGallery,
  takePhotoWithCamera,
  uploadImageToStorage,
} from '../lib/image-upload';

const { width } = Dimensions.get('window');

type TabType = 'posts' | 'liked' | 'reposted' | 'saved' | 'sparks';

interface Post {
  id: string;
  userName: string;
  userAvatar?: string;
  timeAgo: string;
  text: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  shares: number;
}

export default function ProfileScreen() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [editedUsername, setEditedUsername] = useState(user?.username || '');
  const [editedBio, setEditedBio] = useState(user?.bio || '');
  const [editedLocation, setEditedLocation] = useState(user?.location || '');
  const [editedWebsite, setEditedWebsite] = useState(user?.website || '');
  const [editedPhone, setEditedPhone] = useState(user?.phone || '');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  
  // Estados para posts
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [repostedPosts, setRepostedPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [sparks, setSparks] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  // Mock posts do usuário (substituir por busca real no Firebase)
  const mockUserPosts: Post[] = [
    {
      id: 'user-post-1',
      userName: user?.name || 'Usuário',
      userAvatar: user?.photoURL,
      timeAgo: '1h',
      text: 'Este é um dos meus posts! Espero que vocês gostem.',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
      likes: 45,
      comments: 8,
      shares: 3,
    },
    {
      id: 'user-post-2',
      userName: user?.name || 'Usuário',
      userAvatar: user?.photoURL,
      timeAgo: '3d',
      text: 'Compartilhando uma experiência incrível que tive hoje!',
      likes: 89,
      comments: 15,
      shares: 7,
    },
  ];

  useEffect(() => {
    if (user?.id) {
      loadPosts();
    }
  }, [user, activeTab]);

  useEffect(() => {
    if (user) {
      setEditedName(user.name || '');
      setEditedUsername(user.username || '');
      setEditedBio(user.bio || '');
      setEditedLocation(user.location || '');
      setEditedWebsite(user.website || '');
      setEditedPhone(user.phone || '');
    }
  }, [user]);

  const loadPosts = async () => {
    if (!user?.id) return;

    setIsLoadingPosts(true);
    try {
      if (activeTab === 'liked') {
        const likedPostIds = await getUserLikedPosts(user.id);
        const postsData = await Promise.all(
          likedPostIds.map(id => getPostById(id))
        );
        // Converter dados do Firebase para formato Post
        const formattedPosts = postsData
          .filter(p => p !== null)
          .map(p => formatPostFromFirebase(p));
        setLikedPosts(formattedPosts);
      } else if (activeTab === 'reposted') {
        const repostedPostIds = await getUserRepostedPosts(user.id);
        const postsData = await Promise.all(
          repostedPostIds.map(id => getPostById(id))
        );
        const formattedPosts = postsData
          .filter(p => p !== null)
          .map(p => formatPostFromFirebase(p));
        setRepostedPosts(formattedPosts);
      } else if (activeTab === 'saved') {
        const savedPostIds = await getUserSavedPosts(user.id);
        const postsData = await Promise.all(
          savedPostIds.map(id => getPostById(id))
        );
        const formattedPosts = postsData
          .filter(p => p !== null)
          .map(p => formatPostFromFirebase(p));
        setSavedPosts(formattedPosts);
      } else if (activeTab === 'sparks') {
        // Sparks do usuário (mock)
        setSparks([
          {
            id: 'spark-1',
            userName: user?.name || 'Usuário',
            userAvatar: user?.photoURL,
            timeAgo: '2h',
            text: 'Meu primeiro Spark! 🎬✨',
            imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
            likes: 45,
            comments: 8,
            shares: 3,
          },
        ]);
      } else {
        // Posts do usuário (mock por enquanto)
        setPosts(mockUserPosts);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const formatPostFromFirebase = (firebasePost: any): Post => {
    // Converter dados do Firebase para o formato Post
    // Isso depende da estrutura real dos posts no Firebase
    if (!firebasePost) {
      // Se não houver dados, retornar um post vazio
      return {
        id: '',
        userName: 'Usuário',
        timeAgo: 'Agora',
        text: '',
        likes: 0,
        comments: 0,
        shares: 0,
      };
    }
    
    return {
      id: firebasePost.id || '',
      userName: firebasePost.userName || firebasePost.user?.name || firebasePost.userName || 'Usuário',
      userAvatar: firebasePost.userAvatar || firebasePost.user?.photoURL || firebasePost.userAvatar,
      timeAgo: formatTimeAgo(firebasePost.createdAt),
      text: firebasePost.text || firebasePost.content || firebasePost.message || '',
      imageUrl: firebasePost.imageUrl || firebasePost.image || firebasePost.mediaUrl,
      likes: firebasePost.likesCount || firebasePost.likes || 0,
      comments: firebasePost.commentsCount || firebasePost.comments || 0,
      shares: firebasePost.repostsCount || firebasePost.shares || firebasePost.reposts || 0,
    };
  };

  const formatTimeAgo = (timestamp: any): string => {
    if (!timestamp) return 'Agora';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </View>
    );
  }

  const handleSave = async () => {
    if (!editedName.trim()) {
      Alert.alert('Erro', 'O nome é obrigatório');
      return;
    }

    if (!editedUsername.trim()) {
      Alert.alert('Erro', 'O username é obrigatório');
      return;
    }

    try {
      await updateUser({
        name: editedName.trim(),
        username: editedUsername.trim().replace('@', ''),
        bio: editedBio,
        location: editedLocation,
        website: editedWebsite,
        phone: editedPhone,
      });
      setIsEditing(false);
      Alert.alert('Sucesso', 'Perfil atualizado!');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível atualizar o perfil');
    }
  };

  const handleCancel = () => {
    setEditedName(user?.name || '');
    setEditedUsername(user?.username || '');
    setEditedBio(user?.bio || '');
    setEditedLocation(user?.location || '');
    setEditedWebsite(user?.website || '');
    setEditedPhone(user?.phone || '');
    setIsEditing(false);
  };

  const showImagePicker = (type: 'avatar' | 'banner') => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancelar', 'Tirar Foto', 'Escolher da Galeria'],
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) {
            await handleImageSelection(type, 'camera');
          } else if (buttonIndex === 2) {
            await handleImageSelection(type, 'gallery');
          }
        }
      );
    } else {
      Alert.alert(
        'Selecionar Imagem',
        'Escolha uma opção',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Tirar Foto', onPress: () => handleImageSelection(type, 'camera') },
          { text: 'Escolher da Galeria', onPress: () => handleImageSelection(type, 'gallery') },
        ]
      );
    }
  };

  const handleImageSelection = async (type: 'avatar' | 'banner', source: 'camera' | 'gallery') => {
    if (!user?.id) return;

    try {
      let imageUri: string | null = null;

      if (source === 'camera') {
        imageUri = await takePhotoWithCamera();
      } else {
        imageUri = await pickImageFromGallery();
      }

      if (!imageUri) return;

      // Mostra loading
      if (type === 'avatar') {
        setIsUploadingAvatar(true);
      } else {
        setIsUploadingBanner(true);
      }

      // Faz upload para Firebase Storage
      const downloadURL = await uploadImageToStorage(user.id, imageUri, type);

      // Atualiza o perfil
      await updateUser({
        [type === 'avatar' ? 'photoURL' : 'bannerURL']: downloadURL,
      });

      Alert.alert('Sucesso', `${type === 'avatar' ? 'Foto de perfil' : 'Foto de capa'} atualizada!`);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      Alert.alert('Erro', error.message || 'Não foi possível fazer upload da imagem');
    } finally {
      setIsUploadingAvatar(false);
      setIsUploadingBanner(false);
    }
  };

  const getCurrentPosts = () => {
    switch (activeTab) {
      case 'liked':
        return likedPosts;
      case 'reposted':
        return repostedPosts;
      case 'saved':
        return savedPosts;
      case 'sparks':
        return sparks;
      default:
        return posts;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header com foto de capa e perfil */}
        <View style={styles.header}>
          <View style={styles.coverImage}>
            {user.bannerURL ? (
              <Image source={{ uri: user.bannerURL }} style={styles.coverImageContent} />
            ) : (
              <View style={styles.coverImagePlaceholder} />
            )}
            <TouchableOpacity 
              style={styles.editCoverButton}
              onPress={() => showImagePicker('banner')}
              disabled={isUploadingBanner}
            >
              {isUploadingBanner ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="camera-outline" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              {user.photoURL ? (
                <Image source={{ uri: user.photoURL }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={40} color="#007AFF" />
                </View>
              )}
              <TouchableOpacity 
                style={styles.editAvatarButton}
                onPress={() => showImagePicker('avatar')}
                disabled={isUploadingAvatar}
              >
                {isUploadingAvatar ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="camera" size={16} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Informações do perfil abaixo da imagem de capa */}
        <View style={styles.profileInfoContainer}>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{user.name}</Text>
            {user.verified && (
              <Ionicons name="checkmark-circle" size={20} color="#007AFF" style={styles.verifiedBadge} />
            )}
          </View>
          <Text style={styles.username}>@{user.username || user.email?.split('@')[0] || 'usuario'}</Text>
          {!isEditing && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <Ionicons name="pencil-outline" size={16} color="#007AFF" />
              <Text style={styles.editButtonText}>Editar perfil</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Estatísticas */}
        <View style={styles.statsContainer}>
          <TouchableOpacity style={styles.statItem}>
            <Text style={styles.statNumber}>{posts.length}</Text>
            <Text style={styles.statLabel}>Publicações</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Seguidores</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Seguindo</Text>
          </TouchableOpacity>
        </View>

        {/* Informações do perfil */}
        <View style={styles.infoSection}>
          {isEditing ? (
            <View style={styles.editContainer}>
              <View style={styles.editHeader}>
                <Text style={styles.editTitle}>Editar Perfil</Text>
                <TouchableOpacity
                  style={styles.closeEditButton}
                  onPress={handleCancel}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputLabelContainer}>
                  <Ionicons name="person-outline" size={18} color="#007AFF" />
                  <Text style={styles.inputLabel}>Nome</Text>
                </View>
                <TextInput
                  style={[
                    styles.input,
                    focusedInput === 'name' && styles.inputFocused
                  ]}
                  placeholder="Seu nome completo"
                  value={editedName}
                  onChangeText={setEditedName}
                  onFocus={() => setFocusedInput('name')}
                  onBlur={() => setFocusedInput(null)}
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputLabelContainer}>
                  <Ionicons name="at-outline" size={18} color="#007AFF" />
                  <Text style={styles.inputLabel}>Username</Text>
                </View>
                <View style={styles.usernameInputContainer}>
                  <Text style={styles.usernamePrefix}>@</Text>
                  <TextInput
                    style={[
                      styles.input,
                      styles.usernameInput,
                      focusedInput === 'username' && styles.inputFocused
                    ]}
                    placeholder="seuusername"
                    value={editedUsername}
                    onChangeText={(text) => {
                      // Remove @ e caracteres especiais
                      const cleaned = text.replace(/[@\s]/g, '').toLowerCase();
                      setEditedUsername(cleaned);
                    }}
                    onFocus={() => setFocusedInput('username')}
                    onBlur={() => setFocusedInput(null)}
                    placeholderTextColor="#999"
                    autoCapitalize="none"
                    maxLength={30}
                  />
                </View>
                <Text style={styles.inputHint}>
                  {editedUsername.length}/30 caracteres
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputLabelContainer}>
                  <Ionicons name="document-text-outline" size={18} color="#007AFF" />
                  <Text style={styles.inputLabel}>Bio</Text>
                </View>
                <TextInput
                  style={[
                    styles.input, 
                    styles.textAreaInput,
                    focusedInput === 'bio' && styles.inputFocused
                  ]}
                  placeholder="Conte um pouco sobre você..."
                  value={editedBio}
                  onChangeText={(text) => {
                    if (text.length <= 200) {
                      setEditedBio(text);
                    }
                  }}
                  onFocus={() => setFocusedInput('bio')}
                  onBlur={() => setFocusedInput(null)}
                  multiline
                  numberOfLines={4}
                  placeholderTextColor="#999"
                  textAlignVertical="top"
                  maxLength={200}
                />
                <Text style={[styles.inputHint, editedBio.length >= 180 && styles.inputHintWarning]}>
                  {editedBio.length}/200 caracteres
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputLabelContainer}>
                  <Ionicons name="location-outline" size={18} color="#007AFF" />
                  <Text style={styles.inputLabel}>Localização</Text>
                </View>
                <TextInput
                  style={[
                    styles.input,
                    focusedInput === 'location' && styles.inputFocused
                  ]}
                  placeholder="Ex: Rio de Janeiro, Brasil"
                  value={editedLocation}
                  onChangeText={setEditedLocation}
                  onFocus={() => setFocusedInput('location')}
                  onBlur={() => setFocusedInput(null)}
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputLabelContainer}>
                  <Ionicons name="link-outline" size={18} color="#007AFF" />
                  <Text style={styles.inputLabel}>Website</Text>
                </View>
                <TextInput
                  style={[
                    styles.input,
                    focusedInput === 'website' && styles.inputFocused
                  ]}
                  placeholder="https://exemplo.com"
                  value={editedWebsite}
                  onChangeText={setEditedWebsite}
                  onFocus={() => setFocusedInput('website')}
                  onBlur={() => setFocusedInput(null)}
                  keyboardType="url"
                  autoCapitalize="none"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputLabelContainer}>
                  <Ionicons name="call-outline" size={18} color="#007AFF" />
                  <Text style={styles.inputLabel}>Telefone</Text>
                </View>
                <TextInput
                  style={[
                    styles.input,
                    focusedInput === 'phone' && styles.inputFocused
                  ]}
                  placeholder="(00) 00000-0000"
                  value={editedPhone}
                  onChangeText={setEditedPhone}
                  onFocus={() => setFocusedInput('phone')}
                  onBlur={() => setFocusedInput(null)}
                  keyboardType="phone-pad"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.editActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancel}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                  activeOpacity={0.8}
                >
                  <Ionicons name="checkmark" size={18} color="#fff" />
                  <Text style={styles.saveButtonText}>Salvar Alterações</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              {user.bio && (
                <View style={styles.infoItem}>
                  <Ionicons name="document-text-outline" size={20} color="#666" />
                  <Text style={styles.infoText}>{user.bio}</Text>
                </View>
              )}
              {user.location && (
                <View style={styles.infoItem}>
                  <Ionicons name="location-outline" size={20} color="#666" />
                  <Text style={styles.infoText}>{user.location}</Text>
                </View>
              )}
              {user.website && (
                <View style={styles.infoItem}>
                  <Ionicons name="link-outline" size={20} color="#666" />
                  <Text style={[styles.infoText, styles.linkText]}>{user.website}</Text>
                </View>
              )}
              {user.phone && (
                <View style={styles.infoItem}>
                  <Ionicons name="call-outline" size={20} color="#666" />
                  <Text style={styles.infoText}>{user.phone}</Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'posts' && styles.tabActive]}
            onPress={() => setActiveTab('posts')}
          >
            <Ionicons 
              name="grid-outline" 
              size={20} 
              color={activeTab === 'posts' ? '#007AFF' : '#666'} 
            />
            <Text style={[styles.tabText, activeTab === 'posts' && styles.tabTextActive]}>
              Posts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'liked' && styles.tabActive]}
            onPress={() => setActiveTab('liked')}
          >
            <Ionicons 
              name="heart-outline" 
              size={20} 
              color={activeTab === 'liked' ? '#E91E63' : '#666'} 
            />
            <Text style={[styles.tabText, activeTab === 'liked' && styles.tabTextActive]}>
              Curtidos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'reposted' && styles.tabActive]}
            onPress={() => setActiveTab('reposted')}
          >
            <Ionicons 
              name="repeat-outline" 
              size={20} 
              color={activeTab === 'reposted' ? '#4CAF50' : '#666'} 
            />
            <Text style={[styles.tabText, activeTab === 'reposted' && styles.tabTextActive]}>
              Repostados
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'saved' && styles.tabActive]}
            onPress={() => setActiveTab('saved')}
          >
            <Ionicons 
              name="bookmark-outline" 
              size={20} 
              color={activeTab === 'saved' ? '#FF9800' : '#666'} 
            />
            <Text style={[styles.tabText, activeTab === 'saved' && styles.tabTextActive]}>
              Salvos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'sparks' && styles.tabActive]}
            onPress={() => setActiveTab('sparks')}
          >
            <Ionicons 
              name="flash-outline" 
              size={20} 
              color={activeTab === 'sparks' ? '#FF6B00' : '#666'} 
            />
            <Text style={[styles.tabText, activeTab === 'sparks' && styles.tabTextActive]}>
              Sparks
            </Text>
          </TouchableOpacity>
        </View>

        {/* Lista de Posts */}
        <View style={styles.postsContainer}>
          {isLoadingPosts ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Carregando posts...</Text>
            </View>
          ) : getCurrentPosts().length > 0 ? (
            getCurrentPosts().map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons 
                name={
                  activeTab === 'posts' ? 'document-outline' :
                  activeTab === 'liked' ? 'heart-outline' :
                  activeTab === 'reposted' ? 'repeat-outline' :
                  'bookmark-outline'
                } 
                size={64} 
                color="#ccc" 
              />
              <Text style={styles.emptyStateTitle}>
                {activeTab === 'posts' ? 'Nenhum post ainda' :
                 activeTab === 'liked' ? 'Nenhum post curtido' :
                 activeTab === 'reposted' ? 'Nenhum post repostado' :
                 activeTab === 'saved' ? 'Nenhum post salvo' :
                 'Nenhum Spark ainda'}
              </Text>
              <Text style={styles.emptyStateText}>
                {activeTab === 'posts' ? 'Comece a compartilhar suas ideias!' :
                 activeTab === 'liked' ? 'Posts que você curtiu aparecerão aqui' :
                 activeTab === 'reposted' ? 'Posts que você repostou aparecerão aqui' :
                 activeTab === 'saved' ? 'Posts que você salvou aparecerão aqui' :
                 'Crie seu primeiro Spark!'}
              </Text>
            </View>
          )}
        </View>

        {/* Opções */}
        <View style={styles.optionsSection}>
          <TouchableOpacity style={styles.optionItem}>
            <Ionicons name="settings-outline" size={22} color="#333" />
            <Text style={styles.optionText}>Configurações</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionItem}>
            <Ionicons name="notifications-outline" size={22} color="#333" />
            <Text style={styles.optionText}>Notificações</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionItem}>
            <Ionicons name="lock-closed-outline" size={22} color="#333" />
            <Text style={styles.optionText}>Privacidade</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionItem}>
            <Ionicons name="help-circle-outline" size={22} color="#333" />
            <Text style={styles.optionText}>Ajuda e Suporte</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  coverImage: {
    height: 180,
    backgroundColor: '#007AFF',
    position: 'relative',
  },
  coverImageContent: {
    width: '100%',
    height: '100%',
  },
  coverImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#007AFF',
  },
  editCoverButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 10,
  },
  profileSection: {
    paddingHorizontal: 16,
    paddingBottom: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginTop: -100,
  },
  profileInfoContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
    marginBottom: 8,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  verifiedBadge: {
    marginLeft: 4,
  },
  username: {
    fontSize: 15,
    color: '#666',
    marginBottom: 12,
    fontWeight: '500',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#007AFF',
    gap: 6,
  },
  editButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 20,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  linkText: {
    color: '#007AFF',
  },
  editContainer: {
    padding: 4,
  },
  editHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  editTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeEditButton: {
    padding: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    fontSize: 15,
    color: '#333',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#e9ecef',
  },
  inputFocused: {
    borderColor: '#007AFF',
    backgroundColor: '#fff',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  textAreaInput: {
    minHeight: 100,
    paddingTop: 14,
    paddingBottom: 14,
  },
  inputHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
    marginLeft: 4,
  },
  inputHintWarning: {
    color: '#FF9800',
    fontWeight: '600',
  },
  usernameInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  usernamePrefix: {
    fontSize: 15,
    color: '#666',
    marginRight: 8,
    paddingTop: 14,
    fontWeight: '500',
  },
  usernameInput: {
    flex: 1,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 15,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    gap: 8,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#f0f7ff',
  },
  tabText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#666',
  },
  tabTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  postsContainer: {
    paddingBottom: 20,
  },
  emptyState: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  optionsSection: {
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
});
