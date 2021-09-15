import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OneTimeActivitiesComponent } from './one-time-activities.component';

describe('OneTimeActivitiesComponent', () => {
  let component: OneTimeActivitiesComponent;
  let fixture: ComponentFixture<OneTimeActivitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OneTimeActivitiesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OneTimeActivitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
