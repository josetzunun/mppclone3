class NoteQuota {
  constructor(cb) {
    this.cb = cb;
    this.setParams();
    this.resetPoints();
  }

  getParams() {
    return {
      m: "nq",
      allowance: this.allowance,
      max: this.max,
      maxHistLen: this.maxHistLen,
    };
  }

  setParams(params) {
    params ||= NoteQuota.PARAMS_OFFLINE;

    let allowance =
      params.allowance || this.allowance || NoteQuota.PARAMS_OFFLINE.allowance;

    let max = params.max || this.max || NoteQuota.PARAMS_OFFLINE.max;
    let maxHistLen =
      params.maxHistLen ||
      this.maxHistLen ||
      NoteQuota.PARAMS_OFFLINE.maxHistLen;

    if (
      allowance !== this.allowance ||
      max !== this.max ||
      maxHistLen !== this.maxHistLen
    ) {
      this.allowance = allowance;
      this.max = max;
      this.maxHistLen = maxHistLen;
      this.resetPoints();
      return true;
    }
    return false;
  }

  resetPoints() {
    this.points = this.max;
    this.history = [];
    for (var i = 0; i < this.maxHistLen; i++) this.history.unshift(this.points);
    if (this.cb) this.cb(this.points);
  }

  tick() {
    // keep a brief history
    this.history.unshift(this.points);
    this.history.length = this.maxHistLen;
    // hook a brother up with some more quota
    if (this.points < this.max) {
      this.points += this.allowance;
      if (this.points > this.max) this.points = this.max;
      // fire callback
      if (this.cb) this.cb(this.points);
    }
  }

  spend(needed) {
    // check whether aggressive limitation is needed
    let sum = 0;
    for (let n of this.history) {
      sum += n;
    }

    if (sum <= 0) needed *= this.allowance;

    // can they afford it?  spend
    if (this.points < needed) {
      return false;
    } else {
      this.points -= needed;
      if (this.cb) this.cb(this.points); // fire callback
      return true;
    }
  }
}

NoteQuota.PARAMS_LOBBY = { allowance: 200, max: 600 };
NoteQuota.PARAMS_NORMAL = { allowance: 400, max: 1200 };
NoteQuota.PARAMS_RIDICULOUS = { allowance: 600, max: 1800 };
NoteQuota.PARAMS_OFFLINE = { allowance: 8000, max: 24000, maxHistLen: 3 };
NoteQuota.PARAMS_UNLIMITED = {
  allowance: 1000000,
  max: 3000000,
  maxHistLen: 3,
};

export default NoteQuota;
