import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemovedActivitiesComponent } from './removed-activities.component';

describe('RemovedActivitiesComponent', () => {
  let component: RemovedActivitiesComponent;
  let fixture: ComponentFixture<RemovedActivitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RemovedActivitiesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RemovedActivitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
