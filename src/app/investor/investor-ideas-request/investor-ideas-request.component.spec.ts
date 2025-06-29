import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestorIdeasRequestComponent } from './investor-ideas-request.component';

describe('InvestorIdeasRequestComponent', () => {
  let component: InvestorIdeasRequestComponent;
  let fixture: ComponentFixture<InvestorIdeasRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestorIdeasRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvestorIdeasRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
