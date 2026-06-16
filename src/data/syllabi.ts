// Training syllabi → the "graduation roadmap". Each species has a syllabus made
// of ordered levels; each level holds skills. A pet's TrainingProgress records
// which skill ids are done, and the Training page renders a fun roadmap from
// kindergarten to graduate.

import type { Species } from '@/types'

export interface Skill {
  id: string
  title: string
  tip: string // a concrete how-to so the parent knows what "done" looks like
}

export interface SyllabusLevel {
  id: string
  title: string
  emoji: string
  blurb: string
  skills: Skill[]
}

export interface Syllabus {
  id: string
  species: Species
  title: string
  levels: SyllabusLevel[]
}

const CAT_SYLLABUS: Syllabus = {
  id: 'cat-foundations-v1',
  species: 'cat',
  title: 'Kitten → Graduate',
  levels: [
    {
      id: 'cat-l1',
      title: 'Kitten Kindergarten',
      emoji: '🍼',
      blurb: 'Settling in, trust and the basics of a happy home.',
      skills: [
        { id: 'cat-litter', title: 'Reliable litter use', tip: 'Place the box away from food; keep it scrupulously clean.' },
        { id: 'cat-name', title: 'Responds to name', tip: 'Say the name, then immediately treat. Repeat at mealtimes.' },
        { id: 'cat-handling', title: 'Comfortable being held', tip: 'Short, calm holds ending with a treat before any wriggling.' },
        { id: 'cat-scratch-post', title: 'Uses the scratching post', tip: 'Reward scratching the post; redirect from furniture gently.' },
      ],
    },
    {
      id: 'cat-l2',
      title: 'Social Butterfly',
      emoji: '🦋',
      blurb: 'Confidence with people, sounds and the carrier.',
      skills: [
        { id: 'cat-carrier', title: 'Calm in the carrier', tip: 'Leave the carrier open at home with a blanket and treats inside.' },
        { id: 'cat-visitors', title: 'Relaxed around visitors', tip: 'Let guests toss treats; never force interaction.' },
        { id: 'cat-grooming', title: 'Tolerates brushing', tip: 'Brief brushing sessions paired with food.' },
        { id: 'cat-nails', title: 'Allows nail checks', tip: 'Touch a paw, treat. Build up to pressing a single nail out.' },
      ],
    },
    {
      id: 'cat-l3',
      title: 'Trick Scholar',
      emoji: '🎓',
      blurb: 'Fun cues that also build a brilliant bond.',
      skills: [
        { id: 'cat-come', title: 'Comes when called', tip: 'Use a consistent sound (shake the dry-food cover) + reward.' },
        { id: 'cat-sit', title: 'Sit on cue', tip: 'Lure the nose up and back with a treat; mark the sit.' },
        { id: 'cat-target', title: 'Touch a target', tip: 'Reward nose-touches to a finger or stick.' },
        { id: 'cat-highfive', title: 'High five', tip: 'Reward a paw lift, then shape toward your hand.' },
      ],
    },
    {
      id: 'cat-l4',
      title: 'Graduate',
      emoji: '🏆',
      blurb: 'A confident, well-rounded companion.',
      skills: [
        { id: 'cat-leash', title: 'Harness & leash walk', tip: 'Indoors first; let the cat lead, reward each step.' },
        { id: 'cat-vet-calm', title: 'Calm at the vet', tip: 'Practice mock exams at home: ears, paws, mouth, treat.' },
        { id: 'cat-alone', title: 'Happy home alone', tip: 'Puzzle feeders and a sunny perch make solo time good.' },
      ],
    },
  ],
}

const DOG_SYLLABUS: Syllabus = {
  id: 'dog-foundations-v1',
  species: 'dog',
  title: 'Puppy → Graduate',
  levels: [
    {
      id: 'dog-l1',
      title: 'Puppy Preschool',
      emoji: '🍼',
      blurb: 'House manners and the very first cues.',
      skills: [
        { id: 'dog-potty', title: 'House-trained', tip: 'Take out after sleep, play and meals; reward outdoors immediately.' },
        { id: 'dog-name', title: 'Responds to name', tip: 'Name → treat, many reps a day.' },
        { id: 'dog-sit', title: 'Sit', tip: 'Lure up and back; mark and treat the sit.' },
        { id: 'dog-crate', title: 'Loves the crate', tip: 'Feed meals in the crate; never use it as punishment.' },
      ],
    },
    {
      id: 'dog-l2',
      title: 'Manners Class',
      emoji: '🐕',
      blurb: 'Polite behaviour around people and dogs.',
      skills: [
        { id: 'dog-down', title: 'Down', tip: 'Lure from sit to the floor; reward.' },
        { id: 'dog-stay', title: 'Short stay', tip: 'Build duration in seconds before adding distance.' },
        { id: 'dog-leash', title: 'Loose-leash walking', tip: 'Stop when the leash tightens; reward at your side.' },
        { id: 'dog-social', title: 'Friendly greetings', tip: 'Reward four-on-the-floor; turn away from jumping.' },
      ],
    },
    {
      id: 'dog-l3',
      title: 'Trick Scholar',
      emoji: '🎓',
      blurb: 'Reliable recall and crowd-pleasing tricks.',
      skills: [
        { id: 'dog-recall', title: 'Rock-solid recall', tip: 'Make coming back the best thing that ever happens — jackpot treats.' },
        { id: 'dog-shake', title: 'Shake / paw', tip: 'Reward a paw lift, add the cue.' },
        { id: 'dog-leaveit', title: 'Leave it', tip: 'Cover a treat; reward the moment they back off.' },
        { id: 'dog-spin', title: 'Spin', tip: 'Lure a circle with a treat; name it once fluent.' },
      ],
    },
    {
      id: 'dog-l4',
      title: 'Graduate',
      emoji: '🏆',
      blurb: 'A dependable, well-mannered best friend.',
      skills: [
        { id: 'dog-stay-long', title: 'Stay with distractions', tip: 'Proof against people, toys and distance.' },
        { id: 'dog-vet-calm', title: 'Calm at the vet/groomer', tip: 'Practice handling: paws, ears, mouth, reward.' },
        { id: 'dog-place', title: 'Settle on a mat', tip: 'Reward relaxed down on a mat while life happens.' },
      ],
    },
  ],
}

// Generic fallback for species without a dedicated track.
function genericSyllabus(species: Species): Syllabus {
  return {
    id: `generic-foundations-v1`,
    species,
    title: 'Foundations → Graduate',
    levels: [
      {
        id: 'gen-l1',
        title: 'Settling In',
        emoji: '🏡',
        blurb: 'Trust, routine and a safe space.',
        skills: [
          { id: 'gen-trust', title: 'Comfortable & trusting', tip: 'Calm daily routine; let them approach you.' },
          { id: 'gen-feed', title: 'Eats well on schedule', tip: 'Same times, same spot.' },
          { id: 'gen-handling', title: 'Tolerates gentle handling', tip: 'Brief touches paired with a treat.' },
        ],
      },
      {
        id: 'gen-l2',
        title: 'Confident Companion',
        emoji: '🌟',
        blurb: 'Bonded, curious and easy to care for.',
        skills: [
          { id: 'gen-name', title: 'Recognises you / its name', tip: 'Consistent cue + reward.' },
          { id: 'gen-vet', title: 'Calm for health checks', tip: 'Mock exams at home with rewards.' },
          { id: 'gen-enrich', title: 'Enjoys enrichment', tip: 'Foraging, toys and exploration.' },
        ],
      },
    ],
  }
}

export const SYLLABI: Syllabus[] = [CAT_SYLLABUS, DOG_SYLLABUS]

export function defaultSyllabusFor(species: Species): Syllabus {
  return SYLLABI.find((s) => s.species === species) ?? genericSyllabus(species)
}

export function syllabusById(id: string, species: Species): Syllabus {
  return SYLLABI.find((s) => s.id === id) ?? defaultSyllabusFor(species)
}

export function allSkillIds(s: Syllabus): string[] {
  return s.levels.flatMap((l) => l.skills.map((sk) => sk.id))
}
