/** Page content. Rendered on the server only — never shipped to the client bundle. */
const pages = {
  home: {
    meta: {
      title: "Taxi & chauffeur service in Lebanon",
      description:
        "Book city rides, Beirut airport transfers and long-distance trips across Lebanon. See an upfront fare estimate and ride now or schedule ahead.",
    },
    hero: {
      eyebrow: "Taxi & chauffeur service in Lebanon",
      title: "Reliable rides, wherever Lebanon takes you.",
      subtitle:
        "From Beirut airport to Byblos, Tripoli or the Bekaa — see your fare before you book, and ride now or schedule ahead.",
      highlights: ["Upfront fare estimates", "Ride now or schedule ahead", "Book in Arabic or English"],
    },
    services: {
      eyebrow: "Services",
      title: "One service for every kind of journey",
      subtitle: "Short hops across the city, early flights and long drives up the coast — planned around your time.",
      cta: "Explore all services",
    },
    vehicles: {
      eyebrow: "Vehicle categories",
      title: "Choose the ride that fits",
      subtitle: "From everyday sedans to spacious vans, pick the category that suits your group and luggage.",
      cta: "Compare the fleet",
    },
    airportPromo: {
      eyebrow: "Airport transfers",
      title: "Land in Beirut and head straight home",
      body: "Reserve your transfer to or from Beirut–Rafic Hariri International Airport in advance. Add your flight number and luggage so we can match the right vehicle.",
      points: ["Reserve ahead for early or late flights", "Flight number captured with every booking", "Vehicles sized for your luggage"],
      cta: "Book an airport transfer",
    },
    why: {
      eyebrow: "Why choose us",
      title: "Built around clarity and comfort",
      items: [
        { title: "Upfront fare estimates", body: "See an estimated fare before you confirm — no meter guesswork." },
        { title: "Professional standards", body: "Drivers and vehicles are expected to meet clear conduct, cleanliness and maintenance standards." },
        { title: "Ride now or later", body: "Request an immediate pickup or schedule a ride days in advance." },
        { title: "Arabic and English", body: "The whole booking experience works in both languages, right to left or left to right." },
      ],
    },
    how: {
      eyebrow: "How it works",
      title: "Booked in three simple steps",
      steps: [
        { title: "Tell us where", body: "Choose pickup, destination and whether you need the ride now or later." },
        { title: "Pick your ride", body: "Compare estimated fares across vehicle categories and choose one." },
        { title: "Confirm and go", body: "Review the details, add notes for your driver and confirm." },
      ],
    },
    trust: {
      eyebrow: "Rider feedback",
      title: "What riders will say",
      notice: "Sample testimonials for layout only — to be replaced with verified customer reviews.",
      items: [
        { quote: "Placeholder testimonial about a smooth early-morning airport pickup and a punctual driver.", name: "Sample rider", detail: "Airport transfer" },
        { quote: "Placeholder testimonial about booking a comfortable intercity ride to the north for the family.", name: "Sample rider", detail: "Long-distance trip" },
        { quote: "Placeholder testimonial from a business customer about reliable transport for visiting guests.", name: "Sample company", detail: "Corporate account" },
      ],
    },
    cta: {
      title: "Ready when you are",
      body: "Get a fare estimate now, or talk to our team about regular and corporate travel.",
      primary: "Book a ride",
      secondary: "Contact us",
    },
    faqPreview: {
      eyebrow: "FAQ",
      title: "Questions, answered",
      cta: "See all questions",
    },
  },

  about: {
    meta: {
      title: "About us",
      description: "Who we are, what we stand for, and how we approach safety, reliability and our fleet.",
    },
    hero: {
      eyebrow: "About us",
      title: "Moving Lebanon with care and clarity",
      subtitle: "We're building a dependable, transparent way to get around Lebanon — for residents, visitors and businesses alike.",
    },
    intro: {
      title: "Who we are",
      paragraphs: [
        "Masar is a taxi and chauffeur service focused on doing the basics exceptionally well: arriving on time, pricing transparently, and treating every passenger with respect.",
        "We combine local knowledge of Lebanon's roads and neighbourhoods with modern booking tools, so getting a ride is as simple in Arabic as it is in English.",
      ],
      placeholderNotice: "Company history, founding date and operating figures will be added once confirmed.",
    },
    mission: {
      eyebrow: "Our mission",
      title: "Make every ride predictable, comfortable and fair.",
      body: "We believe passengers deserve to know what they'll pay, who is driving them, and when they'll arrive — every time.",
    },
    values: {
      title: "What we value",
      items: [
        { title: "Respect", body: "Courteous service for every passenger, whatever the trip." },
        { title: "Transparency", body: "Clear estimates up front and honest communication if plans change." },
        { title: "Reliability", body: "Planning ahead so rides happen when they're supposed to." },
        { title: "Care", body: "Clean vehicles, careful driving and attention to the details." },
      ],
    },
    safety: {
      eyebrow: "Safety & reliability",
      title: "Standards we hold ourselves to",
      body: "Our safety and reliability standards are being formalised for launch. These are the commitments they are built around:",
      items: [
        { title: "Driver standards", body: "Drivers are expected to hold the appropriate licences and follow a clear code of conduct." },
        { title: "Vehicle upkeep", body: "Vehicles are expected to be regularly maintained and cleaned between trips." },
        { title: "Trip details shared", body: "Booking confirmations include your trip details and reference for peace of mind." },
        { title: "Support when needed", body: "A team you can contact about any booking, before or after your ride." },
      ],
    },
    fleet: {
      title: "A fleet for every journey",
      body: "From economy sedans to spacious vans, our vehicle categories cover solo trips, family travel and business guests.",
      cta: "See our fleet",
    },
  },

  services: {
    meta: {
      title: "Our services",
      description: "City rides, airport transfers, scheduled rides, corporate transportation and long-distance trips across Lebanon.",
    },
    hero: {
      eyebrow: "Our services",
      title: "Transportation for every part of your day",
      subtitle: "Whatever the distance or occasion, choose the service that matches your plans.",
    },
    items: {
      city: {
        title: "City transportation",
        summary: "Quick, comfortable rides around Beirut and Lebanon's main cities.",
        body: "Whether it's a meeting in Downtown Beirut, dinner in Achrafieh or errands in Jounieh, request a ride now and see an estimate before you confirm.",
        points: ["Immediate or scheduled pickup", "Upfront fare estimate", "Choose the vehicle category"],
        cta: "Book a city ride",
      },
      airport: {
        title: "Airport transfers",
        summary: "Pickups and drop-offs at Beirut–Rafic Hariri International Airport.",
        body: "Reserve a transfer to or from the airport in advance. Share your flight number and luggage so the right vehicle is ready for you.",
        points: ["Advance reservation", "Flight number on every booking", "Luggage-aware vehicle matching"],
        cta: "Plan an airport transfer",
      },
      scheduled: {
        title: "Scheduled rides",
        summary: "Book days ahead for early starts, appointments and events.",
        body: "Lock in a pickup time for the moments that matter — a hospital appointment, a wedding or an early flight.",
        points: ["Book from 30 minutes to days ahead", "Notes for your driver", "Reference number for every booking"],
        cta: "Schedule a ride",
      },
      corporate: {
        title: "Corporate transportation",
        summary: "Reliable transport for teams, clients and visiting guests.",
        body: "Arrange rides for employees and guests, with business-class vehicles available for important meetings. Corporate accounts are being set up — contact us to discuss your needs.",
        points: ["Business-class vehicles", "Guest and employee travel", "Dedicated point of contact"],
        cta: "Talk to our team",
      },
      longDistance: {
        title: "Long-distance transportation",
        summary: "Intercity trips across Lebanon — north, south and into the Bekaa.",
        body: "Travel to Tripoli, Byblos, Batroun, Sidon, Tyre, Zahle and beyond with an estimate agreed before you set off.",
        points: ["Fare estimate before departure", "Spacious options for families", "Stops can be noted in advance"],
        cta: "Plan a long-distance trip",
      },
    },
  },

  fleet: {
    meta: {
      title: "Our fleet",
      description: "Compare vehicle categories — passenger capacity, luggage space and features — and book the right ride.",
    },
    hero: {
      eyebrow: "Our fleet",
      title: "The right vehicle for every trip",
      subtitle: "Compare categories by passengers, luggage and features, then book in a few taps.",
    },
    passengers: "Up to {count} passengers",
    luggage: "Up to {count} medium bags",
    features: "Features",
    examples: "Example models",
    from: "Estimates from",
    note: "Vehicles shown are representative of each category; the exact model may vary. Fares shown are demo estimates.",
    helpTitle: "Not sure which to choose?",
    helpBody: "Tell us about your group and luggage and we'll recommend a category.",
    helpCta: "Contact us",
  },

  airport: {
    meta: {
      title: "Beirut airport transfers",
      description: "Reserve pickups and drop-offs at Beirut–Rafic Hariri International Airport in advance, with flight number and luggage details.",
    },
    hero: {
      eyebrow: "Airport transfers",
      title: "Beirut airport transfers, planned ahead",
      subtitle: "Reserve your ride to or from Beirut–Rafic Hariri International Airport and travel without the scramble.",
    },
    formTitle: "Reserve your transfer",
    formSubtitle: "Add your flight number and luggage for the smoothest pickup.",
    features: [
      { title: "Airport pickup", body: "Arriving in Beirut? Book ahead and your ride is arranged around your flight's arrival time." },
      { title: "Airport drop-off", body: "Departing? Schedule your pickup with enough time for check-in and traffic." },
      { title: "Advance reservation", body: "Reserve days ahead — especially for very early or late flights." },
      { title: "Flight number", body: "Add your flight number so your driver can plan around your arrival or departure." },
    ],
    luggage: {
      title: "Luggage requirements",
      body: "Choose a vehicle with enough space for everyone's bags. As a guide:",
      vehicleColumn: "Vehicle",
      passengersColumn: "Passengers",
      luggageColumn: "Medium bags",
      note: "Travelling with oversized items such as strollers, bicycles or sports equipment? Mention them in the driver notes or contact us before booking.",
    },
    tips: {
      title: "Before you travel",
      items: [
        "For departures, allow extra time for traffic on the airport road at peak hours.",
        "Double-check your flight number and terminal before confirming.",
        "Keep your booking reference handy when meeting your driver.",
      ],
    },
  },

  contact: {
    meta: {
      title: "Contact us",
      description: "Get in touch about bookings, corporate transportation or feedback.",
    },
    hero: {
      eyebrow: "Contact",
      title: "We're here to help",
      subtitle: "Questions about a booking, corporate travel or feedback — reach out and our team will get back to you.",
    },
    channelsTitle: "Contact details",
    channelsNotice: "These contact details are placeholders and will be replaced with verified business information.",
    phone: "Phone",
    whatsapp: "WhatsApp",
    email: "Email",
    address: "Address",
    hours: "Hours",
    mapTitle: "Location",
    mapPlaceholder: "Map placeholder — a location map will be added once the business address is confirmed.",
  },

  faq: {
    meta: {
      title: "Frequently asked questions",
      description: "Answers about booking, fares, payment, airport transfers and safety.",
    },
    hero: {
      eyebrow: "FAQ",
      title: "Frequently asked questions",
      subtitle: "Can't find what you're looking for? Contact us and we'll help.",
    },
    contactCta: "Contact us",
    groups: [
      {
        title: "Booking",
        items: [
          { q: "How do I book a ride?", a: "Enter your pickup and destination, choose whether you need the ride now or at a later time, then compare estimated fares and confirm the vehicle category that suits you." },
          { q: "How far in advance can I schedule a ride?", a: "Scheduled rides must be booked at least 30 minutes ahead. For airport transfers and early-morning trips we recommend booking as early as possible." },
          { q: "Can I change or cancel my booking?", a: "Cancellation and change options will be shown in your booking details once accounts launch. Until then, contact us with your booking reference." },
        ],
      },
      {
        title: "Fares & payment",
        items: [
          { q: "How is my fare calculated?", a: "Estimates are based on distance, typical travel time and vehicle category, plus any applicable fees such as airport or night rates. The estimate is shown before you confirm." },
          { q: "Can the final fare differ from the estimate?", a: "It can, for example with significant waiting time, added stops or route changes requested during the trip." },
          { q: "Which payment methods are accepted?", a: "Available payment methods are shown when you confirm your booking. The platform is designed to support cash, card and digital wallets; availability will be confirmed at launch." },
        ],
      },
      {
        title: "Airport transfers",
        items: [
          { q: "Why do you ask for my flight number?", a: "It helps your driver plan around your arrival or departure time." },
          { q: "What if I have a lot of luggage?", a: "Choose a larger category such as Van, and mention oversized items in the notes for your driver." },
        ],
      },
      {
        title: "Safety & support",
        items: [
          { q: "Who are the drivers?", a: "Drivers are expected to hold the appropriate licences and follow our code of conduct. Full driver standards will be published at launch." },
          { q: "How do I contact support?", a: "Use the contact form or the contact details on our Contact page, and include your booking reference if you have one." },
        ],
      },
    ],
  },

  book: {
    meta: {
      title: "Book a ride",
      description: "Get an upfront fare estimate and book a taxi in Lebanon — now or scheduled.",
    },
    hero: {
      eyebrow: "Book a ride",
      title: "Where can we take you?",
      subtitle: "Choose your route, compare estimated fares and confirm in a few steps.",
    },
  },

  designSystem: {
    meta: { title: "Design system", description: "Foundations and components of the platform." },
    title: "Design system",
    subtitle: "The foundations and components that make up the platform. Switch language to preview RTL.",
  },
};

export default pages;
