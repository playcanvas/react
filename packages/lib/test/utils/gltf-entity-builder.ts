import { Entity as PcEntity, Application as PcApplication } from 'playcanvas';

/**
 * Builder class for creating mock GLTF-like entity hierarchies
 * Uses real PlayCanvas Entity instances for authentic testing
 */
export class GltfEntityBuilder {
  private root: PcEntity;
  private app: PcApplication;
  private entityMap: Map<string, PcEntity> = new Map();

  constructor(app: PcApplication, rootName: string = 'RootNode') {
    this.app = app;
    this.root = new PcEntity(rootName, app);
    this.entityMap.set(rootName, this.root);
  }

  /**
   * Add a child entity to a parent
   * @param parentName - Name of the parent entity
   * @param childName - Name of the child entity
   * @returns The builder for chaining
   */
  addChild(parentName: string, childName: string): this {
    const parent = this.entityMap.get(parentName);
    if (!parent) {
      throw new Error(`Parent entity "${parentName}" not found`);
    }

    const child = new PcEntity(childName, this.app);
    parent.addChild(child);
    this.entityMap.set(childName, child);
    return this;
  }

  /**
   * Add multiple children to a parent
   * @param parentName - Name of the parent entity
   * @param childNames - Array of child names to add
   * @returns The builder for chaining
   */
  addChildren(parentName: string, childNames: string[]): this {
    for (const childName of childNames) {
      this.addChild(parentName, childName);
    }
    return this;
  }

  /**
   * Add a component to an entity
   * @param entityName - Name of the entity
   * @param componentType - Type of component (e.g., 'light', 'render', 'camera')
   * @param data - Component data
   * @returns The builder for chaining
   */
  addComponent(
    entityName: string,
    componentType: string,
    data?: Record<string, unknown>
  ): this {
    const entity = this.entityMap.get(entityName);
    if (!entity) {
      throw new Error(`Entity "${entityName}" not found`);
    }

    entity.addComponent(componentType, data);
    return this;
  }

  /**
   * Get an entity by name
   * @param name - Name of the entity
   * @returns The entity or undefined if not found
   */
  getEntity(name: string): PcEntity | undefined {
    return this.entityMap.get(name);
  }

  /**
   * Get the root entity
   * @returns The root entity
   */
  getRoot(): PcEntity {
    return this.root;
  }

  /**
   * Get all entities as a map
   * @returns Map of entity names to entities
   */
  getEntityMap(): Map<string, PcEntity> {
    return this.entityMap;
  }

  /**
   * Build and return the root entity
   * @returns The root entity of the hierarchy
   */
  build(): PcEntity {
    return this.root;
  }
}

/**
 * Helper function to create a simple entity hierarchy
 * @param app - PlayCanvas application
 * @param structure - Nested structure defining the hierarchy
 * @returns The root entity
 */
export function createEntityHierarchy(
  app: PcApplication,
  structure: EntityStructure
): PcEntity {
  const root = new PcEntity(structure.name, app);

  // Add components if specified
  if (structure.components) {
    for (const [type, data] of Object.entries(structure.components)) {
      root.addComponent(type, data);
    }
  }

  // Add children recursively
  if (structure.children) {
    for (const childStructure of structure.children) {
      const child = createEntityHierarchy(app, childStructure);
      root.addChild(child);
    }
  }

  return root;
}

/**
 * Structure definition for entity hierarchy
 */
export interface EntityStructure {
  name: string;
  components?: Record<string, Record<string, unknown> | undefined>;
  children?: EntityStructure[];
}

/**
 * Find an entity by name in a hierarchy
 * @param root - Root entity to search from
 * @param name - Name of entity to find
 * @returns The found entity or null
 */
export function findEntityByName(root: PcEntity, name: string): PcEntity | null {
  if (root.name === name) {
    return root;
  }

  for (const child of root.children) {
    const found = findEntityByName(child as PcEntity, name);
    if (found) {
      return found;
    }
  }

  return null;
}

/**
 * Find all entities with a specific component
 * @param root - Root entity to search from
 * @param componentType - Type of component to find
 * @returns Array of entities with the component
 */
export function findEntitiesWithComponent(
  root: PcEntity,
  componentType: string
): PcEntity[] {
  const entities: PcEntity[] = [];

  if (root.c?.[componentType]) {
    entities.push(root);
  }

  for (const child of root.children) {
    entities.push(...findEntitiesWithComponent(child as PcEntity, componentType));
  }

  return entities;
}

/**
 * Count total entities in hierarchy
 * @param root - Root entity to count from
 * @returns Total number of entities
 */
export function countEntities(root: PcEntity): number {
  let count = 1; // Count the root

  for (const child of root.children) {
    count += countEntities(child as PcEntity);
  }

  return count;
}

/**
 * Get all entity paths in a hierarchy
 * @param root - Root entity
 * @param parentPath - Parent path (for recursion)
 * @returns Array of paths
 */
export function getAllPaths(root: PcEntity, parentPath: string = ''): string[] {
  const currentPath = parentPath ? `${parentPath}.${root.name}` : root.name;
  const paths = [currentPath];

  for (const child of root.children) {
    paths.push(...getAllPaths(child as PcEntity, currentPath));
  }

  return paths;
}

