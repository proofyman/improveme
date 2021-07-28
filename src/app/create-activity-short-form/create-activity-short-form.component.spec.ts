import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateActivityShortFormComponent } from './create-activity-short-form.component';

describe('CreateActivityShortFormComponent', () => {
  let component: CreateActivityShortFormComponent;
  let fixture: ComponentFixture<CreateActivityShortFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateActivityShortFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateActivityShortFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
