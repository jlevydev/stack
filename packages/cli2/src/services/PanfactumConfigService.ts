import { Effect, Schema } from "effect"
import { FileSystemService } from "./FileSystemService.js"

// Root config: panfactum.yaml
// TODO: What to do about global
// Environments config: environment.yaml
// Region config: region.yaml

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

const PanfactumEnvironmentConfigSchema = Schema.mutable(Schema.Struct({
    environment: Schema.String,
    sla_target: Schema.Number,
    path: Schema.optional(Schema.String)
}))
interface PanfactumEnvironmentConfig extends Schema.Schema.Type<typeof PanfactumEnvironmentConfigSchema> { }

const PanfactumConfigSchema = Schema.Struct({
    root: PanfactumRootConfigSchema,
    environments: Schema.Array(PanfactumEnvironmentConfigSchema)
})
interface PanfactumConfig extends Schema.Schema.Type<typeof PanfactumConfigSchema> { }

class PanfactumConfigService extends Effect.Service<PanfactumConfigService>()("PanfactumConfigService", {
    effect: Effect.gen(function* () {
        return {
            bootstrapPanfactumConfig: Effect.gen(function* () {
                const fs = yield* FileSystemService
                const fileSystemRoot = yield* fs.getRepoRoot()
                // TODO: Maybe wrap readFile + parseYaml together
                const file = yield* fs.readFile(`${fileSystemRoot}/panfactum.yaml`)
                const configBlob = yield* fs.parseYaml(file)
                // TODO: Took me a second to get the typing to flow here with the schemas and the decode. 
                // Still want to do more reading about the way this works since this is the approach that
                // Got me an effect (which I'm more used to) but I don't know if it's right
                const config = yield* Schema.decodeUnknown<PanfactumRootConfig, PanfactumRootConfig, never>(PanfactumRootConfigSchema)(configBlob)
                const environmentFolders = yield* fs.listFiles(`${fileSystemRoot}/${config.environments_dir}`)

                // TODO: How to unit test this? We make to different calls with different results to readFile/parseYaml, so kind of makes returning the right thing hard
                // Even when we override the function once. How do we stub different calls in different ways to enable multiple behaviors?
                // Would observing the inputs into readFile then outputting something optionally for parseFile work? Thinking the suffix of panfactum vs environment.yaml
                const environmentFileEffects = environmentFolders.map((environment) => {
                    return Effect.gen(function* () {
                        const environmentPath = `${fileSystemRoot}/${config.environments_dir}/${environment}/environment.yaml`
                        const envConfigFile = yield* fs.readFile(environmentPath)
                        const envConfigBlob = yield* fs.parseYaml(envConfigFile)
                        const envConfig = yield* Schema.decodeUnknown<PanfactumEnvironmentConfig, PanfactumEnvironmentConfig, never>(PanfactumEnvironmentConfigSchema)(envConfigBlob)
                        envConfig.path = environmentPath
                        return envConfig
                    })
                })

                const envTest = yield* Effect.all(environmentFileEffects)
                return {
                    root: config,
                    environments: envTest
                } as PanfactumConfig
            })
        } as const
    }),
    dependencies: []
}) { }

export {
    PanfactumConfigService,
    type PanfactumConfig
}