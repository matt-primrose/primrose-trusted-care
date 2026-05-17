import { Component, OnInit, inject, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Section } from '../../shared/section/section';
import { ContentService } from '../../core/content.service';
import { MetaService } from '../../core/meta.service';
import { Founder } from '../../core/models/founder';

@Component({
  selector: 'app-about',
  imports: [Section],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About implements OnInit {
  private content = inject(ContentService);
  private meta = inject(MetaService);
  private sanitizer = inject(DomSanitizer);

  protected readonly founders = signal<Founder[]>([]);
  protected readonly missionHtml = signal<SafeHtml>('');

  async ngOnInit(): Promise<void> {
    this.meta.set({
      title: 'About Us',
      description: 'Meet the founders and learn about the values behind Primrose Trusted Care.',
    });

    const [foundersData, missionHtml] = await Promise.all([
      this.content.loadFounders().catch(() => ({ founders: [] })),
      this.content.loadPage('mission').catch(() => ''),
    ]);
    this.founders.set(foundersData.founders);
    this.missionHtml.set(this.sanitizer.bypassSecurityTrustHtml(missionHtml));
  }
}
