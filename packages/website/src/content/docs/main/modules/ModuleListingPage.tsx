// Module search and listing page for the new flat module structure
import type { Component } from "solid-js";
import { createSignal, createMemo, For } from "solid-js";
import { clsx } from "clsx";

import modules from "./modules.json";

interface IModuleData {
  module: string;
  type: string;
  group: string;
  sub?: Array<{
    path: string;
    text: string;
    sub?: Array<{ path: string; text: string }>;
  }>;
  hasContent?: boolean;
}

interface IModuleListingPageProps {
  modules: IModuleData[];
}

export const ModuleListingPage: Component<IModuleListingPageProps> = (props) => {
  const [searchTerm, setSearchTerm] = createSignal("");
  const [selectedType, setSelectedType] = createSignal<string>("all");
  const [selectedGroup, setSelectedGroup] = createSignal<string>("all");

  // Get unique groups and types for filters
  const uniqueGroups = createMemo(() => {
    const groups = new Set(props.modules.map(m => m.group));
    return Array.from(groups).sort();
  });

  const uniqueTypes = createMemo(() => {
    const types = new Set(props.modules.map(m => m.type));
    return Array.from(types).sort();
  });

  // Filter modules based on search and filters
  const filteredModules = createMemo(() => {
    return props.modules.filter(module => {
      const matchesSearch = module.module
        .toLowerCase()
        .includes(searchTerm().toLowerCase());
      
      const matchesType = selectedType() === "all" || module.type === selectedType();
      const matchesGroup = selectedGroup() === "all" || module.group === selectedGroup();
      
      return matchesSearch && matchesType && matchesGroup;
    });
  });

  return (
    <div class="space-y-6">
      <div class="space-y-4">
        <h1 class="text-display-lg">Infrastructure Modules</h1>
        <p class="text-secondary">
          Browse and search through all available Panfactum infrastructure modules. 
          Use the filters below to find modules by type, group, or search by name.
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div class="space-y-4 bg-secondary p-4 rounded-lg">
        {/* Search Input */}
        <div class="space-y-2">
          <label for="module-search" class="block text-sm font-medium text-primary">
            Search Modules
          </label>
          <input
            id="module-search"
            type="text"
            value={searchTerm()}
            onInput={(e) => setSearchTerm(e.currentTarget.value)}
            placeholder="Type module name..."
            class="w-full px-3 py-2 bg-primary border border-primary rounded text-primary focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Filter Controls */}
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <label for="type-filter" class="block text-sm font-medium text-primary mb-1">
              Module Type
            </label>
            <select
              id="type-filter"
              value={selectedType()}
              onChange={(e) => setSelectedType(e.currentTarget.value)}
              class="w-full px-3 py-2 bg-primary border border-primary rounded text-primary focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">All Types</option>
              <For each={uniqueTypes()}>
                {(type) => (
                  <option value={type}>
                    {type === "direct" ? "Direct" : "Submodule"}
                  </option>
                )}
              </For>
            </select>
          </div>

          <div class="flex-1">
            <label for="group-filter" class="block text-sm font-medium text-primary mb-1">
              Module Group
            </label>
            <select
              id="group-filter"
              value={selectedGroup()}
              onChange={(e) => setSelectedGroup(e.currentTarget.value)}
              class="w-full px-3 py-2 bg-primary border border-primary rounded text-primary focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">All Groups</option>
              <For each={uniqueGroups()}>
                {(group) => (
                  <option value={group}>
                    {group.charAt(0).toUpperCase() + group.slice(1)}
                  </option>
                )}
              </For>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div class="text-sm text-secondary">
          Showing {filteredModules().length} of {props.modules.length} modules
        </div>
      </div>

      {/* Module Grid */}
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <For each={filteredModules()} fallback={
          <div class="col-span-full text-center py-8 text-secondary">
            No modules found matching your criteria.
          </div>
        }>
          {(module) => (
            <ModuleCard module={module} />
          )}
        </For>
      </div>
    </div>
  );
};

// Individual module card component
interface IModuleCardProps {
  module: IModuleData;
}

const ModuleCard: Component<IModuleCardProps> = (props) => {
  return (
    <a
      href={`/docs/main/modules/${props.module.module}/reference`}
      class={clsx(
        "block p-4 bg-secondary border border-primary rounded-lg",
        "hover:bg-accent hover:border-brand-500 transition-colors duration-200",
        "focus:outline-none focus:ring-2 focus:ring-brand-500"
      )}
    >
      <div class="space-y-2">
        <h3 class="font-semibold text-primary text-lg">
          {props.module.module}
        </h3>
        
        <div class="flex gap-2">
          <span class={clsx(
            "inline-block px-2 py-1 text-xs rounded",
            props.module.type === "direct" 
              ? "bg-brand-500 text-white" 
              : "bg-gray-500 text-white"
          )}>
            {props.module.type === "direct" ? "Direct" : "Submodule"}
          </span>
          
          <span class="inline-block px-2 py-1 text-xs rounded bg-tertiary text-primary">
            {props.module.group}
          </span>
        </div>
      </div>
    </a>
  );
};

// Default export for the main page
export default function ModulesPage() {
  return <ModuleListingPage modules={modules.modules} />;
}