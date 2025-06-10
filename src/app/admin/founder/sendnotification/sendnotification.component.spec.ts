import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendnotificationComponent } from './sendnotification.component';

describe('SendnotificationComponent', () => {
  let component: SendnotificationComponent;
  let fixture: ComponentFixture<SendnotificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SendnotificationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SendnotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
