import { Component, OnInit } from '@angular/core';
import {ActivitiesService, EXTRA_HOURS_IN_DAY, getDateNormalizedToHumanCycle, IActivityRecord} from "../activities.service";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {format, sub} from "date-fns";

interface IDayInfo {
  viewDate: string;
  pointsTotal: number;
  records: IViewActivityRecord[];
}

interface IViewActivityRecord {
  name: string;
  viewTime: string;
  viewDate: string;
  timestamp: number;
  points: number;
}

@Component({
  selector: 'app-activity-history',
  templateUrl: './activity-history.component.html',
  styleUrls: ['./activity-history.component.scss']
})
export class ActivityHistoryComponent implements OnInit {
  daysInfo$!: Observable<IDayInfo[]>

  constructor(
    private activitiesService: ActivitiesService
  ) { }

  ngOnInit(): void {
    this.daysInfo$ = this.activitiesService.getActivityRecords().pipe(
      map(activityRecords => {
        activityRecords = activityRecords.slice(0, 3000);
        let dayInfoObject = activityRecords
          .map(ar => {
            return {
              name: ar.activityName,
              viewTime: format(ar.timestamp, 'HH:mm'),
              viewDate: format(getDateNormalizedToHumanCycle(ar.timestamp), 'dd.MM.yyyy'),
              timestamp: ar.timestamp,
              points: ar.points
            };
          })
          .reduce((acc: any, ar) => {
            if (acc[ar.viewDate]) {
              acc[ar.viewDate].records.push(ar);
              acc[ar.viewDate].pointsTotal += ar.points;
            } else {
              acc[ar.viewDate] = {
                viewDate: ar.viewDate,
                timestamp: ar.timestamp,
                pointsTotal: ar.points,
                records: [ar]
              }
            }

            return acc;
          }, {});

        return Object.values(dayInfoObject);
      })
    )
  }
}
