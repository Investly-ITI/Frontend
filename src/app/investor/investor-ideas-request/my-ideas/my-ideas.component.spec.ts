import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyIdeasComponent } from './my-ideas.component';

describe('MyIdeasComponent', () => {
  let component: MyIdeasComponent;
  let fixture: ComponentFixture<MyIdeasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyIdeasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyIdeasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
