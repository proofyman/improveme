import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {TagsService} from "../tags.service";
import {RoutingService} from "../routing.service";

@Component({
  selector: 'app-create-tag-form',
  templateUrl: './create-tag-form.component.html',
  styleUrls: ['./create-tag-form.component.scss']
})
export class CreateTagFormComponent implements OnInit {
  form!: FormGroup;

  get saveBtnText() {
    return 'Создать!';
  }

  constructor(
    private formBuilder: FormBuilder,
    private routingService: RoutingService,
    private tagsService: TagsService
  ) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  navigateBack() {
    this.routingService.navigateBack();
  }

  addTag() {
    if (this.form.invalid) return;
    this.tagsService.addTag(this.form.value);
    this.routingService.navigateBack();
  }
}
