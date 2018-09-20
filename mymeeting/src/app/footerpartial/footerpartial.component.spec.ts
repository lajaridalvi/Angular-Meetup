import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterpartialComponent } from './footerpartial.component';

describe('FooterpartialComponent', () => {
  let component: FooterpartialComponent;
  let fixture: ComponentFixture<FooterpartialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FooterpartialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FooterpartialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
