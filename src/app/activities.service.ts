import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {LocalStorageService} from "./local-storage.service";
import {add, getHours, isWithinInterval, startOfToday, startOfTomorrow, startOfYesterday, sub} from "date-fns";

let ACTIVITY_DATA_KEY = 'ACTIVITY';
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

@Injectable({
  providedIn: 'root'
})
export class ActivitiesService {
  activities: IActivity[] = [];
  activities$ = new BehaviorSubject<IActivity[]>([]);

  activityRecords: IActivityRecord [] = [];
  activityRecords$ = new BehaviorSubject<IActivityRecord[]>([])

  constructor(
    private localStorageService: LocalStorageService
  ) {
    this.activities = localStorageService.getData(ACTIVITY_DATA_KEY) || [];
    this.activities$.next(this.activities);

    this.activityRecords = localStorageService.getData(AR_DATA_KEY) || [];
    this.activityRecords$.next(this.activityRecords);
  }

  getActivities(): Observable<IActivity[]> {
    return this.activities$.asObservable();
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
}
