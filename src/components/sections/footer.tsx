import { Icons } from "@/components/icons";
import {
  InstagramLogoIcon,
  LinkedInLogoIcon,
  TwitterLogoIcon,
} from "@radix-ui/react-icons";
import { useTranslations } from 'next-intl';

interface Icon {
  icon: JSX.Element;
  url: string;
  ariaLabel: string;
}

const icons = (t: ReturnType<typeof useTranslations>) => [
  { 
    icon: <LinkedInLogoIcon />, 
    url: "#",
    ariaLabel: t('social.linkedin')
  },
  { 
    icon: <InstagramLogoIcon />, 
    url: "#",
    ariaLabel: t('social.instagram')
  },
  { 
    icon: <TwitterLogoIcon />, 
    url: "https://x.com/genmojionline",
    ariaLabel: t('social.twitter')
  },
];

type Link = {
  text: string;
  url: string;
};

export function Footer() {
  const t = useTranslations('footer');
  const common = useTranslations('common');

  const links: Link[] = [
    { text: t('links.privacy'), url: "/privacy-policy" },
    { text: t('links.terms'), url: "/terms-of-service" },
  ];

  return (
    <footer className="flex flex-col gap-y-5 rounded-lg px-7 py-5 md:px-10 container">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <Icons.logo className="h-5 w-5" />
          <h2 className="text-lg font-bold text-foreground">
            {common('name')}
          </h2>
        </div>

        <div className="flex gap-x-2">
          {icons(t).map((icon, index) => (
            <a
              key={index}
              href={icon.url}
              aria-label={icon.ariaLabel}
              className="flex h-5 w-5 items-center justify-center text-muted-foreground transition-all duration-100 ease-linear hover:text-foreground hover:underline hover:underline-offset-4"
            >
              {icon.icon}
            </a>
          ))}
        </div>
      </div>
      <div className="flex flex-col justify-between gap-y-5 md:flex-row md:items-center">
        <ul className="flex flex-col gap-x-5 gap-y-2 text-muted-foreground md:flex-row md:items-center">
          {links.map((link, index) => (
            <li
              key={index}
              className="text-[15px]/normal font-medium text-muted-foreground transition-all duration-100 ease-linear hover:text-foreground hover:underline hover:underline-offset-4"
            >
              <a href={link.url}>{link.text}</a>
            </li>
          ))}
          <li>
            <a href="https://linktr.ee/auroroa">
            ❤️
            </a>
          </li>
        </ul>
        <div className="flex items-center justify-between text-sm font-medium tracking-tight text-muted-foreground">
          <p>{t('copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
