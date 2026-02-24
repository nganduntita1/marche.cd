// Guidance Content Service
// Manages all guidance content including tooltips, tours, message templates, and safety tips
// Provides i18n support for English and French

import { TooltipContent, Tour, TourStep, MessageTemplate, QuickAction, TriggerCondition } from '../types/guidance';

// ============================================================================
// CONTENT DEFINITIONS
// ============================================================================

// Tooltip Content Definitions
const TOOLTIPS = {
  // Landing Page Tooltips
  landing_download: {
    en: {
      id: 'landing_download',
      title: 'Download the App',
      message: 'Tap here to download Marché.cd on your device and start buying and selling!',
      placement: 'top' as const,
      icon: '📱',
      actionLabel: 'Got it',
    },
    fr: {
      id: 'landing_download',
      title: 'Télécharger l\'application',
      message: 'Appuyez ici pour télécharger Marché.cd sur votre appareil et commencer à acheter et vendre !',
      placement: 'top' as const,
      icon: '📱',
      actionLabel: 'Compris',
    },
  },

  // Authentication Tooltips
  auth_phone_number: {
    en: {
      id: 'auth_phone_number',
      title: 'Phone Number Format',
      message: 'Enter your phone number starting with +243 or 0. Example: +243 812 345 678',
      placement: 'bottom' as const,
      icon: '📞',
      dismissLabel: 'Got it',
    },
    fr: {
      id: 'auth_phone_number',
      title: 'Format du numéro',
      message: 'Entrez votre numéro commençant par +243 ou 0. Exemple : +243 812 345 678',
      placement: 'bottom' as const,
      icon: '📞',
      dismissLabel: 'Compris',
    },
  },

  auth_password: {
    en: {
      id: 'auth_password',
      title: 'Create Strong Password',
      message: 'Use at least 6 characters. Mix letters, numbers, and symbols for better security.',
      placement: 'bottom' as const,
      icon: '🔒',
      dismissLabel: 'OK',
    },
    fr: {
      id: 'auth_password',
      title: 'Créer un mot de passe fort',
      message: 'Utilisez au moins 6 caractères. Mélangez lettres, chiffres et symboles pour plus de sécurité.',
      placement: 'bottom' as const,
      icon: '🔒',
      dismissLabel: 'OK',
    },
  },

  auth_location: {
    en: {
      id: 'auth_location',
      title: 'Your City',
      message: 'Enter your city name (e.g., Kinshasa, Lubumbashi). This helps buyers find items near them!',
      placement: 'bottom' as const,
      icon: '📍',
      dismissLabel: 'Got it',
    },
    fr: {
      id: 'auth_location',
      title: 'Votre ville',
      message: 'Entrez le nom de votre ville (ex: Kinshasa, Lubumbashi). Cela aide les acheteurs à trouver des articles près d\'eux !',
      placement: 'bottom' as const,
      icon: '📍',
      dismissLabel: 'Compris',
    },
  },

  auth_email_optional: {
    en: {
      id: 'auth_email_optional',
      title: 'Email (Optional)',
      message: 'You can provide your email or we\'ll create one for you automatically. Either way works!',
      placement: 'bottom' as const,
      icon: '✉️',
      dismissLabel: 'OK',
    },
    fr: {
      id: 'auth_email_optional',
      title: 'Email (Optionnel)',
      message: 'Vous pouvez fournir votre email ou nous en créerons un automatiquement. Les deux fonctionnent !',
      placement: 'bottom' as const,
      icon: '✉️',
      dismissLabel: 'OK',
    },
  },

  auth_terms: {
    en: {
      id: 'auth_terms',
      title: 'Terms & Privacy',
      message: 'Please review and accept our terms to continue. We respect your privacy and data!',
      placement: 'top' as const,
      icon: '📋',
      dismissLabel: 'Understood',
    },
    fr: {
      id: 'auth_terms',
      title: 'Conditions & Confidentialité',
      message: 'Veuillez lire et accepter nos conditions pour continuer. Nous respectons votre vie privée et vos données !',
      placement: 'top' as const,
      icon: '📋',
      dismissLabel: 'Compris',
    },
  },

  auth_profile_complete: {
    en: {
      id: 'auth_profile_complete',
      title: 'Complete Your Profile',
      message: 'Adding these details helps build trust with buyers and sellers. It only takes a minute!',
      placement: 'top' as const,
      icon: '✨',
      dismissLabel: 'Let\'s do it',
    },
    fr: {
      id: 'auth_profile_complete',
      title: 'Complétez votre profil',
      message: 'Ajouter ces détails aide à établir la confiance avec les acheteurs et vendeurs. Ça ne prend qu\'une minute !',
      placement: 'top' as const,
      icon: '✨',
      dismissLabel: 'Allons-y',
    },
  },

  auth_whatsapp: {
    en: {
      id: 'auth_whatsapp',
      title: 'WhatsApp Number',
      message: 'This is how buyers will contact you. Make sure it\'s a number you check regularly!',
      placement: 'bottom' as const,
      icon: '💬',
      dismissLabel: 'Got it',
    },
    fr: {
      id: 'auth_whatsapp',
      title: 'Numéro WhatsApp',
      message: 'C\'est ainsi que les acheteurs vous contacteront. Assurez-vous que c\'est un numéro que vous consultez régulièrement !',
      placement: 'bottom' as const,
      icon: '💬',
      dismissLabel: 'Compris',
    },
  },

  // Home Screen Tooltips
  home_search: {
    en: {
      id: 'home_search',
      title: 'Search Items',
      message: 'Search for items by name, category, or description. Try "phone" or "furniture"!',
      placement: 'bottom' as const,
      icon: '🔍',
      dismissLabel: 'Got it',
    },
    fr: {
      id: 'home_search',
      title: 'Rechercher des articles',
      message: 'Recherchez des articles par nom, catégorie ou description. Essayez "téléphone" ou "meubles" !',
      placement: 'bottom' as const,
      icon: '🔍',
      dismissLabel: 'Compris',
    },
  },

  home_location: {
    en: {
      id: 'home_location',
      title: 'Location Filter',
      message: 'Set your location to see items near you. You can adjust the search radius too!',
      placement: 'bottom' as const,
      icon: '📍',
      dismissLabel: 'OK',
    },
    fr: {
      id: 'home_location',
      title: 'Filtre de localisation',
      message: 'Définissez votre position pour voir les articles près de vous. Vous pouvez aussi ajuster le rayon de recherche !',
      placement: 'bottom' as const,
      icon: '📍',
      dismissLabel: 'OK',
    },
  },

  // Listing Detail Tooltips
  listing_contact_seller: {
    en: {
      id: 'listing_contact_seller',
      title: 'Contact Seller',
      message: 'Tap here to send a message to the seller and ask questions about this item.',
      placement: 'top' as const,
      icon: '💬',
      actionLabel: 'Got it',
    },
    fr: {
      id: 'listing_contact_seller',
      title: 'Contacter le vendeur',
      message: 'Appuyez ici pour envoyer un message au vendeur et poser des questions sur cet article.',
      placement: 'top' as const,
      icon: '💬',
      actionLabel: 'Compris',
    },
  },

  listing_favorite: {
    en: {
      id: 'listing_favorite',
      title: 'Save to Favorites',
      message: 'Tap the heart to save this item. Find all your favorites in the Favorites tab!',
      placement: 'left' as const,
      icon: '❤️',
      dismissLabel: 'OK',
    },
    fr: {
      id: 'listing_favorite',
      title: 'Ajouter aux favoris',
      message: 'Appuyez sur le cœur pour sauvegarder cet article. Retrouvez tous vos favoris dans l\'onglet Favoris !',
      placement: 'left' as const,
      icon: '❤️',
      dismissLabel: 'OK',
    },
  },

  listing_image_swipe: {
    en: {
      id: 'listing_image_swipe',
      title: 'View All Photos',
      message: 'Swipe left or right to see all photos of this item. Tap to view in full screen.',
      placement: 'bottom' as const,
      icon: '🖼️',
      dismissLabel: 'Got it',
    },
    fr: {
      id: 'listing_image_swipe',
      title: 'Voir toutes les photos',
      message: 'Faites glisser à gauche ou à droite pour voir toutes les photos. Appuyez pour voir en plein écran.',
      placement: 'bottom' as const,
      icon: '🖼️',
      dismissLabel: 'Compris',
    },
  },

  listing_quick_actions: {
    en: {
      id: 'listing_quick_actions',
      title: 'Quick Actions',
      message: 'Use these quick actions to contact the seller or save this item for later.',
      placement: 'top' as const,
      icon: '⚡',
      dismissLabel: 'OK',
    },
    fr: {
      id: 'listing_quick_actions',
      title: 'Actions rapides',
      message: 'Utilisez ces actions rapides pour contacter le vendeur ou sauvegarder cet article.',
      placement: 'top' as const,
      icon: '⚡',
      dismissLabel: 'OK',
    },
  },

  listing_favorite_confirmation: {
    en: {
      id: 'listing_favorite_confirmation',
      title: 'Saved!',
      message: 'This item has been added to your favorites. You can find it in the Favorites tab.',
      placement: 'top' as const,
      icon: '✅',
      dismissLabel: 'Great',
    },
    fr: {
      id: 'listing_favorite_confirmation',
      title: 'Sauvegardé !',
      message: 'Cet article a été ajouté à vos favoris. Vous pouvez le retrouver dans l\'onglet Favoris.',
      placement: 'top' as const,
      icon: '✅',
      dismissLabel: 'Super',
    },
  },

  listing_seller_profile: {
    en: {
      id: 'listing_seller_profile',
      title: 'Check Seller Profile',
      message: 'Always check the seller\'s profile, ratings, and history. Meet in a public and safe place.',
      placement: 'bottom' as const,
      icon: '🛡️',
      dismissLabel: 'Understood',
    },
    fr: {
      id: 'listing_seller_profile',
      title: 'Vérifier le profil du vendeur',
      message: 'Vérifiez toujours le profil, les notes et l\'historique du vendeur. Rencontrez-vous dans un lieu public et sûr.',
      placement: 'bottom' as const,
      icon: '🛡️',
      dismissLabel: 'Compris',
    },
  },

  // Chat/Messaging Tooltips
  chat_welcome: {
    en: {
      id: 'chat_welcome',
      title: 'Welcome to Chat!',
      message: 'Use our message templates for quick replies. Always be polite and meet in public places.',
      placement: 'center' as const,
      icon: '💬',
      actionLabel: 'Got it',
    },
    fr: {
      id: 'chat_welcome',
      title: 'Bienvenue dans le Chat !',
      message: 'Utilisez nos modèles de messages pour des réponses rapides. Soyez toujours poli et rencontrez-vous dans des lieux publics.',
      placement: 'center' as const,
      icon: '💬',
      actionLabel: 'Compris',
    },
  },

  chat_template_picker: {
    en: {
      id: 'chat_template_picker',
      title: 'Message Templates',
      message: 'Tap here to use pre-written message templates for common scenarios like inquiries and negotiations.',
      placement: 'top' as const,
      icon: '📝',
      dismissLabel: 'Show me',
    },
    fr: {
      id: 'chat_template_picker',
      title: 'Modèles de messages',
      message: 'Appuyez ici pour utiliser des modèles de messages pré-écrits pour des scénarios courants comme les demandes et négociations.',
      placement: 'top' as const,
      icon: '📝',
      dismissLabel: 'Montrer',
    },
  },

  chat_milestone_5: {
    en: {
      id: 'chat_milestone_5',
      title: 'Great Progress!',
      message: 'You\'ve exchanged 5 messages. Consider agreeing on a meeting place and time.',
      placement: 'center' as const,
      icon: '🎉',
      dismissLabel: 'Thanks',
    },
    fr: {
      id: 'chat_milestone_5',
      title: 'Beau progrès !',
      message: 'Vous avez échangé 5 messages. Pensez à convenir d\'un lieu et d\'une heure de rencontre.',
      placement: 'center' as const,
      icon: '🎉',
      dismissLabel: 'Merci',
    },
  },

  chat_safety_reminder: {
    en: {
      id: 'chat_safety_reminder',
      title: 'Safety First',
      message: 'We noticed contact information. Remember to meet in public places and never send money before meeting.',
      placement: 'center' as const,
      icon: '🛡️',
      dismissLabel: 'Understood',
    },
    fr: {
      id: 'chat_safety_reminder',
      title: 'Sécurité d\'abord',
      message: 'Nous avons remarqué des informations de contact. Rappelez-vous de vous rencontrer dans des lieux publics et de ne jamais envoyer d\'argent avant de vous rencontrer.',
      placement: 'center' as const,
      icon: '🛡️',
      dismissLabel: 'Compris',
    },
  },

  chat_response_reminder: {
    en: {
      id: 'chat_response_reminder',
      title: 'Response Reminder',
      message: 'You haven\'t responded in 24 hours. Quick replies help maintain buyer interest!',
      placement: 'center' as const,
      icon: '⏰',
      dismissLabel: 'Reply now',
    },
    fr: {
      id: 'chat_response_reminder',
      title: 'Rappel de réponse',
      message: 'Vous n\'avez pas répondu depuis 24 heures. Des réponses rapides aident à maintenir l\'intérêt de l\'acheteur !',
      placement: 'center' as const,
      icon: '⏰',
      dismissLabel: 'Répondre maintenant',
    },
  },

  // Search and Filter Tooltips
  search_bar_tips: {
    en: {
      id: 'search_bar_tips',
      title: 'Search Tips',
      message: 'Search by item name, brand, or category. Try "Samsung", "furniture", or "bike"!',
      placement: 'bottom' as const,
      icon: '🔍',
      dismissLabel: 'Got it',
    },
    fr: {
      id: 'search_bar_tips',
      title: 'Conseils de recherche',
      message: 'Recherchez par nom d\'article, marque, ou catégorie. Essayez "Samsung", "meubles", ou "vélo" !',
      placement: 'bottom' as const,
      icon: '🔍',
      dismissLabel: 'Compris',
    },
  },

  location_filter_explanation: {
    en: {
      id: 'location_filter_explanation',
      title: 'Distance Filter',
      message: 'Choose a search radius to see items nearby. The smaller the radius, the closer the results!',
      placement: 'bottom' as const,
      icon: '📍',
      dismissLabel: 'Got it',
    },
    fr: {
      id: 'location_filter_explanation',
      title: 'Filtre de distance',
      message: 'Choisissez un rayon de recherche pour voir les articles à proximité. Plus le rayon est petit, plus les résultats sont proches !',
      placement: 'bottom' as const,
      icon: '📍',
      dismissLabel: 'Compris',
    },
  },

  filter_price_range: {
    en: {
      id: 'filter_price_range',
      title: 'Price Range Filter',
      message: 'Set minimum and maximum prices to find items within your budget. Leave blank for no limit!',
      placement: 'top' as const,
      icon: '💰',
      dismissLabel: 'Got it',
    },
    fr: {
      id: 'filter_price_range',
      title: 'Filtre de fourchette de prix',
      message: 'Définissez des prix minimum et maximum pour trouver des articles dans votre budget. Laissez vide pour aucune limite !',
      placement: 'top' as const,
      icon: '💰',
      dismissLabel: 'Compris',
    },
  },

  filter_sort_options: {
    en: {
      id: 'filter_sort_options',
      title: 'Sort Options',
      message: 'Sort by newest listings, lowest price, or highest price to find what you need faster!',
      placement: 'top' as const,
      icon: '🔄',
      dismissLabel: 'OK',
    },
    fr: {
      id: 'filter_sort_options',
      title: 'Options de tri',
      message: 'Triez par annonces les plus récentes, prix le plus bas, ou prix le plus élevé pour trouver ce dont vous avez besoin plus rapidement !',
      placement: 'top' as const,
      icon: '🔄',
      dismissLabel: 'OK',
    },
  },

  // Favorites Tooltips
  favorites_explanation: {
    en: {
      id: 'favorites_explanation',
      title: 'Your Favorites',
      message: 'Save items you\'re interested in to easily find them later. You\'ll be notified of price changes!',
      placement: 'center' as const,
      icon: '❤️',
      dismissLabel: 'Got it',
    },
    fr: {
      id: 'favorites_explanation',
      title: 'Vos Favoris',
      message: 'Sauvegardez les articles qui vous intéressent pour les retrouver facilement plus tard. Vous serez notifié des changements de prix !',
      placement: 'center' as const,
      icon: '❤️',
      dismissLabel: 'Compris',
    },
  },

  favorites_empty_state: {
    en: {
      id: 'favorites_empty_state',
      title: 'No Favorites Yet',
      message: 'Tap the heart icon on any listing to save it here. Start building your collection!',
      placement: 'center' as const,
      icon: '💝',
      dismissLabel: 'Got it',
    },
    fr: {
      id: 'favorites_empty_state',
      title: 'Aucun favori pour le moment',
      message: 'Appuyez sur l\'icône cœur sur n\'importe quelle annonce pour la sauvegarder ici. Commencez à créer votre collection !',
      placement: 'center' as const,
      icon: '💝',
      dismissLabel: 'Compris',
    },
  },

  favorites_sold_items: {
    en: {
      id: 'favorites_sold_items',
      title: 'Items Sold',
      message: 'Some saved items are now sold. You may want to remove them and find similar items!',
      placement: 'center' as const,
      icon: '📦',
      dismissLabel: 'Understood',
    },
    fr: {
      id: 'favorites_sold_items',
      title: 'Articles vendus',
      message: 'Certains articles sauvegardés sont maintenant vendus. Vous voudrez peut-être les retirer et trouver des articles similaires !',
      placement: 'center' as const,
      icon: '📦',
      dismissLabel: 'Compris',
    },
  },

  favorites_price_drop: {
    en: {
      id: 'favorites_price_drop',
      title: 'Price Drop Alert! 🎉',
      message: 'Great news! Some of your saved items have reduced prices. Check them out now!',
      placement: 'center' as const,
      icon: '💰',
      dismissLabel: 'View Items',
    },
    fr: {
      id: 'favorites_price_drop',
      title: 'Alerte baisse de prix ! 🎉',
      message: 'Bonne nouvelle ! Certains de vos articles sauvegardés ont des prix réduits. Consultez-les maintenant !',
      placement: 'center' as const,
      icon: '💰',
      dismissLabel: 'Voir les articles',
    },
  },

  // Notifications Tooltips
  notifications_first: {
    en: {
      id: 'notifications_first',
      title: 'Your First Notification!',
      message: 'This is where you\'ll receive updates about your listings, messages, and transactions. Stay informed!',
      placement: 'center' as const,
      icon: '🔔',
      dismissLabel: 'Got it',
    },
    fr: {
      id: 'notifications_first',
      title: 'Votre première notification !',
      message: 'C\'est ici que vous recevrez des mises à jour sur vos annonces, messages et transactions. Restez informé !',
      placement: 'center' as const,
      icon: '🔔',
      dismissLabel: 'Compris',
    },
  },

  notifications_types: {
    en: {
      id: 'notifications_types',
      title: 'Notification Types',
      message: 'You\'ll receive messages, rating requests, and transaction updates. Tap any notification to view details!',
      placement: 'center' as const,
      icon: '📬',
      dismissLabel: 'Understood',
    },
    fr: {
      id: 'notifications_types',
      title: 'Types de notifications',
      message: 'Vous recevrez des messages, des demandes d\'évaluation et des mises à jour de transactions. Appuyez sur n\'importe quelle notification pour voir les détails !',
      placement: 'center' as const,
      icon: '📬',
      dismissLabel: 'Compris',
    },
  },

  notifications_unread_reminder: {
    en: {
      id: 'notifications_unread_reminder',
      title: 'Unread Notifications',
      message: 'You have unread notifications from more than 48 hours ago. Check them to stay updated!',
      placement: 'center' as const,
      icon: '⏰',
      dismissLabel: 'View Now',
    },
    fr: {
      id: 'notifications_unread_reminder',
      title: 'Notifications non lues',
      message: 'Vous avez des notifications non lues datant de plus de 48 heures. Consultez-les pour rester à jour !',
      placement: 'center' as const,
      icon: '⏰',
      dismissLabel: 'Voir maintenant',
    },
  },

  notifications_settings: {
    en: {
      id: 'notifications_settings',
      title: 'Notification Settings',
      message: 'Customize which notifications you receive in Settings. Choose what\'s important to you!',
      placement: 'top' as const,
      icon: '⚙️',
      dismissLabel: 'Got it',
    },
    fr: {
      id: 'notifications_settings',
      title: 'Paramètres de notification',
      message: 'Personnalisez les notifications que vous recevez dans Paramètres. Choisissez ce qui est important pour vous !',
      placement: 'top' as const,
      icon: '⚙️',
      dismissLabel: 'Compris',
    },
  },

  // Posting Tooltips
  post_photos: {
    en: {
      id: 'post_photos',
      title: 'Add Photos',
      message: 'Add at least 3 clear photos. Good photos help sell faster! Show different angles.',
      placement: 'bottom' as const,
      icon: '📸',
      dismissLabel: 'Got it',
    },
    fr: {
      id: 'post_photos',
      title: 'Ajouter des photos',
      message: 'Ajoutez au moins 3 photos claires. De bonnes photos aident à vendre plus vite ! Montrez différents angles.',
      placement: 'bottom' as const,
      icon: '📸',
      dismissLabel: 'Compris',
    },
  },

  post_title: {
    en: {
      id: 'post_title',
      title: 'Write a Clear Title',
      message: 'Include brand, model, and condition. Example: "Samsung Galaxy S21 - Like New"',
      placement: 'bottom' as const,
      icon: '✏️',
      dismissLabel: 'OK',
    },
    fr: {
      id: 'post_title',
      title: 'Écrivez un titre clair',
      message: 'Incluez la marque, le modèle et l\'état. Exemple : "Samsung Galaxy S21 - Comme neuf"',
      placement: 'bottom' as const,
      icon: '✏️',
      dismissLabel: 'OK',
    },
  },

  post_description: {
    en: {
      id: 'post_description',
      title: 'Detailed Description',
      message: 'Describe the condition, features, and any issues. Use our template to make it easy!',
      placement: 'bottom' as const,
      icon: '📝',
      dismissLabel: 'Got it',
    },
    fr: {
      id: 'post_description',
      title: 'Description détaillée',
      message: 'Décrivez l\'état, les caractéristiques et les problèmes. Utilisez notre modèle pour faciliter !',
      placement: 'bottom' as const,
      icon: '📝',
      dismissLabel: 'Compris',
    },
  },

  post_price: {
    en: {
      id: 'post_price',
      title: 'Set Your Price',
      message: 'Check similar items to set a competitive price. You can always adjust it later!',
      placement: 'bottom' as const,
      icon: '💰',
      dismissLabel: 'Got it',
    },
    fr: {
      id: 'post_price',
      title: 'Fixez votre prix',
      message: 'Vérifiez les articles similaires pour fixer un prix compétitif. Vous pouvez toujours l\'ajuster plus tard !',
      placement: 'bottom' as const,
      icon: '💰',
      dismissLabel: 'Compris',
    },
  },

  post_category: {
    en: {
      id: 'post_category',
      title: 'Choose Category',
      message: 'Select the category that best matches your item. This helps buyers find it!',
      placement: 'bottom' as const,
      icon: '🏷️',
      dismissLabel: 'OK',
    },
    fr: {
      id: 'post_category',
      title: 'Choisir la catégorie',
      message: 'Sélectionnez la catégorie qui correspond le mieux à votre article. Cela aide les acheteurs à le trouver !',
      placement: 'bottom' as const,
      icon: '🏷️',
      dismissLabel: 'OK',
    },
  },

  post_location: {
    en: {
      id: 'post_location',
      title: 'Set Your Location',
      message: 'Your city helps buyers find items near them. You can use the location button to auto-detect!',
      placement: 'bottom' as const,
      icon: '📍',
      dismissLabel: 'Got it',
    },
    fr: {
      id: 'post_location',
      title: 'Définir votre localisation',
      message: 'Votre ville aide les acheteurs à trouver des articles près d\'eux. Vous pouvez utiliser le bouton de localisation pour détecter automatiquement !',
      placement: 'bottom' as const,
      icon: '📍',
      dismissLabel: 'Compris',
    },
  },

  post_photo_tips: {
    en: {
      id: 'post_photo_tips',
      title: 'Photo Tips 📸',
      message: 'Take photos in good lighting, show all angles, include close-ups of any defects, and clean the item first!',
      placement: 'top' as const,
      icon: '💡',
      dismissLabel: 'Thanks',
    },
    fr: {
      id: 'post_photo_tips',
      title: 'Conseils photo 📸',
      message: 'Prenez des photos avec un bon éclairage, montrez tous les angles, incluez des gros plans des défauts, et nettoyez l\'article d\'abord !',
      placement: 'top' as const,
      icon: '💡',
      dismissLabel: 'Merci',
    },
  },

  post_validation_missing: {
    en: {
      id: 'post_validation_missing',
      title: 'Missing Information',
      message: 'Please fill in all required fields to publish your listing.',
      placement: 'center' as const,
      icon: '⚠️',
      dismissLabel: 'OK',
    },
    fr: {
      id: 'post_validation_missing',
      title: 'Informations manquantes',
      message: 'Veuillez remplir tous les champs requis pour publier votre annonce.',
      placement: 'center' as const,
      icon: '⚠️',
      dismissLabel: 'OK',
    },
  },
};

// Tour Definitions
const TOURS = {
  landing_tour: {
    en: {
      id: 'landing_tour',
      name: 'Welcome to Marché.cd',
      steps: [
        {
          id: 'landing_step_1',
          title: 'Welcome! 👋',
          message: 'Marché.cd is your marketplace for buying and selling in the DRC. Let\'s show you around!',
          placement: 'center' as const,
          showOverlay: true,
          nextLabel: 'Next',
          skipLabel: 'Skip Tour',
        },
        {
          id: 'landing_step_2',
          title: 'Download the App',
          message: 'For the best experience, download our mobile app. It\'s fast, easy, and works offline!',
          placement: 'top' as const,
          showOverlay: true,
          nextLabel: 'Got it',
        },
      ],
      triggerCondition: {
        type: 'first_visit' as const,
        params: { screen: 'landing' },
      },
    },
    fr: {
      id: 'landing_tour',
      name: 'Bienvenue sur Marché.cd',
      steps: [
        {
          id: 'landing_step_1',
          title: 'Bienvenue ! 👋',
          message: 'Marché.cd est votre marketplace pour acheter et vendre en RDC. Laissez-nous vous faire visiter !',
          placement: 'center' as const,
          showOverlay: true,
          nextLabel: 'Suivant',
          skipLabel: 'Passer la visite',
        },
        {
          id: 'landing_step_2',
          title: 'Téléchargez l\'application',
          message: 'Pour une meilleure expérience, téléchargez notre application mobile. C\'est rapide, facile et fonctionne hors ligne !',
          placement: 'top' as const,
          showOverlay: true,
          nextLabel: 'Compris',
        },
      ],
      triggerCondition: {
        type: 'first_visit' as const,
        params: { screen: 'landing' },
      },
    },
  },

  auth_registration_tour: {
    en: {
      id: 'auth_registration_tour',
      name: 'Registration Guide',
      steps: [
        {
          id: 'auth_reg_step_1',
          title: 'Welcome! 👋',
          message: 'Let\'s create your account. We\'ll guide you through each step to make it easy!',
          placement: 'center' as const,
          showOverlay: true,
          nextLabel: 'Get Started',
          skipLabel: 'Skip Guide',
        },
        {
          id: 'auth_reg_step_2',
          title: 'Your Name',
          message: 'Enter your first and last name. This helps buyers and sellers know who they\'re dealing with.',
          placement: 'top' as const,
          showOverlay: true,
          nextLabel: 'Next',
        },
        {
          id: 'auth_reg_step_3',
          title: 'Phone Number',
          message: 'Your phone number is important for communication. Use format: +243 XXX XXX XXX or start with 0.',
          placement: 'top' as const,
          showOverlay: true,
          nextLabel: 'Next',
        },
        {
          id: 'auth_reg_step_4',
          title: 'Location',
          message: 'Tell us your city so buyers can find items near them. This helps with local transactions!',
          placement: 'top' as const,
          showOverlay: true,
          nextLabel: 'Next',
        },
        {
          id: 'auth_reg_step_5',
          title: 'Secure Password',
          message: 'Create a strong password with at least 6 characters to keep your account safe.',
          placement: 'top' as const,
          showOverlay: true,
          nextLabel: 'Got it!',
        },
      ],
      triggerCondition: {
        type: 'first_visit' as const,
        params: { screen: 'register' },
      },
    },
    fr: {
      id: 'auth_registration_tour',
      name: 'Guide d\'inscription',
      steps: [
        {
          id: 'auth_reg_step_1',
          title: 'Bienvenue ! 👋',
          message: 'Créons votre compte. Nous vous guiderons à chaque étape pour faciliter le processus !',
          placement: 'center' as const,
          showOverlay: true,
          nextLabel: 'Commencer',
          skipLabel: 'Passer le guide',
        },
        {
          id: 'auth_reg_step_2',
          title: 'Votre nom',
          message: 'Entrez votre prénom et nom de famille. Cela aide les acheteurs et vendeurs à savoir avec qui ils traitent.',
          placement: 'top' as const,
          showOverlay: true,
          nextLabel: 'Suivant',
        },
        {
          id: 'auth_reg_step_3',
          title: 'Numéro de téléphone',
          message: 'Votre numéro de téléphone est important pour la communication. Format : +243 XXX XXX XXX ou commencez par 0.',
          placement: 'top' as const,
          showOverlay: true,
          nextLabel: 'Suivant',
        },
        {
          id: 'auth_reg_step_4',
          title: 'Localisation',
          message: 'Indiquez votre ville pour que les acheteurs trouvent des articles près d\'eux. Cela facilite les transactions locales !',
          placement: 'top' as const,
          showOverlay: true,
          nextLabel: 'Suivant',
        },
        {
          id: 'auth_reg_step_5',
          title: 'Mot de passe sécurisé',
          message: 'Créez un mot de passe fort avec au moins 6 caractères pour protéger votre compte.',
          placement: 'top' as const,
          showOverlay: true,
          nextLabel: 'Compris !',
        },
      ],
      triggerCondition: {
        type: 'first_visit' as const,
        params: { screen: 'register' },
      },
    },
  },

  auth_complete_profile_tour: {
    en: {
      id: 'auth_complete_profile_tour',
      name: 'Complete Your Profile',
      steps: [
        {
          id: 'auth_profile_step_1',
          title: 'Almost There! 🎉',
          message: 'Great job! Now let\'s complete your profile so you can start buying and selling.',
          placement: 'center' as const,
          showOverlay: true,
          nextLabel: 'Continue',
          skipLabel: 'Skip',
        },
        {
          id: 'auth_profile_step_2',
          title: 'WhatsApp Number',
          message: 'Add your WhatsApp number so buyers can easily reach you. This is important for quick communication!',
          placement: 'top' as const,
          showOverlay: true,
          nextLabel: 'Next',
        },
        {
          id: 'auth_profile_step_3',
          title: 'Your City',
          message: 'Confirm your city location. This helps show your listings to nearby buyers.',
          placement: 'top' as const,
          showOverlay: true,
          nextLabel: 'Finish',
        },
      ],
      triggerCondition: {
        type: 'first_visit' as const,
        params: { screen: 'complete_profile' },
      },
    },
    fr: {
      id: 'auth_complete_profile_tour',
      name: 'Complétez votre profil',
      steps: [
        {
          id: 'auth_profile_step_1',
          title: 'Presque terminé ! 🎉',
          message: 'Excellent travail ! Maintenant, complétons votre profil pour que vous puissiez commencer à acheter et vendre.',
          placement: 'center' as const,
          showOverlay: true,
          nextLabel: 'Continuer',
          skipLabel: 'Passer',
        },
        {
          id: 'auth_profile_step_2',
          title: 'Numéro WhatsApp',
          message: 'Ajoutez votre numéro WhatsApp pour que les acheteurs puissent vous joindre facilement. C\'est important pour une communication rapide !',
          placement: 'top' as const,
          showOverlay: true,
          nextLabel: 'Suivant',
        },
        {
          id: 'auth_profile_step_3',
          title: 'Votre ville',
          message: 'Confirmez votre ville. Cela aide à montrer vos annonces aux acheteurs à proximité.',
          placement: 'top' as const,
          showOverlay: true,
          nextLabel: 'Terminer',
        },
      ],
      triggerCondition: {
        type: 'first_visit' as const,
        params: { screen: 'complete_profile' },
      },
    },
  },

  home_tour: {
    en: {
      id: 'home_tour',
      name: 'Home Screen Tour',
      steps: [
        {
          id: 'home_step_1',
          title: 'Welcome Home! 🏠',
          message: 'This is where you\'ll find all available items. Let\'s explore the main features!',
          placement: 'center' as const,
          showOverlay: true,
          nextLabel: 'Show me',
          skipLabel: 'Skip',
        },
        {
          id: 'home_step_2',
          title: 'Search Bar',
          message: 'Search for anything you need - electronics, furniture, clothes, and more!',
          placement: 'bottom' as const,
          showOverlay: true,
          nextLabel: 'Next',
        },
        {
          id: 'home_step_3',
          title: 'Location Filter',
          message: 'See items near you! Tap here to set your location and search radius.',
          placement: 'bottom' as const,
          showOverlay: true,
          nextLabel: 'Next',
        },
        {
          id: 'home_step_4',
          title: 'Browse Listings',
          message: 'Tap any item to see details, photos, and contact the seller. Happy shopping!',
          placement: 'center' as const,
          showOverlay: true,
          nextLabel: 'Start Browsing',
        },
      ],
      triggerCondition: {
        type: 'first_visit' as const,
        params: { screen: 'home' },
      },
    },
    fr: {
      id: 'home_tour',
      name: 'Visite de l\'écran d\'accueil',
      steps: [
        {
          id: 'home_step_1',
          title: 'Bienvenue ! 🏠',
          message: 'C\'est ici que vous trouverez tous les articles disponibles. Explorons les fonctionnalités principales !',
          placement: 'center' as const,
          showOverlay: true,
          nextLabel: 'Montrez-moi',
          skipLabel: 'Passer',
        },
        {
          id: 'home_step_2',
          title: 'Barre de recherche',
          message: 'Recherchez tout ce dont vous avez besoin - électronique, meubles, vêtements, et plus encore !',
          placement: 'bottom' as const,
          showOverlay: true,
          nextLabel: 'Suivant',
        },
        {
          id: 'home_step_3',
          title: 'Filtre de localisation',
          message: 'Voyez les articles près de vous ! Appuyez ici pour définir votre position et le rayon de recherche.',
          placement: 'bottom' as const,
          showOverlay: true,
          nextLabel: 'Suivant',
        },
        {
          id: 'home_step_4',
          title: 'Parcourir les annonces',
          message: 'Appuyez sur n\'importe quel article pour voir les détails, photos et contacter le vendeur. Bon shopping !',
          placement: 'center' as const,
          showOverlay: true,
          nextLabel: 'Commencer',
        },
      ],
      triggerCondition: {
        type: 'first_visit' as const,
        params: { screen: 'home' },
      },
    },
  },

  post_overview_tour: {
    en: {
      id: 'post_overview_tour',
      name: 'Create Your Listing',
      steps: [
        {
          id: 'post_step_1',
          title: 'Welcome to Posting! 🚀',
          message: 'Let\'s create your listing! We\'ll guide you through each step to make it easy.',
          placement: 'center' as const,
          showOverlay: true,
          nextLabel: 'Get Started',
          skipLabel: 'Skip Guide',
        },
      ],
      triggerCondition: {
        type: 'first_visit' as const,
        params: { screen: 'post' },
      },
    },
    fr: {
      id: 'post_overview_tour',
      name: 'Créer votre annonce',
      steps: [
        {
          id: 'post_step_1',
          title: 'Bienvenue dans la publication ! 🚀',
          message: 'Créons votre annonce ! Nous vous guiderons à chaque étape pour faciliter le processus.',
          placement: 'center' as const,
          showOverlay: true,
          nextLabel: 'Commencer',
          skipLabel: 'Passer le guide',
        },
      ],
      triggerCondition: {
        type: 'first_visit' as const,
        params: { screen: 'post' },
      },
    },
  },

  filter_panel_tour: {
    en: {
      id: 'filter_panel_tour',
      name: 'Filter Panel Tour',
      steps: [
        {
          id: 'filter_step_1',
          title: 'Search Filters 🎯',
          message: 'Use these filters to refine your search and find exactly what you\'re looking for!',
          placement: 'center' as const,
          showOverlay: true,
          nextLabel: 'Show me',
          skipLabel: 'Skip',
        },
        {
          id: 'filter_step_2',
          title: 'Price Range',
          message: 'Set a minimum and maximum price to see only items within your budget.',
          placement: 'top' as const,
          showOverlay: true,
          nextLabel: 'Next',
        },
        {
          id: 'filter_step_3',
          title: 'Sort Results',
          message: 'Sort by price (low/high) or by date to see the newest listings first.',
          placement: 'top' as const,
          showOverlay: true,
          nextLabel: 'Got it',
        },
      ],
      triggerCondition: {
        type: 'first_visit' as const,
        params: { screen: 'filter_panel' },
      },
    },
    fr: {
      id: 'filter_panel_tour',
      name: 'Visite du panneau de filtres',
      steps: [
        {
          id: 'filter_step_1',
          title: 'Filtres de recherche 🎯',
          message: 'Utilisez ces filtres pour affiner votre recherche et trouver exactement ce que vous cherchez !',
          placement: 'center' as const,
          showOverlay: true,
          nextLabel: 'Montrez-moi',
          skipLabel: 'Passer',
        },
        {
          id: 'filter_step_2',
          title: 'Fourchette de prix',
          message: 'Définissez un prix minimum et maximum pour voir uniquement les articles dans votre budget.',
          placement: 'top' as const,
          showOverlay: true,
          nextLabel: 'Suivant',
        },
        {
          id: 'filter_step_3',
          title: 'Trier les résultats',
          message: 'Triez par prix (croissant/décroissant) ou par date pour voir les annonces les plus récentes.',
          placement: 'top' as const,
          showOverlay: true,
          nextLabel: 'Compris',
        },
      ],
      triggerCondition: {
        type: 'first_visit' as const,
        params: { screen: 'filter_panel' },
      },
    },
  },

  notifications_types_tour: {
    en: {
      id: 'notifications_types_tour',
      name: 'Notification Types Tour',
      steps: [
        {
          id: 'notif_step_1',
          title: 'Welcome to Notifications! 🔔',
          message: 'This is your notification center. Let\'s explore the different types of notifications you\'ll receive!',
          placement: 'center' as const,
          showOverlay: true,
          nextLabel: 'Show me',
          skipLabel: 'Skip',
        },
        {
          id: 'notif_step_2',
          title: 'Message Notifications',
          message: 'You\'ll be notified when someone sends you a message about your listings or responds to your inquiries.',
          placement: 'center' as const,
          showOverlay: true,
          nextLabel: 'Next',
        },
        {
          id: 'notif_step_3',
          title: 'Rating Requests ⭐',
          message: 'After completing a transaction, you\'ll receive a request to rate the other person. This helps build trust!',
          placement: 'center' as const,
          showOverlay: true,
          nextLabel: 'Next',
        },
        {
          id: 'notif_step_4',
          title: 'Transaction Updates',
          message: 'Get notified about important updates like when items are marked as sold or when prices change.',
          placement: 'center' as const,
          showOverlay: true,
          nextLabel: 'Got it',
        },
      ],
      triggerCondition: {
        type: 'first_visit' as const,
        params: { screen: 'notifications' },
      },
    },
    fr: {
      id: 'notifications_types_tour',
      name: 'Visite des types de notifications',
      steps: [
        {
          id: 'notif_step_1',
          title: 'Bienvenue dans les Notifications ! 🔔',
          message: 'Ceci est votre centre de notifications. Explorons les différents types de notifications que vous recevrez !',
          placement: 'center' as const,
          showOverlay: true,
          nextLabel: 'Montrez-moi',
          skipLabel: 'Passer',
        },
        {
          id: 'notif_step_2',
          title: 'Notifications de messages',
          message: 'Vous serez notifié quand quelqu\'un vous envoie un message concernant vos annonces ou répond à vos demandes.',
          placement: 'center' as const,
          showOverlay: true,
          nextLabel: 'Suivant',
        },
        {
          id: 'notif_step_3',
          title: 'Demandes d\'évaluation ⭐',
          message: 'Après avoir complété une transaction, vous recevrez une demande pour évaluer l\'autre personne. Cela aide à établir la confiance !',
          placement: 'center' as const,
          showOverlay: true,
          nextLabel: 'Suivant',
        },
        {
          id: 'notif_step_4',
          title: 'Mises à jour de transactions',
          message: 'Soyez notifié des mises à jour importantes comme quand des articles sont marqués comme vendus ou quand les prix changent.',
          placement: 'center' as const,
          showOverlay: true,
          nextLabel: 'Compris',
        },
      ],
      triggerCondition: {
        type: 'first_visit' as const,
        params: { screen: 'notifications' },
      },
    },
  },
};

// Message Template Definitions
const MESSAGE_TEMPLATES = {
  inquiry: {
    en: [
      {
        id: 'template_available',
        category: 'inquiry' as const,
        text: 'Hello! Is this item still available?',
      },
      {
        id: 'template_condition',
        category: 'inquiry' as const,
        text: 'Hi! Can you tell me more about the condition of this item?',
      },
      {
        id: 'template_details',
        category: 'inquiry' as const,
        text: 'Hello! I\'m interested in {{item_name}}. Can you provide more details?',
        variables: ['item_name'],
      },
    ],
    fr: [
      {
        id: 'template_available',
        category: 'inquiry' as const,
        text: 'Bonjour ! Cet article est-il toujours disponible ?',
      },
      {
        id: 'template_condition',
        category: 'inquiry' as const,
        text: 'Bonjour ! Pouvez-vous m\'en dire plus sur l\'état de cet article ?',
      },
      {
        id: 'template_details',
        category: 'inquiry' as const,
        text: 'Bonjour ! Je suis intéressé(e) par {{item_name}}. Pouvez-vous fournir plus de détails ?',
        variables: ['item_name'],
      },
    ],
  },

  negotiation: {
    en: [
      {
        id: 'template_best_price',
        category: 'negotiation' as const,
        text: 'What is your best price for this item?',
      },
      {
        id: 'template_offer',
        category: 'negotiation' as const,
        text: 'Would you accept {{offer_price}} for this item?',
        variables: ['offer_price'],
      },
      {
        id: 'template_bundle',
        category: 'negotiation' as const,
        text: 'I\'m interested in buying multiple items. Can we discuss a bundle price?',
      },
    ],
    fr: [
      {
        id: 'template_best_price',
        category: 'negotiation' as const,
        text: 'Quel est votre meilleur prix pour cet article ?',
      },
      {
        id: 'template_offer',
        category: 'negotiation' as const,
        text: 'Accepteriez-vous {{offer_price}} pour cet article ?',
        variables: ['offer_price'],
      },
      {
        id: 'template_bundle',
        category: 'negotiation' as const,
        text: 'Je suis intéressé(e) par l\'achat de plusieurs articles. Pouvons-nous discuter d\'un prix groupé ?',
      },
    ],
  },

  meeting: {
    en: [
      {
        id: 'template_meet_public',
        category: 'meeting' as const,
        text: 'Can we meet at a public place? I suggest {{location}} at {{time}}.',
        variables: ['location', 'time'],
      },
      {
        id: 'template_when_meet',
        category: 'meeting' as const,
        text: 'When would be a good time for us to meet?',
      },
      {
        id: 'template_confirm_meeting',
        category: 'meeting' as const,
        text: 'Great! I confirm our meeting at {{location}} on {{date}} at {{time}}.',
        variables: ['location', 'date', 'time'],
      },
    ],
    fr: [
      {
        id: 'template_meet_public',
        category: 'meeting' as const,
        text: 'Pouvons-nous nous rencontrer dans un lieu public ? Je suggère {{location}} à {{time}}.',
        variables: ['location', 'time'],
      },
      {
        id: 'template_when_meet',
        category: 'meeting' as const,
        text: 'Quand serait un bon moment pour nous rencontrer ?',
      },
      {
        id: 'template_confirm_meeting',
        category: 'meeting' as const,
        text: 'Parfait ! Je confirme notre rendez-vous à {{location}} le {{date}} à {{time}}.',
        variables: ['location', 'date', 'time'],
      },
    ],
  },

  thanks: {
    en: [
      {
        id: 'template_thanks',
        category: 'thanks' as const,
        text: 'Thank you for the quick response!',
      },
      {
        id: 'template_thanks_deal',
        category: 'thanks' as const,
        text: 'Thank you! Looking forward to completing this transaction.',
      },
      {
        id: 'template_thanks_info',
        category: 'thanks' as const,
        text: 'Thanks for the information. I\'ll think about it and get back to you.',
      },
    ],
    fr: [
      {
        id: 'template_thanks',
        category: 'thanks' as const,
        text: 'Merci pour la réponse rapide !',
      },
      {
        id: 'template_thanks_deal',
        category: 'thanks' as const,
        text: 'Merci ! J\'ai hâte de finaliser cette transaction.',
      },
      {
        id: 'template_thanks_info',
        category: 'thanks' as const,
        text: 'Merci pour l\'information. Je vais y réfléchir et vous recontacter.',
      },
    ],
  },
};

// Safety Tips Definitions
const SAFETY_TIPS = {
  chat: {
    en: [
      'Always meet in a public place during daylight hours.',
      'Never share your bank account or payment card details.',
      'Inspect items carefully before making payment.',
      'Trust your instincts - if something feels wrong, walk away.',
    ],
    fr: [
      'Rencontrez toujours dans un lieu public pendant la journée.',
      'Ne partagez jamais vos coordonnées bancaires ou de carte de paiement.',
      'Inspectez soigneusement les articles avant de payer.',
      'Faites confiance à votre instinct - si quelque chose ne va pas, partez.',
    ],
  },
  meeting: {
    en: [
      'Choose busy, well-lit public locations for meetings.',
      'Bring a friend or family member if possible.',
      'Tell someone where you\'re going and when you\'ll return.',
      'Keep your phone charged and accessible.',
    ],
    fr: [
      'Choisissez des lieux publics fréquentés et bien éclairés pour les rencontres.',
      'Amenez un ami ou un membre de la famille si possible.',
      'Dites à quelqu\'un où vous allez et quand vous reviendrez.',
      'Gardez votre téléphone chargé et accessible.',
    ],
  },
  payment: {
    en: [
      'Use secure payment methods when possible.',
      'Never send money before seeing the item in person.',
      'Get a receipt for all transactions.',
      'Be cautious of deals that seem too good to be true.',
    ],
    fr: [
      'Utilisez des méthodes de paiement sécurisées lorsque possible.',
      'N\'envoyez jamais d\'argent avant d\'avoir vu l\'article en personne.',
      'Obtenez un reçu pour toutes les transactions.',
      'Méfiez-vous des offres qui semblent trop belles pour être vraies.',
    ],
  },
};

// ============================================================================
// GUIDANCE CONTENT SERVICE
// ============================================================================

export class GuidanceContentService {
  /**
   * Get tooltip content by ID and language
   */
  static getTooltip(id: string, language: 'en' | 'fr'): TooltipContent | null {
    const tooltip = TOOLTIPS[id as keyof typeof TOOLTIPS];
    if (!tooltip) return null;
    return tooltip[language];
  }

  /**
   * Get tour by ID and language
   */
  static getTour(id: string, language: 'en' | 'fr'): Tour | null {
    const tour = TOURS[id as keyof typeof TOURS];
    if (!tour) return null;
    return tour[language];
  }

  /**
   * Get message templates by category and language
   */
  static getMessageTemplates(
    category: 'inquiry' | 'negotiation' | 'meeting' | 'thanks',
    language: 'en' | 'fr'
  ): MessageTemplate[] {
    const templates = MESSAGE_TEMPLATES[category];
    if (!templates) return [];
    return templates[language];
  }

  /**
   * Get all message templates for a context (returns all categories)
   */
  static getAllMessageTemplates(language: 'en' | 'fr'): MessageTemplate[] {
    const allTemplates: MessageTemplate[] = [];
    
    Object.keys(MESSAGE_TEMPLATES).forEach((category) => {
      const categoryTemplates = MESSAGE_TEMPLATES[category as keyof typeof MESSAGE_TEMPLATES];
      allTemplates.push(...categoryTemplates[language]);
    });
    
    return allTemplates;
  }

  /**
   * Get safety tips by context and language
   */
  static getSafetyTip(
    context: 'chat' | 'meeting' | 'payment',
    language: 'en' | 'fr'
  ): string {
    const tips = SAFETY_TIPS[context];
    if (!tips) return '';
    
    const contextTips = tips[language];
    // Return a random tip from the context
    return contextTips[Math.floor(Math.random() * contextTips.length)];
  }

  /**
   * Get all safety tips for a context
   */
  static getAllSafetyTips(
    context: 'chat' | 'meeting' | 'payment',
    language: 'en' | 'fr'
  ): string[] {
    const tips = SAFETY_TIPS[context];
    if (!tips) return [];
    return tips[language];
  }

  /**
   * Substitute variables in a message template
   */
  static substituteVariables(
    template: string,
    variables: Record<string, string>
  ): string {
    let result = template;
    
    Object.keys(variables).forEach((key) => {
      const placeholder = `{{${key}}}`;
      result = result.replace(new RegExp(placeholder, 'g'), variables[key]);
    });
    
    return result;
  }

  /**
   * Check if a template has unsubstituted variables
   */
  static hasUnsubstitutedVariables(text: string): boolean {
    return /\{\{[^}]+\}\}/.test(text);
  }

  /**
   * Get contextual prompt based on screen and user state
   */
  static generateContextualPrompt(
    screen: string,
    userState: any,
    language: 'en' | 'fr'
  ): string | null {
    // This can be expanded with more sophisticated logic
    // For now, return null (will be implemented in trigger engine)
    return null;
  }

  /**
   * Get quick actions for a screen
   */
  static getQuickActions(
    screen: string,
    context: any,
    language: 'en' | 'fr'
  ): QuickAction[] {
    // Quick actions will be defined based on screen context
    // This is a placeholder that will be expanded
    return [];
  }

  /**
   * Get all available tooltip IDs
   */
  static getAllTooltipIds(): string[] {
    return Object.keys(TOOLTIPS);
  }

  /**
   * Get all available tour IDs
   */
  static getAllTourIds(): string[] {
    return Object.keys(TOURS);
  }
}

export default GuidanceContentService;
