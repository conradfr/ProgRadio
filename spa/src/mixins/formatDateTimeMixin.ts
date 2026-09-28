export default {
  methods: {
    formatDateTime(dateTime: string): string {
      if (!dateTime || dateTime === '') {
        return ' '
      }

      const date = new Date(dateTime)

      const options = {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: 'numeric',
        minute: 'numeric',
      }

      // @ts-ignore
      return new Intl.DateTimeFormat(undefined, options).format(date)
    },
    formatDate(dateTime: string): string {
      if (!dateTime || dateTime === '') {
        return ' '
      }

      const date = new Date(dateTime)

      const options = {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
      }

      // @ts-ignore
      return new Intl.DateTimeFormat(undefined, options).format(date)
    },
    formatTime(dateTime: string): string {
      if (!dateTime || dateTime === '') {
        return ' '
      }

      const date = new Date(dateTime)

      // hh:mm, 24h in every locale (h23: 00-23, avoids "24:05" at midnight)
      const options = {
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
      }

      // @ts-ignore
      return new Intl.DateTimeFormat(undefined, options).format(date)
    },
  },
}
