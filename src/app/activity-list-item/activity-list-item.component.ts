import {Component, EventEmitter, HostBinding, Input, OnInit, Output} from '@angular/core';
import {ISubtask} from "../activities.service";
import {TagColor} from "../tags.service";

@Component({
  selector: 'app-activity-list-item',
  templateUrl: './activity-list-item.component.html',
  styleUrls: ['./activity-list-item.component.scss']
})
export class ActivityListItemComponent implements OnInit {
  @Input()
  name!: string;
  @Input()
  points!: number;
  @Input()
  isEditMode!: boolean;
  @Input()
  isDoneToday = false;
  @Input()
  subtasks!: ISubtask[];
  @Input()
  isReadonly: boolean = false;
  @Input()
  isCheckboxVisible: boolean = false;
  @Input()
  isChecked!: boolean;
  @Input()
  color?: TagColor;

  @Output()
  remove = new EventEmitter<void>();
  @Output()
  score = new EventEmitter<void>();
  @Output()
  onFinishSubtask = new EventEmitter<ISubtask>();
  @Output()
  checkboxClick = new EventEmitter<void>();

  @HostBinding('class')
  get hostClass() {
    return `--${this.color}`;
  }

  get isShortForm () {
    return this.isReadonly || (this.subtasks?.length ?? 0) < 2;
  }

  constructor() { }

  ngOnInit(): void {
  }

}
