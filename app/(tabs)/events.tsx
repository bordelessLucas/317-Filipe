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
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

interface Event {
  id: string;
  title: string;
  imageUrl: string;
  date: string;
  location: string;
  locationType: 'online' | 'presential';
  participants: number;
}

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Tech Conference 2024',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    date: '5-7 de Setembro, 2024',
    location: 'Online',
    locationType: 'online',
    participants: 5600,
  },
  {
    id: '2',
    title: 'Summer Music Festival',
    imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
    date: '15 de Agosto, 2024',
    location: 'Central Park, NYC',
    locationType: 'presential',
    participants: 1245,
  },
  {
    id: '3',
    title: 'Feira de Arte Local',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    date: '28 de Julho, 2024',
    location: 'Praça Principal',
    locationType: 'presential',
    participants: 320,
  },
  {
    id: '4',
    title: 'Workshop de Culinária Italiana',
    imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80',
    date: '10 de Agosto, 2024',
    location: 'Estúdio Culinário Sabor',
    locationType: 'presential',
    participants: 25,
  },
];

const dateFilters = ['Qualquer Data', 'Hoje', 'Esta Semana', 'Este Mês', 'Próximos 3 Meses'];
const distanceFilters = ['Distância', 'Até 5km', 'Até 10km', 'Até 25km', 'Até 50km', 'Qualquer'];
const typeFilters = ['Qualquer Tipo', 'Online', 'Presencial', 'Híbrido'];

export default function EventsScreen() {
  const [activeViewTab, setActiveViewTab] = useState<'lista' | 'mapa'>('lista');
  const [activeContentTab, setActiveContentTab] = useState<'explorar' | 'amigos'>('explorar');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('Qualquer Data');
  const [selectedDistance, setSelectedDistance] = useState('Distância');
  const [selectedType, setSelectedType] = useState('Qualquer Tipo');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showDistanceFilter, setShowDistanceFilter] = useState(false);
  const [showTypeFilter, setShowTypeFilter] = useState(false);

  const filteredEvents = mockEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = 
      selectedType === 'Qualquer Tipo' ||
      (selectedType === 'Online' && event.locationType === 'online') ||
      (selectedType === 'Presencial' && event.locationType === 'presential');
    return matchesSearch && matchesType;
  });

  const formatParticipants = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1).replace('.', ',')}k participantes`;
    }
    return `${count.toLocaleString('pt-BR')} participantes`;
  };

  const handleCreateEvent = () => {
    Alert.alert('Criar Evento', 'Funcionalidade em desenvolvimento');
  };

  const handleViewDetails = (event: Event) => {
    Alert.alert('Detalhes do Evento', `Visualizando detalhes de: ${event.title}`);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Fixed Header */}
      <View style={styles.fixedHeader}>
        <View style={styles.headerContent}>
          <View style={styles.titleSection}>
            <Ionicons name="calendar" size={24} color="#007AFF" />
            <Text style={styles.title}>Eventos</Text>
          </View>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={handleCreateEvent}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.createButtonText}>Criar Evento</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.subtitle}>
          Descubra eventos locais e online acontecendo ao seu redor.
        </Text>

        {/* View Tabs (Lista/Mapa) */}
        <View style={styles.viewTabsContainer}>
          <TouchableOpacity
            style={[styles.viewTab, activeViewTab === 'lista' && styles.viewTabActive]}
            onPress={() => setActiveViewTab('lista')}
            activeOpacity={0.7}
          >
            <Text style={[styles.viewTabText, activeViewTab === 'lista' && styles.viewTabTextActive]}>
              Lista
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewTab, activeViewTab === 'mapa' && styles.viewTabActive]}
            onPress={() => setActiveViewTab('mapa')}
            activeOpacity={0.7}
          >
            <Text style={[styles.viewTabText, activeViewTab === 'mapa' && styles.viewTabTextActive]}>
              Mapa
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content Tabs (Explorar/Amigos) */}
        <View style={styles.contentTabsContainer}>
          <TouchableOpacity
            style={[styles.contentTab, activeContentTab === 'explorar' && styles.contentTabActive]}
            onPress={() => setActiveContentTab('explorar')}
            activeOpacity={0.7}
          >
            <Text style={[styles.contentTabText, activeContentTab === 'explorar' && styles.contentTabTextActive]}>
              Explorar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.contentTab, activeContentTab === 'amigos' && styles.contentTabActive]}
            onPress={() => setActiveContentTab('amigos')}
            activeOpacity={0.7}
          >
            <Text style={[styles.contentTabText, activeContentTab === 'amigos' && styles.contentTabTextActive]}>
              Amigos
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nome do evento..."
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

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => {
              setShowDateFilter(!showDateFilter);
              setShowDistanceFilter(false);
              setShowTypeFilter(false);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.filterButtonText} numberOfLines={1}>
              {selectedDate}
            </Text>
            <Ionicons 
              name={showDateFilter ? "chevron-up" : "chevron-down"} 
              size={16} 
              color="#666" 
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => {
              setShowDistanceFilter(!showDistanceFilter);
              setShowDateFilter(false);
              setShowTypeFilter(false);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.filterButtonText} numberOfLines={1}>
              {selectedDistance}
            </Text>
            <Ionicons 
              name={showDistanceFilter ? "chevron-up" : "chevron-down"} 
              size={16} 
              color="#666" 
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => {
              setShowTypeFilter(!showTypeFilter);
              setShowDateFilter(false);
              setShowDistanceFilter(false);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.filterButtonText} numberOfLines={1}>
              {selectedType}
            </Text>
            <Ionicons 
              name={showTypeFilter ? "chevron-up" : "chevron-down"} 
              size={16} 
              color="#666" 
            />
          </TouchableOpacity>
        </View>

        {/* Date Filter Dropdown */}
        {showDateFilter && (
          <View style={styles.filterDropdown}>
            <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
              {dateFilters.map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterDropdownItem,
                    selectedDate === filter && styles.filterDropdownItemActive
                  ]}
                  onPress={() => {
                    setSelectedDate(filter);
                    setShowDateFilter(false);
                  }}
                >
                  <Text
                    style={[
                      styles.filterDropdownText,
                      selectedDate === filter && styles.filterDropdownTextActive
                    ]}
                  >
                    {filter}
                  </Text>
                  {selectedDate === filter && (
                    <Ionicons name="checkmark" size={18} color="#007AFF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Distance Filter Dropdown */}
        {showDistanceFilter && (
          <View style={styles.filterDropdown}>
            <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
              {distanceFilters.map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterDropdownItem,
                    selectedDistance === filter && styles.filterDropdownItemActive
                  ]}
                  onPress={() => {
                    setSelectedDistance(filter);
                    setShowDistanceFilter(false);
                  }}
                >
                  <Text
                    style={[
                      styles.filterDropdownText,
                      selectedDistance === filter && styles.filterDropdownTextActive
                    ]}
                  >
                    {filter}
                  </Text>
                  {selectedDistance === filter && (
                    <Ionicons name="checkmark" size={18} color="#007AFF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Type Filter Dropdown */}
        {showTypeFilter && (
          <View style={styles.filterDropdown}>
            <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
              {typeFilters.map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterDropdownItem,
                    selectedType === filter && styles.filterDropdownItemActive
                  ]}
                  onPress={() => {
                    setSelectedType(filter);
                    setShowTypeFilter(false);
                  }}
                >
                  <Text
                    style={[
                      styles.filterDropdownText,
                      selectedType === filter && styles.filterDropdownTextActive
                    ]}
                  >
                    {filter}
                  </Text>
                  {selectedType === filter && (
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
        {activeViewTab === 'lista' ? (
          <View style={styles.eventsList}>
            {filteredEvents.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventCard}
                activeOpacity={0.8}
                onPress={() => handleViewDetails(event)}
              >
                {/* Event Image */}
                <Image
                  source={{ uri: event.imageUrl }}
                  style={styles.eventImage}
                  resizeMode="cover"
                />

                {/* Event Content */}
                <View style={styles.eventContent}>
                  <Text style={styles.eventTitle} numberOfLines={2}>
                    {event.title}
                  </Text>

                  {/* Event Info */}
                  <View style={styles.eventInfo}>
                    <View style={styles.eventInfoRow}>
                      <Ionicons name="calendar-outline" size={16} color="#666" />
                      <Text style={styles.eventInfoText}>{event.date}</Text>
                    </View>

                    <View style={styles.eventInfoRow}>
                      <Ionicons 
                        name={event.locationType === 'online' ? "desktop-outline" : "location-outline"} 
                        size={16} 
                        color="#666" 
                      />
                      <Text style={styles.eventInfoText} numberOfLines={1}>
                        {event.location}
                      </Text>
                    </View>

                    <View style={styles.eventInfoRow}>
                      <Ionicons name="people-outline" size={16} color="#666" />
                      <Text style={styles.eventInfoText}>
                        {formatParticipants(event.participants)}
                      </Text>
                    </View>
                  </View>

                  {/* View Details Button */}
                  <TouchableOpacity
                    style={styles.detailsButton}
                    onPress={() => handleViewDetails(event)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.detailsButtonText}>Ver Detalhes</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}

            {/* Empty State */}
            {filteredEvents.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={64} color="#ccc" />
                <Text style={styles.emptyStateTitle}>
                  Nenhum evento encontrado
                </Text>
                <Text style={styles.emptyStateText}>
                  Tente ajustar seus filtros ou busca.
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map-outline" size={64} color="#ccc" />
            <Text style={styles.mapPlaceholderText}>
              Visualização de mapa em desenvolvimento
            </Text>
          </View>
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  viewTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 3,
    marginBottom: 8,
  },
  viewTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  viewTabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  viewTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  viewTabTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  contentTabsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  contentTab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  contentTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  contentTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  contentTabTextActive: {
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
  filtersContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 6,
  },
  filterButtonText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  filterDropdown: {
    marginTop: 4,
    marginBottom: 8,
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
  filterDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterDropdownItemActive: {
    backgroundColor: '#f0f7ff',
  },
  filterDropdownText: {
    fontSize: 14,
    color: '#333',
  },
  filterDropdownTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  eventsList: {
    padding: 12,
    gap: 12,
  },
  eventCard: {
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
  eventImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#f0f0f0',
  },
  eventContent: {
    padding: 14,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
    lineHeight: 24,
  },
  eventInfo: {
    gap: 8,
    marginBottom: 12,
  },
  eventInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventInfoText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  detailsButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  detailsButtonText: {
    color: '#333',
    fontSize: 14,
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
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  mapPlaceholderText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
});
