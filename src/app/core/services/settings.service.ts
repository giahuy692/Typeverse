import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private _isOpen = new BehaviorSubject<boolean>(false);

  /** Observable để component lắng nghe */
  isOpen$ = this._isOpen.asObservable();

  openDrawer() {
    this._isOpen.next(true);
  }

  closeDrawer() {
    this._isOpen.next(false);
  }
}
