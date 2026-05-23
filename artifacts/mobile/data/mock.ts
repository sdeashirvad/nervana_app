// User profile
export const mockUser = {
  name: "Alex",
  profession: "Engineering Manager",
  stressLevel: 4,
  struggles: ["burnout", "overthinking", "work anxiety"],
  goals: ["emotional clarity", "better sleep"],
  calmCoins: 1240,
  streakDays: 7,
  joinedDate: "2025-11-01",
};

// Emotional check-in history
export const mockCheckins = [
  { id: "1", date: "2026-05-23", mood: "mentally tired", note: "Long sprint review today", calmScore: 3 },
  { id: "2", date: "2026-05-22", mood: "anxious", note: "Presentation went ok though", calmScore: 2 },
  { id: "3", date: "2026-05-21", mood: "calm", note: "Slow morning, worked well", calmScore: 5 },
  { id: "4", date: "2026-05-20", mood: "overwhelmed", note: "3 meetings and a deploy", calmScore: 1 },
  { id: "5", date: "2026-05-19", mood: "hopeful", note: "1:1 with my manager helped", calmScore: 4 },
  { id: "6", date: "2026-05-18", mood: "emotionally numb", note: "", calmScore: 2 },
  { id: "7", date: "2026-05-17", mood: "distracted", note: "Hard to focus after news", calmScore: 3 },
];

// Journal entries
export const mockJournalEntries = [
  { id: "j1", date: "2026-05-23", title: "After the sprint", content: "I don't know why I feel so empty after we shipped. We did good work. Maybe it's the adrenaline crash. Or maybe I've been running on fumes for longer than I realized.", tags: ["burnout", "reflection"], mood: "mentally tired" },
  { id: "j2", date: "2026-05-21", title: "A quiet morning", content: "No Slack. No notifications. Just coffee and the sound of rain. I keep forgetting this is allowed.", tags: ["rest", "calm"], mood: "calm" },
  { id: "j3", date: "2026-05-18", title: "Imposter thoughts", content: "Sat in a meeting today and felt completely out of place. Like everyone else had a manual I never received. I know this is a feeling, not a fact. But it felt very real.", tags: ["imposter syndrome", "anxiety"], mood: "anxious" },
  { id: "j4", date: "2026-05-15", title: "The loneliness of remote work", content: "Six hours of calls today and I still feel profoundly alone. There's a difference between being heard and being seen.", tags: ["loneliness", "remote work"], mood: "emotionally numb" },
];

// AI Companion conversation
export const mockConversation = [
  { id: "m1", role: "assistant", text: "I noticed you've been feeling drained after late meetings this week. How are you holding up today?", timestamp: "9:14 AM" },
  { id: "m2", role: "user", text: "Just tired. The sprint ended and somehow I feel worse, not better.", timestamp: "9:15 AM" },
  { id: "m3", role: "assistant", text: "That kind of post-delivery emptiness is more common than people talk about. You spend weeks building toward something, then it ships — and suddenly there's no adrenaline to hold the exhaustion back.", timestamp: "9:15 AM" },
  { id: "m4", role: "user", text: "Yeah exactly. Is something wrong with me?", timestamp: "9:16 AM" },
  { id: "m5", role: "assistant", text: "Nothing is wrong with you. Your nervous system is doing what it's supposed to do — releasing tension after sustained pressure. The emptiness you're feeling is the crash after running on fumes. It's not a signal something broke. It's a signal you need rest.", timestamp: "9:16 AM" },
  { id: "m6", role: "user", text: "I keep thinking I should feel proud.", timestamp: "9:17 AM" },
  { id: "m7", role: "assistant", text: "You can feel both. Proud of the work and depleted from the cost. Those aren't contradictions — they're just honest.", timestamp: "9:17 AM" },
];

// Calming quotes
export const calmingQuotes = [
  { text: "Rest is not the absence of productivity. It is the condition for it.", author: "Oliver Burkeman" },
  { text: "You don't have to earn stillness.", author: "Nervana" },
  { text: "The most radical thing you can do right now is slow down.", author: "Nervana" },
  { text: "Your worth is not measured in your output.", author: "Nervana" },
  { text: "Some days, surviving is the whole achievement.", author: "Nervana" },
];

// Notifications
export const mockNotifications = [
  { id: "n1", title: "A small pause", body: "Take a small mental pause today. Just a few breaths — nothing more.", time: "10:00 AM", read: false },
  { id: "n2", title: "Checking in on you", body: "How has your mind been feeling lately? When did you last really rest?", time: "Yesterday", read: false },
  { id: "n3", title: "You've been carrying a lot", body: "You've been carrying a lot this week. That's worth acknowledging.", time: "2 days ago", read: true },
  { id: "n4", title: "Your reflection streak", body: "7 days of showing up for yourself. That consistency is everything.", time: "3 days ago", read: true },
  { id: "n5", title: "Evening check-in", body: "The day is winding down. How are you actually doing?", time: "4 days ago", read: true },
];

// Emotional insight data (for chart)
export const weeklyMoodData = [
  { day: "Mon", score: 1, label: "overwhelmed" },
  { day: "Tue", score: 2, label: "anxious" },
  { day: "Wed", score: 3, label: "distracted" },
  { day: "Thu", score: 2, label: "emotionally numb" },
  { day: "Fri", score: 4, label: "hopeful" },
  { day: "Sat", score: 5, label: "calm" },
  { day: "Sun", score: 3, label: "mentally tired" },
];

// Referral data
export const mockReferrals = [
  { name: "Jordan", joined: true, calmCoinsEarned: 200 },
  { name: "Priya", joined: true, calmCoinsEarned: 200 },
  { name: "Marcus", joined: false, calmCoinsEarned: 0 },
];
