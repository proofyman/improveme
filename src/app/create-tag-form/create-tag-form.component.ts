import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ITag, TagsService} from "../tags.service";
import {RoutingService} from "../routing.service";
import {ActivatedRoute} from "@angular/router";
import {takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";
import {ActivitiesService, IActivity} from "../activities.service";

@Component({
  selector: 'app-create-tag-form',
  templateUrl: './create-tag-form.component.html',
  styleUrls: ['./create-tag-form.component.scss']
})
export class CreateTagFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  activitiesWithTag!: IActivity[];
  editedTagOldName = '';
  tag!: ITag;
  destroy$ = new Subject<void>();

  get saveBtnText() {
    return this.isEditMode ? 'Сохранить' : 'Добавить!';
  }

  constructor(
    private formBuilder: FormBuilder,
    private routingService: RoutingService,
    private tagsService: TagsService,
    private activitiesService: ActivitiesService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]]
    });

    this.activatedRoute.params
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        if (params.name) {
          this.isEditMode = true;
          this.tag = this.tagsService.getTag(params.name);
          this.editedTagOldName = this.tag.name;
          this.form.patchValue(this.tag);
        }
      });

    if (!this.isEditMode) return;

    this.activitiesService.getActivities().pipe(
      takeUntil(this.destroy$)
    ).subscribe(activities => {
      this.activitiesWithTag = activities.filter(a => a.tag === this.tag?.name);
    });
  }

  navigateBack() {
    this.routingService.navigateBack();
  }

  addTag() {
    if (this.form.invalid) return;
    if (this.isEditMode) {
      this.tagsService.updateTag(this.editedTagOldName, this.form.value);
      this.activitiesWithTag.forEach(a => {
        this.activitiesService.updateActivity(a.name, {
          ...a,
          tag: this.form.value.name
        });
      });
    } else {
      this.tagsService.addTag(this.form.value);
    }
    this.routingService.navigateBack();
  }
}
