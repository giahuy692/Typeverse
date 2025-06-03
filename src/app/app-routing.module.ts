import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// LayoutComponent không cần import ở đây nếu LayoutModule được lazy load

const routes: Routes = [
  {
    path: '', // Route gốc của ứng dụng, sẽ lazy load LayoutModule
    loadChildren: () =>
      import('./layout/layout.module').then((m) => m.LayoutModule),
  },
  // Wildcard route để bắt các URL không khớp và chuyển hướng về path gốc
  { path: '**', redirectTo: '' } 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)], // Chỉ gọi forRoot() một lần ở AppModule
  exports: [RouterModule]
})
export class AppRoutingModule {}