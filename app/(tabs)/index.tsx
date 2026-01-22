import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StoriesCarousel } from '../components/StoriesCarousel';
import { CreatePost } from '../components/CreatePost';
import { PostCard } from '../components/PostCard';

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

const mockPosts: Post[] = [
  {
    id: '1',
    userName: 'Alice Johnson',
    timeAgo: '2h',
    text: 'Exploring the city today! The architecture is breathtaking. 🏛️✨',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    likes: 128,
    comments: 12,
    shares: 5,
  },
  {
    id: '2',
    userName: 'Bob Smith',
    timeAgo: '5h',
    text: 'Finally pushed the new feature I\'ve been working on for the past month. Feels great to see your hard work pay off! Check it out and let me know what you think. #programming #webdev #react',
    likes: 45,
    comments: 8,
    shares: 3,
  },
  {
    id: '3',
    userName: 'Charlie Brown',
    timeAgo: '1d',
    text: 'Just finished an amazing workout session! 💪 Who else is staying active today?',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
    likes: 89,
    comments: 15,
    shares: 7,
  },
  {
    id: '4',
    userName: 'Diana Prince',
    timeAgo: '2d',
    text: 'New recipe experiment in the kitchen! This turned out better than expected. 🍳✨',
    imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80',
    likes: 156,
    comments: 23,
    shares: 12,
  },
  {
    id: '5',
    userName: 'Emma Watson',
    timeAgo: '3d',
    text: 'Beautiful sunset from my window today. Sometimes the simple moments are the most precious. 🌅',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    likes: 203,
    comments: 31,
    shares: 18,
  },
];

export default function FeedScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    // Simular atualização
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Stories/Momentos */}
        <StoriesCarousel />

        {/* Criar Post */}
        <CreatePost />

        {/* Feed de Posts */}
        {mockPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
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
  scrollContent: {
    paddingBottom: 20,
  },
});
