import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTagFormComponent } from './create-tag-form.component';

describe('CreateTagFormComponent', () => {
  let component: CreateTagFormComponent;
  let fixture: ComponentFixture<CreateTagFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateTagFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateTagFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
