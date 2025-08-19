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
  modules: Array<{ type: string; group: string; module: string }>,
) {
  return modules
    .map(({ module }) => ({
      text: module,
      path: `/${module}`,
    }))
    .sort((a, b) => a.text.localeCompare(b.text));
}