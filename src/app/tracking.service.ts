import { Injectable } from '@angular/core';

interface SimpleSpan {
  name: string;
  traceId: string;
  spanId: string;
  startTime: number;
  endTime?: number;
  attributes: Record<string, any>;
  status?: { code: number; message?: string };
}

@Injectable({
  providedIn: 'root'
})
export class TracingService {
  private spans: SimpleSpan[] = [];
  private currentTraceId = this.generateTraceId();

  constructor() {
    console.log('🔍 Simple tracing service initialized (no OpenTelemetry deps)');
  }

  private generateTraceId(): string {
    return Array.from({ length: 32 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  private generateSpanId(): string {
    return Array.from({ length: 16 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  // createSpan(name: string, callback: (span: any) => void) {
  //   const span: SimpleSpan = {
  //     name,
  //     traceId: this.currentTraceId,
  //     spanId: this.generateSpanId(),
  //     startTime: Date.now(),
  //     attributes: {}
  //   };

  //   console.log(`🔍 Started span: ${name} (trace: ${span.traceId.substring(0, 8)}...)`);

  //   const spanAPI = {
  //     setAttributes: (attrs: Record<string, any>) => {
  //       Object.assign(span.attributes, attrs);
  //     },
  //     setAttribute: (key: string, value: any) => {
  //       span.attributes[key] = value;
  //     },
  //     setStatus: (status: { code: number; message?: string }) => {
  //       span.status = status;
  //     },
  //     addEvent: (name: string, attributes?: Record<string, any>) => {
  //       console.log(`🔍 Event in span ${span.name}: ${name}`, attributes);
  //     },
  //     recordException: (error: any) => {
  //       console.error(`🔍 Exception in span ${span.name}:`, error);
  //       span.status = { code: 2, message: error.message };
  //     }
  //   };

  //   try {
  //     callback(spanAPI);
  //   } catch (error) {
  //     spanAPI.recordException(error);
  //     throw error;
  //   } finally {
  //     span.endTime = Date.now();
  //     this.spans.push(span);
      
  //     console.log(`🔍 Ended span: ${name} (duration: ${span.endTime - span.startTime}ms)`);
      
  //     // Invia subito a Jaeger per vedere i risultati
  //     setTimeout(() => this.exportSpans(), 100);
  //   }
  // }

  private exportSpans() {
    if (this.spans.length === 0) return;

    console.log(`🔍 Exporting ${this.spans.length} spans to Jaeger`);

    const payload = {
      resourceSpans: [{
        resource: {
          attributes: [
            { key: 'service.name', value: { stringValue: 'frontend-angular' } },
            { key: 'service.version', value: { stringValue: '1.0.0' } }
          ]
        },
        scopeSpans: [{
          spans: this.spans.map(span => ({
            traceId: span.traceId,
            spanId: span.spanId,
            name: span.name,
            kind: 1,
            startTimeUnixNano: span.startTime * 1000000,
            endTimeUnixNano: (span.endTime || span.startTime) * 1000000,
            attributes: Object.entries(span.attributes).map(([key, value]) => ({
              key,
              value: { stringValue: String(value) }
            })),
            status: span.status ? {
              code: span.status.code,
              message: span.status.message || ''
            } : undefined
          }))
        }]
      }]
    };

    // Invia a Jaeger OTLP endpoint
    fetch('/otlp/v1/traces', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    }).then(response => {
      if (response.ok) {
        console.log('✅ Spans successfully sent to Jaeger - Check UI!');
        console.log('🔍 Jaeger UI: http://localhost:16686');
        console.log('🔍 Look for service: frontend-angular');
      } else {
        console.warn('🔍 Failed to send spans to Jaeger:', response.status);
        response.text().then(text => console.warn('Response:', text));
      }
    }).catch(error => {
      console.error('🔍 Error sending spans to Jaeger:', error);
    });

    // Pulisci gli span inviati
    this.spans = [];
  }

  // Metodo per ottenere trace headers W3C compatibili con Java Agent
  getTraceHeaders(): Record<string, string> {
    // Usa il trace ID del currentTraceId (consistente per tutta la sessione)
    const traceId = this.currentTraceId;
    
    const spanId = Array.from({ length: 16 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    
    // W3C Trace Context format che Java Agent riconosce automaticamente
    const traceparent = `00-${traceId}-${spanId}-01`;
    
    return {
      'traceparent': traceparent,
      // Headers aggiuntivi per debug
      'x-trace-id': traceId,
      'x-span-id': spanId,
      // Baggage per informazioni aggiuntive (opzionale)
      'baggage': `frontend=angular,user-agent=browser`
    };
  }

  // Aggiorna createSpan per usare il trace ID consistente
  createSpan(name: string, callback: (span: any) => void) {
    const span: SimpleSpan = {
      name,
      traceId: this.currentTraceId, // Usa sempre lo stesso trace ID
      spanId: this.generateSpanId(),
      startTime: Date.now(),
      attributes: {}
    };

    console.log(`🔍 Started span: ${name} (trace: ${span.traceId.substring(0, 8)}...)`);

    const spanAPI = {
      setAttributes: (attrs: Record<string, any>) => {
        Object.assign(span.attributes, attrs);
      },
      setAttribute: (key: string, value: any) => {
        span.attributes[key] = value;
      },
      setStatus: (status: { code: number; message?: string }) => {
        span.status = status;
      },
      addEvent: (name: string, attributes?: Record<string, any>) => {
        console.log(`🔍 Event in span ${span.name}: ${name}`, attributes);
      },
      recordException: (error: any) => {
        console.error(`🔍 Exception in span ${span.name}:`, error);
        span.status = { code: 2, message: error.message };
      },
      // Aggiungi metodo per ottenere gli headers di questo span
      getTraceHeaders: () => this.getTraceHeaders()
    };

    try {
      callback(spanAPI);
    } catch (error) {
      spanAPI.recordException(error);
      throw error;
    } finally {
      span.endTime = Date.now();
      this.spans.push(span);
      
      console.log(`🔍 Ended span: ${name} (duration: ${span.endTime - span.startTime}ms)`);
      
      // Invia subito a Jaeger per vedere i risultati
      setTimeout(() => this.exportSpans(), 100);
    }
  }
}