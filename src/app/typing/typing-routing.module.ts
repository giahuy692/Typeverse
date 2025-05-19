import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from '../layout/layout.component';
import { TypingPageComponent } from './pages/typing-page/typing-page.component';

const routes: Routes = [
  {
    path: '',
    component: TypingPageComponent
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TypingRoutingModule {}
