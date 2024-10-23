

export const GlbViewer = ({}) => {
    const app = useApp();
  const postSettings = usePostControls();

  const { data: envMap, isPending: isEnvLoading } = useEnvMap(envMapSrc);
  const { data: model, isPending: isModeLoading } = useModel(src);
  const clearColor = useMemo(_ => new Color().fromString('#090707'));


  useLayoutEffect(() => {
    app.scene.layers.getLayerByName('Skybox').enabled = false;
  }, [app]);

  if (isEnvLoading || isModeLoading) return null;

  return (
    <Entity>
      <EnvAtlas asset={envMap} />
      <Script script={Grid} />

      {/* The Camera with some default post */}
      <Entity name='camera' position={[4, 2, 4]}>
        <Camera clearColor={clearColor} fov={28} nearClip={1} farClip={10} exposure={1}/>
        <OrbitControls inertiaFactor={0.07} distanceMin={6} distanceMax={8} pitchAngleMin={1} pitchAngleMax={90}/>
        <Script script={AutoRotator} />
        <Script script={CameraFrame} {...postSettings}/>
      </Entity>

      {/* The GLB Asset to load */}
      <Entity name='asset'>
        <Script script={ShadowCatcher} intensity={2}/>
          <Container asset={model} castShadows/>
      </Entity>
    </Entity>
  );
});