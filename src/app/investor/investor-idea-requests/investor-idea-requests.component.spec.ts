import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestorIdeaRequestsComponent } from './investor-idea-requests.component';

describe('InvestorIdeaRequestsComponent', () => {
  let component: InvestorIdeaRequestsComponent;
  let fixture: ComponentFixture<InvestorIdeaRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestorIdeaRequestsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvestorIdeaRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
