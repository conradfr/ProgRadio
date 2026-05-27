export const tooltip = {
  mounted: (el: any) => {
    // @ts-ignore bootstrap should be from global imported script
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const bsTooltip = new bootstrap.Tooltip(el)
  },
  beforeUnmount: (el: any) => {
    // @ts-ignore bootstrap should be from global imported script
    const bsTooltip = bootstrap.Tooltip.getInstance(el)
    if (bsTooltip) {
      bsTooltip.dispose()
    }
  }
}

export default tooltip
