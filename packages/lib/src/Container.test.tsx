import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Container } from './Container';
import { Asset, Entity } from 'playcanvas';
import { ReactNode } from 'react';
import { Application } from './Application';
import React from 'react';

const renderWithProviders = (ui: ReactNode) => {
    return render(
      <Application deviceTypes={["null"]}>
        {ui}
      </Application>
    );
};

describe('Container', () => {
  let mockAsset: Asset;
  let mockEntity: Entity;

  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'development');
    
    // Create a real Entity for the asset to return
    mockEntity = new Entity();
    
    // Create a real Asset with a mock resource
    mockAsset = new Asset('test-container', 'container', { url: 'test.container', filename: 'test.container' });
    mockAsset.resource = {
      instantiateRenderEntity: vi.fn().mockReturnValue(mockEntity)
    };
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
    mockEntity.destroy();
  });

  it.skip('renders with default props', () => {
    const { app } = renderWithProviders(
      <Container asset={mockAsset} data-testid="container">
        <div>Test Content</div>
      </Container>
    );

    const container = screen.getByTestId('container');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('playcanvas-container');
    
    // Verify the entity was added to the app
    expect(app.root.children).toContain(mockEntity);
  });

  it.skip('renders children correctly', () => {
    renderWithProviders(
      <Container asset={mockAsset} data-testid="container">
        <div data-testid="child">Test Content</div>
      </Container>
    );

    const child = screen.getByTestId('child');
    expect(child).toBeInTheDocument();
    expect(child).toHaveTextContent('Test Content');
  });

  it.skip('applies custom className', () => {
    renderWithProviders(
      <Container asset={mockAsset} className="custom-class" data-testid="container">
        <div>Test Content</div>
      </Container>
    );

    const container = screen.getByTestId('container');
    expect(container).toHaveClass('playcanvas-container', 'custom-class');
  });

  it.skip('applies custom styles', () => {
    const customStyles = { backgroundColor: 'red' };
    renderWithProviders(
      <Container asset={mockAsset} style={customStyles} data-testid="container">
        <div>Test Content</div>
      </Container>
    );

    const container = screen.getByTestId('container');
    expect(container).toHaveStyle({ backgroundColor: 'red' });
  });

  it.skip('handles click events', () => {
    const handleClick = vi.fn();
    renderWithProviders(
      <Container asset={mockAsset} onClick={handleClick} data-testid="container">
        <div>Test Content</div>
      </Container>
    );

    const container = screen.getByTestId('container');
    container.click();
    expect(handleClick).toHaveBeenCalled();
  });

  it.skip('validates prop types in development', () => {
    const consoleSpy = vi.spyOn(console, 'warn');
    renderWithProviders(
      <Container asset={mockAsset} className={123 as unknown as string} data-testid="container">
        <div>Test Content</div>
      </Container>
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Invalid prop `className` of type `number`')
    );
  });

  it.skip('cleans up resources on unmount', () => {
    const { unmount } = renderWithProviders(
      <Container asset={mockAsset} data-testid="container">
        <div>Test Content</div>
      </Container>
    );

    const destroySpy = vi.spyOn(mockEntity, 'destroy');
    unmount();
    expect(destroySpy).toHaveBeenCalled();
  });
}); 