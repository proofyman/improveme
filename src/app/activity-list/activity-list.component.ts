import {Component, OnInit} from '@angular/core';
import {combineLatest, Observable} from "rxjs";
import {ActivitiesService, IActivity} from "../activities.service";
import {ModalsService} from "../modals.service";
import {map, tap, withLatestFrom} from "rxjs/operators";
import {sortBy, uniq} from 'lodash-es';

@Component({
  selector: 'app-activity-list',
  templateUrl: './activity-list.component.html',
  styleUrls: ['./activity-list.component.scss']
})
export class ActivityListComponent implements OnInit {
  toEditModeText = 'Редактировать список';
  toViewModeText = 'К просмотру списка';
  activities$!: Observable<any>;
  todayActivities$!: Observable<string[]>;
  todayArNames: string[] = [];
  isEditMode = false;

  constructor(
    private activitiesService: ActivitiesService,
    private modalsService: ModalsService
  ) {}

  ngOnInit(): void {
    this.todayActivities$ = this.activitiesService.getActivityRecords().pipe(
      map(ars => {
        let records = ars.slice(0, 200); // костыль, чтобы не анализировать всю историю
        return uniq(records.map(ar => ar.activityName))
      })
    );
    this.activities$ = combineLatest([
      this.activitiesService.getActivities(),
      this.todayActivities$
    ]).pipe(
      map(([activities, todayArs]) => {
        return sortBy(activities, a => todayArs.includes(a.name))
      }),
      tap(a => console.log(a))
    );

    this.todayActivities$.subscribe(todayArNames => {
      this.todayArNames = todayArNames;
    });
  }

  deleteActivity(activity: IActivity) {
    this.modalsService.yesNoModal('Точно удалить ?')
      .then(() => {
        this.activitiesService.deleteActivity(activity);
      })
      .catch(); // Нажатие кнопки "NO"
  }

  scoreActivity(activity: IActivity) {
    this.activitiesService.scoreActivity(activity);
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }

  isDoneToday(activity: IActivity) {
    return this.todayArNames.includes(activity.name);
  }

  trackByName(index: number, activity: IActivity) {
    return activity.name;
  }
}
