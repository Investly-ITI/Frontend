import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';


export const appConfig: ApplicationConfig = {
  providers: [
      provideZoneChangeDetection({ eventCoalescing: true })
    , provideRouter(routes)
    , provideHttpClient()
    , provideAnimations()
    , provideToastr({
        timeOut: 4000,
        positionClass: 'toast-bottom-right',
        preventDuplicates: true,
        progressBar: true,
        closeButton: true,
        enableHtml: false,
        tapToDismiss: true,
        newestOnTop: true,
        maxOpened: 4,
        autoDismiss: true
      })
  ]
};
