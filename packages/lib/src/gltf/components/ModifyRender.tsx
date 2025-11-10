"use client";

import React from 'react';
import { ModifyRenderProps } from '../types.ts';

/**
 * Modify.Render component for modifying existing render components on matched entities
 * Must be a child of <Modify.Node>
 * 
 * @example
 * ```tsx
 * // Remove a render component
 * <Modify.Render remove />
 * 
 * // Modify render properties
 * <Modify.Render castShadows receiveShadows />
 * 
 * // Functional update
 * <Modify.Render castShadows={(val) => !val} />
 * ```
 */
export const ModifyRender: React.FC<ModifyRenderProps> = () => {
  // This component only exists to be processed by ModifyNode
  // It should never actually render
  return null;
};

ModifyRender.displayName = 'ModifyRender';

