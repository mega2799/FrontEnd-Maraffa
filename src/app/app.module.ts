import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
// import { SocketIoModule, SocketIoConfig } from "ngx-socket-io";
// import { AppComponent } from './app.component';
// import { CoreModule } from './core/core.module';
// import { SharedModule } from './shared/shared.module';
// import { CustomMaterialModule } from './custom-material/custom-material.module';
// import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from "@angular/common/http";
import { LoggerModule } from 'ngx-logger';
import { environment } from '../environments/environment';
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { CoreModule } from "./core/core.module";
import { CustomMaterialModule } from "./custom-material/custom-material.module";
import { SharedModule } from "./shared/shared.module";

// const config: SocketIoConfig = { url: "http://localhost:4444", options: {} };
@NgModule({
  declarations: [AppComponent],
  imports: [
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    CoreModule,
    SharedModule,
    // NgApexchartsModule,
    CustomMaterialModule.forRoot(),
    AppRoutingModule,
    LoggerModule.forRoot({
      serverLoggingUrl: `http://my-api/logs`,
      level: environment.logLevel,
      serverLogLevel: environment.serverLogLevel,
    }),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
