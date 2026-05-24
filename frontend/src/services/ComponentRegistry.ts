/**
 * Component Registry
 *
 * Singleton service that loads and provides access to component metadata.
 * Loads from components-metadata.json generated at build time.
 */

import type {
  ComponentMetadata,
  ComponentCategory,
  ComponentMetadataCollection,
} from '../types/component-metadata';

export class ComponentRegistry {
  private static instance: ComponentRegistry;
  private metadata: Map<string, ComponentMetadata> = new Map();
  private categories: Map<ComponentCategory, ComponentMetadata[]> = new Map();
  private allComponents: ComponentMetadata[] = [];
  private loaded = false;
  private _loadPromise: Promise<void> | null = null;

  private constructor() { }

  /**
   * Get singleton instance
   */
  static getInstance(): ComponentRegistry {
    if (!ComponentRegistry.instance) {
      ComponentRegistry.instance = new ComponentRegistry();
    }
    return ComponentRegistry.instance;
  }

  /**
   * Load metadata from JSON file
   */
  async load(): Promise<void> {
    if (this.loaded) return;
    if (this._loadPromise) return this._loadPromise;
    this._loadPromise = this._doLoad();
    return this._loadPromise;
  }

  /**
   * Returns the load promise so consumers can await registry readiness
   */
  get loadPromise(): Promise<void> {
    return this._loadPromise ?? this.load();
  }

  get isLoaded(): boolean {
    return this.loaded;
  }

  private async _doLoad(): Promise<void> {

    try {
      const response = await fetch('/components-metadata.json');
      if (!response.ok) {
        throw new Error(`Failed to load metadata: ${response.statusText}`);
      }

      const data: ComponentMetadataCollection = await response.json();

      // Inject Raspberry Pi 3 metadata
      data.components.push({
        id: 'raspberry-pi-3',
        tagName: 'wokwi-raspberry-pi-3',
        name: 'Raspberry Pi 3',
        category: 'boards',
        description: 'Raspberry Pi 3 Model B with 40-pin GPIO. Connects to backend QEMU simulator.',
        thumbnail: '<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="#E60049" rx="4"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="10" fill="#FFF">RPi3</text></svg>',
        properties: [],
        defaultValues: {},
        pinCount: 40,
        tags: ['raspberry', 'pi', 'rp3', 'board', 'qemu', 'linux']
      });
      data.components.push({
        id: 'battery-9v',
        tagName: 'wokwi-battery-9v',
        name: '9V Battery',
        category: 'passive',
        description: '9V PP3 model: both terminals must be wired for the pack to be active; nominal 9V (simulation updates only while Run is on).',
        thumbnail: '<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><rect x="18" y="8" width="28" height="48" rx="4" fill="#2a2a2a"/><rect x="22" y="20" width="20" height="22" rx="2" fill="#e8dfc8"/><text x="32" y="35" text-anchor="middle" font-size="10" font-weight="700" fill="#c62828">9V</text><circle cx="26" cy="6" r="4" fill="#c9a227"/><circle cx="38" cy="6" r="4" fill="#c9a227"/></svg>',
        properties: [
          { name: 'voltage', type: 'string', defaultValue: '9V', control: 'text' },
          { name: 'label', type: 'string', defaultValue: 'Battery', control: 'text' },
        ],
        defaultValues: { voltage: '9V', label: 'Battery' },
        pinCount: 2,
        tags: ['battery', '9v', 'power', 'source', 'pp3']
      });

      this.processMetadata(data.components);
      this.loaded = true;

      console.log(`Loaded ${this.allComponents.length} components from metadata`);
    } catch (error) {
      console.error('Failed to load component metadata:', error);
      // Continue with empty registry - app should still work with manual component addition
    }
  }

  /**
   * Process and index metadata
   */
  private processMetadata(components: ComponentMetadata[]): void {
    this.allComponents = components;
    this.metadata.clear();
    this.categories.clear();

    // Index by ID
    components.forEach(component => {
      this.metadata.set(component.id, component);

      // Group by category
      const categoryComponents = this.categories.get(component.category) || [];
      categoryComponents.push(component);
      this.categories.set(component.category, categoryComponents);
    });
  }

  /**
   * Get all components
   */
  getAllComponents(): ComponentMetadata[] {
    return [...this.allComponents];
  }

  /**
   * Get components by category
   */
  getByCategory(category: ComponentCategory): ComponentMetadata[] {
    return this.categories.get(category) || [];
  }

  /**
   * Get component by ID
   */
  getById(id: string): ComponentMetadata | undefined {
    return this.metadata.get(id);
  }

  /**
   * Search components by query (name, description, tags)
   */
  search(query: string): ComponentMetadata[] {
    if (!query.trim()) {
      return this.getAllComponents();
    }

    const lowerQuery = query.toLowerCase();
    return this.allComponents.filter(component => {
      return (
        component.name.toLowerCase().includes(lowerQuery) ||
        component.id.toLowerCase().includes(lowerQuery) ||
        component.description?.toLowerCase().includes(lowerQuery) ||
        component.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    });
  }

  /**
   * Get all available categories
   */
  getCategories(): ComponentCategory[] {
    return Array.from(this.categories.keys());
  }

  /**
   * Reload metadata (for hot-reload in dev mode)
   */
  async reload(): Promise<void> {
    this.loaded = false;
    await this.load();
  }

  /**
   * Get component count
   */
  getComponentCount(): number {
    return this.allComponents.length;
  }

  /**
   * Get category display name
   */
  static getCategoryDisplayName(category: ComponentCategory): string {
    const displayNames: Record<ComponentCategory, string> = {
      boards: 'Boards',
      sensors: 'Sensors',
      displays: 'Displays',
      input: 'Input',
      output: 'Output',
      motors: 'Motors',
      communication: 'Communication',
      passive: 'Passive',
      other: 'Other',
    };
    return displayNames[category] || category;
  }
}

// Auto-load on module import
const registry = ComponentRegistry.getInstance();
registry.load();



export default registry;
