import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Story {
  id: string;
  userName: string;
  avatarUrl?: string;
  isLive?: boolean;
  isOwn?: boolean;
}

const mockStories: Story[] = [
  { id: '1', userName: 'Seu Momento', isOwn: true },
  { id: '2', userName: 'Alice Johnson', isLive: true },
  { id: '3', userName: 'Bob Smith' },
  { id: '4', userName: 'Charlie Brown' },
  { id: '5', userName: 'Diana Prince' },
];

export function StoriesCarousel() {
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {mockStories.map((story) => (
          <TouchableOpacity 
            key={story.id} 
            style={styles.storyItem}
            onPress={() => {
              if (story.isOwn) {
                console.log('Criar momento');
              } else {
                console.log('Ver momento de', story.userName);
              }
            }}
          >
            <View style={[
              styles.avatarContainer,
              story.isLive && styles.liveBorder,
              story.isOwn && styles.ownBorder
            ]}>
              {story.avatarUrl ? (
                <Image source={{ uri: story.avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons 
                    name={story.isOwn ? "add" : "person"} 
                    size={24} 
                    color={story.isOwn ? "#007AFF" : "#666"} 
                  />
                </View>
              )}
            </View>
            {story.isLive && (
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            )}
            <Text style={styles.userName} numberOfLines={1}>
              {story.userName}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  scrollContent: {
    paddingHorizontal: 12,
    gap: 12,
  },
  storyItem: {
    alignItems: 'center',
    width: 70,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  liveBorder: {
    borderColor: '#FF3B30',
  },
  ownBorder: {
    borderColor: '#007AFF',
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  avatarPlaceholder: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveBadge: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  liveText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    width: 70,
  },
});
