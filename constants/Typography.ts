/**
 * Centralized typography configuration for the app
 * Montserrat for headings, Roboto for body text
 */

export const Typography = {
  // Font Families
  fonts: {
    heading: 'Montserrat_700Bold',
    headingSemiBold: 'Montserrat_600SemiBold',
    headingMedium: 'Montserrat_500Medium',
    headingRegular: 'Montserrat_400Regular',
    
    body: 'Roboto_400Regular',
    bodyMedium: 'Roboto_500Medium',
    bodyBold: 'Roboto_700Bold',
  },
  
  // Font Sizes
  sizes: {
    // Headings
    h1: 32,
    h2: 28,
    h3: 24,
    h4: 20,
    h5: 18,
    h6: 16,
    
    // Body
    large: 18,
    regular: 16,
    medium: 14,
    small: 12,
    tiny: 10,
  },
  
  // Line Heights
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Font Weights (for reference)
  weights: {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
};

// Helper function to create text styles
export const createTextStyle = (
  fontFamily: string,
  fontSize: number,
  lineHeight?: number
) => ({
  fontFamily,
  fontSize,
  lineHeight: lineHeight || fontSize * Typography.lineHeights.normal,
});

// Pre-defined text styles
export const TextStyles = {
  // Headings (Montserrat)
  h1: createTextStyle(Typography.fonts.heading, Typography.sizes.h1),
  h2: createTextStyle(Typography.fonts.heading, Typography.sizes.h2),
  h3: createTextStyle(Typography.fonts.headingSemiBold, Typography.sizes.h3),
  h4: createTextStyle(Typography.fonts.headingSemiBold, Typography.sizes.h4),
  h5: createTextStyle(Typography.fonts.headingMedium, Typography.sizes.h5),
  h6: createTextStyle(Typography.fonts.headingMedium, Typography.sizes.h6),
  
  // Body Text (Roboto)
  bodyLarge: createTextStyle(Typography.fonts.body, Typography.sizes.large),
  body: createTextStyle(Typography.fonts.body, Typography.sizes.regular),
  bodyMedium: createTextStyle(Typography.fonts.bodyMedium, Typography.sizes.regular),
  bodyBold: createTextStyle(Typography.fonts.bodyBold, Typography.sizes.regular),
  
  // Small Text (Roboto)
  small: createTextStyle(Typography.fonts.body, Typography.sizes.small),
  smallMedium: createTextStyle(Typography.fonts.bodyMedium, Typography.sizes.small),
  smallBold: createTextStyle(Typography.fonts.bodyBold, Typography.sizes.small),
  
  // Buttons (Roboto Bold)
  button: createTextStyle(Typography.fonts.bodyBold, Typography.sizes.regular),
  buttonLarge: createTextStyle(Typography.fonts.bodyBold, Typography.sizes.large),
  buttonSmall: createTextStyle(Typography.fonts.bodyBold, Typography.sizes.medium),
  
  // Labels (Roboto Medium)
  label: createTextStyle(Typography.fonts.bodyMedium, Typography.sizes.medium),
  labelSmall: createTextStyle(Typography.fonts.bodyMedium, Typography.sizes.small),
  
  // Section Headers (Montserrat)
  sectionHeader: createTextStyle(Typography.fonts.headingSemiBold, Typography.sizes.h4),
  sectionSubheader: createTextStyle(Typography.fonts.headingMedium, Typography.sizes.h6),
};

export default Typography;
