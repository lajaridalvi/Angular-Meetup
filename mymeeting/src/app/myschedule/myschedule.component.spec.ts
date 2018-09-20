import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyscheduleComponent } from './myschedule.component';

describe('MyscheduleComponent', () => {
  let component: MyscheduleComponent;
  let fixture: ComponentFixture<MyscheduleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyscheduleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyscheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
