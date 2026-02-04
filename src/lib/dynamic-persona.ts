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

// Generated persona
export interface DynamicPersona {
  id: string;
  name: string;
  voice: GeminiVoice;
  traits: PersonalityTraits;
  businessContext: BusinessContext;
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
