"use client";

import React from 'react';
import { ModifyCameraProps } from '../types.ts';

/**
 * Modify.Camera component for modifying existing camera components on matched entities
 * Must be a child of <Modify.Node>
 * 
 * @example
 * ```tsx
 * // Remove a camera component
 * <Modify.Camera remove />
 * 
 * // Modify camera properties
 * <Modify.Camera fov={60} nearClip={0.1} farClip={1000} />
 * 
 * // Functional update
 * <Modify.Camera fov={(val) => val + 10} />
 * ```
 */
export const ModifyCamera: React.FC<ModifyCameraProps> = () => {
  // This component only exists to be processed by ModifyNode
  // It should never actually render
  return null;
};

ModifyCamera.displayName = 'ModifyCamera';

