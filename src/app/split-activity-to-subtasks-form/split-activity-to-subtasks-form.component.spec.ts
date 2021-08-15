import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitActivityToSubtasksFormComponent } from './split-activity-to-subtasks-form.component';

describe('SplitActivityToSubtasksFormComponent', () => {
  let component: SplitActivityToSubtasksFormComponent;
  let fixture: ComponentFixture<SplitActivityToSubtasksFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SplitActivityToSubtasksFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SplitActivityToSubtasksFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
