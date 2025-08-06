import { Effect, Schema } from "effect"
import { FileSystemService } from "./FileSystemService.ts"
import type { ParseError } from "effect/ParseResult"

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

// TODO: How to not make (and why not to make) top level schemas mutable and how to change/work with downstream values
// I think I should just have seperate types, confirm with Jack
const PanfactumEnvironmentConfigSchema = Schema.Struct({
    environment: Schema.String,
    sla_target: Schema.Number,
})
interface PanfactumEnvironmentConfig extends Schema.Schema.Type<typeof PanfactumEnvironmentConfigSchema> { }

// TODO: Stuttered naming above
interface PanfactumEnvironment {
    environment: PanfactumEnvironmentConfig
    path: string // TODO: Branded type
}

const PanfactumConfigSchema = Schema.Struct({
    root: PanfactumRootConfigSchema,
    environments: Schema.Array(PanfactumEnvironmentConfigSchema)
})
interface PanfactumConfig extends Schema.Schema.Type<typeof PanfactumConfigSchema> { }

// TODO: Bump on naming convention for Schema and associated types. Using the same name seems like how the docs do it
// const PanfactumRegionSchema = Schema.Struct({
//     region: Schema.String,
//     aws_region: Schema.String,
//     aws_secondary_region: Schema.String,
//     kube_api_server: Schema.String,
//     kube_config_context: Schema.String,
//     vault_addr: Schema.String
// })
// interface PanfactumRegionSchema extends Schema.Schema.Type<typeof PanfactumRegionSchema> { }

// interface PanfactumRegion {
//     region: PanfactumRegionSchema
//     path: string // TODO Branded type
// }

class PanfactumConfigService extends Effect.Service<PanfactumConfigService>()("PanfactumConfigService", {
    effect: Effect.gen(function* () {

        // TODO: Discuss w/ Jack
        const fs = yield* FileSystemService

        const readPanfactumRootConfig = Effect.gen(function* () {
            const fileSystemRoot = yield* fs.getRepoRoot()
            // TODO: Maybe wrap readFile + parseYaml together
            const file = yield* fs.readFile(`${fileSystemRoot}/panfactum.yaml`)
            const configBlob = yield* fs.parseYaml(file)
            return Schema.decodeUnknownSync<PanfactumRootConfig, PanfactumRootConfig>(PanfactumRootConfigSchema)(configBlob)
        })

        const readEnvironments = Effect.gen(function* () {
            const fileSystemRoot = yield* fs.getRepoRoot()
            const { environments_dir } = yield* readPanfactumRootConfig

            const environmentFolders = yield* fs.listFiles(`${fileSystemRoot}/${environments_dir}`)

            const environmentFileEffects: Effect.Effect<PanfactumEnvironment, Error | ParseError, never>[] = environmentFolders.map((environment) => {
                return Effect.gen(function* () {
                    const environmentPath = `${fileSystemRoot}/${environments_dir}/${environment}/environment.yaml`
                    const envConfigFile = yield* fs.readFile(environmentPath)
                    const envConfigBlob = yield* fs.parseYaml(envConfigFile)
                    const envConfig = Schema.decodeUnknownSync<PanfactumEnvironmentConfig, PanfactumEnvironmentConfig>(PanfactumEnvironmentConfigSchema)(envConfigBlob)
                    return {
                        environment: envConfig,
                        path: environmentPath
                    }
                })
            })

            return yield* Effect.all(environmentFileEffects)
        })

        const readRegions = Effect.gen(function* () {
            return [{
                region: {
                    region: "",
                    aws_region: "",
                    aws_secondary_region: "",
                    kube_api_server: "",
                    kube_config_context: "",
                    vault_addr: ""
                },
                path: ""
            }]
        })

        const bootstrapPanfactumConfig = Effect.gen(function* () {
            const fileSystemRoot = yield* fs.getRepoRoot()
            // TODO: Maybe wrap readFile + parseYaml together
            const file = yield* fs.readFile(`${fileSystemRoot}/panfactum.yaml`)
            const configBlob = yield* fs.parseYaml(file)
            // TODO: Took me a second to get the typing to flow here with the schemas and the decode. 
            // Still want to do more reading about the way this works since this is the approach that
            // Got me an effect (which I'm more used to) but I don't know if it's right
            const config = Schema.decodeUnknownSync<PanfactumRootConfig, PanfactumRootConfig>(PanfactumRootConfigSchema)(configBlob)
            const environmentFolders = yield* fs.listFiles(`${fileSystemRoot}/${config.environments_dir}`)

            // TODO: How to unit test this? We make to different calls with different results to readFile/parseYaml, so kind of makes returning the right thing hard
            // Even when we override the function once. How do we stub different calls in different ways to enable multiple behaviors?
            // Would observing the inputs into readFile then outputting something optionally for parseFile work? Thinking the suffix of panfactum vs environment.yaml
            const environmentFileEffects = environmentFolders.map((environment) => {
                return Effect.gen(function* () {
                    const environmentPath = `${fileSystemRoot}/${config.environments_dir}/${environment}/environment.yaml`
                    const envConfigFile = yield* fs.readFile(environmentPath)
                    const envConfigBlob = yield* fs.parseYaml(envConfigFile)
                    const envConfig = Schema.decodeUnknownSync<PanfactumEnvironmentConfig, PanfactumEnvironmentConfig>(PanfactumEnvironmentConfigSchema)(envConfigBlob)
                    return envConfig
                })
            })

            const envTest = yield* Effect.all(environmentFileEffects)
            return {
                root: config,
                environments: envTest
            } as PanfactumConfig
        })

        return {
            readPanfactumRootConfig,
            readEnvironments,
            readRegions,
            bootstrapPanfactumConfig
        }
    }),
    dependencies: []
}) { }

export {
    PanfactumConfigService,
    type PanfactumConfig
}