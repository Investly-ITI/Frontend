import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessIdeasComponent } from './business-ideas.component';

describe('BusinessIdeasComponent', () => {
  let component: BusinessIdeasComponent;
  let fixture: ComponentFixture<BusinessIdeasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessIdeasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusinessIdeasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
