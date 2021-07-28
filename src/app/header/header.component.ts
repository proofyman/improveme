import { Component, OnInit } from '@angular/core';
import {ActivitiesService} from "../activities.service";
import isToday from 'date-fns/isToday';
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {RoutingService} from "../routing.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  todayScore$!: Observable<number>;

  constructor(
    private activitiesService: ActivitiesService,
    private routingService: RoutingService
  ) { }

  ngOnInit(): void {
    this.todayScore$ = this.activitiesService.getActivityRecords().pipe(
      map(
        arList => {
          return arList
            .filter(ar => isToday(ar.timestamp))
            .reduce((acc, ar) => acc + ar.points, 0)
        }
      )
    );
  }

  toMainScreen() {
    this.routingService.navigate('/');
  }

  toScoringHistory() {
    this.routingService.navigate('/scoring-history');
  }

}
