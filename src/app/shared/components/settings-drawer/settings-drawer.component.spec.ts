import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsDrawerComponent } from './settings-drawer.component';

describe('SettingsDrawerComponent', () => {
  let component: SettingsDrawerComponent;
  let fixture: ComponentFixture<SettingsDrawerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SettingsDrawerComponent]
    });
    fixture = TestBed.createComponent(SettingsDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
