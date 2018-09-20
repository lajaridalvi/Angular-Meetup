import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetpartnerComponent } from './meetpartner.component';

describe('MeetpartnerComponent', () => {
  let component: MeetpartnerComponent;
  let fixture: ComponentFixture<MeetpartnerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeetpartnerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeetpartnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
