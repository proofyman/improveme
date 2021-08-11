import { Component, OnInit } from '@angular/core';
import {
  ActivitiesService,
  shouldScoreToday
} from "../activities.service";
import {combineLatest, interval, Observable} from "rxjs";
import {map, startWith} from "rxjs/operators";
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
    this.todayScore$ =
      combineLatest([
        this.activitiesService.getActivityRecords(),
        interval(5000).pipe(startWith(0))  // просто обновляем список каждые 5 сек, это вид проверки на конец дня
      ]).pipe(
      map(
        ([arList]) => {
          return arList
            .filter(ar => shouldScoreToday(ar.timestamp))
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
