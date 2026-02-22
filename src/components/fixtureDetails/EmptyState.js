import React from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const {width} = Dimensions.get('window');
const isTablet = width >= 768;

const EmptyState = ({icon, title, subtitle}) => {
  return (
    <View style={styles.emptyState}>
      <Icon name={icon} size={isTablet ? 100 : 80} color="rgba(255,255,255,0.2)" />
      <Text style={styles.emptyText}>{title}</Text>
      <Text style={styles.emptySubtext}>{subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: isTablet ? 100 : 80,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: isTablet ? 20 : 18,
    fontWeight: '700',
    marginTop: isTablet ? 24 : 20,
  },
  emptySubtext: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: isTablet ? 16 : 14,
    marginTop: isTablet ? 12 : 8,
    textAlign: 'center',
  },
});

export default EmptyState;
