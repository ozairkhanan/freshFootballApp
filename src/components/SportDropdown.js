import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const SPORTS = [
  { id: 'football', name: 'Football', icon: 'soccer', color: '#00ffe7', enabled: true },
  { id: 'basketball', name: 'Basketball', icon: 'basketball', color: '#ff9800', enabled: true },
  { id: 'cricket', name: 'Cricket', icon: 'cricket', color: '#ffeb3b', enabled: true },
  { id: 'tennis', name: 'Tennis', icon: 'tennis', color: '#A1FF0F', enabled: true },  
  { id: 'mma', name: 'MMA', icon: 'boxing-glove', color: '#f44336', enabled: false },
  { id: 'baseball', name: 'Baseball', icon: 'baseball', color: '#9e9e9e', enabled: false },
];

const SportDropdown = ({ selectedSport, onSelectSport }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const selectedSportData = SPORTS.find(s => s.id === selectedSport);

  const handleSelect = sport => {
    if (sport.enabled) {
      console.log('🎯 Sport selected:', sport.id);
      onSelectSport(sport.id);
      setIsOpen(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['rgba(0, 255, 231, 0.15)', 'rgba(0, 255, 231, 0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.buttonGradient}
        >
          <View style={[
            styles.sportIconWrapper,
            { backgroundColor: `${selectedSportData?.color}25` }
          ]}>
            <Icon
              name={selectedSportData?.icon}
              size={isTablet ? 24 : 20}
              color={selectedSportData?.color || "#fff"}
            />
          </View>
          <Text style={styles.sportName}>{selectedSportData?.name}</Text>
          <Icon
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={isTablet ? 20 : 18}
            color="rgba(255, 255, 255, 0.5)"
          />
        </LinearGradient>
      </TouchableOpacity>

      {isOpen && (
        <View style={[styles.dropdownMenu, {
          top: isTablet ? 64 : 56,
          width: isTablet ? 280 : (width * 0.6) > 210 ? (width * 0.6) : 210,
          maxWidth: width - 32,
        }]}>
          <LinearGradient
            colors={['rgba(29, 45, 44, 0.98)', 'rgba(42, 74, 68, 0.98)']}
            style={styles.menuGradient}
          >
            {SPORTS.map((sport, index) => (
              <TouchableOpacity
                key={sport.id}
                style={[
                  styles.menuItem,
                  selectedSport === sport.id && styles.menuItemSelected,
                  !sport.enabled && styles.menuItemDisabled,
                  index === SPORTS.length - 1 && styles.menuItemLast,
                ]}
                onPress={() => handleSelect(sport)}
                disabled={!sport.enabled}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.menuItemIconWrapper,
                  selectedSport === sport.id ? styles.menuItemIconWrapperActive : { backgroundColor: `${sport.color}15` }
                ]}>
                  <Icon
                    name={sport.icon}
                    size={22}
                    color={
                      selectedSport === sport.id
                        ? '#fff'
                        : !sport.enabled
                          ? 'rgba(255, 255, 255, 0.2)'
                          : sport.color
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.menuText,
                    { fontSize: isTablet ? 15 : 14 },
                    selectedSport === sport.id && styles.menuTextSelected,
                    !sport.enabled && styles.menuTextDisabled,
                  ]}
                >
                  {sport.name}
                </Text>

                {!sport.enabled ? (
                  <View style={styles.comingSoonBadge}>
                    <Text style={styles.comingSoonText}>SOON</Text>
                  </View>
                ) : (
                  <View style={styles.radioWrapper}>
                    <Icon
                      name={selectedSport === sport.id ? "radiobox-marked" : "radiobox-blank"}
                      size={20}
                      color={selectedSport === sport.id ? sport.color : "rgba(255, 255, 255, 0.3)"}
                    />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </LinearGradient>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { position: 'relative', zIndex: 9999 },
  dropdownButton: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
    width: '85%',
    height: 45,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 231, 0.3)',
    borderRadius: 24,
    justifyContent: 'center',
  },
  sportIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sportName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  dropdownMenu: {
    position: 'absolute',
    left: 0,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    zIndex: 10000,
  },
  menuGradient: {
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 231, 0.2)',
    borderRadius: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    marginBottom: 2,
  },
  menuItemLast: { marginBottom: 0 },
  menuItemSelected: {
    backgroundColor: 'rgba(0, 255, 231, 0.15)',
  },
  menuItemDisabled: { opacity: 0.4 },
  menuItemIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemIconWrapperActive: {
    backgroundColor: '#00ffe7',
  },
  menuText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    flex: 1,
  },
  menuTextSelected: { color: '#fff', fontWeight: '800' },
  menuTextDisabled: { color: 'rgba(255, 255, 255, 0.3)' },
  comingSoonBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  comingSoonText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});

export default SportDropdown;
