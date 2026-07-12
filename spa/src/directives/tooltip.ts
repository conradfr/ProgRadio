export const tooltip = {
  mounted: (el: any) => {
    // @ts-ignore bootstrap should be from global imported script
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-undef
    const bsTooltip = new bootstrap.Tooltip(el)
  },
  beforeUnmount: (el: any) => {
    // @ts-ignore bootstrap should be from global imported script, no-undef
    const bsTooltip = bootstrap.Tooltip.getInstance(el)
    if (bsTooltip) {
      bsTooltip.dispose()
    }
  }
}

export default tooltip
