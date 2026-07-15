import { describe, expect, it } from 'vitest';
import {
  editorialImagePlacements,
  getEditorialImage,
} from '../../lib/content/editorial-images';

describe('editorial image manifest', () => {
  it('resolves desktop and mobile variants from the shared asset catalog', () => {
    const desktop = getEditorialImage('home.hero');
    const mobile = getEditorialImage('home.hero', 'mobile');

    expect(desktop.src).toBe('/Highlights/AF-10974.jpg');
    expect(mobile.src).toBe('/Highlights/AF-11061.jpg');
    expect(desktop.alt).toBeTruthy();
    expect(mobile.alt).toBe(desktop.alt);
  });

  it('keeps homepage editorial placements free of same-page desktop duplicates', () => {
    const homeAssetIds = Object.entries(editorialImagePlacements)
      .filter(([, placement]) => placement.page === 'home')
      .map(([, placement]) => placement.desktopAsset.assetId);

    expect(new Set(homeAssetIds).size).toBe(homeAssetIds.length);
  });

  it('uses local highlights assets for every managed placement', () => {
    for (const placementId of Object.keys(editorialImagePlacements) as Array<keyof typeof editorialImagePlacements>) {
      const placement = getEditorialImage(placementId);

      expect(placement.src.startsWith('/Highlights/')).toBe(true);
      expect(placement.alt.length).toBeGreaterThan(20);
    }
  });
});
