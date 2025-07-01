import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestorNotificationsComponent } from './investor-notifications.component';

describe('InvestorNotificationsComponent', () => {
  let component: InvestorNotificationsComponent;
  let fixture: ComponentFixture<InvestorNotificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestorNotificationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvestorNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
