import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeningAudioComponent } from './listening-audio.component';

describe('ListeningAudioComponent', () => {
  let component: ListeningAudioComponent;
  let fixture: ComponentFixture<ListeningAudioComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListeningAudioComponent]
    });
    fixture = TestBed.createComponent(ListeningAudioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
