import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
  ViewStyle,
  TextStyle,
  ImageStyle,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { 
  Globe, 
  MapPin, 
  Shield, 
  Zap, 
  Users,
  Star,
  TrendingUp,
  MessageCircle,
  Award,
} from 'lucide-react-native';
import Colors from '../constants/Colors';
import Typography from '../constants/Typography';

const { width } = Dimensions.get('window');
const isMobile = width < 768;

export default function LandingPage() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleDownloadAPK = () => {
    const apkUrl = 'https://github.com/nganduntita1/marche.cd/releases/download/v1.0.0/marche-cd.apk';
    Linking.openURL(apkUrl);
  };

  const handleWebLogin = () => {
    router.push('/auth/login');
  };

  const features = [
    {
      icon: MapPin,
      title: 'Basé sur la localisation',
      description: 'Trouvez des articles près de chez vous avec un filtrage intelligent',
      color: Colors.primary,
    },
    {
      icon: Shield,
      title: 'Sûr et sécurisé',
      description: 'Conseils de sécurité intégrés et messagerie sécurisée',
      color: '#3b82f6',
    },
    {
      icon: Zap,
      title: 'Actions rapides',
      description: 'Promouvoir, partager et marquer les articles vendus instantanément',
      color: '#f59e0b',
    },
    {
      icon: Users,
      title: 'Notes et avis',
      description: 'Établissez la confiance avec les évaluations des acheteurs et vendeurs',
      color: '#8b5cf6',
    },
  ];

  const stats = [
    { icon: Users, value: '10K+', label: 'Utilisateurs actifs' },
    { icon: TrendingUp, value: '50K+', label: 'Articles listés' },
    { icon: MessageCircle, value: '100K+', label: 'Messages envoyés' },
    { icon: Award, value: '4.8', label: 'Note de l\'app' },
  ];

  const testimonials = [
    {
      name: 'Marie K.',
      location: 'Kinshasa',
      text: 'J\'ai vendu mon téléphone en moins de 24h! Interface simple et acheteurs sérieux.',
      rating: 5,
    },
    {
      name: 'Jean-Paul M.',
      location: 'Lubumbashi',
      text: 'Meilleure app pour acheter et vendre au Congo. Très sécurisée!',
      rating: 5,
    },
    {
      name: 'Sarah N.',
      location: 'Goma',
      text: 'Je trouve toujours ce que je cherche près de chez moi. Excellent!',
      rating: 5,
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <LinearGradient
        colors={[Colors.primary, Colors.secondary, Colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        {/* Floating badges - Only on web/tablet */}
        {!isMobile && (
          <>
            <View style={styles.floatingBadge1}>
              <View style={styles.badge}>
                <Star size={16} color={Colors.primary} fill={Colors.primary} />
                <Text style={styles.badgeText}>4.8★</Text>
              </View>
            </View>
            <View style={styles.floatingBadge2}>
              <View style={styles.badge}>
                <Users size={16} color={Colors.primary} />
                <Text style={styles.badgeText}>10K+ Utilisateurs</Text>
              </View>
            </View>
          </>
        )}

        <Animated.View 
          style={[
            styles.heroContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.heroTitleContainer}>
            <Text style={styles.heroTitle}>Marché.cd</Text>
            {!isMobile && (
              <View style={styles.verifiedBadge}>
                <Shield size={16} color={Colors.white} fill={Colors.white} />
                <Text style={styles.verifiedText}>Vérifié</Text>
              </View>
            )}
          </View>
          <Text style={styles.heroSubtitle}>
            Achetez et vendez tout, partout au Congo
          </Text>
          <Text style={styles.heroDescription}>
            Le moyen le plus simple de découvrir de bonnes affaires et de vendre des articles dans votre communauté locale
          </Text>

          {/* Download Buttons */}
          <View style={styles.downloadSection}>
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={handleDownloadAPK}
              activeOpacity={0.8}
            >
              <View style={styles.downloadButtonIcon}>
                <Image 
                  source={require('../assets/images/android.png')} 
                  style={styles.platformIcon}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.downloadButtonText}>
                <Text style={styles.downloadButtonLabel}>Télécharger pour</Text>
                <Text style={styles.downloadButtonTitle}>Android</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.comingSoonButton}>
              <View style={styles.downloadButtonIcon}>
                <Image 
                  source={require('../assets/images/apple.png')} 
                  style={styles.platformIcon}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.downloadButtonText}>
                <Text style={styles.comingSoonLabel}>Bientôt disponible</Text>
                <Text style={styles.comingSoonTitle}>iOS</Text>
              </View>
            </View>
          </View>

          {/* Web Login Link */}
          <TouchableOpacity
            style={styles.webLoginButton}
            onPress={handleWebLogin}
            activeOpacity={0.8}
          >
            <Globe size={20} color={Colors.white} />
            <Text style={styles.webLoginText}>Utiliser la version web</Text>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <stat.icon size={24} color={Colors.primary} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Features Section */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Pourquoi choisir Marché.cd?</Text>
        <Text style={styles.sectionSubtitle}>
          Tout ce dont vous avez besoin pour une expérience d'achat et de vente fluide
        </Text>
        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <LinearGradient
                colors={[feature.color + '15', feature.color + '05']}
                style={styles.featureIconContainer}
              >
                <feature.icon size={28} color={feature.color} />
              </LinearGradient>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Testimonials Section */}
      <View style={styles.testimonialsSection}>
        <Text style={styles.sectionTitle}>Ce que disent nos utilisateurs</Text>
        <Text style={styles.sectionSubtitle}>
          Rejoignez des milliers d'acheteurs et de vendeurs satisfaits
        </Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.testimonialsScroll}
          style={styles.testimonialsScrollView}
        >
          {testimonials.map((testimonial, index) => (
            <View key={index} style={styles.testimonialCard}>
              <View style={styles.testimonialHeader}>
                <View style={styles.testimonialAvatar}>
                  <Text style={styles.testimonialAvatarText}>
                    {testimonial.name.charAt(0)}
                  </Text>
                </View>
                <View style={styles.testimonialInfo}>
                  <Text style={styles.testimonialName}>{testimonial.name}</Text>
                  <Text style={styles.testimonialLocation}>{testimonial.location}</Text>
                </View>
              </View>
              <View style={styles.testimonialRating}>
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={14} color="#fbbf24" fill="#fbbf24" />
                ))}
              </View>
              <Text style={styles.testimonialText}>{testimonial.text}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* How It Works Section */}
      <View style={styles.howItWorksSection}>
        <Text style={styles.sectionTitle}>Comment ça marche</Text>
        <View style={styles.stepsContainer}>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepTitle}>Téléchargez et inscrivez-vous</Text>
            <Text style={styles.stepDescription}>
              Obtenez l'application et créez votre compte en quelques secondes
            </Text>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepTitle}>Parcourez ou publiez</Text>
            <Text style={styles.stepDescription}>
              Trouvez de bonnes affaires ou listez vos articles à vendre
            </Text>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepTitle}>Connectez et échangez</Text>
            <Text style={styles.stepDescription}>
              Discutez avec les acheteurs/vendeurs et finalisez votre transaction
            </Text>
          </View>
        </View>
      </View>

      {/* CTA Section */}
      <LinearGradient
        colors={[Colors.primary, Colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.ctaSection}
      >
        <Text style={styles.ctaTitle}>Prêt à commencer?</Text>
        <Text style={styles.ctaDescription}>
          Rejoignez des milliers d'utilisateurs qui achètent et vendent sur Marché.cd
        </Text>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleDownloadAPK}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaButtonText}>Télécharger maintenant</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2024 Marché.cd. Tous droits réservés.</Text>
        <View style={styles.footerLinks}>
          <TouchableOpacity onPress={() => router.push('/privacy')}>
            <Text style={styles.footerLink}>Politique de confidentialité</Text>
          </TouchableOpacity>
          <Text style={styles.footerDivider}>•</Text>
          <TouchableOpacity onPress={() => router.push('/terms')}>
            <Text style={styles.footerLink}>Conditions d'utilisation</Text>
          </TouchableOpacity>
          <Text style={styles.footerDivider}>•</Text>
          <TouchableOpacity onPress={() => router.push('/help-center')}>
            <Text style={styles.footerLink}>Centre d'aide</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  } as ViewStyle,
  hero: {
    paddingTop: Platform.OS === 'web' ? 80 : 60,
    paddingBottom: 60,
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'visible',
  } as ViewStyle,
  floatingBadge1: {
    position: 'absolute',
    top: 100,
    right: 20,
    zIndex: 10,
  } as ViewStyle,
  floatingBadge2: {
    position: 'absolute',
    top: 180,
    left: 20,
    zIndex: 10,
  } as ViewStyle,
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  } as ViewStyle,
  badgeText: {
    fontFamily: Typography.fonts.bodyBold,
    fontSize: 12,
    color: Colors.text,
  } as TextStyle,
  heroContent: {
    alignItems: 'center',
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  } as ViewStyle,
  heroTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  } as ViewStyle,
  heroTitle: {
    fontFamily: Typography.fonts.heading,
    fontSize: isMobile ? 36 : 48,
    color: Colors.white,
    textAlign: 'center',
  } as TextStyle,
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  } as ViewStyle,
  verifiedText: {
    fontFamily: Typography.fonts.bodyBold,
    fontSize: 10,
    color: Colors.white,
  } as TextStyle,
  heroSubtitle: {
    fontFamily: Typography.fonts.headingSemiBold,
    fontSize: isMobile ? 20 : Typography.sizes.h3,
    color: Colors.white,
    marginBottom: 12,
    textAlign: 'center',
    paddingHorizontal: isMobile ? 10 : 0,
  } as TextStyle,
  heroDescription: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.regular,
    color: Colors.white,
    textAlign: 'center',
    opacity: 0.95,
    marginBottom: 40,
    lineHeight: 24,
  } as TextStyle,
  downloadSection: {
    flexDirection: Platform.OS === 'web' && !isMobile ? 'row' : 'column',
    gap: isMobile ? 12 : 16,
    width: '100%',
    marginBottom: 24,
  } as ViewStyle,
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingVertical: isMobile ? 14 : 18,
    paddingHorizontal: isMobile ? 16 : 24,
    borderRadius: 16,
    gap: isMobile ? 10 : 12,
    flex: Platform.OS === 'web' && !isMobile ? 1 : undefined,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  } as ViewStyle,
  downloadButtonIcon: {
    width: isMobile ? 40 : 48,
    height: isMobile ? 40 : 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gray50,
  } as ViewStyle,
  platformIcon: {
    width: isMobile ? 28 : 32,
    height: isMobile ? 28 : 32,
  } as ImageStyle,
  downloadButtonText: {
    flex: 1,
  } as ViewStyle,
  downloadButtonLabel: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.small,
    color: Colors.textSecondary,
  } as TextStyle,
  downloadButtonTitle: {
    fontFamily: Typography.fonts.headingMedium,
    fontSize: Typography.sizes.h5,
    color: Colors.text,
  } as TextStyle,
  comingSoonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingVertical: isMobile ? 14 : 18,
    paddingHorizontal: isMobile ? 16 : 24,
    borderRadius: 16,
    gap: isMobile ? 10 : 12,
    flex: Platform.OS === 'web' && !isMobile ? 1 : undefined,
    opacity: 0.6,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  } as ViewStyle,
  comingSoonLabel: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.small,
    color: Colors.gray400,
  } as TextStyle,
  comingSoonTitle: {
    fontFamily: Typography.fonts.headingMedium,
    fontSize: Typography.sizes.h5,
    color: Colors.gray500,
  } as TextStyle,
  webLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.white,
  } as ViewStyle,
  webLoginText: {
    fontFamily: Typography.fonts.bodyBold,
    fontSize: Typography.sizes.regular,
    color: Colors.white,
  } as TextStyle,
  statsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    gap: 20,
  } as ViewStyle,
  statCard: {
    alignItems: 'center',
    minWidth: 140,
    padding: 16,
  } as ViewStyle,
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.gray50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  } as ViewStyle,
  statValue: {
    fontFamily: Typography.fonts.heading,
    fontSize: 28,
    color: Colors.text,
    marginBottom: 4,
  } as TextStyle,
  statLabel: {
    fontFamily: Typography.fonts.body,
    fontSize: 13,
    color: Colors.textSecondary,
  } as TextStyle,
  featuresSection: {
    paddingVertical: 60,
    paddingHorizontal: 20,
    backgroundColor: Colors.gray50,
  } as ViewStyle,
  sectionTitle: {
    fontFamily: Typography.fonts.heading,
    fontSize: Typography.sizes.h2,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
  } as TextStyle,
  sectionSubtitle: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  } as TextStyle,
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    maxWidth: 1200,
    alignSelf: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  featureCard: {
    backgroundColor: Colors.white,
    padding: 24,
    borderRadius: 16,
    width: '100%',
    minWidth: 280,
    maxWidth: 400,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  } as ViewStyle,
  featureIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  } as ViewStyle,
  featureTitle: {
    fontFamily: Typography.fonts.headingMedium,
    fontSize: Typography.sizes.h5,
    color: Colors.text,
    marginBottom: 8,
  } as TextStyle,
  featureDescription: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.regular,
    color: Colors.textSecondary,
    lineHeight: 22,
  } as TextStyle,
  howItWorksSection: {
    paddingVertical: 60,
    paddingHorizontal: 20,
  } as ViewStyle,
  stepsContainer: {
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  } as ViewStyle,
  step: {
    marginBottom: 32,
    alignItems: 'center',
  } as ViewStyle,
  stepNumber: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  } as ViewStyle,
  stepNumberText: {
    fontFamily: Typography.fonts.headingSemiBold,
    fontSize: Typography.sizes.h4,
    color: Colors.white,
  } as TextStyle,
  stepTitle: {
    fontFamily: Typography.fonts.headingSemiBold,
    fontSize: Typography.sizes.h4,
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  } as TextStyle,
  stepDescription: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  } as TextStyle,
  ctaSection: {
    paddingVertical: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
  } as ViewStyle,
  ctaTitle: {
    fontFamily: Typography.fonts.heading,
    fontSize: Typography.sizes.h2,
    color: Colors.white,
    marginBottom: 12,
    textAlign: 'center',
  } as TextStyle,
  ctaDescription: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.regular,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.95,
  } as TextStyle,
  ctaButton: {
    backgroundColor: Colors.white,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  } as ViewStyle,
  ctaButtonText: {
    fontFamily: Typography.fonts.bodyBold,
    fontSize: 18,
    color: Colors.primary,
  } as TextStyle,
  footer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: Colors.gray50,
    alignItems: 'center',
  } as ViewStyle,
  footerText: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.small,
    color: Colors.textSecondary,
    marginBottom: 16,
  } as TextStyle,
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  } as ViewStyle,
  footerLink: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.small,
    color: Colors.primary,
  } as TextStyle,
  footerDivider: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.small,
    color: Colors.gray300,
  } as TextStyle,
  testimonialsSection: {
    paddingVertical: 60,
    backgroundColor: Colors.white,
  } as ViewStyle,
  testimonialsScrollView: {
    width: '100%',
  } as ViewStyle,
  testimonialsScroll: {
    paddingHorizontal: 20,
    paddingRight: 40,
  } as ViewStyle,
  testimonialCard: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 20,
    width: isMobile ? width - 60 : 320,
    marginRight: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  } as ViewStyle,
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  } as ViewStyle,
  testimonialAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  testimonialAvatarText: {
    fontFamily: Typography.fonts.heading,
    fontSize: 20,
    color: Colors.white,
  } as TextStyle,
  testimonialInfo: {
    flex: 1,
  } as ViewStyle,
  testimonialName: {
    fontFamily: Typography.fonts.headingSemiBold,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 2,
  } as TextStyle,
  testimonialLocation: {
    fontFamily: Typography.fonts.body,
    fontSize: 13,
    color: Colors.textSecondary,
  } as TextStyle,
  testimonialRating: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 12,
  } as ViewStyle,
  testimonialText: {
    fontFamily: Typography.fonts.body,
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  } as TextStyle,
});
