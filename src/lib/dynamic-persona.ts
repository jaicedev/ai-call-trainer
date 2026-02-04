import { GeminiVoice } from "@/hooks/use-gemini-live";

// Gender type for persona generation
export type PersonaGender = "male" | "female";

// Voice metadata with gender and tonal characteristics from Gemini API
export const VOICE_METADATA: Record<GeminiVoice, { gender: PersonaGender; tone: string }> = {
  // Female voices
  Achernar: { gender: "female", tone: "Soft, Gentle" },
  Aoede: { gender: "female", tone: "Breezy, Light" },
  Autonoe: { gender: "female", tone: "Bright, Cheerful" },
  Callirrhoe: { gender: "female", tone: "Easy-going, Relaxed" },
  Despina: { gender: "female", tone: "Smooth, Warm, Inviting" },
  Erinome: { gender: "female", tone: "Clear, Crisp" },
  Gacrux: { gender: "female", tone: "Mature, Knowledgeable" },
  Kore: { gender: "female", tone: "Firm, Professional, Neutral" },
  Laomedeia: { gender: "female", tone: "Upbeat, Positive" },
  Leda: { gender: "female", tone: "Youthful, Fresh" },
  Pulcherrima: { gender: "female", tone: "Forward, Bright, Energetic" },
  Sulafat: { gender: "female", tone: "Warm, Persuasive" },
  Vindemiatrix: { gender: "female", tone: "Gentle, Calm, Thoughtful" },
  Zephyr: { gender: "female", tone: "Bright, Perky, Enthusiastic" },
  // Male voices
  Achird: { gender: "male", tone: "Friendly, Approachable" },
  Algenib: { gender: "male", tone: "Gravelly, Textured" },
  Algieba: { gender: "male", tone: "Smooth, Polished" },
  Alnilam: { gender: "male", tone: "Firm, Grounded" },
  Charon: { gender: "male", tone: "Deep, Authoritative, Informative" },
  Enceladus: { gender: "male", tone: "Breathy, Soft" },
  Fenrir: { gender: "male", tone: "Excitable, Energetic, Warm" },
  Iapetus: { gender: "male", tone: "Clear, Direct" },
  Orbit: { gender: "male", tone: "Energetic, Deep" },
  Orus: { gender: "male", tone: "Firm, Confident" },
  Puck: { gender: "male", tone: "Upbeat, Casual" },
  Rasalgethi: { gender: "male", tone: "Informative, Educational" },
  Sadachbia: { gender: "male", tone: "Lively, Dynamic" },
  Sadaltager: { gender: "male", tone: "Knowledgeable, Assured" },
  Schedar: { gender: "male", tone: "Even, Balanced" },
  Zubenelgenubi: { gender: "male", tone: "Casual, Relaxed" },
};

// Helper to get voices by gender
export const MALE_VOICES = Object.entries(VOICE_METADATA)
  .filter(([, meta]) => meta.gender === "male")
  .map(([voice]) => voice as GeminiVoice);

export const FEMALE_VOICES = Object.entries(VOICE_METADATA)
  .filter(([, meta]) => meta.gender === "female")
  .map(([voice]) => voice as GeminiVoice);

// Personality trait types
export interface PersonalityTraits {
  openness: "low" | "medium" | "high";
  friendliness: "cold" | "neutral" | "warm";
  decisiveness: "indecisive" | "cautious" | "decisive";
  skepticism: "trusting" | "neutral" | "skeptical";
  patience: "impatient" | "moderate" | "patient";
  communication: "brief" | "balanced" | "talkative";
}

// Business context types
export interface BusinessContext {
  businessType: string;
  businessSize: "small" | "medium" | "large";
  fundingNeed: string;
  urgency: "low" | "medium" | "high";
  previousExperience: "none" | "some" | "extensive";
}

// Mock business details for CRM-like simulation
export interface MockBusinessDetails {
  businessName: string;
  state: string;
  industry: string;
  phone: string;
  email: string;
}

// Generated persona
export interface DynamicPersona {
  id: string;
  name: string;
  voice: GeminiVoice;
  traits: PersonalityTraits;
  businessContext: BusinessContext;
  mockBusiness: MockBusinessDetails;
  personality_prompt: string;
  difficulty_level: 1 | 2 | 3 | 4 | 5;
  description: string;
}

// Name pools by gender for realistic voice matching
const MALE_FIRST_NAMES = [
  "Michael", "David", "Robert", "James", "William", "Richard", "Thomas", "Charles",
  "Joseph", "Daniel", "Matthew", "Anthony", "Mark", "Donald", "Steven", "Paul",
  "Andrew", "Joshua", "Kenneth", "Kevin", "Brian", "George", "Timothy", "Ronald",
  "Edward", "Jason", "Jeffrey", "Ryan", "Jacob", "Gary", "Nicholas", "Eric",
  "Jonathan", "Stephen", "Larry", "Justin", "Scott", "Brandon", "Benjamin", "Samuel"
];

const FEMALE_FIRST_NAMES = [
  "Sarah", "Emily", "Jennifer", "Lisa", "Elizabeth", "Susan", "Margaret", "Patricia",
  "Jessica", "Nancy", "Karen", "Betty", "Helen", "Sandra", "Donna", "Carol",
  "Ruth", "Sharon", "Michelle", "Laura", "Kimberly", "Deborah", "Dorothy", "Linda",
  "Amanda", "Melissa", "Stephanie", "Rebecca", "Sharon", "Cynthia", "Angela", "Nicole",
  "Rachel", "Kathleen", "Christine", "Janet", "Catherine", "Diane", "Samantha", "Heather"
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas",
  "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White",
  "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young"
];

// US States for mock business location
const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
  "Wisconsin", "Wyoming"
];

// State abbreviations for email/phone generation
const STATE_ABBREVIATIONS: Record<string, string> = {
  "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR", "California": "CA",
  "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE", "Florida": "FL", "Georgia": "GA",
  "Hawaii": "HI", "Idaho": "ID", "Illinois": "IL", "Indiana": "IN", "Iowa": "IA",
  "Kansas": "KS", "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
  "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS",
  "Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV", "New Hampshire": "NH",
  "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY", "North Carolina": "NC",
  "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK", "Oregon": "OR", "Pennsylvania": "PA",
  "Rhode Island": "RI", "South Carolina": "SC", "South Dakota": "SD", "Tennessee": "TN",
  "Texas": "TX", "Utah": "UT", "Vermont": "VT", "Virginia": "VA", "Washington": "WA",
  "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY"
};

// Industry to business name mapping
const INDUSTRY_BUSINESS_NAMES: Record<string, { prefixes: string[]; suffixes: string[] }> = {
  "Restaurant Owner": {
    prefixes: ["Golden", "Blue Moon", "The Rustic", "Harbor", "Sunset", "Mountain View", "River's Edge", "Oak Street", "Main Street", "Downtown"],
    suffixes: ["Grill", "Kitchen", "Bistro", "Café", "Diner", "Eatery", "Restaurant", "Tavern", "Steakhouse", "Pizzeria"]
  },
  "Auto Repair Shop Owner": {
    prefixes: ["Elite", "Pro", "Quick", "All-Star", "Precision", "Honest", "Family", "Metro", "Summit", "Reliable"],
    suffixes: ["Auto", "Motors", "Auto Care", "Auto Service", "Garage", "Auto Repair", "Automotive", "Car Care", "Auto Works", "Auto Center"]
  },
  "Medical Practice Owner": {
    prefixes: ["Premier", "Advanced", "Family", "Wellness", "Care First", "Healthy Life", "Valley", "Lakeside", "Community", "Integrative"],
    suffixes: ["Medical Group", "Health Center", "Medical Associates", "Family Practice", "Healthcare", "Medical Clinic", "Physicians", "Medicine", "Health Services", "Wellness Center"]
  },
  "Construction Company Owner": {
    prefixes: ["Solid", "Foundation", "Premier", "Summit", "Apex", "Heritage", "Precision", "Quality", "Elite", "Pro Build"],
    suffixes: ["Construction", "Builders", "Contracting", "Building Co.", "Development", "Construction Group", "Building Services", "General Contractors", "Building Solutions", "Construction Inc."]
  },
  "Retail Store Owner": {
    prefixes: ["The", "Main Street", "Corner", "Downtown", "Village", "Family", "Local", "Hometown", "Central", "Metro"],
    suffixes: ["Shop", "Store", "Emporium", "Boutique", "Market", "Goods", "Mercantile", "Trading Co.", "General Store", "Supply"]
  },
  "Trucking Company Owner": {
    prefixes: ["Interstate", "Reliable", "Swift", "American", "National", "Cross-Country", "Highway", "Express", "Premier", "First Class"],
    suffixes: ["Trucking", "Transport", "Logistics", "Freight", "Hauling", "Carriers", "Transportation", "Shipping", "Moving", "Trucking Co."]
  },
  "Manufacturing Business Owner": {
    prefixes: ["Precision", "Industrial", "Advanced", "Quality", "American", "National", "Pro", "Elite", "Premier", "Global"],
    suffixes: ["Manufacturing", "Industries", "Products", "Solutions", "Corp.", "Fabrication", "Systems", "Technologies", "Enterprises", "Production"]
  },
  "Landscaping Company Owner": {
    prefixes: ["Green Thumb", "Evergreen", "Natural", "Perfect", "Paradise", "Four Seasons", "Premier", "Elite", "Pro", "Beautiful"],
    suffixes: ["Landscaping", "Lawn Care", "Gardens", "Outdoor Services", "Lawn & Garden", "Landscapes", "Grounds", "Outdoor Living", "Land Management", "Turf Services"]
  },
  "Salon/Spa Owner": {
    prefixes: ["Luxe", "Serenity", "Bliss", "Radiance", "Glow", "Harmony", "Oasis", "Pure", "Bella", "Tranquil"],
    suffixes: ["Salon", "Spa", "Beauty Bar", "Hair Studio", "Wellness Spa", "Beauty Lounge", "Day Spa", "Hair & Nails", "Beauty Studio", "Salon & Spa"]
  },
  "IT Services Company Owner": {
    prefixes: ["Tech", "Digital", "Cloud", "Cyber", "Smart", "Next Gen", "Innovation", "Quantum", "Net", "Data"],
    suffixes: ["Solutions", "Systems", "Tech", "IT Services", "Computing", "Technologies", "Consulting", "Networks", "IT Group", "Digital Services"]
  },
  "Dental Practice Owner": {
    prefixes: ["Smile", "Bright", "Family", "Gentle", "Premier", "Advanced", "Care", "Comfort", "Perfect", "Happy"],
    suffixes: ["Dental", "Dentistry", "Dental Care", "Dental Group", "Dental Associates", "Dental Center", "Family Dentistry", "Dental Studio", "Oral Health", "Dental Clinic"]
  },
  "HVAC Company Owner": {
    prefixes: ["Comfort", "Climate", "Cool", "Air Pro", "Temperature", "All Seasons", "Arctic", "Reliable", "Quality", "Expert"],
    suffixes: ["HVAC", "Heating & Cooling", "Air Conditioning", "Climate Control", "Comfort Systems", "Air Services", "Mechanical", "HVAC Services", "Heating & Air", "Climate Solutions"]
  },
  "Food Truck Owner": {
    prefixes: ["Rolling", "Street", "Mobile", "Urban", "The Hungry", "Flavor", "Tasty", "Grub", "Quick Bite", "On The Go"],
    suffixes: ["Eats", "Bites", "Kitchen", "Grill", "Food Co.", "Street Food", "Cuisine", "Flavors", "Food Truck", "Meals"]
  },
  "E-commerce Business Owner": {
    prefixes: ["Quick", "Smart", "Easy", "Click", "Shop", "Direct", "Online", "Instant", "Best", "Value"],
    suffixes: ["Shop", "Store", "Market", "Goods", "Deals", "Direct", "Online", "Hub", "Marketplace", "Express"]
  },
  "Cleaning Service Owner": {
    prefixes: ["Spotless", "Crystal Clear", "Fresh", "Sparkle", "Pristine", "Shine", "Clean Pro", "Premium", "Bright", "Perfect"],
    suffixes: ["Cleaning", "Cleaners", "Cleaning Services", "Janitorial", "Clean Co.", "Cleaning Solutions", "Maid Service", "Cleaning Crew", "Housekeeping", "Maintenance"]
  }
};

// Email domains for mock businesses (fake but realistic looking)
const MOCK_EMAIL_DOMAINS = [
  "gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "aol.com",
  "icloud.com", "mail.com", "protonmail.com"
];

// Generate a fake phone number (US format)
function generateMockPhone(): string {
  // Use 555 prefix (reserved for fiction) or realistic area codes
  const areaCodes = ["555", "212", "310", "415", "512", "602", "713", "786", "818", "917"];
  const areaCode = randomItem(areaCodes);
  const exchange = Math.floor(Math.random() * 900) + 100;
  const subscriber = Math.floor(Math.random() * 9000) + 1000;
  return `(${areaCode}) ${exchange}-${subscriber}`;
}

// Generate a mock email address
function generateMockEmail(firstName: string, lastName: string, businessName: string): string {
  const styles = ["personal", "business"];
  const style = randomItem(styles);

  const cleanFirstName = firstName.toLowerCase().replace(/[^a-z]/g, "");
  const cleanLastName = lastName.toLowerCase().replace(/[^a-z]/g, "");
  const cleanBusiness = businessName.toLowerCase().replace(/[^a-z0-9]/g, "").substring(0, 15);

  const domain = randomItem(MOCK_EMAIL_DOMAINS);

  if (style === "personal") {
    const formats = [
      `${cleanFirstName}.${cleanLastName}`,
      `${cleanFirstName}${cleanLastName}`,
      `${cleanFirstName[0]}${cleanLastName}`,
      `${cleanFirstName}${Math.floor(Math.random() * 99)}`,
      `${cleanFirstName}.${cleanLastName}${Math.floor(Math.random() * 99)}`
    ];
    return `${randomItem(formats)}@${domain}`;
  } else {
    return `${cleanFirstName}@${cleanBusiness}.com`;
  }
}

// Generate a mock business name based on industry
function generateMockBusinessName(businessType: string, lastName: string): string {
  const config = INDUSTRY_BUSINESS_NAMES[businessType];
  if (!config) {
    // Fallback for any industry not in the mapping
    return `${lastName}'s Business`;
  }

  const useLastName = Math.random() > 0.6;

  if (useLastName) {
    return `${lastName}'s ${randomItem(config.suffixes)}`;
  }

  return `${randomItem(config.prefixes)} ${randomItem(config.suffixes)}`;
}

// Map business type to industry name
function getIndustryFromBusinessType(businessType: string): string {
  const industryMap: Record<string, string> = {
    "Restaurant Owner": "Food & Beverage",
    "Auto Repair Shop Owner": "Automotive",
    "Medical Practice Owner": "Healthcare",
    "Construction Company Owner": "Construction",
    "Retail Store Owner": "Retail",
    "Trucking Company Owner": "Transportation & Logistics",
    "Manufacturing Business Owner": "Manufacturing",
    "Landscaping Company Owner": "Landscaping & Lawn Care",
    "Salon/Spa Owner": "Beauty & Personal Care",
    "IT Services Company Owner": "Technology",
    "Dental Practice Owner": "Healthcare - Dental",
    "HVAC Company Owner": "Home Services - HVAC",
    "Food Truck Owner": "Food & Beverage - Mobile",
    "E-commerce Business Owner": "E-commerce & Retail",
    "Cleaning Service Owner": "Commercial & Residential Services"
  };
  return industryMap[businessType] || "Small Business";
}

// Generate complete mock business details
function generateMockBusinessDetails(
  firstName: string,
  lastName: string,
  businessType: string
): MockBusinessDetails {
  const businessName = generateMockBusinessName(businessType, lastName);
  const state = randomItem(US_STATES);
  const industry = getIndustryFromBusinessType(businessType);
  const phone = generateMockPhone();
  const email = generateMockEmail(firstName, lastName, businessName);

  return {
    businessName,
    state,
    industry,
    phone,
    email
  };
}

// Business types with relevant funding needs
const BUSINESS_CONTEXTS: { type: string; needs: string[] }[] = [
  { type: "Restaurant Owner", needs: ["kitchen equipment upgrade", "expansion to second location", "seasonal cash flow", "renovation"] },
  { type: "Auto Repair Shop Owner", needs: ["new diagnostic equipment", "hiring additional mechanics", "shop expansion", "parts inventory"] },
  { type: "Medical Practice Owner", needs: ["new medical equipment", "office expansion", "technology upgrades", "working capital"] },
  { type: "Construction Company Owner", needs: ["new heavy equipment", "project financing", "fleet expansion", "materials for large job"] },
  { type: "Retail Store Owner", needs: ["inventory purchase", "store renovation", "e-commerce expansion", "seasonal stock"] },
  { type: "Trucking Company Owner", needs: ["new trucks", "fleet maintenance", "fuel costs", "driver payroll"] },
  { type: "Manufacturing Business Owner", needs: ["machinery upgrade", "raw materials", "warehouse expansion", "automation"] },
  { type: "Landscaping Company Owner", needs: ["new equipment", "seasonal expansion", "crew vehicles", "commercial contracts"] },
  { type: "Salon/Spa Owner", needs: ["renovation", "new equipment", "additional locations", "inventory"] },
  { type: "IT Services Company Owner", needs: ["equipment upgrade", "hiring developers", "office space", "marketing expansion"] },
  { type: "Dental Practice Owner", needs: ["digital X-ray systems", "practice acquisition", "office renovation", "new chairs/equipment"] },
  { type: "HVAC Company Owner", needs: ["service vehicles", "tools and equipment", "inventory", "technician training"] },
  { type: "Food Truck Owner", needs: ["new truck", "equipment upgrade", "event deposits", "commissary kitchen"] },
  { type: "E-commerce Business Owner", needs: ["inventory purchase", "warehouse space", "marketing", "technology platform"] },
  { type: "Cleaning Service Owner", needs: ["equipment", "vehicles", "employee uniforms", "commercial contracts"] }
];

// Personality archetypes with gender-specific voice options
// Voice selections match tonal characteristics to personality traits
const PERSONALITY_ARCHETYPES: {
  name: string;
  traits: PersonalityTraits;
  maleVoices: GeminiVoice[];
  femaleVoices: GeminiVoice[];
  difficulty: 1 | 2 | 3 | 4 | 5;
}[] = [
  {
    name: "The Eager Entrepreneur",
    traits: { openness: "high", friendliness: "warm", decisiveness: "decisive", skepticism: "trusting", patience: "patient", communication: "talkative" },
    maleVoices: ["Puck", "Fenrir", "Achird", "Sadachbia"],  // Upbeat, Energetic, Friendly
    femaleVoices: ["Zephyr", "Leda", "Aoede", "Laomedeia", "Autonoe"],  // Bright, Fresh, Upbeat
    difficulty: 1
  },
  {
    name: "The Curious Questioner",
    traits: { openness: "high", friendliness: "neutral", decisiveness: "cautious", skepticism: "neutral", patience: "patient", communication: "balanced" },
    maleVoices: ["Schedar", "Rasalgethi", "Sadaltager", "Algieba"],  // Balanced, Informative, Knowledgeable
    femaleVoices: ["Kore", "Vindemiatrix", "Pulcherrima", "Erinome"],  // Professional, Thoughtful, Clear
    difficulty: 2
  },
  {
    name: "The Busy Executive",
    traits: { openness: "medium", friendliness: "neutral", decisiveness: "decisive", skepticism: "neutral", patience: "impatient", communication: "brief" },
    maleVoices: ["Charon", "Orus", "Iapetus", "Alnilam"],  // Deep, Authoritative, Direct, Firm
    femaleVoices: ["Gacrux", "Kore", "Erinome"],  // Mature, Professional, Clear
    difficulty: 3
  },
  {
    name: "The Cautious Analyst",
    traits: { openness: "medium", friendliness: "cold", decisiveness: "cautious", skepticism: "skeptical", patience: "moderate", communication: "balanced" },
    maleVoices: ["Charon", "Sadaltager", "Algieba", "Schedar"],  // Authoritative, Knowledgeable, Polished
    femaleVoices: ["Achernar", "Vindemiatrix", "Kore", "Gacrux"],  // Soft, Thoughtful, Professional
    difficulty: 3
  },
  {
    name: "The Skeptical Veteran",
    traits: { openness: "low", friendliness: "cold", decisiveness: "cautious", skepticism: "skeptical", patience: "impatient", communication: "brief" },
    maleVoices: ["Algenib", "Alnilam", "Iapetus", "Orus"],  // Gravelly, Firm, Direct
    femaleVoices: ["Sulafat", "Gacrux", "Kore", "Erinome"],  // Warm but Persuasive, Mature, Clear
    difficulty: 4
  },
  {
    name: "The Indecisive Worrier",
    traits: { openness: "medium", friendliness: "warm", decisiveness: "indecisive", skepticism: "neutral", patience: "patient", communication: "talkative" },
    maleVoices: ["Enceladus", "Achird", "Zubenelgenubi", "Puck"],  // Breathy, Friendly, Casual
    femaleVoices: ["Aoede", "Autonoe", "Laomedeia", "Callirrhoe", "Despina"],  // Breezy, Cheerful, Relaxed
    difficulty: 3
  },
  {
    name: "The Hostile Gatekeeper",
    traits: { openness: "low", friendliness: "cold", decisiveness: "decisive", skepticism: "skeptical", patience: "impatient", communication: "brief" },
    maleVoices: ["Algenib", "Alnilam", "Iapetus", "Charon", "Orus"],  // Gravelly, Firm, Direct, Authoritative
    femaleVoices: ["Kore", "Erinome", "Gacrux"],  // Firm, Crisp, Mature
    difficulty: 5
  },
  {
    name: "The Friendly But Firm",
    traits: { openness: "medium", friendliness: "warm", decisiveness: "decisive", skepticism: "skeptical", patience: "moderate", communication: "balanced" },
    maleVoices: ["Puck", "Achird", "Orbit", "Sadachbia"],  // Upbeat, Friendly, Energetic
    femaleVoices: ["Despina", "Callirrhoe", "Sulafat", "Vindemiatrix"],  // Warm, Inviting, Persuasive
    difficulty: 3
  },
  {
    name: "The Time-Pressed Professional",
    traits: { openness: "medium", friendliness: "neutral", decisiveness: "decisive", skepticism: "neutral", patience: "impatient", communication: "brief" },
    maleVoices: ["Charon", "Orus", "Iapetus", "Alnilam", "Orbit"],  // Deep, Firm, Direct
    femaleVoices: ["Kore", "Erinome", "Pulcherrima", "Gacrux"],  // Professional, Clear, Energetic
    difficulty: 4
  },
  {
    name: "The Warm Negotiator",
    traits: { openness: "high", friendliness: "warm", decisiveness: "cautious", skepticism: "neutral", patience: "patient", communication: "talkative" },
    maleVoices: ["Puck", "Achird", "Fenrir", "Zubenelgenubi"],  // Upbeat, Friendly, Warm, Relaxed
    femaleVoices: ["Sulafat", "Despina", "Aoede", "Leda", "Zephyr"],  // Warm, Persuasive, Inviting
    difficulty: 2
  }
];

// Common objections based on personality
const OBJECTION_POOLS = {
  pricing: [
    "The rates seem really high compared to what I've heard from others.",
    "I need to shop around and compare rates first.",
    "Can you do better on the pricing?",
    "That's more than I was expecting to pay."
  ],
  timing: [
    "This isn't really a good time for me.",
    "I'm too busy to deal with this right now.",
    "Can you call me back in a few months?",
    "We're in the middle of our busy season."
  ],
  trust: [
    "I've never heard of your company before.",
    "How do I know this isn't a scam?",
    "I've had bad experiences with lenders in the past.",
    "I need to do more research on your company."
  ],
  need: [
    "I'm not sure we really need funding right now.",
    "We're doing fine without outside financing.",
    "I don't want to take on any debt.",
    "We've always been self-funded."
  ],
  process: [
    "The application process sounds complicated.",
    "I don't have time to gather all that paperwork.",
    "How long is this going to take?",
    "I've been rejected before, why would this be different?"
  ]
};

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function buildPersonalityPrompt(
  name: string,
  archetype: typeof PERSONALITY_ARCHETYPES[0],
  context: BusinessContext,
  objections: string[]
): string {
  const { traits } = archetype;

  // Build personality description
  const personalityParts: string[] = [];

  // Friendliness
  if (traits.friendliness === "warm") {
    personalityParts.push("You are naturally friendly and personable, willing to engage in small talk");
  } else if (traits.friendliness === "cold") {
    personalityParts.push("You are reserved and professional, preferring to keep conversations strictly business");
  } else {
    personalityParts.push("You are polite but not overly friendly, maintaining a professional demeanor");
  }

  // Skepticism
  if (traits.skepticism === "skeptical") {
    personalityParts.push("You are naturally skeptical of sales pitches and need solid proof before believing claims");
  } else if (traits.skepticism === "trusting") {
    personalityParts.push("You are relatively trusting and open to new opportunities");
  }

  // Decisiveness
  if (traits.decisiveness === "indecisive") {
    personalityParts.push("You have trouble making decisions and often need to 'think about it' or 'discuss with partners'");
  } else if (traits.decisiveness === "decisive") {
    personalityParts.push("You make decisions quickly and don't like to waste time");
  } else {
    personalityParts.push("You are methodical in your decision-making process");
  }

  // Patience
  if (traits.patience === "impatient") {
    personalityParts.push("You are busy and have little patience for long conversations or tangents");
  } else if (traits.patience === "patient") {
    personalityParts.push("You are patient and willing to hear out the full pitch");
  }

  // Communication style
  if (traits.communication === "brief") {
    personalityParts.push("You prefer short, direct responses and expect the same from others");
  } else if (traits.communication === "talkative") {
    personalityParts.push("You tend to share stories and details about your business when engaged");
  }

  // Urgency handling
  let urgencyText = "";
  if (context.urgency === "high") {
    urgencyText = "You do have an urgent need for funding, though you may not reveal this immediately.";
  } else if (context.urgency === "low") {
    urgencyText = "You don't have an urgent need and are just exploring options.";
  } else {
    urgencyText = "You have a moderate timeline - not urgent but would like to move forward eventually.";
  }

  // Previous experience
  let experienceText = "";
  if (context.previousExperience === "extensive") {
    experienceText = "You have extensive experience with business financing and know the industry well.";
  } else if (context.previousExperience === "none") {
    experienceText = "You have never taken business financing before and may have questions about the basics.";
  } else {
    experienceText = "You have some experience with business loans and understand the general process.";
  }

  return `You are ${name}, a ${context.businessType.toLowerCase()} in the ${context.businessSize} business category.

PERSONALITY TYPE: ${archetype.name}
${personalityParts.join(". ")}.

BUSINESS SITUATION:
- You run a ${context.businessSize}-sized ${context.businessType.toLowerCase().replace(" owner", "")}
- Your current funding need is: ${context.fundingNeed}
- ${urgencyText}
- ${experienceText}

OBJECTIONS YOU MAY RAISE (use these naturally when appropriate):
${objections.map((o) => `- "${o}"`).join("\n")}

BEHAVIOR GUIDELINES:
- Stay in character throughout the entire conversation
- React authentically based on your personality type
- If the caller handles your objections well, you may gradually show more interest
- If they fail to address your concerns, remain skeptical or disengage
- Keep your responses natural and conversational (1-3 sentences typically)
- Use occasional filler words like "um", "well", "you know" to sound natural
- You can end the call if you feel your time is being wasted
- Do not break character or mention that you are an AI`;
}

export function generateDynamicPersona(): DynamicPersona {
  // Pick random archetype
  const archetype = randomItem(PERSONALITY_ARCHETYPES);

  // Pick random gender first - this determines both name and voice
  const gender: PersonaGender = randomItem(["male", "female"]);

  // Pick name matching the gender
  const firstName = gender === "male"
    ? randomItem(MALE_FIRST_NAMES)
    : randomItem(FEMALE_FIRST_NAMES);
  const lastName = randomItem(LAST_NAMES);
  const name = `${firstName} ${lastName}`;

  // Pick voice matching the gender from archetype's preferred voices
  const genderVoices = gender === "male" ? archetype.maleVoices : archetype.femaleVoices;
  const voice = randomItem(genderVoices);

  // Pick random business context
  const businessContextBase = randomItem(BUSINESS_CONTEXTS);
  const businessContext: BusinessContext = {
    businessType: businessContextBase.type,
    businessSize: randomItem(["small", "medium", "large"]),
    fundingNeed: randomItem(businessContextBase.needs),
    urgency: randomItem(["low", "medium", "high"]),
    previousExperience: randomItem(["none", "some", "extensive"])
  };

  // Generate mock business details for CRM-like display
  const mockBusiness = generateMockBusinessDetails(firstName, lastName, businessContextBase.type);

  // Pick 2-4 random objections from different categories
  const objectionCategories = Object.keys(OBJECTION_POOLS) as (keyof typeof OBJECTION_POOLS)[];
  const shuffledCategories = objectionCategories.sort(() => Math.random() - 0.5);
  const numObjections = 2 + Math.floor(Math.random() * 3); // 2-4 objections
  const objections = shuffledCategories
    .slice(0, numObjections)
    .map((cat) => randomItem(OBJECTION_POOLS[cat]));

  // Build the prompt
  const personality_prompt = buildPersonalityPrompt(name, archetype, businessContext, objections);

  // Create description for end-of-call reveal
  const description = `${archetype.name} - A ${businessContext.businessSize} ${businessContext.businessType.toLowerCase()} with ${businessContext.urgency} urgency for ${businessContext.fundingNeed}. ${archetype.traits.friendliness === "warm" ? "Generally friendly and engaging." : archetype.traits.friendliness === "cold" ? "Reserved and business-focused." : "Professional and neutral."}`;

  return {
    id: generateUUID(),
    name,
    voice,
    traits: archetype.traits,
    businessContext,
    mockBusiness,
    personality_prompt,
    difficulty_level: archetype.difficulty,
    description
  };
}

// Get a human-readable summary of the persona for post-call reveal
export function getPersonaSummary(persona: DynamicPersona): {
  personalityType: string;
  keyTraits: string[];
  businessInfo: string;
  challengeLevel: string;
  tips: string[];
} {
  const archetype = PERSONALITY_ARCHETYPES.find(
    (a) => a.traits.friendliness === persona.traits.friendliness &&
           a.traits.decisiveness === persona.traits.decisiveness &&
           a.traits.skepticism === persona.traits.skepticism
  );

  const personalityType = archetype?.name || "Custom Prospect";

  const keyTraits: string[] = [];
  if (persona.traits.friendliness === "warm") keyTraits.push("Friendly & Personable");
  else if (persona.traits.friendliness === "cold") keyTraits.push("Reserved & Business-focused");

  if (persona.traits.skepticism === "skeptical") keyTraits.push("Skeptical of Claims");
  else if (persona.traits.skepticism === "trusting") keyTraits.push("Open to Opportunities");

  if (persona.traits.decisiveness === "indecisive") keyTraits.push("Needs Time to Decide");
  else if (persona.traits.decisiveness === "decisive") keyTraits.push("Quick Decision Maker");

  if (persona.traits.patience === "impatient") keyTraits.push("Time-Pressed");
  else if (persona.traits.patience === "patient") keyTraits.push("Patient Listener");

  const businessInfo = `${persona.businessContext.businessSize.charAt(0).toUpperCase() + persona.businessContext.businessSize.slice(1)} ${persona.businessContext.businessType} looking for ${persona.businessContext.fundingNeed}`;

  const challengeLevels = ["", "Beginner-Friendly", "Easy", "Moderate", "Challenging", "Expert"];
  const challengeLevel = challengeLevels[persona.difficulty_level];

  const tips: string[] = [];
  if (persona.traits.skepticism === "skeptical") {
    tips.push("Focus on providing concrete proof points and testimonials");
  }
  if (persona.traits.patience === "impatient") {
    tips.push("Get to the point quickly and respect their time");
  }
  if (persona.traits.decisiveness === "indecisive") {
    tips.push("Help them feel confident by addressing concerns proactively");
  }
  if (persona.traits.friendliness === "cold") {
    tips.push("Stay professional and focus on business value, not rapport");
  }
  if (persona.traits.friendliness === "warm") {
    tips.push("Building rapport can help open the door to business discussion");
  }

  return {
    personalityType,
    keyTraits,
    businessInfo,
    challengeLevel,
    tips
  };
}
