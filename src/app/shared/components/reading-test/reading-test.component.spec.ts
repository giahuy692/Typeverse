import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadingTestComponent } from './reading-test.component';

describe('ReadingTestComponent', () => {
  let component: ReadingTestComponent;
  let fixture: ComponentFixture<ReadingTestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReadingTestComponent]
    });
    fixture = TestBed.createComponent(ReadingTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
