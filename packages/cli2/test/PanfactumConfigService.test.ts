import { test, expect } from 'bun:test'
import { FileSystemService } from '../src/services/FileSystemService'
import { PanfactumConfigService } from '../src/services/PanfactumConfigService'
import { Effect, Layer, ManagedRuntime, pipe } from 'effect';

test("Test reading the default config", () => {

    const FileSystemServiceTest = new FileSystemService({
        readFile: (path: string) => Effect.succeed(""),
        listFiles: (path: string) => Effect.succeed(["production", "staging", "development"]),
        parseYaml: (path: string) => Effect.succeed({
            repo_name: "stack",
            repo_url: "https://github.com/Panfactum/stack",
            repo_primary_branch: "main",
            environments_dir: "environments",
            iac_dir: "packages/infrastrucutre",
            aws_dir: ".aws",
            kube_dir: ".kube",
            ssh_dir: ".ssh",
            buildkit_dir: ".buildkit",
            nats_dir: ".nat",
        }),
        getRepoRoot: () => Effect.succeed("/home/jack/panfactum")
    })

    const program = Effect.gen(function* () {
        const panfactumConfigService = yield* PanfactumConfigService
        const panfactumConfig = yield* panfactumConfigService.bootstrapPanfactumConfig
        expect(panfactumConfig).toMatchSnapshot();
    })
    const result = pipe(program, Effect.provideService(FileSystemService, FileSystemServiceTest), Effect.provide(PanfactumConfigService.Default))
    Effect.runPromise(result)
});