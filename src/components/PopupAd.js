import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  ActivityIndicator,
  Linking,
  Dimensions,
  StatusBar,
} from 'react-native';
import Video from 'react-native-video';
import remoteConfig from '@react-native-firebase/remote-config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const PopupAd = ({ visible, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [videoUrl, setVideoUrl] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (visible) {
      setupAd();
    } else {
      // Reset state when hidden
      setIsReady(false);
      setError(false);
      setVideoUrl('');
      setRedirectUrl('');
      setShouldShow(false);
    }
  }, [visible]);

  const setupAd = async () => {
    try {
      console.log('🎯 PopupAd: Initializing...');

      // Set defaults
      await remoteConfig().setDefaults({
        show_popup_ad: false,
        ad_duration: 5,
        popup_ad_url: '',
        popup_ad_redirect_url: '',
        popup_ad_playlist: '[]',
      });

      await remoteConfig().setConfigSettings({
        minimumFetchIntervalMillis: 0,
      });

      await remoteConfig().fetchAndActivate();

      const showAd = remoteConfig().getValue('show_popup_ad').asBoolean();
      const defaultUrl = remoteConfig().getValue('popup_ad_url').asString();
      const defaultRedirectUrl = remoteConfig().getValue('popup_ad_redirect_url').asString();
      const duration = remoteConfig().getValue('ad_duration').asNumber();
      const playlistStr = remoteConfig().getValue('popup_ad_playlist').asString();

      console.log('🎯 PopupAd: Raw values:', { showAd, duration, defaultUrl });

      if (!showAd) {
        console.log('🎯 PopupAd: Ads disabled. Skipping...');
        onClose();
        return;
      }

      let activeUrl = defaultUrl;
      let activeRedirectUrl = defaultRedirectUrl;

      // Rotation Logic
      try {
        const playlist = JSON.parse(playlistStr || '[]');
        if (Array.isArray(playlist) && playlist.length > 0) {
          console.log(`🎯 PopupAd: Found playlist with ${playlist.length} items.`);

          const lastIndexStr = await AsyncStorage.getItem('@last_popup_ad_index');
          let nextIndex = 0;
          if (lastIndexStr !== null) {
            const lastIndex = parseInt(lastIndexStr, 10);
            nextIndex = (lastIndex + 1) % playlist.length;
          }

          const selectedAd = playlist[nextIndex];
          activeUrl = selectedAd.url;
          activeRedirectUrl = selectedAd.redirectUrl || '';

          console.log(`🎯 PopupAd: Rotating to ad ${nextIndex + 1} of ${playlist.length}`);
          await AsyncStorage.setItem('@last_popup_ad_index', nextIndex.toString());
        }
      } catch (parseErr) {
        console.error('🎯 PopupAd: Playlist parse error:', parseErr);
      }

      if (!activeUrl) {
        console.log('🎯 PopupAd: No URL found. Skipping...');
        onClose();
        return;
      }

      console.log('🎯 PopupAd: Playing video:', activeUrl);
      setVideoUrl(activeUrl);
      setRedirectUrl(activeRedirectUrl);
      setTimeLeft(duration);
      setIsReady(true);
      setShouldShow(true);
    } catch (err) {
      console.error('🎯 PopupAd: Error during setup:', err);
      onClose();
    }
  };

  // Countdown timer
  useEffect(() => {
    let timer;
    if (isReady && timeLeft > 0 && !error) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isReady, timeLeft, error]);

  const handlePress = async () => {
    if (redirectUrl) {
      let url = redirectUrl.trim();
      if (!url.startsWith('http')) {
        url = 'https://' + url;
      }
      console.log('🔗 PopupAd: Redirect to:', url);
      try {
        await Linking.openURL(url);
      } catch (err) {
        console.error('🔗 PopupAd: Redirect error:', err);
      }
    }
  };

  const handleClose = () => {
    setShouldShow(false);
    onClose();
  };

  if (!visible || !shouldShow) return null;

  if (error) {
    onClose();
    return null;
  }

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={timeLeft <= 0 ? handleClose : undefined}
    >
      <View style={styles.overlay}>
        <View style={styles.adContainer}>
          {/* Loading state */}
          {!isReady && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#f97316" />
              <Text style={styles.loadingText}>Loading ad...</Text>
            </View>
          )}

          {/* Video */}
          {isReady && videoUrl ? (
            <>
              <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <Video
                  source={{ uri: videoUrl }}
                  style={styles.video}
                  resizeMode="cover"
                  repeat={true}
                  muted={false}
                  onError={(e) => {
                    console.error('PopupAd Video Error:', e);
                    setError(true);
                  }}
                />
              </View>

              {/* Touch catcher for redirect */}
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={handlePress}
                style={[StyleSheet.absoluteFill, { zIndex: 2 }]}
              />

              {/* AD badge */}
              <View style={styles.adBadge}>
                <Text style={styles.adBadgeText}>AD</Text>
              </View>

              {/* Timer / Close button */}
              <View style={styles.controlOverlay} pointerEvents="box-none">
                {timeLeft > 0 ? (
                  <View style={styles.timerBadge}>
                    <Icon name="timer-sand" size={14} color="#fff" />
                    <Text style={styles.timerText}>{timeLeft}s</Text>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                    <Icon name="close" size={20} color="#000" />
                    <Text style={styles.closeText}>Close Ad</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adContainer: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.7,
    backgroundColor: '#000',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(249, 115, 22, 0.4)',
    elevation: 20,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#999',
    marginTop: 12,
    fontSize: 14,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  adBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  adBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  controlOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  timerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f97316',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  closeText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 14,
  },
});

export default PopupAd;
