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

const mockPosts: Post[] = [
  {
    id: '1',
    userName: 'Alice Johnson',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    timeAgo: '2h',
    text: 'Exploring the city today! The architecture is breathtaking. 🏛️✨',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    type: 'photo',
    likes: 128,
    comments: 12,
    shares: 5,
  },
  {
    id: '2',
    userName: 'Bob Smith',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    timeAgo: '5h',
    text: 'Finally pushed the new feature I\'ve been working on for the past month. Feels great to see your hard work pay off! Check it out and let me know what you think. #programming #webdev #react',
    type: 'default',
    likes: 45,
    comments: 8,
    shares: 3,
  },
  {
    id: '3',
    userName: 'Charlie Brown',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
    timeAgo: '1d',
    text: 'Just finished an amazing workout session! 💪 Who else is staying active today?',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
    type: 'photo',
    likes: 89,
    comments: 15,
    shares: 7,
  },
  {
    id: '4',
    userName: 'Diana Prince',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
    timeAgo: '3h',
    text: 'Qual é a sua linguagem de programação favorita?',
    type: 'poll',
    poll: {
      question: 'Qual é a sua linguagem de programação favorita?',
      options: [
        { id: '1', text: 'JavaScript/TypeScript', votes: 45 },
        { id: '2', text: 'Python', votes: 32 },
        { id: '3', text: 'Java', votes: 18 },
        { id: '4', text: 'C++', votes: 12 },
      ],
      allowMultiple: false,
    },
    likes: 156,
    comments: 23,
    shares: 12,
  },
  {
    id: '5',
    userName: 'Emma Watson',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    timeAgo: '1h',
    text: 'Ao vivo agora! Tutorial de React Native para iniciantes 🚀',
    type: 'live',
    isLive: true,
    viewers: 1250,
    likes: 203,
    comments: 31,
    shares: 18,
  },
  {
    id: '6',
    userName: 'John Doe',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    timeAgo: '4h',
    text: 'Meu primeiro vídeo tutorial! Espero que gostem 🎬',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    type: 'video',
    likes: 89,
    comments: 15,
    shares: 7,
  },
  {
    id: '7',
    userName: 'Sarah Connor',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
    timeAgo: '6h',
    text: 'Dica rápida de design! 🎨✨',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    type: 'spark',
    likes: 234,
    comments: 42,
    shares: 19,
  },
  {
    id: '8',
    userName: 'Mike Johnson',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
    timeAgo: '8h',
    text: 'Qual plataforma você prefere para desenvolvimento mobile?',
    type: 'poll',
    poll: {
      question: 'Qual plataforma você prefere para desenvolvimento mobile?',
      options: [
        { id: '1', text: 'React Native', votes: 78 },
        { id: '2', text: 'Flutter', votes: 56 },
        { id: '3', text: 'Native (iOS/Android)', votes: 34 },
        { id: '4', text: 'Outra', votes: 12 },
      ],
      allowMultiple: true,
    },
    likes: 98,
    comments: 28,
    shares: 14,
  },
  {
    id: '9',
    userName: 'Lisa Anderson',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    timeAgo: '12h',
    text: 'Beautiful sunset from my window today. Sometimes the simple moments are the most precious. 🌅',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    type: 'photo',
    likes: 203,
    comments: 31,
    shares: 18,
  },
  {
    id: '10',
    userName: 'David Wilson',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    timeAgo: '1d',
    text: 'Novo Spark sobre dicas de produtividade! ⚡️',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    type: 'spark',
    likes: 312,
    comments: 67,
    shares: 28,
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
