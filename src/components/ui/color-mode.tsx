"use client"

import * as React from "react"
import {
  IconButton,
  Skeleton,
  type IconButtonProps,
} from "@chakra-ui/react"
import { LuMoon, LuSun } from "react-icons/lu"
import { ThemeProvider, useTheme } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

export interface ColorModeProviderProps extends ThemeProviderProps {}

export function ColorModeProvider(props: ColorModeProviderProps) {
  return (
    <ThemeProvider attribute="class" disableTransitionOnChange {...props} />
  )
}

export type ColorMode = "light" | "dark"

export interface UseColorModeReturn {
  colorMode: ColorMode
  setColorMode: (colorMode: ColorMode) => void
  toggleColorMode: () => void
}

// Hook customizado com fallback seguro para SSR
export function useColorMode(): UseColorModeReturn {
  const { resolvedTheme, setTheme, forcedTheme } = useTheme()
  const colorMode = (forcedTheme || resolvedTheme) as ColorMode

  const toggleColorMode = () => {
    setTheme(colorMode === "dark" ? "light" : "dark")
  }

  return {
    colorMode,
    setColorMode: setTheme,
    toggleColorMode,
  }
}

// Hook semelhante ao chakra useColorModeValue
export function useColorModeValue<T>(light: T, dark: T): T {
  const { colorMode } = useColorMode()
  return colorMode === "dark" ? dark : light
}

// Ícone do modo atual
export function ColorModeIcon() {
  const { colorMode } = useColorMode()
  return colorMode === "dark" ? <LuMoon /> : <LuSun />
}

// ClientOnly seguro
function ClientOnly({
  children,
  fallback = null,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return <>{fallback}</>
  return <>{children}</>
}

// Botão que alterna o tema
interface ColorModeButtonProps extends Omit<IconButtonProps, "aria-label"> {}

export const ColorModeButton = React.forwardRef<
  HTMLButtonElement,
  ColorModeButtonProps
>(function ColorModeButton(props, ref) {
  const { toggleColorMode } = useColorMode()

  return (
    <ClientOnly fallback={<Skeleton boxSize="8" />}>
      <IconButton
        onClick={toggleColorMode}
        variant="ghost"
        aria-label="Alternar tema"
        size="sm"
        ref={ref}
        icon={<ColorModeIcon />}
        {...props}
      />
    </ClientOnly>
  )
})
