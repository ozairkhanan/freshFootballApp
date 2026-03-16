import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Text, Platform } from 'react-native';
import Video from 'react-native-video';
import remoteConfig from '@react-native-firebase/remote-config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

console.log('💎 AdBanner.js FILE LOADED');

const AdBanner = () => {
  console.log('🛡️  AdBanner: Component mounted');
  const [videoUrl, setVideoUrl] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    console.log('🛡️  AdBanner: useEffect running');
    loadAd();
  }, []);

  const loadAd = async () => {
    try {
      // 1. Fetch values
      await remoteConfig().setConfigSettings({
        minimumFetchIntervalMillis: 0,
      });
      console.log('🛡️  AdBanner: Fetching...');
      await remoteConfig().fetchAndActivate();
      
      const showFooter = remoteConfig().getValue('show_footer_ad').asBoolean();
      const playlistStr = remoteConfig().getValue('footer_ad_playlist').asString();

      console.log('🗳️  AdBanner: show_footer_ad:', showFooter);
      console.log('🗳️  AdBanner: footer_ad_playlist raw:', playlistStr);

      if (!showFooter) {
        setShow(false);
        setLoading(false);
        return;
      }

      // 2. Parse Playlist
      let playlist = [];
      try {
        playlist = JSON.parse(playlistStr || '[]');
      } catch (e) {
        console.error("AdBanner: Parse error", e);
      }

      if (playlist.length === 0) {
        setShow(false);
        setLoading(false);
        return;
      }

      // 3. Rotation Logic
      const lastIndexStr = await AsyncStorage.getItem('@last_footer_ad_index');
      let nextIndex = 0;
      
      if (lastIndexStr !== null) {
        const lastIndex = parseInt(lastIndexStr, 10);
        nextIndex = (lastIndex + 1) % playlist.length;
      }

      setVideoUrl(playlist[nextIndex].url);
      setShow(true);
      console.log('🗳️  AdBanner: FINAL Playing:', playlist[nextIndex].url);
      await AsyncStorage.setItem('@last_footer_ad_index', nextIndex.toString());
      setLoading(false);

    } catch (err) {
      console.error("AdBanner error:", err);
      setLoading(false);
    }
  };

  console.log('🛡️  AdBanner: Render State:', { show, loading, videoUrl, dismissed });
  if (!show || loading || dismissed) return null;

  return (
    <View style={styles.container}>
      <Video
        source={{ uri: videoUrl }}
        style={styles.video}
        resizeMode="cover"
        repeat={true}
        muted={true}
        playInBackground={false}
        playWhenInactive={false}
      />
      <View style={styles.badge}>
        <Text style={styles.badgeText}>AD</Text>
      </View>
      <TouchableOpacity 
        style={styles.closeButton} 
        onPress={() => setDismissed(true)}
      >
        <Icon name="close" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '94%',
    height: 80,
    backgroundColor: '#111',
    alignSelf: 'center',
    marginVertical: 10,
    marginBottom: Platform.OS === 'ios' ? 95 : 85, // Push above absolute tab bar
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 4,
    borderRadius: 12,
  },
});

export default AdBanner;
