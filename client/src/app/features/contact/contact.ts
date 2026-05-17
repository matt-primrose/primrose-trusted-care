import { Component, OnInit, OnDestroy, effect, inject, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Section } from '../../shared/section/section';
import { ContentService } from '../../core/content.service';
import { LiveEventsService } from '../../core/live-events.service';
import { MetaService } from '../../core/meta.service';

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule, Section],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private content = inject(ContentService);
  private meta = inject(MetaService);
  private live = inject(LiveEventsService);
  private sanitizer = inject(DomSanitizer);

  protected readonly state = signal<SubmitState>('idle');
  protected readonly correlationId = signal<string | null>(null);
  protected readonly confirmed = signal(false);
  protected readonly contactHtml = signal<SafeHtml>('');

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    message: ['', [Validators.required, Validators.maxLength(5000)]],
    honeypot: [''],
  });

  constructor() {
    effect(() => {
      const ev = this.live.lastInquiry();
      if (ev && ev.correlationId === this.correlationId()) {
        this.confirmed.set(true);
      }
    });
  }

  async ngOnInit(): Promise<void> {
    this.meta.set({
      title: 'Contact Us',
      description: "Get in touch with Primrose Trusted Care — we're here to help.",
    });
    this.live.connect();
    const html = await this.content.loadPage('contact').catch(() => '');
    this.contactHtml.set(this.sanitizer.bypassSecurityTrustHtml(html));
  }

  ngOnDestroy(): void {
    this.live.disconnect();
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.state.set('submitting');
    try {
      const res = await firstValueFrom(
        this.http.post<{ ok: boolean; correlationId: string }>(
          '/api/contact',
          this.form.getRawValue(),
        ),
      );
      this.correlationId.set(res.correlationId);
      this.state.set('success');
      this.form.reset();
    } catch {
      this.state.set('error');
    }
  }
}
