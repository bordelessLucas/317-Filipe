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
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

interface Service {
  id: string;
  category: string;
  title: string;
  imageUrl: string;
  rating: number;
  reviews: number;
  price?: string;
  provider: {
    name: string;
    avatar: string;
  };
}

const mockServices: Service[] = [
  {
    id: '1',
    category: 'CRIATIVO',
    title: 'Fotografia Profissional de Eventos',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    rating: 4.9,
    reviews: 132,
    provider: {
      name: 'Alice Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    },
  },
  {
    id: '2',
    category: 'TECNOLOGIA',
    title: 'Desenvolvimento de Componentes Web',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
    rating: 5.0,
    reviews: 89,
    price: 'Sob Consulta',
    provider: {
      name: 'Bob Smith',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    },
  },
  {
    id: '3',
    category: 'CRIATIVO',
    title: 'Design de Logo & Identidade Visual',
    imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80',
    rating: 4.8,
    reviews: 214,
    price: 'A partir de R$500',
    provider: {
      name: 'Charlie Brown',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
    },
  },
  {
    id: '4',
    category: 'BEM-ESTAR',
    title: 'Aulas de Culinária Saudável',
    imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80',
    rating: 4.9,
    reviews: 75,
    price: 'R$120/h',
    provider: {
      name: 'Diana Prince',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
    },
  },
];

const categories = [
  'Todas as Categorias',
  'CRIATIVO',
  'TECNOLOGIA',
  'BEM-ESTAR',
  'EDUCAÇÃO',
  'SAÚDE',
  'FINANÇAS',
];

export default function ServicesScreen() {
  const [activeTab, setActiveTab] = useState<'services' | 'marketplace'>('services');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas as Categorias');
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);

  const filteredServices = mockServices.filter(service => {
    const matchesSearch = 
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = 
      selectedCategory === 'Todas as Categorias' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleViewProfile = (provider: Service['provider']) => {
    Alert.alert('Perfil', `Visualizando perfil de ${provider.name}`);
  };

  const handleServicePress = (service: Service) => {
    Alert.alert('Detalhes', `Visualizando detalhes de: ${service.title}`);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Fixed Header */}
      <View style={styles.fixedHeader}>
        <View style={styles.headerContent}>
          <View style={styles.titleSection}>
            <Ionicons name="briefcase" size={24} color="#007AFF" />
            <Text style={styles.title}>Serviços & Marketplace</Text>
          </View>
        </View>
        
        <Text style={styles.subtitle}>
          Encontre profissionais e produtos na sua comunidade.
        </Text>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'services' && styles.tabActive]}
            onPress={() => setActiveTab('services')}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="briefcase-outline" 
              size={18} 
              color={activeTab === 'services' ? '#007AFF' : '#666'} 
            />
            <Text style={[styles.tabText, activeTab === 'services' && styles.tabTextActive]}>
              Serviços
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'marketplace' && styles.tabActive]}
            onPress={() => setActiveTab('marketplace')}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="storefront-outline" 
              size={18} 
              color={activeTab === 'marketplace' ? '#007AFF' : '#666'} 
            />
            <Text style={[styles.tabText, activeTab === 'marketplace' && styles.tabTextActive]}>
              Marketplace
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por serviços (ex: 'encanador', 'designer')..."
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

        {/* Category Filter */}
        <TouchableOpacity
          style={styles.categoryButton}
          onPress={() => setShowCategoryFilter(!showCategoryFilter)}
          activeOpacity={0.7}
        >
          <Text style={styles.categoryButtonText} numberOfLines={1}>
            {selectedCategory}
          </Text>
          <Ionicons 
            name={showCategoryFilter ? "chevron-up" : "chevron-down"} 
            size={16} 
            color="#666" 
          />
        </TouchableOpacity>

        {/* Category Filter Dropdown */}
        {showCategoryFilter && (
          <View style={styles.categoryDropdown}>
            <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
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
      >
        <View style={styles.servicesList}>
          {filteredServices.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={styles.serviceCard}
              activeOpacity={0.8}
              onPress={() => handleServicePress(service)}
            >
              {/* Service Image */}
              <Image
                source={{ uri: service.imageUrl }}
                style={styles.serviceImage}
                resizeMode="cover"
              />

              {/* Service Content */}
              <View style={styles.serviceContent}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{service.category}</Text>
                </View>

                <Text style={styles.serviceTitle} numberOfLines={2}>
                  {service.title}
                </Text>

                {/* Rating */}
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.ratingText}>
                    {service.rating.toFixed(1)} ({service.reviews} avaliações)
                  </Text>
                </View>

                {/* Price */}
                {service.price && (
                  <Text style={styles.priceText}>{service.price}</Text>
                )}

                {/* Provider */}
                <View style={styles.providerContainer}>
                  <Image
                    source={{ uri: service.provider.avatar }}
                    style={styles.providerAvatar}
                  />
                  <Text style={styles.providerName} numberOfLines={1}>
                    {service.provider.name}
                  </Text>
                  <TouchableOpacity
                    style={styles.viewProfileButton}
                    onPress={() => handleViewProfile(service.provider)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.viewProfileText}>Ver Perfil</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {/* Empty State */}
          {filteredServices.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="briefcase-outline" size={64} color="#ccc" />
              <Text style={styles.emptyStateTitle}>
                Nenhum serviço encontrado
              </Text>
              <Text style={styles.emptyStateText}>
                Tente ajustar seus filtros ou busca.
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 3,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 8,
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
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryButtonText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryDropdown: {
    marginTop: 4,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    fontSize: 14,
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
  servicesList: {
    padding: 12,
    gap: 12,
  },
  serviceCard: {
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
  },
  serviceImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#f0f0f0',
  },
  serviceContent: {
    padding: 14,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#007AFF',
    letterSpacing: 0.5,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
    lineHeight: 24,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  priceText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 12,
  },
  providerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  providerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  providerName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  viewProfileButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
  },
  viewProfileText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
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
