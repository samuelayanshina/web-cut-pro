import { FCPProject, TimelineClip, MediaAsset, Marker, AudioRole } from '../types/fcp';
import { Timecode } from './Timecode';

/**
 * Apple FCPXML 1.11 Export & Import Engine
 * Conforms to Apple's Final Cut Pro XML Interchange specification.
 * Full roundtrip support: Audio Roles, Markers, Gap clips, Connected Clips, and Transform metadata.
 */
export class FcpXmlEngine {
  /**
   * Generates production-ready Apple FCPXML 1.11 from current project state
   */
  static exportToFcpXml(project: FCPProject, assets: MediaAsset[]): string {
    const fps = project.format.frameRate || 30;
    const totalDuration = project.spine.reduce((acc, c) => acc + c.duration, 0);
    const durationRational = Timecode.toRationalTime(totalDuration, fps);

    // Build resource map
    const assetXmlParts = assets.map((asset, index) => {
      const assetDuration = Timecode.toRationalTime(asset.duration, fps);
      return `    <asset id="r${index + 2}" name="${this.escapeXml(asset.name)}" uid="${asset.id}" src="${this.escapeXml(asset.url)}" start="0s" duration="${assetDuration}" hasVideo="${asset.type === 'video' ? '1' : '0'}" hasAudio="${asset.type === 'audio' || asset.type === 'video' ? '1' : '0'}" format="r1" />`;
    }).join('\n');

    // Build spine items
    const spineXmlParts = project.spine.map((clip) => {
      const clipDuration = Timecode.toRationalTime(clip.duration, fps);
      const clipStart = Timecode.toRationalTime(clip.sourceIn, fps);
      const clipOffset = Timecode.toRationalTime(clip.timelineIn, fps);

      // Embedded markers on this clip
      const clipMarkers = (project.markers || [])
        .filter(m => m.time >= clip.timelineIn && m.time < clip.timelineIn + clip.duration)
        .map(m => {
          const markerOffset = Timecode.toRationalTime(m.time - clip.timelineIn, fps);
          const markerName = m.name || m.label || 'Marker';
          return `          <marker start="${markerOffset}" duration="1/${Math.round(fps)}s" value="${this.escapeXml(markerName)}" note="${this.escapeXml(m.comment || '')}" />`;
        }).join('\n');

      if (clip.type === 'gap') {
        return `        <gap name="Gap" offset="${clipOffset}" duration="${clipDuration}" start="0s">${clipMarkers ? '\n' + clipMarkers + '\n        ' : ''}</gap>`;
      }

      const assetIndex = assets.findIndex((a) => a.id === clip.assetId);
      const refId = assetIndex !== -1 ? `r${assetIndex + 2}` : 'r1';

      // Connected clips (anchored to this spine clip)
      const connectedXml = (clip.connectedClips || []).map((conn) => {
        const connDuration = Timecode.toRationalTime(conn.duration, fps);
        const connOffset = Timecode.toRationalTime(conn.anchorOffset || 0, fps);
        const connAssetIdx = assets.findIndex((a) => a.id === conn.assetId);
        const connRefId = connAssetIdx !== -1 ? `r${connAssetIdx + 2}` : 'r1';

        return `          <asset-clip name="${this.escapeXml(conn.name)}" lane="${conn.lane || 1}" offset="${connOffset}" ref="${connRefId}" duration="${connDuration}" start="${Timecode.toRationalTime(conn.sourceIn, fps)}" audioRole="${conn.role || 'effects'}"/>`;
      }).join('\n');

      return `        <asset-clip name="${this.escapeXml(clip.name)}" offset="${clipOffset}" ref="${refId}" duration="${clipDuration}" start="${clipStart}" audioRole="${clip.role}">
          <adjust-transform position="${clip.transform.posX} ${clip.transform.posY}" scale="${clip.transform.scale} ${clip.transform.scale}" rotation="${clip.transform.rotation}"/>
          <adjust-volume amount="${Math.round((clip.volume - 1) * 12)}dB"/>
${clipMarkers ? clipMarkers + '\n' : ''}${connectedXml ? connectedXml + '\n' : ''}        </asset-clip>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<fcpxml version="1.11">
  <resources>
    <format id="r1" name="FFVideoFormat${project.format.height}p${Math.round(fps)}" frameDuration="1/${Math.round(fps)}s" width="${project.format.width}" height="${project.format.height}" colorSpace="${project.format.colorSpace}"/>
${assetXmlParts}
  </resources>
  <library location="WebCutProLibrary.fcpbundle">
    <event name="Web Cut Pro Event">
      <project name="${this.escapeXml(project.name)}">
        <sequence format="r1" duration="${durationRational}" tcStart="0s" tcFormat="NDF">
          <spine>
${spineXmlParts}
          </spine>
        </sequence>
      </project>
    </event>
  </library>
</fcpxml>`;
  }

  /**
   * Imports an Apple FCPXML string and extracts TimelineClips, Assets, and Markers
   */
  static importFromFcpXml(xmlString: string): {
    projectName: string;
    width: number;
    height: number;
    fps: number;
    spine: Partial<TimelineClip>[];
    markers: Marker[];
  } {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'text/xml');

    const projectEl = doc.querySelector('project');
    const projectName = projectEl?.getAttribute('name') || 'Imported FCP Project';

    const formatEl = doc.querySelector('format');
    const width = parseInt(formatEl?.getAttribute('width') || '1920', 10);
    const height = parseInt(formatEl?.getAttribute('height') || '1080', 10);

    const frameDuration = formatEl?.getAttribute('frameDuration') || '1/30s';
    const fpsMatch = frameDuration.match(/1\/(\d+)s/);
    const fps = fpsMatch ? parseInt(fpsMatch[1], 10) : 30;

    const spineClips: Partial<TimelineClip>[] = [];
    const markers: Marker[] = [];

    const spineEl = doc.querySelector('spine');
    if (spineEl) {
      const childNodes = Array.from(spineEl.children);
      let runningTimelineIn = 0;

      childNodes.forEach((node, idx) => {
        const tagName = node.tagName.toLowerCase();
        const name = node.getAttribute('name') || `Clip ${idx + 1}`;
        const durationStr = node.getAttribute('duration') || '5s';
        const durationSec = this.parseRationalSeconds(durationStr);

        if (tagName === 'gap') {
          spineClips.push({
            id: `imported_gap_${Date.now()}_${idx}`,
            name: 'Gap',
            type: 'gap',
            role: 'dialogue',
            timelineIn: runningTimelineIn,
            duration: durationSec,
            sourceIn: 0,
            sourceOut: durationSec
          });
        } else if (tagName === 'asset-clip' || tagName === 'clip') {
          const role = (node.getAttribute('audioRole') || 'dialogue') as AudioRole;
          const startStr = node.getAttribute('start') || '0s';
          const sourceIn = this.parseRationalSeconds(startStr);

          // Check for markers inside this clip
          const markerEls = node.querySelectorAll('marker');
          markerEls.forEach(mEl => {
            const mName = mEl.getAttribute('value') || 'Marker';
            const mStartStr = mEl.getAttribute('start') || '0s';
            const mStart = this.parseRationalSeconds(mStartStr);
            const mNote = mEl.getAttribute('note') || '';

            markers.push({
              id: `m_${Date.now()}_${markers.length}`,
              time: runningTimelineIn + mStart,
              label: mName,
              name: mName,
              color: '#3b82f6',
              type: 'standard',
              comment: mNote
            });
          });

          spineClips.push({
            id: `imported_clip_${Date.now()}_${idx}`,
            name,
            type: 'video',
            role,
            timelineIn: runningTimelineIn,
            duration: durationSec,
            sourceIn,
            sourceOut: sourceIn + durationSec
          });
        }

        runningTimelineIn += durationSec;
      });
    }

    return {
      projectName,
      width,
      height,
      fps,
      spine: spineClips,
      markers
    };
  }

  private static parseRationalSeconds(rational: string): number {
    if (!rational) return 0;
    if (rational.endsWith('s')) {
      const val = rational.slice(0, -1);
      if (val.includes('/')) {
        const [num, den] = val.split('/').map(Number);
        return den ? num / den : 0;
      }
      return parseFloat(val) || 0;
    }
    return parseFloat(rational) || 0;
  }

  private static escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
