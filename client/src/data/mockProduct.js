// client/src/data/mockProduct.js
// Every user-facing text is { en, am }. This shape maps directly to the name_en / name_am columns.
// Images: Unsplash URLs for development. Replace them with your own product photos before launch.

const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`;

export const mockProduct = {
  id: 1,
  sku: 'BETE-SOFA-3S',
  name: { en: 'Abyssinia 3-Seater Sofa', am: 'አቢሲኒያ ባለ3 መቀመጫ ሶፋ' },
  category: { en: 'Living Room', am: 'ሳሎን' },
  tagline: {
    en: 'Solid mahogany frame. Built for generations.',
    am: 'ጠንካራ የማሆጋኒ ፍሬም። ለትውልድ የተሠራ።',
  },
  description: {
    en: 'A hand-finished three-seater with a kiln-dried solid mahogany frame, high-density foam and tightly woven fabric that resists daily wear. Designed to stay comfortable and beautiful for years.',
    am: 'በእጅ የተጠናቀቀ ባለ3 መቀመጫ ሶፋ፤ በደረቀ ጠንካራ የማሆጋኒ ፍሬም፣ ከፍተኛ ጥግግት ባለው ስፖንጅ እና በየቀኑ ድካምን በሚቋቋም ጥብቅ የተሸመነ ጨርቅ የተሠራ። ለዓመታት ምቹና ውብ ሆኖ እንዲቆይ ተነድፏል።',
  },
  price: 48500,
  oldPrice: 56000,
  stock: 12,
  phone: '+251911000000', // replace with your real number

  variants: [
    {
      id: 1,
      name: { en: 'Warm Beige', am: 'ሞቅ ያለ ቤዥ' },
      hex: '#d2b48c',
      images: [
        img('photo-1555041469-a586c61ea9bc'),
        img('photo-1493663284031-b7e3aefcae8e'),
        img('photo-1540574163026-643ea20ade25'),
        img('photo-1586023492125-27b2c045efd7'),
      ],
    },
    {
      id: 2,
      name: { en: 'Olive Green', am: 'የወይራ አረንጓዴ' },
      hex: '#6b7a4f',
      images: [
        img('photo-1586023492125-27b2c045efd7'),
        img('photo-1555041469-a586c61ea9bc'),
        img('photo-1493663284031-b7e3aefcae8e'),
        img('photo-1540574163026-643ea20ade25'),
      ],
    },
    {
      id: 3,
      name: { en: 'Charcoal', am: 'ጥቁር ግራጫ' },
      hex: '#3f3f46',
      images: [
        img('photo-1540574163026-643ea20ade25'),
        img('photo-1586023492125-27b2c045efd7'),
        img('photo-1555041469-a586c61ea9bc'),
        img('photo-1493663284031-b7e3aefcae8e'),
      ],
    },
  ],

  trust: [
    {
      icon: 'Truck',
      title: { en: 'Free delivery in the city', am: 'በከተማ ውስጥ ነፃ ማድረስ' },
      text: { en: 'Delivered within 3 to 5 working days. Other cities by arrangement.', am: 'በ3 እስከ 5 የሥራ ቀናት ውስጥ ይደርሳል። ለሌሎች ከተሞች በስምምነት።' },
    },
    {
      icon: 'Wrench',
      title: { en: 'Free assembly & installation', am: 'ነፃ ገጠማና ተከላ' },
      text: { en: 'Our team assembles it in your room and removes the packaging.', am: 'ቡድናችን በክፍልዎ ውስጥ ገጥሞ ማሸጊያውን ይወስዳል።' },
    },
    {
      icon: 'BadgeCheck',
      title: { en: '5-year wood warranty', am: 'የ5 ዓመት የእንጨት ዋስትና' },
      text: { en: 'Covers cracks, warping and joint failure under normal use.', am: 'በተለመደ አጠቃቀም ስንጥቅ፣ መጣመምና የመገጣጠሚያ ችግርን ይሸፍናል።' },
    },
  ],

  story: {
    material: [
      { icon: 'TreePine', title: { en: 'Solid mahogany frame', am: 'ጠንካራ የማሆጋኒ ፍሬም' }, text: { en: 'Kiln-dried to prevent warping, with mortise-and-tenon joints instead of staples.', am: 'መጣመምን ለመከላከል በምድጃ የደረቀ፤ ከስቴፕል ፈንታ በሞርቲስና ቴኖን መገጣጠሚያ የተሠራ።' } },
      { icon: 'Droplets', title: { en: 'Water-resistant coating', am: 'ውሃ የሚቋቋም ሽፋን' }, text: { en: 'A protective fabric finish makes spills easy to wipe away before they stain.', am: 'መከላከያ የጨርቅ ሽፋን የፈሰሰ ፈሳሽ ሳይበክል በቀላሉ እንዲጠረግ ያደርጋል።' } },
      { icon: 'Hammer', title: { en: 'Hand-finished details', am: 'በእጅ የተጠናቀቁ ዝርዝሮች' }, text: { en: 'Every leg and edge is sanded by hand and sealed with a durable lacquer.', am: 'እያንዳንዱ እግርና ጠርዝ በእጅ ተፈጭቶ በጠንካራ ላከር ተሸፍኗል።' } },
    ],
    design: [
      { icon: 'Armchair', title: { en: 'Ergonomic back support', am: 'ergonomic የጀርባ ድጋፍ' }, text: { en: 'A slightly reclined back angle supports your spine through long evenings.', am: 'ጥቂት ዘንበል ያለ የጀርባ ማዕዘን በረጅም ምሽቶች አከርካሪዎን ይደግፋል።' } },
      { icon: 'Layers', title: { en: 'High-density foam seats', am: 'ከፍተኛ ጥግግት ያለው የመቀመጫ ስፖንጅ' }, text: { en: '35 kg/m³ foam keeps its shape and does not sag after a year of daily use.', am: '35 ኪ.ግ/ሜ³ ስፖንጅ ቅርጹን ይይዛል፤ ከአንድ ዓመት የዕለት አጠቃቀም በኋላ አይሰምጥም።' } },
      { icon: 'Sparkles', title: { en: 'Timeless silhouette', am: 'ጊዜ የማይሽረው ቅርጽ' }, text: { en: 'Clean lines and tapered legs suit both traditional and modern interiors.', am: 'ንጹህ መስመሮችና የሚቀጥኑ እግሮች ለባህላዊም ለዘመናዊም ውስጣዊ ዲዛይን ይስማማሉ።' } },
    ],
    care: [
      { icon: 'Ruler', title: { en: '210 × 92 × 85 cm', am: '210 × 92 × 85 ሴ.ሜ' }, text: { en: 'Fits through a standard 80 cm door. Allow 60 cm of clearance in front.', am: 'በ80 ሴ.ሜ መደበኛ በር ያልፋል። ከፊት 60 ሴ.ሜ ክፍት ቦታ ይተው።' } },
      { icon: 'Wind', title: { en: 'Everyday care', am: 'የዕለት እንክብካቤ' }, text: { en: 'Vacuum weekly and rotate the cushions monthly. Spot-clean with a damp cloth and mild soap.', am: 'በየሳምንቱ በቫኪዩም ያጽዱ፤ ትራሶችን በየወሩ ይገላብጡ። በእርጥብ ጨርቅና ለስላሳ ሳሙና ቦታውን ብቻ ያጽዱ።' } },
      { icon: 'ShieldCheck', title: { en: 'Protect the wood', am: 'እንጨቱን ይጠብቁ' }, text: { en: 'Keep away from direct afternoon sun and radiators to preserve the finish.', am: 'ሽፋኑን ለመጠበቅ ከቀጥታ የከሰዓት ፀሐይና ከማሞቂያ ያርቁ።' } },
    ],
  },

  roomTips: [
    {
      title: { en: 'Modern Addis living room', am: 'ዘመናዊ የአዲስ አበባ ሳሎን' },
      text: { en: 'Place it against the longest wall, add a round wooden coffee table and a handwoven rug in earth tones.', am: 'በረጅሙ ግድግዳ ላይ ያስቀምጡት፤ ክብ የእንጨት ጠረጴዛና በምድር ቀለም በእጅ የተሸመነ ምንጣፍ ይጨምሩ።' },
    },
    {
      title: { en: 'Coffee ceremony corner', am: 'የቡና ሥነ ሥርዓት ጥግ' },
      text: { en: 'The firm seat height makes it easy for guests to stand up and sit down during a jebena coffee ceremony.', am: 'ጠንካራው የመቀመጫ ቁመት በጀበና ቡና ሥነ ሥርዓት ጊዜ እንግዶች በቀላሉ እንዲነሱና እንዲቀመጡ ያስችላል።' },
    },
    {
      title: { en: 'Office reception', am: 'የቢሮ እንግዳ መቀበያ' },
      text: { en: 'The charcoal color hides daily wear and gives a calm, professional first impression for clients.', am: 'ጥቁር ግራጫው የዕለት ድካምን ይደብቃል፤ ለደንበኞች የተረጋጋና ሙያዊ የመጀመሪያ ስሜት ይሰጣል።' },
    },
  ],

  dimensions: { length: 210, width: 92, height: 85, seatHeight: 44, weightCapacity: 300, netWeight: 48 },

  materials: [
    { part: { en: 'Main frame', am: 'ዋና ፍሬም' }, type: 'solid', detail: { en: 'Kiln-dried solid mahogany', am: 'በምድጃ የደረቀ ጠንካራ ማሆጋኒ' } },
    { part: { en: 'Legs', am: 'እግሮች' }, type: 'solid', detail: { en: 'Solid mahogany, lacquered', am: 'ጠንካራ ማሆጋኒ፣ በላከር የተሸፈነ' } },
    { part: { en: 'Back panel (hidden)', am: 'የጀርባ ፓነል (የተሸፈነ)' }, type: 'engineered', detail: { en: '18 mm plywood, hidden from view', am: '18 ሚ.ሜ ፕላይዉድ፣ ከእይታ የተሸፈነ' } },
    { part: { en: 'Seat cushions', am: 'የመቀመጫ ትራሶች' }, type: 'engineered', detail: { en: '35 kg/m³ foam with fibre wrap', am: '35 ኪ.ግ/ሜ³ ስፖንጅ በፋይበር መጠቅለያ' } },
  ],
  fabric: { gsm: 380, maxGsm: 500, note: { en: 'Tightly woven polyester-linen blend, 50,000+ rub-test cycles.', am: 'ጥብቅ የተሸመነ ፖሊስተር-ሊነን ድብልቅ፣ ከ50,000 በላይ የመፋቅ ፈተና ዑደቶችን ያልፋል።' } },

  accordion: [
    {
      title: { en: 'Full specifications', am: 'ሙሉ ዝርዝር መግለጫ' },
      rows: [
        [{ en: 'SKU', am: 'የምርት ኮድ' }, { en: 'BETE-SOFA-3S', am: 'BETE-SOFA-3S' }],
        [{ en: 'Seating capacity', am: 'የመቀመጫ ብዛት' }, { en: '3 adults', am: '3 አዋቂዎች' }],
        [{ en: 'Frame', am: 'ፍሬም' }, { en: 'Solid mahogany', am: 'ጠንካራ ማሆጋኒ' }],
        [{ en: 'Upholstery', am: 'ጨርቅ' }, { en: 'Polyester-linen blend, 380 GSM', am: 'ፖሊስተር-ሊነን፣ 380 GSM' }],
        [{ en: 'Cushion fill', am: 'የትራስ ሙሌት' }, { en: 'High-density foam, 35 kg/m³', am: 'ከፍተኛ ጥግግት ስፖንጅ፣ 35 ኪ.ግ/ሜ³' }],
        [{ en: 'Made in', am: 'የተሠራበት' }, { en: 'Ethiopia', am: 'ኢትዮጵያ' }],
      ],
    },
    {
      title: { en: 'Delivery & assembly', am: 'ማድረስና ገጠማ' },
      rows: [
        [{ en: 'Delivery time', am: 'የማድረሻ ጊዜ' }, { en: '3 to 5 working days', am: '3 እስከ 5 የሥራ ቀናት' }],
        [{ en: 'Delivery fee', am: 'የማድረሻ ክፍያ' }, { en: 'Free inside the city', am: 'በከተማ ውስጥ ነፃ' }],
        [{ en: 'Assembly', am: 'ገጠማ' }, { en: 'Free, done by our team', am: 'ነፃ፣ በቡድናችን የሚከናወን' }],
      ],
    },
    {
      title: { en: 'Warranty & returns', am: 'ዋስትናና መመለስ' },
      rows: [
        [{ en: 'Wood frame', am: 'የእንጨት ፍሬም' }, { en: '5-year warranty', am: 'የ5 ዓመት ዋስትና' }],
        [{ en: 'Fabric & foam', am: 'ጨርቅና ስፖንጅ' }, { en: '1-year warranty', am: 'የ1 ዓመት ዋስትና' }],
        [{ en: 'Returns', am: 'መመለስ' }, { en: '7 days if unused and in original condition', am: 'ካልተጠቀሙበትና በነበረበት ሁኔታ ከሆነ በ7 ቀናት ውስጥ' }],
      ],
    },
  ],

  reviews: [
    {
      id: 1,
      author: 'Selam T.',
      date: '2026-09-14',
      ratings: { quality: 5, comfort: 5, value: 4, delivery: 5 },
      body: {
        en: 'The wood feels very solid and the fabric is soft. Delivery and assembly were on time and the team was polite.',
        am: 'እንጨቱ በጣም ጠንካራ ሆኖ ይሰማል፤ ጨርቁም ለስላሳ ነው። ማድረስና ገጠማው በሰዓቱ ነበር፤ ቡድኑም ትሁት ነበር።',
      },
      photos: [img('photo-1555041469-a586c61ea9bc')],
    },
    {
      id: 2,
      author: 'Dawit M.',
      date: '2026-08-30',
      ratings: { quality: 5, comfort: 4, value: 5, delivery: 5 },
      body: {
        en: 'Better than the showroom pictures. My whole family uses it every day and it still looks new.',
        am: 'ከሾውሩም ፎቶዎች የተሻለ ነው። መላው ቤተሰቤ በየቀኑ ይጠቀምበታል፤ አሁንም አዲስ ይመስላል።',
      },
      photos: [],
    },
    {
      id: 3,
      author: 'Hanna B.',
      date: '2026-08-02',
      ratings: { quality: 4, comfort: 5, value: 4, delivery: 4 },
      body: {
        en: 'Very comfortable for long conversations with guests. The olive green looks lovely in natural light.',
        am: 'ከእንግዶች ጋር ለረጅም ጭውውት በጣም ምቹ ነው። የወይራ አረንጓዴው በተፈጥሮ ብርሃን ውስጥ በጣም ያምራል።',
      },
      photos: [img('photo-1586023492125-27b2c045efd7'), img('photo-1493663284031-b7e3aefcae8e')],
    },
  ],
};