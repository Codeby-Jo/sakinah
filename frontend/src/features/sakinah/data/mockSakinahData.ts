import type { CandidateSummary, ConsideredFewResponse, ConversationTopic } from '../types/sakinah.types';

export const mockCandidates: CandidateSummary[] = [
  {
    candidateId: 'cand_001',
    displayName: 'Candidate A',
    age: 28,
    location: 'London, UK',
    profession: 'Software Engineer',
    sect: 'Sunni',
    prayerFrequency: 'Always Prays',
    bioSnippet: 'Looking for a companion to grow in deen and duniya.',
  },
  {
    candidateId: 'cand_002',
    displayName: 'Candidate B',
    age: 26,
    location: 'Toronto, CA',
    profession: 'Architect',
    sect: 'Sunni',
    prayerFrequency: 'Usually Prays',
    bioSnippet: 'Family oriented, love spending weekends outdoors.',
  }
];

export const mockConsideredFewResponse: ConsideredFewResponse = {
  candidates: mockCandidates,
  status: 'FOUND'
};

export const mockNoMatchesResponse: ConsideredFewResponse = {
  candidates: [],
  status: 'NO_SUITABLE_MATCHES_RIGHT_NOW'
};

export const mockConversationTopics: ConversationTopic[] = [
  {
    id: 'topic_1',
    title: 'Deen & Practice',
    description: 'Understanding each other\'s spiritual journey.',
    isUnlocked: true
  },
  {
    id: 'topic_2',
    title: 'Family & Upbringing',
    description: 'Values shaped by our families.',
    isUnlocked: false,
    unlockRequirement: 'Complete Deen & Practice topic first'
  }
];
