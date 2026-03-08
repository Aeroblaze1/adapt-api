class RequestContext {
  constructor(data = {}) {
    Object.assign(this, data)
  }
}

module.exports = RequestContext