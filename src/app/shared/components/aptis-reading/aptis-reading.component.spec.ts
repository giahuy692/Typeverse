import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AptisReadingComponent } from './aptis-reading.component';

describe('AptisReadingComponent', () => {
  let component: AptisReadingComponent;
  let fixture: ComponentFixture<AptisReadingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AptisReadingComponent]
    });
    fixture = TestBed.createComponent(AptisReadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
