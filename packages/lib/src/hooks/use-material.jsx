import { useLayoutEffect, useMemo } from 'react';
import { StandardMaterial } from 'playcanvas';
import { useApp } from './use-app';

export const useMaterial = (props) => {
  const app = useApp();

  // Create the material instance only once when 'app' changes
  const material = useMemo(() => new StandardMaterial(), [app]);

  // Update material properties when 'props' change
  useLayoutEffect(() => {
    if (material) {
      // Loop through the props and assign them to the material
      for (const key in props) {
        if (props.hasOwnProperty(key)) {
          // if(key === 'material') console.log('setting mat', material)
          material[key] = props[key];
        }
      }
      material.update(); // Apply the changes to the material
    }
  }, [material, props]);

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