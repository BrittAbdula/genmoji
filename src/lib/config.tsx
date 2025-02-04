import {
  SmileIcon,
  Wand2Icon,
  SparklesIcon,
  PaletteIcon,
  Share2Icon,
  DownloadIcon,
} from "lucide-react";

export const BLUR_FADE_DELAY = 0.15;

export const siteConfig = {
  name: "Genmoji Online",
  description: "Genmoji Online is an AI-powered genmoji generator and a great alternative to Apple's Genmoji. It lets you create and share custom genmojis that perfectly express your emotions and creativity.",
  shortDescription: "Online Genmoji Generator",
  cta: "Generate Genmoji",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://genmojionline.com/",
  
  // SEO & Sharing
  seo: {
    title: "Genmoji Online - AI Genmoji Generator",
    titleTemplate: "%s | Genmoji Online",
    defaultTitle: "Genmoji Online - Create Personalized Genmojis",
    keywords: [
    ],
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: "Genmoji Online",
      images: [
        {
          url: "/og-image.png", // 默认 OG 图片
          width: 1200,
          height: 630,
          alt: "Genmoji - AI Genmoji Generator",
        }
      ],
    },
    twitter: {
      handle: "@genmojionline",
      site: "@genmojionline",
      cardType: "summary_large_image",
    },
  },

  // 分享配置
  sharing: {
    defaultText: "Check out this awesome genmoji I made with Genmoji Online!",
    hashtags: ["Genmoji", "AIGenmoji", "CustomGenmoji"],
    platforms: {
      twitter: {
        text: "Create your own custom genmojis with AI ✨",
        via: "genmojionline",
      },
      facebook: {
        quote: "Create custom genmojis that look just like Apple's with AI",
      },
      linkedin: {
        title: "Genmoji Online - AI Genmoji Generator",
        summary: "Create custom genmojis with artificial intelligence",
      }
    }
  },

  keywords: [
    "Genmoji",
    "Genmoji Generator",
    "AI Genmoji",
    "Custom Genmoji",
    "Genmoji Generator",
    "Genmoji Maker",
  ],
  links: {
    email: "support@genmojionline.com",
    twitter: "https://twitter.com/genmojionline",
    discord: "https://discord.gg/genmojionline",
    github: "https://github.com/genmojionline",
    instagram: "https://instagram.com/genmojionline",
  },
  features: [
    {
      name: "Create Apple-Style Genmojis",
      description: "Make custom genmojis that rival Apple Genmoji quality",
      icon: <Wand2Icon className="h-6 w-6" />,
    },
    {
      name: "Online Genmoji Maker",
      description: "Create genmojis instantly in your browser - no app needed",
      icon: <PaletteIcon className="h-6 w-6" />,
    },
    {
      name: "Cross-Platform",
      description: "Use Genmoji anywhere - iOS, Android, Web, and more",
      icon: <SparklesIcon className="h-6 w-6" />,
    },
    {
      name: "Easy to Share",
      description: "Get and share your Genmoji creations instantly",
      icon: <Share2Icon className="h-6 w-6" />,
    },
    {
      name: "Universal Format",
      description: "Download Genmoji for any messaging platform",
      icon: <DownloadIcon className="h-6 w-6" />,
    },
    {
      name: "Multiple Styles",
      description: "Make different versions of your Genmoji designs",
      icon: <SmileIcon className="h-6 w-6" />,
    },
  ],
  featureHighlight: [
    {
      title: "Text to Genmoji Generation",
      description:
        "Simply describe what you want, and our AI will transform your words into beautiful Apple-style genmojis instantly.",
      imageSrc: "/hero-2.png",
      direction: "rtl" as const,
    },
    {
      title: "Universal Compatibility",
      description:
        "Generated genmojis work seamlessly across all platforms - from iMessage to WhatsApp, Discord to Slack.",
      imageSrc: "/hero-3.png",
      direction: "rtl" as const,
    },
    {
      title: "Image to Genmoji Creation",
      description:
        "Upload your photos and transform them into personalized genmojis while maintaining the iconic Apple genmoji style.",
      imageSrc: "/hero-4.png",
      direction: "ltr" as const,
    },
  ],
  bento: [
    {
      title: "AI-Powered Scheduling",
      content:
        "Our app uses advanced AI to optimize your calendar, suggesting the best times for meetings and tasks based on your preferences and habits.",
      imageSrc: "/Device-1.png",
      imageAlt: "AI scheduling illustration",
      fullWidth: true,
    },
    {
      title: "Smart Time Blocking",
      content:
        "Automatically block out time for focused work, breaks, and personal activities to maintain a balanced and productive schedule.",
      imageSrc: "/Device-2.png",
      imageAlt: "Time blocking illustration",
      fullWidth: false,
    },
    {
      title: "Intelligent Reminders",
      content:
        "Receive context-aware notifications that adapt to your schedule, ensuring you never miss important events or deadlines.",
      imageSrc: "/Device-3.png",
      imageAlt: "Smart reminders illustration",
      fullWidth: false,
    },
    {
      title: "Team Collaboration",
      content:
        "Effortlessly coordinate schedules with team members and clients, finding optimal meeting times across different time zones.",
      imageSrc: "/Device-4.png",
      imageAlt: "Team collaboration illustration",
      fullWidth: true,
    },
  ],
  benefits: [
    {
      id: 1,
      text: "Save hours each week with AI-optimized scheduling.",
      image: "/Device-6.png",
    },
    {
      id: 2,
      text: "Reduce scheduling conflicts and double-bookings.",
      image: "/Device-7.png",
    },
    {
      id: 3,
      text: "Improve work-life balance with smart time allocation.",
      image: "/Device-8.png",
    },
    {
      id: 4,
      text: "Increase productivity with AI-driven time management insights.",
      image: "/Device-1.png",
    },
  ],
  pricing: [
    {
      name: "Basic",
      href: "#",
      price: "$0",
      period: "month",
      yearlyPrice: "$0",
      features: [
        "AI-powered scheduling (up to 10 events/month)",
        "Basic time blocking",
        "Cloud sync for 1 device",
        "Email reminders",
      ],
      description: "Perfect for individual users",
      buttonText: "Start Free",
      isPopular: false,
    },
    {
      name: "Pro",
      href: "#",
      price: "$12",
      period: "month",
      yearlyPrice: "$120",
      features: [
        "Unlimited AI-powered scheduling",
        "Advanced time blocking and analysis",
        "Cloud sync for unlimited devices",
        "Smart notifications across all devices",
        "Team collaboration features",
      ],
      description: "Ideal for professionals and small teams",
      buttonText: "Upgrade to Pro",
      isPopular: true,
    },
  ],
  faqs: [
    {
      question: "What is Genmoji?",
      answer: (
        <span>
          Genmoji is a new feature of Apple Intelligence that lets users create custom genmojis — called Genmoji. Genmoji is available on iOS 18.2 or later on iPhone 15 Pro, iPhone 15 Pro Max, and all iPhone 16 models. 
        </span>
      ),
    },
    {
      question: "What is genmojionline.com?",
      answer: (
        <span>
          Genmojionline.com is a website that allows you to create custom gemojis, similar to Apple's Genmoji, but without the need for an iOS device. You can generate unique gemojis using text-based prompts, and then use them on various social media platforms.
        </span>
      ),
    },
    {
      question: "How is genmojionline.com different from Apple's Genmoji?",
      answer: (
        <span>
          The primary difference is that genmojionline.com is not limited to Apple devices. You can use it on any device with a web browser.Apple's Genmoji is a feature of Apple Intelligence and is only available on devices updated to iOS 18 or later. Our site aims to provide the same functionality but with broader accessibility.
        </span>
      ),
    },
    {
      question: "What technology does genmojionline.com use?",
      answer: (
        <span>
          Our site uses an image generation model, similar to Flux 1 Dev, which is fine-tuned using a large dataset of genmojis.
          We use a language model (LLM) to make your prompt more descriptive, which improves the quality of the generated image.
          We also use background removal and resizing processes similar to Apple's methods
        </span>
      ),
    },
    {
      question: "How do I create an genmoji on genmoji online?",
      answer: (
        <span>
          You create genmojis by typing a few words or a phrase into the "Describe an genmoji" box. The website uses this prompt to generate unique genmojis.Use simple, descriptive keywords for the best results,Avoid long sentences.
        </span>
      ),
    },
    {
      question: "What kind of prompts work best?",
      answer: (
        <span>
          - Simple, descriptive prompts using keywords work best. Avoid long sentences
          <br />
          - You can specify colors, styles, and actions, such as "a red cat with a hat"
          <br />
          - Try adding the word "explosion" to create more dynamic and interesting genmojis
          <br />
        </span>
      ),
    },
    {
      question: "Can I use my own photos to create Genmoji?",
      answer: (
        <span>
          Yes, you can use photos of yourself or others to create Genmoji by uploading the image to our website. 
          You can also customize the person's clothing, actions and emotions in the prompt
          <br />
          <br />
          - The Feature is currently in beta and only available for a limited number of users.
        </span>
      ),
    },
    {
      question: "Can I use the genmojis I create as stickers?",
      answer: (
        <span>
          Yes, the genmojis you generate can be used like stickers in messaging apps. In some apps, they may also appear like normal genmojis alongside text.
        </span>
      ),
    },
    {
      question: "Are Genmoji genmojis free to use?",
      answer: (
        <span>
          Yes! All genmojis created with Genmoji Online are free to use. You retain full rights to your
          generated genmojis and can use them for personal or commercial purposes without attribution
          or copyright concerns.
        </span>
      ),
    },
    {
      question: "Where can I use my Genmojis?",
      answer: (
        <span>
          Genmojis are compatible with all major platforms including Discord, Slack, WhatsApp,
          and social media. You can download them in various formats and use them anywhere you want
          to express yourself.
        </span>
      ),
    },
    {
      question: "Why does my Genmoji look different from what I expected?",
      answer: (
        <span>
          Genmoji generation is creative and experimental, and sometimes you will not get the result you were hoping for.
          Keep swiping to see other options, or refine the prompt slightly.
If using a photo of a person, ensure the photo is well-lit and focused. You can also use the editor to try different versions of the person in the photo
        </span>
      ),
    },
  ],
  footer: [
    {
      id: 1,
      menu: [
        { href: "#", text: "Features" },
        { href: "#", text: "Pricing" },
        { href: "#", text: "About Us" },
        { href: "#", text: "Blog" },
        { href: "#", text: "Contact" },
      ],
    },
  ],
  testimonials: [
    {
      id: 1,
      text: "Cal AI has revolutionized how I manage my time. It&apos;s like having a personal assistant.",
      name: "Alice Johnson",
      role: "Freelance Designer",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cG9ydHJhaXR8ZW58MHx8MHx8fDA%3D",
    },
    {
      id: 2,
      text: "The AI-powered scheduling has significantly reduced conflicts in our team&apos;s calendar.",
      name: "Bob Brown",
      role: "Project Manager, Tech Innovations",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHBvcnRyYWl0fGVufDB8fDB8fHww",
    },
    {
      id: 3,
      text: "The smart time blocking feature has helped me maintain a better work-life balance.",
      name: "Charlie Davis",
      role: "Entrepreneur",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHBvcnRyYWl0fGVufDB8fDB8fHww",
    },
    {
      id: 4,
      text: "Cal AI's predictive planning has made my workweek so much more efficient.",
      name: "Diana Evans",
      role: "Marketing Director",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjh8fHBvcnRyYWl0fGVufDB8fDB8fHww",
    },
    {
      id: 5,
      text: "The team collaboration features have streamlined our project management process.",
      name: "Ethan Ford",
      role: "Software Team Lead",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzJ8fHBvcnRyYWl0fGVufDB8fDB8fHww",
    },
    {
      id: 6,
      text: "Cal AI has helped me balance my work and personal commitments effortlessly.",
      name: "Fiona Grant",
      role: "HR Manager",
      image:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDB8fHBvcnRyYWl0fGVufDB8fDB8fHww",
    },
    {
      id: 7,
      text: "The AI-driven insights have helped me optimize my daily routines significantly.",
      name: "George Harris",
      role: "Productivity Coach",
      image:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDR8fHBvcnRyYWl0fGVufDB8fDB8fHww",
    },
    {
      id: 8,
      text: "Cal AI's integration with my other tools has created a seamless workflow.",
      name: "Hannah Irving",
      role: "Digital Nomad",
      image:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTJ8fHBvcnRyYWl0fGVufDB8fDB8fHww",
    },
    {
      id: 9,
      text: "The smart reminders have drastically reduced my missed appointments.",
      name: "Ian Johnson",
      role: "Sales Executive",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTZ8fHBvcnRyYWl0fGVufDB8fDB8fHww",
    },
    {
      id: 10,
      text: "Cal AI's ability to learn my preferences has made scheduling a breeze.",
      name: "Julia Kim",
      role: "Researcher",
      image:
        "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjR8fHBvcnRyYWl0fGVufDB8fDB8fHww",
    },
    {
      id: 11,
      text: "The AI-suggested meeting times have improved our team's productivity.",
      name: "Kevin Lee",
      role: "Operations Manager",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Njh8fHBvcnRyYWl0fGVufDB8fDB8fHww",
    },
    {
      id: 12,
      text: "Cal AI's travel time estimations have made my commute planning much easier.",
      name: "Laura Martinez",
      role: "Urban Planner",
      image:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzJ8fHBvcnRyYWl0fGVufDB8fDB8fHww",
    },
    {
      id: 13,
      text: "The AI-powered task prioritization has helped me focus on what's truly important.",
      name: "Michael Nelson",
      role: "Entrepreneur",
      image:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzZ8fHBvcnRyYWl0fGVufDB8fDB8fHww",
    },
    {
      id: 14,
      text: "Cal AI's habit tracking feature has helped me build better routines.",
      name: "Natalie Owens",
      role: "Personal Trainer",
      image:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8ODB8fHBvcnRyYWl0fGVufDB8fDB8fHww",
    },
    {
      id: 15,
      text: "The AI suggestions for breaks have improved my work-from-home productivity.",
      name: "Oscar Parker",
      role: "Remote Worker",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8ODR8fHBvcnRyYWl0fGVufDB8fDB8fHww",
    },
    {
      id: 16,
      text: "Cal AI's integration with my smart home devices has streamlined my mornings.",
      name: "Patricia Quinn",
      role: "Tech Enthusiast",
      image:
        "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8ODh8fHBvcnRyYWl0fGVufDB8fDB8fHww",
    },
    {
      id: 17,
      text: "The AI-driven energy level tracking has helped me schedule tasks more effectively.",
      name: "Quincy Roberts",
      role: "Productivity Consultant",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OTJ8fHBvcnRyYWl0fGVufDB8fDB8fHww",
    },
    {
      id: 18,
      text: "Cal AI's goal-setting features have kept me accountable and on track.",
      name: "Rachel Stevens",
      role: "Life Coach",
      image:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OTZ8fHBvcnRyYWl0fGVufDB8fDB8fHww",
    },
    {
      id: 19,
      text: "The AI-suggested focus times have dramatically improved my deep work sessions.",
      name: "Samuel Thompson",
      role: "Writer",
      image:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTAwfHxwb3J0cmFpdHxlbnwwfHwwfHx8MA%3D%3D",
    },
    {
      id: 20,
      text: "Cal AI's team availability feature has made cross-timezone scheduling effortless.",
      name: "Tina Upton",
      role: "Global Project Coordinator",
      image:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTA0fHxwb3J0cmFpdHxlbnwwfHwwfHx8MA%3D%3D",
    },
    {
      id: 21,
      text: "The AI-powered meeting summarizer has saved me hours of note-taking.",
      name: "Ulysses Vaughn",
      role: "Executive Assistant",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTA4fHxwb3J0cmFpdHxlbnwwfHwwfHx8MA%3D%3D",
    },
    {
      id: 22,
      text: "Cal AI's personalized productivity insights have been eye-opening.",
      name: "Victoria White",
      role: "Business Analyst",
      image:
        "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTEyfHxwb3J0cmFpdHxlbnwwfHwwfHx8MA%3D%3D",
    },
    {
      id: 23,
      text: "The AI-suggested networking opportunities have expanded my professional circle.",
      name: "William Xavier",
      role: "Startup Founder",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTE2fHxwb3J0cmFpdHxlbnwwfHwwfHx8MA%3D%3D",
    },
    {
      id: 24,
      text: "Cal AI's integration with my fitness tracker has helped me maintain a healthier lifestyle.",
      name: "Xena Yates",
      role: "Wellness Coach",
      image:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTIwfHxwb3J0cmFpdHxlbnwwfHwwfHx8MA%3D%3D",
    },
    {
      id: 25,
      text: "The AI-driven project timeline suggestions have kept our team ahead of deadlines.",
      name: "Yannick Zimmerman",
      role: "Project Manager",
      image:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTI0fHxwb3J0cmFpdHxlbnwwfHwwfHx8MA%3D%3D",
    },
  ],
};

export type SiteConfig = typeof siteConfig;
