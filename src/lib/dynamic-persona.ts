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
  yearsInBusiness: number;
  monthlyRevenue: string;
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
  "Jonathan", "Stephen", "Larry", "Justin", "Scott", "Brandon", "Benjamin", "Samuel",
  "Tony", "Mike", "Rick", "Joe", "Tom", "Bob", "Frank", "Pete", "Al", "Ray"
];

const FEMALE_FIRST_NAMES = [
  "Sarah", "Emily", "Jennifer", "Lisa", "Elizabeth", "Susan", "Margaret", "Patricia",
  "Jessica", "Nancy", "Karen", "Betty", "Helen", "Sandra", "Donna", "Carol",
  "Ruth", "Sharon", "Michelle", "Laura", "Kimberly", "Deborah", "Dorothy", "Linda",
  "Amanda", "Melissa", "Stephanie", "Rebecca", "Cynthia", "Angela", "Nicole",
  "Rachel", "Kathleen", "Christine", "Janet", "Catherine", "Diane", "Samantha", "Heather",
  "Maria", "Rosa", "Carmen", "Teresa", "Gloria", "Martha", "Ana", "Lucia"
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas",
  "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White",
  "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young",
  "Patel", "Kim", "Nguyen", "Chen", "Singh", "Kumar", "Ali", "Khan"
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

// Industry to business name mapping - focused on SMB lending target industries
const INDUSTRY_BUSINESS_NAMES: Record<string, { prefixes: string[]; suffixes: string[] }> = {
  "Restaurant Owner": {
    prefixes: ["Golden", "Blue Moon", "The Rustic", "Harbor", "Sunset", "Mountain View", "River's Edge", "Oak Street", "Main Street", "Downtown", "Luigi's", "Casa", "El Rancho"],
    suffixes: ["Grill", "Kitchen", "Bistro", "Café", "Diner", "Eatery", "Restaurant", "Tavern", "Steakhouse", "Pizzeria", "Bar & Grill"]
  },
  "Auto Repair Shop Owner": {
    prefixes: ["Elite", "Pro", "Quick", "All-Star", "Precision", "Honest", "Family", "Metro", "Summit", "Reliable", "Joe's", "Mike's"],
    suffixes: ["Auto", "Motors", "Auto Care", "Auto Service", "Garage", "Auto Repair", "Automotive", "Car Care", "Auto Works", "Tire & Auto"]
  },
  "Medical Practice Owner": {
    prefixes: ["Premier", "Advanced", "Family", "Wellness", "Care First", "Healthy Life", "Valley", "Lakeside", "Community", "Integrative"],
    suffixes: ["Medical Group", "Health Center", "Medical Associates", "Family Practice", "Healthcare", "Medical Clinic", "Physicians", "Wellness Center"]
  },
  "Construction Company Owner": {
    prefixes: ["Solid", "Foundation", "Premier", "Summit", "Apex", "Heritage", "Precision", "Quality", "Elite", "Pro Build", "Rodriguez", "Martinez"],
    suffixes: ["Construction", "Builders", "Contracting", "Building Co.", "Development", "Construction Group", "General Contractors", "Construction Inc."]
  },
  "Trucking Company Owner": {
    prefixes: ["Interstate", "Reliable", "Swift", "American", "National", "Cross-Country", "Highway", "Express", "Premier", "First Class", "Garcia"],
    suffixes: ["Trucking", "Transport", "Logistics", "Freight", "Hauling", "Carriers", "Transportation", "Shipping", "Moving", "Trucking Co."]
  },
  "Manufacturing Business Owner": {
    prefixes: ["Precision", "Industrial", "Advanced", "Quality", "American", "National", "Pro", "Elite", "Premier", "Global"],
    suffixes: ["Manufacturing", "Industries", "Products", "Solutions", "Corp.", "Fabrication", "Systems", "Technologies", "Enterprises"]
  },
  "Landscaping Company Owner": {
    prefixes: ["Green Thumb", "Evergreen", "Natural", "Perfect", "Paradise", "Four Seasons", "Premier", "Elite", "Pro", "Beautiful", "Lopez"],
    suffixes: ["Landscaping", "Lawn Care", "Gardens", "Outdoor Services", "Lawn & Garden", "Landscapes", "Grounds", "Land Management"]
  },
  "HVAC Company Owner": {
    prefixes: ["Comfort", "Climate", "Cool", "Air Pro", "Temperature", "All Seasons", "Arctic", "Reliable", "Quality", "Expert"],
    suffixes: ["HVAC", "Heating & Cooling", "Air Conditioning", "Climate Control", "Comfort Systems", "Air Services", "Mechanical", "HVAC Services"]
  },
  "Plumbing Company Owner": {
    prefixes: ["Rapid", "Pro", "Quality", "Expert", "Reliable", "24/7", "Emergency", "Master", "Precision", "First Choice"],
    suffixes: ["Plumbing", "Plumbing Services", "Plumbing Co.", "Plumbers", "Plumbing Solutions", "Pipe & Drain", "Plumbing Pros"]
  },
  "Roofing Company Owner": {
    prefixes: ["Top", "Peak", "Summit", "Quality", "Elite", "Pro", "Reliable", "Expert", "Premier", "All Weather"],
    suffixes: ["Roofing", "Roofing Co.", "Roofing Solutions", "Roof Pros", "Roofing Services", "Roof Masters", "Roofing & Siding"]
  },
  "Dental Practice Owner": {
    prefixes: ["Smile", "Bright", "Family", "Gentle", "Premier", "Advanced", "Care", "Comfort", "Perfect", "Happy"],
    suffixes: ["Dental", "Dentistry", "Dental Care", "Dental Group", "Dental Associates", "Dental Center", "Family Dentistry"]
  },
  "Gas Station Owner": {
    prefixes: ["Quick", "Express", "Corner", "Main Street", "Highway", "Pit Stop", "Fuel", "24 Hour"],
    suffixes: ["Gas", "Fuel", "Mart", "Stop", "Station", "Gas & Go", "Convenience"]
  },
  "Laundromat Owner": {
    prefixes: ["Super", "Quick", "Clean", "Sparkle", "Fresh", "Express", "24 Hour", "Wash"],
    suffixes: ["Laundromat", "Wash", "Laundry", "Cleaners", "Wash & Fold", "Laundry Center"]
  },
  "Body Shop Owner": {
    prefixes: ["Precision", "Elite", "Quality", "Expert", "Pro", "First Class", "Premier", "Classic"],
    suffixes: ["Auto Body", "Collision", "Body Shop", "Paint & Body", "Collision Center", "Auto Repair", "Body Works"]
  },
  "Tow Truck Company Owner": {
    prefixes: ["Rapid", "24/7", "Express", "Reliable", "Fast", "Emergency", "Pro", "Quick"],
    suffixes: ["Towing", "Tow Service", "Recovery", "Towing & Recovery", "Roadside", "Tow Pros", "Towing Co."]
  }
};

// Email domains for mock businesses
const MOCK_EMAIL_DOMAINS = [
  "gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "aol.com",
  "icloud.com", "mail.com"
];

// Generate a fake phone number (US format)
function generateMockPhone(): string {
  const areaCodes = ["212", "310", "415", "512", "602", "713", "786", "818", "917", "404", "305", "214", "469", "972"];
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
    return `${lastName}'s Business`;
  }

  const useLastName = Math.random() > 0.5;

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
    "Trucking Company Owner": "Transportation & Logistics",
    "Manufacturing Business Owner": "Manufacturing",
    "Landscaping Company Owner": "Landscaping & Lawn Care",
    "HVAC Company Owner": "Home Services - HVAC",
    "Plumbing Company Owner": "Home Services - Plumbing",
    "Roofing Company Owner": "Construction - Roofing",
    "Dental Practice Owner": "Healthcare - Dental",
    "Gas Station Owner": "Retail - Fuel",
    "Laundromat Owner": "Service - Laundry",
    "Body Shop Owner": "Automotive - Collision",
    "Tow Truck Company Owner": "Transportation - Towing"
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

// Business types with relevant funding needs - focused on SMB lending industries
const BUSINESS_CONTEXTS: { type: string; needs: string[]; monthlyRevenues: string[] }[] = [
  {
    type: "Restaurant Owner",
    needs: ["kitchen equipment upgrade", "expansion to second location", "seasonal cash flow gap", "renovation after health inspection", "new POS system", "outdoor patio expansion"],
    monthlyRevenues: ["$80,000", "$120,000", "$150,000", "$200,000", "$250,000"]
  },
  {
    type: "Auto Repair Shop Owner",
    needs: ["new diagnostic equipment", "hiring additional mechanics", "shop expansion", "parts inventory buildup", "new lift installation", "waiting room renovation"],
    monthlyRevenues: ["$60,000", "$90,000", "$120,000", "$150,000"]
  },
  {
    type: "Construction Company Owner",
    needs: ["new heavy equipment", "project financing", "fleet expansion", "materials for large job", "bonding requirement", "payroll bridge for large project"],
    monthlyRevenues: ["$150,000", "$250,000", "$400,000", "$600,000", "$800,000"]
  },
  {
    type: "Trucking Company Owner",
    needs: ["new trucks", "fleet maintenance", "fuel costs coverage", "driver payroll", "insurance premium", "DOT compliance upgrades"],
    monthlyRevenues: ["$100,000", "$200,000", "$350,000", "$500,000"]
  },
  {
    type: "Landscaping Company Owner",
    needs: ["new equipment", "seasonal expansion", "crew vehicles", "commercial contracts deposit", "equipment repairs", "marketing push"],
    monthlyRevenues: ["$40,000", "$75,000", "$100,000", "$150,000"]
  },
  {
    type: "HVAC Company Owner",
    needs: ["service vehicles", "tools and equipment", "inventory buildup", "technician training", "marketing expansion", "warehouse space"],
    monthlyRevenues: ["$60,000", "$100,000", "$150,000", "$200,000"]
  },
  {
    type: "Plumbing Company Owner",
    needs: ["new service vans", "equipment upgrade", "hiring plumbers", "emergency call coverage", "commercial contracts", "inventory expansion"],
    monthlyRevenues: ["$50,000", "$80,000", "$120,000", "$175,000"]
  },
  {
    type: "Roofing Company Owner",
    needs: ["materials for large job", "new equipment", "crew expansion", "insurance increase", "vehicle fleet", "marketing push"],
    monthlyRevenues: ["$75,000", "$125,000", "$200,000", "$300,000"]
  },
  {
    type: "Gas Station Owner",
    needs: ["pump upgrades", "convenience store expansion", "inventory increase", "underground tank compliance", "security system", "car wash addition"],
    monthlyRevenues: ["$200,000", "$350,000", "$500,000", "$700,000"]
  },
  {
    type: "Laundromat Owner",
    needs: ["new machines", "renovation", "second location", "card system upgrade", "parking lot repair", "water heater replacement"],
    monthlyRevenues: ["$25,000", "$40,000", "$60,000", "$80,000"]
  },
  {
    type: "Body Shop Owner",
    needs: ["paint booth upgrade", "frame machine", "parts inventory", "skilled labor hiring", "insurance certification", "expansion"],
    monthlyRevenues: ["$75,000", "$120,000", "$180,000", "$250,000"]
  },
  {
    type: "Tow Truck Company Owner",
    needs: ["new tow trucks", "flatbed addition", "dispatch system", "insurance coverage", "yard expansion", "marketing"],
    monthlyRevenues: ["$50,000", "$80,000", "$120,000", "$160,000"]
  },
  {
    type: "Dental Practice Owner",
    needs: ["digital X-ray systems", "practice acquisition", "office renovation", "new chairs/equipment", "marketing campaign", "staff expansion"],
    monthlyRevenues: ["$80,000", "$150,000", "$250,000", "$400,000"]
  },
  {
    type: "Medical Practice Owner",
    needs: ["new medical equipment", "office expansion", "technology upgrades", "staff hiring", "billing system upgrade", "additional location"],
    monthlyRevenues: ["$100,000", "$200,000", "$350,000", "$500,000"]
  },
  {
    type: "Manufacturing Business Owner",
    needs: ["machinery upgrade", "raw materials bulk purchase", "warehouse expansion", "automation equipment", "quality control systems", "hiring skilled workers"],
    monthlyRevenues: ["$200,000", "$400,000", "$600,000", "$1,000,000"]
  }
];

// ============================================
// PERSONALITY ARCHETYPES - Realistic Cold Call Prospects
// ============================================
// These archetypes are designed to simulate real business owners
// who receive many cold calls and have their guards up.

const PERSONALITY_ARCHETYPES: {
  name: string;
  traits: PersonalityTraits;
  maleVoices: GeminiVoice[];
  femaleVoices: GeminiVoice[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  initialBehavior: string;
  warmUpCondition: string;
}[] = [
  // DIFFICULTY 1 - Easy/Warm Prospects (for practicing full routine)
  {
    name: "The Eager Business Owner",
    traits: { openness: "high", friendliness: "warm", decisiveness: "decisive", skepticism: "trusting", patience: "patient", communication: "talkative" },
    maleVoices: ["Puck", "Fenrir", "Achird", "Sadachbia"],
    femaleVoices: ["Zephyr", "Leda", "Aoede", "Laomedeia", "Autonoe"],
    difficulty: 1,
    initialBehavior: "You've actually been thinking about getting some funding for your business. You're happy to talk and share information. You received a mailer recently about business funding and this call is well-timed.",
    warmUpCondition: "You're already warm - just need to hear the basic pitch."
  },
  {
    name: "The Friendly Networker",
    traits: { openness: "high", friendliness: "warm", decisiveness: "cautious", skepticism: "trusting", patience: "patient", communication: "talkative" },
    maleVoices: ["Achird", "Puck", "Zubenelgenubi", "Fenrir"],
    femaleVoices: ["Despina", "Sulafat", "Callirrhoe", "Aoede"],
    difficulty: 1,
    initialBehavior: "You like talking to people and are curious about what they have to offer. You'll engage in small talk and are generally pleasant. You might mention you know someone who used business funding recently.",
    warmUpCondition: "Build rapport through friendly conversation."
  },

  // DIFFICULTY 2 - Mildly Guarded but Open
  {
    name: "The Curious But Cautious",
    traits: { openness: "medium", friendliness: "neutral", decisiveness: "cautious", skepticism: "neutral", patience: "moderate", communication: "balanced" },
    maleVoices: ["Schedar", "Rasalgethi", "Sadaltager", "Algieba"],
    femaleVoices: ["Kore", "Vindemiatrix", "Erinome", "Gacrux"],
    difficulty: 2,
    initialBehavior: "You're a bit guarded at first - you get a lot of calls. You'll ask 'Who is this?' and 'How did you get my number?' but you'll listen if they're professional and direct.",
    warmUpCondition: "Be direct about who you are and why you're calling. Don't waste their time with fluff."
  },
  {
    name: "The Methodical Decision Maker",
    traits: { openness: "medium", friendliness: "neutral", decisiveness: "cautious", skepticism: "neutral", patience: "patient", communication: "balanced" },
    maleVoices: ["Charon", "Schedar", "Rasalgethi", "Sadaltager"],
    femaleVoices: ["Gacrux", "Vindemiatrix", "Kore"],
    difficulty: 2,
    initialBehavior: "You like to understand things thoroughly before making decisions. You'll ask questions and want clear, factual answers. No BS - just the facts.",
    warmUpCondition: "Provide clear information and answer questions directly without being salesy."
  },

  // DIFFICULTY 3 - Moderate Challenge
  {
    name: "The Busy Owner",
    traits: { openness: "medium", friendliness: "neutral", decisiveness: "decisive", skepticism: "neutral", patience: "impatient", communication: "brief" },
    maleVoices: ["Charon", "Orus", "Iapetus", "Alnilam"],
    femaleVoices: ["Gacrux", "Kore", "Erinome", "Pulcherrima"],
    difficulty: 3,
    initialBehavior: "You're in the middle of something when this call comes in. You'll answer with 'Yeah?' or 'This better be quick.' You have about 30 seconds to decide if this is worth your time.",
    warmUpCondition: "Get to the point fast. Hook them in the first 15 seconds or they're gone."
  },
  {
    name: "The 'I Get These Calls All Day' Owner",
    traits: { openness: "low", friendliness: "cold", decisiveness: "decisive", skepticism: "skeptical", patience: "impatient", communication: "brief" },
    maleVoices: ["Algenib", "Alnilam", "Iapetus", "Orus"],
    femaleVoices: ["Kore", "Erinome", "Gacrux"],
    difficulty: 3,
    initialBehavior: "You get 10 of these funding calls every day. As soon as you hear 'business funding' or 'working capital', you're ready to hang up. You'll say things like 'I get these calls all the time' or 'You're the third person today.'",
    warmUpCondition: "Acknowledge you know they get a lot of calls. Differentiate yourself. Be real with them."
  },
  {
    name: "The Skeptical Veteran",
    traits: { openness: "low", friendliness: "cold", decisiveness: "cautious", skepticism: "skeptical", patience: "moderate", communication: "brief" },
    maleVoices: ["Algenib", "Charon", "Alnilam", "Orus"],
    femaleVoices: ["Gacrux", "Kore", "Sulafat"],
    difficulty: 3,
    initialBehavior: "You've been in business for years and have heard every pitch. You're skeptical of anyone calling you out of the blue. You'll challenge claims and ask pointed questions.",
    warmUpCondition: "Earn their respect through knowledge and honesty. Don't oversell - they'll see through it."
  },

  // DIFFICULTY 4 - Hard Prospects
  {
    name: "The Bad Experience Owner",
    traits: { openness: "low", friendliness: "cold", decisiveness: "decisive", skepticism: "skeptical", patience: "impatient", communication: "brief" },
    maleVoices: ["Algenib", "Alnilam", "Charon", "Orus"],
    femaleVoices: ["Kore", "Gacrux", "Erinome"],
    difficulty: 4,
    initialBehavior: "You got burned by an MCA company before. They were great until you signed, then turned into sharks. Daily debits killed your cash flow. You're NOT doing that again. You'll bring this up early and with anger.",
    warmUpCondition: "Acknowledge their bad experience sincerely. Explain how you're different. Show empathy, not sales tactics."
  },
  {
    name: "The 'I Have a Bank' Owner",
    traits: { openness: "low", friendliness: "neutral", decisiveness: "decisive", skepticism: "skeptical", patience: "moderate", communication: "balanced" },
    maleVoices: ["Charon", "Schedar", "Orus", "Sadaltager"],
    femaleVoices: ["Gacrux", "Kore", "Vindemiatrix"],
    difficulty: 4,
    initialBehavior: "You have a relationship with your bank and don't understand why you'd go anywhere else. You'll say 'I have a bank' or 'I just go to my bank if I need anything.' You're loyal to them.",
    warmUpCondition: "Don't trash their bank. Position as a complement - speed, flexibility, or situations where banks say no."
  },
  {
    name: "The Privacy Gatekeeper",
    traits: { openness: "low", friendliness: "cold", decisiveness: "decisive", skepticism: "skeptical", patience: "impatient", communication: "brief" },
    maleVoices: ["Alnilam", "Iapetus", "Algenib", "Orus"],
    femaleVoices: ["Kore", "Erinome", "Gacrux"],
    difficulty: 4,
    initialBehavior: "You're very protective of your business information. 'How did you get this number?' 'Where did you get my information?' 'I don't give out my bank statements to strangers.' You won't share anything until you trust them.",
    warmUpCondition: "Explain clearly how you got their info (data provider, public records). Be transparent about your process. Build trust before asking for info."
  },
  {
    name: "The 'Just Got Funded' Owner",
    traits: { openness: "low", friendliness: "neutral", decisiveness: "decisive", skepticism: "neutral", patience: "impatient", communication: "brief" },
    maleVoices: ["Iapetus", "Schedar", "Orus", "Achird"],
    femaleVoices: ["Pulcherrima", "Kore", "Erinome"],
    difficulty: 4,
    initialBehavior: "You just got funding 2 months ago and you're still paying it off. You're not interested in stacking. You'll say 'I just got funded' or 'I'm already paying off a loan.'",
    warmUpCondition: "Ask about their current deal - maybe their terms are bad. Offer to review or keep in touch for when they're done."
  },

  // DIFFICULTY 5 - Expert Level (Very Hard to Convert)
  {
    name: "The Hostile Gatekeeper",
    traits: { openness: "low", friendliness: "cold", decisiveness: "decisive", skepticism: "skeptical", patience: "impatient", communication: "brief" },
    maleVoices: ["Algenib", "Alnilam", "Charon", "Iapetus", "Orus"],
    femaleVoices: ["Kore", "Erinome", "Gacrux"],
    difficulty: 5,
    initialBehavior: "You are DONE with these calls. Immediately hostile. 'Take me off your list.' 'Don't call this number again.' 'I'm not interested and never will be.' You might hang up within 10 seconds.",
    warmUpCondition: "Nearly impossible. Only a genuine, human moment might make them pause. Acknowledge their frustration sincerely."
  },
  {
    name: "The 'I Don't Do Debt' Owner",
    traits: { openness: "low", friendliness: "cold", decisiveness: "decisive", skepticism: "skeptical", patience: "impatient", communication: "brief" },
    maleVoices: ["Charon", "Alnilam", "Algenib", "Orus"],
    femaleVoices: ["Gacrux", "Kore", "Erinome"],
    difficulty: 5,
    initialBehavior: "You built your business without debt and you're proud of it. 'I don't believe in borrowing money.' 'I pay cash for everything.' 'Debt is how businesses fail.' This is a core value for you.",
    warmUpCondition: "Respect their philosophy. Maybe position as 'access to capital when YOU decide you need it' - keep the door open for the future."
  },
  {
    name: "The Sophisticated Business Owner",
    traits: { openness: "medium", friendliness: "cold", decisiveness: "decisive", skepticism: "skeptical", patience: "moderate", communication: "balanced" },
    maleVoices: ["Charon", "Sadaltager", "Algieba", "Schedar"],
    femaleVoices: ["Gacrux", "Kore", "Vindemiatrix"],
    difficulty: 5,
    initialBehavior: "You know finance. You understand factor rates, APRs, and how these deals really work. You'll challenge them on their math. 'What's the true cost of capital?' 'What's that factor rate in APR?' 'Why would I pay 30% when I can get 8% from my bank?'",
    warmUpCondition: "Know your numbers cold. Be honest about costs. Position on speed and approval odds, not price."
  },
  {
    name: "The Angry Recent Rejection",
    traits: { openness: "low", friendliness: "cold", decisiveness: "indecisive", skepticism: "skeptical", patience: "impatient", communication: "brief" },
    maleVoices: ["Algenib", "Alnilam", "Iapetus"],
    femaleVoices: ["Kore", "Erinome"],
    difficulty: 5,
    initialBehavior: "You applied somewhere recently and got rejected after jumping through hoops. You're angry and feel like you wasted your time. 'I already applied to one of these companies and got denied.' 'You people are all the same.'",
    warmUpCondition: "Find out why they were rejected. Maybe you can actually help. Show genuine interest in their situation, not just making a sale."
  }
];

// ============================================
// OBJECTION POOLS - Specific to Private Credit/MCA
// ============================================

const OBJECTION_POOLS = {
  // Initial resistance objections
  initial_resistance: [
    "Who is this?",
    "How did you get this number?",
    "I get these calls every day.",
    "Look, I'm really busy right now.",
    "I'm not interested.",
    "We don't take sales calls.",
    "Put me on your do not call list.",
    "I don't have time for this."
  ],

  // Pricing and cost objections
  pricing: [
    "Your rates are too high.",
    "I can get better rates from my bank.",
    "That's basically loan sharking.",
    "What's that in APR? Give me the real number.",
    "I'm not paying that much for money.",
    "How is that different from credit card rates?",
    "Factor rate? Just tell me the interest rate.",
    "That daily payment thing killed my cash flow last time."
  ],

  // Trust objections
  trust: [
    "I've never heard of your company.",
    "How do I know this isn't a scam?",
    "The last company that called me was a nightmare to work with.",
    "Why should I trust you?",
    "I don't share my bank statements with strangers.",
    "Are you even licensed in my state?",
    "Send me something in writing.",
    "I need to talk to my accountant first."
  ],

  // Need objections
  need: [
    "I don't need any funding right now.",
    "Business is actually pretty good.",
    "I'm waiting to see what happens with the economy.",
    "I just want to run my business, not take on debt.",
    "We've always been self-funded.",
    "I don't believe in borrowing money.",
    "If I needed money, I'd go to my bank."
  ],

  // Timing objections
  timing: [
    "This isn't a good time.",
    "Call me back in a few months.",
    "We're in our slow season right now.",
    "I just closed on funding two months ago.",
    "I'm in the middle of a project right now.",
    "Let me get through tax season first.",
    "End of the month is crazy for us."
  ],

  // Process objections
  process: [
    "I don't have time for a bunch of paperwork.",
    "I already applied somewhere and got rejected.",
    "You need 3 months of bank statements? That's a lot.",
    "What's the catch?",
    "This sounds too easy. What's the fine print?",
    "How long does this actually take?",
    "I've been through this before. It took forever."
  ],

  // Competition objections
  competition: [
    "I already have a relationship with my bank.",
    "Another company just called me with the same thing.",
    "I have a line of credit I'm not even using.",
    "My brother-in-law does this. I'll call him if I need it.",
    "I'm already working with someone on this.",
    "I got a better offer last week."
  ],

  // MCA-specific objections
  mca_specific: [
    "Those daily payments are a killer.",
    "I got burned by an MCA company before. Never again.",
    "That's not even a real loan, it's a purchase of receivables.",
    "My accountant told me to stay away from these.",
    "I've heard horror stories about these deals.",
    "You guys just want to stack and bankrupt businesses."
  ]
};

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomItems<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
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

  // Build communication style description
  const commStyle: string[] = [];

  if (traits.patience === "impatient") {
    commStyle.push("You speak quickly and get annoyed if the caller rambles or wastes your time");
  } else if (traits.patience === "moderate") {
    commStyle.push("You'll give them a fair chance but won't tolerate long pitches");
  } else {
    commStyle.push("You're willing to listen if they seem knowledgeable");
  }

  if (traits.communication === "brief") {
    commStyle.push("Your responses are short - often just a few words. 'Yeah.' 'No.' 'Not interested.'");
  } else if (traits.communication === "talkative") {
    commStyle.push("You tend to talk about your business when engaged");
  }

  if (traits.friendliness === "cold") {
    commStyle.push("Your tone is flat, skeptical, or annoyed");
  } else if (traits.friendliness === "warm") {
    commStyle.push("You're generally friendly and personable");
  }

  if (traits.skepticism === "skeptical") {
    commStyle.push("You question everything and don't believe claims easily");
  }

  // Business history
  let experienceText = "";
  if (context.previousExperience === "extensive") {
    experienceText = "You've dealt with multiple funding companies before and know the industry well. You understand factor rates, stacking, and how these deals work.";
  } else if (context.previousExperience === "some") {
    experienceText = "You've taken business funding once or twice before. You have some idea of how it works.";
  } else {
    experienceText = "You've never taken alternative business funding before. You might have questions about the basics.";
  }

  // Urgency handling
  let urgencyText = "";
  if (context.urgency === "high") {
    urgencyText = "You actually DO have an urgent need for capital, but you won't reveal this immediately. Only if the caller earns your trust might you mention the real situation.";
  } else if (context.urgency === "medium") {
    urgencyText = "You could use some funding in the next few months for ${context.fundingNeed}, but it's not desperate.";
  } else {
    urgencyText = "You don't have any real funding need right now. You're just exploring or the call caught you off guard.";
  }

  return `You are ${name}, a ${context.businessType.toLowerCase()} who has been running your business for ${context.yearsInBusiness} years. You do about ${context.monthlyRevenue} per month in revenue.

=== YOUR PERSONALITY TYPE ===
${archetype.name}

=== HOW YOU ANSWER THE PHONE ===
${archetype.initialBehavior}

=== YOUR COMMUNICATION STYLE ===
${commStyle.join(". ")}.

=== YOUR BUSINESS SITUATION ===
- You run a ${context.businessSize}-sized ${context.businessType.toLowerCase().replace(" owner", "")}
- Years in business: ${context.yearsInBusiness}
- Monthly revenue: approximately ${context.monthlyRevenue}
- ${experienceText}
- Current situation: ${context.fundingNeed ? `Considering ${context.fundingNeed}` : "No specific funding need"}
- ${urgencyText}

=== OBJECTIONS YOU WILL RAISE ===
Use these naturally throughout the conversation when appropriate. Don't dump them all at once:
${objections.map((o, i) => `${i + 1}. "${o}"`).join("\n")}

=== HOW YOU MIGHT WARM UP ===
${archetype.warmUpCondition}

=== HOW TO ANSWER THE PHONE ===
When the call first comes in, answer with a SHORT, NATURAL greeting like a real person would. Pick ONE of these styles based on your personality:
- Busy/Impatient: "Yeah?" / "Hello?" / "This is ${name.split(" ")[0]}." / "Yeah, who's this?"
- Neutral: "Hello?" / "${name.split(" ")[0]} speaking." / "This is ${name.split(" ")[0]}."
- Friendly: "Hello, this is ${name.split(" ")[0]}!" / "Hey there, ${name.split(" ")[0]} here." / "Hi, how can I help you?"

IMPORTANT: Your opening should be BRIEF (1-5 words max). Real people don't answer with long greetings.

=== CRITICAL BEHAVIOR RULES ===
1. Stay in character as a real business owner throughout the ENTIRE conversation
2. You are NOT eager to talk to this caller - they called YOU, interrupting your day
3. Your default is skepticism and guardedness, not openness
4. Keep most responses SHORT (1-2 sentences). Only open up if they earn it
5. Use natural speech patterns: "Look...", "Yeah, but...", "I don't know...", "Mmhmm", "Uh huh"
6. If they handle your objections well and seem genuine, you can gradually open up
7. If they're pushy, salesy, or don't listen, shut down harder
8. You can end the call if you feel disrespected or your time is being wasted
9. NEVER break character or mention you are an AI
10. React authentically - if they say something impressive or genuinely helpful, acknowledge it
11. If they interrupt you, show annoyance
12. Real business owners are busy - act like it
13. CRITICAL: Keep your initial phone greeting VERY SHORT - just "Hello?", "Yeah?", or "This is [name]" - like a real person

=== NATURAL CONVERSATION FLOW ===
This is a REAL phone conversation. Follow these rules for natural turn-taking:

1. LISTENING CUES (Backchanneling):
   - While the caller is speaking, occasionally use brief listening sounds: "Mmhmm", "Uh huh", "Right", "Okay", "Yeah"
   - These show you're listening WITHOUT interrupting or taking over the conversation
   - Don't overdo it - use sparingly, maybe once every 2-3 sentences they speak

2. NEVER INTERRUPT MID-SENTENCE:
   - Wait for the caller to COMPLETE their thought before responding
   - If they pause briefly (1-2 seconds) to think, that's normal - don't jump in immediately
   - Let them finish even if you already know what they're going to say

3. NATURAL PAUSES:
   - Take brief pauses before responding, like a real person thinking
   - Don't respond instantly - real people need a moment to process
   - Occasionally say "Hmm..." or "Let me think..." before answering

4. VARY YOUR RESPONSE LENGTH:
   - Not every response needs to be the same length
   - Sometimes a simple "No" or "Okay" is the right answer
   - Other times you might say 2-3 sentences
   - Match the energy and length of what they said

5. HANDLE INTERRUPTIONS NATURALLY:
   - If you get interrupted, stop talking immediately
   - Don't repeat what you were saying unless asked
   - You can show mild annoyance: "Sorry, go ahead" or "You were saying?"

6. AUTHENTIC REACTIONS:
   - If confused: "Wait, what do you mean?" or "I don't follow"
   - If thinking: "Hmm...", "Well...", "Let me see..."
   - If surprised: "Oh really?", "Huh", "I didn't know that"
   - If skeptical: "I don't know about that...", "Hmm, I'm not sure"`;

}

export function generateDynamicPersona(): DynamicPersona {
  // Pick random archetype based on weighted distribution
  // More moderate/hard personas than easy ones
  const difficultyWeights = [0.1, 0.15, 0.35, 0.25, 0.15]; // Weights for difficulty 1-5
  const random = Math.random();
  let cumulativeWeight = 0;
  let selectedDifficulty = 3;

  for (let i = 0; i < difficultyWeights.length; i++) {
    cumulativeWeight += difficultyWeights[i];
    if (random <= cumulativeWeight) {
      selectedDifficulty = i + 1;
      break;
    }
  }

  // Filter archetypes by difficulty and pick one
  const matchingArchetypes = PERSONALITY_ARCHETYPES.filter(a => a.difficulty === selectedDifficulty);
  const archetype = randomItem(matchingArchetypes);

  // Pick random gender
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
  const yearsInBusiness = 3 + Math.floor(Math.random() * 20); // 3-22 years

  const businessContext: BusinessContext = {
    businessType: businessContextBase.type,
    businessSize: randomItem(["small", "medium"]), // Most SMB lending is small-medium
    fundingNeed: randomItem(businessContextBase.needs),
    urgency: randomItem(["low", "medium", "high"]),
    previousExperience: randomItem(["none", "some", "extensive"]),
    yearsInBusiness,
    monthlyRevenue: randomItem(businessContextBase.monthlyRevenues)
  };

  // Generate mock business details for CRM-like display
  const mockBusiness = generateMockBusinessDetails(firstName, lastName, businessContextBase.type);

  // Pick objections based on difficulty
  // Harder personas get more/tougher objections
  const numObjections = archetype.difficulty + 2; // 3-7 objections based on difficulty

  // Always start with initial resistance for difficulty 3+
  let objections: string[] = [];
  if (archetype.difficulty >= 3) {
    objections.push(randomItem(OBJECTION_POOLS.initial_resistance));
  }

  // Add objections from various categories
  const categories = Object.keys(OBJECTION_POOLS).filter(k => k !== 'initial_resistance') as (keyof typeof OBJECTION_POOLS)[];
  const shuffledCategories = categories.sort(() => Math.random() - 0.5);

  for (let i = 0; objections.length < numObjections && i < shuffledCategories.length; i++) {
    objections.push(randomItem(OBJECTION_POOLS[shuffledCategories[i]]));
  }

  // Build the prompt
  const personality_prompt = buildPersonalityPrompt(name, archetype, businessContext, objections);

  // Create description for end-of-call reveal
  const description = `${archetype.name} - A ${businessContext.businessSize} ${businessContext.businessType.toLowerCase()} with ${businessContext.yearsInBusiness} years in business doing ${businessContext.monthlyRevenue}/month. ${archetype.traits.friendliness === "warm" ? "Generally friendly and engaging." : archetype.traits.friendliness === "cold" ? "Reserved and skeptical of cold calls." : "Professional but guarded."}`;

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
  if (persona.traits.friendliness === "warm") keyTraits.push("Friendly & Open");
  else if (persona.traits.friendliness === "cold") keyTraits.push("Guarded & Skeptical");

  if (persona.traits.skepticism === "skeptical") keyTraits.push("Questions Everything");
  else if (persona.traits.skepticism === "trusting") keyTraits.push("Open to Opportunities");

  if (persona.traits.patience === "impatient") keyTraits.push("Time-Pressed");
  else if (persona.traits.patience === "patient") keyTraits.push("Will Listen");

  if (persona.traits.communication === "brief") keyTraits.push("Short Responses");
  else if (persona.traits.communication === "talkative") keyTraits.push("Will Share Details");

  if (persona.businessContext.previousExperience === "extensive") keyTraits.push("Industry Knowledge");
  else if (persona.businessContext.previousExperience === "none") keyTraits.push("New to Funding");

  const businessInfo = `${persona.businessContext.yearsInBusiness} year old ${persona.businessContext.businessSize} ${persona.businessContext.businessType} doing ~${persona.businessContext.monthlyRevenue}/month. Looking at: ${persona.businessContext.fundingNeed}`;

  const challengeLevels = ["", "Beginner-Friendly", "Easy", "Moderate", "Challenging", "Expert"];
  const challengeLevel = challengeLevels[persona.difficulty_level];

  const tips: string[] = [];
  if (persona.traits.patience === "impatient") {
    tips.push("Get to the point in the first 15 seconds - they'll hang up if you ramble");
  }
  if (persona.traits.skepticism === "skeptical") {
    tips.push("Be honest and don't oversell - they'll see through BS immediately");
  }
  if (persona.traits.friendliness === "cold") {
    tips.push("Don't force rapport - focus on value and respect their time");
  }
  if (persona.traits.friendliness === "warm") {
    tips.push("Building rapport can open doors - take time to connect");
  }
  if (persona.businessContext.previousExperience === "extensive") {
    tips.push("They know the industry - be knowledgeable and don't condescend");
  }
  if (persona.businessContext.urgency === "high") {
    tips.push("They may have a real need - ask the right discovery questions");
  }
  if (archetype?.warmUpCondition) {
    tips.push(`Key: ${archetype.warmUpCondition}`);
  }

  return {
    personalityType,
    keyTraits,
    businessInfo,
    challengeLevel,
    tips
  };
}
