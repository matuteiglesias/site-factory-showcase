'use client';

import { useEffect, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import type { Template } from '@/contracts/template';
import { trackAnalyticsEvent } from '@/lib/analytics/events';
import TemplateCard from './TemplateCard';

const filters = [
  { id: 'psychology', label: 'Psicología' },
  { id: 'health', label: 'Salud' },
  { id: 'education', label: 'Educación' },
  { id: 'consulting', label: 'Consultoría' },
  { id: 'landing', label: 'Landing' },
  { id: 'institutional', label: 'Institucional' },
  { id: 'agenda', label: 'Agenda' },
  { id: 'cursos', label: 'Cursos' },
];

function templateMatchesFilter(template: Template, filter: string) {
  const values = new Set<string>([
    template.format,
    ...template.audience,
    ...template.tags,
    ...template.stack,
  ]);

  return values.has(filter);
}

function templateMatchesSearch(template: Template, query: string) {
  if (!query.trim()) return true;

  const q = query.toLowerCase();

  return [
    template.title,
    template.shortDescription,
    template.longDescription,
    template.format,
    template.audience.join(' '),
    template.tags.join(' '),
    template.bestFor,
    template.primaryGoal,
    template.complexity,
    template.recommendedFor.join(' '),
    template.notIdealFor.join(' '),
  ]
    .join(' ')
    .toLowerCase()
    .includes(q);
}

export default function TemplateExplorer({ templates }: { templates: Template[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const query = searchParams.get('q') ?? '';
  const selectedFilters = searchParams.getAll('filter');

  useEffect(() => {
    trackAnalyticsEvent({
      name: 'template_list_viewed',
      payload: { templateCount: templates.length },
    });
  }, [templates.length]);

  function replaceParams(next: URLSearchParams) {
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function setQuery(value: string) {
    const next = new URLSearchParams(searchParams.toString());

    if (value) next.set('q', value);
    else next.delete('q');

    trackAnalyticsEvent({
      name: 'template_filter_used',
      payload: { filterType: 'search', hasQuery: Boolean(value) },
    });

    replaceParams(next);
  }

  function toggleFilter(filter: string) {
    const next = new URLSearchParams(searchParams.toString());
    const current = next.getAll('filter');

    next.delete('filter');

    const updated = current.includes(filter)
      ? current.filter((item) => item !== filter)
      : [...current, filter];

    updated.forEach((item) => next.append('filter', item));

    trackAnalyticsEvent({
      name: 'template_filter_used',
      payload: { filterType: 'facet', filter, active: !current.includes(filter) },
    });

    replaceParams(next);
  }

  function clearAll() {
    replaceParams(new URLSearchParams());
  }

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const searchOk = templateMatchesSearch(template, query);
      const filtersOk =
        selectedFilters.length === 0 ||
        selectedFilters.every((filter) => templateMatchesFilter(template, filter));

      return searchOk && filtersOk;
    });
  }, [templates, query, selectedFilters]);

  return (
    <>
      <div className="mb-8">
        <input
          className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none shadow-sm focus:border-black"
          placeholder="Buscar por rubro, objetivo o tipo de sitio..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className="grid gap-8 md:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="h-fit rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm md:sticky md:top-24">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Filtros</h2>
            {selectedFilters.length > 0 || query ? (
              <button
                className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:border-black"
                type="button"
                onClick={clearAll}
              >
                Limpiar
              </button>
            ) : null}
          </div>

          <div className="grid gap-2">
            {filters.map((filter) => {
              const active = selectedFilters.includes(filter.id);

              return (
                <button
                  className={
                    active
                      ? 'flex h-9 items-center justify-between rounded-lg bg-black px-3 text-sm text-white'
                      : 'flex h-9 items-center justify-between rounded-lg bg-neutral-100 px-3 text-sm text-neutral-600 hover:bg-neutral-200'
                  }
                  key={filter.id}
                  type="button"
                  onClick={() => toggleFilter(filter.id)}
                >
                  <span>{filter.label}</span>
                  <span>{active ? '✓' : ''}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <section>
          <div className="mb-4 text-sm text-neutral-500">
            {filteredTemplates.length} template
            {filteredTemplates.length === 1 ? '' : 's'} encontrado
            {filteredTemplates.length === 1 ? '' : 's'}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {filteredTemplates.map((template) => (
              <TemplateCard key={template.slug} template={template} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
