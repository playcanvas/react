import { useLayoutEffect, useMemo } from 'react';
import { StandardMaterial } from 'playcanvas';
import { useApp } from './use-app';
import { useColors } from '../utils/color';

type WritableKeys<T> = {
  [K in keyof T]: T[K] extends { readonly [key: string]: unknown } ? never : K;
}[keyof T];

type MaterialProps = Pick<StandardMaterial, WritableKeys<StandardMaterial>>;

export const useMaterial = (props: MaterialProps): StandardMaterial => {
  const app = useApp();

  const colorProps = useColors(props, [
    'ambient', 
    'attenuation', 
    'diffuse', 
    'emissive', 
    'sheen', 
    'specular'
  ]);

  const propsWithColors = { ...props, ...colorProps };

  // Create the material instance only once when 'app' changes
  const material : StandardMaterial = useMemo(() => new StandardMaterial(), [app]);

  // Update material properties when 'props' change
  useLayoutEffect(() => {
    if (material) {

      // Filter the props to only include those in the standard material
      const filteredProps = Object.fromEntries(
        Object.entries(propsWithColors).filter(([key]) => key in material)
      );
      Object.assign(material, filteredProps)
      material.update(); 
    }
  }, [app, material, props]);

  // Clean up the material when the component unmounts
  useLayoutEffect(() => {
    return () => {
      if (material) {
        material.destroy();
      }
    };
  }, [material]);

  return material;
};