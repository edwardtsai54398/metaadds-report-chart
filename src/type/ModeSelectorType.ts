export type ModeValue = 'multi-metric@one-ad' | 'one-metric@multi-ads'

export type ModeSelectorProps = {
  onValueChange?: (val: ModeValue) => void
}