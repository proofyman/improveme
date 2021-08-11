import { Component, OnInit } from '@angular/core';
import {ActivitiesService} from "../activities.service";
import {RoutingService} from "../routing.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute} from "@angular/router";
import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";

@Component({
  selector: 'app-create-activity-short-form',
  templateUrl: './create-activity-short-form.component.html',
  styleUrls: ['./create-activity-short-form.component.scss']
})
export class CreateActivityShortFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  editedActivityOldName = '';
  destroy$ = new Subject<void>();

  constructor(
    private activitiesService: ActivitiesService,
    private routingService: RoutingService,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute
  ) { }

  get saveBtnText() {
    return this.isEditMode ? 'Сохранить' : 'Добавить!';
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      points: [null, Validators.required],
      isOneTime: false
    });

    this.activatedRoute.params
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
      if (params.name) {
        this.isEditMode = true;
        let activity = this.activitiesService.getActivity(params.name);
        this.editedActivityOldName = activity.name;
        this.form.patchValue(activity);
      }
    });
  }

  addActivity() {
    if (this.form.invalid) return;
    if (this.isEditMode) {
      this.activitiesService.updateActivity(this.editedActivityOldName, this.form.value);
    } else {
      this.activitiesService.addActivity(this.form.value);
    }
    this.routingService.navigateBack();
  }

  back() {
    this.routingService.navigateBack();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
