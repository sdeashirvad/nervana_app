export const mockUser = {
  name: "Alex",
  profession: "Engineering Manager",
  stressLevel: 4,
  struggles: ["burnout", "overthinking", "work anxiety"],
  goals: ["emotional clarity", "better sleep"],
  calmCoins: 1_240,
  streakDays: 12,
  joinedDate: "2025-11-01",
};

export const mockCheckins = [
  { id: "1", date: "2026-05-23", mood: "mentally tired", note: "Long sprint review today. Couldn't switch off after.", calmScore: 3 },
  { id: "2", date: "2026-05-22", mood: "anxious", note: "Presentation went okay but my heart was pounding the whole time.", calmScore: 2 },
  { id: "3", date: "2026-05-21", mood: "calm", note: "Slow morning with no Slack. Worked better than any meeting ever could.", calmScore: 5 },
  { id: "4", date: "2026-05-20", mood: "overwhelmed", note: "Three meetings, a deploy, and a performance review prep. Too much.", calmScore: 1 },
  { id: "5", date: "2026-05-19", mood: "hopeful", note: "1:1 with my manager was unexpectedly good. Felt heard.", calmScore: 4 },
  { id: "6", date: "2026-05-18", mood: "emotionally numb", note: "Couldn't feel much of anything. Just moved through the day.", calmScore: 2 },
  { id: "7", date: "2026-05-17", mood: "distracted", note: "Hard to focus. News cycle, Slack notifications, everything.", calmScore: 3 },
  { id: "8", date: "2026-05-16", mood: "calm", note: "Took a real lunch break. Read outside. Forgot what that felt like.", calmScore: 5 },
  { id: "9", date: "2026-05-15", mood: "anxious", note: "Quarterly goals review. Always makes me second-guess everything.", calmScore: 2 },
  { id: "10", date: "2026-05-14", mood: "hopeful", note: "Team shipped something I'm proud of. That doesn't happen often enough.", calmScore: 4 },
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
  {
    id: "j4",
    date: "May 15",
    title: "The loneliness of remote work",
    content: "Six hours of calls today and I still feel profoundly alone at the end of it. There's a difference between being heard and being seen. I have a lot of the first. Very little of the second.",
    tags: ["loneliness", "remote work"],
    mood: "emotionally numb",
  },
  {
    id: "j5",
    date: "May 12",
    title: "Things I'm not saying in meetings",
    content: "I'm tired. Not the kind sleep fixes. The kind that builds up from carrying other people's urgency for months. I keep showing up fully. I don't know how much longer I can do that without someone noticing.",
    tags: ["burnout", "honesty"],
    mood: "overwhelmed",
  },
  {
    id: "j6",
    date: "May 9",
    title: "Small moments of okay",
    content: "Nothing remarkable happened today. That's exactly why I'm writing it down. I want to remember that unremarkable can feel like relief. I laughed twice. Ate a real meal. That's something.",
    tags: ["gratitude", "rest"],
    mood: "calm",
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
  { text: "You're allowed to be tired. Exhaustion isn't weakness.", author: "Nervana" },
  { text: "Small pauses matter more than you think.", author: "Nervana" },
];

export const mockNotifications = [
  { id: "n1", title: "A quieter moment", body: "You've been carrying a lot today. Take a few slow breaths — nothing more is needed right now.", time: "10:00 AM", read: false },
  { id: "n2", title: "Checking in on you", body: "How has your mind been lately? When did you last feel like yourself?", time: "Yesterday", read: false },
  { id: "n3", title: "You've been carrying a lot", body: "You've shown up every day this week. That's worth acknowledging, even if it doesn't feel like enough.", time: "2 days ago", read: true },
  { id: "n4", title: "12 days of showing up", body: "That kind of quiet consistency is rare. Your future self will feel this.", time: "3 days ago", read: true },
  { id: "n5", title: "Evening check-in", body: "The day is winding down. Before you shift into tomorrow — how are you actually doing?", time: "4 days ago", read: true },
  { id: "n6", title: "Small pause", body: "You don't have to process everything at once. Some things just need time.", time: "5 days ago", read: true },
];

export const weeklyMoodData = [
  { day: "Mon", score: 1, label: "overwhelmed" },
  { day: "Tue", score: 2, label: "anxious" },
  { day: "Wed", score: 3, label: "distracted" },
  { day: "Thu", score: 2, label: "numb" },
  { day: "Fri", score: 4, label: "hopeful" },
  { day: "Sat", score: 5, label: "calm" },
  { day: "Sun", score: 3, label: "tired" },
];

export const mockReferrals = [
  { name: "Jordan", joined: true, calmCoinsEarned: 200 },
  { name: "Priya", joined: true, calmCoinsEarned: 200 },
  { name: "Marcus", joined: false, calmCoinsEarned: 0 },
];

export const mockPatterns = [
  { icon: "moon", text: "You tend to feel calmer on weekend mornings." },
  { icon: "alert-triangle", text: "Late-meeting Thursdays often carry into your evenings." },
  { icon: "trending-up", text: "You've felt more hopeful this week than last." },
  { icon: "wind", text: "Journaling on hard days seems to soften the ones that follow." },
];
