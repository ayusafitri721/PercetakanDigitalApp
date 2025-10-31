// screens/auth/WelcomeScreen.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  ImageBackground,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface WelcomeScreenProps {
  onGoToLogin: () => void;
  onGoToRegister: () => void;
}

export default function WelcomeScreen({
  onGoToLogin,
  onGoToRegister,
}: WelcomeScreenProps) {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#5AB9EA" />
      <View style={styles.container}>
        {/* Top Section with Background Pattern */}
        <ImageBackground
          source={require('../../assets/images/welcome-screen.png')}
          style={styles.topSection}
          resizeMode="cover"
          defaultSource={require('../../assets/images/welcome-screen.png')}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/Logo-Prin.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </ImageBackground>

        {/* Bottom Section - White Card */}
        <View style={styles.bottomSection}>
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeTitle}>Welcome</Text>
            <Text style={styles.welcomeSubtitle}>
              Cetak desain Anda dengan mudah dan cepat
            </Text>

            {/* Create Account Button */}
            <TouchableOpacity
              style={styles.createAccountButton}
              onPress={onGoToRegister}
              activeOpacity={0.8}
            >
              <Text style={styles.createAccountButtonText}>Create Account</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={onGoToLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>

            {/* Social Login Section */}
            <View style={styles.socialContainer}>
              <View style={styles.socialButtons}>
                <TouchableOpacity
                  style={styles.socialButton}
                  activeOpacity={0.7}
                >
                  <View style={styles.googleButton}>
                    <Text style={styles.googleIconText}>G</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.socialButton}
                  activeOpacity={0.7}
                >
                  <View style={styles.facebookButton}>
                    <Text style={styles.socialIconText}>f</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.socialButton}
                  activeOpacity={0.7}
                >
                  <View style={styles.twitterButton}>
                    <Text style={styles.socialIconText}>🐦</Text>
                  </View>
                </TouchableOpacity>
              </View>
              <Text style={styles.socialHint}>Sign in with Social account</Text>
            </View>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5AB9EA',
  },
  topSection: {
    flex: 1,
    backgroundColor: '#5AB9EA',
    paddingTop: 50,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  logoImage: {
    width: 200,
    height: 200,
    marginRight: 8,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
  },
  illustrationBox: {
    width: width * 0.75,
    height: 220,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    elevation: 4,
  },
  illustrationEmoji: {
    fontSize: 90,
    marginBottom: 10,
  },
  illustrationComputer: {
    fontSize: 65,
    position: 'absolute',
    bottom: 35,
  },
  illustrationDesk: {
    fontSize: 40,
    position: 'absolute',
    bottom: 10,
  },
  bottomSection: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 28,
    minHeight: '45%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  welcomeCard: {
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#5AB9EA',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  createAccountButton: {
    width: '100%',
    backgroundColor: '#5AB9EA',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#5AB9EA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  createAccountButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#5AB9EA',
    marginBottom: 32,
  },
  loginButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#5AB9EA',
    letterSpacing: 0.5,
  },
  socialContainer: {
    width: '100%',
    alignItems: 'center',
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  socialButton: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleButton: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
  },
  googleIconText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5AB9EA',
  },
  facebookButton: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    backgroundColor: '#1877F2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  twitterButton: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    backgroundColor: '#1DA1F2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  socialIconText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  socialHint: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
