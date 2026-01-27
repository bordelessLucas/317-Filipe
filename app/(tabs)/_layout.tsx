import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { Tabs, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const [isSparksPage, setIsSparksPage] = useState(false);

  useEffect(() => {
    // Verifica se está na página sparks
    const path = segments.join('/');
    setIsSparksPage(path.includes('sparks'));
  }, [segments]);

  return (
    <View style={styles.container}>
      {/* Retângulo branco acima do header - escondido na página sparks */}
      {!isSparksPage && (
        <>
          <View style={[styles.topBar, { height: insets.top }]} />
          <AppHeader />
        </>
      )}
      <Tabs
        screenOptions={{ 
          tabBarActiveTintColor: '#007AFF',
          headerShown: false,
          tabBarStyle: isSparksPage ? { display: 'none' } : undefined,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Feed',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="communities"
          options={{
            title: 'Comunidades',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="people" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="services"
          options={{
            title: 'Serviços',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="briefcase" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="sparks"
          options={{
            title: 'Sparks',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="flash" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="ranking"
          options={{
            title: 'Ranking',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="trophy" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="events"
          options={{
            title: 'Eventos',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  topBar: {
    backgroundColor: '#fff',
    width: '100%',
  },
});
