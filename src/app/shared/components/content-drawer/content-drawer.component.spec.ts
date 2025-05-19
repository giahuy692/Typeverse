import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentDrawerComponent } from './content-drawer.component';

describe('ContentDrawerComponent', () => {
  let component: ContentDrawerComponent;
  let fixture: ComponentFixture<ContentDrawerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ContentDrawerComponent]
    });
    fixture = TestBed.createComponent(ContentDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
