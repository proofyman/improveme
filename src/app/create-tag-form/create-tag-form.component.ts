import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ITag, TagColor, TagsService} from "../tags.service";
import {RoutingService} from "../routing.service";
import {ActivatedRoute} from "@angular/router";
import {takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";
import {ActivitiesService, IActivity} from "../activities.service";

const colors = [
  {
    name: 'Фиолетовый',
    id: TagColor.PURPLE
  },
  {
    name: 'Красный',
    id: TagColor.RED
  },
  {
    name: 'Синий',
    id: TagColor.BLUE
  },
  {
    name: 'Голубой',
    id: TagColor.LIGHT_BLUE
  },
  {
    name: 'Оранжевый',
    id: TagColor.ORANGE
  },
  {
    name: 'Зеленый',
    id: TagColor.GREEN
  }
]


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
  colors = colors;

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
      name: ['', [Validators.required, Validators.minLength(3)]],
      color: ['Фиолетовый', []]
    });

    this.activatedRoute.params
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        if (params.name) {
          this.isEditMode = true;
          this.tag = this.tagsService.getTag(params.name);
          this.editedTagOldName = this.tag.name;
          this.form.patchValue({
            ...this.tag,
            color: colors.find(c => c.id === this.tag.color)?.name ?? 'Фиолетовый'
          });
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
    let tag = this.form.value;
    let tagColor = colors.find(c => c.name === this.form.get('color')?.value);
    let colorId = tagColor?.id ?? TagColor.PURPLE;
    tag.color = colorId;

    if (this.isEditMode) {
      this.tagsService.updateTag(this.editedTagOldName, tag);
      this.activitiesWithTag.forEach(a => {
        this.activitiesService.updateActivity(a.name, {
          ...a,
          tag: tag.name
        });
      });
    } else {
      this.tagsService.addTag(tag);
    }
    this.routingService.navigateBack();
  }
}
