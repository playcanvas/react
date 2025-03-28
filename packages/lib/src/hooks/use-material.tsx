import { useLayoutEffect, useMemo } from 'react';
import { StandardMaterial } from 'playcanvas';
import { useApp } from './use-app';
import { getColorPropertyNames, useColors, WithCssColors } from '../utils/color';
import { PublicProps } from '../utils/types-utils';

type MaterialProps = Partial<WithCssColors<PublicProps<StandardMaterial>>>;

// dynamically build a list of property names that are colors
const tmpMaterial: StandardMaterial = new StandardMaterial();
const colors = getColorPropertyNames(tmpMaterial);
tmpMaterial.destroy();

export const useMaterial = (props: MaterialProps): StandardMaterial => {
  const app = useApp();

  // Get color props with proper type checking
  const colorProps = useColors(props, colors as Array<keyof typeof props & string>);

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