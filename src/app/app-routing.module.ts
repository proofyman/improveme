import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {MainPageComponent} from "./main-page/main-page.component";
import {CreateActivityShortFormComponent} from "./create-activity-short-form/create-activity-short-form.component";
import {ActivityHistoryComponent} from "./activity-history/activity-history.component";
import {SettingsPageComponent} from "./settings-page/settings-page.component";
import {SplitActivityToSubtasksFormComponent} from "./split-activity-to-subtasks-form/split-activity-to-subtasks-form.component";
import {RemovedActivitiesComponent} from "./removed-activities/removed-activities.component";

const routes: Routes = [
  {
    path: '',
    component: MainPageComponent
  },
  {
    path: 'create-activity',
    component: CreateActivityShortFormComponent
  },
  {
    path: 'activities/:name',
    component: CreateActivityShortFormComponent,
    children: [
    ]
  },
  {
    path: 'activities/:name/split',
    component: SplitActivityToSubtasksFormComponent
  },
  {
    path: 'scoring-history',
    component: ActivityHistoryComponent
  },
  {
    path: 'settings',
    component: SettingsPageComponent
  },
  {
    path: 'removed-activities',
    component: RemovedActivitiesComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
