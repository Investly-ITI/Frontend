import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendnotificationsComponent } from './sendnotifications.component';

describe('SendnotificationsComponent', () => {
  let component: SendnotificationsComponent;
  let fixture: ComponentFixture<SendnotificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SendnotificationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SendnotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
