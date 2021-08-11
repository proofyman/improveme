import { Component, OnInit } from '@angular/core';
import {ActivitiesService} from "../activities.service";

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.scss']
})
export class SettingsPageComponent implements OnInit {

  constructor(
    private activitiesService: ActivitiesService
  ) { }

  ngOnInit(): void {
  }

  clearTodayResult() {
    this.activitiesService.clearTodayScorings();
  }
}
