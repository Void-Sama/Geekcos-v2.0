/**
 * ============================================================
 *  Cloudinary Configuration — ShootGeeks
 * ============================================================
 *
 *  SETUP STEPS:
 *  1. cloudName  → Your Cloud Name from https://console.cloudinary.com
 *  2. folder     → The folder path in your Media Library (e.g. 'shootgeeks/portfolio')
 *  3. tag        → A tag you've applied to all gallery images in Cloudinary
 *                  Required so the gallery can fetch the image list automatically.
 *                  In Cloudinary: select images → Manage → Add tag → type the tag name
 *  4. enabled    → Set to true to serve images from Cloudinary CDN
 *
 *  IMPORTANT — Enable "Resource list" in Cloudinary:
 *  Go to: Settings → Security → uncheck "Resource list" → Save
 *  This allows the gallery to fetch the list of tagged images.
 * ============================================================
 */
const CLOUDINARY_CONFIG = {
    cloudName:         'dbtfmlmgm', // Your Cloudinary name
    folder:            'shootgeeks/portfolio',
    
    // MASTER TAG: Keep this! Apply 'portfolio' to EVERY image you upload
    // so the gallery can fetch the entire list in one network request.
    tag:               'portfolio',          
    
    // Add your 6 Main Categories
    mainTags:          ['wedding', 'corporate', 'birthday', 'debut', 'portrait', 'engagement'],
    
    // Add your 4 Secondary Styles
    secondaryTags:     ['candid', 'documentary', 'emotional moments', 'timeless'],
    enabled:           true,
    defaultTransforms: 'f_auto,q_auto',
};

/**
 * Build a full Cloudinary CDN URL from a resource's public_id.
 *
 * @param {string} publicId      - Cloudinary public ID (e.g. 'shootgeeks/portfolio/IMG_001')
 * @param {string} format        - File format (e.g. 'jpg', 'png')
 * @param {string} [transforms]  - Optional override transformation string
 * @returns {string}             - Full Cloudinary CDN URL
 */
function buildCloudinaryUrl(publicId, format, transforms = CLOUDINARY_CONFIG.defaultTransforms) {
    const base   = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload`;
    const xform  = transforms ? `/${transforms}` : '';
    return `${base}${xform}/${publicId}.${format}`;
}
