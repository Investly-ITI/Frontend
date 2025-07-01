import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestorInformationComponent } from './investor-information.component';

describe('InvestorInformationComponent', () => {
  let component: InvestorInformationComponent;
  let fixture: ComponentFixture<InvestorInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestorInformationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvestorInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
