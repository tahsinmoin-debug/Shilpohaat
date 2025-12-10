// File: backend/scripts/seedBlogPosts.js
// Run with: node backend/scripts/seedBlogPosts.js

require('dotenv').config();
const mongoose = require('mongoose');
const BlogPost = require('../models/BlogPost.js');

const DEMO_POSTS = [
  {
    title: 'Nasima Khatun: Sculpting Stories from Bangladesh\'s Clay',
    slug: 'nasima-khatun-sculpting-stories',
    excerpt: 'Meet Nasima Khatun, a master sculptor bringing traditional Bengali clay art to the contemporary world. Her sculptures tell powerful stories of village life.',
    content: `<h2>From Village Potter to Master Sculptor</h2>
    
    <p>Nasima Khatun's hands move with practiced grace across the wet clay, shaping what will become another masterpiece celebrating Bengali culture. In her small studio in Dhaka, she works tirelessly to preserve traditional sculpting techniques while infusing them with contemporary themes.</p>

    <p>"Clay speaks to me," Nasima explains, her fingers never stopping their rhythmic dance. "It carries the memory of our land, our rivers, our people. When I shape it, I'm not just creating art — I'm telling the stories of generations."</p>

    <h3>Early Beginnings</h3>
    
    <p>Born in a rural village near the Padma River, Nasima learned the basics of clay work from her grandmother, who made traditional pottery. But Nasima dreamed of something more. She moved to Dhaka at 18 with nothing but her talent and determination.</p>

    <p>Today, her sculptures grace galleries across Bangladesh and beyond. Each piece reflects the strength and resilience of Bengali women, the beauty of rural landscapes, and the rich cultural heritage of her homeland.</p>

    <blockquote>"Western art has dominated for too long. Our traditional crafts, our stories, our techniques — they deserve to be seen and celebrated. Through my work, I want to show the world the beauty of Bengali art."</blockquote>

    <h3>The Women of Padma Series</h3>
    
    <p>Her latest series, "Women of the Padma," features life-sized clay sculptures of village women engaged in daily activities — fishing, weaving, carrying water. The pieces are both nostalgic and contemporary, traditional yet innovative.</p>

    <h3>Advice for Aspiring Artists</h3>
    
    <p>For aspiring artists, Nasima has simple advice: "Don't abandon your roots in pursuit of trends. The most powerful art comes from authenticity. Tell your own story, honor your heritage, and the world will listen."</p>`,
    coverImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1200&h=800&fit=crop',
    category: 'Interview',
    author: {
      name: 'Rahim Ahmed',
      avatar: 'https://i.pravatar.cc/150?img=60',
    },
    tags: ['Sculpture', 'Traditional Art', 'Bengali Heritage', 'Women Artists'],
    featured: true,
    readTime: 8,
    publishedAt: new Date('2025-12-06'),
  },
  {
    title: 'The Ancient Art of Nakshi Kantha: Weaving Stories in Thread',
    slug: 'nakshi-kantha-weaving-stories',
    excerpt: 'Discover the centuries-old tradition of Nakshi Kantha embroidery and how modern artists are keeping this Bengali heritage alive.',
    content: `<h2>Threads That Tell Stories</h2>
    
    <p>The tradition of Nakshi Kantha embroidery has been passed down through Bengali families for over a thousand years. These colorful quilts, made from layers of old saris and cloth, are more than just functional items — they're storytelling canvases.</p>

    <h3>Historical Significance</h3>
    
    <p>Each stitch in a Nakshi Kantha tells a story. Traditional motifs include lotus flowers symbolizing purity, fish representing prosperity, and trees of life celebrating fertility and growth. Rural women would spend months creating these elaborate pieces, often as gifts for newlyweds or new babies.</p>

    <p>The name "Nakshi" comes from "naksha," meaning artistic pattern. The running stitch technique, called "kantha stitch," creates rippling patterns across the fabric, giving the quilts their characteristic texture.</p>

    <h3>Colonial Period and Revival</h3>
    
    <p>During the British colonial period, Nakshi Kantha nearly disappeared as mass-produced textiles flooded the market. But in the 1970s, a cultural revival began. Organizations like Aarong and Kumudini started working with rural artisans to preserve the craft.</p>

    <blockquote>"Each stitch carries the memories, hopes, and dreams of the woman who made it."</blockquote>

    <h3>Contemporary Renaissance</h3>
    
    <p>Today, contemporary artists are reinventing Nakshi Kantha. Some incorporate modern imagery — cityscapes, abstract patterns, even portraits. Others experiment with color palettes beyond the traditional reds and golds.</p>

    <p>Anjali Das, a textile artist featured on Shilpohaat, explains: "I use traditional techniques but tell contemporary stories. A Nakshi Kantha about climate change, about migration, about women's rights. The medium is ancient, but the message is urgent."</p>

    <h3>Global Recognition</h3>
    
    <p>The global fashion world has taken notice. Designer Sabyasachi has featured Nakshi Kantha in his collections. International museums, including the Victoria and Albert in London, have acquired pieces for their permanent collections.</p>

    <p>But the heart of the tradition remains in Bangladesh's villages, where women still gather to stitch, share stories, and pass the art to the next generation.</p>`,
    coverImage: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1200&h=800&fit=crop',
    category: 'Heritage',
    author: {
      name: 'Sultana Begum',
      avatar: 'https://i.pravatar.cc/150?img=41',
    },
    tags: ['Textile Art', 'Bengali Heritage', 'Traditional Crafts', 'Embroidery'],
    featured: true,
    readTime: 6,
    publishedAt: new Date('2025-12-05'),
  },
  {
    title: 'From Sketch to Canvas: The Art Process Revealed',
    slug: 'sketch-to-canvas-art-process',
    excerpt: 'Ever wondered how artists transform a simple idea into a stunning painting? Follow watercolor artist Meher Ali through his creative process.',
    content: `<h2>The Journey from Blank Canvas to Masterpiece</h2>
    
    <p>The blank canvas stares back at Meher Ali with infinite possibility. It's 5 AM, and the soft dawn light filtering through his studio window provides the perfect illumination for his work.</p>

    <p>"The beginning is always the hardest," Meher admits, preparing his watercolors. "You have this vision in your mind, but translating it to paper — that's where the magic and the struggle happen."</p>

    <h3>Step 1: The Concept</h3>

    <p>Every painting starts with inspiration. For Meher, it often comes from his morning walks along the Buriganga River. He keeps a small sketchbook, capturing quick impressions — the way light plays on water, a fisherman's silhouette, the chaos of boats at dawn.</p>

    <h3>Step 2: The Sketch</h3>

    <p>Back in the studio, he refines these rough sketches. Using a soft pencil on watercolor paper, he lightly outlines the composition. "Watercolor is unforgiving," he explains. "You can't really erase or paint over mistakes. The sketch needs to be right."</p>

    <h3>Step 3: Color Planning</h3>

    <p>Before touching water to paint, Meher creates a small color study. He tests combinations, ensuring they'll blend harmoniously. "Bengali landscapes have such rich colors — the deep greens, the golden sunlight, the gray monsoon skies. Capturing that authenticity requires careful planning."</p>

    <blockquote>"You have to work with the water, not against it. It has its own agenda."</blockquote>

    <h3>Step 4: The First Wash</h3>

    <p>Watercolor painting works from light to dark. Meher begins with pale washes of color, establishing the overall tone. His brush moves quickly, keeping the paper wet. "You have to work with the water, not against it. It has its own agenda."</p>

    <h3>Step 5: Building Layers</h3>

    <p>As each layer dries, Meher adds more detail and depth. The background emerges first — sky, water, distant shores. Then mid-ground elements — boats, buildings. Finally, foreground details that draw the eye.</p>

    <h3>Step 6: The Finishing Touches</h3>

    <p>The final stage involves fine details and darkest shadows. A few careful strokes can transform a good painting into something extraordinary. Meher knows when to stop — another skill that took years to learn.</p>

    <p>"Each painting teaches me something new," he reflects, signing his completed work. "About technique, yes, but also about patience, observation, and trusting the process."</p>`,
    coverImage: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1200&h=800&fit=crop',
    category: 'Art Process',
    author: {
      name: 'Nadia Rahman',
      avatar: 'https://i.pravatar.cc/150?img=32',
    },
    tags: ['Watercolor', 'Art Process', 'Tutorial', 'Painting'],
    featured: true,
    readTime: 7,
    publishedAt: new Date('2025-12-04'),
  },
  {
    title: 'Digital Art Revolution: Bengali Folk Art Meets Technology',
    slug: 'digital-art-bengali-folk',
    excerpt: 'How digital artists are preserving and reimagining traditional Bengali art forms through cutting-edge technology.',
    content: `<h2>Tradition Meets Innovation</h2>
    
    <p>Rahman Chowdhury's iPad glows in the dim studio light as his Apple Pencil dances across the screen. He's recreating a traditional Alpona design — the intricate rice powder patterns women draw on floors during festivals — but with a digital twist.</p>

    <p>"People think digital art is disconnected from tradition," Rahman says, zooming into his intricate design. "But I see it as the next evolution. We're not abandoning our heritage — we're ensuring it survives for the next generation."</p>

    <h3>The Digital Art Movement</h3>
    
    <p>The digital art movement in Bangladesh is small but growing. Artists like Rahman use tools like Procreate, Adobe Fresco, and Cinema 4D to create works that honor Bengali traditions while embracing contemporary aesthetics.</p>

    <p>Traditional Nakshi Kantha patterns become animated GIFs. Mythological figures from Mangal Kavya manuscripts transform into comic book characters. The iconic rickshaw art of Dhaka inspires vibrant digital illustrations.</p>

    <blockquote>"Digital tools give us superpowers. Layers, undo buttons, infinite color palettes. But the foundation is still traditional composition, color theory, storytelling."</blockquote>

    <h3>Commercial Potential</h3>
    
    <p>The commercial potential is significant. Digital art can be printed on everything from t-shirts to phone cases. NFTs (though controversial) have opened new markets. International brands are hiring Bengali digital artists for their unique aesthetic.</p>

    <h3>Challenges and Opportunities</h3>
    
    <p>But challenges remain. Proper graphics tablets are expensive. Internet connectivity can be unreliable. And there's still skepticism from the traditional art community.</p>

    <p>"My grandfather was a scroll painter," Rahman shares. "When I showed him my work on the iPad, he was quiet for a long time. Then he said, 'The tools change, but the story remains the same.' That's when I knew I was on the right path."</p>`,
    coverImage: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200&h=800&fit=crop',
    category: 'Art Process',
    author: {
      name: 'Tanvir Hossain',
      avatar: 'https://i.pravatar.cc/150?img=51',
    },
    tags: ['Digital Art', 'Modern Art', 'Technology', 'Folk Art'],
    featured: false,
    readTime: 6,
    publishedAt: new Date('2025-12-03'),
  },
  {
    title: 'Shilpohaat Launch: A New Platform for Bengali Artists',
    slug: 'shilpohaat-launch-announcement',
    excerpt: 'Introducing Shilpohaat — a digital marketplace connecting Bengali artists with art lovers worldwide.',
    content: `<h2>Bridging Artists and Collectors</h2>
    
    <p>After months of development, we're thrilled to announce the official launch of Shilpohaat, Bangladesh's premier online platform for local artists.</p>

    <p>The name "Shilpohaat" combines "shilpo" (art/craft) and "haat" (market) — evoking the traditional village markets where artisans have sold their wares for centuries. But this is a haat for the digital age.</p>

    <h3>The Problem We're Solving</h3>

    <p>Talented Bengali artists often struggle to find buyers for their work. Traditional galleries take high commissions and have limited reach. Social media helps with visibility but lacks proper e-commerce infrastructure.</p>

    <p>Meanwhile, art lovers want to support local artists but don't know where to find authentic, quality work. The disconnect between creators and collectors hurts everyone.</p>

    <h3>Our Solution</h3>

    <p>Shilpohaat bridges this gap with:</p>
    <ul>
      <li>Artist profiles showcasing portfolios</li>
      <li>Direct sales with fair commission structure (only 15%)</li>
      <li>Educational content about Bengali art traditions</li>
      <li>Community features connecting artists and collectors</li>
      <li>Secure payment processing</li>
      <li>Nationwide delivery</li>
    </ul>

    <blockquote>"A digital marketplace that respects tradition while embracing the future."</blockquote>

    <h3>Who We Serve</h3>

    <p>Artists from all disciplines: painters, sculptors, textile artists, jewelers, digital creators, and more. Whether you're creating traditional Nakshi Kantha or contemporary abstracts, there's a place for you here.</p>

    <p>Art buyers looking for authentic Bengali work, whether for personal collections, gifts, or interior design.</p>

    <h3>Looking Forward</h3>

    <p>This is just the beginning. Future features will include artist residency programs, virtual gallery exhibitions, art education courses, collaboration tools, and international shipping.</p>

    <p>Join us in celebrating and supporting Bengali artistic heritage. Whether you're creating art or collecting it, Shilpohaat is your new home.</p>`,
    coverImage: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200&h=800&fit=crop',
    category: 'News',
    author: {
      name: 'Shilpohaat Team',
      avatar: 'https://i.pravatar.cc/150?img=70',
    },
    tags: ['News', 'Platform', 'Launch', 'Community'],
    featured: false,
    readTime: 4,
    publishedAt: new Date('2025-12-02'),
  },
  {
    title: 'The Business of Art: Pricing Your Work for Success',
    slug: 'business-of-art-pricing',
    excerpt: 'A practical guide for artists on how to price their work fairly and sustainably.',
    content: `<h2>Finding the Right Price Point</h2>
    
    <p>One of the most challenging aspects of being an artist is determining what to charge for your work. Price too high, and you might not sell. Price too low, and you undervalue your talent and can't sustain your practice.</p>

    <h3>The Cost-Plus Method</h3>

    <p>Start by calculating your costs:</p>
    <ul>
      <li>Materials (canvas, paint, thread, clay, etc.)</li>
      <li>Time (multiply hours worked by your desired hourly rate)</li>
      <li>Overhead (studio rent, utilities, equipment depreciation)</li>
      <li>Marketing and packaging</li>
    </ul>

    <p>Add these together, then add your desired profit margin (typically 30-50%).</p>

    <h3>The Market Rate Method</h3>

    <p>Research what similar artists charge for comparable work. Consider your experience level, the size and complexity of the piece, your artistic reputation, and your geographic market.</p>

    <blockquote>"Don't undercut yourself just to make sales. Sustainable pricing allows you to continue creating."</blockquote>

    <h3>Psychological Pricing</h3>

    <p>৳9,900 often sells better than ৳10,000 due to perceived value. Round numbers can work for premium positioning. Test different price points to see what resonates with your audience.</p>

    <h3>Building Value</h3>

    <p>Justify higher prices through professional presentation, strong artist statements, certificate of authenticity, quality framing/finishing, and your unique story and technique.</p>

    <h3>Common Mistakes</h3>

    <p>Don't price based on what you'd personally pay. You're not your target market. Don't radically change prices based on individual buyers. Consistency builds trust. Don't forget to factor in gallery commissions (typically 40-50%).</p>

    <h3>Growing Your Prices</h3>

    <p>As you gain recognition, gradually increase prices with each solo exhibition, as your following grows, when previous works sell out, or after winning awards or recognition.</p>

    <p>Loyal collectors expect some price increases over time — it signals your growing success.</p>`,
    coverImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1200&h=800&fit=crop',
    category: 'Art Process',
    author: {
      name: 'Kamal Uddin',
      avatar: 'https://i.pravatar.cc/150?img=15',
    },
    tags: ['Business', 'Pricing', 'Career', 'Tips'],
    featured: false,
    readTime: 5,
    publishedAt: new Date('2025-12-01'),
  },
];

async function seedBlogPosts() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shilpohaat';
    await mongoose.connect(mongoURI);
    console.log('✓ Connected to MongoDB\n');

    // Delete existing demo posts
    const deleted = await BlogPost.deleteMany({});
    console.log(`🗑️  Deleted ${deleted.deletedCount} existing blog posts\n`);

    // Create new posts
    console.log('✨ Creating blog posts...\n');
    
    for (const postData of DEMO_POSTS) {
      const post = new BlogPost(postData);
      await post.save();
      console.log(`✓ Created: "${post.title}"`);
      console.log(`  Category: ${post.category} | Featured: ${post.featured} | Read Time: ${post.readTime}min\n`);
    }

    console.log('✅ Successfully seeded blog posts!');
    console.log(`📊 Total posts: ${DEMO_POSTS.length}`);
    console.log(`⭐ Featured posts: ${DEMO_POSTS.filter(p => p.featured).length}`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seedBlogPosts();