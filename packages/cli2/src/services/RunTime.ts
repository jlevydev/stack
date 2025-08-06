import { Effect, Layer, ManagedRuntime } from "effect";
import { makePanfactumConfigService, PanfactumConfigService } from "./PanfactumConfigService";
import { FileSystemService } from "./FileSystemService";
import { InkStateService } from "./InkStateService";

// TODO: See about removing the stuttered FileSystemService here. Best practice is defining a "PanfactumConfigServiceLive" but would have the same issue
const GlobalConfigLive = Layer.mergeAll(Layer.effect(PanfactumConfigService, Effect.provide(makePanfactumConfigService, FileSystemService.Default)), FileSystemService.Default, InkStateService.Default)
const runtime = ManagedRuntime.make(GlobalConfigLive)

export default runtime