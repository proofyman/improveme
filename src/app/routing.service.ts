import { Injectable } from '@angular/core';
import {Location} from "@angular/common";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class RoutingService {

  constructor(
    private location: Location,
    private router: Router
  ) { }

  navigateBack() {
    this.location.back();
  }

  navigate(url: string) {
    this.router.navigate([url]);
  }
}
