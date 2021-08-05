import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreNotFromListModalComponent } from './score-not-from-list-modal.component';

describe('ScoreNotFromListModalComponent', () => {
  let component: ScoreNotFromListModalComponent;
  let fixture: ComponentFixture<ScoreNotFromListModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScoreNotFromListModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScoreNotFromListModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
