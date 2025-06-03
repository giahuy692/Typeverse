import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeningTestComponent } from './listening-test.component';

describe('ListeningComponent', () => {
  let component: ListeningTestComponent;
  let fixture: ComponentFixture<ListeningTestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListeningTestComponent]
    });
    fixture = TestBed.createComponent(ListeningTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
