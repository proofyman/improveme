import { Component, OnInit } from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {takeUntil} from "rxjs/operators";
import {ActivitiesService, IActivity, ISubtask} from "../activities.service";
import {Subject} from "rxjs";
import {RoutingService} from "../routing.service";

@Component({
  selector: 'app-split-activity-to-subtasks-form',
  templateUrl: './split-activity-to-subtasks-form.component.html',
  styleUrls: ['./split-activity-to-subtasks-form.component.scss']
})
export class SplitActivityToSubtasksFormComponent implements OnInit {
  form!: FormArray;
  activity!: IActivity;
  destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private activitiesService: ActivitiesService,
    private routingService: RoutingService
  ) { }

  ngOnInit(): void {
    this.form = this.formBuilder.array([]);

    this.activatedRoute.params
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.activity = this.activitiesService.getActivity(params.name);
        if (this.activity.subtasks) {
          for (let task of this.activity.subtasks) {
            this.addControl(task);
          }
        } else {
          this.addControl();
          this.addControl();
        }
      });
  }

  addControl(subtask?: ISubtask) {
    this.form.push(this.formBuilder.group({
      name: [subtask?.name ?? '', [Validators.required, Validators.minLength(3)]],
      points: [subtask?.points ?? null, Validators.required],
      isFinished: [subtask?.isFinished ?? false]
    }));
  }

  navigateBack() {
    this.routingService.navigateBack();
  }

  saveChanges() {
    this.activity.subtasks = this.form.value;
    this.activitiesService.updateActivity(this.activity.name, this.activity);
    this.navigateBack();
  }

  deleteSubtask(indexToDelete: number) {
    this.form.removeAt(indexToDelete);
  }
}
