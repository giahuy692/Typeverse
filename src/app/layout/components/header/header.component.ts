import { Component, EventEmitter, Output } from '@angular/core';
import { SettingsService } from 'src/app/core/services/settings.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  @Output() onOpenSettings = new EventEmitter<void>();

  constructor(private settingsService: SettingsService) {}

  open(): void {
    this.settingsService.openDrawer();
  }
}
