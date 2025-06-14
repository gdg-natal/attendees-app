export type CalendarEvent = {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  location?: string;
  creator?: {
    email: string;
    displayName?: string;
  };
  status: 'confirmed' | 'tentative' | 'cancelled';
  htmlLink: string;
}

export type TalkType = {
  stage: string;
  title: string;
  speaker: string;
  description: string;
  time: string;
  type: 'talk' | 'workshop' | 'keynote';
  calendarEvent?: CalendarEvent;
}
