import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const CalendarModal = ({
  visible,
  onClose,
  onSelectDate,
  initialDate,
}) => {
  const selectedDateStr = initialDate 
    ? initialDate.toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

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
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Icon name="close" size={28} color="#00ffe7" />
            </TouchableOpacity>
          </View>

          <Calendar
            current={selectedDateStr}
            onDayPress={day => {
              onSelectDate(new Date(day.timestamp));
              onClose();
            }}
            markedDates={{
              [selectedDateStr]: {
                selected: true,
                disableTouchEvent: true,
                selectedColor: '#00ffe7',
                selectedTextColor: '#1c2423',
              },
            }}
            theme={{
              backgroundColor: 'transparent',
              calendarBackground: 'transparent',
              textSectionTitleColor: '#00ffe7',
              selectedDayBackgroundColor: '#00ffe7',
              selectedDayTextColor: '#1c2423',
              todayTextColor: '#00ffe7',
              dayTextColor: '#ffffff',
              textDisabledColor: 'rgba(255, 255, 255, 0.2)',
              dotColor: '#00ffe7',
              selectedDotColor: '#1c2423',
              arrowColor: '#00ffe7',
              disabledArrowColor: '#d9e1e8',
              monthTextColor: '#ffffff',
              indicatorColor: '#00ffe7',
              textDayFontWeight: '500',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 14,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 13,
            }}
            style={styles.calendar}
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
    padding: 10,
    borderWidth: 2,
    borderColor: '#1d7968',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 10,
  },
  closeButton: {
    padding: 4,
  },
  calendar: {
    borderRadius: 15,
    backgroundColor: 'transparent',
  },
});

export default CalendarModal;
