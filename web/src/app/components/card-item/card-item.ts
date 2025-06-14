import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TalkType } from '../../types/talks';

@Component({
  selector: 'app-card-item',
  imports: [MatCardModule, MatIconModule],
  templateUrl: './card-item.html',
  styleUrl: './card-item.scss'
})
export class CardItem {
  @Input() talk!: TalkType;
}
