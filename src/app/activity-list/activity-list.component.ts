import {Component, HostBinding, HostListener, OnInit, ViewChild} from '@angular/core';
import {combineLatest, interval, Observable} from "rxjs";
import {ActivitiesService, getDateNormalizedToHumanCycle, IActivity, shouldScoreToday} from "../activities.service";
import {ModalsService} from "../modals.service";
import {map, startWith} from "rxjs/operators";
import {sortBy, uniq} from 'lodash-es';
import {ScoreNotFromListModalComponent} from "../score-not-from-list-modal/score-not-from-list-modal.component";
import {MatMenuTrigger} from "@angular/material/menu";
import {RoutingService} from "../routing.service";

@Component({
  selector: 'app-activity-list',
  templateUrl: './activity-list.component.html',
  styleUrls: ['./activity-list.component.scss']
})
export class ActivityListComponent implements OnInit {
  @ViewChild('itemMenuTrigger', {read: MatMenuTrigger})
  trigger!: MatMenuTrigger;

  toEditModeText = 'Редактировать список';
  toViewModeText = 'К просмотру списка';
  contextMenuPosition = { x: '0px', y: '0px' };
  activities$!: Observable<any>;
  oneTimeActivities$!: Observable<any>;
  todayActivities$!: Observable<string[]>;
  todayArNames: string[] = [];
  isEditMode = false;
  isRegularListView = true;
  selectedTabIndex: number = 0;

  constructor(
    private activitiesService: ActivitiesService,
    private routingService: RoutingService,
    private modalsService: ModalsService
  ) {}

  ngOnInit(): void {
    this.todayActivities$ = this.activitiesService.getActivityRecords().pipe(
      map(ars => {
        let records = ars
          .slice(0, 200) // костыль, чтобы не анализировать всю историю
          .filter(ar => shouldScoreToday(ar.timestamp));
        return uniq(records.map(ar => ar.activityName))
      })
    );
    this.activities$ = combineLatest([
      this.activitiesService.getActivities().pipe(
        map(activities => activities.filter(a => !a.isOneTime))
      ),
      this.todayActivities$,
      interval(5000).pipe(startWith(0)) // просто обновляем список каждые 5 сек, это вид проверки на конец дня
    ]).pipe(
      map(([activities, todayArs]) => {
        return sortBy(activities, a => todayArs.includes(a.name))
      })
    );

    this.oneTimeActivities$ = this.activitiesService.getActivities().pipe(
      map(activities => activities.filter(a => a.isOneTime))
    );

    this.todayActivities$.subscribe(todayArNames => {
      this.todayArNames = todayArNames;
    });
  }

  @HostListener('swipe')
  changeListView() {
    this.selectedTabIndex = this.selectedTabIndex === 0 ? 1 : 0;
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

  openScoreNotFromListModal() {
    this.modalsService.open(ScoreNotFromListModalComponent)
      .then((res: IActivity) => {
        this.activitiesService.scoreActivity(res)
      })
      .catch((res: any) => {
        if (res) {
          throw 'Unknown error';
        }
      })
  }

  openContextMenu(event: any, activity: IActivity) {
    setTimeout(() => {
      window.navigator.vibrate(50)
      this.contextMenuPosition.x = Math.max(20, event.center.x - 120) + 'px';
      this.contextMenuPosition.y = event.center.y + 20 + 'px';
      this.trigger.menuData = {activity: activity};
      this.trigger.openMenu();
    }, 350);
  }

  editActivity(activity: IActivity) {
    this.routingService.navigate(`activities/${activity.name}`);
  }
}
