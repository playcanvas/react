import { useLayoutEffect, useMemo } from 'react';
import { StandardMaterial } from 'playcanvas';
import { useApp } from './use-app';
import { getColorPropertyNames, useColors, WithCssColors } from '../utils/color';
import { PublicProps } from '../utils/types-utils';
import { createSchema, validateAndSanitizeProps, Schema } from '../utils/validation';

/**
 * This hook is used to create a material instance and update its properties when the props change.
 * @param {MaterialProps} props - The props to pass to the material.
 * @returns {StandardMaterial} material - The material instance.
 * 
 * @example
 * const material = useMaterial({
 *   diffuse: 'red',
 *   opacity: 0.5,
 * });
 * 
 * // use the material
 * <Render type="box" material={material} />
 */
export const useMaterial = (props: MaterialProps): StandardMaterial => {
  const app = useApp();

  const safeProps = validateAndSanitizeProps(props, schema, 'Material');

  // Get color props with proper type checking
  const colorProps = useColors(props, colors as Array<keyof typeof props & string>);
  const propsWithColors = { ...safeProps, ...colorProps };

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
  }, [app, material, propsWithColors]);

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


type MaterialProps = Partial<WithCssColors<PublicProps<StandardMaterial>>>;

// dynamically build a list of property names that are colors
const tmpMaterial: StandardMaterial = new StandardMaterial();
const colors = getColorPropertyNames(tmpMaterial);
tmpMaterial.destroy();

// create a schema for the material props
const schema: Schema<MaterialProps> = createSchema(
  () => new StandardMaterial(),
  (material) => material.destroy()
);