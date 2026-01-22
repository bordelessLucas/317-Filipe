import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

interface Community {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  members: number;
  category: string;
  privacy: 'public' | 'private';
  isMember?: boolean;
  friendsInCommunity?: string[];
}

const mockCommunities: Community[] = [
  {
    id: '1',
    name: 'Iniciantes em Código',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
    description: 'Um lugar para iniciantes na programação aprenderem, tirarem dúvidas e compartilharem experiências.',
    members: 45000,
    category: 'Tecnologia',
    privacy: 'public',
    isMember: false,
    friendsInCommunity: ['Alice Johnson'],
  },
  {
    id: '2',
    name: 'Clube do Livro',
    imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80',
    description: 'Discussões mensais sobre os melhores livros, de clássicos a best-sellers contemporâneos.',
    members: 23400,
    category: 'Arte & Cultura',
    privacy: 'private',
    isMember: false,
  },
  {
    id: '3',
    name: 'Gamers Unidos',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80',
    description: 'Uma comunidade para todos os tipos de jogadores, do casual ao hardcore.',
    members: 12500,
    category: 'Games',
    privacy: 'public',
    isMember: false,
    friendsInCommunity: ['Bob Smith'],
  },
  {
    id: '4',
    name: 'Amantes de Trilhas',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    description: 'Explorando a natureza, compartilhando dicas de trilhas e aventuras ao ar livre.',
    members: 8700,
    category: 'Viagens',
    privacy: 'public',
    isMember: false,
  },
];

const categories = [
  'Todas',
  'Tecnologia',
  'Música',
  'Arte & Cultura',
  'Esportes',
  'Comida & Bebida',
  'Viagens',
  'Fotografia',
  'Moda',
  'Empreendedorismo',
  'Desenvolvimento Pessoal',
  'Voluntariado',
  'Games',
];

export default function CommunitiesScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'explore' | 'my-communities'>('explore');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [communities] = useState<Community[]>(mockCommunities);

  const myCommunities = communities.filter(c => c.isMember);
  const exploreCommunities = communities.filter(c => !c.isMember);

  const filterCommunities = (communitiesList: Community[]) => {
    return communitiesList.filter(community => {
      const matchesSearch = 
        community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        community.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = 
        selectedCategory === 'Todas' || community.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  };

  const filteredExploreCommunities = filterCommunities(exploreCommunities);
  const filteredMyCommunities = filterCommunities(myCommunities);

  const handleJoinCommunity = (community: Community) => {
    if (community.privacy === 'private') {
      Alert.alert('Comunidade Privada', 'Sua solicitação de entrada foi enviada!');
    } else {
      Alert.alert('Sucesso!', `Você entrou na comunidade ${community.name}!`);
    }
  };

  const formatMembers = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1).replace('.', ',')}k membros`;
    }
    return `${count.toLocaleString('pt-BR')} membros`;
  };

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.fixedHeader}>
        <View style={styles.headerContent}>
          <View style={styles.titleSection}>
            <Ionicons name="people" size={24} color="#007AFF" />
            <Text style={styles.title}>Comunidades</Text>
          </View>
          {activeTab === 'my-communities' && (
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => Alert.alert('Criar Comunidade', 'Funcionalidade em desenvolvimento')}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.subtitle}>
          Encontre, participe e crie comunidades com base em seus interesses.
        </Text>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'explore' && styles.tabActive]}
            onPress={() => setActiveTab('explore')}
          >
            <Text style={[styles.tabText, activeTab === 'explore' && styles.tabTextActive]}>
              Explorar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'my-communities' && styles.tabActive]}
            onPress={() => setActiveTab('my-communities')}
          >
            <Text style={[styles.tabText, activeTab === 'my-communities' && styles.tabTextActive]}>
              Minhas Comunidades
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search and Filter */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar comunidades para explorar..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#999" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowCategoryFilter(!showCategoryFilter)}
          >
            <Ionicons name="options" size={18} color="#007AFF" />
            <Text style={styles.filterButtonText} numberOfLines={1}>
              {selectedCategory === 'Todas' ? 'Categoria' : selectedCategory}
            </Text>
            <Ionicons 
              name={showCategoryFilter ? "chevron-up" : "chevron-down"} 
              size={16} 
              color="#007AFF" 
            />
          </TouchableOpacity>
        </View>

        {/* Category Filter Dropdown */}
        {showCategoryFilter && (
          <View style={styles.categoryDropdown}>
            <ScrollView style={styles.categoryList} nestedScrollEnabled showsVerticalScrollIndicator={false}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryItem,
                    selectedCategory === category && styles.categoryItemActive
                  ]}
                  onPress={() => {
                    setSelectedCategory(category);
                    setShowCategoryFilter(false);
                  }}
                >
                  <Text
                    style={[
                      styles.categoryItemText,
                      selectedCategory === category && styles.categoryItemTextActive
                    ]}
                  >
                    {category}
                  </Text>
                  {selectedCategory === category && (
                    <Ionicons name="checkmark" size={18} color="#007AFF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[]}
      >

        {/* Communities List */}
        <View style={styles.communitiesList}>
          {(activeTab === 'explore' ? filteredExploreCommunities : filteredMyCommunities).map((community) => (
            <TouchableOpacity 
              key={community.id} 
              style={styles.communityCard}
              activeOpacity={0.7}
            >
              {/* Community Image */}
              <View style={styles.communityImageContainer}>
                <Image
                  source={{ uri: community.imageUrl }}
                  style={styles.communityImage}
                  resizeMode="cover"
                />
                {community.privacy === 'private' && (
                  <View style={styles.privateBadge}>
                    <Ionicons name="lock-closed" size={12} color="#FFA726" />
                  </View>
                )}
              </View>

              {/* Community Content */}
              <View style={styles.communityContent}>
                <View style={styles.communityHeader}>
                  <View style={styles.communityTitleRow}>
                    <Text style={styles.communityName} numberOfLines={1}>
                      {community.name}
                    </Text>
                    {community.privacy === 'private' && (
                      <Ionicons name="lock-closed" size={14} color="#FFA726" style={styles.lockIcon} />
                    )}
                  </View>
                </View>

                <Text style={styles.communityDescription} numberOfLines={2}>
                  {community.description}
                </Text>

                <View style={styles.communityFooter}>
                  <View style={styles.communityInfo}>
                    <Ionicons name="people" size={14} color="#666" />
                    <Text style={styles.communityMembers}>
                      {formatMembers(community.members)}
                    </Text>
                  </View>

                  {/* Friends in Community */}
                  {community.friendsInCommunity && community.friendsInCommunity.length > 0 && (
                    <View style={styles.friendsContainer}>
                      <View style={styles.friendsAvatars}>
                        {community.friendsInCommunity.slice(0, 2).map((friend, index) => (
                          <View key={index} style={[styles.friendAvatar, { marginLeft: index > 0 ? -6 : 0 }]}>
                            <Ionicons name="person" size={10} color="#007AFF" />
                          </View>
                        ))}
                      </View>
                      <Text style={styles.friendsText} numberOfLines={1}>
                        {community.friendsInCommunity[0]} e mais {community.friendsInCommunity.length - 1}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Action Button */}
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    community.privacy === 'private' && styles.actionButtonPrivate
                  ]}
                  onPress={() => handleJoinCommunity(community)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionButtonText}>
                    {community.privacy === 'private' 
                      ? 'Solicitar Entrada' 
                      : community.isMember 
                        ? 'Acessar' 
                        : 'Entrar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}

          {/* Empty State */}
          {(activeTab === 'explore' ? filteredExploreCommunities : filteredMyCommunities).length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={64} color="#ccc" />
              <Text style={styles.emptyStateTitle}>
                {activeTab === 'explore' 
                  ? 'Nenhuma comunidade encontrada' 
                  : 'Você ainda não faz parte de nenhuma comunidade'}
              </Text>
              <Text style={styles.emptyStateText}>
                {activeTab === 'explore'
                  ? 'Tente ajustar seus filtros ou busca.'
                  : 'Explore novas comunidades e participe!'}
              </Text>
            </View>
          )}
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
  fixedHeader: {
    backgroundColor: '#fff',
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 12,
    paddingLeft: 32,
  },
  createButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 3,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  tabTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  searchContainer: {
    gap: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    padding: 0,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 6,
  },
  filterButtonText: {
    flex: 1,
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  categoryDropdown: {
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    maxHeight: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryList: {
    maxHeight: 250,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryItemActive: {
    backgroundColor: '#f0f7ff',
  },
  categoryItemText: {
    fontSize: 15,
    color: '#333',
  },
  categoryItemTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  communitiesList: {
    padding: 12,
    gap: 12,
  },
  communityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 4,
  },
  communityImageContainer: {
    width: '100%',
    height: 130,
    position: 'relative',
  },
  communityImage: {
    width: '100%',
    height: '100%',
  },
  privateBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  communityContent: {
    padding: 12,
  },
  communityHeader: {
    marginBottom: 6,
  },
  communityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  communityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  lockIcon: {
    marginLeft: 4,
  },
  communityDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 10,
    minHeight: 36,
  },
  communityFooter: {
    marginBottom: 10,
    gap: 6,
  },
  communityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  communityMembers: {
    fontSize: 12,
    color: '#666',
  },
  friendsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  friendsAvatars: {
    flexDirection: 'row',
  },
  friendAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E3F2FD',
    borderWidth: 1.5,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendsText: {
    fontSize: 11,
    color: '#666',
    flex: 1,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 2,
  },
  actionButtonPrivate: {
    backgroundColor: '#FFA726',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyState: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
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
});
