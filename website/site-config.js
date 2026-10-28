/**
 * Brownie Water Tracker - Centralized Site Configuration
 * Single source of truth for repository, release, legal, and store settings.
 */
window.SITE_CONFIG = {
  appName: "Brownie Water Tracker",
  tagline: "Hydration feels better with a friend.",
  description: "A friendly, playful hydration tracker starring Brownie the Zen Capybara and collectible animal friends. Log water, track progress, build lasting wellness habits, and enjoy the pool party.",
  
  // Production URL
  canonicalDomain: "https://watertrackerbrownie.vercel.app",
  
  // GitHub Repository & Release Configuration
  repoOwner: "mrAbhimanyuVishwakarma",
  repoName: "Water-Tracker",
  repoUrl: "https://github.com/mrAbhimanyuVishwakarma/Water-Tracker",
  releasesPageUrl: "https://github.com/mrAbhimanyuVishwakarma/Water-Tracker/releases/latest",
  releasesApiUrl: "https://api.github.com/repos/mrAbhimanyuVishwakarma/Water-Tracker/releases/latest",
  issuesUrl: "https://github.com/mrAbhimanyuVishwakarma/Water-Tracker/issues",
  
  // App Store & Distribution Configuration
  // Keep empty until an official Google Play listing is approved and published
  playStoreUrl: "",
  
  // Support & Contact
  // Replace with a real monitored support email when available
  supportEmail: "REPLACE_WITH_SUPPORT_EMAIL",
  
  // Legal Configuration & Disclosures
  developerName: "mrAbhimanyuVishwakarma",
  effectiveDate: "October 28, 2026",
  lastUpdatedDate: "October 28, 2026",
  
  // App Details
  packageId: "com.brownie.watertracker",
  appVersion: "1.0.0",
  targetAndroid: "Android 8.0 (API 26) or higher",
  supportedArchitectures: "ARM64 (v8a) & x86_64",
  
  // Interactive Demo Defaults
  demoGoalMl: 2500,
  
  // Beverages supported in app with exact hydration multipliers
  beverages: [
    { id: "water", name: "Water", factor: 1.0, color: "#00C3E3", defaultAmount: 250, icon: "💧" },
    { id: "green_tea", name: "Green Tea", factor: 0.95, color: "#76C62C", defaultAmount: 300, icon: "🍵" },
    { id: "herbal_tea", name: "Herbal Tea", factor: 0.95, color: "#14B8A6", defaultAmount: 300, icon: "🫖" },
    { id: "coffee", name: "Coffee", factor: 0.80, color: "#8A5844", defaultAmount: 200, icon: "☕" },
    { id: "espresso", name: "Espresso", factor: 0.75, color: "#5C3828", defaultAmount: 60, icon: "⚡" },
    { id: "juice", name: "Juice", factor: 0.85, color: "#FFA100", defaultAmount: 250, icon: "🧃" },
    { id: "smoothie", name: "Smoothie", factor: 0.90, color: "#B044CB", defaultAmount: 350, icon: "🥤" },
    { id: "milk", name: "Milk", factor: 0.90, color: "#F48E77", defaultAmount: 250, icon: "🥛" },
    { id: "electrolyte", name: "Electrolyte", factor: 1.0, color: "#38BDF8", defaultAmount: 500, icon: "⚡" },
    { id: "soda", name: "Soda", factor: 0.70, color: "#EF4444", defaultAmount: 330, icon: "🫧" },
    { id: "alcohol", name: "Alcohol", factor: -0.50, color: "#A855F7", defaultAmount: 250, icon: "🍷" }
  ],

  // Mascots verified from mobile app source
  mascots: [
    {
      id: "brownie",
      name: "Brownie",
      species: "Capybara",
      title: "The Zen Hydrator",
      quote: "Stay cool, calm, and sip gently like a pool day.",
      badge: "🦫",
      color: "#8A5844",
      isPro: false,
      image: "assets/brownie_sipping.png",
      floatImage: "assets/capybara_donut_float.png"
    },
    {
      id: "dodo",
      name: "Dotti",
      species: "Dodo Bird",
      title: "Extinct Legend",
      quote: "Extinct in the wild, but thriving in hydration!",
      badge: "🦤",
      color: "#8B5CF6",
      isPro: true,
      image: "assets/dodo_sipping.png",
      floatImage: "assets/dodo_donut_float.png"
    },
    {
      id: "mammoth",
      name: "Manny",
      species: "Woolly Mammoth",
      title: "Ice Age Titan",
      quote: "Big trunk, giant hydration goals! Keep sipping.",
      badge: "🦣",
      color: "#D97706",
      isPro: true,
      image: "assets/mammoth_sipping.png",
      floatImage: "assets/mammoth_donut_float.png"
    },
    {
      id: "sloth",
      name: "Sid",
      species: "Sloth",
      title: "Mindful Sipper",
      quote: "Take your time. Slow sips build lasting habits.",
      badge: "🦥",
      color: "#10B981",
      isPro: true,
      image: "assets/sloth_sipping.png",
      floatImage: "assets/sloth_donut_float.png"
    },
    {
      id: "turtle",
      name: "Turbo",
      species: "Turtle",
      title: "Endurance Legend",
      quote: "Slow and steady wins the hydration streak.",
      badge: "🐢",
      color: "#14B8A6",
      isPro: true,
      image: "assets/turtle_sipping.png",
      floatImage: "assets/turtle_donut_float.png"
    },
    {
      id: "penguin",
      name: "Pip",
      species: "Penguin",
      title: "Ice Fresh Voyager",
      quote: "Crisp cold water makes every wave effortless!",
      badge: "🐧",
      color: "#3B82F6",
      isPro: true,
      image: "assets/penguin_sipping.png",
      floatImage: "assets/penguin_donut_float.png"
    }
  ]
};
