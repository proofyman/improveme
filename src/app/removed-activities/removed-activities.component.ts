import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivitiesService, IActivity} from "../activities.service";
import {MatMenuTrigger} from "@angular/material/menu";
import {RoutingService} from "../routing.service";
import {ModalsService} from "../modals.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import { Observable} from "rxjs";

@Component({
  selector: 'app-removed-activities',
  templateUrl: './removed-activities.component.html',
  styleUrls: ['./removed-activities.component.scss']
})
export class RemovedActivitiesComponent implements OnInit {
  @ViewChild('itemMenuTrigger', {read: MatMenuTrigger})
  trigger!: MatMenuTrigger;

  contextMenuPosition = { x: '0px', y: '0px' };
  hiddenActivities$!: Observable<IActivity[]>;

  constructor(
    private activitiesService: ActivitiesService,
    private routingService: RoutingService,
    private modalsService: ModalsService,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.hiddenActivities$ = this.activitiesService.getHiddenActivities();
  }

  openContextMenu(event: any, activity: IActivity) {
    setTimeout(() => {
      window.navigator.vibrate(50)
      this.contextMenuPosition.x = Math.max(20, event.center.x - 120) + 'px';
      this.contextMenuPosition.y = event.center.y + 20 + 'px';
      this.trigger.menuData = {activity: activity};
      this.trigger.openMenu();
    }, 350);
  }

  restoreActivity(activity: IActivity) {
    this.activitiesService.restoreActivity(activity);this.snackbar.open('Активность восстановлена', undefined, {
      duration: 2000
    });
  }

  deleteActivity(activity: IActivity) {
    this.modalsService.yesNoModal('Точно удалить ?')
      .then(() => {
        this.activitiesService.deleteHiddenActivity(activity);
      })
      .catch(); // Нажатие кнопки "NO"
  }

  trackByName(index: number, activity: IActivity) {
    return activity.name;
  }

}
