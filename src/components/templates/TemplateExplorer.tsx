'use client';

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import type { Template } from '@/contracts/template';
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
  if (!query.trim()) {
    return true;
  }

  const q = query.toLowerCase();

  return [
    template.title,
    template.shortDescription,
    template.longDescription,
    template.format,
    template.audience.join(' '),
    template.tags.join(' '),
  ]
    .join(' ')
    .toLowerCase()
    .includes(q);
}

export default function TemplateExplorer({
  templates,
}: {
  templates: Template[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const query = searchParams.get('q') ?? '';
  const selectedFilters = searchParams.getAll('filter');

  function replaceParams(next: URLSearchParams) {
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function setQuery(value: string) {
    const next = new URLSearchParams(searchParams.toString());

    if (value) {
      next.set('q', value);
    } else {
      next.delete('q');
    }

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
      <div className="catalog-toolbar">
        <input
          className="search-input"
          placeholder="Buscar por rubro, objetivo o tipo de sitio..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className="catalog-layout">
        <aside className="filters-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <h2>Filtros</h2>
            {selectedFilters.length > 0 || query ? (
              <button className="button" type="button" onClick={clearAll}>
                Limpiar
              </button>
            ) : null}
          </div>

          <div className="filter-list">
            {filters.map((filter) => {
              const active = selectedFilters.includes(filter.id);

              return (
                <button
                  className={`filter-button ${active ? 'is-active' : ''}`}
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
          <div className="results-meta">
            {filteredTemplates.length} template
            {filteredTemplates.length === 1 ? '' : 's'} encontrado
            {filteredTemplates.length === 1 ? '' : 's'}
          </div>

          <div className="template-grid">
            {filteredTemplates.map((template) => (
              <TemplateCard key={template.slug} template={template} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
