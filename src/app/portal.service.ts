import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {TemplatePortal} from "@angular/cdk/portal";

@Injectable({
  providedIn: 'root'
})
export class PortalService {
  portal = new BehaviorSubject<TemplatePortal | null>(null);

  constructor() { }

  getActivePortal() {
    return this.portal.asObservable();
  }

  setActivePortal(portal: TemplatePortal | null) {
    this.portal.next(portal);
  }
}
