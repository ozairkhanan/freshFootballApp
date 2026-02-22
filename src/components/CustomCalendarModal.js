import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const CustomCalendarModal = ({
  visible,
  onClose,
  onSelectDate,
  initialDate,
}) => {
  const [currentMonth, setCurrentMonth] = useState(
    new Date(initialDate || new Date()),
  );

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const firstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const generateMonthData = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    const days = [];
    // Padding for start of month
    for (let i = 0; i < startDay; i++) {
      days.push({ id: `empty-${i}`, value: null });
    }
    // Days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ id: `day-${i}`, value: i });
    }
    return days;
  };

  const changeMonth = offset => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + offset);
    setCurrentMonth(newMonth);
  };

  const monthName = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const renderDay = ({ item }) => {
    if (!item.value) return <View style={styles.dayBox} />;

    const isSelected =
      initialDate &&
      item.value === initialDate.getDate() &&
      currentMonth.getMonth() === initialDate.getMonth() &&
      currentMonth.getFullYear() === initialDate.getFullYear();

    return (
      <TouchableOpacity
        style={[styles.dayBox, isSelected && styles.selectedDay]}
        onPress={() => {
          const selected = new Date(currentMonth);
          selected.setDate(item.value);
          onSelectDate(selected);
          onClose();
        }}
      >
        <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>
          {item.value}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <LinearGradient
          colors={['#0d1a1a', '#1c2e2c', '#1c2e2c', '#0d1a1a']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.calendarContainer}
        >
          {/* Header with navigation and close button */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => changeMonth(-1)}
            >
              <Icon name="menu-left" size={32} color="#00ffe7" />
            </TouchableOpacity>

            <Text style={styles.monthTitle}>{monthName}</Text>

            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => changeMonth(1)}
              >
                <Icon name="menu-right" size={32} color="#00ffe7" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Icon name="close" size={28} color="#00ffe7" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Divider line */}
          <View style={styles.dividerLine} />

          {/* Week Days */}
          <View style={styles.weekRow}>
            {weekDays.map(day => (
              <Text key={day} style={styles.weekDayText}>
                {day}
              </Text>
            ))}
          </View>

          {/* Grid */}
          <FlatList
            data={generateMonthData()}
            renderItem={renderDay}
            numColumns={7}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.gridStyle}
            scrollEnabled={false}
          />
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarContainer: {
    width: width * 0.9,
    maxWidth: 400,
    borderRadius: 20,
    padding: 20,
    paddingTop: 16,
    borderWidth: 2,
    borderColor: '#1d7968', // Teal border
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navButton: {
    padding: 4,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#00ffe7', // Teal divider
    marginBottom: 16,
    opacity: 0.6,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  weekDayText: {
    width: (width * 0.9 - 40) / 7,
    textAlign: 'center',
    fontSize: 13,
    color: '#00ffe7', // Teal text
    fontWeight: '600',
  },
  gridStyle: {
    paddingBottom: 10,
  },
  dayBox: {
    width: (width * 0.9 - 40) / 7,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    marginVertical: 2,
  },
  dayText: {
    fontSize: 15,
    color: '#00ffe7', // Teal text
    fontWeight: '500',
  },
  selectedDay: {
    backgroundColor: '#00ffe7', // Teal background
  },
  selectedDayText: {
    color: '#1c2423', // Dark text on selected
    fontWeight: '700',
  },
});

export default CustomCalendarModal;
