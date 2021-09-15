import {AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BehaviorSubject, combineLatest, interval, Observable, Subject} from "rxjs";
import {
  ActivitiesService,
  IActivity,
  ISubtask,
  shouldScoreToday
} from "../activities.service";
import {ModalsService} from "../modals.service";
import {map, startWith, takeUntil} from "rxjs/operators";
import {every, find, some, uniq} from 'lodash-es';
import {ScoreNotFromListModalComponent} from "../score-not-from-list-modal/score-not-from-list-modal.component";
import {MatMenuTrigger} from "@angular/material/menu";
import {RoutingService} from "../routing.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {PortalService} from "../portal.service";
import {CdkPortal, TemplatePortal} from "@angular/cdk/portal";
import {ITag, TagsService} from "../tags.service";
import {LocalStorageService} from "../local-storage.service";

const HIDDEN_LIST_VARIABLE_NAME = 'HIDDEN_LIST';

enum TAB_INDEXES {
  COMMON = 0,
  ONETIME = 1
}

@Component({
  selector: 'app-activity-list',
  templateUrl: './activity-list.component.html',
  styleUrls: ['./activity-list.component.scss']
})
export class ActivityListComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input()
  isOneTimeMode = false;

  @ViewChild('itemMenuTrigger', {read: MatMenuTrigger})
  trigger!: MatMenuTrigger;
  @ViewChild('tagMenuTrigger', {read: MatMenuTrigger})
  tagMenuTrigger!: MatMenuTrigger;
  @ViewChild('mainTagMenuTrigger', {read: MatMenuTrigger})
  mainTagMenuTrigger!: MatMenuTrigger;
  @ViewChild('actionsPortal', {read: CdkPortal})
  actionsPortal!: TemplatePortal;

  contextMenuPosition = { x: '0px', y: '0px' };
  activities$!: Observable<any>;
  oneTimeActivities$!: Observable<any>;
  todayActivities$!: Observable<string[]>;
  todayArNames: string[] = [];
  isEditMode = false;
  isRegularListView = true;
  tags!: ITag[];
  selectedTabIndex: number = 0;
  TAB_INDEXES = TAB_INDEXES;
  tagFilter$ = new BehaviorSubject<string>('');
  tags$!: Observable<ITag[]>;
  excludedActivities = new Set<string>();
  destroy$ = new Subject<void>();

  constructor(
    private activitiesService: ActivitiesService,
    private localStorageService: LocalStorageService,
    private routingService: RoutingService,
    private modalsService: ModalsService,
    private snackbar: MatSnackBar,
    private portalService: PortalService,
    private tagsService: TagsService
  ) {}

  ngOnInit(): void {
    this.excludedActivities = new Set(
      this.localStorageService.getData(HIDDEN_LIST_VARIABLE_NAME) || []
    );

    this.tags$ = this.tagsService.getTags();
    this.tags$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(tags => {
      this.tags = tags
    });
    this.selectedTabIndex = this.isOneTimeMode ? TAB_INDEXES.ONETIME : TAB_INDEXES.COMMON;

    this.todayActivities$ = combineLatest(
      this.activitiesService.getActivityRecords(),
      interval(1000).pipe(startWith(0)) // просто обновляем список каждую секунду, это вид проверки на конец дня
    ).pipe(
      map(([ars]) => {
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
      this.tagFilter$
    ]).pipe(
      map(([activities, todayArs, tagFilter]) => {
        let filteredActivities = activities;
        if (tagFilter !== '') {
          filteredActivities = activities.filter(a => a.tag === tagFilter);
        }

        return filteredActivities;
        // return sortBy(filteredActivities, a => todayArs.includes(a.name)); // TODO вынести  в настройки
      })
    );

    this.oneTimeActivities$ = this.activitiesService.getActivities().pipe(
      map(activities => activities.filter(a => a.isOneTime))
    );

    this.todayActivities$.subscribe(todayArNames => {
      this.todayArNames = todayArNames;
    });

  }

  ngAfterViewInit() {
    this.portalService.setActivePortal(this.actionsPortal);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.portalService.setActivePortal(null);
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

  openContextTagMenu(event: any, tag: ITag) {
    setTimeout(() => {
      window.navigator.vibrate(50)
      this.contextMenuPosition.x = Math.max(20, event.center.x - 120) + 'px';
      this.contextMenuPosition.y = event.center.y + 20 + 'px';
      this.tagMenuTrigger.menuData = {tag: tag};
      this.tagMenuTrigger.openMenu();
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

  changeTabTo(tabIndex: number) {
    this.filterActivitiesByTag(null);
    this.selectedTabIndex = tabIndex;
  }

  filterActivitiesByTag(tag: ITag | null) {
    this.selectedTabIndex = TAB_INDEXES.COMMON;
    if (!tag) {
      this.tagFilter$.next('');
      return;
    }

    this.tagFilter$.next(tag.name);
  }

  editTag(tag: ITag) {
    this.routingService.navigate(`/tags/${tag.name}`);
  }

  deleteTag(tag: ITag) {
    this.tagsService.deleteTag(tag);
    this.snackbar.open(`Удалена категория "${tag.name}"`, 'Отменить', {
      duration: 2000
    }).onAction().subscribe(() => {
      this.tagsService.addTag(tag);
    });
  }

  openContextMainTagMenu(event: any) {
    setTimeout(() => {
      window.navigator.vibrate(50)
      this.contextMenuPosition.x = Math.max(20, event.center.x - 120) + 'px';
      this.contextMenuPosition.y = event.center.y + 20 + 'px';
      this.mainTagMenuTrigger.openMenu();
    }, 350);
  }

  toggleEditMainMenuComposition() {
    this.isEditMode = true;
  }

  finishCompositionEdit() {
    this.localStorageService.saveData(HIDDEN_LIST_VARIABLE_NAME, [...this.excludedActivities])
    this.isEditMode = false;
  }

  onCheckboxClick(activity: IActivity) {
    if (this.excludedActivities.has(activity.name)) {
      this.excludedActivities.delete(activity.name)
    } else {
      this.excludedActivities.add(activity.name)
    }

  }

  isActivityCanBeHidden(activity: IActivity) {
    return this.isEditMode;
  }

  isExistActivityTag(activity: IActivity) {
    return some(this.tags, t => t.name === activity.tag)
  }

  getActivityColor(activity: IActivity) {
    return this.tagFilter$.value ? undefined : find(this.tags, t => t.name === activity.tag)?.color;
  }
}
