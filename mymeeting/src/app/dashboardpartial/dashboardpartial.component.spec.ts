import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardpartialComponent } from './dashboardpartial.component';

describe('DashboardpartialComponent', () => {
  let component: DashboardpartialComponent;
  let fixture: ComponentFixture<DashboardpartialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardpartialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardpartialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
