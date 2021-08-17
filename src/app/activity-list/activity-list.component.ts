import {Component, HostBinding, HostListener, OnInit, ViewChild} from '@angular/core';
import {combineLatest, interval, Observable} from "rxjs";
import {
  ActivitiesService,
  getDateNormalizedToHumanCycle,
  IActivity,
  ISubtask,
  shouldScoreToday
} from "../activities.service";
import {ModalsService} from "../modals.service";
import {map, startWith} from "rxjs/operators";
import {every, filter, find, sortBy, uniq} from 'lodash-es';
import {ScoreNotFromListModalComponent} from "../score-not-from-list-modal/score-not-from-list-modal.component";
import {MatMenuTrigger} from "@angular/material/menu";
import {RoutingService} from "../routing.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {act} from "@ngrx/effects";

@Component({
  selector: 'app-activity-list',
  templateUrl: './activity-list.component.html',
  styleUrls: ['./activity-list.component.scss']
})
export class ActivityListComponent implements OnInit {
  @ViewChild('itemMenuTrigger', {read: MatMenuTrigger})
  trigger!: MatMenuTrigger;

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
    private modalsService: ModalsService,
    private snackbar: MatSnackBar
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

  hideActivity(activity: IActivity) {
    this.activitiesService.hideActivity(activity);
    this.snackbar.open(`Активность спрятана`, 'Отменить', {
      duration: 2000
    }).onAction().subscribe(() => {
      this.activitiesService.restoreActivity(activity);
    });
  }

  scoreActivity(activity: IActivity, subtask?: ISubtask) {
    let scorableItem = subtask || activity;
    this.activitiesService.scoreActivity(scorableItem);
    this.snackbar.open(`Засчитано "${scorableItem.name}"`, 'Отменить', {
      duration: 2000
    }).onAction().subscribe(() => {
      this.cancelLastScoring(scorableItem);

      if (!activity.isOneTime) return;

      // Восстанавливаем активность, если удаляли ее
      if (subtask === undefined || every(activity.subtasks, s => s.isFinished)) {
        if(activity.subtasks) {
          let trackedSubtask = find(activity.subtasks, s => s.name === subtask?.name);
          if (trackedSubtask) {
            trackedSubtask.isFinished = false;
          }
        }
        this.activitiesService.addActivity(activity);

        // Отжимаем назад сабтаск, если отметили его

        return;
      }

      //Просто отжимаем назад сабтаск
      if (subtask && !every(activity.subtasks, s => s.isFinished)) {
        if(activity.subtasks) {
          let trackedSubtask = find(activity.subtasks, s => s.name === subtask?.name);
          if (trackedSubtask) {
            trackedSubtask.isFinished = false;
          }
          this.activitiesService.deleteActivity(activity);
          this.activitiesService.addActivity(activity);
        }
      }
    });
  }

  cancelLastScoring(activity: IActivity | ISubtask) {
    this.activitiesService.cancelLastScoring(activity);
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
        this.scoreActivity(res)
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

  splitToSubtasks(activity: IActivity) {
    this.routingService.navigate(`activities/${activity.name}/split`);
  }

  scoreSubtask(activity: IActivity, subtask: ISubtask) {
    let index = activity.subtasks?.findIndex(s => s.name === subtask.name);
    if (index === undefined) return;

    if (activity.subtasks?.[index]) {
      activity.subtasks[index].isFinished = true;
      this.activitiesService.updateActivity(activity.name, activity);
      this.scoreActivity(activity, subtask);
    }

    if (every(activity.subtasks, s => s.isFinished)) {
      this.activitiesService.deleteActivity(activity);
    }
  }
}
