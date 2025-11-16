import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'el' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  el: {
    // Navigation
    signIn: 'Σύνδεση',
    getStarted: 'Ξεκινήστε',
    
    // Hero Section
    heroTagline: 'Μαζί, οι μαμάδες ανθίζουν!',
    heroDescription: 'Συνδεθείτε με υπέροχες μαμάδες στην περιοχή σας. Μοιραστείτε εμπειρίες, οργανώστε playdates και χτίστε διαρκείς φιλίες σε μια υποστηρικτική κοινότητα.',
    joinMomster: 'Γίνετε μέλος',
    learnMore: 'Μάθετε περισσότερα',
    
    // Features
    featuresTitle: 'Όλα όσα χρειάζεστε για να συνδεθείτε',
    featuresSubtitle: 'Το Momster συγκεντρώνει όλα τα εργαλεία που χρειάζεστε για να χτίσετε ουσιαστικές σχέσεις με άλλες μαμάδες στην κοινότητά σας.',
    
    connectLocalMoms: 'Συνδεθείτε με τοπικές μαμάδες',
    connectLocalMomsDesc: 'Βρείτε και ταιριάξτε με μητέρες στην περιοχή σας που μοιράζονται παρόμοια ταξίδια και ενδιαφέροντα στη γονεϊκότητα.',
    
    secureMessaging: 'Ασφαλής Ανταλλαγή Μηνυμάτων',
    secureMessagingDesc: 'Συνομιλήστε με ασφάλεια με άλλες μαμάδες για να οργανώσετε playdates, να μοιραστείτε συμβουλές ή απλά να κάνετε μια φιλική συζήτηση.',
    
    marketplace: 'Marketplace',
    marketplaceDesc: 'Ανταλλάξτε, πουλήστε ή δωρίστε παιδικά αντικείμενα με αξιόπιστες μαμάδες στην τοπική σας περιοχή. Βρείτε επίσης υπηρεσίες όπως babysitting, παιδικά πάρτυ και φωτογραφίες.',
    
    askMoms: 'Ρώτα μια μαμά - Φόρουμ Συζητήσεων',
    askMomsDesc: 'Κάντε ερωτήσεις, μοιραστείτε εμπειρίες και λάβετε υποστήριξη στην κοινότητά μας χωρίς κριτική. Μόνο αγάπη 💕',
    
    locationMatching: 'Ταίριασμα με βάση την Τοποθεσία',
    locationMatchingDesc: 'Έξυπνο σύστημα ταιριάσματος που βρίσκει μαμάδες κοντά σας με παιδιά παρόμοιων ηλικιών και κοινά ενδιαφέροντα.',
    
    // CTA Section
    ctaTitle: 'Είστε έτοιμη να συνδεθείτε;',
    ctaSubtitle: 'Γίνετε μέλος σε χιλιάδες μαμάδες που χτίζουν υποστηρικτικές φιλίες και μοιράζονται το ταξίδι της μητρότητας μαζί.',
    
    // Footer
    footerCopyright: '© 2024 Momster. Με αγάπη για κάθε μαμά.',
    privacyTerms: 'Απόρρητο & Όροι',
  },
  en: {
    // Navigation
    signIn: 'Sign In',
    getStarted: 'Get Started',
    
    // Hero Section
    heroTagline: 'Together, moms thrive!',
    heroDescription: 'Connect with amazing moms in your area. Share experiences, plan playdates, and build lasting friendships in a supportive community.',
    joinMomster: 'Join Momster',
    learnMore: 'Learn More',
    
    // Features
    featuresTitle: 'Everything You Need to Connect',
    featuresSubtitle: 'Momster brings together all the tools you need to build meaningful connections with other moms in your community.',
    
    connectLocalMoms: 'Connect with Local Moms',
    connectLocalMomsDesc: 'Find and match with mothers in your area who share similar parenting journeys and interests.',
    
    secureMessaging: 'Secure Messaging',
    secureMessagingDesc: 'Chat safely with other moms to plan playdates, share advice, or just have a friendly conversation.',
    
    marketplace: 'Marketplace',
    marketplaceDesc: 'Exchange, sell, or donate kids\' items with trusted moms in your local area. Also find services like babysitting, kids parties, and photography.',
    
    askMoms: 'Ask a Mom - Discussion Forums',
    askMomsDesc: 'Ask questions, share experiences and get support in our judgment-free community. No criticism, only love 💕',
    
    locationMatching: 'Location-Based Matching',
    locationMatchingDesc: 'Smart matching system finds moms nearby with kids of similar ages and shared interests.',
    
    // CTA Section
    ctaTitle: 'Ready to Connect?',
    ctaSubtitle: 'Join thousands of moms building supportive friendships and sharing the journey of motherhood together.',
    
    // Footer
    footerCopyright: '© 2024 Momster. Made with love for every mom.',
    privacyTerms: 'Privacy & Terms',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('el');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.el] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
