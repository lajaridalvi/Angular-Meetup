import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderpartialComponent } from './headerpartial.component';

describe('HeaderpartialComponent', () => {
  let component: HeaderpartialComponent;
  let fixture: ComponentFixture<HeaderpartialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderpartialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderpartialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
