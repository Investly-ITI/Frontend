import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbacksComponent } from './feedback.component';

describe('FeedbackComponent', () => {
  let component: FeedbacksComponent;
  let fixture: ComponentFixture<FeedbacksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedbacksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeedbacksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
