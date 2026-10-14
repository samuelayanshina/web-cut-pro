import { FCPLibrary, FCPEvent, FCPProject, FCPSmartCollection, MediaAsset, AudioRole } from '../types/fcp';

/**
 * Final Cut Pro Library Hierarchy Engine (.fcpbundle structure)
 * Replicates the authentic Apple Final Cut Pro container hierarchy:
 * Library -> Events -> Projects (Sequences) & Media Assets -> Smart Collections.
 */
export class LibraryHierarchyEngine {
  /**
   * Initializes a pristine FCP Library bundle
   */
  public static createDefaultLibrary(initialProject: FCPProject, mediaAssetIds: string[]): FCPLibrary {
    const defaultEventId = `event_${Date.now()}`;
    const initialEvent: FCPEvent = {
      id: defaultEventId,
      name: 'Event 1 - Production Cut',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      projects: [initialProject],
      mediaAssetIds: [...mediaAssetIds]
    };

    const smartCollections: FCPSmartCollection[] = [
      { id: 'sc_all_video', name: 'All Video', filterType: 'all_video' },
      { id: 'sc_all_audio', name: 'All Audio', filterType: 'all_audio' },
      { id: 'sc_favorites', name: 'Favorites', filterType: 'favorites' },
      { id: 'sc_dialogue', name: 'Dialogue Role', filterType: 'dialogue' },
      { id: 'sc_music', name: 'Music Role', filterType: 'music' },
      { id: 'sc_effects', name: 'Effects Role', filterType: 'effects' },
      { id: 'sc_high_fps', name: 'High Frame Rate (>50fps)', filterType: 'high_fps' }
    ];

    return {
      id: `lib_${Date.now()}`,
      name: 'Web Cut Pro Library.fcpbundle',
      colorProcessing: 'standard',
      events: [initialEvent],
      smartCollections,
      activeEventId: defaultEventId,
      activeProjectId: initialProject.id
    };
  }

  /**
   * Filters media assets according to the selected Smart Collection
   */
  public static filterAssetsBySmartCollection(
    assets: MediaAsset[],
    filterType: FCPSmartCollection['filterType']
  ): MediaAsset[] {
    switch (filterType) {
      case 'all_video':
        return assets.filter(a => a.type === 'video');
      case 'all_audio':
        return assets.filter(a => a.type === 'audio');
      case 'favorites':
        // Favorites: clips that have been marked or tagged (sample simulation)
        return assets.slice(0, Math.max(1, Math.ceil(assets.length / 2)));
      case 'high_fps':
        return assets.filter(a => (a.fps || 24) >= 50);
      case 'dialogue':
      case 'music':
      case 'effects':
        // Audio roles filtering
        return assets.filter(a => a.name.toLowerCase().includes(filterType) || a.type === 'audio');
      default:
        return assets;
    }
  }

  /**
   * Adds a new Event to the Library
   */
  public static addEvent(library: FCPLibrary, eventName: string): FCPLibrary {
    const newEvent: FCPEvent = {
      id: `event_${Date.now()}`,
      name: eventName,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      projects: [],
      mediaAssetIds: []
    };
    return {
      ...library,
      events: [...library.events, newEvent],
      activeEventId: newEvent.id
    };
  }

  /**
   * Adds a new Project to an Event
   */
  public static addProjectToEvent(library: FCPLibrary, eventId: string, project: FCPProject): FCPLibrary {
    return {
      ...library,
      events: library.events.map(ev => {
        if (ev.id !== eventId) return ev;
        return {
          ...ev,
          projects: [...ev.projects, project]
        };
      }),
      activeProjectId: project.id
    };
  }

  /**
   * Serializes the complete Library bundle into a JSON backup archive
   */
  public static exportLibraryBundleJson(library: FCPLibrary): string {
    return JSON.stringify(library, null, 2);
  }

  /**
   * Restores a Library bundle from JSON
   */
  public static importLibraryBundleJson(json: string): FCPLibrary {
    return JSON.parse(json) as FCPLibrary;
  }
}
