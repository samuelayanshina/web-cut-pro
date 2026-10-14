import { MediaAsset } from '../types/fcp';

/**
 * Royalty-free high-definition sample media for immediate live editing and playback
 */
export const SAMPLE_ASSETS: MediaAsset[] = [
  {
    id: 'asset-nature-drone',
    name: 'Coastal Aerial 4K.mp4',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=320&auto=format&fit=crop&q=80',
    duration: 15.0,
    width: 1920,
    height: 1080,
    fps: 30
  },
  {
    id: 'asset-city-timelapse',
    name: 'Tokyo Night Drive.mp4',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=320&auto=format&fit=crop&q=80',
    duration: 15.0,
    width: 1920,
    height: 1080,
    fps: 30
  },
  {
    id: 'asset-wildlife-macro',
    name: 'Wildlife Close-Up.mp4',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?w=320&auto=format&fit=crop&q=80',
    duration: 15.0,
    width: 1920,
    height: 1080,
    fps: 30
  },
  {
    id: 'asset-surf-broll',
    name: 'Ocean Swell B-Roll.mp4',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=320&auto=format&fit=crop&q=80',
    duration: 15.0,
    width: 1920,
    height: 1080,
    fps: 30
  },
  {
    id: 'asset-soundtrack',
    name: 'Cinematic Ambient Score.mp3',
    type: 'audio',
    url: 'https://actions.google.com/sounds/v1/ambiences/daytime_forest_bonfire.ogg',
    duration: 25.0
  },
  {
    id: 'asset-whoosh-sfx',
    name: 'Cinema Sub Whoosh.mp3',
    type: 'audio',
    url: 'https://actions.google.com/sounds/v1/foley/whoosh_heavy_cloth.ogg',
    duration: 3.0
  },
  {
    id: 'asset-solid-dark',
    name: 'Vivid Solid Generator',
    type: 'generator',
    url: '',
    duration: 10.0,
    color: '#0f172a'
  }
];
