import { hashAnswer } from '../utils/crypto.js';

export const QUESTIONS = [
  {
    id: 1,
    type: 'choice',
    question: "What is my favorite color?",
    options: ["Purple", "Dark Green", "Black", "Light Blue"],
    answerHash: "e1c2f14d0c8072f184023d91439d4b52ce90ecbb63504fcf629b17cb8c580946",
  },
  {
    id: 2,
    type: 'choice',
    question: "What is my favorite rich food choice?",
    options: ["Biriyani", "Chinese", "Spicy Ramen", "Italian"],
    answerHash: "bacef63cf6726e62fbc3f0149fa5e5f485aeaff6b5dd9eee12f981b8176b003b",
  },
  {
    id: 3,
    type: 'choice',
    question: "Which food do I like to cook the most?",
    options: ["Chicken", "Fried Rice", "Paratha", "Biriyani"],
    answerHash: "9818012f430f639968558c022342af86cba7ccf57398bba4fa3cfa263e055d3a",
  },
  {
    id: 4,
    type: 'choice',
    question: "Which of this is my first programming language?",
    options: ["C", "C++", "JavaScript", "Python"],
    answerHash: "775bd3b218f2df0075c13e92b3e837da5d01ba1a48ddc9067c9fa041fb2aa238",
  },
  {
    id: 5,
    type: 'choice',
    question: "Which language do I like the most?",
    options: ["C", "C++", "JavaScript", "Python"],
    answerHash: "8a3c2b7f8ed932b54b681fffe33af2707aefe7e0b1d8cb8f445996127c6fb646",
  },
  {
    id: 6,
    type: 'choice',
    question: "What goal I thrive to achieve?",
    options: ["ML Engineer", "Data Scientist", "Full Stack Engineer", "Software Engineer"],
    answerHash: "eb41d1425358d5ef2cbdd3fb3f1a3483ba2c3070cdbc990fc6316331b988e3fa",
  },
  {
    id: 7,
    type: 'choice',
    question: "What type of content do I like the most?",
    options: ["K-Drama", "English Movie", "Hindi Movie", "Anime"],
    answerHash: "c25ab1e01f66eee96f431a6057ff87e89aca3d421e838b0dd28a9df860cb14f1",
  },
  {
    id: 8,
    type: 'choice',
    question: "My favorite anime?",
    options: ["One Piece", "Naruto", "Demon Slayer", "Overflow"],
    answerHash: "9d976f67c859e7d84b66bf16cbc8f7fc9aaf64ca1b130c08e2744d64ba52abaa",
  },
  {
    id: 9,
    type: 'choice',
    question: "What do I use?",
    options: ["Laptop", "Desktop"],
    answerHash: "8a046267c238e55fcca33ecfc7fcbb9cad534a398bc00ebec76e90f3ec91dfdd",
  },
  {
    id: 10,
    type: 'text',
    question: "Write my full name",
    answerHash: "e970f8a68c33e7ad2c242f9dbecb632866fb40b8ae5346d023cae0e633d46b2a",
    placeholder: "Type full name here...",
  },
];

export const RELATION_OPTIONS = [
  { id: 'friend', label: 'Friend' },
  { id: 'brother', label: 'Brother' },
  { id: 'sister', label: 'Sister' },
  { id: 'well wisher', label: 'Well Wisher' },
];

/**
 * Cryptographically verifies if the candidate answer matches the expected hash.
 * @param {number} questionId
 * @param {string} candidateAnswer
 * @returns {Promise<boolean>}
 */
export async function verifyAnswer(questionId, candidateAnswer) {
  const q = QUESTIONS.find((item) => item.id === questionId);
  if (!q) return false;
  const hash = await hashAnswer(candidateAnswer, questionId);
  return hash === q.answerHash;
}
