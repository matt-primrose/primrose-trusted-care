import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Section } from '../../shared/section/section';
import { ContentService } from '../../core/content.service';
import { MetaService } from '../../core/meta.service';
import { ServiceItem } from '../../core/models/service';

@Component({
  selector: 'app-service-detail',
  imports: [RouterLink, Section],
  templateUrl: './service-detail.html',
  styleUrl: './service-detail.scss',
})
export class ServiceDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private content = inject(ContentService);
  private meta = inject(MetaService);

  protected readonly service = signal<ServiceItem | null>(null);
  protected readonly notFound = signal(false);

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.notFound.set(true);
      return;
    }
    const data = await this.content.loadServices();
    for (const cat of data.categories) {
      const match = cat.services.find((s) => s.id === id);
      if (match) {
        this.service.set(match);
        this.meta.set({ title: match.name, description: match.description });
        return;
      }
    }
    this.notFound.set(true);
    this.meta.set({ title: 'Service not found' });
  }
}
