import { Injectable } from '@angular/core';
import {
  HttpInterceptor, HttpRequest, HttpHandler,
  HttpEvent, HttpResponse, HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const start = Date.now();
    console.log(`[HTTP] → ${req.method} ${req.url}`, req.body ?? '');

    return next.handle(req).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          const ms = Date.now() - start;
          console.log(`[HTTP] ← ${event.status} ${req.method} ${req.url} (${ms}ms)`, event.body);
        }
      }),
      catchError((err: HttpErrorResponse) => {
        const ms = Date.now() - start;
        console.error(`[HTTP] ✗ ${err.status} ${req.method} ${req.url} (${ms}ms)`, err.error);
        return throwError(() => err);
      }),
    );
  }
}
