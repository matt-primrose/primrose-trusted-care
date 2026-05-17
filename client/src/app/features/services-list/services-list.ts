import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Section } from '../../shared/section/section';
import { Card } from '../../shared/card/card';
import { ContentService } from '../../core/content.service';
import { MetaService } from '../../core/meta.service';
import { ServiceCategory } from '../../core/models/service';

@Component({
  selector: 'app-services-list',
  imports: [RouterLink, Section, Card],
  templateUrl: './services-list.html',
  styleUrl: './services-list.scss',
})
export class ServicesList implements OnInit {
  private content = inject(ContentService);
  private meta = inject(MetaService);

  protected readonly categories = signal<ServiceCategory[]>([]);
  protected readonly loading = signal(true);

  async ngOnInit(): Promise<void> {
    this.meta.set({
      title: 'Services',
      description: 'Explore the family services offered by Primrose Trusted Care.',
    });
    try {
      const data = await this.content.loadServices();
      this.categories.set(data.categories);
    } finally {
      this.loading.set(false);
    }
  }
}
