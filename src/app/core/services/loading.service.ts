import { Injectable } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private _count = 0;
  private _subject = new BehaviorSubject<boolean>(false);
  readonly isLoading$ = this._subject.asObservable();

  constructor(router: Router) {
    router.events.subscribe(event => {
      if (event instanceof NavigationStart)  this.show();
      if (event instanceof NavigationEnd ||
          event instanceof NavigationError ||
          event instanceof NavigationCancel) this.hide();
    });
  }

  show(): void {
    this._count++;
    this._subject.next(true);
  }

  hide(): void {
    this._count = Math.max(0, this._count - 1);
    if (this._count === 0) this._subject.next(false);
  }
}
