import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Entity } from './Entity.tsx';
import { ParentContext } from './hooks/index.ts';
import { ReactNode, useContext } from 'react';
import { Entity as PcEntity } from 'playcanvas';
import { TEST_ENTITY_PROPS } from '../test/constants.ts';
import { Application } from './Application.tsx';

const renderWithProviders = (ui: ReactNode) => {
  return render(
    <Application>
      {ui}
    </Application>
  );
};

describe('Entity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NODE_ENV', 'development');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.skip('renders with default props', () => {
    const { app } = renderWithProviders(<Entity />);
    
    // Verify that the entity was created and added to the app
    expect(app.root.children.length).toBe(1);
    const entity = app.root.children[0];
    expect(entity).toBeInstanceOf(PcEntity);
  });

  it.skip('applies custom props correctly', () => {
    const { app } = renderWithProviders(<Entity {...TEST_ENTITY_PROPS} />);
    
    const entity = app.root.children[0];
    expect(entity.name).toBe(TEST_ENTITY_PROPS.name);
    
    const pos = entity.getLocalPosition();
    expect([pos.x, pos.y, pos.z]).toEqual(TEST_ENTITY_PROPS.position);
    
    const scale = entity.getLocalScale();
    expect([scale.x, scale.y, scale.z]).toEqual(TEST_ENTITY_PROPS.scale);
    
    const rot = entity.getLocalEulerAngles();
    expect([rot.x, rot.y, rot.z]).toEqual(TEST_ENTITY_PROPS.rotation);
  });

  it.skip('handles pointer events correctly', () => {
    const onPointerDown = vi.fn();
    const onPointerUp = vi.fn();
    const onPointerOver = vi.fn();
    const onPointerOut = vi.fn();
    const onClick = vi.fn();

    const { app } = renderWithProviders(
      <Entity
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        onClick={onClick}
      />
    );

    const entity = app.root.children[0];
    
    // Simulate events
    entity.fire('pointerdown');
    expect(onPointerDown).toHaveBeenCalled();
    
    entity.fire('pointerup');
    expect(onPointerUp).toHaveBeenCalled();
    
    entity.fire('pointerover');
    expect(onPointerOver).toHaveBeenCalled();
    
    entity.fire('pointerout');
    expect(onPointerOut).toHaveBeenCalled();
    
    entity.fire('click');
    expect(onClick).toHaveBeenCalled();
  });

  it.skip('provides parent context to children', () => {
    const ChildComponent = () => {
      const parent = useContext(ParentContext);
      return <div data-testid="child">{parent ? 'Has parent' : 'No parent'}</div>;
    };

    renderWithProviders(
      <Entity>
        <ChildComponent />
      </Entity>
    );

    expect(screen.getByTestId('child').textContent).toBe('Has parent');
  });

  it.skip('cleans up resources on unmount', () => {
    const { app, unmount } = renderWithProviders(<Entity />);
    const entity = app.root.children[0];
    const destroySpy = vi.spyOn(entity, 'destroy');
    
    unmount();

    expect(destroySpy).toHaveBeenCalled();
    expect(app.root.children.length).toBe(0);
  });

  it.skip('validates prop types correctly', async () => {
    const consoleSpy = vi.spyOn(console, 'warn');
    
    renderWithProviders(
      <Entity position={[1, 2, 3, 4] as unknown as [number, number, number]} />
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Invalid value for prop "position"')
    );

    renderWithProviders(
      <Entity rotation={[1, 2, 3, 4] as unknown as [number, number, number]} />
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Invalid value for prop "rotation"')
    );
  });
}); 