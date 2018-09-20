import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventPartialComponent } from './event-partial.component';

describe('EventPartialComponent', () => {
  let component: EventPartialComponent;
  let fixture: ComponentFixture<EventPartialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventPartialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventPartialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
