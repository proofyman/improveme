import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {MainPageComponent} from "./main-page/main-page.component";
import {CreateActivityShortFormComponent} from "./create-activity-short-form/create-activity-short-form.component";
import {ActivityHistoryComponent} from "./activity-history/activity-history.component";
import {SettingsPageComponent} from "./settings-page/settings-page.component";
import {SplitActivityToSubtasksFormComponent} from "./split-activity-to-subtasks-form/split-activity-to-subtasks-form.component";
import {RemovedActivitiesComponent} from "./removed-activities/removed-activities.component";
import {CreateTagFormComponent} from "./create-tag-form/create-tag-form.component";

const routes: Routes = [
  {
    path: '',
    component: MainPageComponent,
    data: {
      name: 'Главная'
    }
  },
  {
    path: 'create-activity',
    component: CreateActivityShortFormComponent,
    data: {
      name: 'Добавить активность'
    }
  },
  {
    path: 'create-tag',
    component: CreateTagFormComponent,
    data: {
      name: 'Добавить категорию'
    }
  },
  {
    path: 'tags/:name',
    component: CreateTagFormComponent,
    data: {
      name: 'Редактирование'
    }
  },
  {
    path: 'activities/:name',
    component: CreateActivityShortFormComponent,
    children: [
    ],
    data: {
      name: 'Редактирование'
    }
  },
  {
    path: 'activities/:name/split',
    component: SplitActivityToSubtasksFormComponent,
    data: {
      name: 'Подзадачи'
    }
  },
  {
    path: 'scoring-history',
    component: ActivityHistoryComponent,
    data: {
      name: 'История'
    }
  },
  {
    path: 'settings',
    component: SettingsPageComponent,
    data: {
      name: 'Настройки'
    }
  },
  {
    path: 'removed-activities',
    component: RemovedActivitiesComponent,
    data: {
      name: 'Скрытые'
    }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
