// Enhanced module type with optional sub-navigation
interface EnhancedModule {
  type: string;
  group: string;
  module: string;
  sub?: Array<{
    path: string;
    text: string;
    sub?: Array<{ path: string; text: string }>;
  }>;
  hasContent?: boolean;
}

export function makeModuleDir(
  modules: Array<{ type: string; group: string; module: string }>,
  group: string,
  type: string,
) {
  return modules
    .filter((module) => module.group === group && module.type === type)
    .map(({ module }) => ({
      text: module,
      path: `/${module}`,
    }));
}

export function makeFlatModuleList(
  modules: Array<EnhancedModule>,
) {
  return modules
    .map((module) => ({
      text: module.module,
      path: `/${module.module}`,
      sub: module.sub, // Include sub-navigation if present
    }))
    .sort((a, b) => a.text.localeCompare(b.text));
}

// Create hierarchical module list grouped by type and group
export function makeHierarchicalModuleList(
  modules: Array<EnhancedModule>,
) {
  const grouped: Record<string, Record<string, EnhancedModule[]>> = {};

  modules.forEach((module) => {
    grouped[module.type][module.group].push(module);
  });

  return Object.entries(grouped).map(([type, groups]) => ({
    text: formatTypeTitle(type),
    path: `/${type}`,
    sub: Object.entries(groups).map(([group, moduleList]) => ({
      text: formatGroupTitle(group),
      path: `/${type}/${group}`,
      sub: moduleList
        .sort((a, b) => a.module.localeCompare(b.module))
        .map((module) => ({
          text: module.module,
          path: `/${module.module}`,
          sub: module.sub,
        })),
    })),
  }));
}

function formatTypeTitle(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function formatGroupTitle(group: string): string {
  return group
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}