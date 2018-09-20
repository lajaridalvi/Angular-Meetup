import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrateeventComponent } from './crateevent.component';

describe('CrateeventComponent', () => {
  let component: CrateeventComponent;
  let fixture: ComponentFixture<CrateeventComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrateeventComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrateeventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
