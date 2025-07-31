import { Effect, Schema } from "effect"
import { FileSystemService } from "./FileSystemService.js"

// TODO: Capitolization preferences
// TODO: Figure out mapping field name to field in file if
const PanfactumRootConfigSchema = Schema.Struct({
    repo_name: Schema.String,
    repo_url: Schema.String,
    repo_primary_branch: Schema.String,
    environments_dir: Schema.String,
    iac_dir: Schema.String,
    aws_dir: Schema.String,
    kube_dir: Schema.String,
    ssh_dir: Schema.String,
    buildkit_dir: Schema.String,
    nats_dir: Schema.String
})
interface PanfactumRootConfig extends Schema.Schema.Type<typeof PanfactumRootConfigSchema> { }

const PanfactumEnvironmentConfigSchema = Schema.mutable(Schema.Array(Schema.String))
interface PanfactumEnvironmentConfig extends Schema.Schema.Type<typeof PanfactumEnvironmentConfigSchema> { }

const PanfactumConfigSchema = Schema.Struct({
    root: PanfactumRootConfigSchema,
    environments: PanfactumEnvironmentConfigSchema
})
interface PanfactumConfig extends Schema.Schema.Type<typeof PanfactumConfigSchema> { }

class PanfactumConfigService extends Effect.Service<PanfactumConfigService>()("PanfactumConfigService", {
    effect: Effect.gen(function* () {
        return {
            // TODO: Figure out how to get the interface from the decode
            bootstrapPanfactumConfig: Effect.gen(function* () {
                // TODO: Replace with a call to git from git service
                const fileSystemRoom = '/home/josh/personal/stack'
                const fs = yield* FileSystemService
                const file = yield* fs.readFile(`${fileSystemRoom}/panfactum.yaml`)
                const configBlob = yield* fs.parseYaml(file)
                // TODO: Took me a second to get the typing to flow here with the schemas and the decode. 
                // Still want to do more reading about the way this works since this is the approach that
                // Got me an effect (which I'm more used to) but I don't know if it's right
                const config = yield* Schema.decodeUnknown(PanfactumRootConfigSchema)(configBlob)
                const environments = yield* fs.listFiles(`${fileSystemRoom}/${config.environments_dir}`)
                return {
                    root: config,
                    environments: environments
                } as PanfactumConfig // TODO: Remove as statement
            })
        } as const
    }),
    dependencies: []
}) { }

export {
    PanfactumConfigService
}