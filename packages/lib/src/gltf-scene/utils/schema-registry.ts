/**
 * Component schema registry for serialization
 * Provides access to component schemas to know which properties to serialize
 */

import { lightComponentDefinition } from '../../components/Light.tsx';
import { renderComponentDefinition } from '../../components/Render.tsx';
import { cameraComponentDefinition } from '../../components/Camera.tsx';

/**
 * Registry mapping component type names to their schema definitions
 */
export const componentSchemaRegistry: Record<string, { schema?: Record<string, unknown> }> = {
  light: lightComponentDefinition,
  render: renderComponentDefinition,
  camera: cameraComponentDefinition,
  // Add more as they're exported from component files
};

/**
 * Get the list of serializable property names for a component type
 * Uses the actual component schema as source of truth
 */
export function getSerializablePropertyNames(componentType: string): string[] | null {
  const definition = componentSchemaRegistry[componentType];
  
  if (!definition || !definition.schema) {
    // No schema found - return null to signal we should serialize all properties
    return null;
  }

  // Return all property keys defined in the schema
  return Object.keys(definition.schema);
}

