// app/(tabs)/index.tsx
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

export default function TodayScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour,</Text>
          <Text style={styles.date}>Vendredi 9 janvier 2026</Text>
        </View>
        
        <TouchableOpacity style={styles.avatar}>
          <Ionicons name="person" size={28} color="#6366f1" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aujourd'hui</Text>

          {/* Exemple de tâches statiques */}
          <View style={styles.taskCard}>
            <View style={styles.taskLeft}>
              <View style={styles.checkbox}>
                {/* <MaterialIcons name="check" size={20} color="white" /> */}
              </View>
              <View>
                <Text style={styles.taskTitle}>Réunion équipe produit</Text>
                <Text style={styles.taskTime}>10:00 – 11:30</Text>
              </View>
            </View>
            <MaterialIcons name="more-vert" size={24} color="#64748b" />
          </View>

          {/* Ajoute d'autres tâches ici */}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <MaterialIcons name="add" size={32} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greeting: { fontSize: 16, color: '#64748b' },
  date: { fontSize: 22, fontWeight: '700', color: '#0f172a' },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  section: { marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#0f172a', marginBottom: 16 },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  taskLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskTitle: { fontSize: 16, fontWeight: '500', color: '#0f172a' },
  taskTime: { fontSize: 14, color: '#64748b', marginTop: 3 },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
});