import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {LocalStorageService} from "./local-storage.service";
import {add, getHours, isWithinInterval, startOfToday, startOfTomorrow, startOfYesterday, sub} from "date-fns";

let ACTIVITY_DATA_KEY = 'ACTIVITY';
let HIDDEN_ACTIVITY_KEY = 'HIDDEN_ACTIVITY_KEY';
let AR_DATA_KEY = 'ACTIVITY_RECORD';

export const EXTRA_HOURS_IN_DAY = 5; // Новый день начинается в 5 утра.

export function getDateNormalizedToHumanCycle(timestamp: number) {
  return sub(timestamp, {hours: EXTRA_HOURS_IN_DAY});
}

export function shouldScoreToday(timestamp: number) {
  let isInsideStrangeInterval = getHours(Date.now()) < EXTRA_HOURS_IN_DAY;
  let startIntervalDate, endIntervalDate;

  if (isInsideStrangeInterval) {
    startIntervalDate = add(startOfYesterday(), {
      hours: EXTRA_HOURS_IN_DAY
    });

    endIntervalDate = add(startOfToday(), {
      hours: EXTRA_HOURS_IN_DAY
    });
  } else {
    startIntervalDate = add(startOfToday(), {
      hours: EXTRA_HOURS_IN_DAY
    });

    endIntervalDate = add(startOfTomorrow(), {
      hours: EXTRA_HOURS_IN_DAY
    });
  }


  return isWithinInterval(
    timestamp,
    {
      start: startIntervalDate,
      end: endIntervalDate
    }
  )
}

export interface ISubtask {
  name: string;
  points: number;
  isFinished: boolean;
}

export interface IActivity {
  id?: number;
  tag?: string; // тоже самое, что name в ITag
  name: string;
  points: number;
  isOneTime: boolean;
  subtasks?: ISubtask[]
}

export interface IActivityRecord {
  timestamp: number;
  activityName: string;
  points: number;
}

export interface IRawStorage {
  activities: string;
  activityRecords: string;
  hiddenActivities: string;
}

@Injectable({
  providedIn: 'root'
})
export class ActivitiesService {
  activities: IActivity[] = [];
  activities$ = new BehaviorSubject<IActivity[]>([]);

  activityRecords: IActivityRecord [] = [];
  activityRecords$ = new BehaviorSubject<IActivityRecord[]>([])

  hiddenActivities: IActivity [] = [];
  hiddenActivities$ = new BehaviorSubject<IActivity[]>([])

  constructor(
    private localStorageService: LocalStorageService
  ) {
    this.init();
  }

  init() {
    this.activities = this.localStorageService.getData(ACTIVITY_DATA_KEY) || [];
    this.activities$.next(this.activities);

    this.activityRecords = this.localStorageService.getData(AR_DATA_KEY) || [];
    this.activityRecords$.next(this.activityRecords);

    this.hiddenActivities = this.localStorageService.getData(HIDDEN_ACTIVITY_KEY) || [];
    this.hiddenActivities$.next(this.hiddenActivities);
  }

  getActivities(): Observable<IActivity[]> {
    return this.activities$.asObservable();
  }

  getHiddenActivities(): Observable<IActivity[]> {
    return this.hiddenActivities$.asObservable();
  }

  getActivityRecords(): Observable<IActivityRecord[]> {
    return this.activityRecords$.asObservable();
  }

  addActivity(activityToAdd: IActivity) {
    this.activities = [...this.activities, activityToAdd];
    this.localStorageService.saveData(ACTIVITY_DATA_KEY, this.activities)
    this.activities$.next(this.activities);
  }

  deleteActivity(activity: IActivity) {
    this.activities = this.activities.filter(a => a.name !== activity.name);
    this.localStorageService.saveData(ACTIVITY_DATA_KEY, this.activities)
    this.activities$.next(this.activities);
  }

  deleteHiddenActivity(activity: IActivity) {
    this.hiddenActivities = this.hiddenActivities.filter(a => a.name !== activity.name);
    this.localStorageService.saveData(HIDDEN_ACTIVITY_KEY, this.hiddenActivities)
    this.hiddenActivities$.next(this.hiddenActivities);
  }

  scoreActivity(activity: IActivity | ISubtask) {
    let activityRecord = {
      timestamp: Date.now(),
      points: activity.points,
      activityName: activity.name
    };

    this.activityRecords = [activityRecord, ...this.activityRecords];
    this.localStorageService.saveData(AR_DATA_KEY, this.activityRecords)
    this.activityRecords$.next(this.activityRecords);

    if ((activity as IActivity).isOneTime) {
      this.deleteActivity(activity as IActivity);
    }
  }

  getActivity(name: string) {
    return this.activities.filter(a => a.name === name)[0];
  }

  updateActivity(activityName: string, activity: IActivity) {
    let activityIndex = this.activities.findIndex(a => a.name === activityName);
    this.activities.splice(activityIndex, 1);
    this.activities.splice(activityIndex, 0, activity);
    this.activities = [...this.activities];
    this.localStorageService.saveData(ACTIVITY_DATA_KEY, this.activities)
    this.activities$.next(this.activities);
  }

  cancelLastScoring(activity: IActivity | ISubtask) {
    // TODO не возвращается назад одноразовая активность
    let activityIndex = this.activityRecords.findIndex(ar => ar.activityName === activity.name);
    this.activityRecords.splice(activityIndex, 1);
    this.activityRecords = [...this.activityRecords];
    this.localStorageService.saveData(AR_DATA_KEY, this.activityRecords)
    this.activityRecords$.next(this.activityRecords);
  }

  clearTodayScorings() {
    this.activityRecords = this.activityRecords.filter(ar => !shouldScoreToday(ar.timestamp));
    this.localStorageService.saveData(AR_DATA_KEY, this.activityRecords);
    this.activityRecords$.next(this.activityRecords);
  }

  getRawData(): IRawStorage {
    let activities = this.localStorageService.getRawData(ACTIVITY_DATA_KEY) || '[]';
    let hiddenActivities = this.localStorageService.getRawData(HIDDEN_ACTIVITY_KEY) || '[]';
    let activityRecords = this.localStorageService.getRawData(AR_DATA_KEY) || '[]';

    return {
      activities,
      activityRecords,
      hiddenActivities
    };
  }

  saveRawData(data: IRawStorage) {
    let {activities, activityRecords, hiddenActivities} = data;
    this.localStorageService.saveData(ACTIVITY_DATA_KEY, JSON.parse(activities));
    this.localStorageService.saveData(AR_DATA_KEY, JSON.parse(activityRecords));
    this.localStorageService.saveData(HIDDEN_ACTIVITY_KEY, JSON.parse(hiddenActivities));
    this.init();
  }

  hideActivity(activity: IActivity) {
    this.activities = this.activities.filter(a => a.name !== activity.name);
    this.localStorageService.saveData(ACTIVITY_DATA_KEY, this.activities)
    this.activities$.next(this.activities);
    this.hiddenActivities = [activity, ...this.hiddenActivities];
    this.hiddenActivities$.next(this.hiddenActivities);
    this.localStorageService.saveData(HIDDEN_ACTIVITY_KEY, this.hiddenActivities);
  }

  restoreActivity(activity: IActivity) {
    this.hiddenActivities = this.hiddenActivities.filter(a => a.name !== activity.name);
    this.localStorageService.saveData(HIDDEN_ACTIVITY_KEY, this.hiddenActivities);
    this.hiddenActivities$.next(this.hiddenActivities);
    this.activities = [activity, ...this.activities];
    this.activities$.next(this.activities);
    this.localStorageService.saveData(ACTIVITY_DATA_KEY, this.activities)
  }
}
