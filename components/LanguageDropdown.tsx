import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export const LanguageDropdown = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'cs', label: 'Čeština', flag: '🇨🇿' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'sk', label: 'Slovenčina', flag: '🇸🇰' },
  ];

  const currentLang = i18n.language;
  const current = languages.find((l) => l.code === currentLang) ?? languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <span className="mr-2">{current.flag}</span>
          {current.label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {languages.map((lang) => (
          <DropdownMenuItem key={lang.code} onClick={() => i18n.changeLanguage(lang.code)}>
            <span className="mr-2">{lang.flag}</span>
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
