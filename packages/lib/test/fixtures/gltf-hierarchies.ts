import { Entity as PcEntity, Application as PcApplication } from 'playcanvas';
import { createEntityHierarchy, EntityStructure } from '../utils/gltf-entity-builder.ts';

/**
 * Simple robot hierarchy for basic testing
 * 
 * Structure:
 * RootNode
 *   Body [render]
 *     Head [render, light]
 *     LeftArm [render]
 *     RightArm [render]
 */
export function createSimpleRobot(app: PcApplication): PcEntity {
    const structure: EntityStructure = {
      name: 'RootNode',
      children: [
        {
          name: 'Body',
          components: { render: {} }, // Add render to Body
          children: [
            {
              name: 'Head',
              components: {
                light: { type: 'omni', intensity: 1 },
                render: {} // Add render to Head
              }
            },
            {
              name: 'LeftArm',
              components: { render: {} } // Add render to LeftArm
            },
            {
              name: 'RightArm',
              components: { render: {} } // Add render to RightArm
            }
          ]
        }
      ]
    };

    return createEntityHierarchy(app, structure);
  }

/**
 * Complex scene with multiple levels and components
 * 
 * Structure:
 * Scene
 *   Environment
 *     Sun [light]
 *     Ground
 *   Characters
 *     Player
 *       Body
 *         Head [camera]
 *           Eyes
 *         Torso
 *       Weapon
 *     Enemy
 *       Body
 *         Head
 *   Props
 *     Barrel
 *     Crate
 */
export function createComplexScene(app: PcApplication): PcEntity {
  const structure: EntityStructure = {
    name: 'Scene',
    children: [
      {
        name: 'Environment',
        children: [
          {
            name: 'Sun',
            components: {
              light: { type: 'directional', intensity: 1.5 }
            }
          },
          {
            name: 'Ground'
          }
        ]
      },
      {
        name: 'Characters',
        children: [
          {
            name: 'Player',
            children: [
              {
                name: 'Body',
                children: [
                  {
                    name: 'Head',
                    components: {
                      camera: { fov: 60 },
                      render: {}
                    },
                    children: [
                      {
                        name: 'Eyes'
                      }
                    ]
                  },
                  {
                    name: 'Torso'
                  }
                ]
              },
              {
                name: 'Weapon'
              }
            ]
          },
          {
            name: 'Enemy',
            children: [
              {
                name: 'Body',
                children: [
                    {
                        name: 'Head',
                        components: {
                            render: {
                                castShadows: false
                            }
                        },
                    }
                ]
              }
            ]
          }
        ]
      },
      {
        name: 'Props',
        children: [
          {
            name: 'Barrel'
          },
          {
            name: 'Crate'
          }
        ]
      }
    ]
  };

  return createEntityHierarchy(app, structure);
}

/**
 * Hierarchy focused on lights for component filter testing
 * 
 * Structure:
 * LightingRig
 *   MainLights
 *     KeyLight [light]
 *     FillLight [light]
 *     RimLight [light]
 *   AccentLights
 *     Spot1 [light]
 *     Spot2 [light]
 *   Geometry [camera]
 */
export function createLightingScene(app: PcApplication): PcEntity {
  const structure: EntityStructure = {
    name: 'LightingRig',
    children: [
      {
        name: 'MainLights',
        children: [
          {
            name: 'KeyLight',
            components: {
              light: { type: 'directional', intensity: 2 }
            }
          },
          {
            name: 'FillLight',
            components: {
              light: { type: 'point', intensity: 0.5 }
            }
          },
          {
            name: 'RimLight',
            components: {
              light: { type: 'spot', intensity: 1.5 }
            }
          }
        ]
      },
      {
        name: 'AccentLights',
        children: [
          {
            name: 'Spot1',
            components: {
              light: { type: 'spot', intensity: 1 }
            }
          },
          {
            name: 'Spot2',
            components: {
              light: { type: 'spot', intensity: 1 }
            }
          }
        ]
      },
      {
        name: 'Geometry',
        components: {
          camera: { fov: 45 }
        }
      }
    ]
  };

  return createEntityHierarchy(app, structure);
}

/**
 * Flat hierarchy for testing single-level wildcards
 * 
 * Structure:
 * Root
 *   Item1
 *   Item2
 *   Item3
 *   Special [light]
 */
export function createFlatHierarchy(app: PcApplication): PcEntity {
  const structure: EntityStructure = {
    name: 'Root',
    children: [
      {
        name: 'Item1'
      },
      {
        name: 'Item2'
      },
      {
        name: 'Item3'
      },
      {
        name: 'Special',
        components: {
          light: { type: 'point' }
        }
      }
    ]
  };

  return createEntityHierarchy(app, structure);
}

/**
 * Deep hierarchy for testing multi-level wildcards
 * 
 * Structure:
 * Level0
 *   Level1
 *     Level2
 *       Level3
 *         Level4
 *           DeepNode [light]
 */
export function createDeepHierarchy(app: PcApplication): PcEntity {
  const structure: EntityStructure = {
    name: 'Level0',
    children: [
      {
        name: 'Level1',
        children: [
          {
            name: 'Level2',
            children: [
              {
                name: 'Level3',
                children: [
                  {
                    name: 'Level4',
                    children: [
                      {
                        name: 'DeepNode',
                        components: {
                          light: { type: 'point' }
                        }
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  };

  return createEntityHierarchy(app, structure);
}

/**
 * Hierarchy with duplicate names at different levels
 * Used to test that path matching distinguishes between entities with the same name
 * 
 * Structure:
 * Root
 *   Branch1
 *     Node [camera]
 *     Leaf
 *   Branch2
 *     Node [light]
 *     Leaf
 */
export function createDuplicateNamesHierarchy(app: PcApplication): PcEntity {
  const structure: EntityStructure = {
    name: 'Root',
    children: [
      {
        name: 'Branch1',
        children: [
          {
            name: 'Node',
            components: {
              camera: { fov: 60 }
            }
          },
          {
            name: 'Leaf'
          }
        ]
      },
      {
        name: 'Branch2',
        children: [
          {
            name: 'Node',
            components: {
              light: { type: 'point' }
            }
          },
          {
            name: 'Leaf'
          }
        ]
      }
    ]
  };

  return createEntityHierarchy(app, structure);
}

/**
 * Empty hierarchy (just a root node) for edge case testing
 */
export function createEmptyHierarchy(app: PcApplication): PcEntity {
  const structure: EntityStructure = {
    name: 'Empty'
  };

  return createEntityHierarchy(app, structure);
}

