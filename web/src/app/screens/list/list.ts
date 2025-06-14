import { Component, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { getTalks } from '../../services/calendar';
import { CardItem } from '../../components/card-item/card-item';
import { CalendarEvent, TalkType } from '../../types/talks';

const DEFAULT_STAGE = 'All';

@Component({
  selector: 'app-list',
  imports: [MatButtonModule, MatDividerModule, MatIconModule, MatCardModule, MatProgressSpinnerModule, CardItem],
  templateUrl: './list.html',
  styleUrl: './list.scss'
})
export default class List implements OnInit {
  selectedStage = signal<string>('All');
  loading = signal<boolean>(false);
  error = signal<string>('');

  // Static fallback talks
  private staticTalks: TalkType[] = [
    { stage: 'Morro do Careca', title: 'Angular 101', speaker: 'John Doe', description: 'An introduction to Angular framework.', time: '10:00 AM', type: 'talk' },
    { stage: 'Morro do Careca', title: 'Advanced Angular', speaker: 'Jane Smith', description: 'Deep dive into Angular features.', time: '11:00 AM', type: 'talk' },
    { stage: 'Morro do Careca', title: 'Angular Testing', speaker: 'Alice Johnson', description: 'Best practices for testing Angular applications.', time: '12:00 PM', type: 'talk' },
    { stage: 'Cajueiro', title: 'Angular Performance', speaker: 'Bob Brown', description: 'Optimizing Angular applications for performance.', time: '1:00 PM', type: 'talk' },
    { stage: 'Cajueiro', title: 'Angular Security', speaker: 'Charlie White', description: 'Securing Angular applications against common threats.', time: '2:00 PM', type: 'talk' },
    { stage: 'Genipabu', title: 'Angular Deployment', speaker: 'Diana Green', description: 'Deploying Angular applications to production.', time: '3:00 PM', type: 'talk' }
  ];

  talks = signal<TalkType[]>([]);

  ngOnInit() {
    this.loadCalendarData();
  }

  async loadCalendarData() {
    this.loading.set(true);
    this.error.set('');

    try {
      const calendarData = await getTalks();
      const convertedTalks = this.convertCalendarEventsToTalks(calendarData.items);

      this.talks.set(convertedTalks);
    } catch (error) {
      console.error('Failed to load calendar data:', error);
      this.error.set('Failed to load calendar events. Using sample data.');
      this.talks.set(this.staticTalks);
    } finally {
      this.loading.set(false);
    }
  }

  private convertCalendarEventsToTalks(talks: CalendarEvent[], withAll = false): TalkType[] {
    return talks
      .map(talk => {
        return {
          stage: talk.location ?? DEFAULT_STAGE,
          title: talk.summary || 'Untitled Event',
          speaker: this.extractSpeakerFromEvent(talk),
          description: talk.description || 'No description available',
          time: this.formatEventTime(talk),
          type: this.determineEventType(talk),
          calendarEvent: talk
        };
      });
  }


  private extractSpeakerFromEvent(event: CalendarEvent): string {
    if (event.creator?.displayName) {
      return event.creator.displayName;
    }

    if (event.description) {
      const speakerMatch = event.description.match(/speaker[:\s]+([^\n]+)/i);
      if (speakerMatch) {
        return speakerMatch[1].trim();
      }
    }

    return 'TBD';
  }

  private determineEventType(event: CalendarEvent): 'talk' | 'workshop' | 'keynote' {
    const text = `${event.summary} ${event.description || ''}`.toLowerCase();

    if (text.includes('keynote')) return 'keynote';
    if (text.includes('workshop')) return 'workshop';

    return 'talk';
  }

  private formatEventTime(event: CalendarEvent): string {
    if (event.start.dateTime) {
      const startTime = new Date(event.start.dateTime);
      return startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (event.start.date) {
      return 'All Day';
    }

    return 'Time TBD';
  }

  refreshEvents() {
    this.loadCalendarData();
  }

  stages = computed(() => {
    const talks = this.talks();
    return talks.reduce<string[]>((acc, talk) => {
      if (!acc.includes(talk.stage)) {
        acc.push(talk.stage);
      }
      return acc;
    }, [DEFAULT_STAGE]);
  });

  filteredTalks = computed(() => {
    const selected = this.selectedStage();
    const talks = this.talks();
    if (selected === DEFAULT_STAGE) {
      return talks;
    }
    return talks.filter(talk => talk.stage === selected);
  });

  selectStage(stage: string) {
    this.selectedStage.set(stage);
  }

  clearSelection() {
    this.selectedStage.set(DEFAULT_STAGE);
  }

  isStageSelected(stage: string): boolean {
    return this.selectedStage() === stage;
  }

  displayTitle = computed(() => {
    const selected = this.selectedStage();
    return selected === DEFAULT_STAGE ? 'All Talks' : `Talks for ${selected}`;
  });
}
