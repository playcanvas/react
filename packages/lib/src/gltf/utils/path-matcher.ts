import { Entity } from 'playcanvas';

/**
 * PathMatcher utility for matching entity paths in the GLTF hierarchy.
 * Supports:
 * - Exact paths: "head.arm.hand"
 * - Single-level wildcards: "head.arm.*"
 * - Multi-level wildcards: "head.arm.**"
 * - Component filters: "[light]"
 * - Combined queries: "head.*[light]"
 */

export interface PathMatcherOptions {
  caseSensitive?: boolean;
}

export interface EntityMetadata {
  entity: Entity;
  path: string;
  guid: string;
  name: string;
}

export type PathPredicate = (entity: Entity, metadata: EntityMetadata) => boolean;

export class PathMatcher {
  private caseSensitive: boolean;

  constructor(options: PathMatcherOptions = {}) {
    this.caseSensitive = options.caseSensitive ?? true;
  }

  /**
   * Normalizes a path for comparison
   */
  private normalizePath(path: string): string {
    return this.caseSensitive ? path : path.toLowerCase();
  }

  /**
   * Checks if a path matches a pattern
   */
  match(pattern: string, entityPath: string, entity: Entity): boolean {
    // Check for component filter [componentType] anywhere in the pattern
    const componentMatch = pattern.match(/\[([^\]]+)\]/);
    let pathPattern = pattern;
    let componentType: string | null = null;

    if (componentMatch) {
      componentType = componentMatch[1];
      // Replace the filter from any position and clean up resulting dots
      pathPattern = pattern
        .replace(componentMatch[0], '')
        .replace(/^\.+/, '')   // Remove leading dots
        .replace(/\.+$/, '')   // Remove trailing dots
        .replace(/\.\.+/g, '.'); // Collapse multiple dots to single dot
    }

    // If there's a component filter, check it first
    if (componentType) {
      if (!entity.c?.[componentType]) {
        return false;
      }
    }

    // If only component filter (no path), return true
    if (!pathPattern) {
      return !!componentType;
    }

    // Match path pattern
    const pathMatch = this.matchPath(pathPattern, entityPath);
    return pathMatch;
  }

  /**
   * Matches a path against a pattern with wildcards
   * Handles exact paths, single-level wildcards (*), and multi-level wildcards (**)
   */
  private matchPath(pattern: string, path: string): boolean {
    const normalizedPattern = this.normalizePath(pattern);
    const normalizedPath = this.normalizePath(path);

    // Special case: pattern is just "**" which matches any path
    if (normalizedPattern === '**') {
      return true;
    }

    // Split pattern into parts
    const patternParts = normalizedPattern.split('.');
    
    // Build regex string with special handling for **
    let regexStr = '^';
    for (let i = 0; i < patternParts.length; i++) {
      const part = patternParts[i];
      
      if (part === '**') {
        // ** matches zero or more complete segments
        // Need to handle: A.**.B should match A.B, A.X.B, A.X.Y.B
        if (i === 0) {
          // At start: match any number of segments with optional trailing dot
          regexStr += '(?:(?:[^.]+\\.)?)*';
        } else if (i === patternParts.length - 1) {
          // At end: match zero or more segments with required leading dot
          regexStr += '(?:\\.(?:[^.]+))*';
        } else {
          // In middle: match zero or more segments, handling dots carefully
          regexStr += '(?:(?:\\.(?:[^.]+))*\\.)?';
        }
      } else if (part === '*') {
        // * matches exactly one segment
        if (i > 0) regexStr += '\\.';
        regexStr += '[^.]+';
      } else {
        // Literal part
        if (i > 0 && patternParts[i - 1] !== '**') {
          regexStr += '\\.';
        }
        // Escape special regex characters
        regexStr += part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      }
    }
    regexStr += '$';

    const regex = new RegExp(regexStr);
    return regex.test(normalizedPath);
  }

  /**
   * Calculates specificity score for a pattern (used for conflict resolution)
   */
  getSpecificity(pattern: string | PathPredicate): number {
    if (typeof pattern === 'function') {
      return 0; // Predicates have lowest specificity
    }

    let score = 0;
    // Remove component filter from anywhere in the pattern
    const pathPattern = pattern.replace(/\[([^\]]+)\]/, '');

    // Count exact parts (not wildcards)
    const parts = pathPattern.split('.').filter(p => p !== '');
    for (const part of parts) {
      if (part === '**') {
        score += 1;
      } else if (part === '*') {
        score += 10;
      } else if (part) {
        score += 100;
      }
    }

    // Component filter adds specificity
    if (pattern.includes('[')) {
      score += 50;
    }

    return score;
  }

  /**
   * Finds all entities matching a pattern in a hierarchy
   */
  findMatching(
    pattern: string | PathPredicate,
    hierarchyCache: Map<string, EntityMetadata>
  ): EntityMetadata[] {
    const matches: EntityMetadata[] = [];

    for (const metadata of hierarchyCache.values()) {
      if (this.matches(pattern, metadata)) {
        matches.push(metadata);
      }
    }

    return matches;
  }

  /**
   * Checks if a pattern matches an entity
   */
  matches(pattern: string | PathPredicate, metadata: EntityMetadata): boolean {
    if (typeof pattern === 'function') {
      return pattern(metadata.entity, metadata);
    }

    return this.match(pattern, metadata.path, metadata.entity);
  }

  /**
   * Resolves a path relative to a parent path
   */
  resolvePath(parentPath: string, relativePath: string): string {
    if (!parentPath) {
      return relativePath;
    }
    return `${parentPath}.${relativePath}`;
  }
}

/**
 * Default path matcher instance
 */
export const defaultPathMatcher = new PathMatcher();

