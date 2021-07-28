import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {LocalStorageService} from "./local-storage.service";

let ACTIVITY_DATA_KEY = 'ACTIVITY';
let AR_DATA_KEY = 'ACTIVITY_RECORD';

export interface IActivity {
  id?: number;
  name: string;
  points: number;
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

  scoreActivity(activity: IActivity) {
    let activityRecord = {
      timestamp: Date.now(),
      points: activity.points,
      activityName: activity.name
    };

    this.activityRecords = [activityRecord, ...this.activityRecords];
    this.localStorageService.saveData(AR_DATA_KEY, this.activityRecords)
    this.activityRecords$.next(this.activityRecords);
  }
}
