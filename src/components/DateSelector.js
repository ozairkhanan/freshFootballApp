import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomCalendarModal from './CustomCalendarModal';

const { width } = Dimensions.get('window');

const DateSelector = ({ selectedDate, onSelectDate }) => {
  const [showPicker, setShowPicker] = useState(false);

  // Generate 7 days centered on the selectedDate (if it's not today) or centered on Today
  const generateDates = () => {
    const dates = [];
    // Ensure selectedDate is a valid date object
    const anchor = selectedDate ? new Date(selectedDate) : new Date();
    
    // We want 7 days: 3 before, anchor, 3 after
    for (let i = -2; i <= 2; i++) {
      const d = new Date(anchor);
      d.setDate(anchor.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const days = generateDates();

  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const formatDate = (date) => {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dayDate = date.getDate();
    const month = date.getMonth() + 1;
    return {
      dayName,
      displayDate: `${dayDate}/${month < 10 ? '0' + month : month}`,
      isToday: isSameDay(date, new Date())
    };
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.pillContainer}>
        {/* Left: Globe Icon (Reset to Today) */}
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => onSelectDate(new Date())}
        >
          <View style={styles.globeCircle}>
            <Icon name="earth" size={24} color="#0a1a18" />
          </View>
        </TouchableOpacity>

        {/* Center: Date List */}
        <View style={styles.dateList}>
          {days.map((date, index) => {
            const { dayName, displayDate, isToday } = formatDate(date);
            const isSelected = isSameDay(date, selectedDate);

            return (
              <TouchableOpacity
                key={index}
                style={styles.dateItem}
                onPress={() => onSelectDate(date)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.dayText, 
                  isToday && styles.todayText,
                  isSelected && styles.selectedText
                ]}>
                  {isToday ? 'Today' : dayName}
                </Text>
                <Text style={[
                  styles.dateText,
                  isSelected && styles.selectedDateText
                ]}>
                  {displayDate}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Right: Calendar Icon (Open Custom Modal) */}
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => setShowPicker(true)}
        >
          <View style={styles.calendarCircle}>
            <Icon name="calendar-month" size={24} color="#0a1a18" />
          </View>
        </TouchableOpacity>
      </View>

      <CustomCalendarModal
        visible={showPicker}
        initialDate={selectedDate}
        onClose={() => setShowPicker(false)}
        onSelectDate={(date) => {
          onSelectDate(date);
          setShowPicker(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e1effc', // Light blue base color from design
    borderRadius: 40,
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconButton: {
    padding: 2,
  },
  globeCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1d7968', // Matching panel stroke color
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1d7968', // Same teal as globe icon
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateList: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  dateItem: {
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  dayText: {
    fontSize: 13,
    color: '#1d2e2a',
    fontWeight: '500',
  },
  todayText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a6e51',
  },
  dateText: {
    fontSize: 10,
    color: 'rgba(29, 46, 42, 0.6)',
    marginTop: 2,
    fontWeight: '600',
  },
  selectedText: {
    color: '#1a6e51',
    fontWeight: '800',
  },
  selectedDateText: {
    color: '#1a6e51',
  },
});

export default DateSelector;
