import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypingBoxComponent } from './typing-box.component';

describe('TypingBoxComponent', () => {
  let component: TypingBoxComponent;
  let fixture: ComponentFixture<TypingBoxComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TypingBoxComponent]
    });
    fixture = TestBed.createComponent(TypingBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
