import { Layer, ManagedRuntime } from "effect";
import { PanfactumConfigService } from "./PanfactumConfigService";
import { FileSystemService } from "./FileSystemService";
import { InkStateService } from "./InkStateService";

// TODO: See about removing the stuttered FileSystemService here
const GlobalConfigLive = Layer.mergeAll(Layer.provide(PanfactumConfigService.Default, FileSystemService.Default), FileSystemService.Default, InkStateService.Default)
const runtime = ManagedRuntime.make(GlobalConfigLive)

export default runtime