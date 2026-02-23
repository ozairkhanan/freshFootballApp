import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { gradients } from '../../theme';
import { EmptyState } from './CommonUI';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

/**
 * BaseStandings component - A reusable framework for all standings screens
 */
const BaseStandings = ({
  title,
  subtitle,
  sport = 'football',
  sportColor = '#4caf50',
  loading,
  error,
  standings = [],
  onRetry,
  onBack,
  renderHeader,
  renderRow,
  legendData = [],
  headerLeftIcon = 'arrow-left',
  sportIcon = 'soccer',
  children, // For additional controls like tabs/toggles
}) => {
  
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={gradients.background} style={styles.background}>
          <StandingsHeader title={title} onBack={onBack} leftIcon={headerLeftIcon} />
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={sportColor} />
            <Text style={styles.loadingText}>Loading standings...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={gradients.background} style={styles.background}>
          <StandingsHeader title={title} onBack={onBack} leftIcon={headerLeftIcon} />
          <View style={styles.centerContainer}>
            <Icon name="alert-circle-outline" size={64} color="#ff6b6b" />
            <Text style={styles.errorText}>Failed to load standings</Text>
            <Text style={styles.errorDetails}>{error}</Text>
            <TouchableOpacity style={[styles.retryButton, { backgroundColor: sportColor }]} onPress={onRetry}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={gradients.background} style={styles.background}>
        <StandingsHeader 
          title={title} 
          subtitle={subtitle} 
          subtitleColor={sportColor}
          onBack={onBack} 
          leftIcon={headerLeftIcon} 
        />

        {/* Sport Badge */}
        {sportIcon && (
          <View style={styles.sportBadge}>
            <LinearGradient
              colors={[sportColor, `${sportColor}cc`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sportBadgeGradient}
            >
              <Icon name={sportIcon} size={isTablet ? 22 : 18} color="#fff" style={styles.sportIcon} />
              <Text style={styles.sportBadgeText}>{sport.charAt(0).toUpperCase() + sport.slice(1)}</Text>
            </LinearGradient>
          </View>
        )}

        {children}

        {standings.length === 0 ? (
          <EmptyState 
            message="No standings available" 
            submessage="Standings data for this league is not available yet" 
          />
        ) : (
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={[styles.tableContainer, { borderColor: `${sportColor}40` }]}>
              {renderHeader && renderHeader()}
              {standings.map((item, index) => renderRow && renderRow(item, index))}
            </View>

            {/* Legend */}
            {legendData && legendData.length > 0 && (
              <View style={styles.legend}>
                {legendData.map((item, index) => (
                  <View key={index} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                    <Text style={styles.legendText}>{item.label}</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

/**
 * Sub-component for table Headers
 */
export const StandingsHeaderCell = ({ flex = 1, width, children, style }) => (
  <View style={[{ flex: width ? 0 : flex, width }, styles.headerCell, style]}>
    <Text style={styles.headerText}>{children}</Text>
  </View>
);

/**
 * Sub-component for individual team Rows
 */
export const StandingsRow = ({ 
  item, 
  index, 
  onPress, 
  highlightColor, 
  isEven, 
  children 
}) => (
  <TouchableOpacity
    activeOpacity={0.7}
    onPress={() => onPress && onPress(item.team?.id)}
    style={[
      styles.teamRow,
      isEven && styles.teamRowEven,
      highlightColor && { borderLeftWidth: 3, borderLeftColor: highlightColor }
    ]}
  >
    {children}
  </TouchableOpacity>
);

const StandingsHeader = ({ title, subtitle, subtitleColor, onBack, leftIcon }) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={onBack} style={styles.backButton}>
      <Icon name={leftIcon} size={24} color="#fff" />
    </TouchableOpacity>
    <View style={styles.headerTitleContainer}>
      <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
      {subtitle && <Text style={[styles.headerSubtitle, { color: subtitleColor }]}>{subtitle}</Text>}
    </View>
    <View style={styles.backButton} />
  </View>
);

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  background: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: isTablet ? 22 : 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: '600',
    marginTop: 2,
  },
  sportBadge: {
    alignItems: 'center',
    marginBottom: 16,
  },
  sportBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sportIcon: {
    marginRight: 8,
  },
  sportBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    marginTop: 16,
  },
  errorText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
  },
  errorDetails: {
    color: '#ff6b6b',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  scrollView: { flex: 1 },
  tableContainer: {
    marginHorizontal: isTablet ? 24 : 12,
    backgroundColor: 'rgba(29, 45, 44, 0.7)',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 16,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default BaseStandings;
