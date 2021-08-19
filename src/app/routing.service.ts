import { Injectable } from '@angular/core';
import {Location} from "@angular/common";
import {ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Router} from "@angular/router";
import {Observable} from "rxjs";
import {filter, map, share, switchMap} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class RoutingService {
  data$!: Observable<any>;

  constructor(
    private location: Location,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) { }

  navigateBack() {
    this.location.back();
  }

  navigate(url: string) {
    this.router.navigate([url]);
  }

  getDataObservable(): Observable<any> {
    return this.router.events.pipe(
      filter(ev => ev instanceof NavigationEnd),
      map(() => {
        return getDataFromSnapshot(this.activatedRoute.snapshot.root)
      }),
      share()
    )
  }
}


function getDataFromSnapshot(snapshot: ActivatedRouteSnapshot): any {
  if (snapshot.firstChild) {
    return {
      ...snapshot.data,
      ...getDataFromSnapshot(snapshot.firstChild)
    }
  }

  return snapshot.data;
}
