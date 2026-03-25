import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, SafeAreaView, ActivityIndicator, Linking } from 'react-native';
import Video from 'react-native-video';
import remoteConfig from '@react-native-firebase/remote-config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SplashAdScreen = ({ onFinish }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [videoUrl, setVideoUrl] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setupAd();
  }, []);

  const setupAd = async () => {
    try {
      console.log("🎬 SplashAd: Initializing...");
      
      // 1. Set default values
      await remoteConfig().setDefaults({
        show_splash_ad: false,
        ad_duration: 5,
        splash_ad_url: '',
        splash_ad_redirect_url: '',
        splash_ad_playlist: '[]',
      });

      // 2. Clear cache settings for testing
      await remoteConfig().setConfigSettings({
        minimumFetchIntervalMillis: 0,
      });

      console.log("🎬 SplashAd: Fetching Remote Config...");
      
      // 3. Fetch and Activate
      await remoteConfig().fetchAndActivate();

      // 4. Get Values
      const showAd = remoteConfig().getValue('show_splash_ad').asBoolean();
      const defaultUrl = remoteConfig().getValue('splash_ad_url').asString();
      const defaultRedirectUrl = remoteConfig().getValue('splash_ad_redirect_url').asString();
      const duration = remoteConfig().getValue('ad_duration').asNumber();
      const playlistStr = remoteConfig().getValue('splash_ad_playlist').asString();

      console.log("🎬 SplashAd: Raw values:", { showAd, duration, defaultUrl });
      console.log("🎬 SplashAd: Raw Playlist Str:", playlistStr);

      if (!showAd) {
        console.log("🎬 SplashAd: Ads disabled. skipping...");
        onFinish();
        return;
      }

      let activeUrl = defaultUrl;
      let activeRedirectUrl = defaultRedirectUrl;
      
      // 5. Rotation Logic
      try {
        const playlist = JSON.parse(playlistStr || '[]');
        if (Array.isArray(playlist) && playlist.length > 0) {
          console.log(`🎬 SplashAd: Found playlist with ${playlist.length} items.`);
          
          // Get the last index from storage
          const lastIndexStr = await AsyncStorage.getItem('@last_ad_index');
          console.log(`🎬 SplashAd: Current index in storage: ${lastIndexStr}`);
          
          let nextIndex = 0;
          if (lastIndexStr !== null) {
            const lastIndex = parseInt(lastIndexStr, 10);
            nextIndex = (lastIndex + 1) % playlist.length;
          }
          
          const selectedAd = playlist[nextIndex];
          activeUrl = selectedAd.url;
          activeRedirectUrl = selectedAd.redirectUrl || '';
          
          console.log(`🎬 SplashAd: Rotating to ad ${nextIndex + 1} of ${playlist.length} (Index: ${nextIndex})`);
          
          // Save the new index
          await AsyncStorage.setItem('@last_ad_index', nextIndex.toString());
          const checkSave = await AsyncStorage.getItem('@last_ad_index');
          console.log(`🎬 SplashAd: Verified storage save. New index: ${checkSave}`);
        } else {
          console.log("🎬 SplashAd: Playlist is empty or not an array. Using defaultUrl.");
        }
      } catch (parseErr) {
        console.error("🎬 SplashAd: Playlist parse error:", parseErr);
        // Fallback to defaultUrl (already set)
      }

      if (!activeUrl) {
        console.log("🎬 SplashAd: No URL found. skipping...");
        onFinish();
        return;
      }

      console.log("🎬 SplashAd: FINAL Playing video:", activeUrl);
      console.log("🔗 SplashAd: Redirect URL:", activeRedirectUrl);
      setVideoUrl(activeUrl);
      setRedirectUrl(activeRedirectUrl);
      setTimeLeft(duration);
      setIsReady(true);
      
    } catch (err) {
      console.error("🎬 SplashAd: Error during setup:", err);
      onFinish();
    }
  };

  useEffect(() => {
    let timer;
    if (isReady && timeLeft > 0 && !error) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isReady && timeLeft <= 0) {
      // Auto close or show skip button depending on preference.
      // We'll just show the skip button when it hits 0.
    }
    return () => clearInterval(timer);
  }, [isReady, timeLeft, error]);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00ffcc" />
      </View>
    );
  }

  const handlePress = async () => {
    console.log('🛡️ SplashAd: Press detected');
    if (redirectUrl) {
      let url = redirectUrl.trim();
      if (!url.startsWith('http')) {
        url = 'https://' + url;
      }
      
      console.log('🔗 SplashAd: Attempting redirect to:', url);
      try {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          console.warn("🛡️ SplashAd: Cannot open URL:", url);
          // Fallback: try openURL anyway as canOpenURL is sometimes unreliable on Android
          await Linking.openURL(url);
        }
      } catch (err) {
        console.error("🛡️ SplashAd: Redirect error:", err);
      }
    } else {
      console.log('🛡️ SplashAd: No redirect URL configured');
    }
  };

  if (error) {
    onFinish(); // Fallback if video fails to load
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>

      {/* Fix: wrap Video in View with pointerEvents="none" */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Video
          source={{ uri: videoUrl }}
          style={styles.video}
          resizeMode="cover"
          repeat={true}
          onError={(e) => {
            console.error("Video Error:", e);
            setError(true);
          }}
        />
      </View>

      {/* Transparent touch catcher sits above video, below overlay */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        style={[StyleSheet.absoluteFill, { zIndex: 2 }]}
      />

      <View style={styles.overlay} pointerEvents="box-none">
        {timeLeft > 0 ? (
          <View style={styles.timerBadge}>
            <Text style={styles.timerText}>Skip in {timeLeft}s</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.skipButton} onPress={onFinish}>
            <Text style={styles.skipText}>Skip Ad ➔</Text>
          </TouchableOpacity>
        )}
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center'
  },
  touchable: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 20,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    zIndex: 10,
  },
  timerBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
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
  skipButton: {
    backgroundColor: '#00ffcc',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#00ffcc',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  skipText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 14,
  }
});

export default SplashAdScreen;
