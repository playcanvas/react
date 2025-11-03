/**
 * Unit tests for PathMatcher
 * 
 * These tests verify the two critical fixes:
 * 1. Component filters work at any position in the pattern (not just the end)
 * 2. Multi-level wildcards (**) work correctly with multiple segments
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PathMatcher } from './path-matcher.ts';
import { Entity, Application, NullGraphicsDevice } from 'playcanvas';

// Mock entity factory
function createMockEntity(name: string, hasLight = false, hasRender = false): Entity {
  const canvas = document.createElement('canvas');
  const app = new Application(canvas, {
    graphicsDevice: new NullGraphicsDevice(canvas)
  });
  const entity = new Entity(name, app);
  
  if (hasLight) {
    entity.addComponent('light');
  }
  if (hasRender) {
    entity.addComponent('render');
  }
  
  return entity;
}

describe('PathMatcher', () => {
  let matcher: PathMatcher;

  beforeEach(() => {
    matcher = new PathMatcher();
  });

  describe('Fix #1: Component Filter Regex', () => {
    it('should match component filter at the end of pattern', () => {
      const entity = createMockEntity('hand', true);
      expect(matcher.match('head.*[light]', 'head.hand', entity)).toBe(true);
    });

    it('should match component filter anywhere in pattern (component applies to matched entity)', () => {
      // Component filter applies to the matched entity, not a specific path segment
      const entityWithLight = createMockEntity('hand', true);
      const entityWithoutLight = createMockEntity('hand', false);
      
      // Pattern with filter at different positions - all test the MATCHED entity for the component
      expect(matcher.match('head.*[light]', 'head.hand', entityWithLight)).toBe(true);
      expect(matcher.match('head.*[light]', 'head.hand', entityWithoutLight)).toBe(false);
      
      expect(matcher.match('[light].**', 'head.arm.hand', entityWithLight)).toBe(true);
      expect(matcher.match('[light].**', 'head.arm.hand', entityWithoutLight)).toBe(false);
    });

    it('should match standalone component filter', () => {
      const entity = createMockEntity('anything', true);
      expect(matcher.match('[light]', 'head.arm.hand', entity)).toBe(true);
    });

    it('should not match when component is missing', () => {
      const entity = createMockEntity('hand', false);
      expect(matcher.match('[light].*.hand', 'head.arm.hand', entity)).toBe(false);
    });
  });

  describe('Fix #2: Multi-Level Wildcard Logic', () => {
    it('should match single ** with multiple segments', () => {
      const entity = createMockEntity('hand');
      expect(matcher.match('head.**.hand', 'head.arm.hand', entity)).toBe(true);
      expect(matcher.match('head.**.hand', 'head.shoulder.arm.hand', entity)).toBe(true);
      expect(matcher.match('head.**.hand', 'head.hand', entity)).toBe(true);
    });

    it('should not match when suffix is wrong', () => {
      const entity = createMockEntity('foot');
      expect(matcher.match('head.**.hand', 'head.arm.foot', entity)).toBe(false);
    });

    it('should not match when prefix is wrong', () => {
      const entity = createMockEntity('hand');
      expect(matcher.match('head.**.hand', 'body.arm.hand', entity)).toBe(false);
    });

    it('should handle multiple ** segments', () => {
      const entity = createMockEntity('finger');
      expect(matcher.match('body.**.arm.**.finger', 'body.torso.shoulder.arm.hand.finger', entity)).toBe(true);
      expect(matcher.match('body.**.arm.**.finger', 'body.arm.finger', entity)).toBe(true);
    });

    it('should handle ** at the beginning', () => {
      const entity = createMockEntity('hand');
      expect(matcher.match('**.hand', 'head.arm.hand', entity)).toBe(true);
      expect(matcher.match('**.hand', 'hand', entity)).toBe(true);
    });

    it('should handle ** at the end', () => {
      const entity = createMockEntity('anything');
      expect(matcher.match('head.**', 'head.arm.hand', entity)).toBe(true);
      expect(matcher.match('head.**', 'head', entity)).toBe(true);
    });
  });

  describe('Single-Level Wildcard (*)', () => {
    it('should match exactly one segment', () => {
      const entity = createMockEntity('hand');
      expect(matcher.match('head.*.hand', 'head.arm.hand', entity)).toBe(true);
    });

    it('should not match multiple segments', () => {
      const entity = createMockEntity('hand');
      expect(matcher.match('head.*.hand', 'head.shoulder.arm.hand', entity)).toBe(false);
    });

    it('should not match zero segments', () => {
      const entity = createMockEntity('hand');
      expect(matcher.match('head.*.hand', 'head.hand', entity)).toBe(false);
    });
  });

  describe('Exact Path Matching', () => {
    it('should match exact paths', () => {
      const entity = createMockEntity('hand');
      expect(matcher.match('head.arm.hand', 'head.arm.hand', entity)).toBe(true);
    });

    it('should not match different paths', () => {
      const entity = createMockEntity('foot');
      expect(matcher.match('head.arm.hand', 'head.leg.foot', entity)).toBe(false);
    });
  });

  describe('Combined Patterns', () => {
    it('should combine ** with component filter', () => {
      const entity = createMockEntity('hand', true);
      expect(matcher.match('body.**[light]', 'body.arm.hand', entity)).toBe(true);
    });

    it('should combine * with component filter', () => {
      const entity = createMockEntity('hand', true);
      expect(matcher.match('body.*[light]', 'body.hand', entity)).toBe(true);
      expect(matcher.match('body.*[light]', 'body.arm.hand', entity)).toBe(false);
    });

    it('should handle complex patterns', () => {
      const entity = createMockEntity('light', true);
      expect(matcher.match('**.lights.*[light]', 'scene.room.lights.main', entity)).toBe(true);
    });
  });

  describe('Specificity Calculation', () => {
    it('should calculate specificity for exact paths', () => {
      expect(matcher.getSpecificity('head.arm.hand')).toBe(300); // 3 exact parts * 100
    });

    it('should calculate specificity for single wildcard', () => {
      expect(matcher.getSpecificity('head.*.hand')).toBe(210); // 2 exact * 100 + 1 wildcard * 10
    });

    it('should calculate specificity for multi wildcard', () => {
      expect(matcher.getSpecificity('head.**.hand')).toBe(201); // 2 exact * 100 + 1 double wildcard * 1
    });

    it('should add specificity for component filters', () => {
      expect(matcher.getSpecificity('[light]')).toBe(50); // Just component filter
      expect(matcher.getSpecificity('head[light]')).toBe(150); // 100 + 50
      expect(matcher.getSpecificity('head.*[light]')).toBe(160); // 100 + 10 + 50
    });

    it('should give predicates lowest specificity', () => {
      const predicate = () => true;
      expect(matcher.getSpecificity(predicate)).toBe(0);
    });
  });

  describe('Case Sensitivity', () => {
    it('should be case-sensitive by default', () => {
      const matcher = new PathMatcher();
      const entity = createMockEntity('Hand');
      expect(matcher.match('head.arm.hand', 'head.arm.Hand', entity)).toBe(false);
    });

    it('should support case-insensitive matching', () => {
      const matcher = new PathMatcher({ caseSensitive: false });
      const entity = createMockEntity('Hand');
      expect(matcher.match('head.arm.hand', 'head.arm.Hand', entity)).toBe(true);
      expect(matcher.match('HEAD.ARM.HAND', 'head.arm.hand', entity)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty path segments after filter removal', () => {
      const entity = createMockEntity('test', true);
      expect(matcher.match('[light]', 'test', entity)).toBe(true);
    });

    it('should handle patterns with special regex characters in entity names', () => {
      const entity = createMockEntity('test(1)');
      expect(matcher.match('head.test(1)', 'head.test(1)', entity)).toBe(true);
    });

    it('should handle patterns with dots in entity names', () => {
      // Entity names shouldn't have dots, but let's test escaping works
      const entity = createMockEntity('test.name');
      expect(matcher.match('head.test.name', 'head.test.name', entity)).toBe(true);
    });
  });
});

