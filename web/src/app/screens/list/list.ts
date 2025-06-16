import { Component, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { getTalks } from '../../services/calendar';
import { CardItem } from '../../components/card-item/card-item';
import { TalkType } from '../../types/talks';

const DEFAULT_STAGE = 'Todos';

@Component({
  selector: 'app-list',
  imports: [MatButtonModule, MatDividerModule, MatIconModule, MatCardModule, MatProgressSpinnerModule, CardItem],
  templateUrl: './list.html',
  styleUrl: './list.scss'
})
export default class List implements OnInit {
  selectedStage = signal<string>('Todos');
  loading = signal<boolean>(false);
  error = signal<string>('');

  talks = signal<TalkType[]>([]);

  ngOnInit() {
    this.loadCalendarData();
  }

  async loadCalendarData() {
    this.loading.set(true);
    this.error.set('');

    try {
      const { talks } = await getTalks();

      this.talks.set(talks);
    } catch (error) {
      console.error('Failed to load calendar data:', error);
      this.error.set('Failed to load calendar events. Using sample data.');
    } finally {
      this.loading.set(false);
    }
  }

  refreshEvents() {
    this.loadCalendarData();
  }

  stages = computed(() => {
    const talks = this.talks();
    return talks.reduce<string[]>((acc, talk) => {
      if (talk.stage && !acc.includes(talk.stage)) {
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
    return selected === DEFAULT_STAGE ? 'Palestras' : `Palestras no ${selected}`;
  });
}
