// Scraped blueprint data from endfieldtools.dev
// 21 community blueprints with preview images and product icons

const TOOLS_CDN = 'https://endfieldtools.dev';

export interface OutputRate {
  name: string;
  rate: number;
}

export interface ImportCode {
  region: string;
  code: string;
}

export type Complexity = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
export type Category = 'Production' | 'Processing' | 'Power' | 'Complete Chain' | 'Compact';

export interface BlueprintEntry {
  id: number;
  Title: string;
  Description: string;
  ImportString: string;
  Upvotes: number;
  Region: string;
  Author: string;
  Tags: string[];
  operators?: string[];
  previewImage?: string;
  productIcon?: string;
  productName?: string;
  slug: string;
  detailDescription: string;
  buildingCount?: number;
  gridSize?: string;
  netPower?: number;
  outputsPerMin: OutputRate[];
  importCodes: ImportCode[];
  complexity: Complexity;
  category: Category;
}

// Find blueprints tagged with a specific operator (by slug or name)
export function getBlueprintsForOperator(operatorName: string): BlueprintEntry[] {
  const nameLower = operatorName.toLowerCase();
  return SCRAPED_BLUEPRINTS.filter(bp => {
    if (bp.operators?.some(op => op.toLowerCase() === nameLower)) return true;
    if (bp.Tags?.some(t => t.toLowerCase() === nameLower)) return true;
    return false;
  });
}

export const SCRAPED_BLUEPRINTS: BlueprintEntry[] = [
  {
    "id": 1,
    "Title": "26x27 all parts and bottles",
    "Description": "Produces: Origocrust (60.0/min), Ferrium Bottle (7.2/min), Amethyst Bottle (4.0/min). Net Power: -410 kW. Grid: 40x40. 62 buildings. Import Codes: Asia: EFO01602IoiEIi72O83e | NA / EU: EFO01O3E2i3Uo2IA9oe4",
    "ImportString": "EFO01O3E2i3Uo2IA9oe4",
    "Upvotes": 0,
    "Region": "NA / EU",
    "Author": "endmi-fi",
    "Tags": [
      "Origocrust"
    ],
    "previewImage": `${TOOLS_CDN}/uploads/factory/thumbnails/c458e931-0bac-44e6-9109-6734c5a71c88/1bdda232-2b8f-44df-95fc-c02c2eb1a2e9.png`,
    "productIcon": `${TOOLS_CDN}/assets/images/endfield/itemicon/item_iron_enr_bottle.png`,
    "productName": "Steel Bottle",
    "slug": "26x27-all-parts-and-bottles",
    "detailDescription": "This comprehensive production facility operates on a compact 40x40 grid while managing three distinct material processing chains simultaneously. The factory layout prioritizes material synthesis efficiency, producing high volumes of Origocrust at 60 units per minute alongside moderate Ferrium and Amethyst bottle production. The design features segmented production zones with dedicated refining areas for each output type.\n\nThe 62-building configuration maintains balanced throughput by utilizing shared input resources across multiple production lines. Central logistics corridors enable efficient material distribution from mining operations to processing stations. Power management requires external grid support due to the -410kW consumption, but the high-volume output justifies the energy investment.\n\nOptimal for mid to late-game players who need consistent supplies of multiple materials for equipment crafting and resource bottling. The layout can be easily expanded vertically or horizontally to scale production as demands increase.",
    "buildingCount": 62,
    "gridSize": "40x40",
    "netPower": -410,
    "outputsPerMin": [
      { "name": "Origocrust", "rate": 60.0 },
      { "name": "Ferrium Bottle", "rate": 7.2 },
      { "name": "Amethyst Bottle", "rate": 4.0 }
    ],
    "importCodes": [
      { "region": "Asia", "code": "EFO01602IoiEIi72O83e" },
      { "region": "NA / EU", "code": "EFO01O3E2i3Uo2IA9oe4" }
    ],
    "complexity": "Advanced",
    "category": "Complete Chain"
  },
  {
    "id": 2,
    "Title": "Buck Capsule [B]  Mass Production",
    "Description": "Produces: Buck Capsule [B] (6.0/min). Net Power: -335 kW. Import Codes: NA / EU: EFO010U96AUAa7iaE179",
    "ImportString": "EFO010U96AUAa7iaE179",
    "Upvotes": 0,
    "Region": "NA / EU",
    "Author": "evernight0307",
    "Tags": [
      "Buck Capsule B",
      "Early Game",
      "Beginner-Friendly"
    ],
    "previewImage": `${TOOLS_CDN}/uploads/factory/screenshots/a1608137-546c-4632-921c-4eb96bb1d451/33e0d66a-a1b4-437e-b4aa-824972576772.webp`,
    "productIcon": `${TOOLS_CDN}/assets/images/endfield/itemicon/item_bottled_rec_hp_2.png`,
    "productName": "Buck Capsule [B]",
    "slug": "buck-capsule-b-mass-production",
    "detailDescription": "A beginner-friendly production line designed for operators starting their first medical supply factory. This layout focuses exclusively on Buck Capsule [B] production, delivering a steady 6 capsules per minute through a straightforward assembly process. The factory uses a linear production flow that's easy to understand and troubleshoot for new players.\n\nThe design emphasizes reliability over complexity, with clear material pathways from botanical processing through filling stations to final packaging. Each production stage is clearly separated, making it simple to identify bottlenecks or supply issues. The -335kW power requirement is manageable with basic power infrastructure.\n\nPerfect for early-game players who need consistent medical supplies for their operators without the complexity of multi-product factories. The layout serves as an excellent learning tool for understanding factory mechanics and can be replicated or modified for other single-product needs.",
    "buildingCount": undefined,
    "gridSize": undefined,
    "netPower": -335,
    "outputsPerMin": [
      { "name": "Buck Capsule [B]", "rate": 6.0 }
    ],
    "importCodes": [
      { "region": "NA / EU", "code": "EFO010U96AUAa7iaE179" }
    ],
    "complexity": "Beginner",
    "category": "Production"
  },
  {
    "id": 3,
    "Title": "Buck Capsule [C]",
    "Description": "Produces: Buck Capsule [C] (7.0/min). Import Codes: NA / EU: EFO0158OE65055uaeIoe | Asia: EFO019aE0Aoii7e65uI2",
    "ImportString": "EFO0158OE65055uaeIoe",
    "Upvotes": 0,
    "Region": "NA / EU",
    "Author": "virrupt",
    "Tags": [
      "Buck Capsule C",
      "Early Game",
      "Beginner-Friendly"
    ],
    "previewImage": `${TOOLS_CDN}/uploads/factory/screenshots/b97dbd0f-57a0-4ddc-8e4f-84b62df3aa8e/60b174af-a90b-424b-9915-cc926e009926.webp`,
    "productIcon": `${TOOLS_CDN}/assets/images/endfield/itemicon/item_bottled_rec_hp_1.png`,
    "productName": "Buck Capsule [C]",
    "slug": "buck-capsule-c",
    "detailDescription": "An efficient entry-level pharmaceutical facility producing Buck Capsule [C] at 7 units per minute. This compact design is ideal for commanders just beginning to establish their medical supply infrastructure. The layout uses minimal space while maintaining solid throughput for early-game healing requirements.\n\nThe factory employs a simple botanical processing chain, converting raw plant materials through grinding and filling operations into finished medical capsules. Material flow is straightforward and visual, making it easy for new players to understand the production pipeline at a glance. The design can operate continuously with basic resource input.\n\nThis blueprint is cross-region compatible, making it an excellent choice for players on any server who need reliable C-grade medical supplies. The production rate supports a small to medium operator roster through early campaign missions and exploration activities.",
    "buildingCount": undefined,
    "gridSize": undefined,
    "netPower": undefined,
    "outputsPerMin": [
      { "name": "Buck Capsule [C]", "rate": 7.0 }
    ],
    "importCodes": [
      { "region": "NA / EU", "code": "EFO0158OE65055uaeIoe" },
      { "region": "Asia", "code": "EFO019aE0Aoii7e65uI2" }
    ],
    "complexity": "Beginner",
    "category": "Production"
  },
  {
    "id": 4,
    "Title": "Buck Capsule [C]",
    "Description": "Produces: Buck Capsule [B] (12.0/min). Net Power: -140 kW. 10 buildings. Import Codes: Asia: EFO0101OA3oI3OiiE179",
    "ImportString": "EFO0101OA3oI3OiiE179",
    "Upvotes": 0,
    "Region": "Asia",
    "Author": "guest",
    "Tags": [
      "Buck Capsule B",
      "Mid Game",
      "Resource Efficient"
    ],
    "productIcon": `${TOOLS_CDN}/assets/images/endfield/itemicon/item_bottled_rec_hp_2.png`,
    "productName": "Buck Capsule [B]",
    "slug": "buck-capsule-c-compact",
    "detailDescription": "A highly resource-efficient Buck Capsule [B] production facility that maximizes output with minimal building count and power consumption. Using only 10 buildings and drawing just -140kW, this design achieves an impressive 12 capsules per minute through optimized material routing and smart building placement.\n\nThe factory's efficiency comes from careful recipe selection and material reuse, minimizing waste while maintaining high throughput. Each building is positioned to reduce conveyor distances, improving material transfer speeds and reducing overall power draw. This makes it one of the most economical mid-game medical production facilities available.\n\nIdeal for players who have limited factory space or power generation capacity but need substantial medical supply output. The compact footprint allows easy integration into existing factory complexes, and the low power requirement means it won't strain your energy grid.",
    "buildingCount": 10,
    "gridSize": undefined,
    "netPower": -140,
    "outputsPerMin": [
      { "name": "Buck Capsule [B]", "rate": 12.0 }
    ],
    "importCodes": [
      { "region": "Asia", "code": "EFO0101OA3oI3OiiE179" }
    ],
    "complexity": "Intermediate",
    "category": "Compact"
  },
  {
    "id": 5,
    "Title": "BuckCapsuleA",
    "Description": "Produces: Buck Capsule [A] (6.0/min). Net Power: -670 kW. 46 buildings. Import Codes: NA / EU: EFO0136uIO2uE1ae0i79",
    "ImportString": "EFO0136uIO2uE1ae0i79",
    "Upvotes": 0,
    "Region": "NA / EU",
    "Author": "snooflo",
    "Tags": [
      "Buck Capsule A",
      "Mid Game",
      "Large"
    ],
    "previewImage": `${TOOLS_CDN}/uploads/factory/screenshots/500cf784-a240-40aa-8b70-3fb37b327867/2af95079-8330-40d2-9360-86b83d696224.webp`,
    "productIcon": `${TOOLS_CDN}/assets/images/endfield/itemicon/item_bottled_rec_hp_3.png`,
    "productName": "Buck Capsule [A]",
    "slug": "buckcapsulea",
    "detailDescription": "A large-scale pharmaceutical production complex dedicated to crafting premium Buck Capsule [A] units, the highest grade of standard recovery items. The 46-building facility processes multiple ingredient chains simultaneously, requiring advanced botanical materials and complex chemical synthesis to achieve the A-grade potency.\n\nThis factory represents a significant infrastructure investment with its -670kW power requirement and extensive building network. The production pipeline includes advanced grinding units, densification chambers, and precision filling equipment to meet the exacting standards of A-grade pharmaceuticals. Material staging areas ensure smooth flow between processing stages.\n\nBest suited for established players in mid to late-game who need top-tier medical supplies for challenging content. The 6 capsules per minute output may seem modest, but A-grade items provide significantly more healing, making this a strategic production choice for elite operator support.",
    "buildingCount": 46,
    "gridSize": undefined,
    "netPower": -670,
    "outputsPerMin": [
      { "name": "Buck Capsule [A]", "rate": 6.0 }
    ],
    "importCodes": [
      { "region": "NA / EU", "code": "EFO0136uIO2uE1ae0i79" }
    ],
    "complexity": "Advanced",
    "category": "Production"
  },
  {
    "id": 6,
    "Title": "Cryston farm",
    "Description": "Produces: Cryston Component (1.0/min). Import Codes: Asia: EFO01ouiOAiO1i60IieO",
    "ImportString": "EFO01ouiOAiO1i60IieO",
    "Upvotes": 0,
    "Region": "Asia",
    "Author": "topazlh",
    "Tags": [
      "Cryston Component"
    ],
    "previewImage": `${TOOLS_CDN}/uploads/factory/screenshots/271d5cf2-3065-4074-bc08-f58efc4fd94f/cec61769-8f9f-437f-bf35-16d776f0b40f.webp`,
    "productIcon": `${TOOLS_CDN}/assets/images/endfield/itemicon/item_equip_script_3.png`,
    "productName": "Cryston Component",
    "slug": "cryston-farm",
    "detailDescription": "A specialized equipment crafting facility focused on producing Cryston Components, essential materials for Tier 3 gear fabrication. This farm processes Origocrust through refining and fiber extraction to create dense Cryston materials, which are then assembled into precision components. The production rate of 1 component per minute provides steady supply for ongoing equipment upgrades.\n\nThe factory layout emphasizes ore processing efficiency, with dedicated refining stations converting raw Origocrust into Cryston Fiber before final component assembly. Material buffers ensure continuous operation even during supply fluctuations. The design uses vertical space efficiently to maintain a compact footprint while handling complex processing chains.\n\nPerfect for mid-game players transitioning into Tier 3 equipment crafting who need a reliable component supply line. While the output rate is modest, Cryston Components are valuable crafting materials that justify the dedicated production infrastructure.",
    "buildingCount": undefined,
    "gridSize": undefined,
    "netPower": undefined,
    "outputsPerMin": [
      { "name": "Cryston Component", "rate": 1.0 }
    ],
    "importCodes": [
      { "region": "Asia", "code": "EFO01ouiOAiO1i60IieO" }
    ],
    "complexity": "Intermediate",
    "category": "Processing"
  },
  {
    "id": 7,
    "Title": "Endless Plants",
    "Description": "Produces: Buckflower (1.0/min), Citrome (1.0/min), Aketine (1.0/min). Import Codes: NA / EU: EFO016i1aAaUaO7AOa3e",
    "ImportString": "EFO016i1aAaUaO7AOa3e",
    "Upvotes": 0,
    "Region": "NA / EU",
    "Author": "ultima",
    "Tags": [
      "Buckflower"
    ],
    "previewImage": `${TOOLS_CDN}/uploads/factory/screenshots/a87b8fa5-6a24-49ff-90e5-58210dafd564/508cb6f9-3130-4392-9277-e501c42f26c6.webp`,
    "productIcon": `${TOOLS_CDN}/assets/images/endfield/itemicon/item_plant_moss_1.png`,
    "productName": "Buckflower",
    "slug": "endless-plants",
    "detailDescription": "A self-sustaining botanical garden producing three essential plant species simultaneously. The Endless Plants facility uses advanced seed collection and replanting automation to maintain continuous harvests of Buckflower, Citrome, and Aketine without external seed input. Each planting unit is paired with seed-picking stations that ensure the farm can operate indefinitely.\n\nThe genius of this design lies in its closed-loop seed management system. Harvested plants are automatically processed for both their useful materials and seeds, with seeds being recycled back into planting units. This creates a truly endless production cycle that only requires initial seed stock and occasional maintenance. Each plant species occupies a dedicated growing zone with optimized spacing.\n\nExcellent for players who want to establish base material production without worrying about seed supply chains. The 1/min rate for each species provides steady baseline input for pharmaceutical production, chemical synthesis, and carbon processing. Can be expanded by duplicating sections for higher throughput.",
    "buildingCount": undefined,
    "gridSize": undefined,
    "netPower": undefined,
    "outputsPerMin": [
      { "name": "Buckflower", "rate": 1.0 },
      { "name": "Citrome", "rate": 1.0 },
      { "name": "Aketine", "rate": 1.0 }
    ],
    "importCodes": [
      { "region": "NA / EU", "code": "EFO016i1aAaUaO7AOa3e" }
    ],
    "complexity": "Intermediate",
    "category": "Production"
  },
  {
    "id": 8,
    "Title": "Extremely simple Planting system 16x14",
    "Description": "Produces: Citrome (1.0/min), Sandleaf (1.0/min). 6 buildings. Import Codes: NA / EU: EFO0172UAoiUIe50O0Ai",
    "ImportString": "EFO0172UAoiUIe50O0Ai",
    "Upvotes": 0,
    "Region": "NA / EU",
    "Author": "guest",
    "Tags": [
      "Citrome",
      "Early Game",
      "Beginner-Friendly",
      "Compact",
      "Small"
    ],
    "productIcon": `${TOOLS_CDN}/assets/images/endfield/itemicon/item_plant_moss_2.png`,
    "productName": "Citrome",
    "slug": "extremely-simple-planting-system-16x14",
    "detailDescription": "The ultimate beginner's guide to factory automation distilled into just 6 buildings on a tiny 16x14 footprint. This minimalist planting system produces Citrome and Sandleaf using the simplest possible configuration - perfect for new players learning factory mechanics. Each building has a clear, single purpose that's easy to understand and maintain.\n\nThe design features paired planting and seed-picking units for both plant species, creating two independent but parallel production lines. Material flow is completely linear with no complex routing or conveyor intersections. This makes troubleshooting trivial and teaches fundamental concepts like seed recycling and harvest timing without overwhelming complexity.\n\nIdeal as a first factory project or as a teaching blueprint for understanding how planting operations work. The compact size means it can fit almost anywhere, and the low building count keeps power requirements minimal. Both Citrome and Sandleaf are useful base materials for numerous crafting chains, making this a practical starter facility.",
    "buildingCount": 6,
    "gridSize": "16x14",
    "netPower": undefined,
    "outputsPerMin": [
      { "name": "Citrome", "rate": 1.0 },
      { "name": "Sandleaf", "rate": 1.0 }
    ],
    "importCodes": [
      { "region": "NA / EU", "code": "EFO0172UAoiUIe50O0Ai" }
    ],
    "complexity": "Beginner",
    "category": "Compact"
  },
  {
    "id": 9,
    "Title": "HC Valley Battery",
    "Description": "Produces: HC Valley Battery (6.0/min). Net Power: -525 kW. Import Codes: NA / EU: EFO01893u5E3O61AuUI73 | Asia: EFO01Ue379eA11Ou7Oa8",
    "ImportString": "EFO01893u5E3O61AuUI73",
    "Upvotes": 0,
    "Region": "NA / EU",
    "Author": "snooflo",
    "Tags": [
      "Hc Valley Battery",
      "Mid Game",
      "Resource Efficient",
      "Battery"
    ],
    "previewImage": `${TOOLS_CDN}/uploads/factory/screenshots/500cf784-a240-40aa-8b70-3fb37b327867/93ed1fd3-a884-4b4f-b137-1b17861df69e.webp`,
    "productIcon": `${TOOLS_CDN}/assets/images/endfield/itemicon/item_proc_battery_3.png`,
    "productName": "HC Valley Battery",
    "slug": "hc-valley-battery",
    "detailDescription": "A mid-tier energy storage production facility manufacturing HC Valley Batteries at 6 units per minute. This design balances production speed with resource efficiency, using optimized material routing to minimize waste while maintaining consistent output. The factory processes Xiranite and Dense Originium Powder through precision packaging units to create high-capacity battery cells.\n\nThe -525kW power consumption is notable but justified by the complexity of battery manufacturing, which requires careful material handling and assembly precision. The layout features centralized material preparation zones feeding multiple packaging units, allowing for potential throughput increases by adding more assembly stations. Temperature-controlled storage areas prevent material degradation.\n\nExcellent for players establishing comprehensive battery production to support power-hungry factory complexes or stockpile energy storage for base defense systems. HC Valley Batteries represent a significant upgrade over lower-tier alternatives, offering more energy density for their weight and volume.",
    "buildingCount": undefined,
    "gridSize": undefined,
    "netPower": -525,
    "outputsPerMin": [
      { "name": "HC Valley Battery", "rate": 6.0 }
    ],
    "importCodes": [
      { "region": "NA / EU", "code": "EFO01893u5E3O61AuUI73" },
      { "region": "Asia", "code": "EFO01Ue379eA11Ou7Oa8" }
    ],
    "complexity": "Intermediate",
    "category": "Power"
  },
  {
    "id": 10,
    "Title": "LC Wuling Batteries",
    "Description": "Produces: LC Wuling Battery (6.0/min). Net Power: +1 MW. 33 buildings. Import Codes: NA / EU: EFO0172UAoo11U59O0Ai | Asia: EFO018Ieo9u2521iUI73",
    "ImportString": "EFO0172UAoo11U59O0Ai",
    "Upvotes": 0,
    "Region": "NA / EU",
    "Author": "chizuneko",
    "Tags": [
      "Lc Wuling Battery",
      "Late Game",
      "Battery",
      "Large",
      "Compact"
    ],
    "previewImage": `${TOOLS_CDN}/uploads/factory/screenshots/964d49da-a693-4b2d-b0d4-6f85e7b31df5/c4310ee7-4306-4326-b728-cc356a9a8aad.webp`,
    "productIcon": `${TOOLS_CDN}/assets/images/endfield/itemicon/item_proc_battery_4.png`,
    "productName": "LC Wuling Battery",
    "slug": "lc-wuling-batteries",
    "detailDescription": "An engineering marvel that produces premium LC Wuling Batteries while generating a net positive +1MW of power. This late-game facility demonstrates mastery of factory design by integrating power generation directly into the battery manufacturing process, creating a self-sustaining energy ecosystem that actually contributes power back to your grid.\n\nThe 33-building complex uses sophisticated material processing chains to convert Ferrium Components and Dense Originium Powder into high-performance battery cells. Integrated power generation from battery chemistry reactions offsets the production facility's consumption and produces significant surplus. Strategic building placement minimizes conveyor distances while maximizing power efficiency.\n\nA must-have blueprint for advanced players running large factory networks. Not only does this provide top-tier battery production at 6 units per minute, but the positive power generation makes it economically advantageous - essentially getting paid in electricity to manufacture batteries. The compact yet large design balances space efficiency with production capacity.",
    "buildingCount": 33,
    "gridSize": undefined,
    "netPower": 1000,
    "outputsPerMin": [
      { "name": "LC Wuling Battery", "rate": 6.0 }
    ],
    "importCodes": [
      { "region": "NA / EU", "code": "EFO0172UAoo11U59O0Ai" },
      { "region": "Asia", "code": "EFO018Ieo9u2521iUI73" }
    ],
    "complexity": "Expert",
    "category": "Power"
  },
  {
    "id": 11,
    "Title": "SkyJLV Day1 BluePrint SubPAC [ASIA] [EU/NA]",
    "Description": "Produces: Industrial Explosive (20.0/min), Buck Capsule [C] (6.0/min), LC Valley Battery (3.0/min). Net Power: +340 kW. Import Codes: Asia: EFO01602IE4e1U79O83e",
    "ImportString": "EFO01602IE4e1U79O83e",
    "Upvotes": 0,
    "Region": "Asia",
    "Author": "shibarchik",
    "Tags": [
      "Industrial Explosive",
      "Early Game",
      "Beginner-Friendly",
      "Battery"
    ],
    "previewImage": `${TOOLS_CDN}/uploads/factory/screenshots/846d3340-cc00-4584-9b94-bed4167ed4ef/caf7db2d-2910-4b14-978e-d92da4418289.webp`,
    "productIcon": `${TOOLS_CDN}/assets/images/endfield/itemicon/item_proc_bomb_1.png`,
    "productName": "Industrial Explosive",
    "slug": "skyjlv-day1-blueprint-subpac",
    "detailDescription": "Part of the renowned skyJLV infrastructure series, this Day 1 blueprint provides a comprehensive starter production complex covering three essential product categories. The SubPAC facility produces Industrial Explosives for mining operations at an impressive 20 units per minute, alongside Buck Capsule [C] medical supplies and LC Valley Batteries for power storage.\n\nWhat makes this design exceptional is its positive +340kW power generation while maintaining triple-product output. The factory uses integrated power production from battery manufacturing to offset the explosive synthesis power requirements. Material routing is optimized for early-game resource availability, with clear separation between the explosive, medical, and energy production chains.\n\nPerfect for new players following the skyJLV infrastructure progression who want to establish core production capabilities on day one. The explosive output supports aggressive mining expansion, medical supplies keep operators healthy, and batteries enable power grid stability. This single blueprint covers multiple essential needs efficiently.",
    "buildingCount": undefined,
    "gridSize": undefined,
    "netPower": 340,
    "outputsPerMin": [
      { "name": "Industrial Explosive", "rate": 20.0 },
      { "name": "Buck Capsule [C]", "rate": 6.0 },
      { "name": "LC Valley Battery", "rate": 3.0 }
    ],
    "importCodes": [
      { "region": "Asia", "code": "EFO01602IE4e1U79O83e" }
    ],
    "complexity": "Beginner",
    "category": "Complete Chain"
  },
  {
    "id": 12,
    "Title": "T4 Gear 6/min",
    "Description": "Produces: Xiranite Component (5.9/min). Net Power: -545 kW. Grid: 40x40. 58 buildings. Import Codes: Asia: EFO01O4a7U5OA3Ii9oe4 | NA / EU: EFO014o5O11OI53aE71A",
    "ImportString": "EFO014o5O11OI53aE71A",
    "Upvotes": 0,
    "Region": "NA / EU",
    "Author": "Trakan",
    "Tags": [
      "Xiranite Component",
      "Late Game",
      "Large"
    ],
    "previewImage": `${TOOLS_CDN}/uploads/factory/thumbnails/3587097a-1857-42da-8420-c2d2a1bcc3fc/729167a5-9868-4f35-8b9b-f96468ef8d76.png`,
    "productIcon": `${TOOLS_CDN}/assets/images/endfield/itemicon/item_equip_script_4.png`,
    "productName": "Xiranite Component",
    "slug": "t4-gear-6-min",
    "detailDescription": "A large-scale Tier 4 equipment component production facility operating at maximum 40x40 grid capacity. This factory represents the pinnacle of component manufacturing, producing premium Xiranite Components at nearly 6 per minute through complex Xiranite synthesis and precision assembly processes. The 58-building layout is optimized for sustained high-output production.\n\nXiranite processing requires advanced materials including Stabilized Carbon and carefully controlled Forge of the Sky operations to produce raw Xiranite powder, which then undergoes multiple refinement stages before component assembly. The factory includes dedicated synthesis chambers, fiber extraction units, and precision fitting stations arranged in an efficient production flow. Material buffers prevent bottlenecks during processing.\n\nEssential for endgame players crafting Tier 4 gear for elite operators. The -545kW power requirement reflects the energy-intensive nature of Xiranite synthesis, but the 5.9 components per minute output provides excellent throughput for equipping an entire operator roster with premium gear. Cross-region compatibility makes this design universally valuable.",
    "buildingCount": 58,
    "gridSize": "40x40",
    "netPower": -545,
    "outputsPerMin": [
      { "name": "Xiranite Component", "rate": 5.9 }
    ],
    "importCodes": [
      { "region": "Asia", "code": "EFO01O4a7U5OA3Ii9oe4" },
      { "region": "NA / EU", "code": "EFO014o5O11OI53aE71A" }
    ],
    "complexity": "Expert",
    "category": "Processing"
  },
  {
    "id": 13,
    "Title": "redssuns",
    "Description": "Produces: Xiranite Component (6.0/min). 16 buildings. Import Codes: NA / EU: EFO0136uIU9o79a10579",
    "ImportString": "EFO0136uIU9o79a10579",
    "Upvotes": 0,
    "Region": "NA / EU",
    "Author": "redssuns",
    "Tags": [
      "Xiranite Component",
      "Late Game",
      "Beginner-Friendly",
      "Compact",
      "Advanced"
    ],
    "previewImage": `${TOOLS_CDN}/uploads/factory/screenshots/6c91cc2d-07f6-48f8-abbb-3ba94265c9da/60abaaa3-48de-41f5-8a15-803c421be8e5.webp`,
    "productIcon": `${TOOLS_CDN}/assets/images/endfield/itemicon/item_equip_script_4.png`,
    "productName": "Xiranite Component",
    "slug": "redssuns",
    "detailDescription": "A remarkably efficient compact design producing Xiranite Components using just 16 buildings - less than a third of typical large-scale facilities while maintaining 6 per minute output. This blueprint demonstrates advanced factory optimization techniques, achieving maximum throughput per building through clever material routing and recipe selection.\n\nThe secret to redssuns' efficiency lies in aggressive building specialization and minimal conveyor distances. Each of the 16 buildings performs a critical role with zero redundancy, creating an elegant production chain that wastes neither space nor power. Vertical stacking and tight clustering reduce material transfer times while maintaining accessibility for maintenance and upgrades.\n\nIdeal for experienced players who understand Xiranite processing but face space constraints or want to maximize production density. Despite being tagged beginner-friendly for its clear layout, the advanced optimization makes it excellent for players transitioning from basic to expert factory design. The compact footprint leaves room for expansion or adjacent production facilities.",
    "buildingCount": 16,
    "gridSize": undefined,
    "netPower": undefined,
    "outputsPerMin": [
      { "name": "Xiranite Component", "rate": 6.0 }
    ],
    "importCodes": [
      { "region": "NA / EU", "code": "EFO0136uIU9o79a10579" }
    ],
    "complexity": "Advanced",
    "category": "Compact"
  },
  {
    "id": 14,
    "Title": "skyJLV's Infra [DAY2] [ASIA] [NA/EU]",
    "Description": "Copied by Shibarchik. Credits to skyJLV.. Produces: Buck Capsule [B] (6.0/min), Ferrium Component (6.0/min), Amethyst Part (90.0/min). Net Power: +235 kW. Import Codes: Asia: EFO01I3A5Ui0o69o5o08 | NA / EU: EFO011ea07931OU834O7",
    "ImportString": "EFO011ea07931OU834O7",
    "Upvotes": 0,
    "Region": "NA / EU",
    "Author": "shibarchik",
    "Tags": [
      "Buck Capsule B",
      "Early Game",
      "Beginner-Friendly",
      "Resource Efficient",
      "Battery"
    ],
    "previewImage": `${TOOLS_CDN}/uploads/factory/screenshots/846d3340-cc00-4584-9b94-bed4167ed4ef/743307cd-b685-4c88-9180-db5a16a26790.webp`,
    "productIcon": `${TOOLS_CDN}/assets/images/endfield/itemicon/item_equip_script_2.png`,
    "productName": "Ferrium Component",
    "slug": "skyjlv-infra-day2",
    "detailDescription": "Day 2 of the legendary skyJLV infrastructure series (preserved by Shibarchik) expands production capabilities with Tier 2 equipment components and intermediate materials. This facility produces Buck Capsule [B] for improved healing, Ferrium Components for T2 gear crafting, and a massive 90 Amethyst Parts per minute for diverse crafting needs. The multi-product approach establishes comprehensive material supplies.\n\nThe design integrates medical, metallurgical, and mineral processing chains with remarkable efficiency. Shared resource inputs feed multiple production lines, while dedicated output staging prevents material mixing. The factory generates +235kW net power through integrated energy recovery systems, making it cost-effective to operate while supporting your growing base infrastructure needs.\n\nPerfect for day 2-3 players who have mastered basic production and need to scale up material availability. The high Amethyst Part output supports numerous crafting recipes, Ferrium Components enable T2 equipment upgrades, and improved medical supplies keep pace with increasing combat difficulty. Resource-efficient design minimizes input requirements while maximizing output diversity.",
    "buildingCount": undefined,
    "gridSize": undefined,
    "netPower": 235,
    "outputsPerMin": [
      { "name": "Buck Capsule [B]", "rate": 6.0 },
      { "name": "Ferrium Component", "rate": 6.0 },
      { "name": "Amethyst Part", "rate": 90.0 }
    ],
    "importCodes": [
      { "region": "Asia", "code": "EFO01I3A5Ui0o69o5o08" },
      { "region": "NA / EU", "code": "EFO011ea07931OU834O7" }
    ],
    "complexity": "Beginner",
    "category": "Complete Chain"
  },
  {
    "id": 15,
    "Title": "skyJLV's Infra [DAY3] [ASIA] [NA/EU]",
    "Description": "Produces: Buck Capsule [B] (6.0/min), Cryston Component (6.0/min), SC Valley Battery (6.0/min). Net Power: +415 kW. Import Codes: Asia: EFO01u8U47AaI90aaAoOU",
    "ImportString": "EFO01u8U47AaI90aaAoOU",
    "Upvotes": 0,
    "Region": "Asia",
    "Author": "shibarchik",
    "Tags": [
      "Buck Capsule B",
      "Mid Game",
      "Battery",
      "Compact",
      "Advanced"
    ],
    "previewImage": `${TOOLS_CDN}/uploads/factory/screenshots/846d3340-cc00-4584-9b94-bed4167ed4ef/a4d6a80e-abdf-4ef0-8b62-87f2a8abb778.webp`,
    "productIcon": `${TOOLS_CDN}/assets/images/endfield/itemicon/item_proc_battery_2.png`,
    "productName": "SC Valley Battery",
    "slug": "skyjlv-infra-day3",
    "detailDescription": "The third installment of skyJLV's infrastructure progression introduces Tier 3 capabilities with Cryston Component manufacturing and SC Valley Battery production alongside continued medical supply output. This mid-game powerhouse generates an impressive +415kW while producing three distinct high-value products. The compact yet advanced design represents optimal factory maturation.\n\nDay 3 infrastructure focuses on vertical integration of advanced materials. Origocrust processing feeds Cryston Component assembly, while battery production systems generate surplus power that offsets medical manufacturing costs. The factory architecture allows modular expansion - each production chain can scale independently as resource availability increases. Strategic building placement minimizes footprint while maximizing throughput.\n\nIdeal for players entering mid-game content who need T3 crafting materials, reliable power storage, and continued medical supplies. The positive power generation makes this factory essentially free to operate, while the balanced output supports gear progression, energy infrastructure, and operator maintenance simultaneously. An excellent bridge between early-game basics and late-game specialization.",
    "buildingCount": undefined,
    "gridSize": undefined,
    "netPower": 415,
    "outputsPerMin": [
      { "name": "Buck Capsule [B]", "rate": 6.0 },
      { "name": "Cryston Component", "rate": 6.0 },
      { "name": "SC Valley Battery", "rate": 6.0 }
    ],
    "importCodes": [
      { "region": "Asia", "code": "EFO01u8U47AaI90aaAoOU" }
    ],
    "complexity": "Advanced",
    "category": "Complete Chain"
  },
  {
    "id": 16,
    "Title": "skyJLV's WULING MainV2 [DAY1] [ASIA] [NA/EU]",
    "Description": "Produces: Yazhen Syringe [C] (12.0/min), LC Wuling Battery (6.0/min). Net Power: +660 kW. Import Codes: Asia: EFO012O9A06o43858eIOo",
    "ImportString": "EFO012O9A06o43858eIOo",
    "Upvotes": 0,
    "Region": "Asia",
    "Author": "shibarchik",
    "Tags": [
      "Yazhen Syringe C",
      "Late Game",
      "Battery"
    ],
    "previewImage": `${TOOLS_CDN}/uploads/factory/screenshots/846d3340-cc00-4584-9b94-bed4167ed4ef/cc6a9fe1-dbe9-4110-94e4-bc9d03f4848f.webp`,
    "productIcon": `${TOOLS_CDN}/assets/images/endfield/itemicon/item_proc_battery_4.png`,
    "productName": "LC Wuling Battery",
    "slug": "skyjlv-wuling-mainv2-day1",
    "detailDescription": "The MainV2 revision of skyJLV's WULING series combines premium medical production with top-tier energy storage manufacturing while generating massive +660kW surplus power. This late-game facility produces Yazhen Syringe [C] at double the rate of typical medical factories (12/min) alongside LC Wuling Batteries, creating a self-sustaining production complex that pays for itself in energy profits.\n\nThe factory integrates Yazhen botanical processing chains with advanced battery synthesis, using shared Ferrium refinement infrastructure to support both product lines efficiently. Yazhen cultivation and grinding operations feed medical filling stations, while Dense Ferrium and Originium processing enables premium battery cell assembly. Power generation from battery chemistry dramatically exceeds consumption, creating one of the most economically favorable production ratios available.\n\nEssential for late-game commanders running multiple high-end operator teams who need substantial medical supplies and energy infrastructure. The Yazhen Syringe [C] output supports extended missions and difficult content, while LC Wuling Batteries provide premium energy storage. The massive power surplus can support additional factory expansions or base defense systems, making this a strategic cornerstone facility.",
    "buildingCount": undefined,
    "gridSize": undefined,
    "netPower": 660,
    "outputsPerMin": [
      { "name": "Yazhen Syringe [C]", "rate": 12.0 },
      { "name": "LC Wuling Battery", "rate": 6.0 }
    ],
    "importCodes": [
      { "region": "Asia", "code": "EFO012O9A06o43858eIOo" }
    ],
    "complexity": "Expert",
    "category": "Complete Chain"
  },
  {
    "id": 17,
    "Title": "39x27 \u854e\u82b1capsule[A]",
    "Description": "Produces: Buck Capsule [A] (4.3/min). Net Power: -615 kW. Grid: 40x40. 68 buildings",
    "ImportString": "No code available",
    "Upvotes": 0,
    "Region": "NA / EU",
    "Author": "endmi-fi",
    "Tags": [
      "Buck Capsule A"
    ],
    "previewImage": `${TOOLS_CDN}/uploads/factory/thumbnails/c458e931-0bac-44e6-9109-6734c5a71c88/cfb4eaa4-101d-49a0-8c94-ae6a086a013b.png`,
    "productIcon": `${TOOLS_CDN}/assets/images/endfield/itemicon/item_bottled_rec_hp_3.png`,
    "productName": "Buck Capsule [A]",
    "slug": "39x27-capsule-a",
    "detailDescription": "An alternative approach to Buck Capsule [A] production that prioritizes space efficiency over maximum throughput. Built on a 39x27 footprint within a 40x40 grid, this 68-building facility produces premium A-grade medical capsules at 4.3 per minute. The design emphasizes modular organization with clearly defined processing zones for each production stage.\n\nThe factory layout uses a segmented approach where botanical cultivation, powder densification, bottle preparation, and final filling operations each occupy dedicated quadrants. This organizational clarity makes the facility easy to understand, maintain, and troubleshoot despite its complexity. Material flows are managed through carefully planned conveyor networks that minimize crossing paths and reduce congestion.\n\nSuitable for mid to late-game players who need A-grade medical supplies but prefer a more structured, organized factory layout over absolute maximum efficiency. The -615kW power requirement is substantial but justified by the premium output. The clear segmentation makes this an excellent blueprint for learning advanced pharmaceutical production techniques while maintaining production goals.",
    "buildingCount": 68,
    "gridSize": "40x40",
    "netPower": -615,
    "outputsPerMin": [
      { "name": "Buck Capsule [A]", "rate": 4.3 }
    ],
    "importCodes": [],
    "complexity": "Advanced",
    "category": "Production"
  },
  {
    "id": 18,
    "Title": "Basic Tier 1 Gear",
    "Description": "Produces: Ferrium Component (6.0/min). Net Power: +165 kW. Grid: 40x40. 9 buildings",
    "ImportString": "No code available",
    "Upvotes": 0,
    "Region": "NA / EU",
    "Author": "Trakan",
    "Tags": [
      "Ferrium Component",
      "Early Game",
      "Beginner-Friendly",
      "Small"
    ],
    "previewImage": `${TOOLS_CDN}/uploads/factory/thumbnails/3587097a-1857-42da-8420-c2d2a1bcc3fc/a43303b8-040e-4292-bb53-1f3facc6b114.png`,
    "productIcon": `${TOOLS_CDN}/assets/images/endfield/itemicon/item_equip_script_2.png`,
    "productName": "Ferrium Component",
    "slug": "basic-tier-1-gear",
    "detailDescription": "A minimalist yet effective Tier 1 gear component production facility using only 9 buildings to produce 6 Ferrium Components per minute. This compact design is perfect for new players starting their first equipment crafting operations. The layout demonstrates efficient use of space while maintaining solid throughput for early-game gear needs.\n\nThe factory's brilliance lies in its simplicity - Iron Ore flows through refining units to create Ferrium, which is then processed through powder grinding and densification before final component assembly. Each building serves a clear purpose in the production chain, making it easy for beginners to understand material flow. The +165kW positive power generation is a significant bonus, making this factory essentially free to operate.\n\nIdeal as a first equipment production facility for new commanders. The small building count minimizes initial resource investment, the positive power output reduces operating costs, and the 6 components per minute provides adequate supply for equipping operators with T1 gear. The 40x40 grid placement allows room for future expansion or adjacent production facilities. An excellent starting point for learning component manufacturing.",
    "buildingCount": 9,
    "gridSize": "40x40",
    "netPower": 165,
    "outputsPerMin": [
      { "name": "Ferrium Component", "rate": 6.0 }
    ],
    "importCodes": [],
    "complexity": "Beginner",
    "category": "Compact"
  },
  {
    "id": 19,
    "Title": "Battery farm",
    "Description": "Produces: LC Valley Battery (12.0/min)",
    "ImportString": "No code available",
    "Upvotes": 0,
    "Region": "NA / EU",
    "Author": "topazlh",
    "Tags": [
      "Lc Valley Battery",
      "Mid Game",
      "Beginner-Friendly",
      "Battery",
      "Compact"
    ],
    "previewImage": `${TOOLS_CDN}/uploads/factory/screenshots/271d5cf2-3065-4074-bc08-f58efc4fd94f/96fa0ad0-c5d5-40ec-88c8-20d06e111a9f.webp`,
    "productIcon": `${TOOLS_CDN}/assets/images/endfield/itemicon/item_proc_battery_1.png`,
    "productName": "LC Valley Battery",
    "slug": "battery-farm",
    "detailDescription": "A high-throughput battery production facility specializing in LC Valley Batteries at an impressive 12 units per minute - double the output of typical battery factories. The \"farm\" approach uses parallel production lines running simultaneously, effectively multiplying capacity while maintaining a compact footprint. This design philosophy prioritizes maximum battery output for power-hungry base operations.\n\nThe factory employs multiple synchronized packaging units fed by shared Ferrium Part and Originium Powder preparation zones. Material distribution systems ensure balanced supply across all production lines, preventing bottlenecks that could reduce overall throughput. The compact arrangement minimizes conveyor lengths while maximizing the number of assembly stations within the available space.\n\nPerfect for mid-game players establishing serious power infrastructure or stockpiling batteries for future energy-intensive operations. The 12/min output supports large factory complexes, multiple defense systems, or creates strategic reserves for extended campaigns. The beginner-friendly layout makes it accessible despite the high production volumes, with clear material pathways and logical building arrangements.",
    "buildingCount": undefined,
    "gridSize": undefined,
    "netPower": undefined,
    "outputsPerMin": [
      { "name": "LC Valley Battery", "rate": 12.0 }
    ],
    "importCodes": [],
    "complexity": "Intermediate",
    "category": "Power"
  },
  {
    "id": 20,
    "Title": "Double HC  battery full grid",
    "Description": "Produces: HC Valley Battery (12.0/min). Net Power: -680 kW. Grid: 40x40. 97 buildings",
    "ImportString": "No code available",
    "Upvotes": 0,
    "Region": "NA / EU",
    "Author": "zain",
    "Tags": [
      "Hc Valley Battery",
      "Battery"
    ],
    "productIcon": `${TOOLS_CDN}/assets/images/endfield/itemicon/item_proc_battery_3.png`,
    "productName": "HC Valley Battery",
    "slug": "double-hc-battery-full-grid",
    "detailDescription": "A maximum-density HC Valley Battery production complex that completely fills a 40x40 grid with 97 buildings dedicated to battery manufacturing. This massive facility doubles typical HC battery output at 12 units per minute through aggressive building packing and optimized material routing. The \"full grid\" approach represents the theoretical maximum production density for HC batteries.\n\nThe 97-building network includes extensive Xiranite synthesis operations, Dense Originium Powder preparation zones, and numerous packaging units arranged in tightly coordinated production clusters. Material distribution is handled through an intricate conveyor network that efficiently supplies all production stations despite the extreme building density. The -680kW power consumption reflects the energy-intensive nature of maximum-capacity battery production.\n\nDesigned for advanced players who need substantial HC Valley Battery production for late-game power infrastructure. The massive output supports large-scale factory operations, extensive defense networks, or strategic battery stockpiling. This blueprint represents a significant investment in both space and power, but delivers unmatched HC battery production rates for players willing to commit the resources.",
    "buildingCount": 97,
    "gridSize": "40x40",
    "netPower": -680,
    "outputsPerMin": [
      { "name": "HC Valley Battery", "rate": 12.0 }
    ],
    "importCodes": [],
    "complexity": "Expert",
    "category": "Power"
  },
  {
    "id": 21,
    "Title": "Lc Wuling Battery Blueprint",
    "Description": "Community factory blueprint for Lc Wuling Battery",
    "ImportString": "No code available",
    "Upvotes": 0,
    "Region": "NA / EU",
    "Author": "guest",
    "Tags": [
      "Lc Wuling Battery"
    ],
    "productIcon": `${TOOLS_CDN}/assets/images/endfield/itemicon/item_proc_battery_4.png`,
    "productName": "LC Wuling Battery",
    "slug": "lc-wuling-battery-blueprint",
    "detailDescription": "A community-contributed LC Wuling Battery production blueprint offering an alternative approach to premium battery manufacturing. While specific production rates aren't documented, this design represents grassroots factory engineering focused on producing the highest-tier standard batteries available. The layout emphasizes practical construction techniques accessible to most players.\n\nLC Wuling Batteries require sophisticated processing chains including Ferrium Component assembly and Dense Originium Powder synthesis before final battery packaging. This community design likely balances production throughput with construction simplicity, making advanced battery production accessible without requiring expert optimization. The blueprint serves as a solid foundation that players can customize based on their specific needs and resource availability.\n\nUseful for late-game players seeking a straightforward LC Wuling Battery production solution without complex optimization requirements. Community blueprints often incorporate practical lessons learned from actual factory operation, potentially offering reliability advantages over purely theoretical designs. A good choice for players who prefer proven, community-tested approaches to factory construction.",
    "buildingCount": undefined,
    "gridSize": undefined,
    "netPower": undefined,
    "outputsPerMin": [],
    "importCodes": [],
    "complexity": "Advanced",
    "category": "Power"
  }
];
