// src/app/layout/components/welcome/welcome.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppMode, AppModeService } from 'src/app/shared/services/app-mode.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {
  currentYear = new Date().getFullYear();

  constructor(
    private appModeService: AppModeService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.appModeService.setMode('idle');
  }

  selectMode(mode: AppMode): void {
    if (mode === 'idle') return;

    this.appModeService.setMode(mode);

    let navigationPath = '/';
    switch (mode) {
      case 'listening_test':
        navigationPath = '/listening/test'; 
        break;
      case 'listening_audio':
        navigationPath = '/listening/audio';
        break;
      case 'reading_test':
        navigationPath = '/reading/test';
        break;
      case 'speaking':
        navigationPath = '/speaking';
        break;
      case 'writing':
        navigationPath = '/writing';
        break;
    }

    this.router.navigate([navigationPath]);
  }
}