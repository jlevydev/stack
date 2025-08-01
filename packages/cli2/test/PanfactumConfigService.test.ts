import { test, expect } from 'bun:test'
import { FileSystemService } from '../src/services/FileSystemService'
import { PanfactumConfigService, type PanfactumConfig } from '../src/services/PanfactumConfigService'
import { Effect, pipe } from 'effect';
import { ParseError } from 'effect/ParseResult';

test("Test reading the default config", async () => {

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

    // TODO: weirdly the type system failed here. Had to manually tag to get it to behave
    const program: Effect.Effect<PanfactumConfig, ParseError | Error, FileSystemService> = Effect.gen(function* () {
        const panfactumConfigService = yield* PanfactumConfigService
        return yield* panfactumConfigService.bootstrapPanfactumConfig
    })
    const panfactumConfig = await Effect.runPromise(
        pipe(
            program,
            Effect.provideService(FileSystemService, FileSystemServiceTest),
            Effect.provide(PanfactumConfigService.Default)
        )
    )
    expect(panfactumConfig).toMatchInlineSnapshot(`
      {
        "environments": [
          "production",
          "staging",
          "development",
        ],
        "root": {
          "aws_dir": ".aws",
          "buildkit_dir": ".buildkit",
          "environments_dir": "environments",
          "iac_dir": "packages/infrastrucutre",
          "kube_dir": ".kube",
          "nats_dir": ".nat",
          "repo_name": "stack",
          "repo_primary_branch": "main",
          "repo_url": "https://github.com/Panfactum/stack",
          "ssh_dir": ".ssh",
        },
      }
    `);
});