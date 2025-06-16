export type TalkType = {
  id: string;
  stage: string;
  title: string;
  speaker: string;
  description: string;
  start: string;
  type: 'mobile' | 'web' | 'ai' | 'cloud' | 'other';
  instagram: string;
  bio: string;
  company: string;
  end: string;
}
