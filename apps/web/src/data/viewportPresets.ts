export interface ViewportPreset {
  width: number;
  height: number;
  label: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'shorts';
}

export const viewportPresets: ViewportPreset[] = [
  { width: 1440, height: 900, label: 'Desktop 1440×900', deviceType: 'desktop' },
  { width: 375, height: 667, label: 'Mobile 375×667', deviceType: 'mobile' },
  { width: 768, height: 1024, label: 'Tablet 768×1024', deviceType: 'tablet' },
  { width: 1080, height: 1920, label: 'Shorts 9:16 1080×1920', deviceType: 'shorts' },
  { width: 1080, height: 1080, label: 'Square 1:1 1080×1080', deviceType: 'mobile' },
  { width: 1920, height: 1080, label: 'Landscape 16:9 1920×1080', deviceType: 'desktop' },
];

export const defaultViewportPreset = viewportPresets[0];

export function getViewportPresetByDeviceType(
  deviceType: ViewportPreset['deviceType']
): ViewportPreset[] {
  return viewportPresets.filter((preset) => preset.deviceType === deviceType);
}
