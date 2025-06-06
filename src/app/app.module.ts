import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { CoreModule } from './core/core.module';
import { FormsModule } from '@angular/forms'; // FormsModule thường được import ở các feature module cụ thể hơn là AppModule
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from './shared/shared.module'; // SharedModule sẽ không còn khai báo ListeningComponent
import { LayoutModule } from './layout/layout.module';
import { HttpClientModule } from '@angular/common/http'; // Thêm HttpClientModule

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CoreModule,
    SharedModule,
    LayoutModule,
    FormsModule,
    BrowserAnimationsModule,
    HttpClientModule ,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}