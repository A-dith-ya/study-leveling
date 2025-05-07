export interface Achievement {
  id: string;
  title: string;
  description: string;
  image: any;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "deck-builder",
    title: "Deck Builder",
    description: "Create your first deck of flashcards",
    image: require("../../assets/images/achievements/aDeckBuilder.webp"),
  },
  {
    id: "flashcard-master-10",
    title: "Flashcard Master 10",
    description: "Master 10 flashcards",
    image: require("../../assets/images/achievements/aFlashcardMaster10.webp"),
  },
  {
    id: "streak-king-10",
    title: "Streak King 10",
    description: "Maintain a streak for 10 consecutive days",
    image: require("../../assets/images/achievements/StreakKing10.webp"),
  },
  {
    id: "session-surfer-10",
    title: "Session Surfer 10",
    description: "Complete 10 study sessions",
    image: require("../../assets/images/achievements/SessionSurfer10.webp"),
  },
  {
    id: "knowledge-seeker",
    title: "Knowledge Seeker",
    description: "Study for a total of 5 hours",
    image: require("../../assets/images/achievements/aKnowledgeSeeker.webp"),
  },
  {
    id: "customizer",
    title: "Customizer",
    description: "Apply decorations to your flashcards",
    image: require("../../assets/images/achievements/Customizer.webp"),
  },
  {
    id: "challenge-champion",
    title: "Challenge Champ",
    description: "Complete all daily challenges",
    image: require("../../assets/images/achievements/ChallengeChamp.webp"),
  },
  {
    id: "flashcard-master-100",
    title: "Flashcard Master 100",
    description: "Master 100 flashcards",
    image: require("../../assets/images/achievements/aFlashcardMaster100.webp"),
  },
  {
    id: "session-surfer-50",
    title: "Session Surfer 50",
    description: "Complete 50 study sessions",
    image: require("../../assets/images/achievements/SessionSurfer50.webp"),
  },
  {
    id: "streak-king-100",
    title: "Streak King 100",
    description: "Maintain a streak for 100 consecutive days",
    image: require("../../assets/images/achievements/StreakKing100.webp"),
  },
  {
    id: "session-surfer-100",
    title: "Session Surfer 100",
    description: "Complete 100 study sessions",
    image: require("../../assets/images/achievements/SessionSurfer100.webp"),
  },
  {
    id: "flashcard-master-1000",
    title: "Flashcard Master 1000",
    description: "Master 1000 flashcards",
    image: require("../../assets/images/achievements/aFlashcardMaster1000.webp"),
  },
];
