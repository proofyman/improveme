import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivitiesService} from "../activities.service";
import {RoutingService} from "../routing.service";
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-score-not-from-list-modal',
  templateUrl: './score-not-from-list-modal.component.html',
  styleUrls: ['./score-not-from-list-modal.component.scss']
})
export class ScoreNotFromListModalComponent implements OnInit {

  form!: FormGroup;

  constructor(
    private activitiesService: ActivitiesService,
    private routingService: RoutingService,
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<ScoreNotFromListModalComponent>
  ) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      points: [null, Validators.required]
    });
  }

  addActivityRecord() {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.value);
  }

  closeModal() {
    this.dialogRef.close();
  }
}
