export const mockUser = {
  name: "Alex",
  profession: "Engineering Manager",
  stressLevel: 4,
  struggles: ["burnout", "overthinking", "work anxiety"],
  goals: ["emotional clarity", "better sleep"],
  calmCoins: 0,
  streakDays: 0,
  joinedDate: "2026-05-28",
};

export const mockCheckins = [
  { id: "1", date: "2026-05-23", mood: "mentally tired", note: "Long sprint review today. Couldn't switch off after.", calmScore: 3 },
  { id: "2", date: "2026-05-22", mood: "anxious", note: "Presentation went okay but my heart was pounding the whole time.", calmScore: 2 },
  { id: "3", date: "2026-05-21", mood: "calm", note: "Slow morning with no Slack. Worked better than any meeting ever could.", calmScore: 5 },
  { id: "4", date: "2026-05-20", mood: "overwhelmed", note: "Three meetings, a deploy, and a performance review prep. Too much.", calmScore: 1 },
  { id: "5", date: "2026-05-19", mood: "hopeful", note: "1:1 with my manager was unexpectedly good. Felt heard.", calmScore: 4 },
];

export const mockJournalEntries = [
  {
    id: "j1",
    date: "May 23",
    title: "After the sprint",
    content: "I don't know why I feel so empty after we shipped. We did good work. Maybe it's the adrenaline crash. Or maybe I've been running on fumes for longer than I realized, and the finish line just let all of it out at once.",
    tags: ["burnout", "reflection"],
    mood: "mentally tired",
  },
  {
    id: "j2",
    date: "May 21",
    title: "A quiet morning",
    content: "No Slack. No notifications. Just coffee and the sound of rain. I keep forgetting this is allowed — that I don't need to earn stillness. It's not a reward. It's just air.",
    tags: ["rest", "calm"],
    mood: "calm",
  },
  {
    id: "j3",
    date: "May 18",
    title: "Imposter thoughts",
    content: "Sat in a senior leadership meeting today and felt completely out of place. Like everyone else had a manual I never received. I know this is a feeling, not a fact. But it felt very real in that room.",
    tags: ["imposter syndrome", "anxiety"],
    mood: "anxious",
  },
];

export const mockConversation = [
  {
    id: "m1",
    role: "assistant",
    text: "I noticed you've been checking in as mentally tired a few times this week. How are you holding up today?",
    timestamp: "9:14 AM",
  },
  {
    id: "m2",
    role: "user",
    text: "Just tired. The sprint ended and somehow I feel worse, not better.",
    timestamp: "9:15 AM",
  },
  {
    id: "m3",
    role: "assistant",
    text: "That kind of post-delivery emptiness is more common than people talk about. You spend weeks building toward something, then it ships — and suddenly there's no adrenaline left to hold the exhaustion back. It all surfaces at once.",
    timestamp: "9:15 AM",
  },
  {
    id: "m4",
    role: "user",
    text: "Yeah exactly. Is something wrong with me?",
    timestamp: "9:16 AM",
  },
  {
    id: "m5",
    role: "assistant",
    text: "Nothing is wrong with you. Your nervous system is doing exactly what it's supposed to do — releasing tension after sustained pressure. The emptiness is the crash after running on fumes. It's not a signal something broke. It's a signal you need rest.",
    timestamp: "9:16 AM",
  },
  {
    id: "m6",
    role: "user",
    text: "I keep thinking I should feel proud.",
    timestamp: "9:17 AM",
  },
  {
    id: "m7",
    role: "assistant",
    text: "You can feel both. Proud of the work and depleted from the cost of it. Those aren't contradictions — they're just honest. The pride doesn't have to wait until the exhaustion clears.",
    timestamp: "9:17 AM",
  },
];

export const calmingQuotes = [
  { text: "Rest is not the absence of work. It is the condition for it.", author: "Oliver Burkeman" },
  { text: "You don't have to earn stillness.", author: "Nervana" },
  { text: "The most courageous thing you can do right now is slow down.", author: "Nervana" },
  { text: "Your worth is not measured in your output.", author: "Nervana" },
  { text: "Some days, simply getting through it is the whole achievement.", author: "Nervana" },
  { text: "Clarity comes when you stop asking your mind to hold everything.", author: "Nervana" },
  { text: "You are not behind. You are exactly where you need to be.", author: "Nervana" },
];

export const DAILY_INSIGHTS = [
  "Mental clarity often starts with slowing down.",
  "Small resets compound quietly over time.",
  "You've been carrying a lot lately. That deserves acknowledgment.",
  "The mind clears when you stop asking it to hold everything at once.",
  "Rest is how your nervous system files what the day couldn't process.",
  "You don't have to solve it all today.",
  "Even two minutes of stillness changes your internal weather.",
  "The pause is the practice.",
  "Gentleness toward yourself is not weakness. It's wisdom.",
  "What you resist persists. What you allow, passes.",
];

export const JOURNAL_PROMPTS = [
  "What's occupying most of your mind right now?",
  "What would feel like relief today?",
  "What are you carrying that isn't yours to carry?",
  "When did you last feel like yourself?",
  "What do you need that you haven't asked for?",
  "What would you say to yourself if you were speaking to a friend?",
  "What's one thing you're pretending is fine?",
  "What does your body feel like right now?",
  "Where have you been hardest on yourself this week?",
  "What small thing went well today that you almost didn't notice?",
  "What would 'enough' look like today?",
  "If you could pause time for one hour, what would you do with it?",
  "What feeling have you been avoiding naming?",
  "What does rest actually look like for you?",
  "What are you most afraid of being honest about with yourself?",
];

export const GROUNDING_STEPS = [
  {
    id: "1",
    title: "Notice what you can see",
    body: "Look around slowly. Name three things you can see right now — their colour, shape, texture.",
    duration: 20,
    breathCue: false,
  },
  {
    id: "2",
    title: "Feel your body's weight",
    body: "Notice where your body makes contact with the chair or floor. Let that support hold you completely.",
    duration: 18,
    breathCue: true,
  },
  {
    id: "3",
    title: "Soften your jaw and shoulders",
    body: "Unclench your jaw. Let your shoulders drop. Relax your hands. You don't need to hold anything right now.",
    duration: 20,
    breathCue: false,
  },
  {
    id: "4",
    title: "Take three slow breaths",
    body: "Breathe in for 4, hold for 4, out for 6. Long exhale. Each breath tells your nervous system it's safe.",
    duration: 35,
    breathCue: true,
  },
  {
    id: "5",
    title: "Return to here",
    body: "You're here. Present. Whatever was pulling at you can wait a moment longer. You've already done enough.",
    duration: 20,
    breathCue: false,
  },
];

export const AI_INSIGHTS = [
  "Your focus patterns suggest mental fatigue after long context switching.",
  "You tend to feel calmer on mornings with fewer notifications.",
  "Short resets between tasks seem to improve your clarity.",
  "You've been more grounded this week than the last.",
  "Journaling on hard days tends to soften the ones that follow.",
];

export const FLOW_SCORE = {
  focus: 72,
  calm: 68,
  energy: 61,
  combined: 67,
};

export const weeklyMoodData = [
  { day: "Mon", score: 1, label: "overwhelmed" },
  { day: "Tue", score: 2, label: "anxious" },
  { day: "Wed", score: 3, label: "distracted" },
  { day: "Thu", score: 2, label: "numb" },
  { day: "Fri", score: 4, label: "hopeful" },
  { day: "Sat", score: 5, label: "calm" },
  { day: "Sun", score: 3, label: "tired" },
];

export const mockPatterns = [
  { icon: "moon", text: "You tend to feel calmer on weekend mornings." },
  { icon: "alert-triangle", text: "Late-meeting Thursdays often carry into your evenings." },
  { icon: "trending-up", text: "You've felt more hopeful this week than last." },
  { icon: "wind", text: "Journaling on hard days seems to soften the ones that follow." },
  { icon: "sun", text: "Mornings with no early calls are your clearest thinking time." },
  { icon: "zap", text: "Focus sessions over 10 min show stronger flow scores." },
];

export const PATTERN_INSIGHTS = [
  {
    id: "p1",
    type: "trend",
    headline: "Calmer than last week",
    body: "Your average mood score is up 0.8 points compared to seven days ago.",
    icon: "trending-up",
    accent: "#6DC8C8",
  },
  {
    id: "p2",
    type: "pattern",
    headline: "Thursday friction",
    body: "Your stress scores are consistently higher on Thursdays. Late-afternoon meetings may be a factor.",
    icon: "alert-circle",
    accent: "#E8B86D",
  },
  {
    id: "p3",
    type: "habit",
    headline: "Journal effect",
    body: "Days when you journaled were followed by a mood score that was 1.2 points higher on average.",
    icon: "edit-2",
    accent: "#9491F0",
  },
  {
    id: "p4",
    type: "win",
    headline: "Breathing sessions working",
    body: "Your post-session calm scores have increased by 18% over the past two weeks.",
    icon: "wind",
    accent: "#6DC8C8",
  },
];
