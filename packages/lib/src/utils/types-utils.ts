import { Vec2 } from "playcanvas";
import { Color } from "playcanvas";

import { Vec4 } from "playcanvas";
import { Quat } from "playcanvas";
import { Vec3 } from "playcanvas";
import { CssColor } from "./color";

type BuiltInKeys =
  | 'constructor' | 'prototype' | 'length' | 'name'
  | 'arguments' | 'caller' | 'apply' | 'bind'
  | 'toString' | 'valueOf' | 'hasOwnProperty'
  | 'isPrototypeOf' | 'propertyIsEnumerable' | 'toLocaleString';

type IfEquals<X, Y, A, B> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? A : B;

type ReadonlyKeys<T> = {
    [P in keyof T]-?: IfEquals<
      { [Q in P]: T[P] },
      { -readonly [Q in P]: T[P] },
      never,
      P
    >
  }[keyof T];

export type PublicProps<T> = {
  [K in keyof T as
    K extends `_${string}` ? never :
    K extends `#${string}` ? never :
    T[K] extends (...args: unknown[]) => unknown ? never :
    K extends BuiltInKeys ? never :
    K extends ReadonlyKeys<T> ? never :
    K
  ]: T[K];
};


export type Serializable<T> = {
  [K in keyof T]: T[K] extends Color ? CssColor :
                  T[K] extends Vec2 ? [number, number] :
                  T[K] extends Vec3 ? [number, number, number] :
                  T[K] extends Vec4 ? [number, number, number, number] :
                  T[K] extends Quat ? [number, number, number, number] :
                  T[K];
};