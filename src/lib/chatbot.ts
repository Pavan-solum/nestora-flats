export type ChatReply = {
  text: string;
  links?: { label: string; href: string }[];
};

const replies: { match: RegExp; reply: ChatReply }[] = [
  {
    match: /\b(hi|hello|hey|namaste|good\s*(morning|afternoon|evening))\b/i,
    reply: {
      text: "Hello! I’m Nestora Assist. I can help you buy or sell a flat through our marketing agents, or find Bengaluru areas to explore.",
      links: [
        { label: "Contact agent", href: "/enquiry" },
        { label: "Explore Bengaluru", href: "/explore/bengaluru" },
      ],
    },
  },
  {
    match: /\b(buy|buying|purchase|looking\s*for|want\s*a\s*flat)\b/i,
    reply: {
      text: "To buy a flat, browse listings by city and area, then contact a Nestora agent. We coordinate visits and negotiations — you don’t deal with sellers directly here.",
      links: [
        { label: "Buy with Nestora", href: "/enquiry?intent=buy" },
        { label: "Browse listings", href: "/listings" },
      ],
    },
  },
  {
    match: /\b(sell|selling|list\s*my|owner)\b/i,
    reply: {
      text: "To sell your flat, share details with a Nestora marketing agent. We list and promote your home and connect you with serious buyers.",
      links: [{ label: "Sell with Nestora", href: "/enquiry?intent=sell" }],
    },
  },
  {
    match: /\b(bengaluru|bangalore|whitefield|koramangala|indiranagar|hsr|hebbal|area|localit)\b/i,
    reply: {
      text: "Nestora focuses on city → area browsing. Start with Bengaluru, then pick a locality like Whitefield, Koramangala, Indiranagar, or HSR Layout.",
      links: [
        { label: "Bengaluru areas", href: "/explore/bengaluru" },
        { label: "All cities", href: "/explore" },
      ],
    },
  },
  {
    match: /\b(price|cost|budget|starting|how\s*much|₹|rs\.?)\b/i,
    reply: {
      text: "Listings show “Starting from” prices. Exact offers are discussed with a Nestora agent after you enquire — pricing depends on negotiation and property details.",
      links: [
        { label: "View listings", href: "/listings" },
        { label: "Ask an agent", href: "/enquiry" },
      ],
    },
  },
  {
    match: /\b(agent|broker|contact|call|phone|visit|enquiry|enquir)\b/i,
    reply: {
      text: "Buyers and sellers both contact Nestora agents. Use the contact form or call the agent desk at +91 98765 43210 (demo).",
      links: [
        { label: "Contact agent", href: "/enquiry" },
        { label: "Office contact", href: "/contact" },
      ],
    },
  },
  {
    match: /\b(admin|login|password|dashboard)\b/i,
    reply: {
      text: "Nestora agents manage inventory from the admin dashboard. Demo login: username admin, password admin123.",
      links: [{ label: "Admin login", href: "/admin/login" }],
    },
  },
  {
    match: /\b(amenit|facing|bedroom|bhk|school|hospital|transport|metro)\b/i,
    reply: {
      text: "Each flat detail page shows bedrooms, facing, amenities, and nearby schools, colleges, hospitals, and transport. Open any listing to review those sections.",
      links: [{ label: "Open listings", href: "/listings" }],
    },
  },
  {
    match: /\b(favorit|shortlist|save)\b/i,
    reply: {
      text: "Tap the heart on a listing to save it. Your shortlist stays in Favorites on this device.",
      links: [{ label: "Favorites", href: "/favorites" }],
    },
  },
  {
    match: /\b(help|support|what\s*can|how\s*work|about)\b/i,
    reply: {
      text: "Nestora is a brokerage: explore flats by city and area, then contact our marketing agent to buy or sell. I can help with buying, selling, Bengaluru areas, prices, or contacting an agent.",
      links: [
        { label: "About Nestora", href: "/about" },
        { label: "Contact agent", href: "/enquiry" },
      ],
    },
  },
];

export const CHAT_QUICK_PROMPTS = [
  "I want to buy a flat",
  "I want to sell",
  "Show Bengaluru areas",
  "Contact an agent",
];

export function getChatbotReply(input: string): ChatReply {
  const text = input.trim();
  if (!text) {
    return {
      text: "Type a question, or pick a quick option below.",
    };
  }

  for (const item of replies) {
    if (item.match.test(text)) return item.reply;
  }

  return {
    text: "I’m not sure about that yet. Try asking about buying, selling, Bengaluru areas, prices, or contacting a Nestora agent.",
    links: [
      { label: "Contact agent", href: "/enquiry" },
      { label: "Explore cities", href: "/explore" },
      { label: "About Nestora", href: "/about" },
    ],
  };
}
