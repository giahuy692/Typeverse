import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./typing/typing.module').then((m) => m.TypingModule)
      }
    ]
  },

  // ❌ BỎ TẠM để tránh lỗi
  // {
  //   path: 'auth',
  //   component: AuthLayoutComponent,
  //   children: [
  //     {
  //       path: '',
  //       loadChildren: () =>
  //         import('./auth/auth.module').then((m) => m.AuthModule)
  //     }
  //   ]
  // },

  {
    path: '**',
    redirectTo: ''
  }
];



@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
