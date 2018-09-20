import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThisEventComponent } from './this-event.component';

describe('ThisEventComponent', () => {
  let component: ThisEventComponent;
  let fixture: ComponentFixture<ThisEventComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThisEventComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThisEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
