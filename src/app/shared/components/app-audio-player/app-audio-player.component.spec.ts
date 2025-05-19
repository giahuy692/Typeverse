import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppAudioPlayerComponent } from './app-audio-player.component';

describe('AppAudioPlayerComponent', () => {
  let component: AppAudioPlayerComponent;
  let fixture: ComponentFixture<AppAudioPlayerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AppAudioPlayerComponent]
    });
    fixture = TestBed.createComponent(AppAudioPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
