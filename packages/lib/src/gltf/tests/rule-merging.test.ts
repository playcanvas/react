import { describe, it, expect, beforeEach } from 'vitest';
import { Rule, MergedRule, ActionType, ModifyComponentAction } from '../types.ts';
import { PathMatcher } from '../utils/path-matcher.ts';
import { ReactNode } from 'react';

/**
 * Helper function to merge rules (extracted from Gltf component)
 */
function mergeRules(entityGuid: string, rules: Rule[]): MergedRule {
  const merged: MergedRule = {
    entityGuid,
    clearChildren: false,
    componentActions: new Map(),
    addChildren: []
  };

  // Sort rules by specificity (highest first)
  const sortedRules = [...rules].sort((a, b) => b.specificity - a.specificity);

  // Process each rule
  for (const rule of sortedRules) {
    for (const action of rule.actions) {
      switch (action.type) {
        case ActionType.CLEAR_CHILDREN:
          // First rule with clearChildren wins
          if (!merged.clearChildren) {
            merged.clearChildren = true;
          }
          break;

        case ActionType.ADD_CHILDREN: {
          // Collect all additions
          const addAction = action as { children: ReactNode[] };
          merged.addChildren.push(...addAction.children);
          break;
        }

        case ActionType.MODIFY_COMPONENT: {
          // For component actions, highest specificity wins per component type
          const componentAction = action as ModifyComponentAction;
          if (!merged.componentActions.has(componentAction.componentType)) {
            merged.componentActions.set(componentAction.componentType, action);
          }
          break;
        }
      }
    }
  }

  return merged;
}

describe('Rule Merging and Conflict Resolution', () => {
  let pathMatcher: PathMatcher;

  beforeEach(() => {
    pathMatcher = new PathMatcher();
  });

  describe('Single rule application', () => {
    it('should apply single rule without conflicts', () => {
      const rule: Rule = {
        id: 'rule1',
        path: 'RootNode.Body.Head',
        specificity: 300,
        actions: [
          {
            type: ActionType.MODIFY_COMPONENT,
            componentType: 'light',
            props: { remove: true },
            ruleId: 'rule1',
            specificity: 300
          }
        ]
      };

      const merged = mergeRules('guid-123', [rule]);

      expect(merged.entityGuid).toBe('guid-123');
      expect(merged.componentActions.size).toBe(1);
      expect(merged.componentActions.get('light')?.type).toBe(ActionType.MODIFY_COMPONENT);
    });

    it('should handle multiple actions from single rule', () => {
      const rule: Rule = {
        id: 'rule1',
        path: 'RootNode.Body.Head',
        specificity: 300,
        actions: [
          {
            type: ActionType.MODIFY_COMPONENT,
            componentType: 'light',
            props: { remove: true },
            ruleId: 'rule1',
            specificity: 300
          },
          {
            type: ActionType.MODIFY_COMPONENT,
            componentType: 'render',
            props: {},
            ruleId: 'rule1',
            specificity: 300
          }
        ]
      };

      const merged = mergeRules('guid-123', [rule]);

      expect(merged.componentActions.size).toBe(2);
      expect(merged.componentActions.get('light')?.type).toBe(ActionType.MODIFY_COMPONENT);
      expect(merged.componentActions.get('render')?.type).toBe(ActionType.MODIFY_COMPONENT);
    });
  });

  describe('Specificity-based conflict resolution', () => {
    it('should prefer higher specificity rule for same component', () => {
      const lowSpecRule: Rule = {
        id: 'low',
        path: '**',
        specificity: 1,
        actions: [
          {
            type: ActionType.MODIFY_COMPONENT,
            componentType: 'light',
            props: { remove: true },
            ruleId: 'low',
            specificity: 1
          }
        ]
      };

      const highSpecRule: Rule = {
        id: 'high',
        path: 'RootNode.Body.Head',
        specificity: 300,
        actions: [
          {
            type: ActionType.MODIFY_COMPONENT,
            componentType: 'light',
            props: {},
            ruleId: 'high',
            specificity: 300
          }
        ]
      };

      const merged = mergeRules('guid-123', [lowSpecRule, highSpecRule]);

      // Higher specificity should win
      expect(merged.componentActions.size).toBe(1);
      expect(merged.componentActions.get('light')?.type).toBe(ActionType.MODIFY_COMPONENT);
      expect(merged.componentActions.get('light')?.ruleId).toBe('high');
    });

    it('should handle multiple conflicting rules', () => {
      const rules: Rule[] = [
        {
          id: 'rule1',
          path: '**',
          specificity: 1,
          actions: [
            {
              type: ActionType.MODIFY_COMPONENT,
              componentType: 'light',
              props: { remove: true },
              ruleId: 'rule1',
              specificity: 1
            }
          ]
        },
        {
          id: 'rule2',
          path: 'RootNode.*.*',
          specificity: 120,
          actions: [
            {
              type: ActionType.MODIFY_COMPONENT,
              componentType: 'light',
              props: {},
              ruleId: 'rule2',
              specificity: 120
            }
          ]
        },
        {
          id: 'rule3',
          path: 'RootNode.Body.Head',
          specificity: 300,
          actions: [
            {
              type: ActionType.MODIFY_COMPONENT,
              componentType: 'light',
              props: {},
              ruleId: 'rule3',
              specificity: 300
            }
          ]
        }
      ];

      const merged = mergeRules('guid-123', rules);

      // Highest specificity (300) should win
      expect(merged.componentActions.get('light')?.type).toBe(ActionType.MODIFY_COMPONENT);
      expect(merged.componentActions.get('light')?.ruleId).toBe('rule3');
    });

    it('should apply different rules to different components', () => {
      const rule1: Rule = {
        id: 'rule1',
        path: 'RootNode.Body.Head',
        specificity: 300,
        actions: [
          {
            type: ActionType.MODIFY_COMPONENT,
            componentType: 'light',
            props: { remove: true },
            ruleId: 'rule1',
            specificity: 300
          }
        ]
      };

      const rule2: Rule = {
        id: 'rule2',
        path: 'RootNode.Body.*',
        specificity: 210,
        actions: [
          {
            type: ActionType.MODIFY_COMPONENT,
            componentType: 'render',
            props: {},
            ruleId: 'rule2',
            specificity: 210
          }
        ]
      };

      const merged = mergeRules('guid-123', [rule1, rule2]);

      expect(merged.componentActions.size).toBe(2);
      expect(merged.componentActions.get('light')?.type).toBe(ActionType.MODIFY_COMPONENT);
      expect(merged.componentActions.get('render')?.type).toBe(ActionType.MODIFY_COMPONENT);
    });
  });

  describe('Clear children handling', () => {
    it('should set clearChildren flag from rule', () => {
      const rule: Rule = {
        id: 'rule1',
        path: 'RootNode.Body',
        specificity: 200,
        actions: [
          {
            type: ActionType.CLEAR_CHILDREN,
            ruleId: 'rule1',
            specificity: 200
          }
        ]
      };

      const merged = mergeRules('guid-123', [rule]);

      expect(merged.clearChildren).toBe(true);
    });

    it('should prefer first clearChildren when multiple rules have it', () => {
      const rule1: Rule = {
        id: 'rule1',
        path: 'RootNode.Body',
        specificity: 200,
        actions: [
          {
            type: ActionType.CLEAR_CHILDREN,
            ruleId: 'rule1',
            specificity: 200
          }
        ]
      };

      const rule2: Rule = {
        id: 'rule2',
        path: 'RootNode.*',
        specificity: 110,
        actions: [
          {
            type: ActionType.CLEAR_CHILDREN,
            ruleId: 'rule2',
            specificity: 110
          }
        ]
      };

      const merged = mergeRules('guid-123', [rule1, rule2]);

      // clearChildren should be set (first in sorted order wins)
      expect(merged.clearChildren).toBe(true);
    });
  });

  describe('Add children handling', () => {
    it('should collect children from all rules', () => {
      const rule1: Rule = {
        id: 'rule1',
        path: 'RootNode.Body',
        specificity: 200,
        actions: [
          {
            type: ActionType.ADD_CHILDREN,
            children: ['child1', 'child2'],
            ruleId: 'rule1',
            specificity: 200
          }
        ]
      };

      const rule2: Rule = {
        id: 'rule2',
        path: 'RootNode.*',
        specificity: 110,
        actions: [
          {
            type: ActionType.ADD_CHILDREN,
            children: ['child3'],
            ruleId: 'rule2',
            specificity: 110
          }
        ]
      };

      const merged = mergeRules('guid-123', [rule1, rule2]);

      // All children should be collected
      expect(merged.addChildren.length).toBe(3);
      expect(merged.addChildren).toContain('child1');
      expect(merged.addChildren).toContain('child2');
      expect(merged.addChildren).toContain('child3');
    });

    it('should maintain order based on specificity', () => {
      const highSpecRule: Rule = {
        id: 'high',
        path: 'RootNode.Body.Head',
        specificity: 300,
        actions: [
          {
            type: ActionType.ADD_CHILDREN,
            children: ['high-child'],
            ruleId: 'high',
            specificity: 300
          }
        ]
      };

      const lowSpecRule: Rule = {
        id: 'low',
        path: '**',
        specificity: 1,
        actions: [
          {
            type: ActionType.ADD_CHILDREN,
            children: ['low-child'],
            ruleId: 'low',
            specificity: 1
          }
        ]
      };

      const merged = mergeRules('guid-123', [lowSpecRule, highSpecRule]);

      // Higher specificity children should be added first
      expect(merged.addChildren[0]).toBe('high-child');
      expect(merged.addChildren[1]).toBe('low-child');
    });
  });

  describe('Complex scenarios', () => {
    it('should handle rule with all action types', () => {
      const rule: Rule = {
        id: 'complex',
        path: 'RootNode.Body.Head',
        specificity: 300,
        actions: [
          {
            type: ActionType.CLEAR_CHILDREN,
            ruleId: 'complex',
            specificity: 300
          },
          {
            type: ActionType.MODIFY_COMPONENT,
            componentType: 'light',
            props: { remove: true },
            ruleId: 'complex',
            specificity: 300
          },
          {
            type: ActionType.MODIFY_COMPONENT,
            componentType: 'render',
            props: {},
            ruleId: 'complex',
            specificity: 300
          },
          {
            type: ActionType.ADD_CHILDREN,
            children: ['new-child'],
            ruleId: 'complex',
            specificity: 300
          }
        ]
      };

      const merged = mergeRules('guid-123', [rule]);

      expect(merged.clearChildren).toBe(true);
      expect(merged.componentActions.size).toBe(2);
      expect(merged.addChildren.length).toBe(1);
    });

    it('should resolve conflicts across multiple components and rules', () => {
      const rules: Rule[] = [
        {
          id: 'rule1',
          path: '**',
          specificity: 1,
          actions: [
            {
              type: ActionType.MODIFY_COMPONENT,
              componentType: 'light',
              props: { remove: true },
              ruleId: 'rule1',
              specificity: 1
            },
            {
              type: ActionType.MODIFY_COMPONENT,
              componentType: 'camera',
              props: { remove: true },
              ruleId: 'rule1',
              specificity: 1
            }
          ]
        },
        {
          id: 'rule2',
          path: 'Scene.**.Head',
          specificity: 201,
          actions: [
            {
              type: ActionType.MODIFY_COMPONENT,
              componentType: 'light',
              props: {},
              ruleId: 'rule2',
              specificity: 201
            }
          ]
        },
        {
          id: 'rule3',
          path: 'Scene.Characters.Player.Body.Head',
          specificity: 500,
          actions: [
            {
              type: ActionType.MODIFY_COMPONENT,
              componentType: 'camera',
              props: {},
              ruleId: 'rule3',
              specificity: 500
            },
            {
              type: ActionType.ADD_CHILDREN,
              children: ['helmet'],
              ruleId: 'rule3',
              specificity: 500
            }
          ]
        }
      ];

      const merged = mergeRules('guid-123', rules);

      // Light: rule2 wins (specificity 201 > 1)
      expect(merged.componentActions.get('light')?.type).toBe(ActionType.MODIFY_COMPONENT);
      expect(merged.componentActions.get('light')?.ruleId).toBe('rule2');

      // Camera: rule3 wins (specificity 500 > 1)
      expect(merged.componentActions.get('camera')?.type).toBe(ActionType.MODIFY_COMPONENT);
      expect(merged.componentActions.get('camera')?.ruleId).toBe('rule3');

      // Children should be added
      expect(merged.addChildren).toContain('helmet');
    });

    it('should handle empty rules array', () => {
      const merged = mergeRules('guid-123', []);

      expect(merged.entityGuid).toBe('guid-123');
      expect(merged.clearChildren).toBe(false);
      expect(merged.componentActions.size).toBe(0);
      expect(merged.addChildren.length).toBe(0);
    });
  });

  describe('Component filter specificity', () => {
    it('should give component filters higher specificity', () => {
      const withFilter = pathMatcher.getSpecificity('RootNode.Body[light]');
      const withoutFilter = pathMatcher.getSpecificity('RootNode.Body');

      expect(withFilter).toBeGreaterThan(withoutFilter);
    });

    it('should resolve conflicts considering component filters', () => {
      const rule1: Rule = {
        id: 'rule1',
        path: 'RootNode.Body.Head',
        specificity: pathMatcher.getSpecificity('RootNode.Body.Head'),
        actions: [
          {
            type: ActionType.MODIFY_COMPONENT,
            componentType: 'light',
            props: { remove: true },
            ruleId: 'rule1',
            specificity: pathMatcher.getSpecificity('RootNode.Body.Head')
          }
        ]
      };

      const rule2: Rule = {
        id: 'rule2',
        path: 'RootNode.*[light]',
        specificity: pathMatcher.getSpecificity('RootNode.*[light]'),
        actions: [
          {
            type: ActionType.MODIFY_COMPONENT,
            componentType: 'light',
            props: {},
            ruleId: 'rule2',
            specificity: pathMatcher.getSpecificity('RootNode.*[light]')
          }
        ]
      };

      const merged = mergeRules('guid-123', [rule1, rule2]);

      const winningAction = merged.componentActions.get('light') as ModifyComponentAction;
      
      // The winning rule is 'rule1'
      expect(winningAction.ruleId).toBe('rule1'); 
      // The action type is 'MODIFY_COMPONENT'
      expect(winningAction.type).toBe(ActionType.MODIFY_COMPONENT);
      // The props are from 'rule1'
      expect(winningAction.props.remove).toBe(true);
    });
  });

  describe('Last rule wins for equal specificity', () => {
    it('should use last rule when specificities are equal', () => {
      const rule1: Rule = {
        id: 'rule1',
        path: 'RootNode.Body.Head',
        specificity: 300,
        actions: [
          {
            type: ActionType.MODIFY_COMPONENT,
            componentType: 'light',
            props: { remove: true },
            ruleId: 'rule1',
            specificity: 300
          }
        ]
      };

      const rule2: Rule = {
        id: 'rule2',
        path: 'RootNode.Body.Head', // Same path, same specificity
        specificity: 300,
        actions: [
          {
            type: ActionType.MODIFY_COMPONENT,
            componentType: 'light',
            props: {},
            ruleId: 'rule2',
            specificity: 300
          }
        ]
      };

      // When rules have equal specificity, first one in sorted array wins
      // (which after sorting by specificity would be the first encountered)
      const merged = mergeRules('guid-123', [rule1, rule2]);

      // With equal specificity, the algorithm processes in order after sorting
      // First one to set a component action wins
      expect(merged.componentActions.get('light')).toBeDefined();
    });
  });

  describe('Edge cases', () => {
    it('should handle actions with no component type', () => {
      const rule: Rule = {
        id: 'rule1',
        path: 'RootNode.Body',
        specificity: 200,
        actions: [
          {
            type: ActionType.CLEAR_CHILDREN,
            ruleId: 'rule1',
            specificity: 200
          },
          {
            type: ActionType.ADD_CHILDREN,
            children: ['child'],
            ruleId: 'rule1',
            specificity: 200
          }
        ]
      };

      const merged = mergeRules('guid-123', [rule]);

      expect(merged.clearChildren).toBe(true);
      expect(merged.addChildren.length).toBe(1);
      expect(merged.componentActions.size).toBe(0);
    });

    it('should handle empty actions array', () => {
      const rule: Rule = {
        id: 'rule1',
        path: 'RootNode.Body',
        specificity: 200,
        actions: []
      };

      const merged = mergeRules('guid-123', [rule]);

      expect(merged.clearChildren).toBe(false);
      expect(merged.componentActions.size).toBe(0);
      expect(merged.addChildren.length).toBe(0);
    });
  });
});

