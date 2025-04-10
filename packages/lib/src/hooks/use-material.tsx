import { useLayoutEffect, useMemo } from 'react';
import { StandardMaterial } from 'playcanvas';
import { useApp } from './use-app';
import { PublicProps, Serializable } from '../utils/types-utils';
import { validatePropsWithDefaults, createComponentDefinition, applyProps } from '../utils/validation';

/**
 * This hook is used to create a material instance and update its properties when the props change.
 * @param {Materialrops} props - The props to pass to the material.
 * @returns {StandardMaterial} material - The material instance.
 * @see https://api.playcanvas.com/engine/classes/StandardMaterial.html
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

  const safeProps = validatePropsWithDefaults(props, componentDefinition);

  // Create the material instance only once when 'app' changes
  const material : StandardMaterial = useMemo(() => new StandardMaterial(), [app]);

  // Update material properties when 'props' change
  useLayoutEffect(() => {
    if (material) {

      applyProps(material, componentDefinition.schema, safeProps);
      material.update(); 
    }
  });

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


type MaterialProps = Partial<Serializable<PublicProps<StandardMaterial>>>;

// create a schema for the material props
const componentDefinition = createComponentDefinition<MaterialProps, StandardMaterial>(
    "Material",
    () => new StandardMaterial(),
    (material) => material.destroy(),
    "StandardMaterial"
)