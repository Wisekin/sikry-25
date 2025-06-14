"use client"

import { Button } from "@/src/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/src/components/ui/dropdown-menu"
import ReactCountryFlag from "react-country-flag"
import { useTranslation } from "react-i18next"

const languages = [
  { code: "en", country: "GB", label: "English" },
  { code: "fr", country: "FR", label: "Français" },
]

export function LanguageSelector() {
  const { i18n } = useTranslation()

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <ReactCountryFlag
            countryCode={languages.find((lang) => lang.code === i18n.language)?.country || "GB"}
            svg
            style={{
              width: "1.5em",
              height: "1.5em",
            }}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className="flex items-center gap-2"
          >
            <ReactCountryFlag
              countryCode={language.country}
              svg
              style={{
                width: "1.5em",
                height: "1.5em",
              }}
            />
            <span>{language.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
