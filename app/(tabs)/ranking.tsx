import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

interface Partner {
  id: string;
  name: string;
  icon: string;
  iconColor: string;
  hype: number;
}

interface User {
  id: string;
  name: string;
  avatar: string;
  points: number;
}

const mockPartners: Partner[] = [
  {
    id: '1',
    name: 'Baródromo',
    icon: 'Bar',
    iconColor: '#007AFF',
    hype: 95,
  },
  {
    id: '2',
    name: 'Buxixo Restaurante',
    icon: 'Buxixo',
    iconColor: '#FF9800',
    hype: 85,
  },
  {
    id: '3',
    name: 'Kopenhagen',
    icon: 'K',
    iconColor: '#8B4513',
    hype: 70,
  },
];

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Charlie Brown',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
    points: 25000,
  },
  {
    id: '2',
    name: 'Diana Prince',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
    points: 18450,
  },
  {
    id: '3',
    name: 'Alice Johnson',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    points: 12580,
  },
  {
    id: '4',
    name: 'Bob Smith',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    points: 7500,
  },
  {
    id: '5',
    name: 'John Doe',
    avatar: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&q=80',
    points: 1337,
  },
];

type PartnerFilter = 'hype' | 'seguranca' | 'avaliacao';
type UserFilter = 'ganhos-mes' | 'ganhos-semana' | 'gastos-semana';

export default function RankingScreen() {
  const [partnerFilter, setPartnerFilter] = useState<PartnerFilter>('hype');
  const [userFilter, setUserFilter] = useState<UserFilter>('ganhos-mes');

  const getPartnerFilterTitle = () => {
    switch (partnerFilter) {
      case 'hype':
        return 'Top Parceiros por Hype';
      case 'seguranca':
        return 'Top Parceiros por Segurança';
      case 'avaliacao':
        return 'Top Parceiros por Avaliação';
      default:
        return 'Top Parceiros por Hype';
    }
  };

  const getUserFilterTitle = () => {
    switch (userFilter) {
      case 'ganhos-mes':
        return 'Mais Pontos Ganhos (Último Mês)';
      case 'ganhos-semana':
        return 'Mais Pontos Ganhos (Última Semana)';
      case 'gastos-semana':
        return 'Mais Gastos (Última Semana)';
      default:
        return 'Mais Pontos Ganhos (Último Mês)';
    }
  };

  const formatPoints = (points: number) => {
    return points.toLocaleString('pt-BR') + ' Pontos';
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Fixed Header */}
      <View style={styles.fixedHeader}>
        <View style={styles.headerContent}>
          <View style={styles.titleSection}>
            <View style={styles.iconContainer}>
              <Ionicons name="trophy" size={20} color="#fff" />
            </View>
            <Text style={styles.title}>Rankings da Comunidade</Text>
          </View>
        </View>
        
        <Text style={styles.subtitle}>
          Veja quem está liderando a comunidade.
        </Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Left Column - Partner Ranking */}
        <View style={styles.column}>
          <Text style={styles.sectionTitle}>Ranking de Parceiros</Text>
          
          {/* Partner Filter Tabs */}
          <View style={styles.filterTabsContainer}>
            <TouchableOpacity
              style={[
                styles.filterTab,
                partnerFilter === 'hype' && styles.filterTabActive
              ]}
              onPress={() => setPartnerFilter('hype')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterTabText,
                  partnerFilter === 'hype' && styles.filterTabTextActive
                ]}
              >
                Hype
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterTab,
                partnerFilter === 'seguranca' && styles.filterTabActive
              ]}
              onPress={() => setPartnerFilter('seguranca')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterTabText,
                  partnerFilter === 'seguranca' && styles.filterTabTextActive
                ]}
              >
                Segurança
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterTab,
                partnerFilter === 'avaliacao' && styles.filterTabActive
              ]}
              onPress={() => setPartnerFilter('avaliacao')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterTabText,
                  partnerFilter === 'avaliacao' && styles.filterTabTextActive
                ]}
              >
                Avaliação
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subsectionTitle}>{getPartnerFilterTitle()}</Text>

          {/* Partner List */}
          <View style={styles.rankingList}>
            {mockPartners.map((partner, index) => (
              <View key={partner.id} style={styles.rankingItem}>
                <View style={styles.rankIndicator}>
                  {index === 0 ? (
                    <Ionicons name="trophy" size={24} color="#FFD700" />
                  ) : (
                    <Text style={styles.rankNumber}>#{index + 1}</Text>
                  )}
                </View>
                <View
                  style={[
                    styles.partnerIcon,
                    { backgroundColor: partner.iconColor }
                  ]}
                >
                  <Text style={styles.partnerIconText}>{partner.icon}</Text>
                </View>
                <View style={styles.rankingItemContent}>
                  <Text style={styles.rankingItemName} numberOfLines={1}>
                    {partner.name}
                  </Text>
                  <Text style={styles.rankingItemValue}>{partner.hype} Hype</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Right Column - User Ranking */}
        <View style={styles.column}>
          <Text style={styles.sectionTitle}>Ranking de Usuários</Text>
          
          {/* User Filter Tabs */}
          <View style={styles.filterTabsContainer}>
            <TouchableOpacity
              style={[
                styles.filterTab,
                userFilter === 'ganhos-mes' && styles.filterTabActive
              ]}
              onPress={() => setUserFilter('ganhos-mes')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterTabText,
                  userFilter === 'ganhos-mes' && styles.filterTabTextActive
                ]}
              >
                Ganhos (Mês)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterTab,
                userFilter === 'ganhos-semana' && styles.filterTabActive
              ]}
              onPress={() => setUserFilter('ganhos-semana')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterTabText,
                  userFilter === 'ganhos-semana' && styles.filterTabTextActive
                ]}
              >
                Ganhos (Semana)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterTab,
                userFilter === 'gastos-semana' && styles.filterTabActive
              ]}
              onPress={() => setUserFilter('gastos-semana')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterTabText,
                  userFilter === 'gastos-semana' && styles.filterTabTextActive
                ]}
              >
                Gastos (Semana)
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subsectionTitle}>{getUserFilterTitle()}</Text>

          {/* User List */}
          <View style={styles.rankingList}>
            {mockUsers.map((user, index) => (
              <View key={user.id} style={styles.rankingItem}>
                <View style={styles.rankIndicator}>
                  {index === 0 ? (
                    <Ionicons name="trophy" size={24} color="#FFD700" />
                  ) : (
                    <Text style={styles.rankNumber}>#{index + 1}</Text>
                  )}
                </View>
                <Image
                  source={{ uri: user.avatar }}
                  style={styles.userAvatar}
                />
                <View style={styles.rankingItemContent}>
                  <Text style={styles.rankingItemName} numberOfLines={1}>
                    {user.name}
                  </Text>
                  <Text style={styles.rankingItemValue}>
                    {formatPoints(user.points)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
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
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingLeft: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  column: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  filterTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 2,
    marginBottom: 12,
    gap: 2,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
  },
  filterTabTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  rankingList: {
    gap: 8,
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  rankIndicator: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  partnerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  partnerIconText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  rankingItemContent: {
    flex: 1,
    gap: 2,
  },
  rankingItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  rankingItemValue: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});
