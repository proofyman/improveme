import { Component, OnInit } from '@angular/core';
import {ActivitiesService} from "../activities.service";
import {RoutingService} from "../routing.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-create-activity-short-form',
  templateUrl: './create-activity-short-form.component.html',
  styleUrls: ['./create-activity-short-form.component.scss']
})
export class CreateActivityShortFormComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private activitiesService: ActivitiesService,
    private routingService: RoutingService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      points: [null, Validators.required],
      isOneTime: false
    });
  }

  addActivity() {
    if (this.form.invalid) return;
    this.activitiesService.addActivity(this.form.value);
    this.routingService.navigateBack();
  }
}
