import { Effect } from "effect"
import { readdir, readFile } from "node:fs/promises"
import { load } from "js-yaml"
import { execSync } from "node:child_process"

// TODO: Path type with validation
// TODO: Differentiate types in an "Effectful" way

// TODO: Do we want to not use the .Serivce helper here? Docs are mixed on usage and it seems like it abstracts a lot
class FileSystemService extends Effect.Service<FileSystemService>()("FileSystemService", {
    effect: Effect.gen(function* () {
        return {
            readFile: (path: string) => Effect.tryPromise({
                try: () => readFile(path),
                catch: (error) => new Error(`unknown error reading file ${error}`)
            }),
            listFiles: (path: string) => Effect.tryPromise({
                try: () => readdir(path),
                catch: (error) => new Error(`unknown error reading file ${error}`)
            }),
            // TODO: Move to Yaml service or some nonsense
            parseYaml: (yamlContent: Buffer) => Effect.try({
                try: () => load(yamlContent.toString()),
                catch: error => new Error(`unknown error reading file ${error}`)
            }),
            // TODO: Move to a git or shell call service
            getRepoRoot: () => Effect.try({
                try: () => execSync('git rev-parse --show-toplevel').toString().trim(),
                catch: error => new Error(`unknown error when getting repo root ${error}`)
            })
        } as const
    }),
    dependencies: []
}) { }

export {
    FileSystemService
}