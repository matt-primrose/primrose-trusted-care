import { DestroyRef, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface InquiryReceivedEvent {
  correlationId: string;
  source: 'contact' | 'provider';
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class LiveEventsService {
  private platformId = inject(PLATFORM_ID);
  private destroyRef = inject(DestroyRef);
  private source?: EventSource;

  readonly lastInquiry = signal<InquiryReceivedEvent | null>(null);
  readonly connected = signal(false);

  connect(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.source) return;

    this.source = new EventSource('/api/events');
    this.source.addEventListener('open', () => this.connected.set(true));
    this.source.addEventListener('error', () => this.connected.set(false));
    this.source.addEventListener('inquiry-received', (e: MessageEvent) => {
      try {
        this.lastInquiry.set(JSON.parse(e.data) as InquiryReceivedEvent);
      } catch {
        /* malformed payload — ignore */
      }
    });

    this.destroyRef.onDestroy(() => this.disconnect());
  }

  disconnect(): void {
    this.source?.close();
    this.source = undefined;
    this.connected.set(false);
  }
}
