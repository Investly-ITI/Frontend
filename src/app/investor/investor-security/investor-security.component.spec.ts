import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestorSecurityComponent } from './investor-security.component';

describe('InvestorSecurityComponent', () => {
  let component: InvestorSecurityComponent;
  let fixture: ComponentFixture<InvestorSecurityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestorSecurityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvestorSecurityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
