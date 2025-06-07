import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AppMode } from 'src/app/shared/services/app-mode.service';

@Component({
  selector: 'app-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss']
})
export class SidebarMenuComponent {
  @Input() currentAppMode!: string;
  @Output() modeChange = new EventEmitter<AppMode>();

  changeMode(mode: AppMode) {
    this.modeChange.emit(mode);
  }
}
