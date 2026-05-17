import { Component, OnInit, OnDestroy, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Section } from '../../shared/section/section';
import { ContentService } from '../../core/content.service';
import { LiveEventsService } from '../../core/live-events.service';
import { MetaService } from '../../core/meta.service';
import { ServiceCategory } from '../../core/models/service';

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

@Component({
  selector: 'app-become-provider',
  imports: [ReactiveFormsModule, DecimalPipe, Section],
  templateUrl: './become-provider.html',
  styleUrl: './become-provider.scss',
})
export class BecomeProvider implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private content = inject(ContentService);
  private meta = inject(MetaService);
  private live = inject(LiveEventsService);

  protected readonly state = signal<SubmitState>('idle');
  protected readonly correlationId = signal<string | null>(null);
  protected readonly confirmed = signal(false);
  protected readonly categories = signal<ServiceCategory[]>([]);
  protected readonly files = signal<File[]>([]);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.maxLength(50)]],
    city: [''],
    interests: this.fb.nonNullable.array<string>([], Validators.required),
    experience: [''],
    references: [''],
    consentBackgroundCheck: [false, Validators.requiredTrue],
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
      title: 'Become a Provider',
      description: 'Apply to become a vetted Primrose Trusted Care provider.',
    });
    this.live.connect();
    const data = await this.content.loadServices().catch(() => ({ categories: [] }));
    this.categories.set(data.categories);
  }

  ngOnDestroy(): void {
    this.live.disconnect();
  }

  toggleInterest(id: string, checked: boolean): void {
    const arr = this.form.controls.interests;
    if (checked) {
      arr.push(this.fb.nonNullable.control(id));
    } else {
      const idx = arr.controls.findIndex((c) => c.value === id);
      if (idx >= 0) arr.removeAt(idx);
    }
  }

  onFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.files.set(input.files ? Array.from(input.files) : []);
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.state.set('submitting');
    try {
      const v = this.form.getRawValue();
      const fd = new FormData();
      fd.append('name', v.name);
      fd.append('email', v.email);
      fd.append('phone', v.phone);
      if (v.city) fd.append('city', v.city);
      for (const i of v.interests) fd.append('interests', i);
      if (v.experience) fd.append('experience', v.experience);
      if (v.references) fd.append('references', v.references);
      fd.append('consentBackgroundCheck', v.consentBackgroundCheck ? 'true' : 'false');
      if (v.honeypot) fd.append('honeypot', v.honeypot);
      for (const f of this.files()) fd.append('certs', f, f.name);

      const res = await firstValueFrom(
        this.http.post<{ ok: boolean; correlationId: string }>('/api/become-a-provider', fd),
      );
      this.correlationId.set(res.correlationId);
      this.state.set('success');
      this.form.reset();
      this.files.set([]);
    } catch {
      this.state.set('error');
    }
  }
}
