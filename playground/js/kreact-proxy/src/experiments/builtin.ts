const optional= true
export const builtin = {
  String: {
    charAt: {
      args: [{pos: 'number'}],
      returns: 'string'
    },
    charCodeAt: {
      args: [{index: 'number'}],
      returns: 'number'
    },
    split: {
      args: [
        {separator: ['string','RegExp']},
        {limit: 'number', optional}
      ],
      returns: 'Array'
    }
  }
}