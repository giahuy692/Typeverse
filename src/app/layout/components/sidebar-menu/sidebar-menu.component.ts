import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppMode } from 'src/app/shared/services/app-mode.service';

@Component({
  selector: 'app-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss']
})
export class SidebarMenuComponent implements OnInit, AfterViewInit {
  @Input() currentAppMode!: string;
  @Output() modeChange = new EventEmitter<AppMode>();

  constructor(private router: Router) {
    this.changeMode('listening_test');
  }

  ngOnInit() {
    // this.changeMode('listening_test');
  }

  ngAfterViewInit(): void {
    // Ensure the mode is set after the view initializes
    this.changeMode('listening_test');
    this.router.navigate(['/listening/test']);
  }
  changeMode(mode: AppMode) {
    this.modeChange.emit(mode);
  }

  ngOnDestroy() {
    this.changeMode('listening_test');
  }
}
