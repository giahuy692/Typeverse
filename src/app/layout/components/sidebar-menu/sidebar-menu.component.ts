import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AppMode } from 'src/app/shared/services/app-mode.service';

@Component({
  selector: 'app-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss']
})
export class SidebarMenuComponent {
  @Input() currentAppMode!: string;
  @Output() modeChange = new EventEmitter<AppMode>();

  constructor(private router: Router) {}

  ngOnInit() {
    this.changeMode('listening_test');
    this.router.navigate(['/listening/test']);
  }
  changeMode(mode: AppMode) {
    this.modeChange.emit(mode);
  }
}
