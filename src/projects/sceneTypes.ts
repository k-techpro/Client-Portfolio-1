export type SceneProps = {
  /** Index into the project's `stages` array. */
  stage: number;
  /** Monotonic counter driven by the shell while the scene is on screen. */
  tick: number;
};
