import {AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BehaviorSubject, combineLatest, EMPTY, interval, Observable, of, Subject} from "rxjs";
import {
  ActivitiesService,
  IActivity,
  ISubtask,
  shouldScoreToday
} from "../activities.service";
import {ModalsService} from "../modals.service";
import {map, startWith, takeUntil} from "rxjs/operators";
import {every, find, some, sortBy, uniq} from 'lodash-es';
import {ScoreNotFromListModalComponent} from "../score-not-from-list-modal/score-not-from-list-modal.component";
import {MatMenuTrigger} from "@angular/material/menu";
import {RoutingService} from "../routing.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {PortalService} from "../portal.service";
import {CdkPortal, TemplatePortal} from "@angular/cdk/portal";
import {ITag, TagsService} from "../tags.service";
import {LocalStorageService} from "../local-storage.service";
import {CdkDragDrop} from "@angular/cdk/drag-drop";

const TAGS_SETTINGS_VARIABLE_NAME = 'TAGS_SETTINGS';

enum TAB_INDEXES {
  COMMON = 0,
  ONETIME = 1
}

interface IActivityDescription {
  isVisible: boolean;
  order: number;
}

interface ITabState {
  [key: string]: IActivityDescription
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
  multiTimeActivities$!: Observable<IActivity[]>;
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
  destroy$ = new Subject<void>();
  refreshList$ = new BehaviorSubject<void>(undefined);
  tabsState = new Map();

  constructor(
    private activitiesService: ActivitiesService,
    private localStorageService: LocalStorageService,
    private routingService: RoutingService,
    private modalsService: ModalsService,
    private snackbar: MatSnackBar,
    private portalService: PortalService,
    private tagsService: TagsService
  ) {}

  get isAnyActivityVisible() {
    return some(Object.values(this.getCurrentTabState()), desc => desc.isVisible);
  }

  ngOnInit(): void {
    this.tabsState = new Map(this.localStorageService.getData(TAGS_SETTINGS_VARIABLE_NAME) || []);
    this.multiTimeActivities$ = this.activitiesService.getActivities().pipe(
      map(activities => activities.filter(a => !a.isOneTime))
    );

    this.tags$ = this.tagsService.getTags();
    this.tags$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(tags => {
      this.tags = tags
    });
    this.selectedTabIndex = this.isOneTimeMode ? TAB_INDEXES.ONETIME : TAB_INDEXES.COMMON;

    let init$ = combineLatest(
      this.tags$,
      this.multiTimeActivities$
    )
      .pipe(takeUntil(this.destroy$));

    init$.subscribe(([tags, activities]) => {
        tags.forEach(t => {
          this.applyTabState(
            activities.filter(a => a.tag === t.name),
            t
          );
        });
        this.applyTabState(activities);
      });

    this.todayActivities$ = combineLatest(
      this.activitiesService.getActivityRecords(),
      interval(10000).pipe(startWith(0)) // ???????????? ?????????????????? ???????????? ???????????? ??????????????, ?????? ?????? ???????????????? ???? ?????????? ??????
    ).pipe(
      map(([ars]) => {
        let records = ars
          .slice(0, 200) // ??????????????, ?????????? ???? ?????????????????????????? ?????? ??????????????
          .filter(ar => shouldScoreToday(ar.timestamp));
        return uniq(records.map(ar => ar.activityName))
      })
    );
    this.activities$ = combineLatest([
      this.multiTimeActivities$,
      this.todayActivities$,
      this.tagFilter$,
      this.refreshList$,
      init$
    ]).pipe(
      map(([activities, todayArs, tagFilter]) => {
        let filteredActivities = activities;
        if (tagFilter !== '') {
          filteredActivities = activities.filter(a => a.tag === tagFilter);
        }

        return sortBy(filteredActivities, el => this.getCurrentTabState()[el.name].order);
        // return sortBy(filteredActivities, a => todayArs.includes(a.name)); // TODO ??????????????  ?? ??????????????????
      }),
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

  isEntryVisible(activity: IActivity) {
    return this.getCurrentTabState()[activity.name].isVisible;
  }

  deleteActivity(activity: IActivity) {
    this.modalsService.yesNoModal('?????????? ?????????????? ?')
      .then(() => {
        this.activitiesService.deleteActivity(activity);
      })
      .catch(); // ?????????????? ???????????? "NO"
  }

  scoreActivity(activity: IActivity, subtask?: ISubtask) {
    let scorableItem = subtask || activity;
    this.activitiesService.scoreActivity(scorableItem);
    this.snackbar.open(`?????????????????? "${scorableItem.name}"`, '????????????????', {
      duration: 2000
    }).onAction().subscribe(() => {
      this.cancelLastScoring(scorableItem);

      if (!activity.isOneTime) return;

      // ?????????????????????????????? ????????????????????, ???????? ?????????????? ????
      if (subtask === undefined || every(activity.subtasks, s => s.isFinished)) {
        if(activity.subtasks) {
          let trackedSubtask = find(activity.subtasks, s => s.name === subtask?.name);
          if (trackedSubtask) {
            trackedSubtask.isFinished = false;
          }
        }
        this.activitiesService.addActivity(activity);

        // ???????????????? ?????????? ??????????????, ???????? ???????????????? ??????

        return;
      }

      //???????????? ???????????????? ?????????? ??????????????
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
    this.snackbar.open(`?????????????? ?????????????????? "${tag.name}"`, '????????????????', {
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

  toggleEditMainMenuComposition(tagName: string | null = null) {
    let tag = this.tags.find(t => t.name === tagName) || null;

    this.filterActivitiesByTag(tag);
    this.isEditMode = true;
  }

  finishCompositionEdit() {
    this.localStorageService.saveData(TAGS_SETTINGS_VARIABLE_NAME, [...this.tabsState.entries()]);
    this.isEditMode = false;
  }

  onCheckboxClick(activity: IActivity) {
    this.getCurrentTabState()[activity.name].isVisible = !this.getCurrentTabState()[activity.name].isVisible;

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

  dropItem($event: CdkDragDrop<any, any>) {
    let currentIndex = $event.currentIndex;
    let previousIndex = $event.previousIndex;
    let tabState = this.getCurrentTabState();
    let tabStateValues = Object.values(tabState);

    //TODO ??????????????????
    if (currentIndex > previousIndex) {
      for (let i = previousIndex + 1; currentIndex >= i; i++) {
        let tabStateEntry = find(tabStateValues, v => v.order === i);
        if (tabStateEntry) {
          tabStateEntry.order -=1;
        }
      }
    } else {
      for (let i = previousIndex - 1; currentIndex <= i; i--) {
        let tabStateEntry = find(tabStateValues, v => v.order === i);
        if (tabStateEntry) {
          tabStateEntry.order +=1;
        }
      }
    }

    tabState[$event.item.data.name] = {
      isVisible: tabState[$event.item.data.name].isVisible,
      order: $event.currentIndex
    };

    this.refreshList$.next();
  }

  getCurrentTabState(): ITabState {
    return this.tabsState.get(this.tagFilter$.value);
    //!TODO ?????? ?????????????? ???????? ?????????????????? ????????????????
  }

  applyTabState(elements: IActivity[], tag?: ITag) {
    let tagName = tag ? tag.name : '';

    let currentTabState = this.tabsState.get(tagName);
    if (!currentTabState) {
      currentTabState = {};
      this.tabsState.set(tagName, currentTabState);
      elements.forEach((el, i) => {
        currentTabState[el.name] = {
          isVisible: true,
          order: i
        }
      });
    } else {
      elements = sortBy(elements, el => currentTabState[el.name]?.order);
      elements.forEach((el, i) => {
        if (currentTabState[el.name]) {
          currentTabState[el.name].order = i;
        } else {
          currentTabState[el.name] = {
            isVisible: true,
            order: i
          };
        }
      });
    }

    return elements;
  }
}
