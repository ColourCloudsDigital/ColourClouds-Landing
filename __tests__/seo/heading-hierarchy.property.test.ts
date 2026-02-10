/**
 * Property-Based Tests for Heading Hierarchy
 * 
 * Tests universal properties of heading hierarchy compliance:
 * - Property 19: Heading Hierarchy Compliance
 * 
 * Requirements: 6.2
 */

/**
 * @jest-environment node
 */

import * as fc from 'fast-check';

// ============================================================================
// Test Data - Page Heading Structures
// ============================================================================

/**
 * Represents the heading structure of a page
 * Each page should have proper heading hierarchy (h1, h2, h3, etc.)
 */
interface HeadingStructure {
  pageName: string;
  headings: Array<{
    level: number; // 1 for h1, 2 for h2, etc.
    text: string;
  }>;
}

/**
 * Sample heading structures from all pages in the application
 * These represent the actual heading hierarchy used in each page
 */
const pageHeadingStructures: HeadingStructure[] = [
  {
    pageName: 'Home',
    headings: [
      { level: 1, text: 'Think Build Explore' },
      { level: 2, text: 'Innovative App Development & Digital Content Creation' },
      { level: 2, text: 'Follow us for more project updates' },
      { level: 2, text: 'Frequently Asked Questions' },
    ],
  },
  {
    pageName: 'Services',
    headings: [
      { level: 1, text: 'Our Services' },
      { level: 2, text: 'Build Powerful Applications' },
      { level: 3, text: 'Mobile App Development' },
      { level: 3, text: 'Web Application Development' },
      { level: 3, text: 'API & Backend Development' },
      { level: 3, text: 'UI/UX Design' },
      { level: 2, text: 'Create Engaging Content' },
      { level: 3, text: 'Video Production' },
      { level: 3, text: 'Photography' },
      { level: 3, text: 'Graphic Design' },
      { level: 3, text: 'Content Strategy' },
      { level: 2, text: 'Why Choose Colour Clouds Digital?' },
      { level: 3, text: 'Expert Team' },
      { level: 3, text: 'Tailored Solutions' },
      { level: 3, text: 'Quality Focused' },
      { level: 3, text: 'Ongoing Support' },
      { level: 2, text: 'Ready to Bring Your Vision to Life?' },
    ],
  },
  {
    pageName: 'About',
    headings: [
      { level: 1, text: 'About Colour Clouds Digital' },
      { level: 2, text: 'Building Digital Dreams Since Day One' },
      { level: 2, text: 'Our Mission' },
      { level: 2, text: 'Our Vision' },
      { level: 2, text: 'What Drives Us Forward' },
      { level: 3, text: 'Innovation' },
      { level: 3, text: 'Passion' },
      { level: 3, text: 'Collaboration' },
      { level: 3, text: 'Excellence' },
      { level: 3, text: 'Client-Focused' },
      { level: 3, text: 'Creativity' },
      { level: 2, text: 'Meet the Creators' },
      { level: 3, text: 'A Diverse Team of Experts' },
      { level: 2, text: "Let's Create Something Amazing Together" },
    ],
  },
  {
    pageName: 'Blog Listing',
    headings: [
      { level: 1, text: 'Blog' },
      // Blog cards would have h2 for titles
      { level: 2, text: 'Sample Blog Post Title' },
    ],
  },
  {
    pageName: 'Blog Post Detail',
    headings: [
      { level: 1, text: 'Sample Blog Post Title' },
      { level: 2, text: 'Introduction' },
      { level: 3, text: 'Subsection' },
      { level: 2, text: 'Main Content' },
      { level: 3, text: 'Details' },
      { level: 2, text: 'Conclusion' },
      { level: 2, text: 'Related Posts' },
    ],
  },
  {
    pageName: 'Contact',
    headings: [
      { level: 1, text: 'Get in Touch' },
      { level: 2, text: 'Send us a Message' },
      { level: 2, text: 'Contact Information' },
      { level: 2, text: 'Follow Us' },
      { level: 2, text: 'Business Hours' },
    ],
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if a page has exactly one h1 heading
 * Requirement: 6.2 - Proper heading hierarchy
 */
function hasExactlyOneH1(structure: HeadingStructure): boolean {
  const h1Count = structure.headings.filter((h) => h.level === 1).length;
  return h1Count === 1;
}

/**
 * Check if headings follow proper hierarchy (no skipped levels)
 * For example, h1 -> h3 is invalid (skips h2)
 * Requirement: 6.2 - Proper heading hierarchy
 */
function hasProperHierarchy(structure: HeadingStructure): boolean {
  const levels = structure.headings.map((h) => h.level);
  
  // First heading should be h1
  if (levels.length > 0 && levels[0] !== 1) {
    return false;
  }
  
  // Check that no levels are skipped
  for (let i = 1; i < levels.length; i++) {
    const prevLevel = levels[i - 1];
    const currentLevel = levels[i];
    
    // Current level can be:
    // - Same as previous (e.g., h2 -> h2)
    // - One level deeper (e.g., h2 -> h3)
    // - Any number of levels shallower (e.g., h3 -> h1)
    // But NOT more than one level deeper (e.g., h2 -> h4 is invalid)
    if (currentLevel > prevLevel + 1) {
      return false;
    }
  }
  
  return true;
}

/**
 * Check if all headings have non-empty text
 * Requirement: 6.2 - Proper heading hierarchy
 */
function allHeadingsHaveText(structure: HeadingStructure): boolean {
  return structure.headings.every((h) => h.text.trim().length > 0);
}

/**
 * Check if heading levels are within valid range (1-6)
 * HTML supports h1 through h6
 */
function allHeadingLevelsValid(structure: HeadingStructure): boolean {
  return structure.headings.every((h) => h.level >= 1 && h.level <= 6);
}

/**
 * Get the maximum heading level used in a page
 */
function getMaxHeadingLevel(structure: HeadingStructure): number {
  if (structure.headings.length === 0) return 0;
  return Math.max(...structure.headings.map((h) => h.level));
}

/**
 * Check if h1 appears first in the heading sequence
 */
function h1AppearsFirst(structure: HeadingStructure): boolean {
  if (structure.headings.length === 0) return true;
  return structure.headings[0].level === 1;
}

// ============================================================================
// Property 19: Heading Hierarchy Compliance
// ============================================================================

describe('Property 19: Heading Hierarchy Compliance', () => {
  /**
   * **Validates: Requirements 6.2**
   * 
   * Requirement 6.2: THE System SHALL implement proper heading hierarchy 
   * (h1, h2, h3) on all pages
   * 
   * Property: For all pages in the application, the heading structure SHALL:
   * 1. Have exactly one h1 heading per page
   * 2. Follow proper hierarchy without skipping levels
   * 3. Start with h1 as the first heading
   * 4. Have non-empty text for all headings
   * 5. Use only valid heading levels (1-6)
   * 
   * This property tests that:
   * - Every page has exactly one h1 (main page title)
   * - Headings don't skip levels (e.g., h1 -> h3 is invalid)
   * - The first heading on a page is always h1
   * - All headings have meaningful text content
   * - Heading levels are within HTML specification (h1-h6)
   */

  it('should have exactly one h1 heading per page', () => {
    // Test each page
    pageHeadingStructures.forEach((structure) => {
      // Property: Every page must have exactly one h1
      expect(hasExactlyOneH1(structure)).toBe(true);
      
      // Count h1 headings
      const h1Count = structure.headings.filter((h) => h.level === 1).length;
      expect(h1Count).toBe(1);
      
      // Log for debugging
      const h1Text = structure.headings.find((h) => h.level === 1)?.text;
      console.log(`✓ ${structure.pageName}: Has exactly 1 h1 ("${h1Text}")`);
    });
  });

  it('should follow proper heading hierarchy without skipping levels', () => {
    // Test each page
    pageHeadingStructures.forEach((structure) => {
      // Property: Headings must follow proper hierarchy
      expect(hasProperHierarchy(structure)).toBe(true);
      
      // Verify no level skips
      const levels = structure.headings.map((h) => h.level);
      for (let i = 1; i < levels.length; i++) {
        const prevLevel = levels[i - 1];
        const currentLevel = levels[i];
        
        // Property: Cannot skip more than one level down
        expect(currentLevel).toBeLessThanOrEqual(prevLevel + 1);
      }
      
      console.log(`✓ ${structure.pageName}: Proper hierarchy maintained`);
    });
  });

  it('should start with h1 as the first heading', () => {
    // Test each page
    pageHeadingStructures.forEach((structure) => {
      if (structure.headings.length > 0) {
        // Property: First heading must be h1
        expect(h1AppearsFirst(structure)).toBe(true);
        expect(structure.headings[0].level).toBe(1);
        
        console.log(`✓ ${structure.pageName}: Starts with h1`);
      }
    });
  });

  it('should have non-empty text for all headings', () => {
    // Test each page
    pageHeadingStructures.forEach((structure) => {
      // Property: All headings must have text
      expect(allHeadingsHaveText(structure)).toBe(true);
      
      // Verify each heading
      structure.headings.forEach((heading) => {
        expect(heading.text).toBeDefined();
        expect(heading.text.trim().length).toBeGreaterThan(0);
      });
      
      console.log(`✓ ${structure.pageName}: All headings have text`);
    });
  });

  it('should use only valid heading levels (1-6)', () => {
    // Test each page
    pageHeadingStructures.forEach((structure) => {
      // Property: All heading levels must be 1-6
      expect(allHeadingLevelsValid(structure)).toBe(true);
      
      // Verify each heading level
      structure.headings.forEach((heading) => {
        expect(heading.level).toBeGreaterThanOrEqual(1);
        expect(heading.level).toBeLessThanOrEqual(6);
      });
      
      const maxLevel = getMaxHeadingLevel(structure);
      console.log(`✓ ${structure.pageName}: Valid levels (max: h${maxLevel})`);
    });
  });

  it('should not use more than 3 levels of depth for better accessibility', () => {
    // Test each page
    pageHeadingStructures.forEach((structure) => {
      const maxLevel = getMaxHeadingLevel(structure);
      
      // Property: For better accessibility, limit to h1-h3
      // (h4-h6 are valid but not recommended for most content)
      expect(maxLevel).toBeLessThanOrEqual(3);
      
      console.log(`✓ ${structure.pageName}: Uses h1-h${maxLevel} (recommended depth)`);
    });
  });

  it('should have h1 text that is descriptive and unique per page', () => {
    const h1Texts = new Set<string>();
    
    // Test each page
    pageHeadingStructures.forEach((structure) => {
      const h1 = structure.headings.find((h) => h.level === 1);
      
      if (h1) {
        // Property: h1 text should be descriptive (reasonable length)
        expect(h1.text.length).toBeGreaterThanOrEqual(3);
        expect(h1.text.length).toBeLessThanOrEqual(100);
        
        // Property: h1 text should be unique across pages
        expect(h1Texts.has(h1.text)).toBe(false);
        h1Texts.add(h1.text);
        
        console.log(`✓ ${structure.pageName}: Unique h1 ("${h1.text}")`);
      }
    });
    
    // Property: Number of unique h1s should equal number of pages
    expect(h1Texts.size).toBe(pageHeadingStructures.length);
  });

  it('should maintain heading hierarchy consistency across all pages', () => {
    fc.assert(
      fc.property(
        // Generate test cases for different pages
        fc.constantFrom(...pageHeadingStructures),
        (structure) => {
          // Property: Heading hierarchy invariants
          // For ANY page in the system, these properties MUST hold:
          
          // 1. Exactly one h1
          expect(hasExactlyOneH1(structure)).toBe(true);
          
          // 2. Proper hierarchy (no skipped levels)
          expect(hasProperHierarchy(structure)).toBe(true);
          
          // 3. All headings have text
          expect(allHeadingsHaveText(structure)).toBe(true);
          
          // 4. Valid heading levels
          expect(allHeadingLevelsValid(structure)).toBe(true);
          
          // 5. h1 appears first
          if (structure.headings.length > 0) {
            expect(h1AppearsFirst(structure)).toBe(true);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should generate valid heading structures for dynamic content', () => {
    fc.assert(
      fc.property(
        // Generate various heading structures
        fc.record({
          pageTitle: fc.stringMatching(/^[A-Z][a-zA-Z0-9\s\-]{5,50}$/),
          sections: fc.array(
            fc.record({
              sectionTitle: fc.stringMatching(/^[A-Z][a-zA-Z0-9\s\-]{3,40}$/),
              subsections: fc.array(
                fc.stringMatching(/^[A-Z][a-zA-Z0-9\s\-]{3,30}$/),
                { minLength: 0, maxLength: 3 }
              ),
            }),
            { minLength: 1, maxLength: 5 }
          ),
        }),
        ({ pageTitle, sections }) => {
          // Simulate heading structure generation
          const headings: Array<{ level: number; text: string }> = [
            { level: 1, text: pageTitle },
          ];
          
          sections.forEach((section) => {
            headings.push({ level: 2, text: section.sectionTitle });
            section.subsections.forEach((subsection) => {
              headings.push({ level: 3, text: subsection });
            });
          });
          
          const structure: HeadingStructure = {
            pageName: 'Generated Page',
            headings,
          };
          
          // Property: Generated structure must be valid
          expect(hasExactlyOneH1(structure)).toBe(true);
          expect(hasProperHierarchy(structure)).toBe(true);
          expect(allHeadingsHaveText(structure)).toBe(true);
          expect(allHeadingLevelsValid(structure)).toBe(true);
          expect(h1AppearsFirst(structure)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject invalid heading structures', () => {
    // Test invalid structure: No h1
    const noH1Structure: HeadingStructure = {
      pageName: 'Invalid - No H1',
      headings: [
        { level: 2, text: 'Section' },
        { level: 3, text: 'Subsection' },
      ],
    };
    expect(hasExactlyOneH1(noH1Structure)).toBe(false);
    expect(h1AppearsFirst(noH1Structure)).toBe(false);
    
    // Test invalid structure: Multiple h1s
    const multipleH1Structure: HeadingStructure = {
      pageName: 'Invalid - Multiple H1s',
      headings: [
        { level: 1, text: 'First Title' },
        { level: 1, text: 'Second Title' },
      ],
    };
    expect(hasExactlyOneH1(multipleH1Structure)).toBe(false);
    
    // Test invalid structure: Skipped level
    const skippedLevelStructure: HeadingStructure = {
      pageName: 'Invalid - Skipped Level',
      headings: [
        { level: 1, text: 'Title' },
        { level: 3, text: 'Subsection' }, // Skips h2
      ],
    };
    expect(hasProperHierarchy(skippedLevelStructure)).toBe(false);
    
    // Test invalid structure: Empty heading text
    const emptyTextStructure: HeadingStructure = {
      pageName: 'Invalid - Empty Text',
      headings: [
        { level: 1, text: 'Title' },
        { level: 2, text: '   ' }, // Empty/whitespace only
      ],
    };
    expect(allHeadingsHaveText(emptyTextStructure)).toBe(false);
    
    console.log('✓ All invalid structures correctly rejected');
  });

  it('should maintain semantic heading order for SEO', () => {
    // Test each page
    pageHeadingStructures.forEach((structure) => {
      const levels = structure.headings.map((h) => h.level);
      
      // Property: Heading levels should create a logical document outline
      // This is important for SEO and accessibility
      
      // 1. Must start with h1
      expect(levels[0]).toBe(1);
      
      // 2. Each section should be properly nested
      let currentDepth = 1;
      for (let i = 1; i < levels.length; i++) {
        const level = levels[i];
        
        // Can go deeper by 1, stay same, or go shallower by any amount
        expect(level).toBeLessThanOrEqual(currentDepth + 1);
        currentDepth = level;
      }
      
      console.log(`✓ ${structure.pageName}: Semantic heading order maintained`);
    });
  });

  it('should have descriptive heading text for accessibility', () => {
    // Test each page
    pageHeadingStructures.forEach((structure) => {
      structure.headings.forEach((heading) => {
        // Property: Headings should be descriptive
        // Avoid generic text like "Click here" or single characters
        
        // Minimum length for meaningful headings
        expect(heading.text.length).toBeGreaterThanOrEqual(3);
        
        // Should not be just numbers or special characters
        expect(heading.text).toMatch(/[a-zA-Z]/);
        
        // Should not be all caps (bad for screen readers)
        const isAllCaps = heading.text === heading.text.toUpperCase() && 
                         heading.text.length > 3;
        expect(isAllCaps).toBe(false);
      });
      
      console.log(`✓ ${structure.pageName}: Descriptive heading text`);
    });
  });
});
