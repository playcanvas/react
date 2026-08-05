import type { Vec2, Color, Vec4, Quat, Vec3 } from 'playcanvas';

type BuiltInKeys =
    | 'constructor'
    | 'prototype'
    | 'length'
    | 'name'
    | 'arguments'
    | 'caller'
    | 'apply'
    | 'bind'
    | 'toString'
    | 'valueOf'
    | 'hasOwnProperty'
    | 'isPrototypeOf'
    | 'propertyIsEnumerable'
    | 'toLocaleString';

type IfEquals<X, Y, A, B> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? A : B;

/* eslint-disable @typescript-eslint/consistent-indexed-object-style -- this mapped comparison cannot use record */
type ReadonlyKeys<T> = {
    [P in keyof T]-?: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, never, P>;
}[keyof T];
/* eslint-enable @typescript-eslint/consistent-indexed-object-style */

export type PublicProps<T> = {
    [
        K in keyof T as K extends `_${string}`
            ? never
            : K extends `#${string}`
              ? never
              : T[K] extends (...args: unknown[]) => unknown
                ? never
                : K extends BuiltInKeys
                  ? never
                  : K extends ReadonlyKeys<T>
                    ? never
                    : K
    ]: T[K];
};

export type SubclassOf<T> = new () => T;

export type Serializable<T> = {
    [K in keyof T]: T[K] extends Color
        ? string
        : T[K] extends Vec2
          ? [number, number]
          : T[K] extends Vec3
            ? [number, number, number]
            : T[K] extends Vec4
              ? [number, number, number, number]
              : T[K] extends Quat
                ? [number, number, number, number]
                : T[K];
};
