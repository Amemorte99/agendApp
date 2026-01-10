// components/CalendarMini.tsx
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format, addDays, subDays } from 'date-fns';
import { useState } from 'react';

interface Props {
  onDateSelect: (date: Date) => void;
}

export default function CalendarMini({ onDateSelect }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setCurrentDate(subDays(currentDate, 7))}>
        <Text>◀</Text>
      </TouchableOpacity>
      <Text>{format(currentDate, 'MMMM yyyy')}</Text>
      <TouchableOpacity onPress={() => setCurrentDate(addDays(currentDate, 7))}>
        <Text>▶</Text>
      </TouchableOpacity>
      {/* TODO: grille jours, utiliser une lib comme react-native-calendars si besoin */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
});