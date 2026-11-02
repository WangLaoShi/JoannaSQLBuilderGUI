(() => {
  // node_modules/@marijn/find-cluster-break/src/index.js
  var rangeFrom = [];
  var rangeTo = [];
  (() => {
    let numbers = "lc,34,7n,7,7b,19,,,,2,,2,,,20,b,1c,l,g,,2t,7,2,6,2,2,,4,z,,u,r,2j,b,1m,9,9,,o,4,,9,,3,,5,17,3,1n,9,16,o,,x,1i,3,,i,,7,a,2,t,3,1k,,,7,2,2,2,3,9,,a,2,q,,2,3,1k,,,5,4,2,2,3,3,,u,2,3,,b,3,1k,,,8,,3,,3,k,2,m,6,,3,1k,,,7,2,2,2,3,7,3,a,2,u,,1n,5,3,3,,4,9,,14,5,1j,,,7,,3,,4,7,2,b,2,t,3,1k,,,7,,3,,4,7,2,b,2,f,,c,4,1j,2,,7,,3,,4,9,,a,2,t,3,1y,,4,6,,,,8,i,2,1p,,,8,c,8,2q,,,a,b,7,21,2,r,,,,,,4,2,1d,k,,2,5,b,,10,9,,2u,b,,6,n,4,4,3,g,4,d,,,3,6,,f,,jj,3,qa,4,s,3,t,2,u,2,1s,w,9,,19,3,,,39,2,y,,3a,c,4,c,63,5,1l,a,,,,,2,o,2,,1c,1a,2,c,k,5,1b,h,12,9,c,3,u,d,1k,e,1c,k,48,3,,l,4,,6,,2,3,5i,1s,ek,,5f,x,2da,3,3x,,2o,w,fe,6,2x,2,n9w,4,,a,w,2,28,2,7k,,3,,4,,n,5,4,,2b,2,1e,i,q,i,d,,12,8,p,d,18,4,1b,e,10,,1v,e,c,,8,2,1a,,1f,,,3,2,2,5,2,,,15,5,5,2,6k,8,,2,fn4,,kh,g,g,g,a6,2,gt,,6a,,45,5,1ae,3,,2,5,4,14,3,4,,4l,2,fx,4,1t,5,8t,2,25,6,1y,b,1d,4,3e,3,1h,f,15,,2,2,a,4,19,b,7,,1p,3,10,e,g,2,18,,c,3,1c,e,8,4,,2,2k,c,6,,2,,4d,c,l,4,1j,2,,7,2,2,2,3,9,,a,2,2,7,3,5,1v,9,,,2,,,4,,5,,,e,2,2a,i,n,,29,k,6j,7,2,9,r,2,2a,h,2y,d,2t,3,2,a,74,f,6t,6,,2,2,4,,,,2,3x,7,2,7,3,,s,a,14,7,,4,8,,9,b,1a,g,5i,8,5j,8,,8,2a,m,,e,3e,6,3,,,2,,7,,,1u,5,,2,,5,9n,4,9,2,,,1c,7,3,5,n,,44l,,6,f,8ug,i,1xc,5,1n,7,t4,,,1j,7,4,29,,b,2,f57,2,3mp,1a,2,n,f2,5,3,6,8,8,2,7,u,4,44,3,1iz,1j,4,1e,8,,e,,m,5,,f,11s,7,,h,2,7,,2,,5,2s,,4g,7,af,,1p,4,e4,4,72,2,6r,,2,,7,2,5,,d6,7,31,7,240,5".split(",").map((s) => s ? parseInt(s, 36) : 1);
    for (let i2 = 0, n = 0; i2 < numbers.length; i2++)
      (i2 % 2 ? rangeTo : rangeFrom).push(n = n + numbers[i2]);
  })();
  function isExtendingChar(code2) {
    if (code2 < 768) return false;
    for (let from = 0, to = rangeFrom.length; ; ) {
      let mid = from + to >> 1;
      if (code2 < rangeFrom[mid]) to = mid;
      else if (code2 >= rangeTo[mid]) from = mid + 1;
      else return true;
      if (from == to) return false;
    }
  }
  function isRegionalIndicator(code2) {
    return code2 >= 127462 && code2 <= 127487;
  }
  var ZWJ = 8205;
  function findClusterBreak(str, pos, forward = true, includeExtending = true) {
    return (forward ? nextClusterBreak : prevClusterBreak)(str, pos, includeExtending);
  }
  function nextClusterBreak(str, pos, includeExtending) {
    if (pos == str.length) return pos;
    if (pos && surrogateLow(str.charCodeAt(pos)) && surrogateHigh(str.charCodeAt(pos - 1))) pos--;
    let prev = codePointAt(str, pos);
    pos += codePointSize(prev);
    while (pos < str.length) {
      let next = codePointAt(str, pos);
      if (prev == ZWJ || next == ZWJ || includeExtending && isExtendingChar(next)) {
        pos += codePointSize(next);
        prev = next;
      } else if (isRegionalIndicator(next)) {
        let countBefore = 0, i2 = pos - 2;
        while (i2 >= 0 && isRegionalIndicator(codePointAt(str, i2))) {
          countBefore++;
          i2 -= 2;
        }
        if (countBefore % 2 == 0) break;
        else pos += 2;
      } else {
        break;
      }
    }
    return pos;
  }
  function prevClusterBreak(str, pos, includeExtending) {
    while (pos > 1) {
      let found = nextClusterBreak(str, pos - 2, includeExtending);
      if (found < pos) return found;
      pos--;
    }
    return 0;
  }
  function codePointAt(str, pos) {
    let code0 = str.charCodeAt(pos);
    if (!surrogateHigh(code0) || pos + 1 == str.length) return code0;
    let code1 = str.charCodeAt(pos + 1);
    if (!surrogateLow(code1)) return code0;
    return (code0 - 55296 << 10) + (code1 - 56320) + 65536;
  }
  function surrogateLow(ch) {
    return ch >= 56320 && ch < 57344;
  }
  function surrogateHigh(ch) {
    return ch >= 55296 && ch < 56320;
  }
  function codePointSize(code2) {
    return code2 < 65536 ? 1 : 2;
  }

  // node_modules/@codemirror/state/dist/index.js
  var Text = class _Text {
    /**
    Get the line description around the given position.
    */
    lineAt(pos) {
      if (pos < 0 || pos > this.length)
        throw new RangeError(`Invalid position ${pos} in document of length ${this.length}`);
      return this.lineInner(pos, false, 1, 0);
    }
    /**
    Get the description for the given (1-based) line number.
    */
    line(n) {
      if (n < 1 || n > this.lines)
        throw new RangeError(`Invalid line number ${n} in ${this.lines}-line document`);
      return this.lineInner(n, true, 1, 0);
    }
    /**
    Replace a range of the text with the given content.
    */
    replace(from, to, text) {
      [from, to] = clip(this, from, to);
      let parts = [];
      this.decompose(
        0,
        from,
        parts,
        2
        /* Open.To */
      );
      if (text.length)
        text.decompose(
          0,
          text.length,
          parts,
          1 | 2
          /* Open.To */
        );
      this.decompose(
        to,
        this.length,
        parts,
        1
        /* Open.From */
      );
      return TextNode.from(parts, this.length - (to - from) + text.length);
    }
    /**
    Append another document to this one.
    */
    append(other) {
      return this.replace(this.length, this.length, other);
    }
    /**
    Retrieve the text between the given points.
    */
    slice(from, to = this.length) {
      [from, to] = clip(this, from, to);
      let parts = [];
      this.decompose(from, to, parts, 0);
      return TextNode.from(parts, to - from);
    }
    /**
    Test whether this text is equal to another instance.
    */
    eq(other) {
      if (other == this)
        return true;
      if (other.length != this.length || other.lines != this.lines)
        return false;
      let start = this.scanIdentical(other, 1), end = this.length - this.scanIdentical(other, -1);
      let a = new RawTextCursor(this), b = new RawTextCursor(other);
      for (let skip = start, pos = start; ; ) {
        a.next(skip);
        b.next(skip);
        skip = 0;
        if (a.lineBreak != b.lineBreak || a.done != b.done || a.value != b.value)
          return false;
        pos += a.value.length;
        if (a.done || pos >= end)
          return true;
      }
    }
    /**
    Iterate over the text. When `dir` is `-1`, iteration happens
    from end to start. This will return lines and the breaks between
    them as separate strings.
    */
    iter(dir = 1) {
      return new RawTextCursor(this, dir);
    }
    /**
    Iterate over a range of the text. When `from` > `to`, the
    iterator will run in reverse.
    */
    iterRange(from, to = this.length) {
      return new PartialTextCursor(this, from, to);
    }
    /**
    Return a cursor that iterates over the given range of lines,
    _without_ returning the line breaks between, and yielding empty
    strings for empty lines.
    
    When `from` and `to` are given, they should be 1-based line numbers.
    */
    iterLines(from, to) {
      let inner;
      if (from == null) {
        inner = this.iter();
      } else {
        if (to == null)
          to = this.lines + 1;
        let start = this.line(from).from;
        inner = this.iterRange(start, Math.max(start, to == this.lines + 1 ? this.length : to <= 1 ? 0 : this.line(to - 1).to));
      }
      return new LineCursor(inner);
    }
    /**
    Return the document as a string, using newline characters to
    separate lines.
    */
    toString() {
      return this.sliceString(0);
    }
    /**
    Convert the document to an array of lines (which can be
    deserialized again via [`Text.of`](https://codemirror.net/6/docs/ref/#state.Text^of)).
    */
    toJSON() {
      let lines = [];
      this.flatten(lines);
      return lines;
    }
    /**
    @internal
    */
    constructor() {
    }
    /**
    Create a `Text` instance for the given array of lines.
    */
    static of(text) {
      if (text.length == 0)
        throw new RangeError("A document must have at least one line");
      if (text.length == 1 && !text[0])
        return _Text.empty;
      return text.length <= 32 ? new TextLeaf(text) : TextNode.from(TextLeaf.split(text, []));
    }
  };
  var TextLeaf = class _TextLeaf extends Text {
    constructor(text, length = textLength(text)) {
      super();
      this.text = text;
      this.length = length;
    }
    get lines() {
      return this.text.length;
    }
    get children() {
      return null;
    }
    lineInner(target, isLine, line, offset) {
      for (let i2 = 0; ; i2++) {
        let string2 = this.text[i2], end = offset + string2.length;
        if ((isLine ? line : end) >= target)
          return new Line(offset, end, line, string2);
        offset = end + 1;
        line++;
      }
    }
    decompose(from, to, target, open) {
      let text = from <= 0 && to >= this.length ? this : new _TextLeaf(sliceText(this.text, from, to), Math.min(to, this.length) - Math.max(0, from));
      if (open & 1) {
        let prev = target.pop();
        let joined = appendText(text.text, prev.text.slice(), 0, text.length);
        if (joined.length <= 32) {
          target.push(new _TextLeaf(joined, prev.length + text.length));
        } else {
          let mid = joined.length >> 1;
          target.push(new _TextLeaf(joined.slice(0, mid)), new _TextLeaf(joined.slice(mid)));
        }
      } else {
        target.push(text);
      }
    }
    replace(from, to, text) {
      if (!(text instanceof _TextLeaf))
        return super.replace(from, to, text);
      [from, to] = clip(this, from, to);
      let lines = appendText(this.text, appendText(text.text, sliceText(this.text, 0, from)), to);
      let newLen = this.length + text.length - (to - from);
      if (lines.length <= 32)
        return new _TextLeaf(lines, newLen);
      return TextNode.from(_TextLeaf.split(lines, []), newLen);
    }
    sliceString(from, to = this.length, lineSep = "\n") {
      [from, to] = clip(this, from, to);
      let result = "";
      for (let pos = 0, i2 = 0; pos <= to && i2 < this.text.length; i2++) {
        let line = this.text[i2], end = pos + line.length;
        if (pos > from && i2)
          result += lineSep;
        if (from < end && to > pos)
          result += line.slice(Math.max(0, from - pos), to - pos);
        pos = end + 1;
      }
      return result;
    }
    flatten(target) {
      for (let line of this.text)
        target.push(line);
    }
    scanIdentical() {
      return 0;
    }
    static split(text, target) {
      let part = [], len = -1;
      for (let line of text) {
        part.push(line);
        len += line.length + 1;
        if (part.length == 32) {
          target.push(new _TextLeaf(part, len));
          part = [];
          len = -1;
        }
      }
      if (len > -1)
        target.push(new _TextLeaf(part, len));
      return target;
    }
  };
  var TextNode = class _TextNode extends Text {
    constructor(children, length) {
      super();
      this.children = children;
      this.length = length;
      this.lines = 0;
      for (let child of children)
        this.lines += child.lines;
    }
    lineInner(target, isLine, line, offset) {
      for (let i2 = 0; ; i2++) {
        let child = this.children[i2], end = offset + child.length, endLine = line + child.lines - 1;
        if ((isLine ? endLine : end) >= target)
          return child.lineInner(target, isLine, line, offset);
        offset = end + 1;
        line = endLine + 1;
      }
    }
    decompose(from, to, target, open) {
      for (let i2 = 0, pos = 0; pos <= to && i2 < this.children.length; i2++) {
        let child = this.children[i2], end = pos + child.length;
        if (from <= end && to >= pos) {
          let childOpen = open & ((pos <= from ? 1 : 0) | (end >= to ? 2 : 0));
          if (pos >= from && end <= to && !childOpen)
            target.push(child);
          else
            child.decompose(from - pos, to - pos, target, childOpen);
        }
        pos = end + 1;
      }
    }
    replace(from, to, text) {
      [from, to] = clip(this, from, to);
      if (text.lines < this.lines)
        for (let i2 = 0, pos = 0; i2 < this.children.length; i2++) {
          let child = this.children[i2], end = pos + child.length;
          if (from >= pos && to <= end) {
            let updated = child.replace(from - pos, to - pos, text);
            let totalLines = this.lines - child.lines + updated.lines;
            if (updated.lines < totalLines >> 5 - 1 && updated.lines > totalLines >> 5 + 1) {
              let copy = this.children.slice();
              copy[i2] = updated;
              return new _TextNode(copy, this.length - (to - from) + text.length);
            }
            return super.replace(pos, end, updated);
          }
          pos = end + 1;
        }
      return super.replace(from, to, text);
    }
    sliceString(from, to = this.length, lineSep = "\n") {
      [from, to] = clip(this, from, to);
      let result = "";
      for (let i2 = 0, pos = 0; i2 < this.children.length && pos <= to; i2++) {
        let child = this.children[i2], end = pos + child.length;
        if (pos > from && i2)
          result += lineSep;
        if (from < end && to > pos)
          result += child.sliceString(from - pos, to - pos, lineSep);
        pos = end + 1;
      }
      return result;
    }
    flatten(target) {
      for (let child of this.children)
        child.flatten(target);
    }
    scanIdentical(other, dir) {
      if (!(other instanceof _TextNode))
        return 0;
      let length = 0;
      let [iA, iB, eA, eB] = dir > 0 ? [0, 0, this.children.length, other.children.length] : [this.children.length - 1, other.children.length - 1, -1, -1];
      for (; ; iA += dir, iB += dir) {
        if (iA == eA || iB == eB)
          return length;
        let chA = this.children[iA], chB = other.children[iB];
        if (chA != chB)
          return length + chA.scanIdentical(chB, dir);
        length += chA.length + 1;
      }
    }
    static from(children, length = children.reduce((l, ch) => l + ch.length + 1, -1)) {
      let lines = 0;
      for (let ch of children)
        lines += ch.lines;
      if (lines < 32) {
        let flat = [];
        for (let ch of children)
          ch.flatten(flat);
        return new TextLeaf(flat, length);
      }
      let chunk = Math.max(
        32,
        lines >> 5
        /* Tree.BranchShift */
      ), maxChunk = chunk << 1, minChunk = chunk >> 1;
      let chunked = [], currentLines = 0, currentLen = -1, currentChunk = [];
      function add(child) {
        let last2;
        if (child.lines > maxChunk && child instanceof _TextNode) {
          for (let node of child.children)
            add(node);
        } else if (child.lines > minChunk && (currentLines > minChunk || !currentLines)) {
          flush();
          chunked.push(child);
        } else if (child instanceof TextLeaf && currentLines && (last2 = currentChunk[currentChunk.length - 1]) instanceof TextLeaf && child.lines + last2.lines <= 32) {
          currentLines += child.lines;
          currentLen += child.length + 1;
          currentChunk[currentChunk.length - 1] = new TextLeaf(last2.text.concat(child.text), last2.length + 1 + child.length);
        } else {
          if (currentLines + child.lines > chunk)
            flush();
          currentLines += child.lines;
          currentLen += child.length + 1;
          currentChunk.push(child);
        }
      }
      function flush() {
        if (currentLines == 0)
          return;
        chunked.push(currentChunk.length == 1 ? currentChunk[0] : _TextNode.from(currentChunk, currentLen));
        currentLen = -1;
        currentLines = currentChunk.length = 0;
      }
      for (let child of children)
        add(child);
      flush();
      return chunked.length == 1 ? chunked[0] : new _TextNode(chunked, length);
    }
  };
  Text.empty = /* @__PURE__ */ new TextLeaf([""], 0);
  function textLength(text) {
    let length = -1;
    for (let line of text)
      length += line.length + 1;
    return length;
  }
  function appendText(text, target, from = 0, to = 1e9) {
    for (let pos = 0, i2 = 0, first = true; i2 < text.length && pos <= to; i2++) {
      let line = text[i2], end = pos + line.length;
      if (end >= from) {
        if (end > to)
          line = line.slice(0, to - pos);
        if (pos < from)
          line = line.slice(from - pos);
        if (first) {
          target[target.length - 1] += line;
          first = false;
        } else
          target.push(line);
      }
      pos = end + 1;
    }
    return target;
  }
  function sliceText(text, from, to) {
    return appendText(text, [""], from, to);
  }
  var RawTextCursor = class {
    constructor(text, dir = 1) {
      this.dir = dir;
      this.done = false;
      this.lineBreak = false;
      this.value = "";
      this.nodes = [text];
      this.offsets = [dir > 0 ? 1 : (text instanceof TextLeaf ? text.text.length : text.children.length) << 1];
    }
    nextInner(skip, dir) {
      this.done = this.lineBreak = false;
      for (; ; ) {
        let last2 = this.nodes.length - 1;
        let top2 = this.nodes[last2], offsetValue = this.offsets[last2], offset = offsetValue >> 1;
        let size = top2 instanceof TextLeaf ? top2.text.length : top2.children.length;
        if (offset == (dir > 0 ? size : 0)) {
          if (last2 == 0) {
            this.done = true;
            this.value = "";
            return this;
          }
          if (dir > 0)
            this.offsets[last2 - 1]++;
          this.nodes.pop();
          this.offsets.pop();
        } else if ((offsetValue & 1) == (dir > 0 ? 0 : 1)) {
          this.offsets[last2] += dir;
          if (skip == 0) {
            this.lineBreak = true;
            this.value = "\n";
            return this;
          }
          skip--;
        } else if (top2 instanceof TextLeaf) {
          let next = top2.text[offset + (dir < 0 ? -1 : 0)];
          this.offsets[last2] += dir;
          if (next.length > Math.max(0, skip)) {
            this.value = skip == 0 ? next : dir > 0 ? next.slice(skip) : next.slice(0, next.length - skip);
            return this;
          }
          skip -= next.length;
        } else {
          let next = top2.children[offset + (dir < 0 ? -1 : 0)];
          if (skip > next.length) {
            skip -= next.length;
            this.offsets[last2] += dir;
          } else {
            if (dir < 0)
              this.offsets[last2]--;
            this.nodes.push(next);
            this.offsets.push(dir > 0 ? 1 : (next instanceof TextLeaf ? next.text.length : next.children.length) << 1);
          }
        }
      }
    }
    next(skip = 0) {
      if (skip < 0) {
        this.nextInner(-skip, -this.dir);
        skip = this.value.length;
      }
      return this.nextInner(skip, this.dir);
    }
  };
  var PartialTextCursor = class {
    constructor(text, start, end) {
      this.value = "";
      this.done = false;
      this.cursor = new RawTextCursor(text, start > end ? -1 : 1);
      this.pos = start > end ? text.length : 0;
      this.from = Math.min(start, end);
      this.to = Math.max(start, end);
    }
    nextInner(skip, dir) {
      if (dir < 0 ? this.pos <= this.from : this.pos >= this.to) {
        this.value = "";
        this.done = true;
        return this;
      }
      skip += Math.max(0, dir < 0 ? this.pos - this.to : this.from - this.pos);
      let limit = dir < 0 ? this.pos - this.from : this.to - this.pos;
      if (skip > limit)
        skip = limit;
      limit -= skip;
      let { value } = this.cursor.next(skip);
      this.pos += (value.length + skip) * dir;
      this.value = value.length <= limit ? value : dir < 0 ? value.slice(value.length - limit) : value.slice(0, limit);
      this.done = !this.value;
      return this;
    }
    next(skip = 0) {
      if (skip < 0)
        skip = Math.max(skip, this.from - this.pos);
      else if (skip > 0)
        skip = Math.min(skip, this.to - this.pos);
      return this.nextInner(skip, this.cursor.dir);
    }
    get lineBreak() {
      return this.cursor.lineBreak && this.value != "";
    }
  };
  var LineCursor = class {
    constructor(inner) {
      this.inner = inner;
      this.afterBreak = true;
      this.value = "";
      this.done = false;
    }
    next(skip = 0) {
      let { done, lineBreak, value } = this.inner.next(skip);
      if (done && this.afterBreak) {
        this.value = "";
        this.afterBreak = false;
      } else if (done) {
        this.done = true;
        this.value = "";
      } else if (lineBreak) {
        if (this.afterBreak) {
          this.value = "";
        } else {
          this.afterBreak = true;
          this.next();
        }
      } else {
        this.value = value;
        this.afterBreak = false;
      }
      return this;
    }
    get lineBreak() {
      return false;
    }
  };
  if (typeof Symbol != "undefined") {
    Text.prototype[Symbol.iterator] = function() {
      return this.iter();
    };
    RawTextCursor.prototype[Symbol.iterator] = PartialTextCursor.prototype[Symbol.iterator] = LineCursor.prototype[Symbol.iterator] = function() {
      return this;
    };
  }
  var Line = class {
    /**
    @internal
    */
    constructor(from, to, number2, text) {
      this.from = from;
      this.to = to;
      this.number = number2;
      this.text = text;
    }
    /**
    The length of the line (not including any line break after it).
    */
    get length() {
      return this.to - this.from;
    }
  };
  function clip(text, from, to) {
    from = Math.max(0, Math.min(text.length, from));
    return [from, Math.max(from, Math.min(text.length, to))];
  }
  function findClusterBreak2(str, pos, forward = true, includeExtending = true) {
    return findClusterBreak(str, pos, forward, includeExtending);
  }
  function surrogateLow2(ch) {
    return ch >= 56320 && ch < 57344;
  }
  function surrogateHigh2(ch) {
    return ch >= 55296 && ch < 56320;
  }
  function codePointAt2(str, pos) {
    let code0 = str.charCodeAt(pos);
    if (!surrogateHigh2(code0) || pos + 1 == str.length)
      return code0;
    let code1 = str.charCodeAt(pos + 1);
    if (!surrogateLow2(code1))
      return code0;
    return (code0 - 55296 << 10) + (code1 - 56320) + 65536;
  }
  function fromCodePoint(code2) {
    if (code2 <= 65535)
      return String.fromCharCode(code2);
    code2 -= 65536;
    return String.fromCharCode((code2 >> 10) + 55296, (code2 & 1023) + 56320);
  }
  function codePointSize2(code2) {
    return code2 < 65536 ? 1 : 2;
  }
  var DefaultSplit = /\r\n?|\n/;
  var MapMode = /* @__PURE__ */ (function(MapMode2) {
    MapMode2[MapMode2["Simple"] = 0] = "Simple";
    MapMode2[MapMode2["TrackDel"] = 1] = "TrackDel";
    MapMode2[MapMode2["TrackBefore"] = 2] = "TrackBefore";
    MapMode2[MapMode2["TrackAfter"] = 3] = "TrackAfter";
    return MapMode2;
  })(MapMode || (MapMode = {}));
  var ChangeDesc = class _ChangeDesc {
    // Sections are encoded as pairs of integers. The first is the
    // length in the current document, and the second is -1 for
    // unaffected sections, and the length of the replacement content
    // otherwise. So an insertion would be (0, n>0), a deletion (n>0,
    // 0), and a replacement two positive numbers.
    /**
    @internal
    */
    constructor(sections) {
      this.sections = sections;
    }
    /**
    The length of the document before the change.
    */
    get length() {
      let result = 0;
      for (let i2 = 0; i2 < this.sections.length; i2 += 2)
        result += this.sections[i2];
      return result;
    }
    /**
    The length of the document after the change.
    */
    get newLength() {
      let result = 0;
      for (let i2 = 0; i2 < this.sections.length; i2 += 2) {
        let ins = this.sections[i2 + 1];
        result += ins < 0 ? this.sections[i2] : ins;
      }
      return result;
    }
    /**
    False when there are actual changes in this set.
    */
    get empty() {
      return this.sections.length == 0 || this.sections.length == 2 && this.sections[1] < 0;
    }
    /**
    Iterate over the unchanged parts left by these changes. `posA`
    provides the position of the range in the old document, `posB`
    the new position in the changed document.
    */
    iterGaps(f) {
      for (let i2 = 0, posA = 0, posB = 0; i2 < this.sections.length; ) {
        let len = this.sections[i2++], ins = this.sections[i2++];
        if (ins < 0) {
          f(posA, posB, len);
          posB += len;
        } else {
          posB += ins;
        }
        posA += len;
      }
    }
    /**
    Iterate over the ranges changed by these changes. (See
    [`ChangeSet.iterChanges`](https://codemirror.net/6/docs/ref/#state.ChangeSet.iterChanges) for a
    variant that also provides you with the inserted text.)
    `fromA`/`toA` provides the extent of the change in the starting
    document, `fromB`/`toB` the extent of the replacement in the
    changed document.
    
    When `individual` is true, adjacent changes (which are kept
    separate for [position mapping](https://codemirror.net/6/docs/ref/#state.ChangeDesc.mapPos)) are
    reported separately.
    */
    iterChangedRanges(f, individual = false) {
      iterChanges(this, f, individual);
    }
    /**
    Get a description of the inverted form of these changes.
    */
    get invertedDesc() {
      let sections = [];
      for (let i2 = 0; i2 < this.sections.length; ) {
        let len = this.sections[i2++], ins = this.sections[i2++];
        if (ins < 0)
          sections.push(len, ins);
        else
          sections.push(ins, len);
      }
      return new _ChangeDesc(sections);
    }
    /**
    Compute the combined effect of applying another set of changes
    after this one. The length of the document after this set should
    match the length before `other`.
    */
    composeDesc(other) {
      return this.empty ? other : other.empty ? this : composeSets(this, other);
    }
    /**
    Map this description, which should start with the same document
    as `other`, over another set of changes, so that it can be
    applied after it. When `before` is true, map as if the changes
    in `this` happened before the ones in `other`.
    */
    mapDesc(other, before = false) {
      return other.empty ? this : mapSet(this, other, before);
    }
    mapPos(pos, assoc = -1, mode = MapMode.Simple) {
      let posA = 0, posB = 0;
      for (let i2 = 0; i2 < this.sections.length; ) {
        let len = this.sections[i2++], ins = this.sections[i2++], endA = posA + len;
        if (ins < 0) {
          if (endA > pos)
            return posB + (pos - posA);
          posB += len;
        } else {
          if (mode != MapMode.Simple && endA >= pos && (mode == MapMode.TrackDel && posA < pos && endA > pos || mode == MapMode.TrackBefore && posA < pos || mode == MapMode.TrackAfter && endA > pos))
            return null;
          if (endA > pos || endA == pos && assoc < 0 && !len)
            return pos == posA || assoc < 0 ? posB : posB + ins;
          posB += ins;
        }
        posA = endA;
      }
      if (pos > posA)
        throw new RangeError(`Position ${pos} is out of range for changeset of length ${posA}`);
      return posB;
    }
    /**
    Check whether these changes touch a given range. When one of the
    changes entirely covers the range, the string `"cover"` is
    returned.
    */
    touchesRange(from, to = from) {
      for (let i2 = 0, pos = 0; i2 < this.sections.length && pos <= to; ) {
        let len = this.sections[i2++], ins = this.sections[i2++], end = pos + len;
        if (ins >= 0 && pos <= to && end >= from)
          return pos < from && end > to ? "cover" : true;
        pos = end;
      }
      return false;
    }
    /**
    @internal
    */
    toString() {
      let result = "";
      for (let i2 = 0; i2 < this.sections.length; ) {
        let len = this.sections[i2++], ins = this.sections[i2++];
        result += (result ? " " : "") + len + (ins >= 0 ? ":" + ins : "");
      }
      return result;
    }
    /**
    Serialize this change desc to a JSON-representable value.
    */
    toJSON() {
      return this.sections;
    }
    /**
    Create a change desc from its JSON representation (as produced
    by [`toJSON`](https://codemirror.net/6/docs/ref/#state.ChangeDesc.toJSON).
    */
    static fromJSON(json) {
      if (!Array.isArray(json) || json.length % 2 || json.some((a) => typeof a != "number"))
        throw new RangeError("Invalid JSON representation of ChangeDesc");
      return new _ChangeDesc(json);
    }
    /**
    @internal
    */
    static create(sections) {
      return new _ChangeDesc(sections);
    }
  };
  var ChangeSet = class _ChangeSet extends ChangeDesc {
    constructor(sections, inserted) {
      super(sections);
      this.inserted = inserted;
    }
    /**
    Apply the changes to a document, returning the modified
    document.
    */
    apply(doc2) {
      if (this.length != doc2.length)
        throw new RangeError("Applying change set to a document with the wrong length");
      iterChanges(this, (fromA, toA, fromB, _toB, text) => doc2 = doc2.replace(fromB, fromB + (toA - fromA), text), false);
      return doc2;
    }
    mapDesc(other, before = false) {
      return mapSet(this, other, before, true);
    }
    /**
    Given the document as it existed _before_ the changes, return a
    change set that represents the inverse of this set, which could
    be used to go from the document created by the changes back to
    the document as it existed before the changes.
    */
    invert(doc2) {
      let sections = this.sections.slice(), inserted = [];
      for (let i2 = 0, pos = 0; i2 < sections.length; i2 += 2) {
        let len = sections[i2], ins = sections[i2 + 1];
        if (ins >= 0) {
          sections[i2] = ins;
          sections[i2 + 1] = len;
          let index = i2 >> 1;
          while (inserted.length < index)
            inserted.push(Text.empty);
          inserted.push(len ? doc2.slice(pos, pos + len) : Text.empty);
        }
        pos += len;
      }
      return new _ChangeSet(sections, inserted);
    }
    /**
    Combine two subsequent change sets into a single set. `other`
    must start in the document produced by `this`. If `this` goes
    `docA` → `docB` and `other` represents `docB` → `docC`, the
    returned value will represent the change `docA` → `docC`.
    */
    compose(other) {
      return this.empty ? other : other.empty ? this : composeSets(this, other, true);
    }
    /**
    Given another change set starting in the same document, maps this
    change set over the other, producing a new change set that can be
    applied to the document produced by applying `other`. When
    `before` is `true`, order changes as if `this` comes before
    `other`, otherwise (the default) treat `other` as coming first.
    
    Given two changes `A` and `B`, `A.compose(B.map(A))` and
    `B.compose(A.map(B, true))` will produce the same document. This
    provides a basic form of [operational
    transformation](https://en.wikipedia.org/wiki/Operational_transformation),
    and can be used for collaborative editing.
    */
    map(other, before = false) {
      return other.empty ? this : mapSet(this, other, before, true);
    }
    /**
    Iterate over the changed ranges in the document, calling `f` for
    each, with the range in the original document (`fromA`-`toA`)
    and the range that replaces it in the new document
    (`fromB`-`toB`).
    
    When `individual` is true, adjacent changes are reported
    separately.
    */
    iterChanges(f, individual = false) {
      iterChanges(this, f, individual);
    }
    /**
    Get a [change description](https://codemirror.net/6/docs/ref/#state.ChangeDesc) for this change
    set.
    */
    get desc() {
      return ChangeDesc.create(this.sections);
    }
    /**
    @internal
    */
    filter(ranges) {
      let resultSections = [], resultInserted = [], filteredSections = [];
      let iter = new SectionIter(this);
      done: for (let i2 = 0, pos = 0; ; ) {
        let next = i2 == ranges.length ? 1e9 : ranges[i2++];
        while (pos < next || pos == next && iter.len == 0) {
          if (iter.done)
            break done;
          let len = Math.min(iter.len, next - pos);
          addSection(filteredSections, len, -1);
          let ins = iter.ins == -1 ? -1 : iter.off == 0 ? iter.ins : 0;
          addSection(resultSections, len, ins);
          if (ins > 0)
            addInsert(resultInserted, resultSections, iter.text);
          iter.forward(len);
          pos += len;
        }
        let end = ranges[i2++];
        while (pos < end) {
          if (iter.done)
            break done;
          let len = Math.min(iter.len, end - pos);
          addSection(resultSections, len, -1);
          addSection(filteredSections, len, iter.ins == -1 ? -1 : iter.off == 0 ? iter.ins : 0);
          iter.forward(len);
          pos += len;
        }
      }
      return {
        changes: new _ChangeSet(resultSections, resultInserted),
        filtered: ChangeDesc.create(filteredSections)
      };
    }
    /**
    Serialize this change set to a JSON-representable value.
    */
    toJSON() {
      let parts = [];
      for (let i2 = 0; i2 < this.sections.length; i2 += 2) {
        let len = this.sections[i2], ins = this.sections[i2 + 1];
        if (ins < 0)
          parts.push(len);
        else if (ins == 0)
          parts.push([len]);
        else
          parts.push([len].concat(this.inserted[i2 >> 1].toJSON()));
      }
      return parts;
    }
    /**
    Create a change set for the given changes, for a document of the
    given length, using `lineSep` as line separator.
    */
    static of(changes, length, lineSep) {
      let sections = [], inserted = [], pos = 0;
      let total = null;
      function flush(force = false) {
        if (!force && !sections.length)
          return;
        if (pos < length)
          addSection(sections, length - pos, -1);
        let set = new _ChangeSet(sections, inserted);
        total = total ? total.compose(set.map(total)) : set;
        sections = [];
        inserted = [];
        pos = 0;
      }
      function process2(spec) {
        if (Array.isArray(spec)) {
          for (let sub of spec)
            process2(sub);
        } else if (spec instanceof _ChangeSet) {
          if (spec.length != length)
            throw new RangeError(`Mismatched change set length (got ${spec.length}, expected ${length})`);
          flush();
          total = total ? total.compose(spec.map(total)) : spec;
        } else {
          let { from, to = from, insert: insert2 } = spec;
          if (from > to || from < 0 || to > length)
            throw new RangeError(`Invalid change range ${from} to ${to} (in doc of length ${length})`);
          let insText = !insert2 ? Text.empty : typeof insert2 == "string" ? Text.of(insert2.split(lineSep || DefaultSplit)) : insert2;
          let insLen = insText.length;
          if (from == to && insLen == 0)
            return;
          if (from < pos)
            flush();
          if (from > pos)
            addSection(sections, from - pos, -1);
          addSection(sections, to - from, insLen);
          addInsert(inserted, sections, insText);
          pos = to;
        }
      }
      process2(changes);
      flush(!total);
      return total;
    }
    /**
    Create an empty changeset of the given length.
    */
    static empty(length) {
      return new _ChangeSet(length ? [length, -1] : [], []);
    }
    /**
    Create a changeset from its JSON representation (as produced by
    [`toJSON`](https://codemirror.net/6/docs/ref/#state.ChangeSet.toJSON).
    */
    static fromJSON(json) {
      if (!Array.isArray(json))
        throw new RangeError("Invalid JSON representation of ChangeSet");
      let sections = [], inserted = [];
      for (let i2 = 0; i2 < json.length; i2++) {
        let part = json[i2];
        if (typeof part == "number") {
          sections.push(part, -1);
        } else if (!Array.isArray(part) || typeof part[0] != "number" || part.some((e, i3) => i3 && typeof e != "string")) {
          throw new RangeError("Invalid JSON representation of ChangeSet");
        } else if (part.length == 1) {
          sections.push(part[0], 0);
        } else {
          while (inserted.length < i2)
            inserted.push(Text.empty);
          inserted[i2] = Text.of(part.slice(1));
          sections.push(part[0], inserted[i2].length);
        }
      }
      return new _ChangeSet(sections, inserted);
    }
    /**
    @internal
    */
    static createSet(sections, inserted) {
      return new _ChangeSet(sections, inserted);
    }
  };
  function addSection(sections, len, ins, forceJoin = false) {
    if (len == 0 && ins <= 0)
      return;
    let last2 = sections.length - 2;
    if (last2 >= 0 && ins <= 0 && ins == sections[last2 + 1])
      sections[last2] += len;
    else if (last2 >= 0 && len == 0 && sections[last2] == 0)
      sections[last2 + 1] += ins;
    else if (forceJoin) {
      sections[last2] += len;
      sections[last2 + 1] += ins;
    } else
      sections.push(len, ins);
  }
  function addInsert(values, sections, value) {
    if (value.length == 0)
      return;
    let index = sections.length - 2 >> 1;
    if (index < values.length) {
      values[values.length - 1] = values[values.length - 1].append(value);
    } else {
      while (values.length < index)
        values.push(Text.empty);
      values.push(value);
    }
  }
  function iterChanges(desc, f, individual) {
    let inserted = desc.inserted;
    for (let posA = 0, posB = 0, i2 = 0; i2 < desc.sections.length; ) {
      let len = desc.sections[i2++], ins = desc.sections[i2++];
      if (ins < 0) {
        posA += len;
        posB += len;
      } else {
        let endA = posA, endB = posB, text = Text.empty;
        for (; ; ) {
          endA += len;
          endB += ins;
          if (ins && inserted)
            text = text.append(inserted[i2 - 2 >> 1]);
          if (individual || i2 == desc.sections.length || desc.sections[i2 + 1] < 0)
            break;
          len = desc.sections[i2++];
          ins = desc.sections[i2++];
        }
        f(posA, endA, posB, endB, text);
        posA = endA;
        posB = endB;
      }
    }
  }
  function mapSet(setA, setB, before, mkSet = false) {
    let sections = [], insert2 = mkSet ? [] : null;
    let a = new SectionIter(setA), b = new SectionIter(setB);
    for (let inserted = -1; ; ) {
      if (a.done && b.len || b.done && a.len) {
        throw new Error("Mismatched change set lengths");
      } else if (a.ins == -1 && b.ins == -1) {
        let len = Math.min(a.len, b.len);
        addSection(sections, len, -1);
        a.forward(len);
        b.forward(len);
      } else if (b.ins >= 0 && (a.ins < 0 || inserted == a.i || a.off == 0 && (b.len < a.len || b.len == a.len && !before))) {
        let len = b.len;
        addSection(sections, b.ins, -1);
        while (len) {
          let piece = Math.min(a.len, len);
          if (a.ins >= 0 && inserted < a.i && a.len <= piece) {
            addSection(sections, 0, a.ins);
            if (insert2)
              addInsert(insert2, sections, a.text);
            inserted = a.i;
          }
          a.forward(piece);
          len -= piece;
        }
        b.next();
      } else if (a.ins >= 0) {
        let len = 0, left = a.len;
        while (left) {
          if (b.ins == -1) {
            let piece = Math.min(left, b.len);
            len += piece;
            left -= piece;
            b.forward(piece);
          } else if (b.ins == 0 && b.len < left) {
            left -= b.len;
            b.next();
          } else {
            break;
          }
        }
        addSection(sections, len, inserted < a.i ? a.ins : 0);
        if (insert2 && inserted < a.i)
          addInsert(insert2, sections, a.text);
        inserted = a.i;
        a.forward(a.len - left);
      } else if (a.done && b.done) {
        return insert2 ? ChangeSet.createSet(sections, insert2) : ChangeDesc.create(sections);
      } else {
        throw new Error("Mismatched change set lengths");
      }
    }
  }
  function composeSets(setA, setB, mkSet = false) {
    let sections = [];
    let insert2 = mkSet ? [] : null;
    let a = new SectionIter(setA), b = new SectionIter(setB);
    for (let open = false; ; ) {
      if (a.done && b.done) {
        return insert2 ? ChangeSet.createSet(sections, insert2) : ChangeDesc.create(sections);
      } else if (a.ins == 0) {
        addSection(sections, a.len, 0, open);
        a.next();
      } else if (b.len == 0 && !b.done) {
        addSection(sections, 0, b.ins, open);
        if (insert2)
          addInsert(insert2, sections, b.text);
        b.next();
      } else if (a.done || b.done) {
        throw new Error("Mismatched change set lengths");
      } else {
        let len = Math.min(a.len2, b.len), sectionLen = sections.length;
        if (a.ins == -1) {
          let insB = b.ins == -1 ? -1 : b.off ? 0 : b.ins;
          addSection(sections, len, insB, open);
          if (insert2 && insB)
            addInsert(insert2, sections, b.text);
        } else if (b.ins == -1) {
          addSection(sections, a.off ? 0 : a.len, len, open);
          if (insert2)
            addInsert(insert2, sections, a.textBit(len));
        } else {
          addSection(sections, a.off ? 0 : a.len, b.off ? 0 : b.ins, open);
          if (insert2 && !b.off)
            addInsert(insert2, sections, b.text);
        }
        open = (a.ins > len || b.ins >= 0 && b.len > len) && (open || sections.length > sectionLen);
        a.forward2(len);
        b.forward(len);
      }
    }
  }
  var SectionIter = class {
    constructor(set) {
      this.set = set;
      this.i = 0;
      this.next();
    }
    next() {
      let { sections } = this.set;
      if (this.i < sections.length) {
        this.len = sections[this.i++];
        this.ins = sections[this.i++];
      } else {
        this.len = 0;
        this.ins = -2;
      }
      this.off = 0;
    }
    get done() {
      return this.ins == -2;
    }
    get len2() {
      return this.ins < 0 ? this.len : this.ins;
    }
    get text() {
      let { inserted } = this.set, index = this.i - 2 >> 1;
      return index >= inserted.length ? Text.empty : inserted[index];
    }
    textBit(len) {
      let { inserted } = this.set, index = this.i - 2 >> 1;
      return index >= inserted.length && !len ? Text.empty : inserted[index].slice(this.off, len == null ? void 0 : this.off + len);
    }
    forward(len) {
      if (len == this.len)
        this.next();
      else {
        this.len -= len;
        this.off += len;
      }
    }
    forward2(len) {
      if (this.ins == -1)
        this.forward(len);
      else if (len == this.ins)
        this.next();
      else {
        this.ins -= len;
        this.off += len;
      }
    }
  };
  var SelectionRange = class _SelectionRange {
    constructor(from, to, flags, goalColumn) {
      this.from = from;
      this.to = to;
      this.flags = flags;
      this.goalColumn = goalColumn;
    }
    /**
    The anchor of the range—the side that doesn't move when you
    extend it.
    */
    get anchor() {
      return this.flags & 32 ? this.to : this.from;
    }
    /**
    The head of the range, which is moved when the range is
    [extended](https://codemirror.net/6/docs/ref/#state.SelectionRange.extend).
    */
    get head() {
      return this.flags & 32 ? this.from : this.to;
    }
    /**
    True when `anchor` and `head` are at the same position.
    */
    get empty() {
      return this.from == this.to;
    }
    /**
    If this is a cursor that is explicitly associated with the
    character on one of its sides, this returns the side. -1 means
    the character before its position, 1 the character after, and 0
    means no association.
    */
    get assoc() {
      return this.flags & 8 ? -1 : this.flags & 16 ? 1 : 0;
    }
    /**
    A flag that, when set, makes some selection-extending commands
    treat the range's head and anchor as exchangeable, so that for
    example Shift-ArrowUp will make the lower side of the selection
    the anchor, even if that was the head before. Used to implement
    MacOS-style undirectional selections.
    */
    get undirectional() {
      return (this.flags & 64) > 0;
    }
    /**
    The bidirectional text level associated with this cursor, if
    any.
    */
    get bidiLevel() {
      let level = this.flags & 7;
      return level == 7 ? null : level;
    }
    /**
    Map this range through a change, producing a valid range in the
    updated document.
    */
    map(change, assoc = -1) {
      let from, to;
      if (this.empty) {
        from = to = change.mapPos(this.from, assoc);
      } else {
        from = change.mapPos(this.from, 1);
        to = change.mapPos(this.to, -1);
      }
      return from == this.from && to == this.to ? this : new _SelectionRange(from, to, this.flags, this.goalColumn);
    }
    /**
    Extend this range to cover at least `from` to `to`.
    */
    extend(from, to = from, assoc = 0) {
      if (from <= this.anchor && to >= this.anchor)
        return EditorSelection.range(from, to, void 0, void 0, assoc);
      let head = Math.abs(from - this.anchor) > Math.abs(to - this.anchor) ? from : to;
      return EditorSelection.range(this.anchor, head, void 0, void 0, assoc);
    }
    /**
    Compare this range to another range.
    */
    eq(other, includeAssoc = false) {
      return this.anchor == other.anchor && this.head == other.head && this.goalColumn == other.goalColumn && (!includeAssoc || !this.empty || this.assoc == other.assoc);
    }
    /**
    Return a JSON-serializable object representing the range.
    */
    toJSON() {
      return { anchor: this.anchor, head: this.head };
    }
    /**
    Convert a JSON representation of a range to a `SelectionRange`
    instance.
    */
    static fromJSON(json) {
      if (!json || typeof json.anchor != "number" || typeof json.head != "number")
        throw new RangeError("Invalid JSON representation for SelectionRange");
      return EditorSelection.range(json.anchor, json.head);
    }
    /**
    @internal
    */
    static create(from, to, flags, goalColumn) {
      return new _SelectionRange(from, to, flags, goalColumn);
    }
  };
  var EditorSelection = class _EditorSelection {
    constructor(ranges, mainIndex) {
      this.ranges = ranges;
      this.mainIndex = mainIndex;
    }
    /**
    Map a selection through a change. Used to adjust the selection
    position for changes.
    */
    map(change, assoc = -1) {
      if (change.empty)
        return this;
      return _EditorSelection.create(this.ranges.map((r) => r.map(change, assoc)), this.mainIndex);
    }
    /**
    Compare this selection to another selection. By default, ranges
    are compared only by position. When `includeAssoc` is true,
    cursor ranges must also have the same
    [`assoc`](https://codemirror.net/6/docs/ref/#state.SelectionRange.assoc) value.
    */
    eq(other, includeAssoc = false) {
      if (this.ranges.length != other.ranges.length || this.mainIndex != other.mainIndex)
        return false;
      for (let i2 = 0; i2 < this.ranges.length; i2++)
        if (!this.ranges[i2].eq(other.ranges[i2], includeAssoc))
          return false;
      return true;
    }
    /**
    Get the primary selection range. Usually, you should make sure
    your code applies to _all_ ranges, by using methods like
    [`changeByRange`](https://codemirror.net/6/docs/ref/#state.EditorState.changeByRange).
    */
    get main() {
      return this.ranges[this.mainIndex];
    }
    /**
    Make sure the selection only has one range. Returns a selection
    holding only the main range from this selection.
    */
    asSingle() {
      return this.ranges.length == 1 ? this : new _EditorSelection([this.main], 0);
    }
    /**
    Extend this selection with an extra range.
    */
    addRange(range, main = true) {
      return _EditorSelection.create([range].concat(this.ranges), main ? 0 : this.mainIndex + 1);
    }
    /**
    Replace a given range with another range, and then normalize the
    selection to merge and sort ranges if necessary.
    */
    replaceRange(range, which = this.mainIndex) {
      let ranges = this.ranges.slice();
      ranges[which] = range;
      return _EditorSelection.create(ranges, this.mainIndex);
    }
    /**
    Convert this selection to an object that can be serialized to
    JSON.
    */
    toJSON() {
      return { ranges: this.ranges.map((r) => r.toJSON()), main: this.mainIndex };
    }
    /**
    Create a selection from a JSON representation.
    */
    static fromJSON(json) {
      if (!json || !Array.isArray(json.ranges) || typeof json.main != "number" || json.main >= json.ranges.length)
        throw new RangeError("Invalid JSON representation for EditorSelection");
      return new _EditorSelection(json.ranges.map((r) => SelectionRange.fromJSON(r)), json.main);
    }
    /**
    Create a selection holding a single range.
    */
    static single(anchor, head = anchor) {
      return new _EditorSelection([_EditorSelection.range(anchor, head)], 0);
    }
    /**
    Sort and merge the given set of ranges, creating a valid
    selection.
    */
    static create(ranges, mainIndex = 0) {
      if (ranges.length == 0)
        throw new RangeError("A selection needs at least one range");
      for (let pos = 0, i2 = 0; i2 < ranges.length; i2++) {
        let range = ranges[i2];
        if (range.empty ? range.from <= pos : range.from < pos)
          return _EditorSelection.normalized(ranges.slice(), mainIndex);
        pos = range.to;
      }
      return new _EditorSelection(ranges, mainIndex);
    }
    /**
    Create a cursor selection range at the given position. You can
    safely ignore the optional arguments in most situations.
    */
    static cursor(pos, assoc = 0, bidiLevel, goalColumn) {
      return SelectionRange.create(pos, pos, (assoc == 0 ? 0 : assoc < 0 ? 8 : 16) | (bidiLevel == null ? 7 : Math.min(6, bidiLevel)), goalColumn);
    }
    /**
    Create a selection range.
    */
    static range(anchor, head, goalColumn, bidiLevel, assoc) {
      let flags = bidiLevel == null ? 7 : Math.min(6, bidiLevel);
      if (!assoc && anchor != head)
        assoc = head < anchor ? 1 : -1;
      if (assoc)
        flags |= assoc < 0 ? 8 : 16;
      return head < anchor ? SelectionRange.create(head, anchor, flags | 32, goalColumn) : SelectionRange.create(anchor, head, flags, goalColumn);
    }
    /**
    Create an [undirectional](https://codemirror.net/6/docs/ref/#state.SelectionRange.undirectional)
    selection range.
    */
    static undirectionalRange(from, to) {
      return SelectionRange.create(from, to, 64, void 0);
    }
    /**
    @internal
    */
    static normalized(ranges, mainIndex = 0) {
      let main = ranges[mainIndex];
      ranges.sort((a, b) => a.from - b.from);
      mainIndex = ranges.indexOf(main);
      for (let i2 = 1; i2 < ranges.length; i2++) {
        let range = ranges[i2], prev = ranges[i2 - 1];
        if (range.empty ? range.from <= prev.to : range.from < prev.to) {
          let from = prev.from, to = Math.max(range.to, prev.to);
          if (i2 <= mainIndex)
            mainIndex--;
          ranges.splice(--i2, 2, range.anchor > range.head ? _EditorSelection.range(to, from) : _EditorSelection.range(from, to));
        }
      }
      return new _EditorSelection(ranges, mainIndex);
    }
  };
  function checkSelection(selection, docLength) {
    for (let range of selection.ranges)
      if (range.to > docLength)
        throw new RangeError("Selection points outside of document");
  }
  var nextID = 0;
  var Facet = class _Facet {
    constructor(combine, compareInput, compare2, isStatic, enables) {
      this.combine = combine;
      this.compareInput = compareInput;
      this.compare = compare2;
      this.isStatic = isStatic;
      this.id = nextID++;
      this.default = combine([]);
      this.extensions = typeof enables == "function" ? enables(this) : enables;
    }
    /**
    Returns a facet reader for this facet, which can be used to
    [read](https://codemirror.net/6/docs/ref/#state.EditorState.facet) it but not to define values for it.
    */
    get reader() {
      return this;
    }
    /**
    Define a new facet.
    */
    static define(config = {}) {
      return new _Facet(config.combine || ((a) => a), config.compareInput || ((a, b) => a === b), config.compare || (!config.combine ? sameArray : (a, b) => a === b), !!config.static, config.enables);
    }
    /**
    Returns an extension that adds the given value to this facet.
    */
    of(value) {
      return new FacetProvider([], this, 0, value);
    }
    /**
    Create an extension that computes a value for the facet from a
    state. You must take care to declare the parts of the state that
    this value depends on, since your function is only called again
    for a new state when one of those parts changed.
    
    In cases where your value depends only on a single field, you'll
    want to use the [`from`](https://codemirror.net/6/docs/ref/#state.Facet.from) method instead.
    */
    compute(deps, get) {
      if (this.isStatic)
        throw new Error("Can't compute a static facet");
      return new FacetProvider(deps, this, 1, get);
    }
    /**
    Create an extension that computes zero or more values for this
    facet from a state.
    */
    computeN(deps, get) {
      if (this.isStatic)
        throw new Error("Can't compute a static facet");
      return new FacetProvider(deps, this, 2, get);
    }
    from(field, get) {
      if (!get)
        get = (x) => x;
      return this.compute([field], (state) => get(state.field(field)));
    }
  };
  function sameArray(a, b) {
    return a == b || a.length == b.length && a.every((e, i2) => e === b[i2]);
  }
  var FacetProvider = class {
    constructor(dependencies, facet, type, value) {
      this.dependencies = dependencies;
      this.facet = facet;
      this.type = type;
      this.value = value;
      this.id = nextID++;
    }
    dynamicSlot(addresses) {
      var _a2;
      let getter = this.value;
      let compare2 = this.facet.compareInput;
      let id = this.id, idx = addresses[id] >> 1, multi = this.type == 2;
      let depDoc = false, depSel = false, depAddrs = [];
      for (let dep of this.dependencies) {
        if (dep == "doc")
          depDoc = true;
        else if (dep == "selection")
          depSel = true;
        else if ((((_a2 = addresses[dep.id]) !== null && _a2 !== void 0 ? _a2 : 1) & 1) == 0)
          depAddrs.push(addresses[dep.id]);
      }
      return {
        create(state) {
          state.values[idx] = getter(state);
          return 1;
        },
        update(state, tr) {
          if (depDoc && tr.docChanged || depSel && (tr.docChanged || tr.selection) || ensureAll(state, depAddrs)) {
            let newVal = getter(state);
            if (multi ? !compareArray(newVal, state.values[idx], compare2) : !compare2(newVal, state.values[idx])) {
              state.values[idx] = newVal;
              return 1;
            }
          }
          return 0;
        },
        reconfigure: (state, oldState) => {
          let newVal, oldAddr = oldState.config.address[id];
          if (oldAddr != null) {
            let oldVal = getAddr(oldState, oldAddr);
            if (this.dependencies.every((dep) => {
              return dep instanceof Facet ? oldState.facet(dep) === state.facet(dep) : dep instanceof StateField ? oldState.field(dep, false) == state.field(dep, false) : true;
            }) || (multi ? compareArray(newVal = getter(state), oldVal, compare2) : compare2(newVal = getter(state), oldVal))) {
              state.values[idx] = oldVal;
              return 0;
            }
          } else {
            newVal = getter(state);
          }
          state.values[idx] = newVal;
          return 1;
        }
      };
    }
    get extension() {
      return this;
    }
  };
  function compareArray(a, b, compare2) {
    if (a.length != b.length)
      return false;
    for (let i2 = 0; i2 < a.length; i2++)
      if (!compare2(a[i2], b[i2]))
        return false;
    return true;
  }
  function ensureAll(state, addrs) {
    let changed = false;
    for (let addr of addrs)
      if (ensureAddr(state, addr) & 1)
        changed = true;
    return changed;
  }
  function dynamicFacetSlot(addresses, facet, providers) {
    let providerAddrs = providers.map((p) => addresses[p.id]);
    let providerTypes = providers.map((p) => p.type);
    let dynamic = providerAddrs.filter((p) => !(p & 1));
    let idx = addresses[facet.id] >> 1;
    function get(state) {
      let values = [];
      for (let i2 = 0; i2 < providerAddrs.length; i2++) {
        let value = getAddr(state, providerAddrs[i2]);
        if (providerTypes[i2] == 2)
          for (let val of value)
            values.push(val);
        else
          values.push(value);
      }
      return facet.combine(values);
    }
    return {
      create(state) {
        for (let addr of providerAddrs)
          ensureAddr(state, addr);
        state.values[idx] = get(state);
        return 1;
      },
      update(state, tr) {
        if (!ensureAll(state, dynamic))
          return 0;
        let value = get(state);
        if (facet.compare(value, state.values[idx]))
          return 0;
        state.values[idx] = value;
        return 1;
      },
      reconfigure(state, oldState) {
        let depChanged = ensureAll(state, providerAddrs);
        let oldProviders = oldState.config.facets[facet.id], oldValue = oldState.facet(facet);
        if (oldProviders && !depChanged && sameArray(providers, oldProviders)) {
          state.values[idx] = oldValue;
          return 0;
        }
        let value = get(state);
        if (facet.compare(value, oldValue)) {
          state.values[idx] = oldValue;
          return 0;
        }
        state.values[idx] = value;
        return 1;
      }
    };
  }
  var initField = /* @__PURE__ */ Facet.define({ static: true });
  var StateField = class _StateField {
    constructor(id, createF, updateF, compareF, spec) {
      this.id = id;
      this.createF = createF;
      this.updateF = updateF;
      this.compareF = compareF;
      this.spec = spec;
      this.provides = void 0;
    }
    /**
    Define a state field.
    */
    static define(config) {
      let field = new _StateField(nextID++, config.create, config.update, config.compare || ((a, b) => a === b), config);
      if (config.provide)
        field.provides = config.provide(field);
      return field;
    }
    create(state) {
      let init = state.facet(initField).find((i2) => i2.field == this);
      return ((init === null || init === void 0 ? void 0 : init.create) || this.createF)(state);
    }
    /**
    @internal
    */
    slot(addresses) {
      let idx = addresses[this.id] >> 1;
      return {
        create: (state) => {
          state.values[idx] = this.create(state);
          return 1;
        },
        update: (state, tr) => {
          let oldVal = state.values[idx];
          let value = this.updateF(oldVal, tr);
          if (this.compareF(oldVal, value))
            return 0;
          state.values[idx] = value;
          return 1;
        },
        reconfigure: (state, oldState) => {
          let init = state.facet(initField), oldInit = oldState.facet(initField), reInit;
          if ((reInit = init.find((i2) => i2.field == this)) && reInit != oldInit.find((i2) => i2.field == this)) {
            state.values[idx] = reInit.create(state);
            return 1;
          }
          if (oldState.config.address[this.id] != null) {
            state.values[idx] = oldState.field(this);
            return 0;
          }
          state.values[idx] = this.create(state);
          return 1;
        }
      };
    }
    /**
    Returns an extension that enables this field and overrides the
    way it is initialized. Can be useful when you need to provide a
    non-default starting value for the field.
    */
    init(create) {
      return [this, initField.of({ field: this, create })];
    }
    /**
    State field instances can be used as
    [`Extension`](https://codemirror.net/6/docs/ref/#state.Extension) values to enable the field in a
    given state.
    */
    get extension() {
      return this;
    }
  };
  var Prec_ = { lowest: 4, low: 3, default: 2, high: 1, highest: 0 };
  function prec(value) {
    return (ext) => new PrecExtension(ext, value);
  }
  var Prec = {
    /**
    The highest precedence level, for extensions that should end up
    near the start of the precedence ordering.
    */
    highest: /* @__PURE__ */ prec(Prec_.highest),
    /**
    A higher-than-default precedence, for extensions that should
    come before those with default precedence.
    */
    high: /* @__PURE__ */ prec(Prec_.high),
    /**
    The default precedence, which is also used for extensions
    without an explicit precedence.
    */
    default: /* @__PURE__ */ prec(Prec_.default),
    /**
    A lower-than-default precedence.
    */
    low: /* @__PURE__ */ prec(Prec_.low),
    /**
    The lowest precedence level. Meant for things that should end up
    near the end of the extension order.
    */
    lowest: /* @__PURE__ */ prec(Prec_.lowest)
  };
  var PrecExtension = class {
    constructor(inner, prec2) {
      this.inner = inner;
      this.prec = prec2;
    }
    get extension() {
      return this;
    }
  };
  var Compartment = class _Compartment {
    /**
    Create an instance of this compartment to add to your [state
    configuration](https://codemirror.net/6/docs/ref/#state.EditorStateConfig.extensions).
    */
    of(ext) {
      return new CompartmentInstance(this, ext);
    }
    /**
    Create an [effect](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) that
    reconfigures this compartment.
    */
    reconfigure(content2) {
      return _Compartment.reconfigure.of({ compartment: this, extension: content2 });
    }
    /**
    Get the current content of the compartment in the state, or
    `undefined` if it isn't present.
    */
    get(state) {
      return state.config.compartments.get(this);
    }
  };
  var CompartmentInstance = class {
    constructor(compartment, inner) {
      this.compartment = compartment;
      this.inner = inner;
    }
    get extension() {
      return this;
    }
  };
  var Configuration = class _Configuration {
    constructor(base2, compartments, dynamicSlots, address, staticValues, facets) {
      this.base = base2;
      this.compartments = compartments;
      this.dynamicSlots = dynamicSlots;
      this.address = address;
      this.staticValues = staticValues;
      this.facets = facets;
      this.statusTemplate = [];
      while (this.statusTemplate.length < dynamicSlots.length)
        this.statusTemplate.push(
          0
          /* SlotStatus.Unresolved */
        );
    }
    staticFacet(facet) {
      let addr = this.address[facet.id];
      return addr == null ? facet.default : this.staticValues[addr >> 1];
    }
    static resolve(base2, compartments, oldState) {
      let fields = [];
      let facets = /* @__PURE__ */ Object.create(null);
      let newCompartments = /* @__PURE__ */ new Map();
      for (let ext of flatten(base2, compartments, newCompartments)) {
        if (ext instanceof StateField)
          fields.push(ext);
        else
          (facets[ext.facet.id] || (facets[ext.facet.id] = [])).push(ext);
      }
      let address = /* @__PURE__ */ Object.create(null);
      let staticValues = [];
      let dynamicSlots = [];
      for (let field of fields) {
        address[field.id] = dynamicSlots.length << 1;
        dynamicSlots.push((a) => field.slot(a));
      }
      let oldFacets = oldState === null || oldState === void 0 ? void 0 : oldState.config.facets;
      for (let id in facets) {
        let providers = facets[id], facet = providers[0].facet;
        let oldProviders = oldFacets && oldFacets[id] || [];
        if (providers.every(
          (p) => p.type == 0
          /* Provider.Static */
        )) {
          address[facet.id] = staticValues.length << 1 | 1;
          if (sameArray(oldProviders, providers)) {
            staticValues.push(oldState.facet(facet));
          } else {
            let value = facet.combine(providers.map((p) => p.value));
            staticValues.push(oldState && facet.compare(value, oldState.facet(facet)) ? oldState.facet(facet) : value);
          }
        } else {
          for (let p of providers) {
            if (p.type == 0) {
              address[p.id] = staticValues.length << 1 | 1;
              staticValues.push(p.value);
            } else {
              address[p.id] = dynamicSlots.length << 1;
              dynamicSlots.push((a) => p.dynamicSlot(a));
            }
          }
          address[facet.id] = dynamicSlots.length << 1;
          dynamicSlots.push((a) => dynamicFacetSlot(a, facet, providers));
        }
      }
      let dynamic = dynamicSlots.map((f) => f(address));
      return new _Configuration(base2, newCompartments, dynamic, address, staticValues, facets);
    }
  };
  function flatten(extension, compartments, newCompartments) {
    let result = [[], [], [], [], []];
    let seen = /* @__PURE__ */ new Map();
    function inner(ext, prec2) {
      let known = seen.get(ext);
      if (known != null) {
        if (known <= prec2)
          return;
        let found = result[known].indexOf(ext);
        if (found > -1)
          result[known].splice(found, 1);
        if (ext instanceof CompartmentInstance)
          newCompartments.delete(ext.compartment);
      }
      seen.set(ext, prec2);
      if (Array.isArray(ext)) {
        for (let e of ext)
          inner(e, prec2);
      } else if (ext instanceof CompartmentInstance) {
        if (newCompartments.has(ext.compartment))
          throw new RangeError(`Duplicate use of compartment in extensions`);
        let content2 = compartments.get(ext.compartment) || ext.inner;
        newCompartments.set(ext.compartment, content2);
        inner(content2, prec2);
      } else if (ext instanceof PrecExtension) {
        inner(ext.inner, ext.prec);
      } else if (ext instanceof StateField) {
        result[prec2].push(ext);
        if (ext.provides)
          inner(ext.provides, prec2);
      } else if (ext instanceof FacetProvider) {
        result[prec2].push(ext);
        if (ext.facet.extensions)
          inner(ext.facet.extensions, Prec_.default);
      } else {
        let content2 = ext.extension;
        if (!content2)
          throw new Error(`Unrecognized extension value in extension set (${ext}).`);
        if (content2 == ext)
          throw new Error(`Unrecognized extension value in extension set (${ext}). This sometimes happens because multiple instances of @codemirror/state are loaded, breaking instanceof checks.`);
        inner(content2, prec2);
      }
    }
    inner(extension, Prec_.default);
    return result.reduce((a, b) => a.concat(b));
  }
  function ensureAddr(state, addr) {
    if (addr & 1)
      return 2;
    let idx = addr >> 1;
    let status = state.status[idx];
    if (status == 4)
      throw new Error("Cyclic dependency between fields and/or facets");
    if (status & 2)
      return status;
    state.status[idx] = 4;
    let changed = state.computeSlot(state, state.config.dynamicSlots[idx]);
    return state.status[idx] = 2 | changed;
  }
  function getAddr(state, addr) {
    return addr & 1 ? state.config.staticValues[addr >> 1] : state.values[addr >> 1];
  }
  var languageData = /* @__PURE__ */ Facet.define();
  var allowMultipleSelections = /* @__PURE__ */ Facet.define({
    combine: (values) => values.some((v) => v),
    static: true
  });
  var lineSeparator = /* @__PURE__ */ Facet.define({
    combine: (values) => values.length ? values[0] : void 0,
    static: true
  });
  var changeFilter = /* @__PURE__ */ Facet.define();
  var transactionFilter = /* @__PURE__ */ Facet.define();
  var transactionExtender = /* @__PURE__ */ Facet.define();
  var readOnly = /* @__PURE__ */ Facet.define({
    combine: (values) => values.length ? values[0] : false
  });
  var Annotation = class {
    /**
    @internal
    */
    constructor(type, value) {
      this.type = type;
      this.value = value;
    }
    /**
    Define a new type of annotation.
    */
    static define() {
      return new AnnotationType();
    }
  };
  var AnnotationType = class {
    /**
    Create an instance of this annotation.
    */
    of(value) {
      return new Annotation(this, value);
    }
  };
  var StateEffectType = class {
    /**
    @internal
    */
    constructor(map) {
      this.map = map;
    }
    /**
    Create a [state effect](https://codemirror.net/6/docs/ref/#state.StateEffect) instance of this
    type.
    */
    of(value) {
      return new StateEffect(this, value);
    }
  };
  var StateEffect = class _StateEffect {
    /**
    @internal
    */
    constructor(type, value) {
      this.type = type;
      this.value = value;
    }
    /**
    Map this effect through a position mapping. Will return
    `undefined` when that ends up deleting the effect.
    */
    map(mapping) {
      let mapped = this.type.map(this.value, mapping);
      return mapped === void 0 ? void 0 : mapped == this.value ? this : new _StateEffect(this.type, mapped);
    }
    /**
    Tells you whether this effect object is of a given
    [type](https://codemirror.net/6/docs/ref/#state.StateEffectType).
    */
    is(type) {
      return this.type == type;
    }
    /**
    Define a new effect type. The type parameter indicates the type
    of values that his effect holds. It should be a type that
    doesn't include `undefined`, since that is used in
    [mapping](https://codemirror.net/6/docs/ref/#state.StateEffect.map) to indicate that an effect is
    removed.
    */
    static define(spec = {}) {
      return new StateEffectType(spec.map || ((v) => v));
    }
    /**
    Map an array of effects through a change set.
    */
    static mapEffects(effects, mapping) {
      if (!effects.length)
        return effects;
      let result = [];
      for (let effect of effects) {
        let mapped = effect.map(mapping);
        if (mapped)
          result.push(mapped);
      }
      return result;
    }
  };
  StateEffect.reconfigure = /* @__PURE__ */ StateEffect.define();
  StateEffect.appendConfig = /* @__PURE__ */ StateEffect.define();
  var Transaction = class _Transaction {
    constructor(startState, changes, selection, effects, annotations, scrollIntoView3) {
      this.startState = startState;
      this.changes = changes;
      this.selection = selection;
      this.effects = effects;
      this.annotations = annotations;
      this.scrollIntoView = scrollIntoView3;
      this._doc = null;
      this._state = null;
      if (selection)
        checkSelection(selection, changes.newLength);
      if (!annotations.some((a) => a.type == _Transaction.time))
        this.annotations = annotations.concat(_Transaction.time.of(Date.now()));
    }
    /**
    @internal
    */
    static create(startState, changes, selection, effects, annotations, scrollIntoView3) {
      return new _Transaction(startState, changes, selection, effects, annotations, scrollIntoView3);
    }
    /**
    The new document produced by the transaction. Contrary to
    [`.state`](https://codemirror.net/6/docs/ref/#state.Transaction.state)`.doc`, accessing this won't
    force the entire new state to be computed right away, so it is
    recommended that [transaction
    filters](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter) use this getter
    when they need to look at the new document.
    */
    get newDoc() {
      return this._doc || (this._doc = this.changes.apply(this.startState.doc));
    }
    /**
    The new selection produced by the transaction. If
    [`this.selection`](https://codemirror.net/6/docs/ref/#state.Transaction.selection) is undefined,
    this will [map](https://codemirror.net/6/docs/ref/#state.EditorSelection.map) the start state's
    current selection through the changes made by the transaction.
    */
    get newSelection() {
      return this.selection || this.startState.selection.map(this.changes);
    }
    /**
    The new state created by the transaction. Computed on demand
    (but retained for subsequent access), so it is recommended not to
    access it in [transaction
    filters](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter) when possible.
    */
    get state() {
      if (!this._state)
        this.startState.applyTransaction(this);
      return this._state;
    }
    /**
    Get the value of the given annotation type, if any.
    */
    annotation(type) {
      for (let ann of this.annotations)
        if (ann.type == type)
          return ann.value;
      return void 0;
    }
    /**
    Indicates whether the transaction changed the document.
    */
    get docChanged() {
      return !this.changes.empty;
    }
    /**
    Indicates whether this transaction reconfigures the state
    (through a [configuration compartment](https://codemirror.net/6/docs/ref/#state.Compartment) or
    with a top-level configuration
    [effect](https://codemirror.net/6/docs/ref/#state.StateEffect^reconfigure).
    */
    get reconfigured() {
      return this.startState.config != this.state.config;
    }
    /**
    Returns true if the transaction has a [user
    event](https://codemirror.net/6/docs/ref/#state.Transaction^userEvent) annotation that is equal to
    or more specific than `event`. For example, if the transaction
    has `"select.pointer"` as user event, `"select"` and
    `"select.pointer"` will match it.
    */
    isUserEvent(event) {
      let e = this.annotation(_Transaction.userEvent);
      return !!(e && (e == event || e.length > event.length && e.slice(0, event.length) == event && e[event.length] == "."));
    }
  };
  Transaction.time = /* @__PURE__ */ Annotation.define();
  Transaction.userEvent = /* @__PURE__ */ Annotation.define();
  Transaction.addToHistory = /* @__PURE__ */ Annotation.define();
  Transaction.remote = /* @__PURE__ */ Annotation.define();
  function joinRanges(a, b) {
    let result = [];
    for (let iA = 0, iB = 0; ; ) {
      let from, to;
      if (iA < a.length && (iB == b.length || b[iB] >= a[iA])) {
        from = a[iA++];
        to = a[iA++];
      } else if (iB < b.length) {
        from = b[iB++];
        to = b[iB++];
      } else
        return result;
      if (!result.length || result[result.length - 1] < from)
        result.push(from, to);
      else if (result[result.length - 1] < to)
        result[result.length - 1] = to;
    }
  }
  function mergeTransaction(a, b, sequential) {
    var _a2;
    let mapForA, mapForB, changes;
    if (sequential) {
      mapForA = b.changes;
      mapForB = ChangeSet.empty(b.changes.length);
      changes = a.changes.compose(b.changes);
    } else {
      mapForA = b.changes.map(a.changes);
      mapForB = a.changes.mapDesc(b.changes, true);
      changes = a.changes.compose(mapForA);
    }
    return {
      changes,
      selection: b.selection ? b.selection.map(mapForB) : (_a2 = a.selection) === null || _a2 === void 0 ? void 0 : _a2.map(mapForA),
      effects: StateEffect.mapEffects(a.effects, mapForA).concat(StateEffect.mapEffects(b.effects, mapForB)),
      annotations: a.annotations.length ? a.annotations.concat(b.annotations) : b.annotations,
      scrollIntoView: a.scrollIntoView || b.scrollIntoView
    };
  }
  function resolveTransactionInner(state, spec, docSize) {
    let sel = spec.selection, annotations = asArray(spec.annotations);
    if (spec.userEvent)
      annotations = annotations.concat(Transaction.userEvent.of(spec.userEvent));
    return {
      changes: spec.changes instanceof ChangeSet ? spec.changes : ChangeSet.of(spec.changes || [], docSize, state.facet(lineSeparator)),
      selection: sel && (sel instanceof EditorSelection ? sel : EditorSelection.single(sel.anchor, sel.head)),
      effects: asArray(spec.effects),
      annotations,
      scrollIntoView: !!spec.scrollIntoView
    };
  }
  function resolveTransaction(state, specs, filter) {
    let s = resolveTransactionInner(state, specs.length ? specs[0] : {}, state.doc.length);
    if (specs.length && specs[0].filter === false)
      filter = false;
    for (let i2 = 1; i2 < specs.length; i2++) {
      if (specs[i2].filter === false)
        filter = false;
      let seq = !!specs[i2].sequential;
      s = mergeTransaction(s, resolveTransactionInner(state, specs[i2], seq ? s.changes.newLength : state.doc.length), seq);
    }
    let tr = Transaction.create(state, s.changes, s.selection, s.effects, s.annotations, s.scrollIntoView);
    return extendTransaction(filter ? filterTransaction(tr) : tr);
  }
  function filterTransaction(tr) {
    let state = tr.startState;
    let result = true;
    for (let filter of state.facet(changeFilter)) {
      let value = filter(tr);
      if (value === false) {
        result = false;
        break;
      }
      if (Array.isArray(value))
        result = result === true ? value : joinRanges(result, value);
    }
    if (result !== true) {
      let changes, back;
      if (result === false) {
        back = tr.changes.invertedDesc;
        changes = ChangeSet.empty(state.doc.length);
      } else {
        let filtered = tr.changes.filter(result);
        changes = filtered.changes;
        back = filtered.filtered.mapDesc(filtered.changes).invertedDesc;
      }
      tr = Transaction.create(state, changes, tr.selection && tr.selection.map(back), StateEffect.mapEffects(tr.effects, back), tr.annotations, tr.scrollIntoView);
    }
    let filters = state.facet(transactionFilter);
    for (let i2 = filters.length - 1; i2 >= 0; i2--) {
      let filtered = filters[i2](tr);
      if (filtered instanceof Transaction)
        tr = filtered;
      else if (Array.isArray(filtered) && filtered.length == 1 && filtered[0] instanceof Transaction)
        tr = filtered[0];
      else
        tr = resolveTransaction(state, asArray(filtered), false);
    }
    return tr;
  }
  function extendTransaction(tr) {
    let state = tr.startState, extenders = state.facet(transactionExtender), spec = tr;
    for (let i2 = extenders.length - 1; i2 >= 0; i2--) {
      let extension = extenders[i2](tr);
      if (extension && Object.keys(extension).length)
        spec = mergeTransaction(spec, resolveTransactionInner(state, extension, tr.changes.newLength), true);
    }
    return spec == tr ? tr : Transaction.create(state, tr.changes, tr.selection, spec.effects, spec.annotations, spec.scrollIntoView);
  }
  var none = [];
  function asArray(value) {
    return value == null ? none : Array.isArray(value) ? value : [value];
  }
  var CharCategory = /* @__PURE__ */ (function(CharCategory2) {
    CharCategory2[CharCategory2["Word"] = 0] = "Word";
    CharCategory2[CharCategory2["Space"] = 1] = "Space";
    CharCategory2[CharCategory2["Other"] = 2] = "Other";
    return CharCategory2;
  })(CharCategory || (CharCategory = {}));
  var nonASCIISingleCaseWordChar = /[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;
  var wordChar;
  try {
    wordChar = /* @__PURE__ */ new RegExp("[\\p{Alphabetic}\\p{Number}_]", "u");
  } catch (_) {
  }
  function hasWordChar(str) {
    if (wordChar)
      return wordChar.test(str);
    for (let i2 = 0; i2 < str.length; i2++) {
      let ch = str[i2];
      if (/\w/.test(ch) || ch > "\x80" && (ch.toUpperCase() != ch.toLowerCase() || nonASCIISingleCaseWordChar.test(ch)))
        return true;
    }
    return false;
  }
  function makeCategorizer(wordChars) {
    return (char) => {
      if (!/\S/.test(char))
        return CharCategory.Space;
      if (hasWordChar(char))
        return CharCategory.Word;
      for (let i2 = 0; i2 < wordChars.length; i2++)
        if (char.indexOf(wordChars[i2]) > -1)
          return CharCategory.Word;
      return CharCategory.Other;
    };
  }
  var EditorState = class _EditorState {
    constructor(config, doc2, selection, values, computeSlot, tr) {
      this.config = config;
      this.doc = doc2;
      this.selection = selection;
      this.values = values;
      this.status = config.statusTemplate.slice();
      this.computeSlot = computeSlot;
      if (tr)
        tr._state = this;
      for (let i2 = 0; i2 < this.config.dynamicSlots.length; i2++)
        ensureAddr(this, i2 << 1);
      this.computeSlot = null;
    }
    field(field, require2 = true) {
      let addr = this.config.address[field.id];
      if (addr == null) {
        if (require2)
          throw new RangeError("Field is not present in this state");
        return void 0;
      }
      ensureAddr(this, addr);
      return getAddr(this, addr);
    }
    /**
    Create a [transaction](https://codemirror.net/6/docs/ref/#state.Transaction) that updates this
    state. Any number of [transaction specs](https://codemirror.net/6/docs/ref/#state.TransactionSpec)
    can be passed. Unless
    [`sequential`](https://codemirror.net/6/docs/ref/#state.TransactionSpec.sequential) is set, the
    [changes](https://codemirror.net/6/docs/ref/#state.TransactionSpec.changes) (if any) of each spec
    are assumed to start in the _current_ document (not the document
    produced by previous specs), and its
    [selection](https://codemirror.net/6/docs/ref/#state.TransactionSpec.selection) and
    [effects](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) are assumed to refer
    to the document created by its _own_ changes. The resulting
    transaction contains the combined effect of all the different
    specs. For [selection](https://codemirror.net/6/docs/ref/#state.TransactionSpec.selection), later
    specs take precedence over earlier ones.
    */
    update(...specs) {
      return resolveTransaction(this, specs, true);
    }
    /**
    @internal
    */
    applyTransaction(tr) {
      let conf = this.config, { base: base2, compartments } = conf;
      for (let effect of tr.effects) {
        if (effect.is(Compartment.reconfigure)) {
          if (conf) {
            compartments = /* @__PURE__ */ new Map();
            conf.compartments.forEach((val, key) => compartments.set(key, val));
            conf = null;
          }
          compartments.set(effect.value.compartment, effect.value.extension);
        } else if (effect.is(StateEffect.reconfigure)) {
          conf = null;
          base2 = effect.value;
        } else if (effect.is(StateEffect.appendConfig)) {
          conf = null;
          base2 = asArray(base2).concat(effect.value);
        }
      }
      let startValues;
      if (!conf) {
        conf = Configuration.resolve(base2, compartments, this);
        let intermediateState = new _EditorState(conf, this.doc, this.selection, conf.dynamicSlots.map(() => null), (state, slot) => slot.reconfigure(state, this), null);
        startValues = intermediateState.values;
      } else {
        startValues = tr.startState.values.slice();
      }
      let selection = tr.startState.facet(allowMultipleSelections) ? tr.newSelection : tr.newSelection.asSingle();
      new _EditorState(conf, tr.newDoc, selection, startValues, (state, slot) => slot.update(state, tr), tr);
    }
    /**
    Create a [transaction spec](https://codemirror.net/6/docs/ref/#state.TransactionSpec) that
    replaces every selection range with the given content.
    */
    replaceSelection(text) {
      if (typeof text == "string")
        text = this.toText(text);
      return this.changeByRange((range) => ({
        changes: { from: range.from, to: range.to, insert: text },
        range: EditorSelection.cursor(range.from + text.length, -1)
      }));
    }
    /**
    Create a set of changes and a new selection by running the given
    function for each range in the active selection. The function
    can return an optional set of changes (in the coordinate space
    of the start document), plus an updated range (in the coordinate
    space of the document produced by the call's own changes). This
    method will merge all the changes and ranges into a single
    changeset and selection, and return it as a [transaction
    spec](https://codemirror.net/6/docs/ref/#state.TransactionSpec), which can be passed to
    [`update`](https://codemirror.net/6/docs/ref/#state.EditorState.update).
    */
    changeByRange(f) {
      let sel = this.selection;
      let result1 = f(sel.ranges[0]);
      let changes = this.changes(result1.changes), ranges = [result1.range];
      let effects = asArray(result1.effects);
      for (let i2 = 1; i2 < sel.ranges.length; i2++) {
        let result = f(sel.ranges[i2]);
        let newChanges = this.changes(result.changes), newMapped = newChanges.map(changes);
        for (let j = 0; j < i2; j++)
          ranges[j] = ranges[j].map(newMapped);
        let mapBy = changes.mapDesc(newChanges, true);
        ranges.push(result.range.map(mapBy));
        changes = changes.compose(newMapped);
        effects = StateEffect.mapEffects(effects, newMapped).concat(StateEffect.mapEffects(asArray(result.effects), mapBy));
      }
      return {
        changes,
        selection: EditorSelection.create(ranges, sel.mainIndex),
        effects
      };
    }
    /**
    Create a [change set](https://codemirror.net/6/docs/ref/#state.ChangeSet) from the given change
    description, taking the state's document length and line
    separator into account.
    */
    changes(spec = []) {
      if (spec instanceof ChangeSet)
        return spec;
      return ChangeSet.of(spec, this.doc.length, this.facet(_EditorState.lineSeparator));
    }
    /**
    Using the state's [line
    separator](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator), create a
    [`Text`](https://codemirror.net/6/docs/ref/#state.Text) instance from the given string.
    */
    toText(string2) {
      return Text.of(string2.split(this.facet(_EditorState.lineSeparator) || DefaultSplit));
    }
    /**
    Return the given range of the document as a string.
    */
    sliceDoc(from = 0, to = this.doc.length) {
      return this.doc.sliceString(from, to, this.lineBreak);
    }
    /**
    Get the value of a state [facet](https://codemirror.net/6/docs/ref/#state.Facet).
    */
    facet(facet) {
      let addr = this.config.address[facet.id];
      if (addr == null)
        return facet.default;
      ensureAddr(this, addr);
      return getAddr(this, addr);
    }
    /**
    Convert this state to a JSON-serializable object. When custom
    fields should be serialized, you can pass them in as an object
    mapping property names (in the resulting object, which should
    not use `doc` or `selection`) to fields.
    */
    toJSON(fields) {
      let result = {
        doc: this.sliceDoc(),
        selection: this.selection.toJSON()
      };
      if (fields)
        for (let prop in fields) {
          let value = fields[prop];
          if (value instanceof StateField && this.config.address[value.id] != null)
            result[prop] = value.spec.toJSON(this.field(fields[prop]), this);
        }
      return result;
    }
    /**
    Deserialize a state from its JSON representation. When custom
    fields should be deserialized, pass the same object you passed
    to [`toJSON`](https://codemirror.net/6/docs/ref/#state.EditorState.toJSON) when serializing as
    third argument.
    */
    static fromJSON(json, config = {}, fields) {
      if (!json || typeof json.doc != "string")
        throw new RangeError("Invalid JSON representation for EditorState");
      let fieldInit = [];
      if (fields)
        for (let prop in fields) {
          if (Object.prototype.hasOwnProperty.call(json, prop)) {
            let field = fields[prop], value = json[prop];
            fieldInit.push(field.init((state) => field.spec.fromJSON(value, state)));
          }
        }
      return _EditorState.create({
        doc: json.doc,
        selection: EditorSelection.fromJSON(json.selection),
        extensions: config.extensions ? fieldInit.concat([config.extensions]) : fieldInit
      });
    }
    /**
    Create a new state. You'll usually only need this when
    initializing an editor—updated states are created by applying
    transactions.
    */
    static create(config = {}) {
      let configuration = Configuration.resolve(config.extensions || [], /* @__PURE__ */ new Map());
      let doc2 = config.doc instanceof Text ? config.doc : Text.of((config.doc || "").split(configuration.staticFacet(_EditorState.lineSeparator) || DefaultSplit));
      let selection = !config.selection ? EditorSelection.single(0) : config.selection instanceof EditorSelection ? config.selection : EditorSelection.single(config.selection.anchor, config.selection.head);
      checkSelection(selection, doc2.length);
      if (!configuration.staticFacet(allowMultipleSelections))
        selection = selection.asSingle();
      return new _EditorState(configuration, doc2, selection, configuration.dynamicSlots.map(() => null), (state, slot) => slot.create(state), null);
    }
    /**
    The size (in columns) of a tab in the document, determined by
    the [`tabSize`](https://codemirror.net/6/docs/ref/#state.EditorState^tabSize) facet.
    */
    get tabSize() {
      return this.facet(_EditorState.tabSize);
    }
    /**
    Get the proper [line-break](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator)
    string for this state.
    */
    get lineBreak() {
      return this.facet(_EditorState.lineSeparator) || "\n";
    }
    /**
    Returns true when the editor is
    [configured](https://codemirror.net/6/docs/ref/#state.EditorState^readOnly) to be read-only.
    */
    get readOnly() {
      return this.facet(readOnly);
    }
    /**
    Look up a translation for the given phrase (via the
    [`phrases`](https://codemirror.net/6/docs/ref/#state.EditorState^phrases) facet), or return the
    original string if no translation is found.
    
    If additional arguments are passed, they will be inserted in
    place of markers like `$1` (for the first value) and `$2`, etc.
    A single `$` is equivalent to `$1`, and `$$` will produce a
    literal dollar sign.
    */
    phrase(phrase, ...insert2) {
      for (let map of this.facet(_EditorState.phrases))
        if (Object.prototype.hasOwnProperty.call(map, phrase)) {
          phrase = map[phrase];
          break;
        }
      if (insert2.length)
        phrase = phrase.replace(/\$(\$|\d*)/g, (m, i2) => {
          if (i2 == "$")
            return "$";
          let n = +(i2 || 1);
          return !n || n > insert2.length ? m : insert2[n - 1];
        });
      return phrase;
    }
    /**
    Find the values for a given language data field, provided by the
    the [`languageData`](https://codemirror.net/6/docs/ref/#state.EditorState^languageData) facet.
    
    Examples of language data fields are...
    
    - [`"commentTokens"`](https://codemirror.net/6/docs/ref/#commands.CommentTokens) for specifying
      comment syntax.
    - [`"autocomplete"`](https://codemirror.net/6/docs/ref/#autocomplete.autocompletion^config.override)
      for providing language-specific completion sources.
    - [`"wordChars"`](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer) for adding
      characters that should be considered part of words in this
      language.
    - [`"closeBrackets"`](https://codemirror.net/6/docs/ref/#autocomplete.CloseBracketConfig) controls
      bracket closing behavior.
    */
    languageDataAt(name2, pos, side = -1) {
      let values = [];
      for (let provider of this.facet(languageData)) {
        for (let result of provider(this, pos, side)) {
          if (Object.prototype.hasOwnProperty.call(result, name2))
            values.push(result[name2]);
        }
      }
      return values;
    }
    /**
    Return a function that can categorize strings (expected to
    represent a single [grapheme cluster](https://codemirror.net/6/docs/ref/#state.findClusterBreak))
    into one of:
    
     - Word (contains an alphanumeric character or a character
       explicitly listed in the local language's `"wordChars"`
       language data, which should be a string)
     - Space (contains only whitespace)
     - Other (anything else)
    */
    charCategorizer(at) {
      let chars = this.languageDataAt("wordChars", at);
      return makeCategorizer(chars.length ? chars[0] : "");
    }
    /**
    Find the word at the given position, meaning the range
    containing all [word](https://codemirror.net/6/docs/ref/#state.CharCategory.Word) characters
    around it. If no word characters are adjacent to the position,
    this returns null.
    */
    wordAt(pos) {
      let { text, from, length } = this.doc.lineAt(pos);
      let cat = this.charCategorizer(pos);
      let start = pos - from, end = pos - from;
      while (start > 0) {
        let prev = findClusterBreak2(text, start, false);
        if (cat(text.slice(prev, start)) != CharCategory.Word)
          break;
        start = prev;
      }
      while (end < length) {
        let next = findClusterBreak2(text, end);
        if (cat(text.slice(end, next)) != CharCategory.Word)
          break;
        end = next;
      }
      return start == end ? null : EditorSelection.range(start + from, end + from);
    }
  };
  EditorState.allowMultipleSelections = allowMultipleSelections;
  EditorState.tabSize = /* @__PURE__ */ Facet.define({
    combine: (values) => values.length ? values[0] : 4
  });
  EditorState.lineSeparator = lineSeparator;
  EditorState.readOnly = readOnly;
  EditorState.phrases = /* @__PURE__ */ Facet.define({
    compare(a, b) {
      let kA = Object.keys(a), kB = Object.keys(b);
      return kA.length == kB.length && kA.every((k) => a[k] == b[k]);
    }
  });
  EditorState.languageData = languageData;
  EditorState.changeFilter = changeFilter;
  EditorState.transactionFilter = transactionFilter;
  EditorState.transactionExtender = transactionExtender;
  Compartment.reconfigure = /* @__PURE__ */ StateEffect.define();
  function combineConfig(configs, defaults2, combine = {}) {
    let result = {};
    for (let config of configs)
      for (let key of Object.keys(config)) {
        let value = config[key], current = result[key];
        if (current === void 0)
          result[key] = value;
        else if (current === value || value === void 0) ;
        else if (Object.hasOwnProperty.call(combine, key))
          result[key] = combine[key](current, value);
        else
          throw new Error("Config merge conflict for field " + key);
      }
    for (let key in defaults2)
      if (result[key] === void 0)
        result[key] = defaults2[key];
    return result;
  }
  var RangeValue = class {
    /**
    Compare this value with another value. Used when comparing
    rangesets. The default implementation compares by identity.
    Unless you are only creating a fixed number of unique instances
    of your value type, it is a good idea to implement this
    properly.
    */
    eq(other) {
      return this == other;
    }
    /**
    Create a [range](https://codemirror.net/6/docs/ref/#state.Range) with this value.
    */
    range(from, to = from) {
      return Range.create(from, to, this);
    }
  };
  RangeValue.prototype.startSide = RangeValue.prototype.endSide = 0;
  RangeValue.prototype.point = false;
  RangeValue.prototype.mapMode = MapMode.TrackDel;
  function cmpVal(a, b) {
    return a == b || a.constructor == b.constructor && a.eq(b);
  }
  var Range = class _Range {
    constructor(from, to, value) {
      this.from = from;
      this.to = to;
      this.value = value;
    }
    /**
    @internal
    */
    static create(from, to, value) {
      return new _Range(from, to, value);
    }
  };
  function cmpRange(a, b) {
    return a.from - b.from || a.value.startSide - b.value.startSide;
  }
  var Chunk = class _Chunk {
    constructor(from, to, value, maxPoint) {
      this.from = from;
      this.to = to;
      this.value = value;
      this.maxPoint = maxPoint;
    }
    get length() {
      return last(this.to);
    }
    // Find the index of the given position and side. Use the ranges'
    // `from` pos when `end == false`, `to` when `end == true`.
    findIndex(pos, side, end, startAt = 0) {
      let arr = end ? this.to : this.from;
      for (let lo = startAt, hi = arr.length; ; ) {
        if (lo == hi)
          return lo;
        let mid = lo + hi >> 1;
        let diff = arr[mid] - pos || (end ? this.value[mid].endSide : this.value[mid].startSide) - side;
        if (mid == lo)
          return diff >= 0 ? lo : hi;
        if (diff >= 0)
          hi = mid;
        else
          lo = mid + 1;
      }
    }
    between(offset, from, to, f) {
      for (let i2 = this.findIndex(from, -1e9, true), e = this.findIndex(to, 1e9, false, i2); i2 < e; i2++)
        if (f(this.from[i2] + offset, this.to[i2] + offset, this.value[i2]) === false)
          return false;
    }
    map(offset, changes, basePos, baseSide, spill) {
      let value = [], from = [], to = [], newPos = -1, maxPoint = -1;
      iter: for (let i2 = 0; i2 < this.value.length; i2++) {
        let val = this.value[i2], curFrom = this.from[i2] + offset, curTo = this.to[i2] + offset, newFrom, newTo;
        if (curFrom == curTo) {
          let mapped = changes.mapPos(curFrom, val.startSide, val.mapMode);
          if (mapped == null)
            continue;
          newFrom = newTo = mapped;
          if (val.startSide != val.endSide) {
            newTo = changes.mapPos(curFrom, val.endSide);
            if (newTo < newFrom)
              continue;
          }
        } else {
          newFrom = changes.mapPos(curFrom, val.startSide);
          newTo = changes.mapPos(curTo, val.endSide);
          if (newFrom > newTo || newFrom == newTo && val.startSide > 0 && val.endSide <= 0)
            continue;
        }
        if ((newTo - newFrom || val.endSide - val.startSide) < 0)
          continue;
        if (newPos < 0)
          newPos = newFrom;
        if (val.point)
          maxPoint = Math.max(maxPoint, newTo - newFrom);
        if ((newFrom - basePos || val.startSide - baseSide) >= 0) {
          value.push(val);
          from.push(newFrom - newPos);
          to.push(newTo - newPos);
          basePos = newTo;
          baseSide = val.endSide;
        } else {
          if (newFrom == newTo) {
            for (let i3 = value.length; i3 > 0; i3--) {
              if ((newFrom - (to[i3 - 1] + newPos) || val.startSide - value[i3 - 1].endSide) >= 0) {
                value.splice(i3, 0, val);
                from.splice(i3, 0, newFrom - newPos);
                to.splice(i3, 0, newTo - newPos);
                continue iter;
              }
              if ((newFrom - (from[i3 - 1] + newPos) || val.endSide - value[i3 - 1].startSide) > 0)
                break;
            }
          }
          spill(newFrom, newTo, val);
        }
      }
      return { mapped: value.length ? new _Chunk(from, to, value, maxPoint) : null, pos: newPos };
    }
  };
  var RangeSet = class _RangeSet {
    constructor(chunkPos, chunk, nextLayer, maxPoint) {
      this.chunkPos = chunkPos;
      this.chunk = chunk;
      this.nextLayer = nextLayer;
      this.maxPoint = maxPoint;
    }
    /**
    @internal
    */
    static create(chunkPos, chunk, nextLayer, maxPoint) {
      return new _RangeSet(chunkPos, chunk, nextLayer, maxPoint);
    }
    /**
    @internal
    */
    get length() {
      let last2 = this.chunk.length - 1;
      return last2 < 0 ? 0 : Math.max(this.chunkEnd(last2), this.nextLayer.length);
    }
    /**
    The number of ranges in the set.
    */
    get size() {
      if (this.isEmpty)
        return 0;
      let size = this.nextLayer.size;
      for (let chunk of this.chunk)
        size += chunk.value.length;
      return size;
    }
    /**
    @internal
    */
    chunkEnd(index) {
      return this.chunkPos[index] + this.chunk[index].length;
    }
    /**
    Update the range set, optionally adding new ranges or filtering
    out existing ones.
    
    (Note: The type parameter is just there as a kludge to work
    around TypeScript variance issues that prevented `RangeSet<X>`
    from being a subtype of `RangeSet<Y>` when `X` is a subtype of
    `Y`.)
    */
    update(updateSpec) {
      let { add = [], sort = false, filterFrom = 0, filterTo = this.length } = updateSpec;
      let filter = updateSpec.filter;
      if (add.length == 0 && !filter)
        return this;
      if (sort)
        add = add.slice().sort(cmpRange);
      if (this.isEmpty)
        return add.length ? _RangeSet.of(add) : this;
      let cur2 = new LayerCursor(this, null, -1).goto(0), i2 = 0, spill = [];
      let builder = new RangeSetBuilder();
      while (cur2.value || i2 < add.length) {
        if (i2 < add.length && (cur2.from - add[i2].from || cur2.startSide - add[i2].value.startSide) >= 0) {
          let range = add[i2++];
          if (!builder.addInner(range.from, range.to, range.value, false))
            spill.push(range);
        } else if (cur2.rangeIndex == 1 && cur2.chunkIndex < this.chunk.length && (i2 == add.length || this.chunkEnd(cur2.chunkIndex) < add[i2].from) && (!filter || filterFrom > this.chunkEnd(cur2.chunkIndex) || filterTo < this.chunkPos[cur2.chunkIndex]) && builder.addChunk(this.chunkPos[cur2.chunkIndex], this.chunk[cur2.chunkIndex])) {
          cur2.nextChunk();
        } else {
          if (!filter || filterFrom > cur2.to || filterTo < cur2.from || filter(cur2.from, cur2.to, cur2.value)) {
            if (!builder.addInner(cur2.from, cur2.to, cur2.value, false))
              spill.push(Range.create(cur2.from, cur2.to, cur2.value));
          }
          cur2.next();
        }
      }
      return builder.finishInner(this.nextLayer.isEmpty && !spill.length ? _RangeSet.empty : this.nextLayer.update({ add: spill, filter, filterFrom, filterTo }));
    }
    /**
    Map this range set through a set of changes, return the new set.
    */
    map(changes) {
      if (changes.empty || this.isEmpty)
        return this;
      let chunks = [], chunkPos = [], maxPoint = -1;
      let spilled;
      let spill = (from, to, value) => {
        if (!spilled)
          spilled = new RangeSetBuilder();
        spilled.addRange(from, to, value, false);
      };
      for (let i2 = 0; i2 < this.chunk.length; i2++) {
        let start = this.chunkPos[i2], chunk = this.chunk[i2];
        let touch = changes.touchesRange(start, start + chunk.length);
        if (touch === false) {
          maxPoint = Math.max(maxPoint, chunk.maxPoint);
          chunks.push(chunk);
          chunkPos.push(changes.mapPos(start));
        } else if (touch === true) {
          let [prevPos, prevSide] = !chunks.length ? [-1, -1] : [last(chunkPos) + last(chunks).length, last(last(chunks).value).endSide];
          let { mapped, pos } = chunk.map(start, changes, prevPos, prevSide, spill);
          if (mapped) {
            maxPoint = Math.max(maxPoint, mapped.maxPoint);
            chunks.push(mapped);
            chunkPos.push(pos);
          }
        }
      }
      let next = this.nextLayer.map(changes);
      if (spilled)
        next = spilled.finishInner(next);
      return chunks.length == 0 ? next : new _RangeSet(chunkPos, chunks, next || _RangeSet.empty, maxPoint);
    }
    /**
    Iterate over the ranges that touch the region `from` to `to`,
    calling `f` for each. There is no guarantee that the ranges will
    be reported in any specific order. When the callback returns
    `false`, iteration stops.
    */
    between(from, to, f) {
      if (this.isEmpty)
        return;
      for (let i2 = 0; i2 < this.chunk.length; i2++) {
        let start = this.chunkPos[i2], chunk = this.chunk[i2];
        if (to >= start && from <= start + chunk.length && chunk.between(start, from - start, to - start, f) === false)
          return;
      }
      this.nextLayer.between(from, to, f);
    }
    /**
    Iterate over the ranges in this set, in order, including all
    ranges that end at or after `from`.
    */
    iter(from = 0) {
      return HeapCursor.from([this]).goto(from);
    }
    /**
    @internal
    */
    get isEmpty() {
      return this.nextLayer == this;
    }
    /**
    Iterate over the ranges in a collection of sets, in order,
    starting from `from`.
    */
    static iter(sets, from = 0) {
      return HeapCursor.from(sets).goto(from);
    }
    /**
    Iterate over two groups of sets, calling methods on `comparator`
    to notify it of possible differences.
    */
    static compare(oldSets, newSets, textDiff, comparator, minPointSize = -1) {
      let a = oldSets.filter((set) => set.maxPoint > 0 || !set.isEmpty && set.maxPoint >= minPointSize);
      let b = newSets.filter((set) => set.maxPoint > 0 || !set.isEmpty && set.maxPoint >= minPointSize);
      let sharedChunks = findSharedChunks(a, b, textDiff);
      let sideA = new SpanCursor(a, sharedChunks, minPointSize);
      let sideB = new SpanCursor(b, sharedChunks, minPointSize);
      textDiff.iterGaps((fromA, fromB, length) => compare(sideA, fromA, sideB, fromB, length, comparator));
      if (textDiff.empty && textDiff.length == 0)
        compare(sideA, 0, sideB, 0, 0, comparator);
    }
    /**
    Compare the contents of two groups of range sets, returning true
    if they are equivalent in the given range.
    */
    static eq(oldSets, newSets, from = 0, to) {
      if (to == null)
        to = 1e9 - 1;
      let a = oldSets.filter((set) => !set.isEmpty && newSets.indexOf(set) < 0);
      let b = newSets.filter((set) => !set.isEmpty && oldSets.indexOf(set) < 0);
      if (a.length != b.length)
        return false;
      if (!a.length)
        return true;
      let sharedChunks = findSharedChunks(a, b);
      let sideA = new SpanCursor(a, sharedChunks, 0).goto(from), sideB = new SpanCursor(b, sharedChunks, 0).goto(from);
      for (; ; ) {
        if (sideA.to != sideB.to || !sameValues(sideA.active, sideB.active) || sideA.point && (!sideB.point || !cmpVal(sideA.point, sideB.point)))
          return false;
        if (sideA.to > to)
          return true;
        sideA.next();
        sideB.next();
      }
    }
    /**
    Iterate over a group of range sets at the same time, notifying
    the iterator about the ranges covering every given piece of
    content. Returns the open count (see
    [`SpanIterator.span`](https://codemirror.net/6/docs/ref/#state.SpanIterator.span)) at the end
    of the iteration.
    */
    static spans(sets, from, to, iterator, minPointSize = -1) {
      let cursor = new SpanCursor(sets, null, minPointSize).goto(from), pos = from;
      let openRanges = cursor.openStart;
      for (; ; ) {
        let curTo = Math.min(cursor.to, to);
        if (cursor.point) {
          let active = cursor.activeForPoint(cursor.to);
          let openCount = cursor.pointFrom < from ? active.length + 1 : cursor.point.startSide < 0 ? active.length : Math.min(active.length, openRanges);
          iterator.point(pos, curTo, cursor.point, active, openCount, cursor.pointRank);
          openRanges = Math.min(cursor.openEnd(curTo), active.length);
        } else if (curTo > pos) {
          iterator.span(pos, curTo, cursor.active, openRanges);
          openRanges = cursor.openEnd(curTo);
        }
        if (cursor.to > to)
          return openRanges + (cursor.point && cursor.to > to ? 1 : 0);
        pos = cursor.to;
        cursor.next();
      }
    }
    /**
    Create a range set for the given range or array of ranges. By
    default, this expects the ranges to be _sorted_ (by start
    position and, if two start at the same position,
    `value.startSide`). You can pass `true` as second argument to
    cause the method to sort them.
    */
    static of(ranges, sort = false) {
      let build = new RangeSetBuilder();
      for (let range of ranges instanceof Range ? [ranges] : sort ? lazySort(ranges) : ranges)
        build.add(range.from, range.to, range.value);
      return build.finish();
    }
    /**
    Join an array of range sets into a single set.
    */
    static join(sets) {
      if (!sets.length)
        return _RangeSet.empty;
      let result = last(sets);
      for (let i2 = sets.length - 2; i2 >= 0; i2--) {
        for (let layer2 = sets[i2]; layer2 != _RangeSet.empty; layer2 = layer2.nextLayer)
          result = new _RangeSet(layer2.chunkPos, layer2.chunk, result, Math.max(layer2.maxPoint, result.maxPoint));
      }
      return result;
    }
  };
  RangeSet.empty = /* @__PURE__ */ new RangeSet([], [], null, -1);
  function last(arr) {
    return arr[arr.length - 1];
  }
  function lazySort(ranges) {
    if (ranges.length > 1)
      for (let prev = ranges[0], i2 = 1; i2 < ranges.length; i2++) {
        let cur2 = ranges[i2];
        if (cmpRange(prev, cur2) > 0)
          return ranges.slice().sort(cmpRange);
        prev = cur2;
      }
    return ranges;
  }
  RangeSet.empty.nextLayer = RangeSet.empty;
  var RangeSetBuilder = class _RangeSetBuilder {
    finishChunk(newArrays) {
      this.chunks.push(new Chunk(this.from, this.to, this.value, this.maxPoint));
      this.chunkPos.push(this.chunkStart);
      this.chunkStart = -1;
      this.setMaxPoint = Math.max(this.setMaxPoint, this.maxPoint);
      this.maxPoint = -1;
      if (newArrays) {
        this.from = [];
        this.to = [];
        this.value = [];
      }
    }
    /**
    Create an empty builder.
    */
    constructor() {
      this.chunks = [];
      this.chunkPos = [];
      this.chunkStart = -1;
      this.last = null;
      this.lastFrom = -1e9;
      this.lastTo = -1e9;
      this.from = [];
      this.to = [];
      this.value = [];
      this.maxPoint = -1;
      this.setMaxPoint = -1;
      this.nextLayer = null;
    }
    /**
    Add a range. Ranges should be added in sorted (by `from` and
    `value.startSide`) order.
    */
    add(from, to, value) {
      this.addRange(from, to, value, true);
    }
    /**
    @internal
    */
    addRange(from, to, value, strict) {
      if (!this.addInner(from, to, value, strict))
        (this.nextLayer || (this.nextLayer = new _RangeSetBuilder())).addRange(from, to, value, strict);
    }
    /**
    @internal
    */
    addInner(from, to, value, strict) {
      let diff = from - this.lastTo || value.startSide - this.last.endSide;
      if (strict && diff <= 0 && (from - this.lastFrom || value.startSide - this.last.startSide) < 0)
        throw new Error("Ranges must be added sorted by `from` position and `startSide`");
      if (diff < 0)
        return false;
      if (this.from.length == 250)
        this.finishChunk(true);
      if (this.chunkStart < 0)
        this.chunkStart = from;
      this.from.push(from - this.chunkStart);
      this.to.push(to - this.chunkStart);
      this.last = value;
      this.lastFrom = from;
      this.lastTo = to;
      this.value.push(value);
      if (value.point)
        this.maxPoint = Math.max(this.maxPoint, to - from);
      return true;
    }
    /**
    @internal
    */
    addChunk(from, chunk) {
      if ((from - this.lastTo || chunk.value[0].startSide - this.last.endSide) < 0)
        return false;
      if (this.from.length)
        this.finishChunk(true);
      this.setMaxPoint = Math.max(this.setMaxPoint, chunk.maxPoint);
      this.chunks.push(chunk);
      this.chunkPos.push(from);
      let last2 = chunk.value.length - 1;
      this.last = chunk.value[last2];
      this.lastFrom = chunk.from[last2] + from;
      this.lastTo = chunk.to[last2] + from;
      return true;
    }
    /**
    Finish the range set. Returns the new set. The builder can't be
    used anymore after this has been called.
    */
    finish() {
      return this.finishInner(RangeSet.empty);
    }
    /**
    @internal
    */
    finishInner(next) {
      if (this.from.length)
        this.finishChunk(false);
      if (this.chunks.length == 0)
        return next;
      let result = RangeSet.create(this.chunkPos, this.chunks, this.nextLayer ? this.nextLayer.finishInner(next) : next, this.setMaxPoint);
      this.from = null;
      return result;
    }
  };
  function findSharedChunks(a, b, textDiff) {
    let inA = /* @__PURE__ */ new Map();
    for (let set of a)
      for (let i2 = 0; i2 < set.chunk.length; i2++)
        if (set.chunk[i2].maxPoint <= 0)
          inA.set(set.chunk[i2], set.chunkPos[i2]);
    let shared = /* @__PURE__ */ new Set();
    for (let set of b)
      for (let i2 = 0; i2 < set.chunk.length; i2++) {
        let known = inA.get(set.chunk[i2]);
        if (known != null && (textDiff ? textDiff.mapPos(known) : known) == set.chunkPos[i2] && !(textDiff === null || textDiff === void 0 ? void 0 : textDiff.touchesRange(known, known + set.chunk[i2].length)))
          shared.add(set.chunk[i2]);
      }
    return shared;
  }
  var LayerCursor = class {
    constructor(layer2, skip, minPoint, rank = 0) {
      this.layer = layer2;
      this.skip = skip;
      this.minPoint = minPoint;
      this.rank = rank;
    }
    get startSide() {
      return this.value ? this.value.startSide : 0;
    }
    get endSide() {
      return this.value ? this.value.endSide : 0;
    }
    goto(pos, side = -1e9) {
      this.chunkIndex = this.rangeIndex = 0;
      this.gotoInner(pos, side, false);
      return this;
    }
    gotoInner(pos, side, forward) {
      while (this.chunkIndex < this.layer.chunk.length) {
        let next = this.layer.chunk[this.chunkIndex];
        if (!(this.skip && this.skip.has(next) || this.layer.chunkEnd(this.chunkIndex) < pos || next.maxPoint < this.minPoint))
          break;
        this.chunkIndex++;
        forward = false;
      }
      if (this.chunkIndex < this.layer.chunk.length) {
        let rangeIndex = this.layer.chunk[this.chunkIndex].findIndex(pos - this.layer.chunkPos[this.chunkIndex], side, true);
        if (!forward || this.rangeIndex < rangeIndex)
          this.setRangeIndex(rangeIndex);
      }
      this.next();
    }
    forward(pos, side) {
      if ((this.to - pos || this.endSide - side) < 0)
        this.gotoInner(pos, side, true);
    }
    next() {
      for (; ; ) {
        if (this.chunkIndex == this.layer.chunk.length) {
          this.from = this.to = 1e9;
          this.value = null;
          break;
        } else {
          let chunkPos = this.layer.chunkPos[this.chunkIndex], chunk = this.layer.chunk[this.chunkIndex];
          let from = chunkPos + chunk.from[this.rangeIndex];
          this.from = from;
          this.to = chunkPos + chunk.to[this.rangeIndex];
          this.value = chunk.value[this.rangeIndex];
          this.setRangeIndex(this.rangeIndex + 1);
          if (this.minPoint < 0 || this.value.point && this.to - this.from >= this.minPoint)
            break;
        }
      }
    }
    setRangeIndex(index) {
      if (index == this.layer.chunk[this.chunkIndex].value.length) {
        this.chunkIndex++;
        if (this.skip) {
          while (this.chunkIndex < this.layer.chunk.length && this.skip.has(this.layer.chunk[this.chunkIndex]))
            this.chunkIndex++;
        }
        this.rangeIndex = 0;
      } else {
        this.rangeIndex = index;
      }
    }
    nextChunk() {
      this.chunkIndex++;
      this.rangeIndex = 0;
      this.next();
    }
    compare(other) {
      return this.from - other.from || this.startSide - other.startSide || this.rank - other.rank || this.to - other.to || this.endSide - other.endSide;
    }
  };
  var HeapCursor = class _HeapCursor {
    constructor(heap) {
      this.heap = heap;
    }
    static from(sets, skip = null, minPoint = -1) {
      let heap = [];
      for (let i2 = 0; i2 < sets.length; i2++) {
        for (let cur2 = sets[i2]; !cur2.isEmpty; cur2 = cur2.nextLayer) {
          if (cur2.maxPoint >= minPoint)
            heap.push(new LayerCursor(cur2, skip, minPoint, i2));
        }
      }
      return heap.length == 1 ? heap[0] : new _HeapCursor(heap);
    }
    get startSide() {
      return this.value ? this.value.startSide : 0;
    }
    goto(pos, side = -1e9) {
      for (let cur2 of this.heap)
        cur2.goto(pos, side);
      for (let i2 = this.heap.length >> 1; i2 >= 0; i2--)
        heapBubble(this.heap, i2);
      this.next();
      return this;
    }
    forward(pos, side) {
      for (let cur2 of this.heap)
        cur2.forward(pos, side);
      for (let i2 = this.heap.length >> 1; i2 >= 0; i2--)
        heapBubble(this.heap, i2);
      if ((this.to - pos || this.value.endSide - side) < 0)
        this.next();
    }
    next() {
      if (this.heap.length == 0) {
        this.from = this.to = 1e9;
        this.value = null;
        this.rank = -1;
      } else {
        let top2 = this.heap[0];
        this.from = top2.from;
        this.to = top2.to;
        this.value = top2.value;
        this.rank = top2.rank;
        if (top2.value)
          top2.next();
        heapBubble(this.heap, 0);
      }
    }
  };
  function heapBubble(heap, index) {
    for (let cur2 = heap[index]; ; ) {
      let childIndex = (index << 1) + 1;
      if (childIndex >= heap.length)
        break;
      let child = heap[childIndex];
      if (childIndex + 1 < heap.length && child.compare(heap[childIndex + 1]) >= 0) {
        child = heap[childIndex + 1];
        childIndex++;
      }
      if (cur2.compare(child) < 0)
        break;
      heap[childIndex] = cur2;
      heap[index] = child;
      index = childIndex;
    }
  }
  var SpanCursor = class {
    constructor(sets, skip, minPoint) {
      this.minPoint = minPoint;
      this.active = [];
      this.activeTo = [];
      this.activeRank = [];
      this.minActive = -1;
      this.point = null;
      this.pointFrom = 0;
      this.pointRank = 0;
      this.to = -1e9;
      this.endSide = 0;
      this.openStart = -1;
      this.cursor = HeapCursor.from(sets, skip, minPoint);
    }
    goto(pos, side = -1e9) {
      this.cursor.goto(pos, side);
      this.active.length = this.activeTo.length = this.activeRank.length = 0;
      this.minActive = -1;
      this.to = pos;
      this.endSide = side;
      this.openStart = -1;
      this.next();
      return this;
    }
    forward(pos, side) {
      while (this.minActive > -1 && (this.activeTo[this.minActive] - pos || this.active[this.minActive].endSide - side) < 0)
        this.removeActive(this.minActive);
      this.cursor.forward(pos, side);
    }
    removeActive(index) {
      remove(this.active, index);
      remove(this.activeTo, index);
      remove(this.activeRank, index);
      this.minActive = findMinIndex(this.active, this.activeTo);
    }
    addActive(trackOpen) {
      let i2 = 0, { value, to, rank } = this.cursor;
      while (i2 < this.activeRank.length && (rank - this.activeRank[i2] || to - this.activeTo[i2]) > 0)
        i2++;
      insert(this.active, i2, value);
      insert(this.activeTo, i2, to);
      insert(this.activeRank, i2, rank);
      if (trackOpen)
        insert(trackOpen, i2, this.cursor.from);
      this.minActive = findMinIndex(this.active, this.activeTo);
    }
    // After calling this, if `this.point` != null, the next range is a
    // point. Otherwise, it's a regular range, covered by `this.active`.
    next() {
      let from = this.to, wasPoint = this.point;
      this.point = null;
      let trackOpen = this.openStart < 0 ? [] : null;
      for (; ; ) {
        let a = this.minActive;
        if (a > -1 && (this.activeTo[a] - this.cursor.from || this.active[a].endSide - this.cursor.startSide) < 0) {
          if (this.activeTo[a] > from) {
            this.to = this.activeTo[a];
            this.endSide = this.active[a].endSide;
            break;
          }
          this.removeActive(a);
          if (trackOpen)
            remove(trackOpen, a);
        } else if (!this.cursor.value) {
          this.to = this.endSide = 1e9;
          break;
        } else if (this.cursor.from > from) {
          this.to = this.cursor.from;
          this.endSide = this.cursor.startSide;
          break;
        } else {
          let nextVal = this.cursor.value;
          if (!nextVal.point) {
            this.addActive(trackOpen);
            this.cursor.next();
          } else if (wasPoint && this.cursor.to == this.to && this.cursor.from < this.cursor.to) {
            this.cursor.next();
          } else {
            this.point = nextVal;
            this.pointFrom = this.cursor.from;
            this.pointRank = this.cursor.rank;
            this.to = this.cursor.to;
            this.endSide = nextVal.endSide;
            this.cursor.next();
            this.forward(this.to, this.endSide);
            break;
          }
        }
      }
      if (trackOpen) {
        this.openStart = 0;
        for (let i2 = trackOpen.length - 1; i2 >= 0 && trackOpen[i2] < from; i2--)
          this.openStart++;
      }
    }
    activeForPoint(to) {
      if (!this.active.length)
        return this.active;
      let active = [];
      for (let i2 = this.active.length - 1; i2 >= 0; i2--) {
        if (this.activeRank[i2] < this.pointRank)
          break;
        if (this.activeTo[i2] > to || this.activeTo[i2] == to && this.active[i2].endSide >= this.point.endSide)
          active.push(this.active[i2]);
      }
      return active.reverse();
    }
    openEnd(to) {
      let open = 0;
      for (let i2 = this.activeTo.length - 1; i2 >= 0 && this.activeTo[i2] > to; i2--)
        open++;
      return open;
    }
  };
  function compare(a, startA, b, startB, length, comparator) {
    a.goto(startA);
    b.goto(startB);
    let endB = startB + length;
    let pos = startB, dPos = startB - startA;
    let bounds = !!comparator.boundChange;
    for (let boundChange = false; ; ) {
      let dEnd = a.to + dPos - b.to, diff = dEnd || a.endSide - b.endSide;
      let end = diff < 0 ? a.to + dPos : b.to, clipEnd = Math.min(end, endB);
      let point = a.point || b.point;
      if (point) {
        if (!(a.point && b.point && cmpVal(a.point, b.point) && sameValues(a.activeForPoint(a.to), b.activeForPoint(b.to))))
          comparator.comparePoint(pos, clipEnd, a.point, b.point);
        boundChange = false;
      } else {
        if (boundChange) {
          comparator.boundChange(pos);
          boundChange = false;
        }
        if (clipEnd > pos && !sameValues(a.active, b.active))
          comparator.compareRange(pos, clipEnd, a.active, b.active);
        if (bounds && clipEnd < endB && (dEnd || a.openEnd(end) != b.openEnd(end)))
          boundChange = true;
      }
      if (end > endB)
        break;
      pos = end;
      if (diff <= 0)
        a.next();
      if (diff >= 0)
        b.next();
    }
  }
  function sameValues(a, b) {
    if (a.length != b.length)
      return false;
    for (let i2 = 0; i2 < a.length; i2++)
      if (a[i2] != b[i2] && !cmpVal(a[i2], b[i2]))
        return false;
    return true;
  }
  function remove(array, index) {
    for (let i2 = index, e = array.length - 1; i2 < e; i2++)
      array[i2] = array[i2 + 1];
    array.pop();
  }
  function insert(array, index, value) {
    for (let i2 = array.length - 1; i2 >= index; i2--)
      array[i2 + 1] = array[i2];
    array[index] = value;
  }
  function findMinIndex(value, array) {
    let found = -1, foundPos = 1e9;
    for (let i2 = 0; i2 < array.length; i2++)
      if ((array[i2] - foundPos || value[i2].endSide - value[found].endSide) < 0) {
        found = i2;
        foundPos = array[i2];
      }
    return found;
  }
  function countColumn(string2, tabSize, to = string2.length) {
    let n = 0;
    for (let i2 = 0; i2 < to && i2 < string2.length; ) {
      if (string2.charCodeAt(i2) == 9) {
        n += tabSize - n % tabSize;
        i2++;
      } else {
        n++;
        i2 = findClusterBreak2(string2, i2);
      }
    }
    return n;
  }
  function findColumn(string2, col, tabSize, strict) {
    for (let i2 = 0, n = 0; ; ) {
      if (n >= col)
        return i2;
      if (i2 == string2.length)
        break;
      n += string2.charCodeAt(i2) == 9 ? tabSize - n % tabSize : 1;
      i2 = findClusterBreak2(string2, i2);
    }
    return strict === true ? -1 : string2.length;
  }

  // node_modules/style-mod/src/style-mod.js
  var C = "\u037C";
  var COUNT = typeof Symbol == "undefined" ? "__" + C : Symbol.for(C);
  var SET = typeof Symbol == "undefined" ? "__styleSet" + Math.floor(Math.random() * 1e8) : /* @__PURE__ */ Symbol("styleSet");
  var top = typeof globalThis != "undefined" ? globalThis : typeof window != "undefined" ? window : {};
  var StyleModule = class {
    // :: (Object<Style>, ?{finish: ?(string) → string})
    // Create a style module from the given spec.
    //
    // When `finish` is given, it is called on regular (non-`@`)
    // selectors (after `&` expansion) to compute the final selector.
    constructor(spec, options) {
      this.rules = [];
      let { finish } = options || {};
      function splitSelector(selector) {
        return /^@/.test(selector) ? [selector] : selector.split(/,\s*/);
      }
      function render(selectors, spec2, target, isKeyframes) {
        let local = [], isAt = /^@(\w+)\b/.exec(selectors[0]), keyframes = isAt && isAt[1] == "keyframes";
        if (isAt && spec2 == null) return target.push(selectors[0] + ";");
        for (let prop in spec2) {
          let value = spec2[prop];
          if (/&/.test(prop)) {
            render(
              prop.split(/,\s*/).map((part) => selectors.map((sel) => part.replace(/&/, sel))).reduce((a, b) => a.concat(b)),
              value,
              target
            );
          } else if (value && typeof value == "object") {
            if (!isAt) throw new RangeError("The value of a property (" + prop + ") should be a primitive value.");
            render(splitSelector(prop), value, local, keyframes);
          } else if (value != null) {
            local.push(prop.replace(/_.*/, "").replace(/[A-Z]/g, (l) => "-" + l.toLowerCase()) + ": " + value + ";");
          }
        }
        if (local.length || keyframes) {
          target.push((finish && !isAt && !isKeyframes ? selectors.map(finish) : selectors).join(", ") + " {" + local.join(" ") + "}");
        }
      }
      for (let prop in spec) render(splitSelector(prop), spec[prop], this.rules);
    }
    // :: () → string
    // Returns a string containing the module's CSS rules.
    getRules() {
      return this.rules.join("\n");
    }
    // :: () → string
    // Generate a new unique CSS class name.
    static newName() {
      let id = top[COUNT] || 1;
      top[COUNT] = id + 1;
      return C + id.toString(36);
    }
    // :: (union<Document, ShadowRoot>, union<[StyleModule], StyleModule>, ?{nonce: ?string})
    //
    // Mount the given set of modules in the given DOM root, which ensures
    // that the CSS rules defined by the module are available in that
    // context.
    //
    // Rules are only added to the document once per root.
    //
    // Rule order will follow the order of the modules, so that rules from
    // modules later in the array take precedence of those from earlier
    // modules. If you call this function multiple times for the same root
    // in a way that changes the order of already mounted modules, the old
    // order will be changed.
    //
    // If a Content Security Policy nonce is provided, it is added to
    // the `<style>` tag generated by the library.
    static mount(root, modules, options) {
      let set = root[SET], nonce = options && options.nonce;
      if (!set) set = new StyleSet(root, nonce);
      else if (nonce) set.setNonce(nonce);
      set.mount(Array.isArray(modules) ? modules : [modules], root);
    }
  };
  var adoptedSet = /* @__PURE__ */ new Map();
  var StyleSet = class {
    constructor(root, nonce) {
      let doc2 = root.ownerDocument || root, win = doc2.defaultView;
      if (!root.head && root.adoptedStyleSheets && win.CSSStyleSheet) {
        let adopted = adoptedSet.get(doc2);
        if (adopted) return root[SET] = adopted;
        this.sheet = new win.CSSStyleSheet();
        adoptedSet.set(doc2, this);
      } else {
        this.styleTag = doc2.createElement("style");
        if (nonce) this.styleTag.setAttribute("nonce", nonce);
      }
      this.modules = [];
      root[SET] = this;
    }
    mount(modules, root) {
      let sheet = this.sheet;
      let pos = 0, j = 0;
      let changed = false;
      for (let i2 = 0; i2 < modules.length; i2++) {
        let mod = modules[i2], index = this.modules.indexOf(mod);
        if (index < j && index > -1) {
          this.modules.splice(index, 1);
          changed = true;
          j--;
          index = -1;
        }
        if (index == -1) {
          this.modules.splice(j++, 0, mod);
          changed = true;
          if (sheet) for (let k = 0; k < mod.rules.length; k++)
            sheet.insertRule(mod.rules[k], pos++);
        } else {
          while (j < index) pos += this.modules[j++].rules.length;
          pos += mod.rules.length;
          j++;
        }
      }
      if (sheet) {
        if (root.adoptedStyleSheets.indexOf(this.sheet) < 0)
          root.adoptedStyleSheets = [this.sheet, ...root.adoptedStyleSheets];
      } else {
        if (changed) {
          let text = "";
          for (let i2 = 0; i2 < this.modules.length; i2++)
            text += this.modules[i2].getRules() + "\n";
          this.styleTag.textContent = text;
        }
        let target = root.head || root;
        if (this.styleTag.parentNode != target)
          target.insertBefore(this.styleTag, target.firstChild);
      }
    }
    setNonce(nonce) {
      if (this.styleTag && this.styleTag.getAttribute("nonce") != nonce)
        this.styleTag.setAttribute("nonce", nonce);
    }
  };

  // node_modules/w3c-keyname/index.js
  var base = {
    8: "Backspace",
    9: "Tab",
    10: "Enter",
    12: "NumLock",
    13: "Enter",
    16: "Shift",
    17: "Control",
    18: "Alt",
    20: "CapsLock",
    27: "Escape",
    32: " ",
    33: "PageUp",
    34: "PageDown",
    35: "End",
    36: "Home",
    37: "ArrowLeft",
    38: "ArrowUp",
    39: "ArrowRight",
    40: "ArrowDown",
    44: "PrintScreen",
    45: "Insert",
    46: "Delete",
    59: ";",
    61: "=",
    91: "Meta",
    92: "Meta",
    106: "*",
    107: "+",
    108: ",",
    109: "-",
    110: ".",
    111: "/",
    144: "NumLock",
    145: "ScrollLock",
    160: "Shift",
    161: "Shift",
    162: "Control",
    163: "Control",
    164: "Alt",
    165: "Alt",
    173: "-",
    186: ";",
    187: "=",
    188: ",",
    189: "-",
    190: ".",
    191: "/",
    192: "`",
    219: "[",
    220: "\\",
    221: "]",
    222: "'"
  };
  var shift = {
    48: ")",
    49: "!",
    50: "@",
    51: "#",
    52: "$",
    53: "%",
    54: "^",
    55: "&",
    56: "*",
    57: "(",
    59: ":",
    61: "+",
    173: "_",
    186: ":",
    187: "+",
    188: "<",
    189: "_",
    190: ">",
    191: "?",
    192: "~",
    219: "{",
    220: "|",
    221: "}",
    222: '"'
  };
  var mac = typeof navigator != "undefined" && /Mac/.test(navigator.platform);
  var ie = typeof navigator != "undefined" && /MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);
  for (i = 0; i < 10; i++) base[48 + i] = base[96 + i] = String(i);
  var i;
  for (i = 1; i <= 24; i++) base[i + 111] = "F" + i;
  var i;
  for (i = 65; i <= 90; i++) {
    base[i] = String.fromCharCode(i + 32);
    shift[i] = String.fromCharCode(i);
  }
  var i;
  for (code in base) if (!shift.hasOwnProperty(code)) shift[code] = base[code];
  var code;
  function keyName(event) {
    var ignoreKey = mac && event.metaKey && event.shiftKey && !event.ctrlKey && !event.altKey || ie && event.shiftKey && event.key && event.key.length == 1 || event.key == "Unidentified";
    var name2 = !ignoreKey && event.key || (event.shiftKey ? shift : base)[event.keyCode] || event.key || "Unidentified";
    if (name2 == "Esc") name2 = "Escape";
    if (name2 == "Del") name2 = "Delete";
    if (name2 == "Left") name2 = "ArrowLeft";
    if (name2 == "Up") name2 = "ArrowUp";
    if (name2 == "Right") name2 = "ArrowRight";
    if (name2 == "Down") name2 = "ArrowDown";
    return name2;
  }

  // node_modules/@codemirror/view/dist/index.js
  var nav = typeof navigator != "undefined" ? navigator : { userAgent: "", vendor: "", platform: "" };
  var doc = typeof document != "undefined" ? document : { documentElement: { style: {} } };
  var ie_edge = /* @__PURE__ */ /Edge\/(\d+)/.exec(nav.userAgent);
  var ie_upto10 = /* @__PURE__ */ /MSIE \d/.test(nav.userAgent);
  var ie_11up = /* @__PURE__ */ /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(nav.userAgent);
  var ie2 = !!(ie_upto10 || ie_11up || ie_edge);
  var gecko = !ie2 && /* @__PURE__ */ /gecko\/(\d+)/i.test(nav.userAgent);
  var chrome = !ie2 && /* @__PURE__ */ /Chrome\/(\d+)/.exec(nav.userAgent);
  var webkit = "webkitFontSmoothing" in doc.documentElement.style;
  var safari = !ie2 && /* @__PURE__ */ /Apple Computer/.test(nav.vendor);
  var ios = safari && (/* @__PURE__ */ /Mobile\/\w+/.test(nav.userAgent) || nav.maxTouchPoints > 2);
  var browser = {
    mac: ios || /* @__PURE__ */ /Mac/.test(nav.platform),
    windows: /* @__PURE__ */ /Win/.test(nav.platform),
    linux: /* @__PURE__ */ /Linux|X11/.test(nav.platform),
    ie: ie2,
    ie_version: ie_upto10 ? doc.documentMode || 6 : ie_11up ? +ie_11up[1] : ie_edge ? +ie_edge[1] : 0,
    gecko,
    gecko_version: gecko ? +(/* @__PURE__ */ /Firefox\/(\d+)/.exec(nav.userAgent) || [0, 0])[1] : 0,
    chrome: !!chrome,
    chrome_version: chrome ? +chrome[1] : 0,
    ios,
    android: /* @__PURE__ */ /Android\b/.test(nav.userAgent),
    webkit,
    webkit_version: webkit ? +(/* @__PURE__ */ /\bAppleWebKit\/(\d+)/.exec(nav.userAgent) || [0, 0])[1] : 0,
    safari,
    safari_version: safari ? +(/* @__PURE__ */ /\bVersion\/(\d+(\.\d+)?)/.exec(nav.userAgent) || [0, 0])[1] : 0,
    tabSize: doc.documentElement.style.tabSize != null ? "tab-size" : "-moz-tab-size"
  };
  function combineAttrs(source, target) {
    for (let name2 in source) {
      if (name2 == "class" && target.class)
        target.class += " " + source.class;
      else if (name2 == "style" && target.style)
        target.style += ";" + source.style;
      else
        target[name2] = source[name2];
    }
    return target;
  }
  var noAttrs = /* @__PURE__ */ Object.create(null);
  function attrsEq(a, b, ignore) {
    if (a == b)
      return true;
    if (!a)
      a = noAttrs;
    if (!b)
      b = noAttrs;
    let keysA = Object.keys(a), keysB = Object.keys(b);
    if (keysA.length - 0 != keysB.length - 0)
      return false;
    for (let key of keysA) {
      if (key != ignore && (keysB.indexOf(key) == -1 || a[key] !== b[key]))
        return false;
    }
    return true;
  }
  function setAttrs(dom, attrs) {
    for (let i2 = dom.attributes.length - 1; i2 >= 0; i2--) {
      let name2 = dom.attributes[i2].name;
      if (attrs[name2] == null)
        dom.removeAttribute(name2);
    }
    for (let name2 in attrs) {
      let value = attrs[name2];
      if (name2 == "style")
        dom.style.cssText = value;
      else if (dom.getAttribute(name2) != value)
        dom.setAttribute(name2, value);
    }
  }
  function updateAttrs(dom, prev, attrs) {
    let changed = false;
    if (prev) {
      for (let name2 in prev)
        if (!(attrs && name2 in attrs)) {
          changed = true;
          if (name2 == "style")
            dom.style.cssText = "";
          else
            dom.removeAttribute(name2);
        }
    }
    if (attrs) {
      for (let name2 in attrs)
        if (!(prev && prev[name2] == attrs[name2])) {
          changed = true;
          if (name2 == "style")
            dom.style.cssText = attrs[name2];
          else
            dom.setAttribute(name2, attrs[name2]);
        }
    }
    return changed;
  }
  function getAttrs(dom) {
    let attrs = /* @__PURE__ */ Object.create(null);
    for (let i2 = 0; i2 < dom.attributes.length; i2++) {
      let attr = dom.attributes[i2];
      attrs[attr.name] = attr.value;
    }
    return attrs;
  }
  var WidgetType = class {
    /**
    Compare this instance to another instance of the same type.
    (TypeScript can't express this, but only instances of the same
    specific class will be passed to this method.) This is used to
    avoid redrawing widgets when they are replaced by a new
    decoration of the same type. The default implementation just
    returns `false`, which will cause new instances of the widget to
    always be redrawn.
    */
    eq(widget) {
      return false;
    }
    /**
    Update a DOM element created by a widget of the same type (but
    different, non-`eq` content) to reflect this widget. May return
    true to indicate that it could update, false to indicate it
    couldn't (in which case the widget will be redrawn). The default
    implementation just returns false.
    */
    updateDOM(dom, view2, from) {
      return false;
    }
    /**
    @internal
    */
    compare(other) {
      return this == other || this.constructor == other.constructor && this.eq(other);
    }
    /**
    The estimated height this widget will have, to be used when
    estimating the height of content that hasn't been drawn. May
    return -1 to indicate you don't know. The default implementation
    returns -1.
    */
    get estimatedHeight() {
      return -1;
    }
    /**
    For inline widgets that are displayed inline (as opposed to
    `inline-block`) and introduce line breaks (through `<br>` tags
    or textual newlines), this must indicate the amount of line
    breaks they introduce. Defaults to 0.
    */
    get lineBreaks() {
      return 0;
    }
    /**
    Can be used to configure which kinds of events inside the widget
    should be ignored by the editor. The default is to ignore all
    events.
    */
    ignoreEvent(event) {
      return true;
    }
    /**
    Override the way screen coordinates for positions at/in the
    widget are found. `pos` will be the offset into the widget, and
    `side` the side of the position that is being queried—less than
    zero for before, greater than zero for after, and zero for
    directly at that position.
    */
    coordsAt(dom, pos, side) {
      return null;
    }
    /**
    @internal
    */
    get isHidden() {
      return false;
    }
    /**
    @internal
    */
    get editable() {
      return false;
    }
    /**
    This is called when the an instance of the widget is removed
    from the editor view.
    */
    destroy(dom) {
    }
  };
  var BlockType = /* @__PURE__ */ (function(BlockType2) {
    BlockType2[BlockType2["Text"] = 0] = "Text";
    BlockType2[BlockType2["WidgetBefore"] = 1] = "WidgetBefore";
    BlockType2[BlockType2["WidgetAfter"] = 2] = "WidgetAfter";
    BlockType2[BlockType2["WidgetRange"] = 3] = "WidgetRange";
    return BlockType2;
  })(BlockType || (BlockType = {}));
  var Decoration = class extends RangeValue {
    constructor(startSide, endSide, widget, spec) {
      super();
      this.startSide = startSide;
      this.endSide = endSide;
      this.widget = widget;
      this.spec = spec;
    }
    /**
    @internal
    */
    get heightRelevant() {
      return false;
    }
    /**
    Create a mark decoration, which influences the styling of the
    content in its range. Nested mark decorations will cause nested
    DOM elements to be created. Nesting order is determined by
    precedence of the [facet](https://codemirror.net/6/docs/ref/#view.EditorView^decorations), with
    the higher-precedence decorations creating the inner DOM nodes.
    Such elements are split on line boundaries and on the boundaries
    of lower-precedence decorations.
    */
    static mark(spec) {
      return new MarkDecoration(spec);
    }
    /**
    Create a widget decoration, which displays a DOM element at the
    given position.
    */
    static widget(spec) {
      let side = Math.max(-1e4, Math.min(1e4, spec.side || 0)), block = !!spec.block;
      side += block && !spec.inlineOrder ? side > 0 ? 3e8 : -4e8 : side > 0 ? 1e8 : -1e8;
      return new PointDecoration(spec, side, side, block, spec.widget || null, false);
    }
    /**
    Create a replace decoration which replaces the given range with
    a widget, or simply hides it.
    */
    static replace(spec) {
      let block = !!spec.block, startSide, endSide;
      if (spec.isBlockGap) {
        startSide = -5e8;
        endSide = 4e8;
      } else {
        let { start, end } = getInclusive(spec, block);
        startSide = (start ? block ? -3e8 : -1 : 5e8) - 1;
        endSide = (end ? block ? 2e8 : 1 : -6e8) + 1;
      }
      return new PointDecoration(spec, startSide, endSide, block, spec.widget || null, true);
    }
    /**
    Create a line decoration, which can add DOM attributes to the
    line starting at the given position.
    */
    static line(spec) {
      return new LineDecoration(spec);
    }
    /**
    Build a [`DecorationSet`](https://codemirror.net/6/docs/ref/#view.DecorationSet) from the given
    decorated range or ranges. If the ranges aren't already sorted,
    pass `true` for `sort` to make the library sort them for you.
    */
    static set(of, sort = false) {
      return RangeSet.of(of, sort);
    }
    /**
    @internal
    */
    hasHeight() {
      return this.widget ? this.widget.estimatedHeight > -1 : false;
    }
  };
  Decoration.none = RangeSet.empty;
  var MarkDecoration = class _MarkDecoration extends Decoration {
    constructor(spec) {
      let { start, end } = getInclusive(spec);
      super(start ? -1 : 5e8, end ? 1 : -6e8, null, spec);
      this.tagName = spec.tagName || "span";
      this.attrs = spec.class && spec.attributes ? combineAttrs(spec.attributes, { class: spec.class }) : spec.class ? { class: spec.class } : spec.attributes || noAttrs;
    }
    eq(other) {
      return this == other || other instanceof _MarkDecoration && this.tagName == other.tagName && attrsEq(this.attrs, other.attrs);
    }
    range(from, to = from) {
      if (from >= to)
        throw new RangeError("Mark decorations may not be empty");
      return super.range(from, to);
    }
  };
  MarkDecoration.prototype.point = false;
  var LineDecoration = class _LineDecoration extends Decoration {
    constructor(spec) {
      super(-2e8, -2e8, null, spec);
    }
    eq(other) {
      return other instanceof _LineDecoration && this.spec.class == other.spec.class && attrsEq(this.spec.attributes, other.spec.attributes);
    }
    range(from, to = from) {
      if (to != from)
        throw new RangeError("Line decoration ranges must be zero-length");
      return super.range(from, to);
    }
  };
  LineDecoration.prototype.mapMode = MapMode.TrackBefore;
  LineDecoration.prototype.point = true;
  var PointDecoration = class _PointDecoration extends Decoration {
    constructor(spec, startSide, endSide, block, widget, isReplace) {
      super(startSide, endSide, widget, spec);
      this.block = block;
      this.isReplace = isReplace;
      this.mapMode = !block ? MapMode.TrackDel : startSide <= 0 ? MapMode.TrackBefore : MapMode.TrackAfter;
    }
    // Only relevant when this.block == true
    get type() {
      return this.startSide != this.endSide ? BlockType.WidgetRange : this.startSide <= 0 ? BlockType.WidgetBefore : BlockType.WidgetAfter;
    }
    get heightRelevant() {
      return this.block || !!this.widget && (this.widget.estimatedHeight >= 5 || this.widget.lineBreaks > 0);
    }
    eq(other) {
      return other instanceof _PointDecoration && widgetsEq(this.widget, other.widget) && this.block == other.block && this.startSide == other.startSide && this.endSide == other.endSide;
    }
    range(from, to = from) {
      if (this.isReplace && (from > to || from == to && this.startSide > 0 && this.endSide <= 0))
        throw new RangeError("Invalid range for replacement decoration");
      if (!this.isReplace && to != from)
        throw new RangeError("Widget decorations can only have zero-length ranges");
      return super.range(from, to);
    }
  };
  PointDecoration.prototype.point = true;
  function getInclusive(spec, block = false) {
    let { inclusiveStart: start, inclusiveEnd: end } = spec;
    if (start == null)
      start = spec.inclusive;
    if (end == null)
      end = spec.inclusive;
    return { start: start !== null && start !== void 0 ? start : block, end: end !== null && end !== void 0 ? end : block };
  }
  function widgetsEq(a, b) {
    return a == b || !!(a && b && a.compare(b));
  }
  function addRange(from, to, ranges, margin = 0) {
    let last2 = ranges.length - 1;
    if (last2 >= 0 && ranges[last2] + margin >= from)
      ranges[last2] = Math.max(ranges[last2], to);
    else
      ranges.push(from, to);
  }
  var BlockWrapper = class _BlockWrapper extends RangeValue {
    constructor(tagName, attributes, rank) {
      super();
      this.tagName = tagName;
      this.attributes = attributes;
      this.rank = rank;
    }
    eq(other) {
      return other == this || other instanceof _BlockWrapper && this.tagName == other.tagName && attrsEq(this.attributes, other.attributes);
    }
    /**
    Create a block wrapper object with the given tag name and
    attributes.
    */
    static create(spec) {
      return new _BlockWrapper(spec.tagName, spec.attributes || noAttrs, spec.rank == null ? 50 : Math.max(0, Math.min(spec.rank, 100)));
    }
    /**
    Create a range set from the given block wrapper ranges.
    */
    static set(of, sort = false) {
      return RangeSet.of(of, sort);
    }
  };
  BlockWrapper.prototype.startSide = BlockWrapper.prototype.endSide = -1;
  var isElt = (node) => node.nodeType == 1;
  var isText = (node) => node.nodeType == 3;
  function getSelection(root) {
    let target;
    if (root.nodeType == 11) {
      target = root.getSelection ? root : root.ownerDocument;
    } else {
      target = root;
    }
    return target.getSelection();
  }
  function contains(dom, node) {
    return node ? dom == node || dom.contains(node.nodeType != 1 ? node.parentNode : node) : false;
  }
  function hasSelection(dom, selection) {
    if (!selection.anchorNode)
      return false;
    try {
      return contains(dom, selection.anchorNode);
    } catch (_) {
      return false;
    }
  }
  function clientRectsFor(dom) {
    if (isText(dom))
      return textRange(dom, 0, dom.nodeValue.length).getClientRects();
    else if (isElt(dom))
      return dom.getClientRects();
    else
      return [];
  }
  function isEquivalentPosition(node, off, targetNode, targetOff) {
    return targetNode ? scanFor(node, off, targetNode, targetOff, -1) || scanFor(node, off, targetNode, targetOff, 1) : false;
  }
  function domIndex(node) {
    for (var index = 0; ; index++) {
      node = node.previousSibling;
      if (!node)
        return index;
    }
  }
  function isBlockElement(node) {
    return isElt(node) && /^(DIV|P|LI|UL|OL|BLOCKQUOTE|DD|DT|H\d|SECTION|PRE)$/.test(node.nodeName);
  }
  function scanFor(node, off, targetNode, targetOff, dir) {
    for (; ; ) {
      if (node == targetNode && off == targetOff)
        return true;
      if (off == (dir < 0 ? 0 : maxOffset(node))) {
        if (node.nodeName == "DIV")
          return false;
        let parent = node.parentNode;
        if (!parent || !isElt(parent))
          return false;
        off = domIndex(node) + (dir < 0 ? 0 : 1);
        node = parent;
      } else if (isElt(node)) {
        node = node.childNodes[off + (dir < 0 ? -1 : 0)];
        if (isElt(node) && (node.nodeName == "IMG" || node.nodeName == "BR" || node.contentEditable == "false"))
          return false;
        off = dir < 0 ? maxOffset(node) : 0;
      } else {
        return false;
      }
    }
  }
  function maxOffset(node) {
    return isText(node) ? node.nodeValue.length : node.childNodes.length;
  }
  function flattenRect(rect, toLeft) {
    let { left, right } = rect;
    if (left == right)
      return rect;
    let x = toLeft ? left : right;
    return { left: x, right: x, top: rect.top, bottom: rect.bottom };
  }
  function windowRect(win) {
    let vp = win.visualViewport;
    if (vp)
      return {
        left: 0,
        right: vp.width,
        top: 0,
        bottom: vp.height
      };
    return {
      left: 0,
      right: win.innerWidth,
      top: 0,
      bottom: win.innerHeight
    };
  }
  function getScale(elt, rect) {
    let scaleX = rect.width / elt.offsetWidth;
    let scaleY = rect.height / elt.offsetHeight;
    if (scaleX > 0.995 && scaleX < 1.005 || !isFinite(scaleX) || Math.abs(rect.width - elt.offsetWidth) < 1)
      scaleX = 1;
    if (scaleY > 0.995 && scaleY < 1.005 || !isFinite(scaleY) || Math.abs(rect.height - elt.offsetHeight) < 1)
      scaleY = 1;
    return { scaleX, scaleY };
  }
  function scrollRectIntoView(dom, rect, side, x, y, xMargin, yMargin, ltr) {
    let doc2 = dom.ownerDocument, win = doc2.defaultView || window;
    for (let cur2 = dom, stop = false; cur2 && !stop; ) {
      if (isElt(cur2)) {
        let bounding, top2 = cur2 == doc2.body;
        let scaleX = 1, scaleY = 1, xScroll = true, yScroll = true;
        if (top2) {
          bounding = windowRect(win);
        } else {
          let style = getComputedStyle(cur2);
          if (/^(fixed|sticky)$/.test(style.position))
            stop = true;
          if (cur2.scrollHeight <= cur2.clientHeight || !/auto|scroll/.test(style.overflowY))
            yScroll = false;
          if (cur2.scrollWidth <= cur2.clientWidth || !/auto|scroll/.test(style.overflowX))
            xScroll = false;
          if (!xScroll && !yScroll) {
            cur2 = cur2.assignedSlot || cur2.parentNode;
            continue;
          }
          let rect2 = cur2.getBoundingClientRect();
          ({ scaleX, scaleY } = getScale(cur2, rect2));
          bounding = {
            left: rect2.left,
            right: rect2.left + cur2.clientWidth * scaleX,
            top: rect2.top,
            bottom: rect2.top + cur2.clientHeight * scaleY
          };
        }
        let moveX = 0, moveY = 0;
        if (!yScroll) ;
        else if (y == "nearest") {
          if (rect.top < bounding.top + yMargin) {
            moveY = rect.top - (bounding.top + yMargin);
            if (side > 0 && rect.bottom > bounding.bottom + moveY)
              moveY = rect.bottom - bounding.bottom + yMargin;
          } else if (rect.bottom > bounding.bottom - yMargin) {
            moveY = rect.bottom - bounding.bottom + yMargin;
            if (side < 0 && rect.top - moveY < bounding.top)
              moveY = rect.top - (bounding.top + yMargin);
          }
        } else {
          let rectHeight = rect.bottom - rect.top, boundingHeight = bounding.bottom - bounding.top;
          let targetTop = y == "center" && rectHeight <= boundingHeight ? rect.top + rectHeight / 2 - boundingHeight / 2 : y == "start" || y == "center" && side < 0 ? rect.top - yMargin : rect.bottom - boundingHeight + yMargin;
          moveY = targetTop - bounding.top;
        }
        if (!xScroll) ;
        else if (x == "nearest") {
          if (rect.left < bounding.left + xMargin) {
            moveX = rect.left - (bounding.left + xMargin);
            if (side > 0 && rect.right > bounding.right + moveX)
              moveX = rect.right - bounding.right + xMargin;
          } else if (rect.right > bounding.right - xMargin) {
            moveX = rect.right - bounding.right + xMargin;
            if (side < 0 && rect.left < bounding.left + moveX)
              moveX = rect.left - (bounding.left + xMargin);
          }
        } else {
          let targetLeft = x == "center" ? rect.left + (rect.right - rect.left) / 2 - (bounding.right - bounding.left) / 2 : x == "start" == ltr ? rect.left - xMargin : rect.right - (bounding.right - bounding.left) + xMargin;
          moveX = targetLeft - bounding.left;
        }
        if (moveX || moveY) {
          if (top2) {
            win.scrollBy(moveX, moveY);
          } else {
            let movedX = 0, movedY = 0;
            if (moveY) {
              let start = cur2.scrollTop;
              cur2.scrollTop += moveY / scaleY;
              movedY = (cur2.scrollTop - start) * scaleY;
            }
            if (moveX) {
              let start = cur2.scrollLeft;
              cur2.scrollLeft += moveX / scaleX;
              movedX = (cur2.scrollLeft - start) * scaleX;
            }
            rect = {
              left: rect.left - movedX,
              top: rect.top - movedY,
              right: rect.right - movedX,
              bottom: rect.bottom - movedY
            };
            if (movedX && Math.abs(movedX - moveX) < 1)
              x = "nearest";
            if (movedY && Math.abs(movedY - moveY) < 1)
              y = "nearest";
          }
        }
        if (top2)
          break;
        if (rect.top < bounding.top || rect.bottom > bounding.bottom || rect.left < bounding.left || rect.right > bounding.right)
          rect = {
            left: Math.max(rect.left, bounding.left),
            right: Math.min(rect.right, bounding.right),
            top: Math.max(rect.top, bounding.top),
            bottom: Math.min(rect.bottom, bounding.bottom)
          };
        cur2 = cur2.assignedSlot || cur2.parentNode;
      } else if (cur2.nodeType == 11) {
        cur2 = cur2.host;
      } else {
        break;
      }
    }
  }
  function scrollableParents(dom, getX = true) {
    let doc2 = dom.ownerDocument, x = null, y = null;
    for (let cur2 = dom.parentNode; cur2; ) {
      if (cur2 == doc2.body || (!getX || x) && y) {
        break;
      } else if (isElt(cur2)) {
        if (!y && cur2.scrollHeight > cur2.clientHeight && /scroll|auto/.test(getComputedStyle(cur2).overflowY))
          y = cur2;
        if (getX && !x && cur2.scrollWidth > cur2.clientWidth && /scroll|auto/.test(getComputedStyle(cur2).overflowX))
          x = cur2;
        cur2 = cur2.assignedSlot || cur2.parentNode;
      } else if (cur2.nodeType == 11) {
        cur2 = cur2.host;
      } else {
        break;
      }
    }
    return { x, y };
  }
  var DOMSelectionState = class {
    constructor() {
      this.anchorNode = null;
      this.anchorOffset = 0;
      this.focusNode = null;
      this.focusOffset = 0;
    }
    eq(domSel) {
      return this.anchorNode == domSel.anchorNode && this.anchorOffset == domSel.anchorOffset && this.focusNode == domSel.focusNode && this.focusOffset == domSel.focusOffset;
    }
    setRange(range) {
      let { anchorNode, focusNode } = range;
      this.set(anchorNode, Math.min(range.anchorOffset, anchorNode ? maxOffset(anchorNode) : 0), focusNode, Math.min(range.focusOffset, focusNode ? maxOffset(focusNode) : 0));
    }
    set(anchorNode, anchorOffset, focusNode, focusOffset) {
      this.anchorNode = anchorNode;
      this.anchorOffset = anchorOffset;
      this.focusNode = focusNode;
      this.focusOffset = focusOffset;
    }
  };
  function getScrollStack(target) {
    let stack = [];
    for (let cur2 = target; cur2; cur2 = cur2.nodeType == 11 ? cur2.host : cur2.parentNode) {
      if (isElt(cur2))
        stack.push({ node: cur2, left: cur2.scrollLeft, top: cur2.scrollTop });
    }
    return stack;
  }
  function restoreScrollStack(stack, vert = true) {
    for (let { node, left, top: top2 } of stack) {
      if (vert && node.scrollTop != top2)
        node.scrollTop = top2;
      if (node.scrollLeft != left)
        node.scrollLeft = left;
    }
  }
  var preventScrollSupported = null;
  if (browser.safari && browser.safari_version >= 26)
    preventScrollSupported = false;
  function focusPreventScroll(dom) {
    if (dom.setActive)
      return dom.setActive();
    if (preventScrollSupported)
      return dom.focus(preventScrollSupported);
    let stack = getScrollStack(dom);
    dom.focus(preventScrollSupported == null ? {
      get preventScroll() {
        preventScrollSupported = { preventScroll: true };
        return true;
      }
    } : void 0);
    if (!preventScrollSupported) {
      preventScrollSupported = false;
      restoreScrollStack(stack);
    }
  }
  var scratchRange;
  function textRange(node, from, to = from) {
    let range = scratchRange || (scratchRange = document.createRange());
    range.setEnd(node, to);
    range.setStart(node, from);
    return range;
  }
  function dispatchKey(elt, name2, code2, mods) {
    let options = { key: name2, code: name2, keyCode: code2, which: code2, cancelable: true };
    if (mods)
      ({ altKey: options.altKey, ctrlKey: options.ctrlKey, shiftKey: options.shiftKey, metaKey: options.metaKey } = mods);
    let down = new KeyboardEvent("keydown", options);
    down.synthetic = true;
    elt.dispatchEvent(down);
    let up = new KeyboardEvent("keyup", options);
    up.synthetic = true;
    elt.dispatchEvent(up);
    return down.defaultPrevented || up.defaultPrevented;
  }
  function getRoot(node) {
    while (node) {
      if (node && (node.nodeType == 9 || node.nodeType == 11 && node.host))
        return node;
      node = node.assignedSlot || node.parentNode;
    }
    return null;
  }
  function atElementStart(doc2, selection) {
    let node = selection.focusNode, offset = selection.focusOffset;
    if (!node || selection.anchorNode != node || selection.anchorOffset != offset)
      return false;
    offset = Math.min(offset, maxOffset(node));
    for (; ; ) {
      if (offset) {
        if (!isElt(node))
          return false;
        let prev = node.childNodes[offset - 1];
        if (prev.contentEditable == "false")
          offset--;
        else {
          node = prev;
          offset = maxOffset(node);
        }
      } else if (node == doc2) {
        return true;
      } else {
        offset = domIndex(node);
        node = node.parentNode;
      }
    }
  }
  function isScrolledToBottom(elt) {
    if (elt instanceof Window)
      return elt.pageYOffset > Math.max(0, elt.document.documentElement.scrollHeight - elt.innerHeight - 4);
    return elt.scrollTop > Math.max(1, elt.scrollHeight - elt.clientHeight - 4);
  }
  function textNodeBefore(startNode, startOffset) {
    for (let node = startNode, offset = startOffset; ; ) {
      if (isText(node) && offset > 0) {
        return { node, offset };
      } else if (isElt(node) && offset > 0) {
        if (node.contentEditable == "false")
          return null;
        node = node.childNodes[offset - 1];
        offset = maxOffset(node);
      } else if (node.parentNode && !isBlockElement(node)) {
        offset = domIndex(node);
        node = node.parentNode;
      } else {
        return null;
      }
    }
  }
  function textNodeAfter(startNode, startOffset) {
    for (let node = startNode, offset = startOffset; ; ) {
      if (isText(node) && offset < node.nodeValue.length) {
        return { node, offset };
      } else if (isElt(node) && offset < node.childNodes.length) {
        if (node.contentEditable == "false")
          return null;
        node = node.childNodes[offset];
        offset = 0;
      } else if (node.parentNode && !isBlockElement(node)) {
        offset = domIndex(node) + 1;
        node = node.parentNode;
      } else {
        return null;
      }
    }
  }
  var DOMPos = class _DOMPos {
    constructor(node, offset, precise = true) {
      this.node = node;
      this.offset = offset;
      this.precise = precise;
    }
    static before(dom, precise) {
      return new _DOMPos(dom.parentNode, domIndex(dom), precise);
    }
    static after(dom, precise) {
      return new _DOMPos(dom.parentNode, domIndex(dom) + 1, precise);
    }
  };
  var Direction = /* @__PURE__ */ (function(Direction2) {
    Direction2[Direction2["LTR"] = 0] = "LTR";
    Direction2[Direction2["RTL"] = 1] = "RTL";
    return Direction2;
  })(Direction || (Direction = {}));
  var LTR = Direction.LTR;
  var RTL = Direction.RTL;
  function dec(str) {
    let result = [];
    for (let i2 = 0; i2 < str.length; i2++)
      result.push(1 << +str[i2]);
    return result;
  }
  var LowTypes = /* @__PURE__ */ dec("88888888888888888888888888888888888666888888787833333333337888888000000000000000000000000008888880000000000000000000000000088888888888888888888888888888888888887866668888088888663380888308888800000000000000000000000800000000000000000000000000000008");
  var ArabicTypes = /* @__PURE__ */ dec("4444448826627288999999999992222222222222222222222222222222222222222222222229999999999999999999994444444444644222822222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222999999949999999229989999223333333333");
  var Brackets = /* @__PURE__ */ Object.create(null);
  var BracketStack = [];
  for (let p of ["()", "[]", "{}"]) {
    let l = /* @__PURE__ */ p.charCodeAt(0), r = /* @__PURE__ */ p.charCodeAt(1);
    Brackets[l] = r;
    Brackets[r] = -l;
  }
  function charType(ch) {
    return ch <= 247 ? LowTypes[ch] : 1424 <= ch && ch <= 1524 ? 2 : 1536 <= ch && ch <= 1785 ? ArabicTypes[ch - 1536] : 1774 <= ch && ch <= 2220 ? 4 : 8192 <= ch && ch <= 8204 ? 256 : 64336 <= ch && ch <= 65023 ? 4 : 1;
  }
  var BidiRE = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac\ufb50-\ufdff]/;
  var BidiSpan = class {
    /**
    The direction of this span.
    */
    get dir() {
      return this.level % 2 ? RTL : LTR;
    }
    /**
    @internal
    */
    constructor(from, to, level) {
      this.from = from;
      this.to = to;
      this.level = level;
    }
    /**
    @internal
    */
    side(end, dir) {
      return this.dir == dir == end ? this.to : this.from;
    }
    /**
    @internal
    */
    forward(forward, dir) {
      return forward == (this.dir == dir);
    }
    /**
    @internal
    */
    static find(order, index, level, assoc) {
      let maybe = -1;
      for (let i2 = 0; i2 < order.length; i2++) {
        let span = order[i2];
        if (span.from <= index && span.to >= index) {
          if (span.level == level)
            return i2;
          if (maybe < 0 || (assoc != 0 ? assoc < 0 ? span.from < index : span.to > index : order[maybe].level > span.level))
            maybe = i2;
        }
      }
      if (maybe < 0)
        throw new RangeError("Index out of range");
      return maybe;
    }
  };
  function isolatesEq(a, b) {
    if (a.length != b.length)
      return false;
    for (let i2 = 0; i2 < a.length; i2++) {
      let iA = a[i2], iB = b[i2];
      if (iA.from != iB.from || iA.to != iB.to || iA.direction != iB.direction || !isolatesEq(iA.inner, iB.inner))
        return false;
    }
    return true;
  }
  var types = [];
  function computeCharTypes(line, rFrom, rTo, isolates, outerType) {
    for (let iI = 0; iI <= isolates.length; iI++) {
      let from = iI ? isolates[iI - 1].to : rFrom, to = iI < isolates.length ? isolates[iI].from : rTo;
      let prevType = iI ? 256 : outerType;
      for (let i2 = from, prev = prevType, prevStrong = prevType; i2 < to; i2++) {
        let type = charType(line.charCodeAt(i2));
        if (type == 512)
          type = prev;
        else if (type == 8 && prevStrong == 4)
          type = 16;
        types[i2] = type == 4 ? 2 : type;
        if (type & 7)
          prevStrong = type;
        prev = type;
      }
      for (let i2 = from, prev = prevType, prevStrong = prevType; i2 < to; i2++) {
        let type = types[i2];
        if (type == 128) {
          if (i2 < to - 1 && prev == types[i2 + 1] && prev & 24)
            type = types[i2] = prev;
          else
            types[i2] = 256;
        } else if (type == 64) {
          let end = i2 + 1;
          while (end < to && types[end] == 64)
            end++;
          let replace2 = i2 && prev == 8 || end < rTo && types[end] == 8 ? prevStrong == 1 ? 1 : 8 : 256;
          for (let j = i2; j < end; j++)
            types[j] = replace2;
          i2 = end - 1;
        } else if (type == 8 && prevStrong == 1) {
          types[i2] = 1;
        }
        prev = type;
        if (type & 7)
          prevStrong = type;
      }
    }
  }
  function processBracketPairs(line, rFrom, rTo, isolates, outerType) {
    let oppositeType = outerType == 1 ? 2 : 1;
    for (let iI = 0, sI = 0, context = 0; iI <= isolates.length; iI++) {
      let from = iI ? isolates[iI - 1].to : rFrom, to = iI < isolates.length ? isolates[iI].from : rTo;
      for (let i2 = from, ch, br, type; i2 < to; i2++) {
        if (br = Brackets[ch = line.charCodeAt(i2)]) {
          if (br < 0) {
            for (let sJ = sI - 3; sJ >= 0; sJ -= 3) {
              if (BracketStack[sJ + 1] == -br) {
                let flags = BracketStack[sJ + 2];
                let type2 = flags & 2 ? outerType : !(flags & 4) ? 0 : flags & 1 ? oppositeType : outerType;
                if (type2)
                  types[i2] = types[BracketStack[sJ]] = type2;
                sI = sJ;
                break;
              }
            }
          } else if (BracketStack.length == 189) {
            break;
          } else {
            BracketStack[sI++] = i2;
            BracketStack[sI++] = ch;
            BracketStack[sI++] = context;
          }
        } else if ((type = types[i2]) == 2 || type == 1) {
          let embed = type == outerType;
          context = embed ? 0 : 1;
          for (let sJ = sI - 3; sJ >= 0; sJ -= 3) {
            let cur2 = BracketStack[sJ + 2];
            if (cur2 & 2)
              break;
            if (embed) {
              BracketStack[sJ + 2] |= 2;
            } else {
              if (cur2 & 4)
                break;
              BracketStack[sJ + 2] |= 4;
            }
          }
        }
      }
    }
  }
  function processNeutrals(rFrom, rTo, isolates, outerType) {
    for (let iI = 0, prev = outerType; iI <= isolates.length; iI++) {
      let from = iI ? isolates[iI - 1].to : rFrom, to = iI < isolates.length ? isolates[iI].from : rTo;
      for (let i2 = from; i2 < to; ) {
        let type = types[i2];
        if (type == 256) {
          let end = i2 + 1;
          for (; ; ) {
            if (end == to) {
              if (iI == isolates.length)
                break;
              end = isolates[iI++].to;
              to = iI < isolates.length ? isolates[iI].from : rTo;
            } else if (types[end] == 256) {
              end++;
            } else {
              break;
            }
          }
          let beforeL = prev == 1;
          let afterL = (end < rTo ? types[end] : outerType) == 1;
          let replace2 = beforeL == afterL ? beforeL ? 1 : 2 : outerType;
          for (let j = end, jI = iI, fromJ = jI ? isolates[jI - 1].to : rFrom; j > i2; ) {
            if (j == fromJ) {
              j = isolates[--jI].from;
              fromJ = jI ? isolates[jI - 1].to : rFrom;
            }
            types[--j] = replace2;
          }
          i2 = end;
        } else {
          prev = type;
          i2++;
        }
      }
    }
  }
  function emitSpans(line, from, to, level, baseLevel, isolates, order) {
    let ourType = level % 2 ? 2 : 1;
    if (level % 2 == baseLevel % 2) {
      for (let iCh = from, iI = 0; iCh < to; ) {
        let sameDir = true, isNum = false;
        if (iI == isolates.length || iCh < isolates[iI].from) {
          let next = types[iCh];
          if (next != ourType) {
            sameDir = false;
            isNum = next == 16;
          }
        }
        let recurse = !sameDir && ourType == 1 ? [] : null;
        let localLevel = sameDir ? level : level + 1;
        let iScan = iCh;
        run: for (; ; ) {
          if (iI < isolates.length && iScan == isolates[iI].from) {
            if (isNum)
              break run;
            let iso = isolates[iI];
            if (!sameDir)
              for (let upto = iso.to, jI = iI + 1; ; ) {
                if (upto == to)
                  break run;
                if (jI < isolates.length && isolates[jI].from == upto)
                  upto = isolates[jI++].to;
                else if (types[upto] == ourType)
                  break run;
                else
                  break;
              }
            iI++;
            if (recurse) {
              recurse.push(iso);
            } else {
              if (iso.from > iCh)
                order.push(new BidiSpan(iCh, iso.from, localLevel));
              let dirSwap = iso.direction == LTR != !(localLevel % 2);
              computeSectionOrder(line, dirSwap ? level + 1 : level, baseLevel, iso.inner, iso.from, iso.to, order);
              iCh = iso.to;
            }
            iScan = iso.to;
          } else if (iScan == to || (sameDir ? types[iScan] != ourType : types[iScan] == ourType)) {
            break;
          } else {
            iScan++;
          }
        }
        if (recurse)
          emitSpans(line, iCh, iScan, level + 1, baseLevel, recurse, order);
        else if (iCh < iScan)
          order.push(new BidiSpan(iCh, iScan, localLevel));
        iCh = iScan;
      }
    } else {
      for (let iCh = to, iI = isolates.length; iCh > from; ) {
        let sameDir = true, isNum = false;
        if (!iI || iCh > isolates[iI - 1].to) {
          let next = types[iCh - 1];
          if (next != ourType) {
            sameDir = false;
            isNum = next == 16;
          }
        }
        let recurse = !sameDir && ourType == 1 ? [] : null;
        let localLevel = sameDir ? level : level + 1;
        let iScan = iCh;
        run: for (; ; ) {
          if (iI && iScan == isolates[iI - 1].to) {
            if (isNum)
              break run;
            let iso = isolates[--iI];
            if (!sameDir)
              for (let upto = iso.from, jI = iI; ; ) {
                if (upto == from)
                  break run;
                if (jI && isolates[jI - 1].to == upto)
                  upto = isolates[--jI].from;
                else if (types[upto - 1] == ourType)
                  break run;
                else
                  break;
              }
            if (recurse) {
              recurse.push(iso);
            } else {
              if (iso.to < iCh)
                order.push(new BidiSpan(iso.to, iCh, localLevel));
              let dirSwap = iso.direction == LTR != !(localLevel % 2);
              computeSectionOrder(line, dirSwap ? level + 1 : level, baseLevel, iso.inner, iso.from, iso.to, order);
              iCh = iso.from;
            }
            iScan = iso.from;
          } else if (iScan == from || (sameDir ? types[iScan - 1] != ourType : types[iScan - 1] == ourType)) {
            break;
          } else {
            iScan--;
          }
        }
        if (recurse)
          emitSpans(line, iScan, iCh, level + 1, baseLevel, recurse, order);
        else if (iScan < iCh)
          order.push(new BidiSpan(iScan, iCh, localLevel));
        iCh = iScan;
      }
    }
  }
  function computeSectionOrder(line, level, baseLevel, isolates, from, to, order) {
    let outerType = level % 2 ? 2 : 1;
    computeCharTypes(line, from, to, isolates, outerType);
    processBracketPairs(line, from, to, isolates, outerType);
    processNeutrals(from, to, isolates, outerType);
    emitSpans(line, from, to, level, baseLevel, isolates, order);
  }
  function computeOrder(line, direction, isolates) {
    if (!line)
      return [new BidiSpan(0, 0, direction == RTL ? 1 : 0)];
    if (direction == LTR && !isolates.length && !BidiRE.test(line))
      return trivialOrder(line.length);
    if (isolates.length)
      while (line.length > types.length)
        types[types.length] = 256;
    let order = [], level = direction == LTR ? 0 : 1;
    computeSectionOrder(line, level, level, isolates, 0, line.length, order);
    return order;
  }
  function trivialOrder(length) {
    return [new BidiSpan(0, length, 0)];
  }
  var movedOver = "";
  function moveVisually(line, order, dir, start, forward) {
    var _a2;
    if (!line.length)
      return null;
    let startIndex = start.head - line.from, spanI;
    if (start.head == line.from && start.assoc < 0) {
      if (!forward)
        return null;
      startIndex = order[spanI = 0].side(false, dir);
    } else if (start.head == line.to && start.assoc > 0) {
      if (forward)
        return null;
      startIndex = order[spanI = order.length - 1].side(true, dir);
    } else {
      spanI = BidiSpan.find(order, startIndex, (_a2 = start.bidiLevel) !== null && _a2 !== void 0 ? _a2 : -1, start.assoc);
    }
    let span = order[spanI], spanEnd = span.side(forward, dir);
    if (startIndex == spanEnd) {
      let nextI = spanI += forward ? 1 : -1;
      if (nextI < 0 || nextI >= order.length)
        return null;
      span = order[spanI = nextI];
      startIndex = span.side(!forward, dir);
      spanEnd = span.side(forward, dir);
    }
    let nextIndex = findClusterBreak2(line.text, startIndex, span.forward(forward, dir));
    if (nextIndex < span.from || nextIndex > span.to)
      nextIndex = spanEnd;
    movedOver = line.text.slice(Math.min(startIndex, nextIndex), Math.max(startIndex, nextIndex));
    let nextSpan = spanI == (forward ? order.length - 1 : 0) ? null : order[spanI + (forward ? 1 : -1)];
    if (nextIndex == spanEnd) {
      if (!nextSpan)
        return forward ? EditorSelection.cursor(line.to, 1) : EditorSelection.cursor(line.from, -1);
      if (nextSpan.level + (forward ? 0 : 1) < span.level)
        return EditorSelection.cursor(nextSpan.side(!forward, dir) + line.from, nextSpan.forward(forward, dir) ? 1 : -1, nextSpan.level);
    }
    return EditorSelection.cursor(nextIndex + line.from, span.forward(forward, dir) ? -1 : 1, span.level);
  }
  function autoDirection(text, from, to) {
    for (let i2 = from; i2 < to; i2++) {
      let type = charType(text.charCodeAt(i2));
      if (type == 1)
        return LTR;
      if (type == 2 || type == 4)
        return RTL;
    }
  }
  var clickAddsSelectionRange = /* @__PURE__ */ Facet.define();
  var dragMovesSelection$1 = /* @__PURE__ */ Facet.define();
  var mouseSelectionStyle = /* @__PURE__ */ Facet.define();
  var exceptionSink = /* @__PURE__ */ Facet.define();
  var updateListener = /* @__PURE__ */ Facet.define();
  var inputHandler = /* @__PURE__ */ Facet.define();
  var focusChangeEffect = /* @__PURE__ */ Facet.define();
  var clipboardInputFilter = /* @__PURE__ */ Facet.define();
  var clipboardOutputFilter = /* @__PURE__ */ Facet.define();
  var perLineTextDirection = /* @__PURE__ */ Facet.define({
    combine: (values) => values.some((x) => x)
  });
  var nativeSelectionHidden = /* @__PURE__ */ Facet.define({
    combine: (values) => values.some((x) => x)
  });
  var scrollHandler = /* @__PURE__ */ Facet.define();
  var ScrollTarget = class _ScrollTarget {
    constructor(range, y, x, yMargin, xMargin, isSnapshot = false) {
      this.range = range;
      this.y = y;
      this.x = x;
      this.yMargin = yMargin;
      this.xMargin = xMargin;
      this.isSnapshot = isSnapshot;
    }
    map(changes) {
      return changes.empty ? this : new _ScrollTarget(this.range.map(changes), this.y, this.x, this.yMargin, this.xMargin, this.isSnapshot);
    }
    clip(state) {
      return this.range.to <= state.doc.length ? this : new _ScrollTarget(EditorSelection.cursor(state.doc.length), this.y, this.x, this.yMargin, this.xMargin, this.isSnapshot);
    }
  };
  var scrollIntoView = /* @__PURE__ */ StateEffect.define({ map: (t2, ch) => t2.map(ch) });
  var setEditContextFormatting = /* @__PURE__ */ StateEffect.define();
  function logException(state, exception, context) {
    let handler = state.facet(exceptionSink);
    if (handler.length)
      handler[0](exception);
    else if (window.onerror && window.onerror(String(exception), context, void 0, void 0, exception)) ;
    else if (context)
      console.error(context + ":", exception);
    else
      console.error(exception);
  }
  var editable = /* @__PURE__ */ Facet.define({ combine: (values) => values.length ? values[0] : true });
  var nextPluginID = 0;
  var viewPlugin = /* @__PURE__ */ Facet.define({
    combine(plugins) {
      return plugins.filter((p, i2) => {
        for (let j = 0; j < i2; j++)
          if (plugins[j].plugin == p.plugin)
            return false;
        return true;
      });
    }
  });
  var ViewPlugin = class _ViewPlugin {
    constructor(id, create, domEventHandlers, domEventObservers, buildExtensions) {
      this.id = id;
      this.create = create;
      this.domEventHandlers = domEventHandlers;
      this.domEventObservers = domEventObservers;
      this.baseExtensions = buildExtensions(this);
      this.extension = this.baseExtensions.concat(viewPlugin.of({ plugin: this, arg: void 0 }));
    }
    /**
    Create an extension for this plugin with the given argument.
    */
    of(arg) {
      return this.baseExtensions.concat(viewPlugin.of({ plugin: this, arg }));
    }
    /**
    Define a plugin from a constructor function that creates the
    plugin's value, given an editor view.
    */
    static define(create, spec) {
      const { eventHandlers, eventObservers, provide, decorations: deco } = spec || {};
      return new _ViewPlugin(nextPluginID++, create, eventHandlers, eventObservers, (plugin) => {
        let ext = [];
        if (deco)
          ext.push(decorations.of((view2) => {
            let pluginInst = view2.plugin(plugin);
            return pluginInst ? deco(pluginInst) : Decoration.none;
          }));
        if (provide)
          ext.push(provide(plugin));
        return ext;
      });
    }
    /**
    Create a plugin for a class whose constructor takes a single
    editor view as argument.
    */
    static fromClass(cls, spec) {
      return _ViewPlugin.define((view2, arg) => new cls(view2, arg), spec);
    }
  };
  var PluginInstance = class {
    constructor(spec) {
      this.spec = spec;
      this.mustUpdate = null;
      this.value = null;
    }
    get plugin() {
      return this.spec && this.spec.plugin;
    }
    update(view2) {
      if (!this.value) {
        if (this.spec) {
          try {
            this.value = this.spec.plugin.create(view2, this.spec.arg);
          } catch (e) {
            logException(view2.state, e, "CodeMirror plugin crashed");
            this.deactivate();
          }
        }
      } else if (this.mustUpdate) {
        let update = this.mustUpdate;
        this.mustUpdate = null;
        if (this.value.update) {
          try {
            this.value.update(update);
          } catch (e) {
            logException(update.state, e, "CodeMirror plugin crashed");
            if (this.value.destroy)
              try {
                this.value.destroy();
              } catch (_) {
              }
            this.deactivate();
          }
        }
      }
      return this;
    }
    destroy(view2) {
      var _a2;
      if ((_a2 = this.value) === null || _a2 === void 0 ? void 0 : _a2.destroy) {
        try {
          this.value.destroy();
        } catch (e) {
          logException(view2.state, e, "CodeMirror plugin crashed");
        }
      }
    }
    deactivate() {
      this.spec = this.value = null;
    }
  };
  var editorAttributes = /* @__PURE__ */ Facet.define();
  var contentAttributes = /* @__PURE__ */ Facet.define();
  var decorations = /* @__PURE__ */ Facet.define();
  var blockWrappers = /* @__PURE__ */ Facet.define();
  var outerDecorations = /* @__PURE__ */ Facet.define();
  var atomicRanges = /* @__PURE__ */ Facet.define();
  var bidiIsolatedRanges = /* @__PURE__ */ Facet.define();
  function getIsolatedRanges(view2, line) {
    let isolates = view2.state.facet(bidiIsolatedRanges);
    if (!isolates.length)
      return isolates;
    let sets = isolates.map((i2) => i2 instanceof Function ? i2(view2) : i2);
    let result = [];
    RangeSet.spans(sets, line.from, line.to, {
      point() {
      },
      span(fromDoc, toDoc, active, open) {
        let from = fromDoc - line.from, to = toDoc - line.from;
        let level = result;
        for (let i2 = active.length - 1; i2 >= 0; i2--, open--) {
          let direction = active[i2].spec.bidiIsolate, update;
          if (open > 0 && level.length && (update = level[level.length - 1]).to == from && update.direction == direction) {
            update.to = to;
            level = update.inner;
          } else {
            let add = { from, to, direction, inner: [] };
            level.push(add);
            level = add.inner;
          }
        }
      }
    });
    return resolveIsolates(line.text, result);
  }
  function resolveIsolates(text, isolates) {
    for (let i2 of isolates) {
      if (i2.direction == null) {
        for (let pos = i2.from, j = 0; pos < i2.to; j++) {
          let nextInner = j < i2.inner.length ? i2.inner[j] : null;
          let dir = autoDirection(text, pos, nextInner ? nextInner.from : i2.to);
          if (dir) {
            i2.direction = dir;
            break;
          }
          if (!nextInner)
            break;
          pos = nextInner.to;
        }
        if (i2.direction == null)
          i2.direction = Direction.LTR;
      }
      resolveIsolates(text, i2.inner);
    }
    return isolates;
  }
  var scrollMargins = /* @__PURE__ */ Facet.define();
  function getScrollMargins(view2) {
    let left = 0, right = 0, top2 = 0, bottom = 0;
    for (let source of view2.state.facet(scrollMargins)) {
      let m = source(view2);
      if (m) {
        if (m.left != null)
          left = Math.max(left, m.left);
        if (m.right != null)
          right = Math.max(right, m.right);
        if (m.top != null)
          top2 = Math.max(top2, m.top);
        if (m.bottom != null)
          bottom = Math.max(bottom, m.bottom);
      }
    }
    return { left, right, top: top2, bottom };
  }
  var styleModule = /* @__PURE__ */ Facet.define();
  var ChangedRange = class _ChangedRange {
    constructor(fromA, toA, fromB, toB) {
      this.fromA = fromA;
      this.toA = toA;
      this.fromB = fromB;
      this.toB = toB;
    }
    join(other) {
      return new _ChangedRange(Math.min(this.fromA, other.fromA), Math.max(this.toA, other.toA), Math.min(this.fromB, other.fromB), Math.max(this.toB, other.toB));
    }
    addToSet(set) {
      let i2 = set.length, me = this;
      for (; i2 > 0; i2--) {
        let range = set[i2 - 1];
        if (range.fromA > me.toA)
          continue;
        if (range.toA < me.fromA)
          break;
        me = me.join(range);
        set.splice(i2 - 1, 1);
      }
      set.splice(i2, 0, me);
      return set;
    }
    // Extend a set to cover all the content in `ranges`, which is a
    // flat array with each pair of numbers representing fromB/toB
    // positions. These pairs are generated in unchanged ranges, so the
    // offset between doc A and doc B is the same for their start and
    // end points.
    static extendWithRanges(diff, ranges) {
      if (ranges.length == 0)
        return diff;
      let result = [];
      for (let dI = 0, rI = 0, off = 0; ; ) {
        let nextD = dI < diff.length ? diff[dI].fromB : 1e9;
        let nextR = rI < ranges.length ? ranges[rI] : 1e9;
        let fromB = Math.min(nextD, nextR);
        if (fromB == 1e9)
          break;
        let fromA = fromB + off, toB = fromB, toA = fromA;
        for (; ; ) {
          if (rI < ranges.length && ranges[rI] <= toB) {
            let end = ranges[rI + 1];
            rI += 2;
            toB = Math.max(toB, end);
            for (let i2 = dI; i2 < diff.length && diff[i2].fromB <= toB; i2++)
              off = diff[i2].toA - diff[i2].toB;
            toA = Math.max(toA, end + off);
          } else if (dI < diff.length && diff[dI].fromB <= toB) {
            let next = diff[dI++];
            toB = Math.max(toB, next.toB);
            toA = Math.max(toA, next.toA);
            off = next.toA - next.toB;
          } else {
            break;
          }
        }
        result.push(new _ChangedRange(fromA, toA, fromB, toB));
      }
      return result;
    }
  };
  var ViewUpdate = class _ViewUpdate {
    constructor(view2, state, transactions) {
      this.view = view2;
      this.state = state;
      this.transactions = transactions;
      this.flags = 0;
      this.startState = view2.state;
      this.changes = ChangeSet.empty(this.startState.doc.length);
      for (let tr of transactions)
        this.changes = this.changes.compose(tr.changes);
      let changedRanges = [];
      this.changes.iterChangedRanges((fromA, toA, fromB, toB) => changedRanges.push(new ChangedRange(fromA, toA, fromB, toB)));
      this.changedRanges = changedRanges;
    }
    /**
    @internal
    */
    static create(view2, state, transactions) {
      return new _ViewUpdate(view2, state, transactions);
    }
    /**
    Tells you whether the [viewport](https://codemirror.net/6/docs/ref/#view.EditorView.viewport) or
    [visible ranges](https://codemirror.net/6/docs/ref/#view.EditorView.visibleRanges) changed in this
    update.
    */
    get viewportChanged() {
      return (this.flags & 4) > 0;
    }
    /**
    Returns true when
    [`viewportChanged`](https://codemirror.net/6/docs/ref/#view.ViewUpdate.viewportChanged) is true
    and the viewport change is not just the result of mapping it in
    response to document changes.
    */
    get viewportMoved() {
      return (this.flags & 8) > 0;
    }
    /**
    Indicates whether the height of a block element in the editor
    changed in this update.
    */
    get heightChanged() {
      return (this.flags & 2) > 0;
    }
    /**
    Returns true when the document was modified or the size of the
    editor, or elements within the editor, changed.
    */
    get geometryChanged() {
      return this.docChanged || (this.flags & (16 | 2)) > 0;
    }
    /**
    True when this update indicates a focus change.
    */
    get focusChanged() {
      return (this.flags & 1) > 0;
    }
    /**
    Whether the document changed in this update.
    */
    get docChanged() {
      return !this.changes.empty;
    }
    /**
    Whether the selection was explicitly set in this update.
    */
    get selectionSet() {
      return this.transactions.some((tr) => tr.selection);
    }
    /**
    @internal
    */
    get empty() {
      return this.flags == 0 && this.transactions.length == 0;
    }
  };
  var noChildren = [];
  var Tile = class {
    constructor(dom, length, flags = 0) {
      this.dom = dom;
      this.length = length;
      this.flags = flags;
      this.parent = null;
      dom.cmTile = this;
    }
    get breakAfter() {
      return this.flags & 1;
    }
    get children() {
      return noChildren;
    }
    isWidget() {
      return false;
    }
    get isHidden() {
      return false;
    }
    isComposite() {
      return false;
    }
    isLine() {
      return false;
    }
    isText() {
      return false;
    }
    isBlock() {
      return false;
    }
    get domAttrs() {
      return null;
    }
    sync(track) {
      this.flags |= 2;
      if (this.flags & 4) {
        this.flags &= -5;
        let attrs = this.domAttrs;
        if (attrs)
          setAttrs(this.dom, attrs);
      }
    }
    toString() {
      return this.constructor.name + (this.children.length ? `(${this.children})` : "") + (this.breakAfter ? "#" : "");
    }
    destroy() {
      this.parent = null;
    }
    setDOM(dom) {
      this.dom = dom;
      dom.cmTile = this;
    }
    get posAtStart() {
      return this.parent ? this.parent.posBefore(this) : 0;
    }
    get posAtEnd() {
      return this.posAtStart + this.length;
    }
    posBefore(tile, start = this.posAtStart) {
      let pos = start;
      for (let child of this.children) {
        if (child == tile)
          return pos;
        pos += child.length + child.breakAfter;
      }
      throw new RangeError("Invalid child in posBefore");
    }
    posAfter(tile) {
      return this.posBefore(tile) + tile.length;
    }
    covers(side) {
      return true;
    }
    coordsIn(pos, side, rtl) {
      return null;
    }
    domPosFor(off, side) {
      let index = domIndex(this.dom);
      let after = this.length ? off > 0 : side > 0;
      return new DOMPos(this.parent.dom, index + (after ? 1 : 0), off == 0 || off == this.length);
    }
    markDirty(attrs) {
      this.flags &= -3;
      if (attrs)
        this.flags |= 4;
      if (this.parent && this.parent.flags & 2)
        this.parent.markDirty(false);
    }
    get overrideDOMText() {
      return null;
    }
    get root() {
      for (let t2 = this; t2; t2 = t2.parent)
        if (t2 instanceof DocTile)
          return t2;
      return null;
    }
    static get(dom) {
      return dom.cmTile;
    }
  };
  var CompositeTile = class extends Tile {
    constructor(dom) {
      super(dom, 0);
      this._children = [];
    }
    isComposite() {
      return true;
    }
    get children() {
      return this._children;
    }
    get lastChild() {
      return this.children.length ? this.children[this.children.length - 1] : null;
    }
    append(child) {
      this.children.push(child);
      child.parent = this;
    }
    sync(track) {
      if (this.flags & 2)
        return;
      super.sync(track);
      let parent = this.dom, prev = null, next;
      let tracking = (track === null || track === void 0 ? void 0 : track.node) == parent ? track : null;
      let length = 0;
      for (let child of this.children) {
        child.sync(track);
        length += child.length + child.breakAfter;
        next = prev ? prev.nextSibling : parent.firstChild;
        if (tracking && next != child.dom)
          tracking.written = true;
        if (child.dom.parentNode == parent) {
          while (next && next != child.dom)
            next = rm$1(next);
        } else {
          parent.insertBefore(child.dom, next);
        }
        prev = child.dom;
      }
      next = prev ? prev.nextSibling : parent.firstChild;
      if (tracking && next)
        tracking.written = true;
      while (next)
        next = rm$1(next);
      this.length = length;
    }
  };
  function rm$1(dom) {
    let next = dom.nextSibling;
    dom.parentNode.removeChild(dom);
    return next;
  }
  var DocTile = class extends CompositeTile {
    constructor(view2, dom) {
      super(dom);
      this.view = view2;
    }
    owns(tile) {
      for (; tile; tile = tile.parent)
        if (tile == this)
          return true;
      return false;
    }
    isBlock() {
      return true;
    }
    nearest(dom) {
      for (; ; ) {
        if (!dom)
          return null;
        let tile = Tile.get(dom);
        if (tile && this.owns(tile))
          return tile;
        dom = dom.parentNode;
      }
    }
    blockTiles(f) {
      for (let stack = [], cur2 = this, i2 = 0, pos = 0; ; ) {
        if (i2 == cur2.children.length) {
          if (!stack.length)
            return;
          cur2 = cur2.parent;
          if (cur2.breakAfter)
            pos++;
          i2 = stack.pop();
        } else {
          let next = cur2.children[i2++];
          if (next instanceof BlockWrapperTile) {
            stack.push(i2);
            cur2 = next;
            i2 = 0;
          } else {
            let end = pos + next.length;
            let result = f(next, pos);
            if (result !== void 0)
              return result;
            pos = end + next.breakAfter;
          }
        }
      }
    }
    // Find the block at the given position. If side < -1, make sure to
    // stay before block widgets at that position, if side > 1, after
    // such widgets (used for selection drawing, which needs to be able
    // to get coordinates for positions that aren't valid cursor positions).
    resolveBlock(pos, side) {
      let before, beforeOff = -1, after, afterOff = -1;
      this.blockTiles((tile, off) => {
        let end = off + tile.length;
        if (pos >= off && pos <= end) {
          if (tile.isWidget() && side >= -1 && side <= 1) {
            if (tile.flags & 32)
              return true;
            if (tile.flags & 16)
              before = void 0;
          }
          if ((off < pos || pos == end && (side < -1 ? tile.length : tile.covers(1))) && (!before || !tile.isWidget() && before.isWidget())) {
            before = tile;
            beforeOff = pos - off;
          }
          if ((end > pos || pos == off && (side > 1 ? tile.length : tile.covers(-1))) && (!after || !tile.isWidget() && after.isWidget())) {
            after = tile;
            afterOff = pos - off;
          }
        }
      });
      if (!before && !after)
        throw new Error("No tile at position " + pos);
      return before && side < 0 || !after ? { tile: before, offset: beforeOff } : { tile: after, offset: afterOff };
    }
  };
  var BlockWrapperTile = class _BlockWrapperTile extends CompositeTile {
    constructor(dom, wrapper) {
      super(dom);
      this.wrapper = wrapper;
    }
    isBlock() {
      return true;
    }
    covers(side) {
      if (!this.children.length)
        return false;
      return side < 0 ? this.children[0].covers(-1) : this.lastChild.covers(1);
    }
    get domAttrs() {
      return this.wrapper.attributes;
    }
    static of(wrapper, dom) {
      let tile = new _BlockWrapperTile(dom || document.createElement(wrapper.tagName), wrapper);
      if (!dom)
        tile.flags |= 4;
      return tile;
    }
  };
  var LineTile = class _LineTile extends CompositeTile {
    constructor(dom, attrs) {
      super(dom);
      this.attrs = attrs;
    }
    isLine() {
      return true;
    }
    static start(attrs, dom, keepAttrs) {
      let line = new _LineTile(dom || document.createElement("div"), attrs);
      if (!dom || !keepAttrs)
        line.flags |= 4;
      return line;
    }
    get domAttrs() {
      return this.attrs;
    }
    // Find the tile associated with a given position in this line.
    // Side -2/2 is handled specially, in that it allows the position
    // returned to be before (-2) or after (2) widgets that would always
    // be after/before a cursor position.
    resolveInline(pos, side, forCoords = false) {
      let before = null, beforeOff = -1, after = null, afterOff = -1;
      function scan(tile, pos2) {
        for (let i2 = 0, off = 0; i2 < tile.children.length && off <= pos2; i2++) {
          let child = tile.children[i2], end = off + child.length;
          if (end >= pos2) {
            if (child.isComposite()) {
              scan(child, pos2 - off);
            } else if ((!after || forCoords && after.isHidden && (side > 0 && !(after.flags & 32) || forCoords && onSameLine(after, child))) && (end > pos2 || child.flags & 32 && side <= 1)) {
              after = child;
              afterOff = pos2 - off;
            } else if (off < pos2 || child.flags & 16 && !(forCoords && child.isHidden) && side >= -1) {
              before = child;
              beforeOff = pos2 - off;
            }
          }
          off = end;
        }
      }
      scan(this, pos);
      let target = (side < 0 ? before : after) || before || after;
      return target ? { tile: target, offset: target == before ? beforeOff : afterOff } : null;
    }
    coordsIn(pos, side, rtl) {
      let found = this.resolveInline(pos, side, true);
      if (!found)
        return fallbackRect(this);
      return found.tile.coordsIn(Math.max(0, found.offset), side, rtl);
    }
    domIn(pos, side) {
      let found = this.resolveInline(pos, side);
      if (found) {
        let { tile, offset } = found;
        if (this.dom.contains(tile.dom)) {
          if (tile.isText())
            return new DOMPos(tile.dom, Math.min(tile.dom.nodeValue.length, offset));
          return tile.domPosFor(offset, tile.flags & 16 ? 1 : tile.flags & 32 ? -1 : side);
        }
        let parent = found.tile.parent, saw = false;
        for (let ch of parent.children) {
          if (saw)
            return new DOMPos(ch.dom, 0);
          if (ch == found.tile) {
            saw = true;
          }
        }
      }
      return new DOMPos(this.dom, 0);
    }
  };
  function fallbackRect(tile) {
    let last2 = tile.dom.lastChild;
    if (!last2)
      return tile.dom.getBoundingClientRect();
    let rects = clientRectsFor(last2);
    return rects[rects.length - 1] || null;
  }
  function onSameLine(a, b) {
    let posA = a.coordsIn(0, 1), posB = b.coordsIn(0, 1);
    return posA && posB && posB.top < posA.bottom;
  }
  var MarkTile = class _MarkTile extends CompositeTile {
    constructor(dom, mark) {
      super(dom);
      this.mark = mark;
    }
    get domAttrs() {
      return this.mark.attrs;
    }
    static of(mark, dom) {
      let tile = new _MarkTile(dom || document.createElement(mark.tagName), mark);
      if (!dom)
        tile.flags |= 4;
      return tile;
    }
  };
  var TextTile = class _TextTile extends Tile {
    constructor(dom, text) {
      super(dom, text.length);
      this.text = text;
    }
    sync(track) {
      if (this.flags & 2)
        return;
      super.sync(track);
      if (this.dom.nodeValue != this.text) {
        if (track && track.node == this.dom)
          track.written = true;
        this.dom.nodeValue = this.text;
      }
    }
    isText() {
      return true;
    }
    toString() {
      return JSON.stringify(this.text);
    }
    coordsIn(pos, side, rtl) {
      let length = this.dom.nodeValue.length;
      if (pos > length)
        pos = length;
      let from = pos, to = pos, flatten2 = 0;
      if (pos == 0 && side < 0 || pos == length && side >= 0) {
        if (!(browser.chrome || browser.gecko)) {
          if (pos) {
            from--;
            flatten2 = 1;
          } else if (to < length) {
            to++;
            flatten2 = -1;
          }
        }
      } else {
        if (side < 0)
          from--;
        else if (to < length)
          to++;
      }
      let rects = textRange(this.dom, from, to).getClientRects();
      if (!rects.length)
        return null;
      let rect = rects[(flatten2 ? flatten2 < 0 : side >= 0) ? 0 : rects.length - 1];
      if (browser.safari && !flatten2 && rect.width == 0)
        rect = Array.prototype.find.call(rects, (r) => r.width) || rect;
      return rtl == null ? rect : flattenRect(rect, (flatten2 ? flatten2 > 0 : side < 0) == rtl);
    }
    static of(text, dom) {
      let tile = new _TextTile(dom || document.createTextNode(text), text);
      if (!dom)
        tile.flags |= 2;
      return tile;
    }
  };
  var WidgetTile = class _WidgetTile extends Tile {
    constructor(dom, length, widget, flags) {
      super(dom, length, flags);
      this.widget = widget;
    }
    isWidget() {
      return true;
    }
    get isHidden() {
      return this.widget.isHidden;
    }
    covers(side) {
      if (this.flags & 48)
        return false;
      return (this.flags & (side < 0 ? 64 : 128)) > 0;
    }
    coordsIn(pos, side) {
      return this.coordsInWidget(pos, side, false);
    }
    coordsInWidget(pos, side, block) {
      let custom = this.widget.coordsAt(this.dom, pos, side);
      if (custom)
        return custom;
      if (block) {
        return flattenRect(this.dom.getBoundingClientRect(), this.length ? pos == 0 : side <= 0);
      } else {
        let rects = this.dom.getClientRects(), rect = null;
        if (!rects.length)
          return null;
        let fromBack = this.flags & 16 ? true : this.flags & 32 ? false : pos > 0;
        for (let i2 = fromBack ? rects.length - 1 : 0; ; i2 += fromBack ? -1 : 1) {
          rect = rects[i2];
          if (pos > 0 ? i2 == 0 : i2 == rects.length - 1 || rect.top < rect.bottom)
            break;
        }
        return flattenRect(rect, !fromBack);
      }
    }
    get overrideDOMText() {
      if (!this.length)
        return Text.empty;
      let { root } = this;
      if (!root)
        return Text.empty;
      let start = this.posAtStart;
      return root.view.state.doc.slice(start, start + this.length);
    }
    destroy() {
      super.destroy();
      this.widget.destroy(this.dom);
    }
    static of(widget, view2, length, flags, dom) {
      if (!dom) {
        dom = widget.toDOM(view2);
        if (!widget.editable)
          dom.contentEditable = "false";
      }
      return new _WidgetTile(dom, length, widget, flags);
    }
  };
  var WidgetBufferTile = class extends Tile {
    constructor(flags) {
      let img = document.createElement("img");
      img.className = "cm-widgetBuffer";
      img.setAttribute("aria-hidden", "true");
      super(img, 0, flags);
    }
    get isHidden() {
      return true;
    }
    get overrideDOMText() {
      return Text.empty;
    }
    coordsIn(pos, side, rtl) {
      let rect = this.dom.getBoundingClientRect();
      return rtl == null ? rect : flattenRect(rect, side > 0 == rtl);
    }
  };
  var TilePointer = class {
    constructor(top2) {
      this.index = 0;
      this.beforeBreak = false;
      this.parents = [];
      this.tile = top2;
    }
    // Advance by the given distance. If side is -1, stop leaving or
    // entering tiles, or skipping zero-length tiles, once the distance
    // has been traversed. When side is 1, leave, enter, or skip
    // everything at the end position.
    advance(dist2, side, walker) {
      let { tile, index, beforeBreak, parents } = this;
      while (dist2 || side > 0) {
        if (!tile.isComposite()) {
          let len = tile.length;
          if (index < len && dist2) {
            let take = Math.min(dist2, len - index);
            if (walker)
              walker.skip(tile, index, index + take);
            dist2 -= take;
            index += take;
          }
          if (index == len) {
            beforeBreak = !!tile.breakAfter;
            ({ tile, index } = parents.pop());
            index++;
          } else if (!dist2) {
            break;
          }
        } else if (beforeBreak) {
          if (!dist2)
            break;
          if (walker)
            walker.break();
          dist2--;
          beforeBreak = false;
        } else if (index == tile.children.length) {
          if (!dist2 && !parents.length)
            break;
          if (walker)
            walker.leave(tile);
          beforeBreak = !!tile.breakAfter;
          ({ tile, index } = parents.pop());
          index++;
        } else {
          let next = tile.children[index], brk = next.breakAfter;
          if ((side > 0 ? next.length <= dist2 : next.length < dist2) && (!walker || walker.skip(next, 0, next.length) !== false || !next.isComposite)) {
            beforeBreak = !!brk;
            index++;
            dist2 -= next.length;
          } else {
            parents.push({ tile, index });
            tile = next;
            index = 0;
            if (walker && next.isComposite())
              walker.enter(next);
          }
        }
      }
      this.tile = tile;
      this.index = index;
      this.beforeBreak = beforeBreak;
      return this;
    }
    get root() {
      return this.parents.length ? this.parents[0].tile : this.tile;
    }
  };
  var OpenWrapper = class {
    constructor(from, to, wrapper, rank) {
      this.from = from;
      this.to = to;
      this.wrapper = wrapper;
      this.rank = rank;
    }
  };
  var TileBuilder = class {
    constructor(cache, root, blockWrappers2) {
      this.cache = cache;
      this.root = root;
      this.blockWrappers = blockWrappers2;
      this.curLine = null;
      this.lastBlock = null;
      this.afterWidget = null;
      this.pos = 0;
      this.wrappers = [];
      this.wrapperPos = 0;
    }
    addText(text, marks2, openStart, tile) {
      var _a2;
      this.flushBuffer();
      let parent = this.ensureMarks(marks2, openStart);
      let prev = parent.lastChild;
      if (prev && prev.isText() && !(prev.flags & 8) && prev.length + text.length < 512) {
        this.cache.reused.set(
          prev,
          2
          /* Reused.DOM */
        );
        let tile2 = parent.children[parent.children.length - 1] = new TextTile(prev.dom, prev.text + text);
        tile2.parent = parent;
      } else {
        parent.append(tile || TextTile.of(text, (_a2 = this.cache.find(TextTile)) === null || _a2 === void 0 ? void 0 : _a2.dom));
      }
      this.pos += text.length;
      this.afterWidget = null;
    }
    addComposition(composition, context) {
      let line = this.curLine;
      if (line.dom != context.line.dom) {
        line.setDOM(this.cache.reused.has(context.line) ? freeNode(context.line.dom) : context.line.dom);
        this.cache.reused.set(
          context.line,
          2
          /* Reused.DOM */
        );
      }
      let head = line;
      for (let i2 = context.marks.length - 1; i2 >= 0; i2--) {
        let mark = context.marks[i2];
        let last2 = head.lastChild;
        if (last2 instanceof MarkTile && last2.mark.eq(mark.mark)) {
          if (last2.dom != mark.dom)
            last2.setDOM(freeNode(mark.dom));
          head = last2;
        } else {
          let { dom } = mark;
          if (this.cache.reused.get(mark)) {
            let tile = Tile.get(mark.dom);
            if (tile)
              dom = freeNode(mark.dom);
          }
          let nw = MarkTile.of(mark.mark, dom);
          head.append(nw);
          head = nw;
        }
        this.cache.reused.set(
          mark,
          2
          /* Reused.DOM */
        );
      }
      let oldTile = Tile.get(composition.text);
      if (oldTile)
        this.cache.reused.set(
          oldTile,
          2
          /* Reused.DOM */
        );
      let text = new TextTile(composition.text, composition.text.nodeValue);
      text.flags |= 8;
      this.pos = composition.range.toB;
      head.append(text);
    }
    addInlineWidget(widget, marks2, openStart) {
      let noSpace = this.afterWidget && widget.flags & 48 && (this.afterWidget.flags & 48) == (widget.flags & 48);
      if (!noSpace)
        this.flushBuffer();
      let parent = this.ensureMarks(marks2, openStart);
      if (!noSpace && !(widget.flags & 16))
        parent.append(this.getBuffer(1));
      parent.append(widget);
      this.pos += widget.length;
      this.afterWidget = widget;
    }
    addMark(tile, marks2, openStart) {
      this.flushBuffer();
      let parent = this.ensureMarks(marks2, openStart);
      parent.append(tile);
      this.pos += tile.length;
      this.afterWidget = null;
    }
    addBlockWidget(widget) {
      this.getBlockPos().append(widget);
      this.pos += widget.length;
      this.lastBlock = widget;
      this.endLine();
    }
    continueWidget(length) {
      let widget = this.afterWidget || this.lastBlock;
      widget.length += length;
      this.pos += length;
    }
    addLineStart(attrs, dom) {
      var _a2;
      if (!attrs)
        attrs = lineBaseAttrs;
      let tile = LineTile.start(attrs, dom || ((_a2 = this.cache.find(LineTile)) === null || _a2 === void 0 ? void 0 : _a2.dom), !!dom);
      this.getBlockPos().append(this.lastBlock = this.curLine = tile);
    }
    addLine(tile) {
      this.getBlockPos().append(tile);
      this.pos += tile.length;
      this.lastBlock = tile;
      this.endLine();
    }
    addBreak() {
      this.lastBlock.flags |= 1;
      this.endLine();
      this.pos++;
    }
    addLineStartIfNotCovered(attrs) {
      if (!this.blockPosCovered())
        this.addLineStart(attrs);
    }
    ensureLine(attrs) {
      if (!this.curLine)
        this.addLineStart(attrs);
    }
    ensureMarks(marks2, openStart) {
      var _a2;
      let parent = this.curLine;
      for (let i2 = marks2.length - 1; i2 >= 0; i2--) {
        let mark = marks2[i2], last2;
        if (openStart > 0 && (last2 = parent.lastChild) && last2 instanceof MarkTile && last2.mark.eq(mark)) {
          parent = last2;
          openStart--;
        } else {
          let tile = MarkTile.of(mark, (_a2 = this.cache.find(MarkTile, (m) => m.mark.eq(mark))) === null || _a2 === void 0 ? void 0 : _a2.dom);
          parent.append(tile);
          parent = tile;
          openStart = 0;
        }
      }
      return parent;
    }
    endLine() {
      if (this.curLine) {
        this.flushBuffer();
        let last2 = this.curLine.lastChild;
        if (!last2 || !hasContent(this.curLine, false) || last2.dom.nodeName != "BR" && last2.isWidget() && !(browser.ios && hasContent(this.curLine, true)))
          this.curLine.append(this.cache.findWidget(
            BreakWidget,
            0,
            32
            /* TileFlag.After */
          ) || new WidgetTile(
            BreakWidget.toDOM(),
            0,
            BreakWidget,
            32
            /* TileFlag.After */
          ));
        this.curLine = this.afterWidget = null;
      }
    }
    updateBlockWrappers() {
      if (this.wrapperPos > this.pos + 1e4) {
        this.blockWrappers.goto(this.pos);
        this.wrappers.length = 0;
      }
      for (let i2 = this.wrappers.length - 1; i2 >= 0; i2--)
        if (this.wrappers[i2].to < this.pos)
          this.wrappers.splice(i2, 1);
      for (let cur2 = this.blockWrappers; cur2.value && cur2.from <= this.pos; cur2.next())
        if (cur2.to >= this.pos) {
          let rank = cur2.rank * 102 + cur2.value.rank;
          let wrap = new OpenWrapper(cur2.from, cur2.to, cur2.value, rank), i2 = this.wrappers.length;
          while (i2 > 0 && (this.wrappers[i2 - 1].rank - wrap.rank || this.wrappers[i2 - 1].to - wrap.to) < 0)
            i2--;
          this.wrappers.splice(i2, 0, wrap);
        }
      this.wrapperPos = this.pos;
    }
    getBlockPos() {
      var _a2;
      this.updateBlockWrappers();
      let parent = this.root;
      for (let wrap of this.wrappers) {
        let last2 = parent.lastChild;
        if (wrap.from < this.pos && last2 instanceof BlockWrapperTile && last2.wrapper.eq(wrap.wrapper)) {
          parent = last2;
        } else {
          let tile = BlockWrapperTile.of(wrap.wrapper, (_a2 = this.cache.find(BlockWrapperTile, (t2) => t2.wrapper.eq(wrap.wrapper))) === null || _a2 === void 0 ? void 0 : _a2.dom);
          parent.append(tile);
          parent = tile;
        }
      }
      return parent;
    }
    blockPosCovered() {
      let last2 = this.lastBlock;
      return last2 != null && !last2.breakAfter && (!last2.isWidget() || (last2.flags & (32 | 128)) > 0);
    }
    getBuffer(side) {
      let flags = 2 | (side < 0 ? 16 : 32);
      let found = this.cache.find(
        WidgetBufferTile,
        void 0,
        1
        /* Reused.Full */
      );
      if (found)
        found.flags = flags;
      return found || new WidgetBufferTile(flags);
    }
    flushBuffer() {
      if (this.afterWidget && !(this.afterWidget.flags & 32)) {
        this.afterWidget.parent.append(this.getBuffer(-1));
        this.afterWidget = null;
      }
    }
  };
  var TextStream = class {
    constructor(doc2) {
      this.skipCount = 0;
      this.text = "";
      this.textOff = 0;
      this.cursor = doc2.iter();
    }
    skip(len) {
      if (this.textOff + len <= this.text.length) {
        this.textOff += len;
      } else {
        this.skipCount += len - (this.text.length - this.textOff);
        this.text = "";
        this.textOff = 0;
      }
    }
    next(maxLen) {
      if (this.textOff == this.text.length) {
        let { value, lineBreak, done } = this.cursor.next(this.skipCount);
        this.skipCount = 0;
        if (done)
          throw new Error("Ran out of text content when drawing inline views");
        this.text = value;
        let len = this.textOff = Math.min(maxLen, value.length);
        return lineBreak ? null : value.slice(0, len);
      }
      let end = Math.min(this.text.length, this.textOff + maxLen);
      let chars = this.text.slice(this.textOff, end);
      this.textOff = end;
      return chars;
    }
  };
  var buckets = [WidgetTile, LineTile, TextTile, MarkTile, WidgetBufferTile, BlockWrapperTile, DocTile];
  for (let i2 = 0; i2 < buckets.length; i2++)
    buckets[i2].bucket = i2;
  var TileCache = class {
    constructor(view2) {
      this.view = view2;
      this.buckets = buckets.map(() => []);
      this.index = buckets.map(() => 0);
      this.reused = /* @__PURE__ */ new Map();
    }
    // Put a tile in the cache.
    add(tile) {
      let i2 = tile.constructor.bucket, bucket = this.buckets[i2];
      if (bucket.length < 6)
        bucket.push(tile);
      else
        bucket[
          this.index[i2] = (this.index[i2] + 1) % 6
          /* C.Bucket */
        ] = tile;
    }
    find(cls, test, type = 2) {
      let i2 = cls.bucket;
      let bucket = this.buckets[i2], off = this.index[i2];
      for (let j = 0; j < bucket.length; j++) {
        let index = (j + off) % bucket.length, tile = bucket[index];
        if ((!test || test(tile)) && !this.reused.has(tile)) {
          bucket.splice(index, 1);
          if (index < off)
            this.index[i2]--;
          this.reused.set(tile, type);
          return tile;
        }
      }
      return null;
    }
    findWidget(widget, length, flags) {
      let widgets = this.buckets[0];
      if (widgets.length)
        for (let i2 = 0, pass = 0; ; i2++) {
          if (i2 == widgets.length) {
            if (pass)
              return null;
            pass = 1;
            i2 = 0;
          }
          let tile = widgets[i2];
          if (!this.reused.has(tile) && (pass == 0 ? tile.widget.compare(widget) : tile.widget.constructor == widget.constructor && widget.updateDOM(tile.dom, this.view, tile.widget))) {
            widgets.splice(i2, 1);
            if (i2 < this.index[0])
              this.index[0]--;
            if (tile.widget == widget && tile.length == length && (tile.flags & (496 | 1)) == flags) {
              this.reused.set(
                tile,
                1
                /* Reused.Full */
              );
              return tile;
            } else {
              this.reused.set(
                tile,
                2
                /* Reused.DOM */
              );
              return new WidgetTile(tile.dom, length, widget, tile.flags & -498 | flags);
            }
          }
        }
    }
    reuse(tile) {
      this.reused.set(
        tile,
        1
        /* Reused.Full */
      );
      return tile;
    }
    maybeReuse(tile, type = 2) {
      if (this.reused.has(tile))
        return void 0;
      this.reused.set(tile, type);
      return tile.dom;
    }
    clear() {
      for (let i2 = 0; i2 < this.buckets.length; i2++)
        this.buckets[i2].length = this.index[i2] = 0;
    }
  };
  var TileUpdate = class {
    constructor(view2, old, blockWrappers2, decorations2, disallowBlockEffectsFor) {
      this.view = view2;
      this.decorations = decorations2;
      this.disallowBlockEffectsFor = disallowBlockEffectsFor;
      this.openWidget = false;
      this.openMarks = 0;
      this.cache = new TileCache(view2);
      this.text = new TextStream(view2.state.doc);
      this.builder = new TileBuilder(this.cache, new DocTile(view2, view2.contentDOM), RangeSet.iter(blockWrappers2));
      this.cache.reused.set(
        old,
        2
        /* Reused.DOM */
      );
      this.old = new TilePointer(old);
      this.reuseWalker = {
        skip: (tile, from, to) => {
          this.cache.add(tile);
          if (tile.isComposite())
            return false;
        },
        enter: (tile) => this.cache.add(tile),
        leave: () => {
        },
        break: () => {
        }
      };
    }
    run(changes, composition) {
      let compositionContext = composition && this.getCompositionContext(composition.text);
      for (let posA = 0, posB = 0, i2 = 0; ; ) {
        let next = i2 < changes.length ? changes[i2++] : null;
        let skipA = next ? next.fromA : this.old.root.length;
        if (skipA > posA) {
          let len = skipA - posA;
          this.preserve(len, !i2, !next);
          posA = skipA;
          posB += len;
        }
        if (!next)
          break;
        if (composition && next.fromA <= composition.range.fromA && next.toA >= composition.range.toA) {
          this.forward(next.fromA, composition.range.fromA, composition.range.fromA < composition.range.toA ? 1 : -1);
          this.emit(posB, composition.range.fromB);
          this.builder.flushBuffer();
          this.cache.clear();
          this.builder.addComposition(composition, compositionContext);
          this.text.skip(composition.range.toB - composition.range.fromB);
          this.forward(composition.range.fromA, next.toA);
          this.emit(composition.range.toB, next.toB);
        } else {
          this.forward(next.fromA, next.toA);
          this.emit(posB, next.toB);
        }
        posB = next.toB;
        posA = next.toA;
      }
      if (this.builder.curLine)
        this.builder.endLine();
      return this.builder.root;
    }
    preserve(length, incStart, incEnd) {
      let activeMarks = getMarks(this.old), openMarks = this.openMarks;
      this.old.advance(length, incEnd ? 1 : -1, {
        skip: (tile, from, to) => {
          if (tile.isWidget()) {
            if (this.openWidget) {
              this.builder.continueWidget(to - from);
            } else {
              let widget = to > 0 || from < tile.length ? WidgetTile.of(tile.widget, this.view, to - from, tile.flags & 496, this.cache.maybeReuse(tile)) : this.cache.reuse(tile);
              if (widget.flags & 256) {
                widget.flags &= -2;
                this.builder.addBlockWidget(widget);
              } else {
                this.builder.ensureLine(null);
                this.builder.addInlineWidget(widget, activeMarks, openMarks);
                openMarks = activeMarks.length;
              }
            }
          } else if (tile.isText()) {
            this.builder.ensureLine(null);
            if (!from && to == tile.length && !this.cache.reused.has(tile)) {
              this.builder.addText(tile.text, activeMarks, openMarks, this.cache.reuse(tile));
            } else {
              this.cache.add(tile);
              this.builder.addText(tile.text.slice(from, to), activeMarks, openMarks);
            }
            openMarks = activeMarks.length;
          } else if (tile.isLine()) {
            tile.flags &= -2;
            this.cache.reused.set(
              tile,
              1
              /* Reused.Full */
            );
            this.builder.addLine(tile);
          } else if (tile instanceof WidgetBufferTile) {
            this.cache.add(tile);
          } else if (tile instanceof MarkTile) {
            this.builder.ensureLine(null);
            this.builder.addMark(tile, activeMarks, openMarks);
            this.cache.reused.set(
              tile,
              1
              /* Reused.Full */
            );
            openMarks = activeMarks.length;
          } else {
            return false;
          }
          this.openWidget = false;
        },
        enter: (tile) => {
          if (tile.isLine()) {
            this.builder.addLineStart(tile.attrs, this.cache.maybeReuse(tile));
          } else {
            this.cache.add(tile);
            if (tile instanceof MarkTile)
              activeMarks.unshift(tile.mark);
          }
          this.openWidget = false;
        },
        leave: (tile) => {
          if (tile.isLine()) {
            if (activeMarks.length)
              activeMarks.length = openMarks = 0;
          } else if (tile instanceof MarkTile) {
            activeMarks.shift();
            openMarks = Math.min(openMarks, activeMarks.length);
          }
        },
        break: () => {
          this.builder.addBreak();
          this.openWidget = false;
        }
      });
      this.text.skip(length);
    }
    emit(from, to) {
      let pendingLineAttrs = null;
      let b = this.builder, markCount = -1;
      let openEnd = RangeSet.spans(this.decorations, from, to, {
        point: (from2, to2, deco, active, openStart, index) => {
          if (deco instanceof PointDecoration) {
            if (this.disallowBlockEffectsFor[index]) {
              if (deco.block)
                throw new RangeError("Block decorations may not be specified via plugins");
              if (to2 > this.view.state.doc.lineAt(from2).to)
                throw new RangeError("Decorations that replace line breaks may not be specified via plugins");
            }
            markCount = active.length;
            if (openStart > active.length) {
              b.continueWidget(to2 - from2);
            } else {
              let widget = deco.widget || (deco.block ? NullWidget.block : NullWidget.inline);
              let flags = widgetFlags(deco);
              let tile = this.cache.findWidget(widget, to2 - from2, flags) || WidgetTile.of(widget, this.view, to2 - from2, flags);
              if (deco.block) {
                if (deco.startSide > 0)
                  b.addLineStartIfNotCovered(pendingLineAttrs);
                b.addBlockWidget(tile);
              } else {
                b.ensureLine(pendingLineAttrs);
                b.addInlineWidget(tile, active, openStart);
              }
            }
            pendingLineAttrs = null;
          } else {
            pendingLineAttrs = addLineDeco(pendingLineAttrs, deco);
          }
          if (to2 > from2)
            this.text.skip(to2 - from2);
        },
        span: (from2, to2, active, openStart) => {
          for (let pos = from2; pos < to2; ) {
            let chars = this.text.next(Math.min(512, to2 - pos));
            if (chars == null) {
              b.addLineStartIfNotCovered(pendingLineAttrs);
              b.addBreak();
              pos++;
            } else {
              b.ensureLine(pendingLineAttrs);
              b.addText(chars, active, pos == from2 ? openStart : active.length);
              pos += chars.length;
            }
            pendingLineAttrs = null;
          }
          markCount = active.length;
        }
      });
      if (markCount > -1)
        this.openWidget = openEnd > markCount;
      if (!this.openWidget)
        b.addLineStartIfNotCovered(pendingLineAttrs);
      this.openMarks = openEnd;
    }
    forward(from, to, side = 1) {
      if (to - from <= 10) {
        this.old.advance(to - from, side, this.reuseWalker);
      } else {
        this.old.advance(5, -1, this.reuseWalker);
        this.old.advance(to - from - 10, -1);
        this.old.advance(5, side, this.reuseWalker);
      }
    }
    getCompositionContext(text) {
      let marks2 = [], line = null;
      for (let parent = text.parentNode; ; parent = parent.parentNode) {
        let tile = Tile.get(parent);
        if (parent == this.view.contentDOM)
          break;
        if (tile instanceof MarkTile)
          marks2.push(tile);
        else if (tile === null || tile === void 0 ? void 0 : tile.isLine())
          line = tile;
        else if (tile instanceof BlockWrapperTile) ;
        else if (parent.nodeName == "DIV" && !line)
          line = new LineTile(parent, lineBaseAttrs);
        else if (!line)
          marks2.push(MarkTile.of(new MarkDecoration({ tagName: parent.nodeName.toLowerCase(), attributes: getAttrs(parent) }), parent));
      }
      if (!line)
        return null;
      return { line, marks: marks2 };
    }
  };
  function hasContent(tile, requireText) {
    let scan = (tile2) => {
      for (let ch of tile2.children)
        if ((requireText ? ch.isText() : ch.length) || scan(ch))
          return true;
      return false;
    };
    return scan(tile);
  }
  function widgetFlags(deco) {
    let flags = deco.isReplace ? (deco.startSide < 0 ? 64 : 0) | (deco.endSide > 0 ? 128 : 0) : deco.startSide > 0 ? 32 : 16;
    if (deco.block)
      flags |= 256;
    return flags;
  }
  var lineBaseAttrs = { class: "cm-line" };
  function addLineDeco(value, deco) {
    let attrs = deco.spec.attributes, cls = deco.spec.class;
    if (!attrs && !cls)
      return value;
    if (!value)
      value = { class: "cm-line" };
    if (attrs)
      combineAttrs(attrs, value);
    if (cls)
      value.class += " " + cls;
    return value;
  }
  function getMarks(ptr) {
    let found = [];
    for (let i2 = ptr.parents.length; i2 > 1; i2--) {
      let tile = i2 == ptr.parents.length ? ptr.tile : ptr.parents[i2].tile;
      if (tile instanceof MarkTile)
        found.push(tile.mark);
    }
    return found;
  }
  function freeNode(node) {
    let tile = Tile.get(node);
    if (tile)
      tile.setDOM(node.cloneNode());
    return node;
  }
  var NullWidget = class extends WidgetType {
    constructor(tag) {
      super();
      this.tag = tag;
    }
    eq(other) {
      return other.tag == this.tag;
    }
    toDOM() {
      return document.createElement(this.tag);
    }
    updateDOM(elt) {
      return elt.nodeName.toLowerCase() == this.tag;
    }
    get isHidden() {
      return true;
    }
  };
  NullWidget.inline = /* @__PURE__ */ new NullWidget("span");
  NullWidget.block = /* @__PURE__ */ new NullWidget("div");
  var BreakWidget = /* @__PURE__ */ new class extends WidgetType {
    toDOM() {
      return document.createElement("br");
    }
    get isHidden() {
      return true;
    }
    get editable() {
      return true;
    }
  }();
  var DocView = class {
    constructor(view2) {
      this.view = view2;
      this.decorations = [];
      this.blockWrappers = [];
      this.dynamicDecorationMap = [false];
      this.domChanged = null;
      this.hasComposition = null;
      this.editContextFormatting = Decoration.none;
      this.lastCompositionAfterCursor = false;
      this.minWidth = 0;
      this.minWidthFrom = 0;
      this.minWidthTo = 0;
      this.impreciseAnchor = null;
      this.impreciseHead = null;
      this.forceSelection = false;
      this.lastUpdate = Date.now();
      this.updateDeco();
      this.tile = new DocTile(view2, view2.contentDOM);
      this.updateInner([new ChangedRange(0, 0, 0, view2.state.doc.length)], null);
    }
    // Update the document view to a given state.
    update(update) {
      var _a2;
      let changedRanges = update.changedRanges;
      if (this.minWidth > 0 && changedRanges.length) {
        if (!changedRanges.every(({ fromA, toA }) => toA < this.minWidthFrom || fromA > this.minWidthTo)) {
          this.minWidth = this.minWidthFrom = this.minWidthTo = 0;
        } else {
          this.minWidthFrom = update.changes.mapPos(this.minWidthFrom, 1);
          this.minWidthTo = update.changes.mapPos(this.minWidthTo, 1);
        }
      }
      this.updateEditContextFormatting(update);
      let readCompositionAt = -1;
      if (this.view.inputState.composing >= 0 && !this.view.observer.editContext) {
        if ((_a2 = this.domChanged) === null || _a2 === void 0 ? void 0 : _a2.newSel)
          readCompositionAt = this.domChanged.newSel.head;
        else if (!touchesComposition(update.changes, this.hasComposition) && !update.selectionSet)
          readCompositionAt = update.state.selection.main.head;
      }
      let composition = readCompositionAt > -1 ? findCompositionRange(this.view, update.changes, readCompositionAt) : null;
      this.domChanged = null;
      if (this.hasComposition) {
        let { from, to } = this.hasComposition;
        changedRanges = new ChangedRange(from, to, update.changes.mapPos(from, -1), update.changes.mapPos(to, 1)).addToSet(changedRanges.slice());
      }
      this.hasComposition = composition ? { from: composition.range.fromB, to: composition.range.toB } : null;
      if ((browser.ie || browser.chrome) && !composition && update && update.state.doc.lines != update.startState.doc.lines)
        this.forceSelection = true;
      let prevDeco = this.decorations, prevWrappers = this.blockWrappers;
      this.updateDeco();
      let decoDiff = findChangedDeco(prevDeco, this.decorations, update.changes);
      if (decoDiff.length)
        changedRanges = ChangedRange.extendWithRanges(changedRanges, decoDiff);
      let blockDiff = findChangedWrappers(prevWrappers, this.blockWrappers, update.changes);
      if (blockDiff.length)
        changedRanges = ChangedRange.extendWithRanges(changedRanges, blockDiff);
      if (composition && !changedRanges.some((r) => r.fromA <= composition.range.fromA && r.toA >= composition.range.toA))
        changedRanges = composition.range.addToSet(changedRanges.slice());
      if (this.tile.flags & 2 && changedRanges.length == 0) {
        return false;
      } else {
        this.updateInner(changedRanges, composition);
        if (update.transactions.length)
          this.lastUpdate = Date.now();
        return true;
      }
    }
    // Used by update and the constructor do perform the actual DOM
    // update
    updateInner(changes, composition) {
      this.view.viewState.mustMeasureContent = true;
      let { observer } = this.view;
      observer.ignore(() => {
        if (composition || changes.length) {
          let oldTile = this.tile;
          let builder = new TileUpdate(this.view, oldTile, this.blockWrappers, this.decorations, this.dynamicDecorationMap);
          if (composition && Tile.get(composition.text))
            builder.cache.reused.set(
              Tile.get(composition.text),
              2
              /* Reused.DOM */
            );
          this.tile = builder.run(changes, composition);
          destroyDropped(oldTile, builder.cache.reused);
        }
        this.tile.dom.style.height = this.view.viewState.contentHeight / this.view.scaleY + "px";
        this.tile.dom.style.flexBasis = this.minWidth ? this.minWidth + "px" : "";
        let track = browser.chrome || browser.ios ? { node: observer.selectionRange.focusNode, written: false } : void 0;
        this.tile.sync(track);
        if (track && (track.written || observer.selectionRange.focusNode != track.node || !this.tile.dom.contains(track.node)))
          this.forceSelection = true;
        this.tile.dom.style.height = "";
      });
      let gaps = [];
      if (this.view.viewport.from || this.view.viewport.to < this.view.state.doc.length) {
        for (let child of this.tile.children)
          if (child.isWidget() && child.widget instanceof BlockGapWidget)
            gaps.push(child.dom);
      }
      observer.updateGaps(gaps);
    }
    updateEditContextFormatting(update) {
      this.editContextFormatting = this.editContextFormatting.map(update.changes);
      for (let tr of update.transactions)
        for (let effect of tr.effects)
          if (effect.is(setEditContextFormatting)) {
            this.editContextFormatting = effect.value;
          }
    }
    // Sync the DOM selection to this.state.selection
    updateSelection(mustRead = false, fromPointer = false) {
      if (mustRead || !this.view.observer.selectionRange.focusNode)
        this.view.observer.readSelectionRange();
      let { dom } = this.tile;
      let activeElt = this.view.root.activeElement, focused = activeElt == dom;
      let selectionNotFocus = !focused && !(this.view.state.facet(editable) || dom.tabIndex > -1) && hasSelection(dom, this.view.observer.selectionRange) && !(activeElt && dom.contains(activeElt));
      if (!(focused || fromPointer || selectionNotFocus))
        return;
      let force = this.forceSelection;
      this.forceSelection = false;
      let main = this.view.state.selection.main, anchor, head;
      if (main.empty) {
        head = anchor = this.inlineDOMNearPos(main.anchor, main.assoc || 1);
      } else {
        head = this.inlineDOMNearPos(main.head, main.head == main.from ? 1 : -1);
        anchor = this.inlineDOMNearPos(main.anchor, main.anchor == main.from ? 1 : -1);
      }
      if (browser.gecko && main.empty && !this.hasComposition && betweenUneditable(anchor)) {
        let dummy = document.createTextNode("");
        this.view.observer.ignore(() => anchor.node.insertBefore(dummy, anchor.node.childNodes[anchor.offset] || null));
        anchor = head = new DOMPos(dummy, 0);
        force = true;
      }
      let domSel = this.view.observer.selectionRange;
      if (force || !domSel.focusNode || (!isEquivalentPosition(anchor.node, anchor.offset, domSel.anchorNode, domSel.anchorOffset) || !isEquivalentPosition(head.node, head.offset, domSel.focusNode, domSel.focusOffset)) && !this.suppressWidgetCursorChange(domSel, main)) {
        this.view.observer.ignore(() => {
          if (browser.android && browser.chrome && dom.contains(domSel.focusNode) && inUneditable(domSel.focusNode, dom)) {
            dom.blur();
            dom.focus({ preventScroll: true });
          }
          let rawSel = getSelection(this.view.root);
          if (!rawSel) ;
          else if (main.empty) {
            if (browser.gecko) {
              let nextTo = nextToUneditable(anchor.node, anchor.offset);
              if (nextTo && nextTo != (1 | 2)) {
                let text = (nextTo == 1 ? textNodeBefore : textNodeAfter)(anchor.node, anchor.offset);
                if (text)
                  anchor = new DOMPos(text.node, text.offset);
              }
            }
            rawSel.collapse(anchor.node, anchor.offset);
            if (main.bidiLevel != null && rawSel.caretBidiLevel !== void 0)
              rawSel.caretBidiLevel = main.bidiLevel;
          } else if (rawSel.extend) {
            rawSel.collapse(anchor.node, anchor.offset);
            try {
              rawSel.extend(head.node, head.offset);
            } catch (_) {
            }
          } else {
            let range = document.createRange();
            if (main.anchor > main.head)
              [anchor, head] = [head, anchor];
            range.setEnd(head.node, head.offset);
            range.setStart(anchor.node, anchor.offset);
            rawSel.removeAllRanges();
            rawSel.addRange(range);
          }
          if (selectionNotFocus && this.view.root.activeElement == dom) {
            dom.blur();
            if (activeElt)
              activeElt.focus();
          }
        });
        this.view.observer.setSelectionRange(anchor, head);
      }
      this.impreciseAnchor = anchor.precise ? null : new DOMPos(domSel.anchorNode, domSel.anchorOffset);
      this.impreciseHead = head.precise ? null : new DOMPos(domSel.focusNode, domSel.focusOffset);
    }
    // If a zero-length widget is inserted next to the cursor during
    // composition, avoid moving it across it and disrupting the
    // composition.
    suppressWidgetCursorChange(sel, cursor) {
      return this.hasComposition && cursor.empty && isEquivalentPosition(sel.focusNode, sel.focusOffset, sel.anchorNode, sel.anchorOffset) && this.posFromDOM(sel.focusNode, sel.focusOffset) == cursor.head;
    }
    enforceCursorAssoc() {
      if (this.hasComposition)
        return;
      let { view: view2 } = this, cursor = view2.state.selection.main;
      let sel = getSelection(view2.root);
      let { anchorNode, anchorOffset } = view2.observer.selectionRange;
      if (!sel || !cursor.empty || !cursor.assoc || !sel.modify)
        return;
      let line = this.lineAt(cursor.head, cursor.assoc);
      if (!line)
        return;
      let lineStart = line.posAtStart;
      if (cursor.head == lineStart || cursor.head == lineStart + line.length)
        return;
      let before = this.coordsAt(cursor.head, -1), after = this.coordsAt(cursor.head, 1);
      if (!before || !after || before.bottom > after.top)
        return;
      let dom = this.domAtPos(cursor.head + cursor.assoc, cursor.assoc);
      sel.collapse(dom.node, dom.offset);
      sel.modify("move", cursor.assoc < 0 ? "forward" : "backward", "lineboundary");
      view2.observer.readSelectionRange();
      let newRange = view2.observer.selectionRange;
      if (view2.docView.posFromDOM(newRange.anchorNode, newRange.anchorOffset) != cursor.from)
        sel.collapse(anchorNode, anchorOffset);
    }
    posFromDOM(node, offset) {
      let tile = this.tile.nearest(node);
      if (!tile)
        return this.tile.dom.compareDocumentPosition(node) & 2 ? 0 : this.view.state.doc.length;
      let start = tile.posAtStart;
      if (tile.isComposite()) {
        let after;
        if (node == tile.dom) {
          after = tile.dom.childNodes[offset];
        } else {
          let bias = maxOffset(node) == 0 ? 0 : offset == 0 ? -1 : 1;
          for (; ; ) {
            let parent = node.parentNode;
            if (parent == tile.dom)
              break;
            if (bias == 0 && parent.firstChild != parent.lastChild) {
              if (node == parent.firstChild)
                bias = -1;
              else
                bias = 1;
            }
            node = parent;
          }
          if (bias < 0)
            after = node;
          else
            after = node.nextSibling;
        }
        if (after == tile.dom.firstChild)
          return start;
        while (after && !Tile.get(after))
          after = after.nextSibling;
        if (!after)
          return start + tile.length;
        for (let i2 = 0, pos = start; ; i2++) {
          let child = tile.children[i2];
          if (child.dom == after)
            return pos;
          pos += child.length + child.breakAfter;
        }
      } else if (tile.isText()) {
        return node == tile.dom ? start + offset : start + (offset ? tile.length : 0);
      } else {
        return start;
      }
    }
    domAtPos(pos, side) {
      let { tile, offset } = this.tile.resolveBlock(pos, side);
      if (tile.isWidget())
        return tile.domPosFor(offset, side);
      return tile.domIn(offset, side);
    }
    inlineDOMNearPos(pos, side) {
      let before, beforeOff = -1, beforeBad = false;
      let after, afterOff = -1, afterBad = false;
      this.tile.blockTiles((tile, off) => {
        if (tile.isWidget()) {
          if (tile.flags & 32 && off >= pos)
            return true;
          if (tile.flags & 16)
            beforeBad = true;
        } else {
          let end = off + tile.length;
          if (off <= pos) {
            before = tile;
            beforeOff = pos - off;
            beforeBad = end < pos;
          }
          if (end >= pos && !after) {
            after = tile;
            afterOff = pos - off;
            afterBad = off > pos;
          }
          if (off > pos && after)
            return true;
        }
      });
      if (!before && !after)
        return this.domAtPos(pos, side);
      if (beforeBad && after)
        before = null;
      else if (afterBad && before)
        after = null;
      return before && side < 0 || !after ? before.domIn(beforeOff, side) : after.domIn(afterOff, side);
    }
    // Get the coord of the element at the given side of the given
    // position. If rtl is given, flatten it using that text direction.
    coordsAt(pos, side, rtl) {
      let { tile, offset } = this.tile.resolveBlock(pos, side);
      if (tile.isWidget()) {
        if (tile.widget instanceof BlockGapWidget)
          return null;
        return tile.coordsInWidget(offset, side, true);
      }
      return tile.coordsIn(offset, side, rtl);
    }
    lineAt(pos, side) {
      let { tile } = this.tile.resolveBlock(pos, side);
      return tile.isLine() ? tile : null;
    }
    coordsForChar(pos) {
      let { tile, offset } = this.tile.resolveBlock(pos, 1);
      if (!tile.isLine())
        return null;
      function scan(tile2, offset2) {
        if (tile2.isComposite()) {
          for (let ch of tile2.children) {
            if (ch.length >= offset2) {
              let found = scan(ch, offset2);
              if (found)
                return found;
            }
            offset2 -= ch.length;
            if (offset2 < 0)
              break;
          }
        } else if (tile2.isText() && offset2 < tile2.length) {
          let end = findClusterBreak2(tile2.text, offset2);
          if (end == offset2)
            return null;
          let rects = textRange(tile2.dom, offset2, end).getClientRects();
          for (let i2 = 0; i2 < rects.length; i2++) {
            let rect = rects[i2];
            if (i2 == rects.length - 1 || rect.top < rect.bottom && rect.left < rect.right)
              return rect;
          }
        }
        return null;
      }
      return scan(tile, offset);
    }
    measureVisibleLineHeights(viewport) {
      let result = [], { from, to } = viewport;
      let contentWidth = this.view.contentDOM.clientWidth;
      let isWider = contentWidth > Math.max(this.view.scrollDOM.clientWidth, this.minWidth) + 1;
      let widest = -1, ltr = this.view.textDirection == Direction.LTR;
      let spaceAbove = 0;
      let scan = (tile, pos, measureBounds) => {
        for (let i2 = 0; i2 < tile.children.length; i2++) {
          if (pos > to)
            break;
          let child = tile.children[i2], end = pos + child.length;
          let childRect = child.dom.getBoundingClientRect(), { height } = childRect;
          if (measureBounds && !i2)
            spaceAbove += childRect.top - measureBounds.top;
          if (child instanceof BlockWrapperTile) {
            if (end > from)
              scan(child, pos, childRect);
          } else if (pos >= from) {
            if (spaceAbove > 0)
              result.push(-spaceAbove);
            result.push(height + spaceAbove);
            spaceAbove = 0;
            if (isWider) {
              let last2 = child.dom.lastChild;
              let rects = last2 ? clientRectsFor(last2) : [];
              if (rects.length) {
                let rect = rects[rects.length - 1];
                let width = ltr ? rect.right - childRect.left : childRect.right - rect.left;
                if (width > widest) {
                  widest = width;
                  this.minWidth = contentWidth;
                  this.minWidthFrom = pos;
                  this.minWidthTo = end;
                }
              }
            }
          }
          if (measureBounds && i2 == tile.children.length - 1)
            spaceAbove += measureBounds.bottom - childRect.bottom;
          pos = end + child.breakAfter;
        }
      };
      scan(this.tile, 0, null);
      return result;
    }
    textDirectionAt(pos) {
      let { tile } = this.tile.resolveBlock(pos, 1);
      return getComputedStyle(tile.dom).direction == "rtl" ? Direction.RTL : Direction.LTR;
    }
    measureTextSize() {
      let lineMeasure = this.tile.blockTiles((tile) => {
        if (tile.isLine() && tile.children.length && tile.length <= 20) {
          let totalWidth = 0, textHeight2;
          for (let child of tile.children) {
            if (!child.isText() || /[^ -~]/.test(child.text))
              return void 0;
            let rects = clientRectsFor(child.dom);
            if (rects.length != 1)
              return void 0;
            totalWidth += rects[0].width;
            textHeight2 = rects[0].height;
          }
          if (totalWidth)
            return {
              lineHeight: tile.dom.getBoundingClientRect().height,
              charWidth: totalWidth / tile.length,
              textHeight: textHeight2
            };
        }
      });
      if (lineMeasure)
        return lineMeasure;
      let dummy = document.createElement("div"), lineHeight, charWidth, textHeight;
      dummy.className = "cm-line";
      dummy.style.width = "99999px";
      dummy.style.position = "absolute";
      dummy.textContent = "abc def ghi jkl mno pqr stu";
      this.view.observer.ignore(() => {
        this.tile.dom.appendChild(dummy);
        let rect = clientRectsFor(dummy.firstChild)[0];
        lineHeight = dummy.getBoundingClientRect().height;
        charWidth = rect && rect.width ? rect.width / 27 : 7;
        textHeight = rect && rect.height ? rect.height : lineHeight;
        dummy.remove();
      });
      return { lineHeight, charWidth, textHeight };
    }
    computeBlockGapDeco() {
      let deco = [], vs = this.view.viewState;
      for (let pos = 0, i2 = 0; ; i2++) {
        let next = i2 == vs.viewports.length ? null : vs.viewports[i2];
        let end = next ? next.from - 1 : this.view.state.doc.length;
        if (end > pos) {
          let height = (vs.lineBlockAt(end).bottom - vs.lineBlockAt(pos).top) / this.view.scaleY;
          deco.push(Decoration.replace({
            widget: new BlockGapWidget(height),
            block: true,
            inclusive: true,
            isBlockGap: true
          }).range(pos, end));
        }
        if (!next)
          break;
        pos = next.to + 1;
      }
      return Decoration.set(deco);
    }
    updateDeco() {
      let i2 = 1;
      let allDeco = this.view.state.facet(decorations).map((d) => {
        let dynamic = this.dynamicDecorationMap[i2++] = typeof d == "function";
        return dynamic ? d(this.view) : d;
      });
      let dynamicOuter = false, outerDeco = this.view.state.facet(outerDecorations).map((d, i3) => {
        let dynamic = typeof d == "function";
        if (dynamic)
          dynamicOuter = true;
        return dynamic ? d(this.view) : d;
      });
      if (outerDeco.length) {
        this.dynamicDecorationMap[i2++] = dynamicOuter;
        allDeco.push(RangeSet.join(outerDeco));
      }
      this.decorations = [
        this.editContextFormatting,
        ...allDeco,
        this.computeBlockGapDeco(),
        this.view.viewState.lineGapDeco
      ];
      while (i2 < this.decorations.length)
        this.dynamicDecorationMap[i2++] = false;
      this.blockWrappers = this.view.state.facet(blockWrappers).map((v) => typeof v == "function" ? v(this.view) : v);
    }
    scrollIntoView(target) {
      if (target.isSnapshot) {
        let ref = this.view.viewState.lineBlockAt(target.range.head);
        this.view.scrollDOM.scrollTop = ref.top - target.yMargin;
        this.view.scrollDOM.scrollLeft = target.xMargin;
        return;
      }
      for (let handler of this.view.state.facet(scrollHandler)) {
        try {
          if (handler(this.view, target.range, target))
            return true;
        } catch (e) {
          logException(this.view.state, e, "scroll handler");
        }
      }
      let { range } = target;
      let rect = this.coordsAt(range.head, range.assoc || (range.head > range.anchor ? -1 : 1)), other;
      if (!rect)
        return;
      if (!range.empty && (other = this.coordsAt(range.anchor, range.anchor > range.head ? -1 : 1)))
        rect = {
          left: Math.min(rect.left, other.left),
          top: Math.min(rect.top, other.top),
          right: Math.max(rect.right, other.right),
          bottom: Math.max(rect.bottom, other.bottom)
        };
      let margins = getScrollMargins(this.view);
      let targetRect = {
        left: rect.left - margins.left,
        top: rect.top - margins.top,
        right: rect.right + margins.right,
        bottom: rect.bottom + margins.bottom
      };
      let { offsetWidth, offsetHeight } = this.view.scrollDOM;
      scrollRectIntoView(this.view.scrollDOM, targetRect, range.head < range.anchor ? -1 : 1, target.x, target.y, Math.max(Math.min(target.xMargin, offsetWidth), -offsetWidth), Math.max(Math.min(target.yMargin, offsetHeight), -offsetHeight), this.view.textDirection == Direction.LTR);
      if (window.visualViewport && window.innerHeight - window.visualViewport.height > 1 && (rect.top > window.visualViewport.offsetTop + window.visualViewport.height || rect.bottom < window.visualViewport.offsetTop)) {
        let line = this.view.docView.lineAt(range.head, 1);
        if (line) {
          let stack = getScrollStack(line.dom);
          line.dom.scrollIntoView({ block: "nearest" });
          restoreScrollStack(stack, false);
        }
      }
    }
    lineHasWidget(pos) {
      let scan = (child) => child.isWidget() || child.children.some(scan);
      return scan(this.tile.resolveBlock(pos, 1).tile);
    }
    destroy() {
      destroyDropped(this.tile);
    }
  };
  function destroyDropped(tile, reused) {
    let r = reused === null || reused === void 0 ? void 0 : reused.get(tile);
    if (r != 1) {
      if (r == null)
        tile.destroy();
      for (let ch of tile.children)
        destroyDropped(ch, reused);
    }
  }
  function betweenUneditable(pos) {
    return isElt(pos.node) && pos.node.firstChild && (pos.offset == 0 || pos.node.childNodes[pos.offset - 1].contentEditable == "false") && (pos.offset == pos.node.childNodes.length || pos.node.childNodes[pos.offset].contentEditable == "false");
  }
  function findCompositionNode(view2, headPos) {
    let sel = view2.observer.selectionRange;
    if (!sel.focusNode)
      return null;
    let textBefore = textNodeBefore(sel.focusNode, sel.focusOffset);
    let textAfter = textNodeAfter(sel.focusNode, sel.focusOffset);
    let textNode = textBefore || textAfter;
    if (textAfter && textBefore && textAfter.node != textBefore.node) {
      let tileAfter = Tile.get(textAfter.node);
      if (!tileAfter || tileAfter.isText() && tileAfter.text != textAfter.node.nodeValue) {
        textNode = textAfter;
      } else if (view2.docView.lastCompositionAfterCursor) {
        let tileBefore = Tile.get(textBefore.node);
        if (!(!tileBefore || tileBefore.isText() && tileBefore.text != textBefore.node.nodeValue))
          textNode = textAfter;
      }
    }
    view2.docView.lastCompositionAfterCursor = textNode != textBefore;
    if (!textNode)
      return null;
    let from = headPos - textNode.offset;
    return { from, to: from + textNode.node.nodeValue.length, node: textNode.node };
  }
  function findCompositionRange(view2, changes, headPos) {
    let found = findCompositionNode(view2, headPos);
    if (!found)
      return null;
    let { node: textNode, from, to } = found, text = textNode.nodeValue;
    if (/[\n\r]/.test(text))
      return null;
    if (view2.state.doc.sliceString(found.from, found.to) != text)
      return null;
    let inv = changes.invertedDesc;
    return { range: new ChangedRange(inv.mapPos(from), inv.mapPos(to), from, to), text: textNode };
  }
  function nextToUneditable(node, offset) {
    if (!isElt(node))
      return 0;
    return (offset && node.childNodes[offset - 1].contentEditable == "false" ? 1 : 0) | (offset < node.childNodes.length && node.childNodes[offset].contentEditable == "false" ? 2 : 0);
  }
  var DecorationComparator$1 = class DecorationComparator {
    constructor() {
      this.changes = [];
    }
    compareRange(from, to) {
      addRange(from, to, this.changes);
    }
    comparePoint(from, to) {
      addRange(from, to, this.changes);
    }
    boundChange(pos) {
      addRange(pos, pos, this.changes);
    }
  };
  function findChangedDeco(a, b, diff) {
    let comp = new DecorationComparator$1();
    RangeSet.compare(a, b, diff, comp);
    return comp.changes;
  }
  var WrapperComparator = class {
    constructor() {
      this.changes = [];
    }
    compareRange(from, to) {
      addRange(from, to, this.changes);
    }
    comparePoint() {
    }
    boundChange(pos) {
      addRange(pos, pos, this.changes);
    }
  };
  function findChangedWrappers(a, b, diff) {
    let comp = new WrapperComparator();
    RangeSet.compare(a, b, diff, comp);
    return comp.changes;
  }
  function inUneditable(node, inside) {
    for (let cur2 = node; cur2 && cur2 != inside; cur2 = cur2.assignedSlot || cur2.parentNode) {
      if (isElt(cur2) && cur2.contentEditable == "false")
        return true;
    }
    return false;
  }
  function touchesComposition(changes, composition) {
    let touched = false;
    if (composition)
      changes.iterChangedRanges((from, to) => {
        if (from < composition.to && to > composition.from)
          touched = true;
      });
    return touched;
  }
  var BlockGapWidget = class extends WidgetType {
    constructor(height) {
      super();
      this.height = height;
    }
    toDOM() {
      let elt = document.createElement("div");
      elt.className = "cm-gap";
      this.updateDOM(elt);
      return elt;
    }
    eq(other) {
      return other.height == this.height;
    }
    updateDOM(elt) {
      elt.style.height = this.height + "px";
      return true;
    }
    get editable() {
      return true;
    }
    get estimatedHeight() {
      return this.height;
    }
    ignoreEvent() {
      return false;
    }
  };
  function groupAt(state, pos, bias = 1) {
    let categorize = state.charCategorizer(pos);
    let line = state.doc.lineAt(pos), linePos = pos - line.from;
    if (line.length == 0)
      return EditorSelection.cursor(pos);
    if (linePos == 0)
      bias = 1;
    else if (linePos == line.length)
      bias = -1;
    let from = linePos, to = linePos;
    if (bias < 0)
      from = findClusterBreak2(line.text, linePos, false);
    else
      to = findClusterBreak2(line.text, linePos);
    let cat = categorize(line.text.slice(from, to));
    while (from > 0) {
      let prev = findClusterBreak2(line.text, from, false);
      if (categorize(line.text.slice(prev, from)) != cat)
        break;
      from = prev;
    }
    while (to < line.length) {
      let next = findClusterBreak2(line.text, to);
      if (categorize(line.text.slice(to, next)) != cat)
        break;
      to = next;
    }
    return EditorSelection.undirectionalRange(from + line.from, to + line.from);
  }
  function posAtCoordsImprecise(view2, contentRect, block, x, y) {
    let into = Math.round((x - contentRect.left) * view2.defaultCharacterWidth);
    if (view2.lineWrapping && block.height > view2.defaultLineHeight * 1.5) {
      let textHeight = view2.viewState.heightOracle.textHeight;
      let line = Math.floor((y - block.top - (view2.defaultLineHeight - textHeight) * 0.5) / textHeight);
      into += line * view2.viewState.heightOracle.lineLength;
    }
    let content2 = view2.state.sliceDoc(block.from, block.to);
    return block.from + findColumn(content2, into, view2.state.tabSize);
  }
  function blockAt(view2, pos, side) {
    let line = view2.lineBlockAt(pos);
    if (Array.isArray(line.type)) {
      let best;
      for (let l of line.type) {
        if (l.from > pos)
          break;
        if (l.to < pos)
          continue;
        if (l.from < pos && l.to > pos)
          return l;
        if (!best || l.type == BlockType.Text && (best.type != l.type || (side < 0 ? l.from < pos : l.to > pos)))
          best = l;
      }
      return best || line;
    }
    return line;
  }
  function moveToLineBoundary(view2, start, forward, includeWrap) {
    let block = blockAt(view2, start.head, start.assoc || -1);
    let coords = !includeWrap || block.type != BlockType.Text || !(view2.lineWrapping || block.widgetLineBreaks) ? null : view2.coordsAtPos(start.assoc < 0 && start.head > block.from ? start.head - 1 : start.head);
    if (coords) {
      let editorRect = view2.dom.getBoundingClientRect();
      let direction = view2.textDirectionAt(block.from);
      let pos = view2.posAndSideAtCoords({
        x: forward == (direction == Direction.LTR) ? editorRect.right - 1 : editorRect.left + 1,
        y: (coords.top + coords.bottom) / 2
      });
      if (pos)
        return EditorSelection.cursor(pos.pos, pos.assoc);
    }
    return EditorSelection.cursor(forward ? block.to : block.from, forward ? 1 : -1);
  }
  function moveByChar(view2, start, forward, by) {
    let line = view2.state.doc.lineAt(start.head), spans = view2.bidiSpans(line);
    let direction = view2.textDirectionAt(line.from);
    for (let cur2 = start, check = null; ; ) {
      let next = moveVisually(line, spans, direction, cur2, forward), char = movedOver;
      if (!next) {
        if (line.number == (forward ? view2.state.doc.lines : 1))
          return cur2;
        char = "\n";
        line = view2.state.doc.line(line.number + (forward ? 1 : -1));
        spans = view2.bidiSpans(line);
        next = forward ? EditorSelection.cursor(line.from, -1) : EditorSelection.cursor(line.to, 1);
      }
      if (!check) {
        if (!by)
          return next;
        check = by(char);
      } else if (!check(char)) {
        return cur2;
      }
      cur2 = next;
    }
  }
  function byGroup(view2, pos, start) {
    let categorize = view2.state.charCategorizer(pos);
    let cat = categorize(start);
    return (next) => {
      let nextCat = categorize(next);
      if (cat == CharCategory.Space)
        cat = nextCat;
      return cat == nextCat;
    };
  }
  function moveVertically(view2, start, forward, distance) {
    let startPos = start.head, dir = forward ? 1 : -1;
    if (startPos == (forward ? view2.state.doc.length : 0))
      return EditorSelection.cursor(startPos, start.assoc);
    let goal = start.goalColumn, startY;
    let rect = view2.contentDOM.getBoundingClientRect();
    let startCoords = view2.coordsAtPos(startPos, start.assoc || ((start.empty ? forward : start.head == start.from) ? 1 : -1));
    let docTop = view2.documentTop;
    if (startCoords) {
      if (goal == null)
        goal = startCoords.left - rect.left;
      startY = dir < 0 ? startCoords.top : startCoords.bottom;
    } else {
      let line = view2.viewState.lineBlockAt(startPos);
      if (goal == null)
        goal = Math.min(rect.right - rect.left, view2.defaultCharacterWidth * (startPos - line.from));
      startY = (dir < 0 ? line.top : line.bottom) + docTop;
    }
    let resolvedGoal = rect.left + goal;
    let halfText = view2.viewState.heightOracle.textHeight >> 1, dist2 = distance !== null && distance !== void 0 ? distance : halfText;
    for (let scan = 0; ; scan += halfText) {
      let y = startY + (dist2 + scan) * dir;
      let pos = posAtCoords(view2, { x: resolvedGoal, y }, false, dir);
      if (forward ? y > rect.bottom : y < rect.top)
        return EditorSelection.cursor(pos.pos, pos.assoc);
      let posCoords = view2.coordsAtPos(pos.pos, pos.assoc), mid = posCoords ? (posCoords.top + posCoords.bottom) / 2 : 0;
      if (!posCoords || (forward ? mid > startY : mid < startY))
        return EditorSelection.cursor(pos.pos, pos.assoc, void 0, goal);
    }
  }
  function skipAtomicRanges(atoms, pos, bias) {
    for (; ; ) {
      let moved = 0;
      for (let set of atoms) {
        set.between(pos - 1, pos + 1, (from, to, value) => {
          if (pos > from && pos < to) {
            let side = moved || bias || (pos - from < to - pos ? -1 : 1);
            pos = side < 0 ? from : to;
            moved = side;
          }
        });
      }
      if (!moved)
        return pos;
    }
  }
  function skipAtomsForSelection(atoms, sel) {
    let ranges = null;
    for (let i2 = 0; i2 < sel.ranges.length; i2++) {
      let range = sel.ranges[i2], updated = null;
      if (range.empty) {
        let pos = skipAtomicRanges(atoms, range.from, 0);
        if (pos != range.from)
          updated = EditorSelection.cursor(pos, -1);
      } else {
        let from = skipAtomicRanges(atoms, range.from, -1);
        let to = skipAtomicRanges(atoms, range.to, 1);
        if (from != range.from || to != range.to) {
          if (range.undirectional)
            updated = EditorSelection.undirectionalRange(range.from, range.to);
          else
            updated = EditorSelection.range(range.from == range.anchor ? from : to, range.from == range.head ? from : to);
        }
      }
      if (updated) {
        if (!ranges)
          ranges = sel.ranges.slice();
        ranges[i2] = updated;
      }
    }
    return ranges ? EditorSelection.create(ranges, sel.mainIndex) : sel;
  }
  function skipAtoms(view2, oldPos, pos) {
    let newPos = skipAtomicRanges(view2.state.facet(atomicRanges).map((f) => f(view2)), pos.from, oldPos.head > pos.from ? -1 : 1);
    return newPos == pos.from ? pos : EditorSelection.cursor(newPos, newPos < pos.from ? 1 : -1);
  }
  var PosAssoc = class {
    constructor(pos, assoc) {
      this.pos = pos;
      this.assoc = assoc;
    }
  };
  function posAtCoords(view2, coords, precise, scanY) {
    let content2 = view2.contentDOM.getBoundingClientRect(), docTop = content2.top + view2.viewState.paddingTop;
    let { x, y } = coords, yOffset = y - docTop, block;
    for (; ; ) {
      if (yOffset < 0)
        return new PosAssoc(0, 1);
      if (yOffset > view2.viewState.docHeight)
        return new PosAssoc(view2.state.doc.length, -1);
      block = view2.elementAtHeight(yOffset);
      if (scanY == null)
        break;
      if (block.type == BlockType.Text) {
        if (scanY < 0 ? block.to < view2.viewport.from : block.from > view2.viewport.to)
          break;
        let rect = view2.docView.coordsAt(scanY < 0 ? block.from : block.to, scanY > 0 ? -1 : 1);
        if (rect && (scanY < 0 ? rect.top <= yOffset + docTop : rect.bottom >= yOffset + docTop))
          break;
      }
      let halfLine = view2.viewState.heightOracle.textHeight / 2;
      yOffset = scanY > 0 ? block.bottom + halfLine : block.top - halfLine;
    }
    if (view2.viewport.from >= block.to || view2.viewport.to <= block.from) {
      if (precise)
        return null;
      if (block.type == BlockType.Text) {
        let pos = posAtCoordsImprecise(view2, content2, block, x, y);
        return new PosAssoc(pos, pos == block.from ? 1 : -1);
      }
    }
    if (block.type != BlockType.Text)
      return yOffset < (block.top + block.bottom) / 2 ? new PosAssoc(block.from, 1) : new PosAssoc(block.to, -1);
    let line = view2.docView.lineAt(block.from, 2);
    if (!line || line.length != block.length)
      line = view2.docView.lineAt(block.from, -2);
    return new InlineCoordsScan(view2, x, y, view2.textDirectionAt(block.from)).scanTile(line, block.from);
  }
  var InlineCoordsScan = class {
    constructor(view2, x, y, baseDir) {
      this.view = view2;
      this.x = x;
      this.y = y;
      this.baseDir = baseDir;
      this.line = null;
      this.spans = null;
    }
    bidiSpansAt(pos) {
      if (!this.line || this.line.from > pos || this.line.to < pos) {
        this.line = this.view.state.doc.lineAt(pos);
        this.spans = this.view.bidiSpans(this.line);
      }
      return this;
    }
    baseDirAt(pos, side) {
      let { line, spans } = this.bidiSpansAt(pos);
      let level = spans[BidiSpan.find(spans, pos - line.from, -1, side)].level;
      return level == this.baseDir;
    }
    dirAt(pos, side) {
      let { line, spans } = this.bidiSpansAt(pos);
      return spans[BidiSpan.find(spans, pos - line.from, -1, side)].dir;
    }
    // Used to short-circuit bidi tests for content with a uniform direction
    bidiIn(from, to) {
      let { spans, line } = this.bidiSpansAt(from);
      return spans.length > 1 || spans.length && (spans[0].level != this.baseDir || spans[0].to + line.from < to);
    }
    // Scan through the rectangles for the content of a tile with inline
    // content, looking for one that overlaps the queried position
    // vertically and is closest horizontally. The caller is responsible
    // for dividing its content into N pieces, and pass an array with
    // N+1 positions (including the position after the last piece). For
    // a text tile, these will be character clusters, for a composite
    // tile, these will be child tiles.
    scan(positions, getRects, recursed = false) {
      let lo = 0, hi = positions.length - 1, seen = /* @__PURE__ */ new Set();
      let bidi = this.bidiIn(positions[0], positions[hi]);
      let above, below;
      let closestI = -1, closestDx = 1e9, closestRect;
      search: while (lo < hi) {
        let dist2 = hi - lo, mid = lo + hi >> 1;
        adjust: if (seen.has(mid)) {
          for (let i2 = 1; i2 < dist2; i2++) {
            let scan = mid + i2;
            if (scan >= hi)
              scan -= dist2;
            if (!seen.has(scan)) {
              mid = scan;
              break adjust;
            }
          }
          break search;
        }
        seen.add(mid);
        let rects = getRects(mid), side = 0;
        if (rects)
          for (let i2 = 0; i2 < rects.length; i2++) {
            let rect = rects[i2];
            if (rect.width == 0 && rects.length > 1)
              continue;
            if (rect.bottom < this.y) {
              if (!above || above.bottom < rect.bottom)
                above = rect;
              side = 1;
            } else if (rect.top > this.y) {
              if (!below || below.top > rect.top)
                below = rect;
              side = -1;
            } else {
              let off = rect.left > this.x ? this.x - rect.left : rect.right < this.x ? this.x - rect.right : 0;
              let dx = Math.abs(off);
              if (dx < closestDx) {
                closestI = mid;
                closestDx = dx;
                closestRect = rect;
              }
              if (off)
                side = off < 0 == (this.baseDir == Direction.LTR) ? -1 : 1;
            }
          }
        if (side == -1 && (!bidi || this.baseDirAt(positions[mid], 1)))
          hi = mid;
        else if (side == 1 && (!bidi || this.baseDirAt(positions[mid + 1], -1)))
          lo = mid + 1;
      }
      if (!closestRect) {
        if (!below && !above)
          return { i: 0, after: false };
        let side = above && (!below || this.y - above.bottom < below.top - this.y) ? above : below;
        this.y = (side.top + side.bottom) / 2;
        return this.scan(positions, getRects, true);
      }
      if (closestDx && !recursed) {
        let { top: top2, bottom } = closestRect;
        if (above && above.bottom > (top2 + top2 + bottom) / 3) {
          this.y = above.bottom - 1;
          return this.scan(positions, getRects, true);
        }
        if (below && below.top < (top2 + bottom + bottom) / 3) {
          this.y = below.top + 1;
          return this.scan(positions, getRects, true);
        }
      }
      let ltr = (bidi ? this.dirAt(positions[closestI], 1) : this.baseDir) == Direction.LTR;
      return {
        i: closestI,
        // Test whether x is closes to the start or end of this element
        after: this.x > (closestRect.left + closestRect.right) / 2 == ltr
      };
    }
    scanText(tile, offset) {
      let positions = [];
      for (let i2 = 0; i2 < tile.length; i2 = findClusterBreak2(tile.text, i2))
        positions.push(offset + i2);
      positions.push(offset + tile.length);
      let scan = this.scan(positions, (i2) => {
        let off = positions[i2] - offset, end = positions[i2 + 1] - offset;
        return textRange(tile.dom, off, end).getClientRects();
      });
      return scan.after ? new PosAssoc(positions[scan.i + 1], -1) : new PosAssoc(positions[scan.i], 1);
    }
    scanTile(tile, offset) {
      if (!tile.length)
        return new PosAssoc(offset, 1);
      if (tile.children.length == 1) {
        let child2 = tile.children[0];
        if (child2.isText())
          return this.scanText(child2, offset);
        else if (child2.isComposite())
          return this.scanTile(child2, offset);
      }
      let positions = [offset];
      for (let i2 = 0, pos2 = offset; i2 < tile.children.length; i2++)
        positions.push(pos2 += tile.children[i2].length);
      let scan = this.scan(positions, (i2) => {
        let child2 = tile.children[i2];
        if (child2.flags & 48)
          return null;
        return (isElt(child2.dom) ? child2.dom : textRange(child2.dom, 0, child2.length)).getClientRects();
      });
      let child = tile.children[scan.i], pos = positions[scan.i];
      if (child.isText())
        return this.scanText(child, pos);
      if (child.isComposite())
        return this.scanTile(child, pos);
      return scan.after ? new PosAssoc(positions[scan.i + 1], -1) : new PosAssoc(pos, 1);
    }
  };
  var LineBreakPlaceholder = "\uFFFF";
  var DOMReader = class {
    constructor(points, view2) {
      this.points = points;
      this.view = view2;
      this.text = "";
      this.lineSeparator = view2.state.facet(EditorState.lineSeparator);
    }
    append(text) {
      this.text += text;
    }
    lineBreak() {
      this.text += LineBreakPlaceholder;
    }
    readRange(start, end) {
      if (!start)
        return this;
      let parent = start.parentNode;
      for (let cur2 = start; ; ) {
        this.findPointBefore(parent, cur2);
        let oldLen = this.text.length;
        this.readNode(cur2);
        let tile = Tile.get(cur2), next = cur2.nextSibling;
        if (next == end) {
          if ((tile === null || tile === void 0 ? void 0 : tile.breakAfter) && !next && parent != this.view.contentDOM)
            this.lineBreak();
          break;
        }
        let nextTile = Tile.get(next);
        if ((tile && nextTile ? tile.breakAfter : (tile ? tile.breakAfter : isBlockElement(cur2)) || isBlockElement(next) && (cur2.nodeName != "BR" || (tile === null || tile === void 0 ? void 0 : tile.isWidget())) && this.text.length > oldLen) && !isEmptyToEnd(next, end))
          this.lineBreak();
        cur2 = next;
      }
      this.findPointBefore(parent, end);
      return this;
    }
    readTextNode(node) {
      let text = node.nodeValue;
      for (let point of this.points)
        if (point.node == node)
          point.pos = this.text.length + Math.min(point.offset, text.length);
      for (let off = 0, re = this.lineSeparator ? null : /\r\n?|\n/g; ; ) {
        let nextBreak = -1, breakSize = 1, m;
        if (this.lineSeparator) {
          nextBreak = text.indexOf(this.lineSeparator, off);
          breakSize = this.lineSeparator.length;
        } else if (m = re.exec(text)) {
          nextBreak = m.index;
          breakSize = m[0].length;
        }
        this.append(text.slice(off, nextBreak < 0 ? text.length : nextBreak));
        if (nextBreak < 0)
          break;
        this.lineBreak();
        if (breakSize > 1) {
          for (let point of this.points)
            if (point.node == node && point.pos > this.text.length)
              point.pos -= breakSize - 1;
        }
        off = nextBreak + breakSize;
      }
    }
    readNode(node) {
      let tile = Tile.get(node);
      let fromView = tile && tile.overrideDOMText;
      if (fromView != null) {
        this.findPointInside(node, fromView.length);
        for (let i2 = fromView.iter(); !i2.next().done; ) {
          if (i2.lineBreak)
            this.lineBreak();
          else
            this.append(i2.value);
        }
      } else if (isText(node)) {
        this.readTextNode(node);
      } else if (node.nodeName == "BR") {
        if (node.nextSibling)
          this.lineBreak();
      } else if (isElt(node)) {
        this.readRange(node.firstChild, null);
      }
    }
    findPointBefore(node, next) {
      for (let point of this.points)
        if (point.node == node && node.childNodes[point.offset] == next)
          point.pos = this.text.length;
    }
    findPointInside(node, length) {
      for (let point of this.points)
        if (isText(node) ? point.node == node : node.contains(point.node))
          point.pos = this.text.length + (isAtEnd(node, point.node, point.offset) ? length : 0);
    }
  };
  function isAtEnd(parent, node, offset) {
    for (; ; ) {
      if (!node || offset < maxOffset(node))
        return false;
      if (node == parent)
        return true;
      offset = domIndex(node) + 1;
      node = node.parentNode;
    }
  }
  function isEmptyToEnd(node, end) {
    let widgets;
    for (; ; node = node.nextSibling) {
      if (node == end || !node)
        break;
      let view2 = Tile.get(node);
      if (!(view2 === null || view2 === void 0 ? void 0 : view2.isWidget()))
        return false;
      if (view2)
        (widgets || (widgets = [])).push(view2);
    }
    if (widgets)
      for (let w of widgets) {
        let override = w.overrideDOMText;
        if (override === null || override === void 0 ? void 0 : override.length)
          return false;
      }
    return true;
  }
  var DOMPoint = class {
    constructor(node, offset) {
      this.node = node;
      this.offset = offset;
      this.pos = -1;
    }
  };
  var DOMChange = class {
    constructor(view2, start, end, typeOver) {
      this.typeOver = typeOver;
      this.bounds = null;
      this.text = "";
      this.domChanged = start > -1;
      let { impreciseHead: iHead, impreciseAnchor: iAnchor } = view2.docView, curSel = view2.state.selection;
      if (view2.state.readOnly && start > -1) {
        this.newSel = null;
      } else if (start > -1 && (this.bounds = domBoundsAround(view2.docView.tile, start, end, 0))) {
        let selPoints = iHead || iAnchor ? [] : selectionPoints(view2);
        let reader = new DOMReader(selPoints, view2);
        reader.readRange(this.bounds.startDOM, this.bounds.endDOM);
        this.text = reader.text;
        this.newSel = selectionFromPoints(selPoints, this.bounds.from);
      } else {
        let domSel = view2.observer.selectionRange;
        let head = iHead && iHead.node == domSel.focusNode && iHead.offset == domSel.focusOffset || !contains(view2.contentDOM, domSel.focusNode) ? curSel.main.head : view2.docView.posFromDOM(domSel.focusNode, domSel.focusOffset);
        let anchor = iAnchor && iAnchor.node == domSel.anchorNode && iAnchor.offset == domSel.anchorOffset || !contains(view2.contentDOM, domSel.anchorNode) ? curSel.main.anchor : view2.docView.posFromDOM(domSel.anchorNode, domSel.anchorOffset);
        let vp = view2.viewport;
        if ((browser.ios || browser.chrome) && head != anchor && Math.min(head, anchor) <= curSel.main.from && Math.max(head, anchor) >= curSel.main.to && (vp.from > 0 || vp.to < view2.state.doc.length)) {
          let from = Math.min(head, anchor), to = Math.max(head, anchor);
          let offFrom = vp.from - from, offTo = vp.to - to;
          if ((offFrom == 0 || offFrom == 1 || from == 0) && (offTo == 0 || offTo == -1 || to == view2.state.doc.length)) {
            head = 0;
            anchor = view2.state.doc.length;
          }
        }
        if (view2.inputState.composing > -1 && curSel.ranges.length > 1) {
          this.newSel = curSel.replaceRange(EditorSelection.range(anchor, head));
        } else if (view2.lineWrapping && anchor == head && !(curSel.main.empty && curSel.main.head == head) && view2.inputState.lastTouchTime > Date.now() - 100) {
          let before = view2.coordsAtPos(head, -1), assoc = 0;
          if (before)
            assoc = view2.inputState.lastTouchY <= before.bottom ? -1 : 1;
          this.newSel = EditorSelection.create([EditorSelection.cursor(head, assoc)]);
        } else {
          this.newSel = EditorSelection.single(anchor, head);
        }
      }
    }
  };
  function domBoundsAround(tile, from, to, offset) {
    if (tile.isComposite()) {
      let fromI = -1, fromStart = -1, toI = -1, toEnd = -1;
      for (let i2 = 0, pos = offset, prevEnd = offset; i2 < tile.children.length; i2++) {
        let child = tile.children[i2], end = pos + child.length;
        if (pos < from && end > to)
          return domBoundsAround(child, from, to, pos);
        if (end >= from && fromI == -1) {
          fromI = i2;
          fromStart = pos;
        }
        if (pos > to && child.dom.parentNode == tile.dom) {
          toI = i2;
          toEnd = prevEnd;
          break;
        }
        prevEnd = end;
        pos = end + child.breakAfter;
      }
      return {
        from: fromStart,
        to: toEnd < 0 ? offset + tile.length : toEnd,
        startDOM: (fromI ? tile.children[fromI - 1].dom.nextSibling : null) || tile.dom.firstChild,
        endDOM: toI < tile.children.length && toI >= 0 ? tile.children[toI].dom : null
      };
    } else if (tile.isText()) {
      return { from: offset, to: offset + tile.length, startDOM: tile.dom, endDOM: tile.dom.nextSibling };
    } else {
      return null;
    }
  }
  function applyDOMChange(view2, domChange) {
    let change;
    let { newSel } = domChange, { state } = view2, sel = state.selection.main;
    let lastKey = view2.inputState.lastKeyTime > Date.now() - 100 ? view2.inputState.lastKeyCode : -1;
    if (domChange.bounds) {
      let { from, to } = domChange.bounds;
      let preferredPos = sel.from, preferredSide = null;
      if (lastKey === 8 || browser.android && domChange.text.length < to - from) {
        preferredPos = sel.to;
        preferredSide = "end";
      }
      let cmp = state.doc.sliceString(from, to, LineBreakPlaceholder), selEnd, diff;
      if (!sel.empty && sel.from >= from && sel.to <= to && (domChange.typeOver || cmp != domChange.text) && cmp.slice(0, sel.from - from) == domChange.text.slice(0, sel.from - from) && cmp.slice(sel.to - from) == domChange.text.slice(selEnd = domChange.text.length - (cmp.length - (sel.to - from)))) {
        change = {
          from: sel.from,
          to: sel.to,
          insert: Text.of(domChange.text.slice(sel.from - from, selEnd).split(LineBreakPlaceholder))
        };
      } else if (diff = findDiff(cmp, domChange.text, preferredPos - from, preferredSide)) {
        if (browser.chrome && lastKey == 13 && diff.toB == diff.from + 2 && domChange.text.slice(diff.from, diff.toB) == LineBreakPlaceholder + LineBreakPlaceholder)
          diff.toB--;
        change = {
          from: from + diff.from,
          to: from + diff.toA,
          insert: Text.of(domChange.text.slice(diff.from, diff.toB).split(LineBreakPlaceholder))
        };
      }
    } else if (newSel && (!view2.hasFocus && state.facet(editable) || sameSelPos(newSel, sel))) {
      newSel = null;
    }
    if (!change && !newSel)
      return false;
    if ((browser.mac || browser.android) && change && change.from == change.to && change.from == sel.head - 1 && /^\. ?$/.test(change.insert.toString()) && view2.contentDOM.getAttribute("autocorrect") == "off") {
      if (newSel && change.insert.length == 2)
        newSel = EditorSelection.single(newSel.main.anchor - 1, newSel.main.head - 1);
      change = { from: change.from, to: change.to, insert: Text.of([change.insert.toString().replace(".", " ")]) };
    } else if (state.doc.lineAt(sel.from).to < sel.to && view2.docView.lineHasWidget(sel.to) && view2.inputState.insertingTextAt > Date.now() - 50) {
      change = {
        from: sel.from,
        to: sel.to,
        insert: state.toText(view2.inputState.insertingText)
      };
    } else if (browser.chrome && change && change.from == change.to && change.from == sel.head && change.insert.toString() == "\n " && view2.lineWrapping) {
      if (newSel)
        newSel = EditorSelection.single(newSel.main.anchor - 1, newSel.main.head - 1);
      change = { from: sel.from, to: sel.to, insert: Text.of([" "]) };
    }
    if (change) {
      return applyDOMChangeInner(view2, change, newSel, lastKey);
    } else if (newSel && !sameSelPos(newSel, sel)) {
      let scrollIntoView3 = false, userEvent = "select";
      if (view2.inputState.lastSelectionTime > Date.now() - 50) {
        if (view2.inputState.lastSelectionOrigin == "select")
          scrollIntoView3 = true;
        userEvent = view2.inputState.lastSelectionOrigin;
        if (userEvent == "select.pointer")
          newSel = skipAtomsForSelection(state.facet(atomicRanges).map((f) => f(view2)), newSel);
      }
      view2.dispatch({ selection: newSel, scrollIntoView: scrollIntoView3, userEvent });
      return true;
    } else {
      return false;
    }
  }
  function applyDOMChangeInner(view2, change, newSel, lastKey = -1) {
    if (browser.ios && view2.inputState.flushIOSKey(change))
      return true;
    let sel = view2.state.selection.main;
    if (browser.android && (change.to == sel.to && // GBoard will sometimes remove a space it just inserted
    // after a completion when you press enter
    (change.from == sel.from || change.from == sel.from - 1 && view2.state.sliceDoc(change.from, sel.from) == " ") && change.insert.length == 1 && change.insert.lines == 2 && dispatchKey(view2.contentDOM, "Enter", 13) || (change.from == sel.from - 1 && change.to == sel.to && change.insert.length == 0 || lastKey == 8 && change.insert.length < change.to - change.from && change.to > sel.head) && dispatchKey(view2.contentDOM, "Backspace", 8) || change.from == sel.from && change.to == sel.to + 1 && change.insert.length == 0 && dispatchKey(view2.contentDOM, "Delete", 46)))
      return true;
    let text = change.insert.toString();
    if (view2.inputState.composing >= 0)
      view2.inputState.composing++;
    let defaultTr;
    let defaultInsert = () => defaultTr || (defaultTr = applyDefaultInsert(view2, change, newSel));
    if (!view2.state.facet(inputHandler).some((h) => h(view2, change.from, change.to, text, defaultInsert)))
      view2.dispatch(defaultInsert());
    return true;
  }
  function applyDefaultInsert(view2, change, newSel) {
    let tr, startState = view2.state, sel = startState.selection.main, inAtomic = -1;
    if (change.from == change.to && change.from < sel.from || change.from > sel.to) {
      let side = change.from < sel.from ? -1 : 1, pos = side < 0 ? sel.from : sel.to;
      let moved = skipAtomicRanges(startState.facet(atomicRanges).map((f) => f(view2)), pos, side);
      if (change.from == moved)
        inAtomic = moved;
    }
    if (inAtomic > -1) {
      tr = {
        changes: change,
        selection: EditorSelection.cursor(change.from + change.insert.length, -1)
      };
    } else if (change.from >= sel.from && change.to <= sel.to && change.to - change.from >= (sel.to - sel.from) / 3 && (!newSel || newSel.main.empty && newSel.main.from == change.from + change.insert.length) && view2.inputState.composing < 0) {
      let before = sel.from < change.from ? startState.sliceDoc(sel.from, change.from) : "";
      let after = sel.to > change.to ? startState.sliceDoc(change.to, sel.to) : "";
      tr = startState.replaceSelection(view2.state.toText(before + change.insert.sliceString(0, void 0, view2.state.lineBreak) + after));
    } else {
      let changes = startState.changes(change);
      let mainSel = newSel && newSel.main.to <= changes.newLength ? newSel.main : void 0;
      if (startState.selection.ranges.length > 1 && (view2.inputState.composing >= 0 || view2.inputState.compositionPendingChange) && change.to <= sel.to + 10 && change.to >= sel.to - 10) {
        let replaced = view2.state.sliceDoc(change.from, change.to);
        let compositionRange, composition = newSel && findCompositionNode(view2, newSel.main.head);
        if (composition) {
          let dLen = change.insert.length - (change.to - change.from);
          compositionRange = { from: composition.from, to: composition.to - dLen };
        } else {
          compositionRange = view2.state.doc.lineAt(sel.head);
        }
        let offset = sel.to - change.to;
        tr = startState.changeByRange((range) => {
          if (range.from == sel.from && range.to == sel.to)
            return { changes, range: mainSel || range.map(changes) };
          let to = range.to - offset, from = to - replaced.length;
          if (view2.state.sliceDoc(from, to) != replaced || // Unfortunately, there's no way to make multiple
          // changes in the same node work without aborting
          // composition, so cursors in the composition range are
          // ignored.
          to >= compositionRange.from && from <= compositionRange.to)
            return { range };
          let rangeChanges = startState.changes({ from, to, insert: change.insert }), selOff = range.to - sel.to;
          return {
            changes: rangeChanges,
            range: !mainSel ? range.map(rangeChanges) : EditorSelection.range(Math.max(0, mainSel.anchor + selOff), Math.max(0, mainSel.head + selOff))
          };
        });
      } else {
        tr = {
          changes,
          selection: mainSel && startState.selection.replaceRange(mainSel)
        };
      }
    }
    let userEvent = "input.type";
    if (view2.composing || view2.inputState.compositionPendingChange && view2.inputState.compositionEndedAt > Date.now() - 50) {
      view2.inputState.compositionPendingChange = false;
      userEvent += ".compose";
      if (view2.inputState.compositionFirstChange) {
        userEvent += ".start";
        view2.inputState.compositionFirstChange = false;
      }
    }
    return startState.update(tr, { userEvent, scrollIntoView: true });
  }
  function findDiff(a, b, preferredPos, preferredSide) {
    let minLen = Math.min(a.length, b.length);
    let from = 0;
    while (from < minLen && a.charCodeAt(from) == b.charCodeAt(from))
      from++;
    if (from == minLen && a.length == b.length)
      return null;
    let toA = a.length, toB = b.length;
    while (toA > 0 && toB > 0 && a.charCodeAt(toA - 1) == b.charCodeAt(toB - 1)) {
      toA--;
      toB--;
    }
    if (preferredSide == "end") {
      let adjust = Math.max(0, from - Math.min(toA, toB));
      preferredPos -= toA + adjust - from;
    }
    if (toA < from && a.length < b.length) {
      let move = preferredPos <= from && preferredPos >= toA ? from - preferredPos : 0;
      from -= move;
      toB = from + (toB - toA);
      toA = from;
    } else if (toB < from) {
      let move = preferredPos <= from && preferredPos >= toB ? from - preferredPos : 0;
      from -= move;
      toA = from + (toA - toB);
      toB = from;
    }
    return { from, toA, toB };
  }
  function selectionPoints(view2) {
    let result = [];
    if (view2.root.activeElement != view2.contentDOM)
      return result;
    let { anchorNode, anchorOffset, focusNode, focusOffset } = view2.observer.selectionRange;
    if (anchorNode) {
      result.push(new DOMPoint(anchorNode, anchorOffset));
      if (focusNode != anchorNode || focusOffset != anchorOffset)
        result.push(new DOMPoint(focusNode, focusOffset));
    }
    return result;
  }
  function selectionFromPoints(points, base2) {
    if (points.length == 0)
      return null;
    let anchor = points[0].pos, head = points.length == 2 ? points[1].pos : anchor;
    return anchor < 0 || head < 0 ? null : anchor == head ? EditorSelection.create([EditorSelection.cursor(head + base2, -1)]) : EditorSelection.single(anchor + base2, head + base2);
  }
  function sameSelPos(selection, range) {
    return range.head == selection.main.head && range.anchor == selection.main.anchor;
  }
  var InputState = class {
    setSelectionOrigin(origin) {
      this.lastSelectionOrigin = origin;
      this.lastSelectionTime = Date.now();
    }
    constructor(view2) {
      this.view = view2;
      this.lastKeyCode = 0;
      this.lastKeyTime = 0;
      this.touchActive = false;
      this.lastTouchTime = 0;
      this.lastTouchX = 0;
      this.lastTouchY = 0;
      this.lastFocusTime = 0;
      this.lastScrollTop = 0;
      this.lastScrollLeft = 0;
      this.lastWheelEvent = 0;
      this.pendingIOSKey = void 0;
      this.lastIOSMomentumScroll = 0;
      this.tabFocusMode = -1;
      this.lastSelectionOrigin = null;
      this.lastSelectionTime = 0;
      this.lastContextMenu = 0;
      this.scrollHandlers = [];
      this.handlers = /* @__PURE__ */ Object.create(null);
      this.composing = -1;
      this.compositionFirstChange = null;
      this.compositionEndedAt = 0;
      this.compositionPendingKey = false;
      this.compositionPendingChange = false;
      this.insertingText = "";
      this.insertingTextAt = 0;
      this.mouseSelection = null;
      this.draggedContent = null;
      this.handleEvent = this.handleEvent.bind(this);
      this.notifiedFocused = view2.hasFocus;
      if (browser.safari)
        view2.contentDOM.addEventListener("input", () => null);
      if (browser.gecko)
        firefoxCopyCutHack(view2.contentDOM.ownerDocument);
    }
    handleEvent(event) {
      if (!eventBelongsToEditor(this.view, event) || this.ignoreDuringComposition(event))
        return;
      if (event.type == "keydown" && this.keydown(event))
        return;
      if (this.view.updateState != 0)
        Promise.resolve().then(() => this.runHandlers(event.type, event));
      else
        this.runHandlers(event.type, event);
    }
    runHandlers(type, event) {
      let handlers2 = this.handlers[type];
      if (handlers2) {
        for (let observer of handlers2.observers)
          observer(this.view, event);
        for (let handler of handlers2.handlers) {
          if (event.defaultPrevented)
            break;
          if (handler(this.view, event)) {
            event.preventDefault();
            break;
          }
        }
      }
    }
    ensureHandlers(plugins) {
      let handlers2 = computeHandlers(plugins), prev = this.handlers, dom = this.view.contentDOM;
      for (let type in handlers2)
        if (type != "scroll") {
          let passive = !handlers2[type].handlers.length;
          let exists = prev[type];
          if (exists && passive != !exists.handlers.length) {
            dom.removeEventListener(type, this.handleEvent);
            exists = null;
          }
          if (!exists)
            dom.addEventListener(type, this.handleEvent, { passive });
        }
      for (let type in prev)
        if (type != "scroll" && !handlers2[type])
          dom.removeEventListener(type, this.handleEvent);
      this.handlers = handlers2;
    }
    keydown(event) {
      this.lastKeyCode = event.keyCode;
      this.lastKeyTime = Date.now();
      if (event.keyCode == 9 && this.tabFocusMode > -1 && (!this.tabFocusMode || Date.now() <= this.tabFocusMode))
        return true;
      if (this.tabFocusMode > 0 && event.keyCode != 27 && modifierCodes.indexOf(event.keyCode) < 0)
        this.tabFocusMode = -1;
      if (browser.android && browser.chrome && !event.synthetic && (event.keyCode == 13 || event.keyCode == 8)) {
        this.view.observer.delayAndroidKey(event.key, event.keyCode);
        return true;
      }
      if (browser.ios && !event.synthetic && !event.altKey && !event.metaKey && (PendingKeys.some((key) => key.keyCode == event.keyCode) && !event.ctrlKey || EmacsyPendingKeys.indexOf(event.key) > -1 && event.ctrlKey)) {
        let mods = { ctrlKey: event.ctrlKey, altKey: event.altKey, metaKey: event.metaKey, shiftKey: event.shiftKey };
        if (mods.shiftKey && browser.ios && !/^(off|none)$/.test(this.view.contentDOM.autocapitalize) && iosVirtualKeyboardOpen(this.view.win))
          mods.shiftKey = false;
        let pending = this.pendingIOSKey = { key: event.key, keyCode: event.keyCode, mods };
        setTimeout(() => {
          if (this.pendingIOSKey == pending)
            this.flushIOSKey();
        }, 50);
        return true;
      }
      if (event.keyCode != 229)
        this.view.observer.forceFlush();
      return false;
    }
    flushIOSKey(change) {
      let key = this.pendingIOSKey;
      if (!key || this.view.observer.pendingRecords().length)
        return false;
      if (key.key == "Enter" && change && change.from < change.to && /^\S+$/.test(change.insert.toString()))
        return false;
      this.pendingIOSKey = void 0;
      return dispatchKey(this.view.contentDOM, key.key, key.keyCode, key.mods);
    }
    ignoreDuringComposition(event) {
      if (!/^key/.test(event.type) || event.synthetic)
        return false;
      if (this.composing > 0)
        return true;
      if (browser.safari && !browser.ios && this.compositionPendingKey && Date.now() - this.compositionEndedAt < 100) {
        this.compositionPendingKey = false;
        return true;
      }
      return false;
    }
    startMouseSelection(mouseSelection) {
      if (this.mouseSelection)
        this.mouseSelection.destroy();
      this.mouseSelection = mouseSelection;
    }
    update(update) {
      this.view.observer.update(update);
      if (this.mouseSelection)
        this.mouseSelection.update(update);
      if (this.draggedContent && update.docChanged)
        this.draggedContent = this.draggedContent.map(update.changes);
      if (update.transactions.length)
        this.lastKeyCode = this.lastSelectionTime = 0;
    }
    destroy() {
      if (this.mouseSelection)
        this.mouseSelection.destroy();
    }
  };
  function iosVirtualKeyboardOpen(win) {
    if (!win.visualViewport)
      return false;
    return win.visualViewport.height * win.visualViewport.scale / win.document.documentElement.clientHeight < 0.85;
  }
  function bindHandler(plugin, handler) {
    return (view2, event) => {
      try {
        return handler.call(plugin, event, view2);
      } catch (e) {
        logException(view2.state, e);
      }
    };
  }
  function computeHandlers(plugins) {
    let result = /* @__PURE__ */ Object.create(null);
    function record(type) {
      return result[type] || (result[type] = { observers: [], handlers: [] });
    }
    for (let plugin of plugins) {
      let spec = plugin.spec, handlers2 = spec && spec.plugin.domEventHandlers, observers2 = spec && spec.plugin.domEventObservers;
      if (handlers2)
        for (let type in handlers2) {
          let f = handlers2[type];
          if (f)
            record(type).handlers.push(bindHandler(plugin.value, f));
        }
      if (observers2)
        for (let type in observers2) {
          let f = observers2[type];
          if (f)
            record(type).observers.push(bindHandler(plugin.value, f));
        }
    }
    for (let type in handlers)
      record(type).handlers.push(handlers[type]);
    for (let type in observers)
      record(type).observers.push(observers[type]);
    return result;
  }
  var PendingKeys = [
    { key: "Backspace", keyCode: 8, inputType: "deleteContentBackward" },
    { key: "Enter", keyCode: 13, inputType: "insertParagraph" },
    { key: "Enter", keyCode: 13, inputType: "insertLineBreak" },
    { key: "Delete", keyCode: 46, inputType: "deleteContentForward" }
  ];
  var EmacsyPendingKeys = "dthko";
  var modifierCodes = [16, 17, 18, 20, 91, 92, 224, 225];
  var dragScrollMargin = 6;
  function dragScrollSpeed(dist2) {
    return Math.max(0, dist2) * 0.7 + 8;
  }
  function dist(a, b) {
    return Math.max(Math.abs(a.clientX - b.clientX), Math.abs(a.clientY - b.clientY));
  }
  var MouseSelection = class {
    constructor(view2, startEvent, style, mustSelect) {
      this.view = view2;
      this.startEvent = startEvent;
      this.style = style;
      this.mustSelect = mustSelect;
      this.scrollSpeed = { x: 0, y: 0 };
      this.scrolling = -1;
      this.lastEvent = startEvent;
      this.scrollParents = scrollableParents(view2.contentDOM);
      this.atoms = view2.state.facet(atomicRanges).map((f) => f(view2));
      let doc2 = view2.contentDOM.ownerDocument;
      doc2.addEventListener("mousemove", this.move = this.move.bind(this));
      doc2.addEventListener("mouseup", this.up = this.up.bind(this));
      this.extend = startEvent.shiftKey;
      this.multiple = view2.state.facet(EditorState.allowMultipleSelections) && addsSelectionRange(view2, startEvent);
      this.dragging = isInPrimarySelection(view2, startEvent) && getClickType(startEvent) == 1 ? null : false;
    }
    start(event) {
      if (this.dragging === false)
        this.select(event);
    }
    move(event) {
      if (event.buttons == 0)
        return this.destroy();
      if (this.dragging || this.dragging == null && dist(this.startEvent, event) < 10)
        return;
      this.select(this.lastEvent = event);
      let sx = 0, sy = 0;
      let left = 0, top2 = 0, right = this.view.win.innerWidth, bottom = this.view.win.innerHeight;
      if (this.scrollParents.x)
        ({ left, right } = this.scrollParents.x.getBoundingClientRect());
      if (this.scrollParents.y)
        ({ top: top2, bottom } = this.scrollParents.y.getBoundingClientRect());
      let margins = getScrollMargins(this.view);
      if (event.clientX - margins.left <= left + dragScrollMargin)
        sx = -dragScrollSpeed(left - event.clientX);
      else if (event.clientX + margins.right >= right - dragScrollMargin)
        sx = dragScrollSpeed(event.clientX - right);
      if (event.clientY - margins.top <= top2 + dragScrollMargin)
        sy = -dragScrollSpeed(top2 - event.clientY);
      else if (event.clientY + margins.bottom >= bottom - dragScrollMargin)
        sy = dragScrollSpeed(event.clientY - bottom);
      this.setScrollSpeed(sx, sy);
    }
    up(event) {
      if (this.dragging == null)
        this.select(this.lastEvent);
      if (!this.dragging)
        event.preventDefault();
      this.destroy();
    }
    destroy() {
      this.setScrollSpeed(0, 0);
      let doc2 = this.view.contentDOM.ownerDocument;
      doc2.removeEventListener("mousemove", this.move);
      doc2.removeEventListener("mouseup", this.up);
      this.view.inputState.mouseSelection = this.view.inputState.draggedContent = null;
    }
    setScrollSpeed(sx, sy) {
      this.scrollSpeed = { x: sx, y: sy };
      if (sx || sy) {
        if (this.scrolling < 0)
          this.scrolling = setInterval(() => this.scroll(), 50);
      } else if (this.scrolling > -1) {
        clearInterval(this.scrolling);
        this.scrolling = -1;
      }
    }
    scroll() {
      let { x, y } = this.scrollSpeed;
      if (x && this.scrollParents.x) {
        this.scrollParents.x.scrollLeft += x;
        x = 0;
      }
      if (y && this.scrollParents.y) {
        this.scrollParents.y.scrollTop += y;
        y = 0;
      }
      if (x || y)
        this.view.win.scrollBy(x, y);
      if (this.dragging === false)
        this.select(this.lastEvent);
    }
    select(event) {
      let { view: view2 } = this, selection = skipAtomsForSelection(this.atoms, this.style.get(event, this.extend, this.multiple));
      if (this.mustSelect || !selection.eq(view2.state.selection, this.dragging === false))
        this.view.dispatch({
          selection,
          userEvent: "select.pointer"
        });
      this.mustSelect = false;
    }
    update(update) {
      if (update.transactions.some((tr) => tr.isUserEvent("input.type")))
        this.destroy();
      else if (this.style.update(update))
        setTimeout(() => this.select(this.lastEvent), 20);
    }
  };
  function addsSelectionRange(view2, event) {
    let facet = view2.state.facet(clickAddsSelectionRange);
    return facet.length ? facet[0](event) : browser.mac ? event.metaKey : event.ctrlKey;
  }
  function dragMovesSelection(view2, event) {
    let facet = view2.state.facet(dragMovesSelection$1);
    return facet.length ? facet[0](event) : browser.mac ? !event.altKey : !event.ctrlKey;
  }
  function isInPrimarySelection(view2, event) {
    let { main } = view2.state.selection;
    if (main.empty)
      return false;
    let sel = getSelection(view2.root);
    if (!sel || sel.rangeCount == 0)
      return true;
    let rects = sel.getRangeAt(0).getClientRects();
    for (let i2 = 0; i2 < rects.length; i2++) {
      let rect = rects[i2];
      if (rect.left <= event.clientX && rect.right >= event.clientX && rect.top <= event.clientY && rect.bottom >= event.clientY)
        return true;
    }
    return false;
  }
  function eventBelongsToEditor(view2, event) {
    if (!event.bubbles)
      return true;
    if (event.defaultPrevented)
      return false;
    for (let node = event.target, tile; node != view2.contentDOM; node = node.parentNode)
      if (!node || node.nodeType == 11 || (tile = Tile.get(node)) && tile.isWidget() && !tile.isHidden && tile.widget.ignoreEvent(event))
        return false;
    return true;
  }
  var handlers = /* @__PURE__ */ Object.create(null);
  var observers = /* @__PURE__ */ Object.create(null);
  var brokenClipboardAPI = browser.ie && browser.ie_version < 15 || browser.ios && browser.webkit_version < 604;
  function capturePaste(view2) {
    let parent = view2.dom.parentNode;
    if (!parent)
      return;
    let target = parent.appendChild(document.createElement("textarea"));
    target.style.cssText = "position: fixed; left: -10000px; top: 10px";
    target.focus();
    setTimeout(() => {
      view2.focus();
      target.remove();
      doPaste(view2, target.value);
    }, 50);
  }
  function textFilter(state, facet, text) {
    for (let filter of state.facet(facet))
      text = filter(text, state);
    return text;
  }
  function doPaste(view2, input) {
    input = textFilter(view2.state, clipboardInputFilter, input);
    let { state } = view2, changes, i2 = 1, text = state.toText(input);
    let byLine = text.lines == state.selection.ranges.length;
    let linewise = lastLinewiseCopy != null && state.selection.ranges.every((r) => r.empty) && lastLinewiseCopy == text.toString();
    if (linewise) {
      let lastLine = -1;
      changes = state.changeByRange((range) => {
        let line = state.doc.lineAt(range.from);
        if (line.from == lastLine)
          return { range };
        lastLine = line.from;
        let insert2 = state.toText((byLine ? text.line(i2++).text : input) + state.lineBreak);
        return {
          changes: { from: line.from, insert: insert2 },
          range: EditorSelection.cursor(range.from + insert2.length, -1)
        };
      });
    } else if (byLine) {
      changes = state.changeByRange((range) => {
        let line = text.line(i2++);
        return {
          changes: { from: range.from, to: range.to, insert: line.text },
          range: EditorSelection.cursor(range.from + line.length, -1)
        };
      });
    } else {
      changes = state.replaceSelection(text);
    }
    view2.dispatch(changes, {
      userEvent: "input.paste",
      scrollIntoView: true
    });
  }
  observers.scroll = (view2) => {
    let iState = view2.inputState;
    iState.lastScrollTop = view2.scrollDOM.scrollTop;
    iState.lastScrollLeft = view2.scrollDOM.scrollLeft;
    if (browser.ios && !iState.touchActive)
      iState.lastIOSMomentumScroll = Date.now();
  };
  observers.wheel = observers.mousewheel = (view2) => {
    view2.inputState.lastWheelEvent = Date.now();
  };
  handlers.keydown = (view2, event) => {
    view2.inputState.setSelectionOrigin("select");
    if (event.keyCode == 27 && view2.inputState.tabFocusMode != 0)
      view2.inputState.tabFocusMode = Date.now() + 2e3;
    return false;
  };
  observers.touchstart = (view2, e) => {
    let iState = view2.inputState, touch = e.targetTouches[0];
    iState.touchActive = true;
    iState.lastTouchTime = Date.now();
    if (touch) {
      iState.lastTouchX = touch.clientX;
      iState.lastTouchY = touch.clientY;
    }
    iState.setSelectionOrigin("select.pointer");
  };
  observers.touchmove = (view2) => {
    view2.inputState.setSelectionOrigin("select.pointer");
  };
  observers.touchend = (view2, e) => {
    view2.inputState.touchActive = false;
  };
  handlers.mousedown = (view2, event) => {
    view2.observer.flush();
    if (view2.inputState.lastTouchTime > Date.now() - 2e3)
      return false;
    let style = null;
    for (let makeStyle of view2.state.facet(mouseSelectionStyle)) {
      style = makeStyle(view2, event);
      if (style)
        break;
    }
    if (!style && event.button == 0)
      style = basicMouseSelection(view2, event);
    if (style) {
      let mustFocus = !view2.hasFocus;
      view2.inputState.startMouseSelection(new MouseSelection(view2, event, style, mustFocus));
      if (mustFocus)
        view2.observer.ignore(() => {
          focusPreventScroll(view2.contentDOM);
          let active = view2.root.activeElement;
          if (active && !active.contains(view2.contentDOM))
            active.blur();
        });
      let mouseSel = view2.inputState.mouseSelection;
      if (mouseSel) {
        mouseSel.start(event);
        return mouseSel.dragging === false;
      }
    } else {
      view2.inputState.setSelectionOrigin("select.pointer");
    }
    return false;
  };
  function rangeForClick(view2, pos, bias, type) {
    if (type == 1) {
      return EditorSelection.cursor(pos, bias);
    } else if (type == 2) {
      return groupAt(view2.state, pos, bias);
    } else {
      let visual = view2.docView.lineAt(pos, bias), line = view2.state.doc.lineAt(visual ? visual.posAtEnd : pos);
      let from = visual ? visual.posAtStart : line.from, to = visual ? visual.posAtEnd : line.to;
      if (to < view2.state.doc.length && to == line.to)
        to++;
      return EditorSelection.undirectionalRange(from, to);
    }
  }
  var BadMouseDetail = browser.ie && browser.ie_version <= 11;
  var lastMouseDown = null;
  var lastMouseDownCount = 0;
  var lastMouseDownTime = 0;
  function getClickType(event) {
    if (!BadMouseDetail)
      return event.detail;
    let last2 = lastMouseDown, lastTime = lastMouseDownTime;
    lastMouseDown = event;
    lastMouseDownTime = Date.now();
    return lastMouseDownCount = !last2 || lastTime > Date.now() - 400 && Math.abs(last2.clientX - event.clientX) < 2 && Math.abs(last2.clientY - event.clientY) < 2 ? (lastMouseDownCount + 1) % 3 : 1;
  }
  function basicMouseSelection(view2, event) {
    let start = view2.posAndSideAtCoords({ x: event.clientX, y: event.clientY }, false), type = getClickType(event);
    let startSel = view2.state.selection;
    return {
      update(update) {
        if (update.docChanged) {
          start.pos = update.changes.mapPos(start.pos);
          startSel = startSel.map(update.changes);
        }
      },
      get(event2, extend, multiple) {
        let cur2 = view2.posAndSideAtCoords({ x: event2.clientX, y: event2.clientY }, false), removed;
        let range = rangeForClick(view2, cur2.pos, cur2.assoc, type);
        if (start.pos != cur2.pos && !extend) {
          let startRange = rangeForClick(view2, start.pos, start.assoc, type);
          let from = Math.min(startRange.from, range.from), to = Math.max(startRange.to, range.to);
          range = from < range.from ? EditorSelection.range(from, to, range.assoc) : EditorSelection.range(to, from, range.assoc);
        }
        if (extend)
          return startSel.replaceRange(startSel.main.extend(range.from, range.to, range.assoc));
        else if (multiple && type == 1 && startSel.ranges.length > 1 && (removed = removeRangeAround(startSel, cur2.pos)))
          return removed;
        else if (multiple)
          return startSel.addRange(range);
        else
          return EditorSelection.create([range]);
      }
    };
  }
  function removeRangeAround(sel, pos) {
    for (let i2 = 0; i2 < sel.ranges.length; i2++) {
      let { from, to } = sel.ranges[i2];
      if (from <= pos && to >= pos)
        return EditorSelection.create(sel.ranges.slice(0, i2).concat(sel.ranges.slice(i2 + 1)), sel.mainIndex == i2 ? 0 : sel.mainIndex - (sel.mainIndex > i2 ? 1 : 0));
    }
    return null;
  }
  handlers.dragstart = (view2, event) => {
    let { selection: { main: range } } = view2.state;
    if (event.target.draggable) {
      let tile = view2.docView.tile.nearest(event.target);
      if (tile && tile.isWidget()) {
        let from = tile.posAtStart, to = from + tile.length;
        if (from >= range.to || to <= range.from)
          range = EditorSelection.undirectionalRange(from, to);
      }
    }
    let { inputState } = view2;
    if (inputState.mouseSelection)
      inputState.mouseSelection.dragging = true;
    inputState.draggedContent = range;
    if (event.dataTransfer) {
      event.dataTransfer.setData("Text", textFilter(view2.state, clipboardOutputFilter, view2.state.sliceDoc(range.from, range.to)));
      event.dataTransfer.effectAllowed = "copyMove";
    }
    return false;
  };
  handlers.dragend = (view2) => {
    view2.inputState.draggedContent = null;
    return false;
  };
  function dropText(view2, event, text, direct) {
    text = textFilter(view2.state, clipboardInputFilter, text);
    if (!text)
      return;
    let dropPos = view2.posAtCoords({ x: event.clientX, y: event.clientY }, false);
    let { draggedContent } = view2.inputState;
    let del = direct && draggedContent && dragMovesSelection(view2, event) ? { from: draggedContent.from, to: draggedContent.to } : null;
    let ins = { from: dropPos, insert: text };
    let changes = view2.state.changes(del ? [del, ins] : ins);
    view2.focus();
    view2.dispatch({
      changes,
      selection: { anchor: changes.mapPos(dropPos, -1), head: changes.mapPos(dropPos, 1) },
      userEvent: del ? "move.drop" : "input.drop"
    });
    view2.inputState.draggedContent = null;
  }
  handlers.drop = (view2, event) => {
    if (!event.dataTransfer)
      return false;
    if (view2.state.readOnly)
      return true;
    let files = event.dataTransfer.files;
    if (files && files.length) {
      let text = Array(files.length), read = 0;
      let finishFile = () => {
        if (++read == files.length)
          dropText(view2, event, text.filter((s) => s != null).join(view2.state.lineBreak), false);
      };
      for (let i2 = 0; i2 < files.length; i2++) {
        let reader = new FileReader();
        reader.onerror = finishFile;
        reader.onload = () => {
          if (!/[\x00-\x08\x0e-\x1f]{2}/.test(reader.result))
            text[i2] = reader.result;
          finishFile();
        };
        reader.readAsText(files[i2]);
      }
      return true;
    } else {
      let text = event.dataTransfer.getData("Text");
      if (text) {
        dropText(view2, event, text, true);
        return true;
      }
    }
    return false;
  };
  handlers.paste = (view2, event) => {
    if (view2.state.readOnly)
      return true;
    view2.observer.flush();
    let data = brokenClipboardAPI ? null : event.clipboardData;
    if (data) {
      doPaste(view2, data.getData("text/plain") || data.getData("text/uri-list"));
      return true;
    } else {
      capturePaste(view2);
      return false;
    }
  };
  function captureCopy(view2, text) {
    let parent = view2.dom.parentNode;
    if (!parent)
      return;
    let target = parent.appendChild(document.createElement("textarea"));
    target.style.cssText = "position: fixed; left: -10000px; top: 10px";
    target.value = text;
    target.focus();
    target.selectionEnd = text.length;
    target.selectionStart = 0;
    setTimeout(() => {
      target.remove();
      view2.focus();
    }, 50);
  }
  function copiedRange(state) {
    let content2 = [], ranges = [], linewise = false;
    for (let range of state.selection.ranges)
      if (!range.empty) {
        content2.push(state.sliceDoc(range.from, range.to));
        ranges.push(range);
      }
    if (!content2.length) {
      let upto = -1;
      for (let { from } of state.selection.ranges) {
        let line = state.doc.lineAt(from);
        if (line.number > upto) {
          content2.push(line.text);
          ranges.push({ from: line.from, to: Math.min(state.doc.length, line.to + 1) });
        }
        upto = line.number;
      }
      linewise = true;
    }
    return { text: textFilter(state, clipboardOutputFilter, content2.join(state.lineBreak)), ranges, linewise };
  }
  var lastLinewiseCopy = null;
  handlers.copy = handlers.cut = (view2, event) => {
    if (!hasSelection(view2.contentDOM, view2.observer.selectionRange))
      return false;
    let { text, ranges, linewise } = copiedRange(view2.state);
    if (!text && !linewise)
      return false;
    lastLinewiseCopy = linewise ? text : null;
    if (event.type == "cut" && !view2.state.readOnly)
      view2.dispatch({
        changes: ranges,
        scrollIntoView: true,
        userEvent: "delete.cut"
      });
    let data = brokenClipboardAPI ? null : event.clipboardData;
    if (data) {
      data.clearData();
      data.setData("text/plain", text);
      return true;
    } else {
      captureCopy(view2, text);
      return false;
    }
  };
  var isFocusChange = /* @__PURE__ */ Annotation.define();
  function focusChangeTransaction(state, focus) {
    let effects = [];
    for (let getEffect of state.facet(focusChangeEffect)) {
      let effect = getEffect(state, focus);
      if (effect)
        effects.push(effect);
    }
    return effects.length ? state.update({ effects, annotations: isFocusChange.of(true) }) : null;
  }
  function updateForFocusChange(view2) {
    setTimeout(() => {
      let focus = view2.hasFocus;
      if (focus != view2.inputState.notifiedFocused) {
        let tr = focusChangeTransaction(view2.state, focus);
        if (tr)
          view2.dispatch(tr);
        else
          view2.update([]);
      }
    }, 10);
  }
  observers.focus = (view2) => {
    view2.inputState.lastFocusTime = Date.now();
    if (!view2.scrollDOM.scrollTop && (view2.inputState.lastScrollTop || view2.inputState.lastScrollLeft)) {
      view2.scrollDOM.scrollTop = view2.inputState.lastScrollTop;
      view2.scrollDOM.scrollLeft = view2.inputState.lastScrollLeft;
    }
    updateForFocusChange(view2);
  };
  observers.blur = (view2) => {
    view2.observer.clearSelectionRange();
    updateForFocusChange(view2);
  };
  observers.compositionstart = observers.compositionupdate = (view2, event) => {
    if (view2.observer.editContext)
      return;
    if (view2.inputState.compositionFirstChange == null)
      view2.inputState.compositionFirstChange = true;
    if (view2.inputState.composing < 0) {
      let { main } = view2.state.selection;
      if (!main.empty && view2.lineBlockAt(main.from).from != view2.lineBlockAt(main.to).from && !view2.state.readOnly) {
        view2.dispatch({
          changes: view2.state.selection.ranges.filter((r) => !r.empty).map((r) => ({ from: r.from, to: r.to })),
          userEvent: "input"
        });
      }
      view2.inputState.composing = 0;
    }
  };
  observers.compositionend = (view2) => {
    if (view2.observer.editContext)
      return;
    view2.inputState.composing = -1;
    view2.inputState.compositionEndedAt = Date.now();
    view2.inputState.compositionPendingKey = true;
    view2.inputState.compositionPendingChange = view2.observer.pendingRecords().length > 0;
    view2.inputState.compositionFirstChange = null;
    if (browser.chrome && browser.android) {
      view2.observer.flushSoon();
    } else if (view2.inputState.compositionPendingChange) {
      Promise.resolve().then(() => view2.observer.flush());
    } else {
      setTimeout(() => {
        if (view2.inputState.composing < 0 && view2.docView.hasComposition)
          view2.update([]);
      }, 50);
    }
  };
  observers.contextmenu = (view2) => {
    view2.inputState.lastContextMenu = Date.now();
  };
  handlers.beforeinput = (view2, event) => {
    var _a2, _b;
    if (event.inputType == "insertText" || event.inputType == "insertCompositionText") {
      view2.inputState.insertingText = event.data;
      view2.inputState.insertingTextAt = Date.now();
    }
    if (event.inputType == "insertReplacementText" && view2.observer.editContext) {
      let text = (_a2 = event.dataTransfer) === null || _a2 === void 0 ? void 0 : _a2.getData("text/plain"), ranges = event.getTargetRanges();
      if (text && ranges.length) {
        let r = ranges[0];
        let from = view2.posAtDOM(r.startContainer, r.startOffset), to = view2.posAtDOM(r.endContainer, r.endOffset);
        applyDOMChangeInner(view2, { from, to, insert: view2.state.toText(text) }, null);
        return true;
      }
    }
    let pending;
    if (browser.chrome && browser.android && (pending = PendingKeys.find((key) => key.inputType == event.inputType))) {
      view2.observer.delayAndroidKey(pending.key, pending.keyCode);
      if (pending.key == "Backspace" || pending.key == "Delete") {
        let startViewHeight = ((_b = window.visualViewport) === null || _b === void 0 ? void 0 : _b.height) || 0;
        setTimeout(() => {
          var _a3;
          if ((((_a3 = window.visualViewport) === null || _a3 === void 0 ? void 0 : _a3.height) || 0) > startViewHeight + 10 && view2.hasFocus) {
            view2.contentDOM.blur();
            view2.focus();
          }
        }, 100);
      }
    }
    if (browser.ios && event.inputType == "deleteContentForward") {
      view2.observer.flushSoon();
    }
    if (browser.safari && event.inputType == "insertText" && view2.inputState.composing >= 0) {
      setTimeout(() => observers.compositionend(view2, event), 20);
    }
    return false;
  };
  var appliedFirefoxHack = /* @__PURE__ */ new Set();
  function firefoxCopyCutHack(doc2) {
    if (!appliedFirefoxHack.has(doc2)) {
      appliedFirefoxHack.add(doc2);
      doc2.addEventListener("copy", () => {
      });
      doc2.addEventListener("cut", () => {
      });
    }
  }
  var wrappingWhiteSpace = ["pre-wrap", "normal", "pre-line", "break-spaces"];
  var heightChangeFlag = false;
  function clearHeightChangeFlag() {
    heightChangeFlag = false;
  }
  var HeightOracle = class {
    constructor(lineWrapping) {
      this.lineWrapping = lineWrapping;
      this.doc = Text.empty;
      this.heightSamples = {};
      this.lineHeight = 14;
      this.charWidth = 7;
      this.textHeight = 14;
      this.lineLength = 30;
    }
    heightForGap(from, to) {
      let lines = this.doc.lineAt(to).number - this.doc.lineAt(from).number + 1;
      if (this.lineWrapping)
        lines += Math.max(0, Math.ceil((to - from - lines * this.lineLength * 0.5) / this.lineLength));
      return this.lineHeight * lines;
    }
    heightForLine(length) {
      if (!this.lineWrapping)
        return this.lineHeight;
      let lines = 1 + Math.max(0, Math.ceil((length - this.lineLength) / Math.max(1, this.lineLength - 5)));
      return lines * this.lineHeight;
    }
    setDoc(doc2) {
      this.doc = doc2;
      return this;
    }
    mustRefreshForWrapping(whiteSpace) {
      return wrappingWhiteSpace.indexOf(whiteSpace) > -1 != this.lineWrapping;
    }
    mustRefreshForHeights(lineHeights) {
      let newHeight = false;
      for (let i2 = 0; i2 < lineHeights.length; i2++) {
        let h = lineHeights[i2];
        if (h < 0) {
          i2++;
        } else if (!this.heightSamples[Math.floor(h * 10)]) {
          newHeight = true;
          this.heightSamples[Math.floor(h * 10)] = true;
        }
      }
      return newHeight;
    }
    refresh(whiteSpace, lineHeight, charWidth, textHeight, lineLength, knownHeights) {
      let lineWrapping = wrappingWhiteSpace.indexOf(whiteSpace) > -1;
      let changed = Math.abs(lineHeight - this.lineHeight) > 0.3 || this.lineWrapping != lineWrapping;
      this.lineWrapping = lineWrapping;
      this.lineHeight = lineHeight;
      this.charWidth = charWidth;
      this.textHeight = textHeight;
      this.lineLength = lineLength;
      if (changed) {
        this.heightSamples = {};
        for (let i2 = 0; i2 < knownHeights.length; i2++) {
          let h = knownHeights[i2];
          if (h < 0)
            i2++;
          else
            this.heightSamples[Math.floor(h * 10)] = true;
        }
      }
      return changed;
    }
  };
  var MeasuredHeights = class {
    constructor(from, heights) {
      this.from = from;
      this.heights = heights;
      this.index = 0;
    }
    get more() {
      return this.index < this.heights.length;
    }
  };
  var BlockInfo = class _BlockInfo {
    /**
    @internal
    */
    constructor(from, length, top2, height, _content) {
      this.from = from;
      this.length = length;
      this.top = top2;
      this.height = height;
      this._content = _content;
    }
    /**
    The type of element this is. When querying lines, this may be
    an array of all the blocks that make up the line.
    */
    get type() {
      return typeof this._content == "number" ? BlockType.Text : Array.isArray(this._content) ? this._content : this._content.type;
    }
    /**
    The end of the element as a document position.
    */
    get to() {
      return this.from + this.length;
    }
    /**
    The bottom position of the element.
    */
    get bottom() {
      return this.top + this.height;
    }
    /**
    If this is a widget block, this will return the widget
    associated with it.
    */
    get widget() {
      return this._content instanceof PointDecoration ? this._content.widget : null;
    }
    /**
    If this is a textblock, this holds the number of line breaks
    that appear in widgets inside the block.
    */
    get widgetLineBreaks() {
      return typeof this._content == "number" ? this._content : 0;
    }
    /**
    @internal
    */
    join(other) {
      let content2 = (Array.isArray(this._content) ? this._content : [this]).concat(Array.isArray(other._content) ? other._content : [other]);
      return new _BlockInfo(this.from, this.length + other.length, this.top, this.height + other.height, content2);
    }
  };
  var QueryType = /* @__PURE__ */ (function(QueryType2) {
    QueryType2[QueryType2["ByPos"] = 0] = "ByPos";
    QueryType2[QueryType2["ByHeight"] = 1] = "ByHeight";
    QueryType2[QueryType2["ByPosNoHeight"] = 2] = "ByPosNoHeight";
    return QueryType2;
  })(QueryType || (QueryType = {}));
  var Epsilon = 1e-3;
  var HeightMap = class _HeightMap {
    constructor(length, height, flags = 2) {
      this.length = length;
      this.height = height;
      this.flags = flags;
    }
    get outdated() {
      return (this.flags & 2) > 0;
    }
    set outdated(value) {
      this.flags = (value ? 2 : 0) | this.flags & -3;
    }
    setHeight(height) {
      if (this.height != height) {
        if (Math.abs(this.height - height) > Epsilon)
          heightChangeFlag = true;
        this.height = height;
      }
    }
    // Base case is to replace a leaf node, which simply builds a tree
    // from the new nodes and returns that (HeightMapBranch and
    // HeightMapGap override this to actually use from/to)
    replace(_from, _to, nodes) {
      return _HeightMap.of(nodes);
    }
    // Again, these are base cases, and are overridden for branch and gap nodes.
    decomposeLeft(_to, result) {
      result.push(this);
    }
    decomposeRight(_from, result) {
      result.push(this);
    }
    applyChanges(decorations2, oldDoc, oracle, changes) {
      let me = this, doc2 = oracle.doc;
      for (let i2 = changes.length - 1; i2 >= 0; i2--) {
        let { fromA, toA, fromB, toB } = changes[i2];
        let start = me.lineAt(fromA, QueryType.ByPosNoHeight, oracle.setDoc(oldDoc), 0, 0);
        let end = start.to >= toA ? start : me.lineAt(toA, QueryType.ByPosNoHeight, oracle, 0, 0);
        toB += end.to - toA;
        toA = end.to;
        while (i2 > 0 && start.from <= changes[i2 - 1].toA) {
          fromA = changes[i2 - 1].fromA;
          fromB = changes[i2 - 1].fromB;
          i2--;
          if (fromA < start.from)
            start = me.lineAt(fromA, QueryType.ByPosNoHeight, oracle, 0, 0);
        }
        fromB += start.from - fromA;
        fromA = start.from;
        let nodes = NodeBuilder.build(oracle.setDoc(doc2), decorations2, fromB, toB);
        me = replace(me, me.replace(fromA, toA, nodes));
      }
      return me.updateHeight(oracle, 0);
    }
    static empty() {
      return new HeightMapText(0, 0, 0);
    }
    // nodes uses null values to indicate the position of line breaks.
    // There are never line breaks at the start or end of the array, or
    // two line breaks next to each other, and the array isn't allowed
    // to be empty (same restrictions as return value from the builder).
    static of(nodes) {
      if (nodes.length == 1)
        return nodes[0];
      let i2 = 0, j = nodes.length, before = 0, after = 0;
      for (; ; ) {
        if (i2 == j) {
          if (before > after * 2) {
            let split = nodes[i2 - 1];
            if (split.break)
              nodes.splice(--i2, 1, split.left, null, split.right);
            else
              nodes.splice(--i2, 1, split.left, split.right);
            j += 1 + split.break;
            before -= split.size;
          } else if (after > before * 2) {
            let split = nodes[j];
            if (split.break)
              nodes.splice(j, 1, split.left, null, split.right);
            else
              nodes.splice(j, 1, split.left, split.right);
            j += 2 + split.break;
            after -= split.size;
          } else {
            break;
          }
        } else if (before < after) {
          let next = nodes[i2++];
          if (next)
            before += next.size;
        } else {
          let next = nodes[--j];
          if (next)
            after += next.size;
        }
      }
      let brk = false;
      if (nodes[i2 - 1] == null) {
        brk = true;
        i2--;
      } else if (nodes[i2] == null) {
        brk = true;
        j++;
      }
      return new HeightMapBranch(_HeightMap.of(nodes.slice(0, i2)), brk, _HeightMap.of(nodes.slice(j)));
    }
  };
  function replace(old, val) {
    if (old == val)
      return old;
    if (old.constructor != val.constructor)
      heightChangeFlag = true;
    return val;
  }
  HeightMap.prototype.size = 1;
  var SpaceDeco = /* @__PURE__ */ Decoration.replace({});
  var HeightMapBlock = class extends HeightMap {
    constructor(length, height, deco) {
      super(length, height);
      this.deco = deco;
      this.spaceAbove = 0;
    }
    mainBlock(top2, offset) {
      return new BlockInfo(offset, this.length, top2 + this.spaceAbove, this.height - this.spaceAbove, this.deco || 0);
    }
    blockAt(height, _oracle, top2, offset) {
      return this.spaceAbove && height < top2 + this.spaceAbove ? new BlockInfo(offset, 0, top2, this.spaceAbove, SpaceDeco) : this.mainBlock(top2, offset);
    }
    lineAt(_value, _type, oracle, top2, offset) {
      let main = this.mainBlock(top2, offset);
      return this.spaceAbove ? this.blockAt(0, oracle, top2, offset).join(main) : main;
    }
    forEachLine(from, to, oracle, top2, offset, f) {
      if (from <= offset + this.length && to >= offset)
        f(this.lineAt(0, QueryType.ByPos, oracle, top2, offset));
    }
    setMeasuredHeight(measured) {
      let next = measured.heights[measured.index++];
      if (next < 0) {
        this.spaceAbove = -next;
        next = measured.heights[measured.index++];
      } else {
        this.spaceAbove = 0;
      }
      this.setHeight(next);
    }
    updateHeight(oracle, offset = 0, _force = false, measured) {
      if (measured && measured.from <= offset && measured.more)
        this.setMeasuredHeight(measured);
      this.outdated = false;
      return this;
    }
    toString() {
      return `block(${this.length})`;
    }
  };
  var HeightMapText = class _HeightMapText extends HeightMapBlock {
    constructor(length, height, above) {
      super(length, height, null);
      this.collapsed = 0;
      this.widgetHeight = 0;
      this.breaks = 0;
      this.spaceAbove = above;
    }
    mainBlock(top2, offset) {
      return new BlockInfo(offset, this.length, top2 + this.spaceAbove, this.height - this.spaceAbove, this.breaks);
    }
    replace(_from, _to, nodes) {
      let node = nodes[0];
      if (nodes.length == 1 && (node instanceof _HeightMapText || node instanceof HeightMapGap && node.flags & 4) && Math.abs(this.length - node.length) < 10) {
        if (node instanceof HeightMapGap)
          node = new _HeightMapText(node.length, this.height, this.spaceAbove);
        else
          node.height = this.height;
        if (!this.outdated)
          node.outdated = false;
        return node;
      } else {
        return HeightMap.of(nodes);
      }
    }
    updateHeight(oracle, offset = 0, force = false, measured) {
      if (measured && measured.from <= offset && measured.more) {
        this.setMeasuredHeight(measured);
      } else if (force || this.outdated) {
        this.spaceAbove = 0;
        this.setHeight(Math.max(this.widgetHeight, oracle.heightForLine(this.length - this.collapsed)) + this.breaks * oracle.lineHeight);
      }
      this.outdated = false;
      return this;
    }
    toString() {
      return `line(${this.length}${this.collapsed ? -this.collapsed : ""}${this.widgetHeight ? ":" + this.widgetHeight : ""})`;
    }
  };
  var HeightMapGap = class _HeightMapGap extends HeightMap {
    constructor(length) {
      super(length, 0);
    }
    heightMetrics(oracle, offset) {
      let firstLine = oracle.doc.lineAt(offset).number, lastLine = oracle.doc.lineAt(offset + this.length).number;
      let lines = lastLine - firstLine + 1;
      let perLine, perChar = 0;
      if (oracle.lineWrapping) {
        let totalPerLine = Math.min(this.height, oracle.lineHeight * lines);
        perLine = totalPerLine / lines;
        if (this.length > lines + 1)
          perChar = (this.height - totalPerLine) / (this.length - lines - 1);
      } else {
        perLine = this.height / lines;
      }
      return { firstLine, lastLine, perLine, perChar };
    }
    blockAt(height, oracle, top2, offset) {
      let { firstLine, lastLine, perLine, perChar } = this.heightMetrics(oracle, offset);
      if (oracle.lineWrapping) {
        let guess = offset + (height < oracle.lineHeight ? 0 : Math.round(Math.max(0, Math.min(1, (height - top2) / this.height)) * this.length));
        let line = oracle.doc.lineAt(guess), lineHeight = perLine + line.length * perChar;
        let lineTop = Math.max(top2, height - lineHeight / 2);
        return new BlockInfo(line.from, line.length, lineTop, lineHeight, 0);
      } else {
        let line = Math.max(0, Math.min(lastLine - firstLine, Math.floor((height - top2) / perLine)));
        let { from, length } = oracle.doc.line(firstLine + line);
        return new BlockInfo(from, length, top2 + perLine * line, perLine, 0);
      }
    }
    lineAt(value, type, oracle, top2, offset) {
      if (type == QueryType.ByHeight)
        return this.blockAt(value, oracle, top2, offset);
      if (type == QueryType.ByPosNoHeight) {
        let { from, to } = oracle.doc.lineAt(value);
        return new BlockInfo(from, to - from, 0, 0, 0);
      }
      let { firstLine, perLine, perChar } = this.heightMetrics(oracle, offset);
      let line = oracle.doc.lineAt(value), lineHeight = perLine + line.length * perChar;
      let linesAbove = line.number - firstLine;
      let lineTop = top2 + perLine * linesAbove + perChar * (line.from - offset - linesAbove);
      return new BlockInfo(line.from, line.length, Math.max(top2, Math.min(lineTop, top2 + this.height - lineHeight)), lineHeight, 0);
    }
    forEachLine(from, to, oracle, top2, offset, f) {
      from = Math.max(from, offset);
      to = Math.min(to, offset + this.length);
      let { firstLine, perLine, perChar } = this.heightMetrics(oracle, offset);
      for (let pos = from, lineTop = top2; pos <= to; ) {
        let line = oracle.doc.lineAt(pos);
        if (pos == from) {
          let linesAbove = line.number - firstLine;
          lineTop += perLine * linesAbove + perChar * (from - offset - linesAbove);
        }
        let lineHeight = perLine + perChar * line.length;
        f(new BlockInfo(line.from, line.length, lineTop, lineHeight, 0));
        lineTop += lineHeight;
        pos = line.to + 1;
      }
    }
    replace(from, to, nodes) {
      let after = this.length - to;
      if (after > 0) {
        let last2 = nodes[nodes.length - 1];
        if (last2 instanceof _HeightMapGap)
          nodes[nodes.length - 1] = new _HeightMapGap(last2.length + after);
        else
          nodes.push(null, new _HeightMapGap(after - 1));
      }
      if (from > 0) {
        let first = nodes[0];
        if (first instanceof _HeightMapGap)
          nodes[0] = new _HeightMapGap(from + first.length);
        else
          nodes.unshift(new _HeightMapGap(from - 1), null);
      }
      return HeightMap.of(nodes);
    }
    decomposeLeft(to, result) {
      result.push(new _HeightMapGap(to - 1), null);
    }
    decomposeRight(from, result) {
      result.push(null, new _HeightMapGap(this.length - from - 1));
    }
    updateHeight(oracle, offset = 0, force = false, measured) {
      let end = offset + this.length;
      if (measured && measured.from <= offset + this.length && measured.more) {
        let nodes = [], pos = Math.max(offset, measured.from), singleHeight = -1;
        if (measured.from > offset)
          nodes.push(new _HeightMapGap(measured.from - offset - 1).updateHeight(oracle, offset));
        while (pos <= end && measured.more) {
          let len = oracle.doc.lineAt(pos).length;
          if (nodes.length)
            nodes.push(null);
          let height = measured.heights[measured.index++], above = 0;
          if (height < 0) {
            above = -height;
            height = measured.heights[measured.index++];
          }
          if (singleHeight == -1)
            singleHeight = height;
          else if (Math.abs(height - singleHeight) >= Epsilon)
            singleHeight = -2;
          let line = new HeightMapText(len, height, above);
          line.outdated = false;
          nodes.push(line);
          pos += len + 1;
        }
        if (pos <= end)
          nodes.push(null, new _HeightMapGap(end - pos).updateHeight(oracle, pos));
        let result = HeightMap.of(nodes);
        if (singleHeight < 0 || Math.abs(result.height - this.height) >= Epsilon || Math.abs(singleHeight - this.heightMetrics(oracle, offset).perLine) >= Epsilon)
          heightChangeFlag = true;
        return replace(this, result);
      } else if (force || this.outdated) {
        this.setHeight(oracle.heightForGap(offset, offset + this.length));
        this.outdated = false;
      }
      return this;
    }
    toString() {
      return `gap(${this.length})`;
    }
  };
  var HeightMapBranch = class extends HeightMap {
    constructor(left, brk, right) {
      super(left.length + (brk ? 1 : 0) + right.length, left.height + right.height, (brk ? 1 : 0) | (left.outdated || right.outdated ? 2 : 0));
      this.left = left;
      this.right = right;
      this.size = left.size + right.size;
    }
    // Returns 1 if there is a line break between this.left and
    // this.right, 0 otherwise.
    get break() {
      return this.flags & 1;
    }
    blockAt(height, oracle, top2, offset) {
      let mid = top2 + this.left.height;
      return height < mid ? this.left.blockAt(height, oracle, top2, offset) : this.right.blockAt(height, oracle, mid, offset + this.left.length + this.break);
    }
    lineAt(value, type, oracle, top2, offset) {
      let rightTop = top2 + this.left.height, rightOffset = offset + this.left.length + this.break;
      let left = type == QueryType.ByHeight ? value < rightTop : value < rightOffset;
      let base2 = left ? this.left.lineAt(value, type, oracle, top2, offset) : this.right.lineAt(value, type, oracle, rightTop, rightOffset);
      if (this.break || (left ? base2.to < rightOffset : base2.from > rightOffset))
        return base2;
      let subQuery = type == QueryType.ByPosNoHeight ? QueryType.ByPosNoHeight : QueryType.ByPos;
      if (left)
        return base2.join(this.right.lineAt(rightOffset, subQuery, oracle, rightTop, rightOffset));
      else
        return this.left.lineAt(rightOffset, subQuery, oracle, top2, offset).join(base2);
    }
    forEachLine(from, to, oracle, top2, offset, f) {
      let rightTop = top2 + this.left.height, rightOffset = offset + this.left.length + this.break;
      if (this.break) {
        if (from < rightOffset)
          this.left.forEachLine(from, to, oracle, top2, offset, f);
        if (to >= rightOffset)
          this.right.forEachLine(from, to, oracle, rightTop, rightOffset, f);
      } else {
        let mid = this.lineAt(rightOffset, QueryType.ByPos, oracle, top2, offset);
        if (from < mid.from)
          this.left.forEachLine(from, Math.min(to, mid.from - 1), oracle, top2, offset, f);
        if (mid.to >= from && mid.from <= to)
          f(mid);
        if (to > mid.to)
          this.right.forEachLine(Math.max(from, mid.to + 1), to, oracle, rightTop, rightOffset, f);
      }
    }
    replace(from, to, nodes) {
      let rightStart = this.left.length + this.break;
      if (to < rightStart)
        return this.balanced(this.left.replace(from, to, nodes), this.right);
      if (from > this.left.length)
        return this.balanced(this.left, this.right.replace(from - rightStart, to - rightStart, nodes));
      let result = [];
      if (from > 0)
        this.decomposeLeft(from, result);
      let left = result.length;
      for (let node of nodes)
        result.push(node);
      if (from > 0)
        mergeGaps(result, left - 1);
      if (to < this.length) {
        let right = result.length;
        this.decomposeRight(to, result);
        mergeGaps(result, right);
      }
      return HeightMap.of(result);
    }
    decomposeLeft(to, result) {
      let left = this.left.length;
      if (to <= left)
        return this.left.decomposeLeft(to, result);
      result.push(this.left);
      if (this.break) {
        left++;
        if (to >= left)
          result.push(null);
      }
      if (to > left)
        this.right.decomposeLeft(to - left, result);
    }
    decomposeRight(from, result) {
      let left = this.left.length, right = left + this.break;
      if (from >= right)
        return this.right.decomposeRight(from - right, result);
      if (from < left)
        this.left.decomposeRight(from, result);
      if (this.break && from < right)
        result.push(null);
      result.push(this.right);
    }
    balanced(left, right) {
      if (left.size > 2 * right.size || right.size > 2 * left.size)
        return HeightMap.of(this.break ? [left, null, right] : [left, right]);
      this.left = replace(this.left, left);
      this.right = replace(this.right, right);
      this.setHeight(left.height + right.height);
      this.outdated = left.outdated || right.outdated;
      this.size = left.size + right.size;
      this.length = left.length + this.break + right.length;
      return this;
    }
    updateHeight(oracle, offset = 0, force = false, measured) {
      let { left, right } = this, rightStart = offset + left.length + this.break, rebalance = null;
      if (measured && measured.from <= offset + left.length && measured.more)
        rebalance = left = left.updateHeight(oracle, offset, force, measured);
      else
        left.updateHeight(oracle, offset, force);
      if (measured && measured.from <= rightStart + right.length && measured.more)
        rebalance = right = right.updateHeight(oracle, rightStart, force, measured);
      else
        right.updateHeight(oracle, rightStart, force);
      if (rebalance)
        return this.balanced(left, right);
      this.height = this.left.height + this.right.height;
      this.outdated = false;
      return this;
    }
    toString() {
      return this.left + (this.break ? " " : "-") + this.right;
    }
  };
  function mergeGaps(nodes, around) {
    let before, after;
    if (nodes[around] == null && (before = nodes[around - 1]) instanceof HeightMapGap && (after = nodes[around + 1]) instanceof HeightMapGap)
      nodes.splice(around - 1, 3, new HeightMapGap(before.length + 1 + after.length));
  }
  var relevantWidgetHeight = 5;
  var NodeBuilder = class _NodeBuilder {
    constructor(pos, oracle) {
      this.pos = pos;
      this.oracle = oracle;
      this.nodes = [];
      this.lineStart = -1;
      this.lineEnd = -1;
      this.covering = null;
      this.writtenTo = pos;
    }
    get isCovered() {
      return this.covering && this.nodes[this.nodes.length - 1] == this.covering;
    }
    span(_from, to) {
      if (this.lineStart > -1) {
        let end = Math.min(to, this.lineEnd), last2 = this.nodes[this.nodes.length - 1];
        if (last2 instanceof HeightMapText)
          last2.length += end - this.pos;
        else if (end > this.pos || !this.isCovered)
          this.nodes.push(new HeightMapText(end - this.pos, -1, 0));
        this.writtenTo = end;
        if (to > end) {
          this.nodes.push(null);
          this.writtenTo++;
          this.lineStart = -1;
        }
      }
      this.pos = to;
    }
    point(from, to, deco) {
      if (from < to || deco.heightRelevant) {
        let height = deco.widget ? deco.widget.estimatedHeight : 0;
        let breaks = deco.widget ? deco.widget.lineBreaks : 0;
        if (height < 0)
          height = this.oracle.lineHeight;
        let len = to - from;
        if (deco.block) {
          this.addBlock(new HeightMapBlock(len, height, deco));
        } else if (len || breaks || height >= relevantWidgetHeight) {
          this.addLineDeco(height, breaks, len);
        }
      } else if (to > from) {
        this.span(from, to);
      }
      if (this.lineEnd > -1 && this.lineEnd < this.pos)
        this.lineEnd = this.oracle.doc.lineAt(this.pos).to;
    }
    enterLine() {
      if (this.lineStart > -1)
        return;
      let { from, to } = this.oracle.doc.lineAt(this.pos);
      this.lineStart = from;
      this.lineEnd = to;
      if (this.writtenTo < from) {
        if (this.writtenTo < from - 1 || this.nodes[this.nodes.length - 1] == null)
          this.nodes.push(this.blankContent(this.writtenTo, from - 1));
        this.nodes.push(null);
      }
      if (this.pos > from)
        this.nodes.push(new HeightMapText(this.pos - from, -1, 0));
      this.writtenTo = this.pos;
    }
    blankContent(from, to) {
      let gap = new HeightMapGap(to - from);
      if (this.oracle.doc.lineAt(from).to == to)
        gap.flags |= 4;
      return gap;
    }
    ensureLine() {
      this.enterLine();
      let last2 = this.nodes.length ? this.nodes[this.nodes.length - 1] : null;
      if (last2 instanceof HeightMapText)
        return last2;
      let line = new HeightMapText(0, -1, 0);
      this.nodes.push(line);
      return line;
    }
    addBlock(block) {
      this.enterLine();
      let deco = block.deco;
      if (deco && deco.startSide > 0 && !this.isCovered)
        this.ensureLine();
      this.nodes.push(block);
      this.writtenTo = this.pos = this.pos + block.length;
      if (deco && deco.endSide > 0)
        this.covering = block;
    }
    addLineDeco(height, breaks, length) {
      let line = this.ensureLine();
      line.length += length;
      line.collapsed += length;
      line.widgetHeight = Math.max(line.widgetHeight, height);
      line.breaks += breaks;
      this.writtenTo = this.pos = this.pos + length;
    }
    finish(from) {
      let last2 = this.nodes.length == 0 ? null : this.nodes[this.nodes.length - 1];
      if (this.lineStart > -1 && !(last2 instanceof HeightMapText) && !this.isCovered)
        this.nodes.push(new HeightMapText(0, -1, 0));
      else if (this.writtenTo < this.pos || last2 == null)
        this.nodes.push(this.blankContent(this.writtenTo, this.pos));
      let pos = from;
      for (let node of this.nodes) {
        if (node instanceof HeightMapText)
          node.updateHeight(this.oracle, pos);
        pos += node ? node.length : 1;
      }
      return this.nodes;
    }
    // Always called with a region that on both sides either stretches
    // to a line break or the end of the document.
    // The returned array uses null to indicate line breaks, but never
    // starts or ends in a line break, or has multiple line breaks next
    // to each other.
    static build(oracle, decorations2, from, to) {
      let builder = new _NodeBuilder(from, oracle);
      RangeSet.spans(decorations2, from, to, builder, 0);
      return builder.finish(from);
    }
  };
  function heightRelevantDecoChanges(a, b, diff) {
    let comp = new DecorationComparator2();
    RangeSet.compare(a, b, diff, comp, 0);
    return comp.changes;
  }
  var DecorationComparator2 = class {
    constructor() {
      this.changes = [];
    }
    compareRange() {
    }
    comparePoint(from, to, a, b) {
      if (from < to || a && a.heightRelevant || b && b.heightRelevant)
        addRange(from, to, this.changes, 5);
    }
  };
  function visiblePixelRange(dom, paddingTop) {
    let rect = dom.getBoundingClientRect();
    let doc2 = dom.ownerDocument, win = doc2.defaultView || window;
    let left = Math.max(0, rect.left), right = Math.min(win.innerWidth, rect.right);
    let top2 = Math.max(0, rect.top), bottom = Math.min(win.innerHeight, rect.bottom);
    for (let parent = dom.parentNode; parent && parent != doc2.body; ) {
      if (isElt(parent)) {
        let style = window.getComputedStyle(parent);
        if ((parent.scrollHeight > parent.clientHeight || parent.scrollWidth > parent.clientWidth) && style.overflow != "visible") {
          let parentRect = parent.getBoundingClientRect();
          left = Math.max(left, parentRect.left);
          right = Math.min(right, parentRect.right);
          top2 = Math.max(top2, parentRect.top);
          bottom = Math.min(parent == dom.parentNode ? win.innerHeight : bottom, parentRect.bottom);
        }
        parent = style.position == "absolute" || style.position == "fixed" ? parent.offsetParent : parent.parentNode;
      } else if (parent.nodeType == 11) {
        parent = parent.host;
      } else {
        break;
      }
    }
    return {
      left: left - rect.left,
      right: Math.max(left, right) - rect.left,
      top: top2 - (rect.top + paddingTop),
      bottom: Math.max(top2, bottom) - (rect.top + paddingTop)
    };
  }
  function inWindow(elt) {
    let rect = elt.getBoundingClientRect(), win = elt.ownerDocument.defaultView || window;
    return rect.left < win.innerWidth && rect.right > 0 && rect.top < win.innerHeight && rect.bottom > 0;
  }
  function fullPixelRange(dom, paddingTop) {
    let rect = dom.getBoundingClientRect();
    return {
      left: 0,
      right: rect.right - rect.left,
      top: paddingTop,
      bottom: rect.bottom - (rect.top + paddingTop)
    };
  }
  var LineGap = class {
    constructor(from, to, size, displaySize) {
      this.from = from;
      this.to = to;
      this.size = size;
      this.displaySize = displaySize;
    }
    static same(a, b) {
      if (a.length != b.length)
        return false;
      for (let i2 = 0; i2 < a.length; i2++) {
        let gA = a[i2], gB = b[i2];
        if (gA.from != gB.from || gA.to != gB.to || gA.size != gB.size)
          return false;
      }
      return true;
    }
    draw(viewState, wrapping) {
      return Decoration.replace({
        widget: new LineGapWidget(this.displaySize * (wrapping ? viewState.scaleY : viewState.scaleX), wrapping)
      }).range(this.from, this.to);
    }
  };
  var LineGapWidget = class extends WidgetType {
    constructor(size, vertical) {
      super();
      this.size = size;
      this.vertical = vertical;
    }
    eq(other) {
      return other.size == this.size && other.vertical == this.vertical;
    }
    toDOM() {
      let elt = document.createElement("div");
      if (this.vertical) {
        elt.style.height = this.size + "px";
      } else {
        elt.style.width = this.size + "px";
        elt.style.height = "2px";
        elt.style.display = "inline-block";
      }
      return elt;
    }
    get estimatedHeight() {
      return this.vertical ? this.size : -1;
    }
  };
  var ViewState = class {
    constructor(view2, state) {
      this.view = view2;
      this.state = state;
      this.pixelViewport = { left: 0, right: window.innerWidth, top: 0, bottom: 0 };
      this.inView = true;
      this.paddingTop = 0;
      this.paddingBottom = 0;
      this.contentDOMWidth = 0;
      this.contentDOMHeight = 0;
      this.editorHeight = 0;
      this.editorWidth = 0;
      this.scaleX = 1;
      this.scaleY = 1;
      this.scrollOffset = 0;
      this.scrolledToBottom = false;
      this.scrollAnchorPos = 0;
      this.scrollAnchorHeight = -1;
      this.scaler = IdScaler;
      this.scrollTarget = null;
      this.printing = false;
      this.mustMeasureContent = true;
      this.defaultTextDirection = Direction.LTR;
      this.visibleRanges = [];
      this.mustEnforceCursorAssoc = false;
      let guessWrapping = state.facet(contentAttributes).some((v) => typeof v != "function" && v.class == "cm-lineWrapping");
      this.heightOracle = new HeightOracle(guessWrapping);
      this.stateDeco = staticDeco(state);
      this.heightMap = HeightMap.empty().applyChanges(this.stateDeco, Text.empty, this.heightOracle.setDoc(state.doc), [new ChangedRange(0, 0, 0, state.doc.length)]);
      for (let i2 = 0; i2 < 2; i2++) {
        this.viewport = this.getViewport(0, null);
        if (!this.updateForViewport())
          break;
      }
      this.updateViewportLines();
      this.lineGaps = this.ensureLineGaps([]);
      this.lineGapDeco = Decoration.set(this.lineGaps.map((gap) => gap.draw(this, false)));
      this.scrollParent = view2.scrollDOM;
      this.computeVisibleRanges();
    }
    updateForViewport() {
      let viewports = [this.viewport], { main } = this.state.selection;
      for (let i2 = 0; i2 <= 1; i2++) {
        let pos = i2 ? main.head : main.anchor;
        if (!viewports.some(({ from, to }) => pos >= from && pos <= to)) {
          let { from, to } = this.lineBlockAt(pos);
          viewports.push(new Viewport(from, to));
        }
      }
      this.viewports = viewports.sort((a, b) => a.from - b.from);
      return this.updateScaler();
    }
    updateScaler() {
      let scaler = this.scaler;
      this.scaler = this.heightMap.height <= 7e6 ? IdScaler : BigScaler.get(this.heightOracle, this.heightMap, this.viewports);
      return scaler.eq(this.scaler) ? 0 : 2;
    }
    updateViewportLines() {
      this.viewportLines = [];
      this.heightMap.forEachLine(this.viewport.from, this.viewport.to, this.heightOracle.setDoc(this.state.doc), 0, 0, (block) => {
        this.viewportLines.push(scaleBlock(block, this.scaler));
      });
    }
    update(update, scrollTarget = null) {
      this.state = update.state;
      let prevDeco = this.stateDeco;
      this.stateDeco = staticDeco(this.state);
      let contentChanges = update.changedRanges;
      let heightChanges = ChangedRange.extendWithRanges(contentChanges, heightRelevantDecoChanges(prevDeco, this.stateDeco, update ? update.changes : ChangeSet.empty(this.state.doc.length)));
      let prevHeight = this.heightMap.height;
      let scrollAnchor = this.scrolledToBottom ? null : this.scrollAnchorAt(this.scrollOffset);
      clearHeightChangeFlag();
      this.heightMap = this.heightMap.applyChanges(this.stateDeco, update.startState.doc, this.heightOracle.setDoc(this.state.doc), heightChanges);
      if (this.heightMap.height != prevHeight || heightChangeFlag)
        update.flags |= 2;
      if (scrollAnchor) {
        this.scrollAnchorPos = update.changes.mapPos(scrollAnchor.from, -1);
        this.scrollAnchorHeight = scrollAnchor.top;
      } else {
        this.scrollAnchorPos = -1;
        this.scrollAnchorHeight = prevHeight;
      }
      let viewport = heightChanges.length ? this.mapViewport(this.viewport, update.changes) : this.viewport;
      if (scrollTarget && (scrollTarget.range.head < viewport.from || scrollTarget.range.head > viewport.to) || !this.viewportIsAppropriate(viewport))
        viewport = this.getViewport(0, scrollTarget);
      let viewportChange = viewport.from != this.viewport.from || viewport.to != this.viewport.to;
      this.viewport = viewport;
      update.flags |= this.updateForViewport();
      if (viewportChange || !update.changes.empty || update.flags & 2)
        this.updateViewportLines();
      if (this.lineGaps.length || this.viewport.to - this.viewport.from > 2e3 << 1)
        this.updateLineGaps(this.ensureLineGaps(this.mapLineGaps(this.lineGaps, update.changes)));
      update.flags |= this.computeVisibleRanges(update.changes);
      if (scrollTarget)
        this.scrollTarget = scrollTarget;
      if (!this.mustEnforceCursorAssoc && (update.selectionSet || update.focusChanged) && update.view.lineWrapping && update.state.selection.main.empty && update.state.selection.main.assoc && !update.state.facet(nativeSelectionHidden))
        this.mustEnforceCursorAssoc = true;
    }
    measure() {
      let { view: view2 } = this, dom = view2.contentDOM, style = window.getComputedStyle(dom);
      let oracle = this.heightOracle;
      let whiteSpace = style.whiteSpace;
      this.defaultTextDirection = style.direction == "rtl" ? Direction.RTL : Direction.LTR;
      let refresh = this.heightOracle.mustRefreshForWrapping(whiteSpace) || this.mustMeasureContent === "refresh";
      let domRect = dom.getBoundingClientRect();
      let measureContent = refresh || this.mustMeasureContent || this.contentDOMHeight != domRect.height;
      this.contentDOMHeight = domRect.height;
      this.mustMeasureContent = false;
      let result = 0, bias = 0;
      if (domRect.width && domRect.height) {
        let { scaleX, scaleY } = getScale(dom, domRect);
        if (scaleX > 5e-3 && Math.abs(this.scaleX - scaleX) > 5e-3 || scaleY > 5e-3 && Math.abs(this.scaleY - scaleY) > 5e-3) {
          this.scaleX = scaleX;
          this.scaleY = scaleY;
          result |= 16;
          refresh = measureContent = true;
        }
      }
      let paddingTop = (parseInt(style.paddingTop) || 0) * this.scaleY;
      let paddingBottom = (parseInt(style.paddingBottom) || 0) * this.scaleY;
      if (this.paddingTop != paddingTop || this.paddingBottom != paddingBottom) {
        this.paddingTop = paddingTop;
        this.paddingBottom = paddingBottom;
        result |= 16 | 2;
      }
      if (this.editorWidth != view2.scrollDOM.clientWidth) {
        if (oracle.lineWrapping)
          measureContent = true;
        this.editorWidth = view2.scrollDOM.clientWidth;
        result |= 16;
      }
      let scrollParent = scrollableParents(this.view.contentDOM, false).y;
      if (scrollParent != this.scrollParent) {
        this.scrollParent = scrollParent;
        this.scrollAnchorHeight = -1;
        this.scrollOffset = 0;
      }
      let scrollOffset = this.getScrollOffset();
      if (this.scrollOffset != scrollOffset) {
        this.scrollAnchorHeight = -1;
        this.scrollOffset = scrollOffset;
      }
      this.scrolledToBottom = isScrolledToBottom(this.scrollParent || view2.win);
      let pixelViewport = (this.printing ? fullPixelRange : visiblePixelRange)(dom, this.paddingTop);
      let dTop = pixelViewport.top - this.pixelViewport.top, dBottom = pixelViewport.bottom - this.pixelViewport.bottom;
      this.pixelViewport = pixelViewport;
      let inView = this.pixelViewport.bottom > this.pixelViewport.top && this.pixelViewport.right > this.pixelViewport.left;
      if (inView != this.inView) {
        this.inView = inView;
        if (inView)
          measureContent = true;
      }
      if (!this.inView && !this.scrollTarget && !inWindow(view2.dom))
        return 0;
      let contentWidth = domRect.width;
      if (this.contentDOMWidth != contentWidth || this.editorHeight != view2.scrollDOM.clientHeight) {
        this.contentDOMWidth = domRect.width;
        this.editorHeight = view2.scrollDOM.clientHeight;
        result |= 16;
      }
      if (measureContent) {
        let lineHeights = view2.docView.measureVisibleLineHeights(this.viewport);
        if (oracle.mustRefreshForHeights(lineHeights))
          refresh = true;
        if (refresh || oracle.lineWrapping && Math.abs(contentWidth - this.contentDOMWidth) > oracle.charWidth) {
          let { lineHeight, charWidth, textHeight } = view2.docView.measureTextSize();
          refresh = lineHeight > 0 && oracle.refresh(whiteSpace, lineHeight, charWidth, textHeight, Math.max(5, contentWidth / charWidth), lineHeights);
          if (refresh) {
            view2.docView.minWidth = 0;
            result |= 16;
          }
        }
        if (dTop > 0 && dBottom > 0)
          bias = Math.max(dTop, dBottom);
        else if (dTop < 0 && dBottom < 0)
          bias = Math.min(dTop, dBottom);
        clearHeightChangeFlag();
        for (let vp of this.viewports) {
          let heights = vp.from == this.viewport.from ? lineHeights : view2.docView.measureVisibleLineHeights(vp);
          this.heightMap = (refresh ? HeightMap.empty().applyChanges(this.stateDeco, Text.empty, this.heightOracle, [new ChangedRange(0, 0, 0, view2.state.doc.length)]) : this.heightMap).updateHeight(oracle, 0, refresh, new MeasuredHeights(vp.from, heights));
        }
        if (heightChangeFlag)
          result |= 2;
      }
      let viewportChange = !this.viewportIsAppropriate(this.viewport, bias) || this.scrollTarget && (this.scrollTarget.range.head < this.viewport.from || this.scrollTarget.range.head > this.viewport.to);
      if (viewportChange) {
        if (result & 2)
          result |= this.updateScaler();
        this.viewport = this.getViewport(bias, this.scrollTarget);
        result |= this.updateForViewport();
      }
      if (result & 2 || viewportChange)
        this.updateViewportLines();
      if (this.lineGaps.length || this.viewport.to - this.viewport.from > 2e3 << 1)
        this.updateLineGaps(this.ensureLineGaps(refresh ? [] : this.lineGaps, view2));
      result |= this.computeVisibleRanges();
      if (this.mustEnforceCursorAssoc) {
        this.mustEnforceCursorAssoc = false;
        view2.docView.enforceCursorAssoc();
      }
      return result;
    }
    get visibleTop() {
      return this.scaler.fromDOM(this.pixelViewport.top);
    }
    get visibleBottom() {
      return this.scaler.fromDOM(this.pixelViewport.bottom);
    }
    getViewport(bias, scrollTarget) {
      let marginTop = 0.5 - Math.max(-0.5, Math.min(0.5, bias / 1e3 / 2));
      let map = this.heightMap, oracle = this.heightOracle;
      let { visibleTop, visibleBottom } = this;
      let viewport = new Viewport(map.lineAt(visibleTop - marginTop * 1e3, QueryType.ByHeight, oracle, 0, 0).from, map.lineAt(visibleBottom + (1 - marginTop) * 1e3, QueryType.ByHeight, oracle, 0, 0).to);
      if (scrollTarget) {
        let { head } = scrollTarget.range;
        if (head < viewport.from || head > viewport.to) {
          let viewHeight = Math.min(this.editorHeight, this.pixelViewport.bottom - this.pixelViewport.top);
          let block = map.lineAt(head, QueryType.ByPos, oracle, 0, 0), topPos;
          if (scrollTarget.y == "center")
            topPos = (block.top + block.bottom) / 2 - viewHeight / 2;
          else if (scrollTarget.y == "start" || scrollTarget.y == "nearest" && head < viewport.from)
            topPos = block.top;
          else
            topPos = block.bottom - viewHeight;
          viewport = new Viewport(map.lineAt(topPos - 1e3 / 2, QueryType.ByHeight, oracle, 0, 0).from, map.lineAt(topPos + viewHeight + 1e3 / 2, QueryType.ByHeight, oracle, 0, 0).to);
        }
      }
      return viewport;
    }
    mapViewport(viewport, changes) {
      let from = changes.mapPos(viewport.from, -1), to = changes.mapPos(viewport.to, 1);
      return new Viewport(this.heightMap.lineAt(from, QueryType.ByPos, this.heightOracle, 0, 0).from, this.heightMap.lineAt(to, QueryType.ByPos, this.heightOracle, 0, 0).to);
    }
    // Checks if a given viewport covers the visible part of the
    // document and not too much beyond that.
    viewportIsAppropriate({ from, to }, bias = 0) {
      if (!this.inView)
        return true;
      let { top: top2 } = this.heightMap.lineAt(from, QueryType.ByPos, this.heightOracle, 0, 0);
      let { bottom } = this.heightMap.lineAt(to, QueryType.ByPos, this.heightOracle, 0, 0);
      let { visibleTop, visibleBottom } = this;
      return (from == 0 || top2 <= visibleTop - Math.max(10, Math.min(
        -bias,
        250
        /* VP.MaxCoverMargin */
      ))) && (to == this.state.doc.length || bottom >= visibleBottom + Math.max(10, Math.min(
        bias,
        250
        /* VP.MaxCoverMargin */
      ))) && (top2 > visibleTop - 2 * 1e3 && bottom < visibleBottom + 2 * 1e3);
    }
    mapLineGaps(gaps, changes) {
      if (!gaps.length || changes.empty)
        return gaps;
      let mapped = [];
      for (let gap of gaps)
        if (!changes.touchesRange(gap.from, gap.to))
          mapped.push(new LineGap(changes.mapPos(gap.from), changes.mapPos(gap.to), gap.size, gap.displaySize));
      return mapped;
    }
    // Computes positions in the viewport where the start or end of a
    // line should be hidden, trying to reuse existing line gaps when
    // appropriate to avoid unneccesary redraws.
    // Uses crude character-counting for the positioning and sizing,
    // since actual DOM coordinates aren't always available and
    // predictable. Relies on generous margins (see LG.Margin) to hide
    // the artifacts this might produce from the user.
    ensureLineGaps(current, mayMeasure) {
      let wrapping = this.heightOracle.lineWrapping;
      let margin = wrapping ? 1e4 : 2e3, halfMargin = margin >> 1, doubleMargin = margin << 1;
      if (this.defaultTextDirection != Direction.LTR && !wrapping)
        return [];
      let gaps = [];
      let addGap = (from, to, line, structure) => {
        if (to - from < halfMargin)
          return;
        let sel = this.state.selection.main, avoid = [sel.from];
        if (!sel.empty)
          avoid.push(sel.to);
        for (let pos of avoid) {
          if (pos > from && pos < to) {
            addGap(from, pos - 10, line, structure);
            addGap(pos + 10, to, line, structure);
            return;
          }
        }
        let gap = find(current, (gap2) => gap2.from >= line.from && gap2.to <= line.to && Math.abs(gap2.from - from) < halfMargin && Math.abs(gap2.to - to) < halfMargin && !avoid.some((pos) => gap2.from < pos && gap2.to > pos));
        if (!gap) {
          if (to < line.to && mayMeasure && wrapping && mayMeasure.visibleRanges.some((r) => r.from <= to && r.to >= to)) {
            let lineStart = mayMeasure.moveToLineBoundary(EditorSelection.cursor(to), false, true).head;
            if (lineStart > from)
              to = lineStart;
          }
          let size = this.gapSize(line, from, to, structure);
          let displaySize = wrapping || size < 2e6 ? size : 2e6;
          gap = new LineGap(from, to, size, displaySize);
        }
        gaps.push(gap);
      };
      let checkLine = (line) => {
        if (line.length < doubleMargin || line.type != BlockType.Text)
          return;
        let structure = lineStructure(line.from, line.to, this.stateDeco);
        if (structure.total < doubleMargin)
          return;
        let target = this.scrollTarget ? this.scrollTarget.range.head : null;
        let viewFrom, viewTo;
        if (wrapping) {
          let marginHeight = margin / this.heightOracle.lineLength * this.heightOracle.lineHeight;
          let top2, bot;
          if (target != null) {
            let targetFrac = findFraction(structure, target);
            let spaceFrac = ((this.visibleBottom - this.visibleTop) / 2 + marginHeight) / line.height;
            top2 = targetFrac - spaceFrac;
            bot = targetFrac + spaceFrac;
          } else {
            top2 = (this.visibleTop - line.top - marginHeight) / line.height;
            bot = (this.visibleBottom - line.top + marginHeight) / line.height;
          }
          viewFrom = findPosition(structure, top2);
          viewTo = findPosition(structure, bot);
        } else {
          let totalWidth = structure.total * this.heightOracle.charWidth;
          let marginWidth = margin * this.heightOracle.charWidth;
          let horizOffset = 0;
          if (totalWidth > 2e6)
            for (let old of current) {
              if (old.from >= line.from && old.from < line.to && old.size != old.displaySize && old.from * this.heightOracle.charWidth + horizOffset < this.pixelViewport.left)
                horizOffset = old.size - old.displaySize;
            }
          let pxLeft = this.pixelViewport.left + horizOffset, pxRight = this.pixelViewport.right + horizOffset;
          let left, right;
          if (target != null) {
            let targetFrac = findFraction(structure, target);
            let spaceFrac = ((pxRight - pxLeft) / 2 + marginWidth) / totalWidth;
            left = targetFrac - spaceFrac;
            right = targetFrac + spaceFrac;
          } else {
            left = (pxLeft - marginWidth) / totalWidth;
            right = (pxRight + marginWidth) / totalWidth;
          }
          viewFrom = findPosition(structure, left);
          viewTo = findPosition(structure, right);
        }
        if (viewFrom > line.from)
          addGap(line.from, viewFrom, line, structure);
        if (viewTo < line.to)
          addGap(viewTo, line.to, line, structure);
      };
      for (let line of this.viewportLines) {
        if (Array.isArray(line.type))
          line.type.forEach(checkLine);
        else
          checkLine(line);
      }
      return gaps;
    }
    gapSize(line, from, to, structure) {
      let fraction = findFraction(structure, to) - findFraction(structure, from);
      if (this.heightOracle.lineWrapping) {
        return line.height * fraction;
      } else {
        return structure.total * this.heightOracle.charWidth * fraction;
      }
    }
    updateLineGaps(gaps) {
      if (!LineGap.same(gaps, this.lineGaps)) {
        this.lineGaps = gaps;
        this.lineGapDeco = Decoration.set(gaps.map((gap) => gap.draw(this, this.heightOracle.lineWrapping)));
      }
    }
    computeVisibleRanges(changes) {
      let deco = this.stateDeco;
      if (this.lineGaps.length)
        deco = deco.concat(this.lineGapDeco);
      let ranges = [];
      RangeSet.spans(deco, this.viewport.from, this.viewport.to, {
        span(from, to) {
          ranges.push({ from, to });
        },
        point() {
        }
      }, 20);
      let changed = 0;
      if (ranges.length != this.visibleRanges.length) {
        changed = 8 | 4;
      } else {
        for (let i2 = 0; i2 < ranges.length && !(changed & 8); i2++) {
          let old = this.visibleRanges[i2], nw = ranges[i2];
          if (old.from != nw.from || old.to != nw.to) {
            changed |= 4;
            if (!(changes && changes.mapPos(old.from, -1) == nw.from && changes.mapPos(old.to, 1) == nw.to))
              changed |= 8;
          }
        }
      }
      this.visibleRanges = ranges;
      return changed;
    }
    lineBlockAt(pos) {
      return pos >= this.viewport.from && pos <= this.viewport.to && this.viewportLines.find((b) => b.from <= pos && b.to >= pos) || scaleBlock(this.heightMap.lineAt(pos, QueryType.ByPos, this.heightOracle, 0, 0), this.scaler);
    }
    lineBlockAtHeight(height) {
      return height >= this.viewportLines[0].top && height <= this.viewportLines[this.viewportLines.length - 1].bottom && this.viewportLines.find((l) => l.top <= height && l.bottom >= height) || scaleBlock(this.heightMap.lineAt(this.scaler.fromDOM(height), QueryType.ByHeight, this.heightOracle, 0, 0), this.scaler);
    }
    getScrollOffset() {
      return this.scrollParent == this.view.scrollDOM ? this.scrollParent.scrollTop * this.scaleY : (this.scrollParent ? this.scrollParent.getBoundingClientRect().top : 0) - this.view.contentDOM.getBoundingClientRect().top;
    }
    scrollAnchorAt(scrollOffset) {
      let block = this.lineBlockAtHeight(scrollOffset + 12 - this.paddingTop);
      return block.from >= this.viewport.from || this.viewportLines[0].top - scrollOffset > 200 ? block : this.viewportLines[0];
    }
    elementAtHeight(height) {
      return scaleBlock(this.heightMap.blockAt(this.scaler.fromDOM(height), this.heightOracle, 0, 0), this.scaler);
    }
    get docHeight() {
      return this.scaler.toDOM(this.heightMap.height);
    }
    get contentHeight() {
      return this.docHeight + this.paddingTop + this.paddingBottom;
    }
  };
  var Viewport = class {
    constructor(from, to) {
      this.from = from;
      this.to = to;
    }
  };
  function lineStructure(from, to, stateDeco) {
    let ranges = [], pos = from, total = 0;
    RangeSet.spans(stateDeco, from, to, {
      span() {
      },
      point(from2, to2) {
        if (from2 > pos) {
          ranges.push({ from: pos, to: from2 });
          total += from2 - pos;
        }
        pos = to2;
      }
    }, 20);
    if (pos < to) {
      ranges.push({ from: pos, to });
      total += to - pos;
    }
    return { total, ranges };
  }
  function findPosition({ total, ranges }, ratio) {
    if (ratio <= 0)
      return ranges[0].from;
    if (ratio >= 1)
      return ranges[ranges.length - 1].to;
    let dist2 = Math.floor(total * ratio);
    for (let i2 = 0; ; i2++) {
      let { from, to } = ranges[i2], size = to - from;
      if (dist2 <= size)
        return from + dist2;
      dist2 -= size;
    }
  }
  function findFraction(structure, pos) {
    let counted = 0;
    for (let { from, to } of structure.ranges) {
      if (pos <= to) {
        counted += pos - from;
        break;
      }
      counted += to - from;
    }
    return counted / structure.total;
  }
  function find(array, f) {
    for (let val of array)
      if (f(val))
        return val;
    return void 0;
  }
  var IdScaler = {
    toDOM(n) {
      return n;
    },
    fromDOM(n) {
      return n;
    },
    scale: 1,
    eq(other) {
      return other == this;
    }
  };
  function staticDeco(state) {
    let deco = state.facet(decorations).filter((d) => typeof d != "function");
    let outer = state.facet(outerDecorations).filter((d) => typeof d != "function");
    if (outer.length)
      deco.push(RangeSet.join(outer));
    return deco;
  }
  var BigScaler = class _BigScaler {
    constructor(scale, viewports) {
      this.scale = scale;
      this.viewports = viewports;
    }
    static get(oracle, heightMap, viewports) {
      let vpHeight = 0, base2 = 0, domBase = 0;
      let vps = viewports.map(({ from, to }) => {
        let top2 = heightMap.lineAt(from, QueryType.ByPos, oracle, 0, 0).top;
        let bottom = heightMap.lineAt(to, QueryType.ByPos, oracle, 0, 0).bottom;
        vpHeight += bottom - top2;
        return { from, to, top: top2, bottom, domTop: 0, domBottom: 0 };
      });
      if (heightMap.height - vpHeight < 10)
        return IdScaler;
      let scale = (7e6 - vpHeight) / (heightMap.height - vpHeight);
      for (let obj of vps) {
        obj.domTop = domBase + (obj.top - base2) * scale;
        domBase = obj.domBottom = obj.domTop + (obj.bottom - obj.top);
        base2 = obj.bottom;
      }
      return new _BigScaler(scale, vps);
    }
    toDOM(n) {
      for (let i2 = 0, base2 = 0, domBase = 0; ; i2++) {
        let vp = i2 < this.viewports.length ? this.viewports[i2] : null;
        if (!vp || n < vp.top)
          return domBase + (n - base2) * this.scale;
        if (n <= vp.bottom)
          return vp.domTop + (n - vp.top);
        base2 = vp.bottom;
        domBase = vp.domBottom;
      }
    }
    fromDOM(n) {
      for (let i2 = 0, base2 = 0, domBase = 0; ; i2++) {
        let vp = i2 < this.viewports.length ? this.viewports[i2] : null;
        if (!vp || n < vp.domTop)
          return base2 + (n - domBase) / this.scale;
        if (n <= vp.domBottom)
          return vp.top + (n - vp.domTop);
        base2 = vp.bottom;
        domBase = vp.domBottom;
      }
    }
    eq(other) {
      if (!(other instanceof _BigScaler))
        return false;
      return this.scale == other.scale && this.viewports.length == other.viewports.length && this.viewports.every((vp, i2) => vp.from == other.viewports[i2].from && vp.to == other.viewports[i2].to);
    }
  };
  function scaleBlock(block, scaler) {
    if (scaler.scale == 1)
      return block;
    let bTop = scaler.toDOM(block.top), bBottom = scaler.toDOM(block.bottom);
    return new BlockInfo(block.from, block.length, bTop, bBottom - bTop, Array.isArray(block._content) ? block._content.map((b) => scaleBlock(b, scaler)) : block._content);
  }
  var theme = /* @__PURE__ */ Facet.define({ combine: (strs) => strs.join(" ") });
  var darkTheme = /* @__PURE__ */ Facet.define({ combine: (values) => values.indexOf(true) > -1 });
  var baseThemeID = /* @__PURE__ */ StyleModule.newName();
  var baseLightID = /* @__PURE__ */ StyleModule.newName();
  var baseDarkID = /* @__PURE__ */ StyleModule.newName();
  var lightDarkIDs = { "&light": "." + baseLightID, "&dark": "." + baseDarkID };
  function buildTheme(main, spec, scopes) {
    return new StyleModule(spec, {
      finish(sel) {
        return /&/.test(sel) ? sel.replace(/&\w*/, (m) => {
          if (m == "&")
            return main;
          if (!scopes || !scopes[m])
            throw new RangeError(`Unsupported selector: ${m}`);
          return scopes[m];
        }) : main + " " + sel;
      }
    });
  }
  var baseTheme$1 = /* @__PURE__ */ buildTheme("." + baseThemeID, {
    "&": {
      position: "relative !important",
      boxSizing: "border-box",
      "&.cm-focused": {
        // Provide a simple default outline to make sure a focused
        // editor is visually distinct. Can't leave the default behavior
        // because that will apply to the content element, which is
        // inside the scrollable container and doesn't include the
        // gutters. We also can't use an 'auto' outline, since those
        // are, for some reason, drawn behind the element content, which
        // will cause things like the active line background to cover
        // the outline (#297).
        outline: "1px dotted #212121"
      },
      display: "flex !important",
      flexDirection: "column"
    },
    ".cm-scroller": {
      display: "flex !important",
      alignItems: "flex-start !important",
      fontFamily: "monospace",
      lineHeight: 1.4,
      height: "100%",
      overflowX: "auto",
      position: "relative",
      zIndex: 0,
      overflowAnchor: "none"
    },
    ".cm-content": {
      margin: 0,
      flexGrow: 2,
      flexShrink: 0,
      display: "block",
      whiteSpace: "pre",
      wordWrap: "normal",
      // Issue #456
      boxSizing: "border-box",
      minHeight: "100%",
      padding: "4px 0",
      outline: "none",
      "&[contenteditable=true]": {
        WebkitUserModify: "read-write-plaintext-only"
      }
    },
    ".cm-lineWrapping": {
      whiteSpace_fallback: "pre-wrap",
      // For IE
      whiteSpace: "break-spaces",
      wordBreak: "break-word",
      // For Safari, which doesn't support overflow-wrap: anywhere
      overflowWrap: "anywhere",
      flexShrink: 1
    },
    "&light .cm-content": { caretColor: "black" },
    "&dark .cm-content": { caretColor: "white" },
    ".cm-line": {
      display: "block",
      padding: "0 2px 0 6px"
    },
    ".cm-layer": {
      userSelect: "none",
      // #1708
      position: "absolute",
      left: 0,
      top: 0,
      contain: "size style",
      "& > *": {
        position: "absolute"
      }
    },
    "&light .cm-selectionBackground": {
      background: "#d9d9d9"
    },
    "&dark .cm-selectionBackground": {
      background: "#222"
    },
    "&light.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground": {
      background: "#d7d4f0"
    },
    "&dark.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground": {
      background: "#233"
    },
    ".cm-cursorLayer": {
      pointerEvents: "none"
    },
    "&.cm-focused > .cm-scroller > .cm-cursorLayer": {
      animation: "steps(1) cm-blink 1.2s infinite"
    },
    // Two animations defined so that we can switch between them to
    // restart the animation without forcing another style
    // recomputation.
    "@keyframes cm-blink": { "0%": {}, "50%": { opacity: 0 }, "100%": {} },
    "@keyframes cm-blink2": { "0%": {}, "50%": { opacity: 0 }, "100%": {} },
    ".cm-cursor, .cm-dropCursor": {
      borderLeft: "1.2px solid black",
      marginLeft: "-0.6px",
      pointerEvents: "none"
    },
    ".cm-cursor": {
      display: "none"
    },
    "&dark .cm-cursor": {
      borderLeftColor: "#ddd"
    },
    ".cm-selectionHandle": {
      backgroundColor: "currentColor",
      width: "1.5px"
    },
    ".cm-selectionHandle-start::before, .cm-selectionHandle-end::before": {
      content: '""',
      backgroundColor: "inherit",
      borderRadius: "50%",
      width: "8px",
      height: "8px",
      position: "absolute",
      left: "-3.25px"
    },
    ".cm-selectionHandle-start::before": { top: "-8px" },
    ".cm-selectionHandle-end::before": { bottom: "-8px" },
    ".cm-dropCursor": {
      position: "absolute"
    },
    "&.cm-focused > .cm-scroller > .cm-cursorLayer .cm-cursor": {
      display: "block"
    },
    ".cm-iso": {
      unicodeBidi: "isolate"
    },
    ".cm-announced": {
      position: "fixed",
      top: "-10000px"
    },
    "@media print": {
      ".cm-announced": { display: "none" }
    },
    "&light .cm-activeLine": { backgroundColor: "#cceeff44" },
    "&dark .cm-activeLine": { backgroundColor: "#99eeff33" },
    "&light .cm-specialChar": { color: "red" },
    "&dark .cm-specialChar": { color: "#f78" },
    ".cm-gutters": {
      flexShrink: 0,
      display: "flex",
      height: "100%",
      boxSizing: "border-box",
      zIndex: 200
    },
    ".cm-gutters-before": { insetInlineStart: 0 },
    ".cm-gutters-after": { insetInlineEnd: 0 },
    "&light .cm-gutters": {
      backgroundColor: "#f5f5f5",
      color: "#6c6c6c",
      border: "0px solid #ddd",
      "&.cm-gutters-before": { borderRightWidth: "1px" },
      "&.cm-gutters-after": { borderLeftWidth: "1px" }
    },
    "&dark .cm-gutters": {
      backgroundColor: "#333338",
      color: "#ccc"
    },
    ".cm-gutter": {
      display: "flex !important",
      // Necessary -- prevents margin collapsing
      flexDirection: "column",
      flexShrink: 0,
      boxSizing: "border-box",
      minHeight: "100%",
      overflow: "hidden"
    },
    ".cm-gutterElement": {
      boxSizing: "border-box"
    },
    ".cm-lineNumbers .cm-gutterElement": {
      padding: "0 3px 0 5px",
      minWidth: "20px",
      textAlign: "right",
      whiteSpace: "nowrap"
    },
    "&light .cm-activeLineGutter": {
      backgroundColor: "#e2f2ff"
    },
    "&dark .cm-activeLineGutter": {
      backgroundColor: "#222227"
    },
    ".cm-panels": {
      boxSizing: "border-box",
      position: "sticky",
      left: 0,
      right: 0,
      zIndex: 300
    },
    "&light .cm-panels": {
      backgroundColor: "#f5f5f5",
      color: "black"
    },
    ".cm-panels-top": { top: "0" },
    ".cm-panels-bottom": { bottom: "0" },
    "&light .cm-panels-top": {
      borderBottom: "1px solid #ddd"
    },
    "&light .cm-panels-bottom": {
      borderTop: "1px solid #ddd"
    },
    "&dark .cm-panels": {
      backgroundColor: "#333338",
      color: "white"
    },
    ".cm-dialog": {
      padding: "2px 19px 4px 6px",
      position: "relative",
      "& label": { fontSize: "80%" }
    },
    ".cm-dialog-close": {
      position: "absolute",
      top: "3px",
      right: "4px",
      backgroundColor: "inherit",
      border: "none",
      font: "inherit",
      fontSize: "14px",
      padding: "0"
    },
    ".cm-tab": {
      display: "inline-block",
      overflow: "hidden",
      verticalAlign: "bottom"
    },
    ".cm-widgetBuffer": {
      verticalAlign: "baseline",
      height: "1em",
      width: 0,
      display: "inline"
    },
    ".cm-placeholder": {
      color: "#888",
      display: "inline-block",
      verticalAlign: "top",
      userSelect: "none"
    },
    ".cm-highlightSpace": {
      background: "radial-gradient(circle at 50% 55%, #aaa 20%, transparent 0) no-repeat",
      backgroundSize: ".4em",
      backgroundPosition: "calc(min(50%, 0px)) center"
    },
    ".cm-highlightTab": {
      backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="20"><path stroke="%23888" stroke-width="1" fill="none" d="M1 10H196L190 5M190 15L196 10M197 4L197 16"/></svg>')`,
      backgroundSize: "auto 100%",
      backgroundPosition: "right 90%",
      backgroundRepeat: "no-repeat"
    },
    ".cm-trailingSpace": {
      backgroundColor: "#ff332255"
    },
    ".cm-button": {
      verticalAlign: "middle",
      color: "inherit",
      fontSize: "70%",
      padding: ".2em 1em",
      borderRadius: "1px"
    },
    "&light .cm-button": {
      backgroundImage: "linear-gradient(#eff1f5, #d9d9df)",
      border: "1px solid #888",
      "&:active": {
        backgroundImage: "linear-gradient(#b4b4b4, #d0d3d6)"
      }
    },
    "&dark .cm-button": {
      backgroundImage: "linear-gradient(#393939, #111)",
      border: "1px solid #888",
      "&:active": {
        backgroundImage: "linear-gradient(#111, #333)"
      }
    },
    ".cm-textfield": {
      verticalAlign: "middle",
      color: "inherit",
      fontSize: "70%",
      border: "1px solid silver",
      padding: ".2em .5em"
    },
    "&light .cm-textfield": {
      backgroundColor: "white"
    },
    "&dark .cm-textfield": {
      border: "1px solid #555",
      backgroundColor: "inherit"
    }
  }, lightDarkIDs);
  var observeOptions = {
    childList: true,
    characterData: true,
    subtree: true,
    attributes: true,
    characterDataOldValue: true
  };
  var useCharData = browser.ie && browser.ie_version <= 11;
  var DOMObserver = class {
    constructor(view2) {
      this.view = view2;
      this.active = false;
      this.editContext = null;
      this.selectionRange = new DOMSelectionState();
      this.selectionChanged = false;
      this.delayedFlush = -1;
      this.resizeTimeout = -1;
      this.queue = [];
      this.delayedAndroidKey = null;
      this.flushingAndroidKey = -1;
      this.lastChange = 0;
      this.scrollTargets = [];
      this.intersection = null;
      this.resizeScroll = null;
      this.intersecting = false;
      this.gapIntersection = null;
      this.gaps = [];
      this.printQuery = null;
      this.parentCheck = -1;
      this.dom = view2.contentDOM;
      this.observer = new MutationObserver((mutations) => {
        for (let mut of mutations)
          this.queue.push(mut);
        if ((browser.ie && browser.ie_version <= 11 || browser.ios && view2.composing) && mutations.some((m) => m.type == "childList" && m.removedNodes.length || m.type == "characterData" && m.oldValue.length > m.target.nodeValue.length))
          this.flushSoon();
        else
          this.flush();
      });
      if (window.EditContext && browser.android && view2.constructor.EDIT_CONTEXT !== false && // Chrome <126 doesn't support inverted selections in edit context (#1392)
      !(browser.chrome && browser.chrome_version < 126)) {
        this.editContext = new EditContextManager(view2);
        if (view2.state.facet(editable))
          view2.contentDOM.editContext = this.editContext.editContext;
      }
      if (useCharData)
        this.onCharData = (event) => {
          this.queue.push({
            target: event.target,
            type: "characterData",
            oldValue: event.prevValue
          });
          this.flushSoon();
        };
      this.onSelectionChange = this.onSelectionChange.bind(this);
      this.onResize = this.onResize.bind(this);
      this.onPrint = this.onPrint.bind(this);
      this.onScroll = this.onScroll.bind(this);
      if (window.matchMedia)
        this.printQuery = window.matchMedia("print");
      if (typeof ResizeObserver == "function") {
        this.resizeScroll = new ResizeObserver(() => {
          var _a2;
          if (((_a2 = this.view.docView) === null || _a2 === void 0 ? void 0 : _a2.lastUpdate) < Date.now() - 75)
            this.onResize();
        });
        this.resizeScroll.observe(view2.scrollDOM);
      }
      this.addWindowListeners(this.win = view2.win);
      this.start();
      if (typeof IntersectionObserver == "function") {
        this.intersection = new IntersectionObserver((entries) => {
          if (this.parentCheck < 0)
            this.parentCheck = setTimeout(this.listenForScroll.bind(this), 1e3);
          if (entries.length > 0 && entries[entries.length - 1].intersectionRatio > 0 != this.intersecting) {
            this.intersecting = !this.intersecting;
            if (this.intersecting != this.view.inView)
              this.onScrollChanged(document.createEvent("Event"));
          }
        }, { threshold: [0, 1e-3] });
        this.intersection.observe(this.dom);
        this.gapIntersection = new IntersectionObserver((entries) => {
          if (entries.length > 0 && entries[entries.length - 1].intersectionRatio > 0)
            this.onScrollChanged(document.createEvent("Event"));
        }, {});
      }
      this.listenForScroll();
      this.readSelectionRange();
    }
    onScrollChanged(e) {
      this.view.inputState.runHandlers("scroll", e);
      if (this.intersecting)
        this.view.measure();
    }
    onScroll(e) {
      if (this.intersecting)
        this.flush(this.pendingRecords().length > 0);
      if (this.editContext)
        this.view.requestMeasure(this.editContext.measureReq);
      this.onScrollChanged(e);
    }
    onResize() {
      if (this.resizeTimeout < 0)
        this.resizeTimeout = setTimeout(() => {
          this.resizeTimeout = -1;
          this.view.requestMeasure();
        }, 50);
    }
    onPrint(event) {
      if ((event.type == "change" || !event.type) && !event.matches)
        return;
      this.view.viewState.printing = true;
      this.view.measure();
      setTimeout(() => {
        this.view.viewState.printing = false;
        this.view.requestMeasure();
      }, 500);
    }
    updateGaps(gaps) {
      if (this.gapIntersection && (gaps.length != this.gaps.length || this.gaps.some((g, i2) => g != gaps[i2]))) {
        this.gapIntersection.disconnect();
        for (let gap of gaps)
          this.gapIntersection.observe(gap);
        this.gaps = gaps;
      }
    }
    onSelectionChange(event) {
      let wasChanged = this.selectionChanged;
      if (!this.readSelectionRange() || this.delayedAndroidKey)
        return;
      let { view: view2 } = this, sel = this.selectionRange;
      if (view2.state.facet(editable) ? view2.root.activeElement != this.dom : !hasSelection(this.dom, sel))
        return;
      let context = sel.anchorNode && view2.docView.tile.nearest(sel.anchorNode);
      if (context && context.isWidget() && context.widget.ignoreEvent(event)) {
        if (!wasChanged)
          this.selectionChanged = false;
        return;
      }
      if ((browser.ie && browser.ie_version <= 11 || browser.android && browser.chrome) && !view2.state.selection.main.empty && // (Selection.isCollapsed isn't reliable on IE)
      sel.focusNode && isEquivalentPosition(sel.focusNode, sel.focusOffset, sel.anchorNode, sel.anchorOffset))
        this.flushSoon();
      else
        this.flush(false);
    }
    readSelectionRange() {
      let { view: view2 } = this;
      let selection = getSelection(view2.root);
      if (!selection)
        return false;
      let range = browser.safari && view2.root.nodeType == 11 && view2.root.activeElement == this.dom && safariSelectionRangeHack(this.view, selection) || selection;
      if (!range || this.selectionRange.eq(range))
        return false;
      let local = hasSelection(this.dom, range);
      if (local && !this.selectionChanged && view2.inputState.lastFocusTime > Date.now() - 200 && view2.inputState.lastTouchTime < Date.now() - 300 && atElementStart(this.dom, range)) {
        this.view.inputState.lastFocusTime = 0;
        view2.docView.updateSelection();
        return false;
      }
      this.selectionRange.setRange(range);
      if (local)
        this.selectionChanged = true;
      return true;
    }
    setSelectionRange(anchor, head) {
      this.selectionRange.set(anchor.node, anchor.offset, head.node, head.offset);
      this.selectionChanged = false;
    }
    clearSelectionRange() {
      this.selectionRange.set(null, 0, null, 0);
    }
    listenForScroll() {
      this.parentCheck = -1;
      let i2 = 0, changed = null;
      for (let dom = this.dom; dom; ) {
        if (isElt(dom)) {
          if (!changed && i2 < this.scrollTargets.length && this.scrollTargets[i2] == dom)
            i2++;
          else if (!changed)
            changed = this.scrollTargets.slice(0, i2);
          if (changed)
            changed.push(dom);
          dom = dom.assignedSlot || dom.parentNode;
        } else if (dom.nodeType == 11) {
          dom = dom.host;
        } else {
          break;
        }
      }
      if (i2 < this.scrollTargets.length && !changed)
        changed = this.scrollTargets.slice(0, i2);
      if (changed) {
        for (let dom of this.scrollTargets)
          dom.removeEventListener("scroll", this.onScroll);
        for (let dom of this.scrollTargets = changed)
          dom.addEventListener("scroll", this.onScroll);
      }
    }
    ignore(f) {
      if (!this.active)
        return f();
      try {
        this.stop();
        return f();
      } finally {
        this.start();
        this.clear();
      }
    }
    start() {
      if (this.active)
        return;
      this.observer.observe(this.dom, observeOptions);
      if (useCharData)
        this.dom.addEventListener("DOMCharacterDataModified", this.onCharData);
      this.active = true;
    }
    stop() {
      if (!this.active)
        return;
      this.active = false;
      this.observer.disconnect();
      if (useCharData)
        this.dom.removeEventListener("DOMCharacterDataModified", this.onCharData);
    }
    // Throw away any pending changes
    clear() {
      this.processRecords();
      this.queue.length = 0;
      this.selectionChanged = false;
    }
    // Chrome Android, especially in combination with GBoard, not only
    // doesn't reliably fire regular key events, but also often
    // surrounds the effect of enter or backspace with a bunch of
    // composition events that, when interrupted, cause text duplication
    // or other kinds of corruption. This hack makes the editor back off
    // from handling DOM changes for a moment when such a key is
    // detected (via beforeinput or keydown), and then tries to flush
    // them or, if that has no effect, dispatches the given key.
    delayAndroidKey(key, keyCode) {
      var _a2;
      if (!this.delayedAndroidKey) {
        let flush = () => {
          let key2 = this.delayedAndroidKey;
          if (key2) {
            this.clearDelayedAndroidKey();
            this.view.inputState.lastKeyCode = key2.keyCode;
            this.view.inputState.lastKeyTime = Date.now();
            let flushed = this.flush();
            if (!flushed && key2.force)
              dispatchKey(this.dom, key2.key, key2.keyCode);
          }
        };
        this.flushingAndroidKey = this.view.win.requestAnimationFrame(flush);
      }
      if (!this.delayedAndroidKey || key == "Enter")
        this.delayedAndroidKey = {
          key,
          keyCode,
          // Only run the key handler when no changes are detected if
          // this isn't coming right after another change, in which case
          // it is probably part of a weird chain of updates, and should
          // be ignored if it returns the DOM to its previous state.
          force: this.lastChange < Date.now() - 50 || !!((_a2 = this.delayedAndroidKey) === null || _a2 === void 0 ? void 0 : _a2.force)
        };
    }
    clearDelayedAndroidKey() {
      this.win.cancelAnimationFrame(this.flushingAndroidKey);
      this.delayedAndroidKey = null;
      this.flushingAndroidKey = -1;
    }
    flushSoon() {
      if (this.delayedFlush < 0)
        this.delayedFlush = this.view.win.requestAnimationFrame(() => {
          this.delayedFlush = -1;
          this.flush();
        });
    }
    forceFlush() {
      if (this.delayedFlush >= 0) {
        this.view.win.cancelAnimationFrame(this.delayedFlush);
        this.delayedFlush = -1;
      }
      this.flush();
    }
    pendingRecords() {
      for (let mut of this.observer.takeRecords())
        this.queue.push(mut);
      return this.queue;
    }
    processRecords() {
      let records = this.pendingRecords();
      if (records.length)
        this.queue = [];
      let from = -1, to = -1, typeOver = false;
      for (let record of records) {
        let range = this.readMutation(record);
        if (!range)
          continue;
        if (range.typeOver)
          typeOver = true;
        if (from == -1) {
          ({ from, to } = range);
        } else {
          from = Math.min(range.from, from);
          to = Math.max(range.to, to);
        }
      }
      return { from, to, typeOver };
    }
    readChange() {
      let { from, to, typeOver } = this.processRecords();
      let newSel = this.selectionChanged && hasSelection(this.dom, this.selectionRange);
      if (from < 0 && !newSel)
        return null;
      if (from > -1)
        this.lastChange = Date.now();
      this.view.inputState.lastFocusTime = 0;
      this.selectionChanged = false;
      let change = new DOMChange(this.view, from, to, typeOver);
      this.view.docView.domChanged = { newSel: change.newSel ? change.newSel.main : null };
      return change;
    }
    // Apply pending changes, if any
    flush(readSelection = true) {
      if (this.delayedFlush >= 0 || this.delayedAndroidKey)
        return false;
      if (readSelection)
        this.readSelectionRange();
      let selChange = this.selectionChanged, domChange = this.readChange();
      if (!domChange) {
        this.view.requestMeasure();
        return false;
      }
      let startState = this.view.state;
      let handled = applyDOMChange(this.view, domChange);
      if (this.view.state == startState && (domChange.domChanged || selChange))
        this.view.update([]);
      return handled;
    }
    readMutation(rec) {
      let tile = this.view.docView.tile.nearest(rec.target);
      if (!tile || tile.isWidget())
        return null;
      tile.markDirty(rec.type == "attributes");
      if (rec.type == "childList") {
        let childBefore = findChild(tile, rec.previousSibling || rec.target.previousSibling, -1);
        let childAfter = findChild(tile, rec.nextSibling || rec.target.nextSibling, 1);
        return {
          from: childBefore ? tile.posAfter(childBefore) : tile.posAtStart,
          to: childAfter ? tile.posBefore(childAfter) : tile.posAtEnd,
          typeOver: false
        };
      } else if (rec.type == "characterData") {
        return { from: tile.posAtStart, to: tile.posAtEnd, typeOver: rec.target.nodeValue == rec.oldValue };
      } else {
        return null;
      }
    }
    setWindow(win) {
      if (win != this.win) {
        this.removeWindowListeners(this.win);
        this.win = win;
        this.addWindowListeners(this.win);
      }
    }
    addWindowListeners(win) {
      win.addEventListener("resize", this.onResize);
      if (this.printQuery) {
        if (this.printQuery.addEventListener)
          this.printQuery.addEventListener("change", this.onPrint);
        else
          this.printQuery.addListener(this.onPrint);
      } else
        win.addEventListener("beforeprint", this.onPrint);
      win.addEventListener("scroll", this.onScroll);
      win.document.addEventListener("selectionchange", this.onSelectionChange);
    }
    removeWindowListeners(win) {
      win.removeEventListener("scroll", this.onScroll);
      win.removeEventListener("resize", this.onResize);
      if (this.printQuery) {
        if (this.printQuery.removeEventListener)
          this.printQuery.removeEventListener("change", this.onPrint);
        else
          this.printQuery.removeListener(this.onPrint);
      } else
        win.removeEventListener("beforeprint", this.onPrint);
      win.document.removeEventListener("selectionchange", this.onSelectionChange);
    }
    update(update) {
      if (this.editContext) {
        this.editContext.update(update);
        if (update.startState.facet(editable) != update.state.facet(editable))
          update.view.contentDOM.editContext = update.state.facet(editable) ? this.editContext.editContext : null;
      }
    }
    destroy() {
      var _a2, _b, _c;
      this.stop();
      (_a2 = this.intersection) === null || _a2 === void 0 ? void 0 : _a2.disconnect();
      (_b = this.gapIntersection) === null || _b === void 0 ? void 0 : _b.disconnect();
      (_c = this.resizeScroll) === null || _c === void 0 ? void 0 : _c.disconnect();
      for (let dom of this.scrollTargets)
        dom.removeEventListener("scroll", this.onScroll);
      this.removeWindowListeners(this.win);
      clearTimeout(this.parentCheck);
      clearTimeout(this.resizeTimeout);
      this.win.cancelAnimationFrame(this.delayedFlush);
      this.win.cancelAnimationFrame(this.flushingAndroidKey);
      if (this.editContext) {
        this.view.contentDOM.editContext = null;
        this.editContext.destroy();
      }
    }
  };
  function findChild(tile, dom, dir) {
    while (dom) {
      let curTile = Tile.get(dom);
      if (curTile && curTile.parent == tile)
        return curTile;
      let parent = dom.parentNode;
      dom = parent != tile.dom ? parent : dir > 0 ? dom.nextSibling : dom.previousSibling;
    }
    return null;
  }
  function buildSelectionRangeFromRange(view2, range) {
    let anchorNode = range.startContainer, anchorOffset = range.startOffset;
    let focusNode = range.endContainer, focusOffset = range.endOffset;
    let curAnchor = view2.docView.domAtPos(view2.state.selection.main.anchor, 1);
    if (isEquivalentPosition(curAnchor.node, curAnchor.offset, focusNode, focusOffset))
      [anchorNode, anchorOffset, focusNode, focusOffset] = [focusNode, focusOffset, anchorNode, anchorOffset];
    return { anchorNode, anchorOffset, focusNode, focusOffset };
  }
  function safariSelectionRangeHack(view2, selection) {
    if (selection.getComposedRanges) {
      let range = selection.getComposedRanges(view2.root)[0];
      if (range)
        return buildSelectionRangeFromRange(view2, range);
    }
    let found = null;
    function read(event) {
      event.preventDefault();
      event.stopImmediatePropagation();
      found = event.getTargetRanges()[0];
    }
    view2.contentDOM.addEventListener("beforeinput", read, true);
    view2.dom.ownerDocument.execCommand("indent");
    view2.contentDOM.removeEventListener("beforeinput", read, true);
    return found ? buildSelectionRangeFromRange(view2, found) : null;
  }
  var EditContextManager = class {
    constructor(view2) {
      this.from = 0;
      this.to = 0;
      this.pendingContextChange = null;
      this.handlers = /* @__PURE__ */ Object.create(null);
      this.composing = null;
      this.resetRange(view2.state);
      let context = this.editContext = new window.EditContext({
        text: view2.state.doc.sliceString(this.from, this.to),
        selectionStart: this.toContextPos(Math.max(this.from, Math.min(this.to, view2.state.selection.main.anchor))),
        selectionEnd: this.toContextPos(view2.state.selection.main.head)
      });
      this.handlers.textupdate = (e) => {
        let main = view2.state.selection.main, { anchor, head } = main;
        let from = this.toEditorPos(e.updateRangeStart), to = this.toEditorPos(e.updateRangeEnd);
        if (view2.inputState.composing >= 0 && !this.composing)
          this.composing = { contextBase: e.updateRangeStart, editorBase: from, drifted: false };
        let deletes = to - from > e.text.length;
        if (from == this.from && anchor < this.from)
          from = anchor;
        else if (to == this.to && anchor > this.to)
          to = anchor;
        let diff = findDiff(view2.state.sliceDoc(from, to), e.text, (deletes ? main.from : main.to) - from, deletes ? "end" : null);
        if (!diff) {
          let newSel = EditorSelection.single(this.toEditorPos(e.selectionStart), this.toEditorPos(e.selectionEnd));
          if (!sameSelPos(newSel, main))
            view2.dispatch({ selection: newSel, userEvent: "select" });
          return;
        }
        let change = {
          from: diff.from + from,
          to: diff.toA + from,
          insert: Text.of(e.text.slice(diff.from, diff.toB).split("\n"))
        };
        if ((browser.mac || browser.android) && change.from == head - 1 && /^\. ?$/.test(e.text) && view2.contentDOM.getAttribute("autocorrect") == "off")
          change = { from, to, insert: Text.of([e.text.replace(".", " ")]) };
        this.pendingContextChange = change;
        if (!view2.state.readOnly) {
          let newLen = this.to - this.from + (change.to - change.from + change.insert.length);
          applyDOMChangeInner(view2, change, EditorSelection.single(this.toEditorPos(e.selectionStart, newLen), this.toEditorPos(e.selectionEnd, newLen)));
        }
        if (this.pendingContextChange) {
          this.revertPending(view2.state);
          this.setSelection(view2.state);
        }
        if (change.from < change.to && !change.insert.length && view2.inputState.composing >= 0 && !/[\\p{Alphabetic}\\p{Number}_]/.test(context.text.slice(Math.max(0, e.updateRangeStart - 1), Math.min(context.text.length, e.updateRangeStart + 1))))
          this.handlers.compositionend(e);
      };
      this.handlers.characterboundsupdate = (e) => {
        let rects = [], prev = null;
        for (let i2 = this.toEditorPos(e.rangeStart), end = this.toEditorPos(e.rangeEnd); i2 < end; i2++) {
          let rect = view2.coordsForChar(i2);
          prev = rect && new DOMRect(rect.left, rect.top, rect.right - rect.left, rect.bottom - rect.top) || prev || new DOMRect();
          rects.push(prev);
        }
        context.updateCharacterBounds(e.rangeStart, rects);
      };
      this.handlers.textformatupdate = (e) => {
        let deco = [];
        for (let format of e.getTextFormats()) {
          let lineStyle = format.underlineStyle, thickness = format.underlineThickness;
          if (!/none/i.test(lineStyle) && !/none/i.test(thickness)) {
            let from = this.toEditorPos(format.rangeStart), to = this.toEditorPos(format.rangeEnd);
            if (from < to) {
              let style = `text-decoration: underline ${/^[a-z]/.test(lineStyle) ? lineStyle + " " : lineStyle == "Dashed" ? "dashed " : lineStyle == "Squiggle" ? "wavy " : ""}${/thin/i.test(thickness) ? 1 : 2}px`;
              deco.push(Decoration.mark({ attributes: { style } }).range(from, to));
            }
          }
        }
        view2.dispatch({ effects: setEditContextFormatting.of(Decoration.set(deco)) });
      };
      this.handlers.compositionstart = () => {
        if (view2.inputState.composing < 0) {
          view2.inputState.composing = 0;
          view2.inputState.compositionFirstChange = true;
        }
      };
      this.handlers.compositionend = () => {
        view2.inputState.composing = -1;
        view2.inputState.compositionFirstChange = null;
        if (this.composing) {
          let { drifted } = this.composing;
          this.composing = null;
          if (drifted)
            this.reset(view2.state);
        }
      };
      for (let event in this.handlers)
        context.addEventListener(event, this.handlers[event]);
      this.measureReq = { read: (view3) => {
        let sel = getSelection(view3.root);
        if (sel && sel.rangeCount)
          this.editContext.updateSelectionBounds(sel.getRangeAt(0).getBoundingClientRect());
      } };
    }
    applyEdits(update) {
      let off = 0, abort = false, pending = this.pendingContextChange;
      update.changes.iterChanges((fromA, toA, _fromB, _toB, insert2) => {
        if (abort)
          return;
        let dLen = insert2.length - (toA - fromA);
        if (pending && toA >= pending.to) {
          if (pending.from == fromA && pending.to == toA && pending.insert.eq(insert2)) {
            pending = this.pendingContextChange = null;
            off += dLen;
            this.to += dLen;
            return;
          } else {
            pending = null;
            this.revertPending(update.state);
          }
        }
        fromA += off;
        toA += off;
        if (toA <= this.from) {
          this.from += dLen;
          this.to += dLen;
        } else if (fromA < this.to) {
          if (fromA < this.from || toA > this.to || this.to - this.from + insert2.length > 3e4) {
            abort = true;
            return;
          }
          this.editContext.updateText(this.toContextPos(fromA), this.toContextPos(toA), insert2.toString());
          this.to += dLen;
        }
        off += dLen;
      });
      if (pending && !abort)
        this.revertPending(update.state);
      return !abort;
    }
    update(update) {
      let reverted = this.pendingContextChange, startSel = update.startState.selection.main;
      if (this.composing && (this.composing.drifted || !update.changes.touchesRange(startSel.from, startSel.to) && update.transactions.some((tr) => !tr.isUserEvent("input.type") && tr.changes.touchesRange(this.from, this.to)))) {
        this.composing.drifted = true;
        this.composing.editorBase = update.changes.mapPos(this.composing.editorBase);
      } else if (!this.applyEdits(update) || !this.rangeIsValid(update.state)) {
        this.pendingContextChange = null;
        this.reset(update.state);
      } else if (update.docChanged || update.selectionSet || reverted) {
        this.setSelection(update.state);
      }
      if (update.geometryChanged || update.docChanged || update.selectionSet)
        update.view.requestMeasure(this.measureReq);
    }
    resetRange(state) {
      let { head } = state.selection.main;
      this.from = Math.max(
        0,
        head - 1e4
        /* CxVp.Margin */
      );
      this.to = Math.min(
        state.doc.length,
        head + 1e4
        /* CxVp.Margin */
      );
    }
    reset(state) {
      this.resetRange(state);
      this.editContext.updateText(0, this.editContext.text.length, state.doc.sliceString(this.from, this.to));
      this.setSelection(state);
    }
    revertPending(state) {
      let pending = this.pendingContextChange;
      this.pendingContextChange = null;
      this.editContext.updateText(this.toContextPos(pending.from), this.toContextPos(pending.from + pending.insert.length), state.doc.sliceString(pending.from, pending.to));
    }
    setSelection(state) {
      let { main } = state.selection;
      let start = this.toContextPos(Math.max(this.from, Math.min(this.to, main.anchor)));
      let end = this.toContextPos(main.head);
      if (this.editContext.selectionStart != start || this.editContext.selectionEnd != end)
        this.editContext.updateSelection(start, end);
    }
    rangeIsValid(state) {
      let { head } = state.selection.main;
      return !(this.from > 0 && head - this.from < 500 || this.to < state.doc.length && this.to - head < 500 || this.to - this.from > 1e4 * 3);
    }
    toEditorPos(contextPos, clipLen = this.to - this.from) {
      contextPos = Math.min(contextPos, clipLen);
      let c = this.composing;
      return c && c.drifted ? c.editorBase + (contextPos - c.contextBase) : contextPos + this.from;
    }
    toContextPos(editorPos) {
      let c = this.composing;
      return c && c.drifted ? c.contextBase + (editorPos - c.editorBase) : editorPos - this.from;
    }
    destroy() {
      for (let event in this.handlers)
        this.editContext.removeEventListener(event, this.handlers[event]);
    }
  };
  var EditorView = class _EditorView {
    /**
    The current editor state.
    */
    get state() {
      return this.viewState.state;
    }
    /**
    To be able to display large documents without consuming too much
    memory or overloading the browser, CodeMirror only draws the
    code that is visible (plus a margin around it) to the DOM. This
    property tells you the extent of the current drawn viewport, in
    document positions.
    */
    get viewport() {
      return this.viewState.viewport;
    }
    /**
    When there are, for example, large collapsed ranges in the
    viewport, its size can be a lot bigger than the actual visible
    content. Thus, if you are doing something like styling the
    content in the viewport, it is preferable to only do so for
    these ranges, which are the subset of the viewport that is
    actually drawn.
    */
    get visibleRanges() {
      return this.viewState.visibleRanges;
    }
    /**
    Returns false when the editor is entirely scrolled out of view
    or otherwise hidden.
    */
    get inView() {
      return this.viewState.inView;
    }
    /**
    Indicates whether the user is currently composing text via
    [IME](https://en.wikipedia.org/wiki/Input_method), and at least
    one change has been made in the current composition.
    */
    get composing() {
      return !!this.inputState && this.inputState.composing > 0;
    }
    /**
    Indicates whether the user is currently in composing state. Note
    that on some platforms, like Android, this will be the case a
    lot, since just putting the cursor on a word starts a
    composition there.
    */
    get compositionStarted() {
      return !!this.inputState && this.inputState.composing >= 0;
    }
    /**
    The document or shadow root that the view lives in.
    */
    get root() {
      return this._root;
    }
    /**
    @internal
    */
    get win() {
      return this.dom.ownerDocument.defaultView || window;
    }
    /**
    Construct a new view. You'll want to either provide a `parent`
    option, or put `view.dom` into your document after creating a
    view, so that the user can see the editor.
    */
    constructor(config = {}) {
      var _a2;
      this.plugins = [];
      this.pluginMap = /* @__PURE__ */ new Map();
      this.editorAttrs = {};
      this.contentAttrs = {};
      this.bidiCache = [];
      this.destroyed = false;
      this.updateState = 2;
      this.measureScheduled = -1;
      this.measureRequests = [];
      this.clearAnnouncement = -1;
      this.contentDOM = document.createElement("div");
      this.scrollDOM = document.createElement("div");
      this.scrollDOM.tabIndex = -1;
      this.scrollDOM.className = "cm-scroller";
      this.scrollDOM.appendChild(this.contentDOM);
      this.announceDOM = document.createElement("div");
      this.announceDOM.className = "cm-announced";
      this.announceDOM.setAttribute("aria-live", "polite");
      this.dom = document.createElement("div");
      this.dom.appendChild(this.announceDOM);
      this.dom.appendChild(this.scrollDOM);
      if (config.parent)
        config.parent.appendChild(this.dom);
      let { dispatch } = config;
      this.dispatchTransactions = config.dispatchTransactions || dispatch && ((trs) => trs.forEach((tr) => dispatch(tr, this))) || ((trs) => this.update(trs));
      this.dispatch = this.dispatch.bind(this);
      this._root = config.root || getRoot(config.parent) || document;
      this.viewState = new ViewState(this, config.state || EditorState.create(config));
      if (config.scrollTo && config.scrollTo.is(scrollIntoView))
        this.viewState.scrollTarget = config.scrollTo.value.clip(this.viewState.state);
      this.plugins = this.state.facet(viewPlugin).map((spec) => new PluginInstance(spec));
      for (let plugin of this.plugins)
        plugin.update(this);
      this.observer = new DOMObserver(this);
      this.inputState = new InputState(this);
      this.inputState.ensureHandlers(this.plugins);
      this.docView = new DocView(this);
      this.mountStyles();
      this.updateAttrs();
      this.updateState = 0;
      this.requestMeasure();
      if ((_a2 = document.fonts) === null || _a2 === void 0 ? void 0 : _a2.ready)
        document.fonts.ready.then(() => {
          this.viewState.mustMeasureContent = "refresh";
          this.requestMeasure();
        });
    }
    dispatch(...input) {
      let trs = input.length == 1 && input[0] instanceof Transaction ? input : input.length == 1 && Array.isArray(input[0]) ? input[0] : [this.state.update(...input)];
      this.dispatchTransactions(trs, this);
    }
    /**
    Update the view for the given array of transactions. This will
    update the visible document and selection to match the state
    produced by the transactions, and notify view plugins of the
    change. You should usually call
    [`dispatch`](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch) instead, which uses this
    as a primitive.
    */
    update(transactions) {
      if (this.updateState != 0)
        throw new Error("Calls to EditorView.update are not allowed while an update is in progress");
      let redrawn = false, attrsChanged = false, update;
      let state = this.state;
      for (let tr of transactions) {
        if (tr.startState != state)
          throw new RangeError("Trying to update state with a transaction that doesn't start from the previous state.");
        state = tr.state;
      }
      if (this.destroyed) {
        this.viewState.state = state;
        return;
      }
      let focus = this.hasFocus, focusFlag = 0, dispatchFocus = null;
      if (transactions.some((tr) => tr.annotation(isFocusChange))) {
        this.inputState.notifiedFocused = focus;
        focusFlag = 1;
      } else if (focus != this.inputState.notifiedFocused) {
        this.inputState.notifiedFocused = focus;
        dispatchFocus = focusChangeTransaction(state, focus);
        if (!dispatchFocus)
          focusFlag = 1;
      }
      let pendingKey = this.observer.delayedAndroidKey, domChange = null;
      if (pendingKey) {
        this.observer.clearDelayedAndroidKey();
        domChange = this.observer.readChange();
        if (domChange && !this.state.doc.eq(state.doc) || !this.state.selection.eq(state.selection))
          domChange = null;
      } else {
        this.observer.clear();
      }
      if (state.facet(EditorState.phrases) != this.state.facet(EditorState.phrases))
        return this.setState(state);
      update = ViewUpdate.create(this, state, transactions);
      update.flags |= focusFlag;
      let scrollTarget = this.viewState.scrollTarget;
      try {
        this.updateState = 2;
        for (let tr of transactions) {
          if (scrollTarget)
            scrollTarget = scrollTarget.map(tr.changes);
          if (tr.scrollIntoView) {
            let { main } = tr.state.selection;
            let { x, y } = this.state.facet(_EditorView.cursorScrollMargin);
            scrollTarget = new ScrollTarget(main.empty ? main : EditorSelection.cursor(main.head, main.head > main.anchor ? -1 : 1), "nearest", "nearest", y, x);
          }
          for (let e of tr.effects)
            if (e.is(scrollIntoView))
              scrollTarget = e.value.clip(this.state);
        }
        this.viewState.update(update, scrollTarget);
        this.bidiCache = CachedOrder.update(this.bidiCache, update.changes);
        if (!update.empty) {
          this.updatePlugins(update);
          this.inputState.update(update);
        }
        redrawn = this.docView.update(update);
        if (this.state.facet(styleModule) != this.styleModules)
          this.mountStyles();
        attrsChanged = this.updateAttrs();
        this.showAnnouncements(transactions);
        this.docView.updateSelection(redrawn, transactions.some((tr) => tr.isUserEvent("select.pointer")));
      } finally {
        this.updateState = 0;
      }
      if (update.startState.facet(theme) != update.state.facet(theme))
        this.viewState.mustMeasureContent = true;
      if (redrawn || attrsChanged || scrollTarget || this.viewState.mustEnforceCursorAssoc || this.viewState.mustMeasureContent)
        this.requestMeasure();
      if (redrawn)
        this.docViewUpdate();
      if (!update.empty)
        for (let listener of this.state.facet(updateListener)) {
          try {
            listener(update);
          } catch (e) {
            logException(this.state, e, "update listener");
          }
        }
      if (dispatchFocus || domChange)
        Promise.resolve().then(() => {
          if (dispatchFocus && this.state == dispatchFocus.startState)
            this.dispatch(dispatchFocus);
          if (domChange) {
            if (!applyDOMChange(this, domChange) && pendingKey.force)
              dispatchKey(this.contentDOM, pendingKey.key, pendingKey.keyCode);
          }
        });
    }
    /**
    Reset the view to the given state. (This will cause the entire
    document to be redrawn and all view plugins to be reinitialized,
    so you should probably only use it when the new state isn't
    derived from the old state. Otherwise, use
    [`dispatch`](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch) instead.)
    */
    setState(newState) {
      if (this.updateState != 0)
        throw new Error("Calls to EditorView.setState are not allowed while an update is in progress");
      if (this.destroyed) {
        this.viewState.state = newState;
        return;
      }
      this.updateState = 2;
      let hadFocus = this.hasFocus;
      try {
        for (let plugin of this.plugins)
          plugin.destroy(this);
        this.viewState = new ViewState(this, newState);
        this.plugins = newState.facet(viewPlugin).map((spec) => new PluginInstance(spec));
        this.pluginMap.clear();
        for (let plugin of this.plugins)
          plugin.update(this);
        this.docView.destroy();
        this.docView = new DocView(this);
        this.inputState.ensureHandlers(this.plugins);
        this.mountStyles();
        this.updateAttrs();
        this.bidiCache = [];
      } finally {
        this.updateState = 0;
      }
      if (hadFocus)
        this.focus();
      this.requestMeasure();
    }
    updatePlugins(update) {
      let prevSpecs = update.startState.facet(viewPlugin), specs = update.state.facet(viewPlugin);
      if (prevSpecs != specs) {
        let newPlugins = [];
        for (let spec of specs) {
          let found = prevSpecs.indexOf(spec);
          if (found < 0) {
            newPlugins.push(new PluginInstance(spec));
          } else {
            let plugin = this.plugins[found];
            plugin.mustUpdate = update;
            newPlugins.push(plugin);
          }
        }
        for (let plugin of this.plugins)
          if (plugin.mustUpdate != update)
            plugin.destroy(this);
        this.plugins = newPlugins;
        this.pluginMap.clear();
      } else {
        for (let p of this.plugins)
          p.mustUpdate = update;
      }
      for (let i2 = 0; i2 < this.plugins.length; i2++)
        this.plugins[i2].update(this);
      if (prevSpecs != specs)
        this.inputState.ensureHandlers(this.plugins);
    }
    docViewUpdate() {
      for (let plugin of this.plugins) {
        let val = plugin.value;
        if (val && val.docViewUpdate) {
          try {
            val.docViewUpdate(this);
          } catch (e) {
            logException(this.state, e, "doc view update listener");
          }
        }
      }
    }
    /**
    @internal
    */
    measure(flush = true) {
      if (this.destroyed)
        return;
      if (this.measureScheduled > -1)
        this.win.cancelAnimationFrame(this.measureScheduled);
      if (this.observer.delayedAndroidKey) {
        this.measureScheduled = -1;
        this.requestMeasure();
        return;
      }
      this.measureScheduled = 0;
      if (flush)
        this.observer.forceFlush();
      let updated = null;
      let scroll = this.viewState.scrollParent, scrollOffset = this.viewState.getScrollOffset();
      let { scrollAnchorPos, scrollAnchorHeight, scaleY: scrollScale } = this.viewState;
      if (Math.abs(scrollOffset - this.viewState.scrollOffset) > 1)
        scrollAnchorHeight = -1;
      this.viewState.scrollAnchorHeight = -1;
      try {
        for (let i2 = 0; ; i2++) {
          if (scrollAnchorHeight < 0) {
            if (isScrolledToBottom(scroll || this.win)) {
              scrollAnchorPos = -1;
              scrollAnchorHeight = this.viewState.heightMap.height / this.viewState.scaleY;
            } else {
              let block = this.viewState.scrollAnchorAt(scrollOffset);
              scrollAnchorPos = block.from;
              scrollAnchorHeight = block.top;
            }
            scrollScale = this.viewState.scaleY;
          }
          this.updateState = 1;
          let changed = this.viewState.measure();
          if (!changed && !this.measureRequests.length && this.viewState.scrollTarget == null)
            break;
          if (i2 > 5) {
            console.warn(this.measureRequests.length ? "Measure loop restarted more than 5 times" : "Viewport failed to stabilize");
            break;
          }
          let measuring = [];
          if (!(changed & 4))
            [this.measureRequests, measuring] = [measuring, this.measureRequests];
          let measured = measuring.map((m) => {
            try {
              return m.read(this);
            } catch (e) {
              logException(this.state, e);
              return BadMeasure;
            }
          });
          let update = ViewUpdate.create(this, this.state, []), redrawn = false;
          update.flags |= changed;
          if (!updated)
            updated = update;
          else
            updated.flags |= changed;
          this.updateState = 2;
          if (!update.empty) {
            this.updatePlugins(update);
            this.inputState.update(update);
            this.updateAttrs();
            redrawn = this.docView.update(update);
            if (redrawn)
              this.docViewUpdate();
          }
          for (let i3 = 0; i3 < measuring.length; i3++)
            if (measured[i3] != BadMeasure) {
              try {
                let m = measuring[i3];
                if (m.write)
                  m.write(measured[i3], this);
              } catch (e) {
                logException(this.state, e);
              }
            }
          if (redrawn)
            this.docView.updateSelection(true);
          if (!update.viewportChanged && this.measureRequests.length == 0) {
            if (this.viewState.editorHeight) {
              if (this.viewState.scrollTarget) {
                this.docView.scrollIntoView(this.viewState.scrollTarget);
                this.viewState.scrollTarget = null;
                scrollAnchorHeight = -1;
                continue;
              } else {
                let newAnchorHeight = scrollAnchorPos < 0 ? this.viewState.heightMap.height : this.viewState.lineBlockAt(scrollAnchorPos).top;
                let diff = newAnchorHeight / this.viewState.scaleY - scrollAnchorHeight / scrollScale;
                if ((diff > 1 || diff < -1) && !(browser.ios && this.inputState.lastIOSMomentumScroll > Date.now() - 100) && (scroll == this.scrollDOM || this.hasFocus || Math.max(this.inputState.lastWheelEvent, this.inputState.lastTouchTime) > Date.now() - 100)) {
                  scrollOffset = scrollOffset + diff;
                  if (!scroll)
                    this.win.scrollBy(0, diff);
                  else if (scrollAnchorPos < 0)
                    scroll.scrollTop = scroll.scrollHeight;
                  else
                    scroll.scrollTop += diff;
                  scrollAnchorHeight = -1;
                  continue;
                }
              }
            }
            break;
          }
        }
      } finally {
        this.updateState = 0;
        this.measureScheduled = -1;
      }
      if (updated && !updated.empty)
        for (let listener of this.state.facet(updateListener))
          listener(updated);
    }
    /**
    Get the CSS classes for the currently active editor themes.
    */
    get themeClasses() {
      return baseThemeID + " " + (this.state.facet(darkTheme) ? baseDarkID : baseLightID) + " " + this.state.facet(theme);
    }
    updateAttrs() {
      let editorAttrs = attrsFromFacet(this, editorAttributes, {
        class: "cm-editor" + (this.hasFocus ? " cm-focused " : " ") + this.themeClasses
      });
      let contentAttrs = {
        spellcheck: "false",
        autocorrect: "off",
        autocapitalize: "off",
        writingsuggestions: "false",
        translate: "no",
        contenteditable: !this.state.facet(editable) ? "false" : "true",
        class: "cm-content",
        style: `${browser.tabSize}: ${this.state.tabSize}`,
        role: "textbox",
        "aria-multiline": "true"
      };
      if (this.state.readOnly)
        contentAttrs["aria-readonly"] = "true";
      attrsFromFacet(this, contentAttributes, contentAttrs);
      let changed = this.observer.ignore(() => {
        let changedContent = updateAttrs(this.contentDOM, this.contentAttrs, contentAttrs);
        let changedEditor = updateAttrs(this.dom, this.editorAttrs, editorAttrs);
        return changedContent || changedEditor;
      });
      this.editorAttrs = editorAttrs;
      this.contentAttrs = contentAttrs;
      return changed;
    }
    showAnnouncements(trs) {
      let first = true;
      for (let tr of trs)
        for (let effect of tr.effects)
          if (effect.is(_EditorView.announce)) {
            if (first) {
              this.announceDOM.textContent = "";
              this.win.clearTimeout(this.clearAnnouncement);
              this.clearAnnouncement = this.win.setTimeout(() => {
                this.announceDOM.textContent = "\xA0";
              }, 200);
              first = false;
            }
            let div = this.announceDOM.appendChild(document.createElement("div"));
            div.textContent = effect.value;
          }
    }
    mountStyles() {
      this.styleModules = this.state.facet(styleModule);
      let nonce = this.state.facet(_EditorView.cspNonce);
      StyleModule.mount(this.root, this.styleModules.concat(baseTheme$1).reverse(), nonce ? { nonce } : void 0);
    }
    readMeasured() {
      if (this.updateState == 2)
        throw new Error("Reading the editor layout isn't allowed during an update");
      if (this.updateState == 0 && this.measureScheduled > -1)
        this.measure(false);
    }
    /**
    Schedule a layout measurement, optionally providing callbacks to
    do custom DOM measuring followed by a DOM write phase. Using
    this is preferable to reading DOM layout directly from, for
    example, an event handler, because it'll make sure measuring and
    drawing done by other components is synchronized, avoiding
    unnecessary DOM layout computations.
    */
    requestMeasure(request) {
      if (this.measureScheduled < 0)
        this.measureScheduled = this.win.requestAnimationFrame(() => this.measure());
      if (request) {
        if (this.measureRequests.indexOf(request) > -1)
          return;
        if (request.key != null)
          for (let i2 = 0; i2 < this.measureRequests.length; i2++) {
            if (this.measureRequests[i2].key === request.key) {
              this.measureRequests[i2] = request;
              return;
            }
          }
        this.measureRequests.push(request);
      }
    }
    /**
    Get the value of a specific plugin, if present. Note that
    plugins that crash can be dropped from a view, so even when you
    know you registered a given plugin, it is recommended to check
    the return value of this method.
    */
    plugin(plugin) {
      let known = this.pluginMap.get(plugin);
      if (known === void 0 || known && known.plugin != plugin)
        this.pluginMap.set(plugin, known = this.plugins.find((p) => p.plugin == plugin) || null);
      return known && known.update(this).value;
    }
    /**
    The top position of the document, in screen coordinates. This
    may be negative when the editor is scrolled down. Points
    directly to the top of the first line, not above the padding.
    */
    get documentTop() {
      return this.contentDOM.getBoundingClientRect().top + this.viewState.paddingTop;
    }
    /**
    Reports the padding above and below the document.
    */
    get documentPadding() {
      return { top: this.viewState.paddingTop, bottom: this.viewState.paddingBottom };
    }
    /**
    If the editor is transformed with CSS, this provides the scale
    along the X axis. Otherwise, it will just be 1. Note that
    transforms other than translation and scaling are not supported.
    */
    get scaleX() {
      return this.viewState.scaleX;
    }
    /**
    Provide the CSS transformed scale along the Y axis.
    */
    get scaleY() {
      return this.viewState.scaleY;
    }
    /**
    Find the text line or block widget at the given vertical
    position (which is interpreted as relative to the [top of the
    document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop)).
    */
    elementAtHeight(height) {
      this.readMeasured();
      return this.viewState.elementAtHeight(height);
    }
    /**
    Find the line block (see
    [`lineBlockAt`](https://codemirror.net/6/docs/ref/#view.EditorView.lineBlockAt)) at the given
    height, again interpreted relative to the [top of the
    document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop).
    */
    lineBlockAtHeight(height) {
      this.readMeasured();
      return this.viewState.lineBlockAtHeight(height);
    }
    /**
    Get the extent and vertical position of all [line
    blocks](https://codemirror.net/6/docs/ref/#view.EditorView.lineBlockAt) in the viewport. Positions
    are relative to the [top of the
    document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop);
    */
    get viewportLineBlocks() {
      return this.viewState.viewportLines;
    }
    /**
    Find the line block around the given document position. A line
    block is a range delimited on both sides by either a
    non-[hidden](https://codemirror.net/6/docs/ref/#view.Decoration^replace) line break, or the
    start/end of the document. It will usually just hold a line of
    text, but may be broken into multiple textblocks by block
    widgets.
    */
    lineBlockAt(pos) {
      return this.viewState.lineBlockAt(pos);
    }
    /**
    The editor's total content height.
    */
    get contentHeight() {
      return this.viewState.contentHeight;
    }
    /**
    Move a cursor position by [grapheme
    cluster](https://codemirror.net/6/docs/ref/#state.findClusterBreak). `forward` determines whether
    the motion is away from the line start, or towards it. In
    bidirectional text, the line is traversed in visual order, using
    the editor's [text direction](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection).
    When the start position was the last one on the line, the
    returned position will be across the line break. If there is no
    further line, the original position is returned.
    
    By default, this method moves over a single cluster. The
    optional `by` argument can be used to move across more. It will
    be called with the first cluster as argument, and should return
    a predicate that determines, for each subsequent cluster,
    whether it should also be moved over.
    */
    moveByChar(start, forward, by) {
      return skipAtoms(this, start, moveByChar(this, start, forward, by));
    }
    /**
    Move a cursor position across the next group of either
    [letters](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer) or non-letter
    non-whitespace characters.
    */
    moveByGroup(start, forward) {
      return skipAtoms(this, start, moveByChar(this, start, forward, (initial) => byGroup(this, start.head, initial)));
    }
    /**
    **\[DEPRECATED]** Get the cursor position visually at the start
    or end of a line.
    */
    visualLineSide(line, end) {
      return end ? EditorSelection.cursor(line.to, 1) : EditorSelection.cursor(line.from, -1);
    }
    /**
    Move to the next line boundary in the given direction. If
    `includeWrap` is true, line wrapping is on, and there is a
    further wrap point on the current line, the wrap point will be
    returned. Otherwise this function will return the start or end
    of the line.
    */
    moveToLineBoundary(start, forward, includeWrap = true) {
      return moveToLineBoundary(this, start, forward, includeWrap);
    }
    /**
    Move a cursor position vertically. When `distance` isn't given,
    it defaults to moving to the next line (including wrapped
    lines). Otherwise, `distance` should provide a positive distance
    in pixels.
    
    When `start` has a
    [`goalColumn`](https://codemirror.net/6/docs/ref/#state.SelectionRange.goalColumn), the vertical
    motion will use that as a target horizontal position. Otherwise,
    the cursor's own horizontal position is used. The returned
    cursor will have its goal column set to whichever column was
    used.
    */
    moveVertically(start, forward, distance) {
      return skipAtoms(this, start, moveVertically(this, start, forward, distance));
    }
    /**
    Find the DOM parent node and offset (child offset if `node` is
    an element, character offset when it is a text node) at the
    given document position.
    
    Note that for positions that aren't currently in
    `visibleRanges`, the resulting DOM position isn't necessarily
    meaningful (it may just point before or after a placeholder
    element).
    */
    domAtPos(pos, side = 1) {
      return this.docView.domAtPos(pos, side);
    }
    /**
    Find the document position at the given DOM node. Can be useful
    for associating positions with DOM events. Will raise an error
    when `node` isn't part of the editor content.
    */
    posAtDOM(node, offset = 0) {
      return this.docView.posFromDOM(node, offset);
    }
    posAtCoords(coords, precise = true) {
      this.readMeasured();
      let found = posAtCoords(this, coords, precise);
      return found && found.pos;
    }
    posAndSideAtCoords(coords, precise = true) {
      this.readMeasured();
      return posAtCoords(this, coords, precise);
    }
    /**
    Get the screen coordinates at the given document position.
    `side` determines whether the coordinates are based on the
    element before (-1) or after (1) the position (if no element is
    available on the given side, the method will transparently use
    another strategy to get reasonable coordinates).
    */
    coordsAtPos(pos, side = 1) {
      this.readMeasured();
      let line = this.state.doc.lineAt(pos), order = this.bidiSpans(line);
      let span = order[BidiSpan.find(order, pos - line.from, -1, side)];
      if (line.length && (pos == line.from && side < 0 || pos == line.to && side > 0) && span.dir != this.textDirectionAt(line.from)) {
        if (pos == line.to) {
          pos = line.from + span.from;
          side = 1;
        } else {
          pos = line.from + span.to;
          side = -1;
        }
      }
      return this.docView.coordsAt(pos, side, span.dir == Direction.RTL);
    }
    /**
    Return the rectangle around a given character. If `pos` does not
    point in front of a character that is in the viewport and
    rendered (i.e. not replaced, not a line break), this will return
    null. For space characters that are a line wrap point, this will
    return the position before the line break.
    */
    coordsForChar(pos) {
      this.readMeasured();
      return this.docView.coordsForChar(pos);
    }
    /**
    The default width of a character in the editor. May not
    accurately reflect the width of all characters (given variable
    width fonts or styling of invididual ranges).
    */
    get defaultCharacterWidth() {
      return this.viewState.heightOracle.charWidth;
    }
    /**
    The default height of a line in the editor. May not be accurate
    for all lines.
    */
    get defaultLineHeight() {
      return this.viewState.heightOracle.lineHeight;
    }
    /**
    The text direction
    ([`direction`](https://developer.mozilla.org/en-US/docs/Web/CSS/direction)
    CSS property) of the editor's content element.
    */
    get textDirection() {
      return this.viewState.defaultTextDirection;
    }
    /**
    Find the text direction of the block at the given position, as
    assigned by CSS. If
    [`perLineTextDirection`](https://codemirror.net/6/docs/ref/#view.EditorView^perLineTextDirection)
    isn't enabled, or the given position is outside of the viewport,
    this will always return the same as
    [`textDirection`](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection). Note that
    this may trigger a DOM layout.
    */
    textDirectionAt(pos) {
      let perLine = this.state.facet(perLineTextDirection);
      if (!perLine || pos < this.viewport.from || pos > this.viewport.to)
        return this.textDirection;
      this.readMeasured();
      return this.docView.textDirectionAt(pos);
    }
    /**
    Whether this editor [wraps lines](https://codemirror.net/6/docs/ref/#view.EditorView.lineWrapping)
    (as determined by the
    [`white-space`](https://developer.mozilla.org/en-US/docs/Web/CSS/white-space)
    CSS property of its content element).
    */
    get lineWrapping() {
      return this.viewState.heightOracle.lineWrapping;
    }
    /**
    Returns the bidirectional text structure of the given line
    (which should be in the current document) as an array of span
    objects. The order of these spans matches the [text
    direction](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection)—if that is
    left-to-right, the leftmost spans come first, otherwise the
    rightmost spans come first.
    */
    bidiSpans(line) {
      if (line.length > MaxBidiLine)
        return trivialOrder(line.length);
      let dir = this.textDirectionAt(line.from), isolates;
      for (let entry of this.bidiCache) {
        if (entry.from == line.from && entry.dir == dir && (entry.fresh || isolatesEq(entry.isolates, isolates = getIsolatedRanges(this, line))))
          return entry.order;
      }
      if (!isolates)
        isolates = getIsolatedRanges(this, line);
      let order = computeOrder(line.text, dir, isolates);
      this.bidiCache.push(new CachedOrder(line.from, line.to, dir, isolates, true, order));
      return order;
    }
    /**
    Check whether the editor has focus.
    */
    get hasFocus() {
      var _a2;
      return (this.dom.ownerDocument.hasFocus() || browser.safari && ((_a2 = this.inputState) === null || _a2 === void 0 ? void 0 : _a2.lastContextMenu) > Date.now() - 3e4) && this.root.activeElement == this.contentDOM;
    }
    /**
    Put focus on the editor.
    */
    focus() {
      this.observer.ignore(() => {
        focusPreventScroll(this.contentDOM);
        this.docView.updateSelection();
      });
    }
    /**
    Update the [root](https://codemirror.net/6/docs/ref/##view.EditorViewConfig.root) in which the editor lives. This is only
    necessary when moving the editor's existing DOM to a new window or shadow root.
    */
    setRoot(root) {
      if (this._root != root) {
        this._root = root;
        this.observer.setWindow((root.nodeType == 9 ? root : root.ownerDocument).defaultView || window);
        this.mountStyles();
      }
    }
    /**
    Clean up this editor view, removing its element from the
    document, unregistering event handlers, and notifying
    plugins. The view instance can no longer be used after
    calling this.
    */
    destroy() {
      if (this.root.activeElement == this.contentDOM)
        this.contentDOM.blur();
      for (let plugin of this.plugins)
        plugin.destroy(this);
      this.plugins = [];
      this.inputState.destroy();
      this.docView.destroy();
      this.dom.remove();
      this.observer.destroy();
      this.win.clearTimeout(this.clearAnnouncement);
      if (this.measureScheduled > -1)
        this.win.cancelAnimationFrame(this.measureScheduled);
      this.destroyed = true;
    }
    /**
    Returns an effect that can be
    [added](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) to a transaction to
    cause it to scroll the given position or range into view.
    */
    static scrollIntoView(pos, options = {}) {
      var _a2, _b, _c, _d;
      return scrollIntoView.of(new ScrollTarget(typeof pos == "number" ? EditorSelection.cursor(pos) : pos, (_a2 = options.y) !== null && _a2 !== void 0 ? _a2 : "nearest", (_b = options.x) !== null && _b !== void 0 ? _b : "nearest", (_c = options.yMargin) !== null && _c !== void 0 ? _c : 5, (_d = options.xMargin) !== null && _d !== void 0 ? _d : 5));
    }
    /**
    Return an effect that resets the editor to its current (at the
    time this method was called) scroll position. Note that this
    only affects the editor's own scrollable element, not parents.
    See also
    [`EditorViewConfig.scrollTo`](https://codemirror.net/6/docs/ref/#view.EditorViewConfig.scrollTo).
    
    The effect should be used with a document identical to the one
    it was created for. Failing to do so is not an error, but may
    not scroll to the expected position. You can
    [map](https://codemirror.net/6/docs/ref/#state.StateEffect.map) the effect to account for changes.
    */
    scrollSnapshot() {
      let { scrollTop, scrollLeft } = this.scrollDOM;
      let ref = this.viewState.scrollAnchorAt(scrollTop);
      return scrollIntoView.of(new ScrollTarget(EditorSelection.cursor(ref.from), "start", "start", ref.top - scrollTop, scrollLeft, true));
    }
    /**
    Enable or disable tab-focus mode, which disables key bindings
    for Tab and Shift-Tab, letting the browser's default
    focus-changing behavior go through instead. This is useful to
    prevent trapping keyboard users in your editor.
    
    Without argument, this toggles the mode. With a boolean, it
    enables (true) or disables it (false). Given a number, it
    temporarily enables the mode until that number of milliseconds
    have passed or another non-Tab key is pressed.
    */
    setTabFocusMode(to) {
      if (to == null)
        this.inputState.tabFocusMode = this.inputState.tabFocusMode < 0 ? 0 : -1;
      else if (typeof to == "boolean")
        this.inputState.tabFocusMode = to ? 0 : -1;
      else if (this.inputState.tabFocusMode != 0)
        this.inputState.tabFocusMode = Date.now() + to;
    }
    /**
    Returns an extension that can be used to add DOM event handlers.
    The value should be an object mapping event names to handler
    functions. For any given event, such functions are ordered by
    extension precedence, and the first handler to return true will
    be assumed to have handled that event, and no other handlers or
    built-in behavior will be activated for it. These are registered
    on the [content element](https://codemirror.net/6/docs/ref/#view.EditorView.contentDOM), except
    for `scroll` handlers, which will be called any time the
    editor's [scroll element](https://codemirror.net/6/docs/ref/#view.EditorView.scrollDOM) or one of
    its parent nodes is scrolled.
    */
    static domEventHandlers(handlers2) {
      return ViewPlugin.define(() => ({}), { eventHandlers: handlers2 });
    }
    /**
    Create an extension that registers DOM event observers. Contrary
    to event [handlers](https://codemirror.net/6/docs/ref/#view.EditorView^domEventHandlers),
    observers can't be prevented from running by a higher-precedence
    handler returning true. They also don't prevent other handlers
    and observers from running when they return true, and should not
    call `preventDefault`.
    */
    static domEventObservers(observers2) {
      return ViewPlugin.define(() => ({}), { eventObservers: observers2 });
    }
    /**
    Create a theme extension. The first argument can be a
    [`style-mod`](https://code.haverbeke.berlin/marijn/style-mod#documentation)
    style spec providing the styles for the theme. These will be
    prefixed with a generated class for the style.
    
    Because the selectors will be prefixed with a scope class, rule
    that directly match the editor's [wrapper
    element](https://codemirror.net/6/docs/ref/#view.EditorView.dom)—to which the scope class will be
    added—need to be explicitly differentiated by adding an `&` to
    the selector for that element—for example
    `&.cm-focused`.
    
    When `dark` is set to true, the theme will be marked as dark,
    which will cause the `&dark` rules from [base
    themes](https://codemirror.net/6/docs/ref/#view.EditorView^baseTheme) to be used (as opposed to
    `&light` when a light theme is active).
    */
    static theme(spec, options) {
      let prefix = StyleModule.newName();
      let result = [theme.of(prefix), styleModule.of(buildTheme(`.${prefix}`, spec))];
      if (options && options.dark)
        result.push(darkTheme.of(true));
      return result;
    }
    /**
    Create an extension that adds styles to the base theme. Like
    with [`theme`](https://codemirror.net/6/docs/ref/#view.EditorView^theme), use `&` to indicate the
    place of the editor wrapper element when directly targeting
    that. You can also use `&dark` or `&light` instead to only
    target editors with a dark or light theme.
    */
    static baseTheme(spec) {
      return Prec.lowest(styleModule.of(buildTheme("." + baseThemeID, spec, lightDarkIDs)));
    }
    /**
    Retrieve an editor view instance from the view's DOM
    representation.
    */
    static findFromDOM(dom) {
      var _a2;
      let content2 = dom.querySelector(".cm-content");
      let tile = content2 && Tile.get(content2) || Tile.get(dom);
      return ((_a2 = tile === null || tile === void 0 ? void 0 : tile.root) === null || _a2 === void 0 ? void 0 : _a2.view) || null;
    }
  };
  EditorView.styleModule = styleModule;
  EditorView.inputHandler = inputHandler;
  EditorView.clipboardInputFilter = clipboardInputFilter;
  EditorView.clipboardOutputFilter = clipboardOutputFilter;
  EditorView.scrollHandler = scrollHandler;
  EditorView.focusChangeEffect = focusChangeEffect;
  EditorView.perLineTextDirection = perLineTextDirection;
  EditorView.exceptionSink = exceptionSink;
  EditorView.updateListener = updateListener;
  EditorView.editable = editable;
  EditorView.mouseSelectionStyle = mouseSelectionStyle;
  EditorView.dragMovesSelection = dragMovesSelection$1;
  EditorView.clickAddsSelectionRange = clickAddsSelectionRange;
  EditorView.decorations = decorations;
  EditorView.blockWrappers = blockWrappers;
  EditorView.outerDecorations = outerDecorations;
  EditorView.atomicRanges = atomicRanges;
  EditorView.bidiIsolatedRanges = bidiIsolatedRanges;
  EditorView.cursorScrollMargin = /* @__PURE__ */ Facet.define({
    combine: (inputs) => {
      let x = 5, y = 5;
      for (let i2 of inputs) {
        if (typeof i2 == "number")
          x = y = i2;
        else
          ({ x, y } = i2);
      }
      return { x, y };
    }
  });
  EditorView.scrollMargins = scrollMargins;
  EditorView.darkTheme = darkTheme;
  EditorView.cspNonce = /* @__PURE__ */ Facet.define({ combine: (values) => values.length ? values[0] : "" });
  EditorView.contentAttributes = contentAttributes;
  EditorView.editorAttributes = editorAttributes;
  EditorView.lineWrapping = /* @__PURE__ */ EditorView.contentAttributes.of({ "class": "cm-lineWrapping" });
  EditorView.announce = /* @__PURE__ */ StateEffect.define();
  var MaxBidiLine = 4096;
  var BadMeasure = {};
  var CachedOrder = class _CachedOrder {
    constructor(from, to, dir, isolates, fresh, order) {
      this.from = from;
      this.to = to;
      this.dir = dir;
      this.isolates = isolates;
      this.fresh = fresh;
      this.order = order;
    }
    static update(cache, changes) {
      if (changes.empty && !cache.some((c) => c.fresh))
        return cache;
      let result = [], lastDir = cache.length ? cache[cache.length - 1].dir : Direction.LTR;
      for (let i2 = Math.max(0, cache.length - 10); i2 < cache.length; i2++) {
        let entry = cache[i2];
        if (entry.dir == lastDir && !changes.touchesRange(entry.from, entry.to))
          result.push(new _CachedOrder(changes.mapPos(entry.from, 1), changes.mapPos(entry.to, -1), entry.dir, entry.isolates, false, entry.order));
      }
      return result;
    }
  };
  function attrsFromFacet(view2, facet, base2) {
    for (let sources = view2.state.facet(facet), i2 = sources.length - 1; i2 >= 0; i2--) {
      let source = sources[i2], value = typeof source == "function" ? source(view2) : source;
      if (value)
        combineAttrs(value, base2);
    }
    return base2;
  }
  var currentPlatform = browser.mac ? "mac" : browser.windows ? "win" : browser.linux ? "linux" : "key";
  function normalizeKeyName(name2, platform) {
    const parts = name2.split(/-(?!$)/);
    let result = parts[parts.length - 1];
    if (result == "Space")
      result = " ";
    let alt, ctrl, shift2, meta2;
    for (let i2 = 0; i2 < parts.length - 1; ++i2) {
      const mod = parts[i2];
      if (/^(cmd|meta|m)$/i.test(mod))
        meta2 = true;
      else if (/^a(lt)?$/i.test(mod))
        alt = true;
      else if (/^(c|ctrl|control)$/i.test(mod))
        ctrl = true;
      else if (/^s(hift)?$/i.test(mod))
        shift2 = true;
      else if (/^mod$/i.test(mod)) {
        if (platform == "mac")
          meta2 = true;
        else
          ctrl = true;
      } else
        throw new Error("Unrecognized modifier name: " + mod);
    }
    if (alt)
      result = "Alt-" + result;
    if (ctrl)
      result = "Ctrl-" + result;
    if (meta2)
      result = "Meta-" + result;
    if (shift2)
      result = "Shift-" + result;
    return result;
  }
  function modifiers(name2, event, shift2) {
    if (event.altKey)
      name2 = "Alt-" + name2;
    if (event.ctrlKey)
      name2 = "Ctrl-" + name2;
    if (event.metaKey)
      name2 = "Meta-" + name2;
    if (shift2 !== false && event.shiftKey)
      name2 = "Shift-" + name2;
    return name2;
  }
  var handleKeyEvents = /* @__PURE__ */ Prec.default(/* @__PURE__ */ EditorView.domEventHandlers({
    keydown(event, view2) {
      return runHandlers(getKeymap(view2.state), event, view2, "editor");
    }
  }));
  var keymap = /* @__PURE__ */ Facet.define({ enables: handleKeyEvents });
  var Keymaps = /* @__PURE__ */ new WeakMap();
  function getKeymap(state) {
    let bindings = state.facet(keymap);
    let map = Keymaps.get(bindings);
    if (!map)
      Keymaps.set(bindings, map = buildKeymap(bindings.reduce((a, b) => a.concat(b), [])));
    return map;
  }
  var storedPrefix = null;
  var PrefixTimeout = 4e3;
  function buildKeymap(bindings, platform = currentPlatform) {
    let bound = /* @__PURE__ */ Object.create(null);
    let isPrefix = /* @__PURE__ */ Object.create(null);
    let checkPrefix = (name2, is) => {
      let current = isPrefix[name2];
      if (current == null)
        isPrefix[name2] = is;
      else if (current != is)
        throw new Error("Key binding " + name2 + " is used both as a regular binding and as a multi-stroke prefix");
    };
    let add = (scope, key, command2, preventDefault, stopPropagation) => {
      var _a2, _b;
      let scopeObj = bound[scope] || (bound[scope] = /* @__PURE__ */ Object.create(null));
      let parts = key.split(/ (?!$)/).map((k) => normalizeKeyName(k, platform));
      for (let i2 = 1; i2 < parts.length; i2++) {
        let prefix = parts.slice(0, i2).join(" ");
        checkPrefix(prefix, true);
        if (!scopeObj[prefix])
          scopeObj[prefix] = {
            preventDefault: true,
            stopPropagation: false,
            run: [(view2) => {
              let ourObj = storedPrefix = { view: view2, prefix, scope };
              setTimeout(() => {
                if (storedPrefix == ourObj)
                  storedPrefix = null;
              }, PrefixTimeout);
              return true;
            }]
          };
      }
      let full = parts.join(" ");
      checkPrefix(full, false);
      let binding = scopeObj[full] || (scopeObj[full] = {
        preventDefault: false,
        stopPropagation: false,
        run: ((_b = (_a2 = scopeObj._any) === null || _a2 === void 0 ? void 0 : _a2.run) === null || _b === void 0 ? void 0 : _b.slice()) || []
      });
      if (command2)
        binding.run.push(command2);
      if (preventDefault)
        binding.preventDefault = true;
      if (stopPropagation)
        binding.stopPropagation = true;
    };
    for (let b of bindings) {
      let scopes = b.scope ? b.scope.split(" ") : ["editor"];
      if (b.any)
        for (let scope of scopes) {
          let scopeObj = bound[scope] || (bound[scope] = /* @__PURE__ */ Object.create(null));
          if (!scopeObj._any)
            scopeObj._any = { preventDefault: false, stopPropagation: false, run: [] };
          let { any } = b;
          for (let key in scopeObj)
            scopeObj[key].run.push((view2) => any(view2, currentKeyEvent));
        }
      let name2 = b[platform] || b.key;
      if (!name2)
        continue;
      for (let scope of scopes) {
        add(scope, name2, b.run, b.preventDefault, b.stopPropagation);
        if (b.shift)
          add(scope, "Shift-" + name2, b.shift, b.preventDefault, b.stopPropagation);
      }
    }
    return bound;
  }
  var currentKeyEvent = null;
  function runHandlers(map, event, view2, scope) {
    currentKeyEvent = event;
    let name2 = keyName(event);
    let charCode = codePointAt2(name2, 0), isChar = codePointSize2(charCode) == name2.length && name2 != " ";
    let prefix = "", handled = false, prevented = false, stopPropagation = false;
    if (storedPrefix && storedPrefix.view == view2 && storedPrefix.scope == scope) {
      prefix = storedPrefix.prefix + " ";
      if (modifierCodes.indexOf(event.keyCode) < 0) {
        prevented = true;
        storedPrefix = null;
      }
    }
    let ran = /* @__PURE__ */ new Set();
    let runFor = (binding) => {
      if (binding) {
        for (let cmd2 of binding.run)
          if (!ran.has(cmd2)) {
            ran.add(cmd2);
            if (cmd2(view2)) {
              if (binding.stopPropagation)
                stopPropagation = true;
              return true;
            }
          }
        if (binding.preventDefault) {
          if (binding.stopPropagation)
            stopPropagation = true;
          prevented = true;
        }
      }
      return false;
    };
    let scopeObj = map[scope], baseName, shiftName;
    if (scopeObj) {
      if (runFor(scopeObj[prefix + modifiers(name2, event, !isChar)])) {
        handled = true;
      } else if (isChar && (event.altKey || event.metaKey || event.ctrlKey) && // Ctrl-Alt may be used for AltGr on Windows
      !(browser.windows && event.ctrlKey && event.altKey) && // Alt-combinations on macOS tend to be typed characters
      !(browser.mac && event.altKey && !(event.ctrlKey || event.metaKey)) && (baseName = base[event.keyCode]) && baseName != name2) {
        if (runFor(scopeObj[prefix + modifiers(baseName, event, true)])) {
          handled = true;
        } else if (event.shiftKey && (shiftName = shift[event.keyCode]) != name2 && shiftName != baseName && runFor(scopeObj[prefix + modifiers(shiftName, event, false)])) {
          handled = true;
        }
      } else if (isChar && event.shiftKey && runFor(scopeObj[prefix + modifiers(name2, event, true)])) {
        handled = true;
      }
      if (!handled && runFor(scopeObj._any))
        handled = true;
    }
    if (prevented)
      handled = true;
    if (handled && stopPropagation)
      event.stopPropagation();
    currentKeyEvent = null;
    return handled;
  }
  var RectangleMarker = class _RectangleMarker {
    /**
    Create a marker with the given class and dimensions. If `width`
    is null, the DOM element will get no width style.
    */
    constructor(className, left, top2, width, height) {
      this.className = className;
      this.left = left;
      this.top = top2;
      this.width = width;
      this.height = height;
    }
    draw() {
      let elt = document.createElement("div");
      elt.className = this.className;
      this.adjust(elt);
      return elt;
    }
    update(elt, prev) {
      if (prev.className != this.className)
        return false;
      this.adjust(elt);
      return true;
    }
    adjust(elt) {
      elt.style.left = this.left + "px";
      elt.style.top = this.top + "px";
      if (this.width != null)
        elt.style.width = this.width + "px";
      elt.style.height = this.height + "px";
    }
    eq(p) {
      return this.left == p.left && this.top == p.top && this.width == p.width && this.height == p.height && this.className == p.className;
    }
    /**
    Create a set of rectangles for the given selection range,
    assigning them theclass`className`. Will create a single
    rectangle for empty ranges, and a set of selection-style
    rectangles covering the range's content (in a bidi-aware
    way) for non-empty ones.
    */
    static forRange(view2, className, range) {
      if (range.empty) {
        let pos = view2.coordsAtPos(range.head, range.assoc || 1);
        if (!pos)
          return [];
        let base2 = getBase(view2);
        return [new _RectangleMarker(className, pos.left - base2.left, pos.top - base2.top, null, pos.bottom - pos.top)];
      } else {
        return rectanglesForRange(view2, className, range);
      }
    }
  };
  function getBase(view2) {
    let rect = view2.scrollDOM.getBoundingClientRect();
    let left = view2.textDirection == Direction.LTR ? rect.left : rect.right - view2.scrollDOM.clientWidth * view2.scaleX;
    return { left: left - view2.scrollDOM.scrollLeft * view2.scaleX, top: rect.top - view2.scrollDOM.scrollTop * view2.scaleY };
  }
  function wrappedLine(view2, pos, side, inside) {
    let coords = view2.coordsAtPos(pos, side * 2);
    if (!coords)
      return inside;
    let editorRect = view2.dom.getBoundingClientRect();
    let y = (coords.top + coords.bottom) / 2;
    let left = view2.posAtCoords({ x: editorRect.left + 1, y });
    let right = view2.posAtCoords({ x: editorRect.right - 1, y });
    if (left == null || right == null)
      return inside;
    return { from: Math.max(inside.from, Math.min(left, right)), to: Math.min(inside.to, Math.max(left, right)) };
  }
  function rectanglesForRange(view2, className, range) {
    if (range.to <= view2.viewport.from || range.from >= view2.viewport.to)
      return [];
    let from = Math.max(range.from, view2.viewport.from), to = Math.min(range.to, view2.viewport.to);
    let ltr = view2.textDirection == Direction.LTR;
    let content2 = view2.contentDOM, contentRect = content2.getBoundingClientRect(), base2 = getBase(view2);
    let lineElt = content2.querySelector(".cm-line"), lineStyle = lineElt && window.getComputedStyle(lineElt);
    let leftSide = contentRect.left + (lineStyle ? parseInt(lineStyle.paddingLeft) + Math.min(0, parseInt(lineStyle.textIndent)) : 0);
    let rightSide = contentRect.right - (lineStyle ? parseInt(lineStyle.paddingRight) : 0);
    let startBlock = blockAt(view2, from, 1), endBlock = blockAt(view2, to, -1);
    let visualStart = startBlock.type == BlockType.Text ? startBlock : null;
    let visualEnd = endBlock.type == BlockType.Text ? endBlock : null;
    if (visualStart && (view2.lineWrapping || startBlock.widgetLineBreaks))
      visualStart = wrappedLine(view2, from, 1, visualStart);
    if (visualEnd && (view2.lineWrapping || endBlock.widgetLineBreaks))
      visualEnd = wrappedLine(view2, to, -1, visualEnd);
    if (visualStart && visualEnd && visualStart.from == visualEnd.from && visualStart.to == visualEnd.to) {
      return pieces(drawForLine(range.from, range.to, visualStart));
    } else {
      let top2 = visualStart ? drawForLine(range.from, null, visualStart) : drawForWidget(startBlock, false);
      let bottom = visualEnd ? drawForLine(null, range.to, visualEnd) : drawForWidget(endBlock, true);
      let between = [];
      if ((visualStart || startBlock).to < (visualEnd || endBlock).from - (visualStart && visualEnd ? 1 : 0) || startBlock.widgetLineBreaks > 1 && top2.bottom + view2.defaultLineHeight / 2 < bottom.top)
        between.push(piece(leftSide, top2.bottom, rightSide, bottom.top));
      else if (top2.bottom < bottom.top && view2.elementAtHeight((top2.bottom + bottom.top) / 2).type == BlockType.Text)
        top2.bottom = bottom.top = (top2.bottom + bottom.top) / 2;
      return pieces(top2).concat(between).concat(pieces(bottom));
    }
    function piece(left, top2, right, bottom) {
      return new RectangleMarker(className, left - base2.left, top2 - base2.top, Math.max(0, right - left), bottom - top2);
    }
    function pieces({ top: top2, bottom, horizontal }) {
      let pieces2 = [];
      for (let i2 = 0; i2 < horizontal.length; i2 += 2)
        pieces2.push(piece(horizontal[i2], top2, horizontal[i2 + 1], bottom));
      return pieces2;
    }
    function drawForLine(from2, to2, line) {
      let top2 = 1e9, bottom = -1e9, horizontal = [];
      function addSpan(from3, fromOpen, to3, toOpen, dir) {
        let fromCoords = view2.coordsAtPos(from3, from3 == line.to ? -2 : 2);
        let toCoords = view2.coordsAtPos(to3, to3 == line.from ? 2 : -2);
        if (!fromCoords || !toCoords)
          return;
        top2 = Math.min(fromCoords.top, toCoords.top, top2);
        bottom = Math.max(fromCoords.bottom, toCoords.bottom, bottom);
        if (dir == Direction.LTR)
          horizontal.push(ltr && fromOpen ? leftSide : fromCoords.left, ltr && toOpen ? rightSide : toCoords.right);
        else
          horizontal.push(!ltr && toOpen ? leftSide : toCoords.left, !ltr && fromOpen ? rightSide : fromCoords.right);
      }
      let start = from2 !== null && from2 !== void 0 ? from2 : line.from, end = to2 !== null && to2 !== void 0 ? to2 : line.to;
      for (let r of view2.visibleRanges)
        if (r.to > start && r.from < end) {
          for (let pos = Math.max(r.from, start), endPos = Math.min(r.to, end); ; ) {
            let docLine = view2.state.doc.lineAt(pos);
            for (let span of view2.bidiSpans(docLine)) {
              let spanFrom = span.from + docLine.from, spanTo = span.to + docLine.from;
              if (spanFrom >= endPos)
                break;
              if (spanTo > pos)
                addSpan(Math.max(spanFrom, pos), from2 == null && spanFrom <= start, Math.min(spanTo, endPos), to2 == null && spanTo >= end, span.dir);
            }
            pos = docLine.to + 1;
            if (pos >= endPos)
              break;
          }
        }
      if (horizontal.length == 0)
        addSpan(start, from2 == null, end, to2 == null, view2.textDirection);
      return { top: top2, bottom, horizontal };
    }
    function drawForWidget(block, top2) {
      let y = contentRect.top + (top2 ? block.top : block.bottom);
      return { top: y, bottom: y, horizontal: [] };
    }
  }
  function sameMarker(a, b) {
    return a.constructor == b.constructor && a.eq(b);
  }
  var LayerView = class {
    constructor(view2, layer2) {
      this.view = view2;
      this.layer = layer2;
      this.drawn = [];
      this.scaleX = 1;
      this.scaleY = 1;
      this.measureReq = { read: this.measure.bind(this), write: this.draw.bind(this) };
      this.dom = view2.scrollDOM.appendChild(document.createElement("div"));
      this.dom.classList.add("cm-layer");
      if (layer2.above)
        this.dom.classList.add("cm-layer-above");
      if (layer2.class)
        this.dom.classList.add(layer2.class);
      this.scale();
      this.dom.setAttribute("aria-hidden", "true");
      this.setOrder(view2.state);
      view2.requestMeasure(this.measureReq);
      if (layer2.mount)
        layer2.mount(this.dom, view2);
    }
    update(update) {
      if (update.startState.facet(layerOrder) != update.state.facet(layerOrder))
        this.setOrder(update.state);
      if (this.layer.update(update, this.dom) || update.geometryChanged) {
        this.scale();
        update.view.requestMeasure(this.measureReq);
      }
    }
    docViewUpdate(view2) {
      if (this.layer.updateOnDocViewUpdate !== false)
        view2.requestMeasure(this.measureReq);
    }
    setOrder(state) {
      let pos = 0, order = state.facet(layerOrder);
      while (pos < order.length && order[pos] != this.layer)
        pos++;
      this.dom.style.zIndex = String((this.layer.above ? 150 : -1) - pos);
    }
    measure() {
      return this.layer.markers(this.view);
    }
    scale() {
      let { scaleX, scaleY } = this.view;
      if (scaleX != this.scaleX || scaleY != this.scaleY) {
        this.scaleX = scaleX;
        this.scaleY = scaleY;
        this.dom.style.transform = `scale(${1 / scaleX}, ${1 / scaleY})`;
      }
    }
    draw(markers) {
      if (markers.length != this.drawn.length || markers.some((p, i2) => !sameMarker(p, this.drawn[i2]))) {
        let old = this.dom.firstChild, oldI = 0;
        for (let marker of markers) {
          if (marker.update && old && marker.constructor && this.drawn[oldI].constructor && marker.update(old, this.drawn[oldI])) {
            old = old.nextSibling;
            oldI++;
          } else {
            this.dom.insertBefore(marker.draw(), old);
          }
        }
        while (old) {
          let next = old.nextSibling;
          old.remove();
          old = next;
        }
        this.drawn = markers;
        if (browser.webkit)
          this.dom.style.display = this.dom.firstChild ? "" : "none";
      }
    }
    destroy() {
      if (this.layer.destroy)
        this.layer.destroy(this.dom, this.view);
      this.dom.remove();
    }
  };
  var layerOrder = /* @__PURE__ */ Facet.define();
  function layer(config) {
    return [
      ViewPlugin.define((v) => new LayerView(v, config)),
      layerOrder.of(config)
    ];
  }
  var drawMainRange = !browser.ios;
  var selectionConfig = /* @__PURE__ */ Facet.define({
    combine(configs) {
      return combineConfig(configs, {
        cursorBlinkRate: 1200,
        drawRangeCursor: true,
        iosSelectionHandles: true
      }, {
        cursorBlinkRate: (a, b) => Math.min(a, b),
        drawRangeCursor: (a, b) => a || b
      });
    }
  });
  function drawSelection(config = {}) {
    return [
      selectionConfig.of(config),
      cursorLayer,
      selectionLayer,
      hideNativeSelection,
      nativeSelectionHidden.of(true)
    ];
  }
  function configChanged(update) {
    return update.startState.facet(selectionConfig) != update.state.facet(selectionConfig);
  }
  var cursorLayer = /* @__PURE__ */ layer({
    above: true,
    markers(view2) {
      let { state } = view2, conf = state.facet(selectionConfig);
      let cursors = [];
      for (let r of state.selection.ranges) {
        let prim = r == state.selection.main;
        if (r.empty || conf.drawRangeCursor && !(prim && browser.ios && conf.iosSelectionHandles)) {
          let className = prim ? "cm-cursor cm-cursor-primary" : "cm-cursor cm-cursor-secondary";
          let cursor = r.empty ? r : EditorSelection.cursor(r.head, r.assoc);
          for (let piece of RectangleMarker.forRange(view2, className, cursor))
            cursors.push(piece);
        }
      }
      return cursors;
    },
    update(update, dom) {
      if (update.transactions.some((tr) => tr.selection))
        dom.style.animationName = dom.style.animationName == "cm-blink" ? "cm-blink2" : "cm-blink";
      let confChange = configChanged(update);
      if (confChange)
        setBlinkRate(update.state, dom);
      return update.docChanged || update.selectionSet || confChange;
    },
    mount(dom, view2) {
      setBlinkRate(view2.state, dom);
    },
    class: "cm-cursorLayer"
  });
  function setBlinkRate(state, dom) {
    dom.style.animationDuration = state.facet(selectionConfig).cursorBlinkRate + "ms";
  }
  var selectionLayer = /* @__PURE__ */ layer({
    above: false,
    markers(view2) {
      let markers = [], { main, ranges } = view2.state.selection;
      for (let r of ranges)
        if (!r.empty && (drawMainRange || r != main)) {
          for (let marker of RectangleMarker.forRange(view2, "cm-selectionBackground", r))
            markers.push(marker);
        }
      if (browser.ios && !main.empty && view2.state.facet(selectionConfig).iosSelectionHandles) {
        for (let piece of RectangleMarker.forRange(view2, "cm-selectionHandle cm-selectionHandle-start", EditorSelection.cursor(main.from, 1)))
          markers.push(piece);
        for (let piece of RectangleMarker.forRange(view2, "cm-selectionHandle cm-selectionHandle-end", EditorSelection.cursor(main.to, 1)))
          markers.push(piece);
      }
      return markers;
    },
    update(update, dom) {
      return update.docChanged || update.selectionSet || update.viewportChanged || configChanged(update);
    },
    class: "cm-selectionLayer"
  });
  var selectionBg = browser.gecko && browser.gecko_version == 153 ? "#ffffff01" : "transparent";
  var hideNativeSelection = /* @__PURE__ */ Prec.highest(/* @__PURE__ */ EditorView.theme({
    ".cm-line": {
      ...drawMainRange ? {
        "& ::selection, &::selection": { backgroundColor: `${selectionBg} !important` }
      } : {},
      caretColor: "transparent !important"
    },
    ".cm-content": {
      caretColor: "transparent !important",
      "& :focus": {
        caretColor: "initial !important",
        ...drawMainRange ? {
          "&::selection, & ::selection": {
            backgroundColor: "Highlight !important"
          }
        } : {}
      }
    }
  }));
  var UnicodeRegexpSupport = /x/.unicode != null ? "gu" : "g";
  function highlightActiveLine() {
    return activeLineHighlighter;
  }
  var lineDeco = /* @__PURE__ */ Decoration.line({ class: "cm-activeLine" });
  var activeLineHighlighter = /* @__PURE__ */ ViewPlugin.fromClass(class {
    constructor(view2) {
      this.decorations = this.getDeco(view2);
    }
    update(update) {
      if (update.docChanged || update.selectionSet)
        this.decorations = this.getDeco(update.view);
    }
    getDeco(view2) {
      let lastLineStart = -1, deco = [];
      for (let r of view2.state.selection.ranges) {
        let line = view2.lineBlockAt(r.head);
        if (line.from > lastLineStart) {
          deco.push(lineDeco.range(line.from));
          lastLineStart = line.from;
        }
      }
      return Decoration.set(deco);
    }
  }, {
    decorations: (v) => v.decorations
  });
  var Placeholder = class extends WidgetType {
    constructor(content2) {
      super();
      this.content = content2;
    }
    toDOM(view2) {
      let wrap = document.createElement("span");
      wrap.className = "cm-placeholder";
      wrap.style.pointerEvents = "none";
      wrap.appendChild(typeof this.content == "string" ? document.createTextNode(this.content) : typeof this.content == "function" ? this.content(view2) : this.content.cloneNode(true));
      wrap.setAttribute("aria-hidden", "true");
      return wrap;
    }
    coordsAt(dom) {
      let rects = dom.firstChild ? clientRectsFor(dom.firstChild) : [];
      if (!rects.length)
        return null;
      let style = window.getComputedStyle(dom.parentNode);
      let rect = flattenRect(rects[0], style.direction != "rtl");
      let lineHeight = parseInt(style.lineHeight);
      if (rect.bottom - rect.top > lineHeight * 1.5)
        return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.top + lineHeight };
      return rect;
    }
    ignoreEvent() {
      return false;
    }
  };
  function placeholder(content2) {
    let plugin = ViewPlugin.fromClass(class {
      constructor(view2) {
        this.view = view2;
        this.placeholder = content2 ? Decoration.set([Decoration.widget({ widget: new Placeholder(content2), side: 1 }).range(0)]) : Decoration.none;
      }
      get decorations() {
        return this.view.state.doc.length ? Decoration.none : this.placeholder;
      }
    }, { decorations: (v) => v.decorations });
    return typeof content2 == "string" ? [
      plugin,
      EditorView.contentAttributes.of({ "aria-placeholder": content2 })
    ] : plugin;
  }
  var Outside = "-10000px";
  var TooltipViewManager = class {
    constructor(view2, facet, createTooltipView, removeTooltipView) {
      this.facet = facet;
      this.createTooltipView = createTooltipView;
      this.removeTooltipView = removeTooltipView;
      this.input = view2.state.facet(facet);
      this.tooltips = this.input.filter((t2) => t2);
      let prev = null;
      this.tooltipViews = this.tooltips.map((t2) => prev = createTooltipView(t2, prev));
    }
    update(update, above) {
      var _a2;
      let input = update.state.facet(this.facet);
      let tooltips = input.filter((x) => x);
      if (input === this.input) {
        for (let t2 of this.tooltipViews)
          if (t2.update)
            t2.update(update);
        return false;
      }
      let tooltipViews = [], newAbove = above ? [] : null;
      for (let i2 = 0; i2 < tooltips.length; i2++) {
        let tip = tooltips[i2], known = -1;
        if (!tip)
          continue;
        for (let i3 = 0; i3 < this.tooltips.length; i3++) {
          let other = this.tooltips[i3];
          if (other && other.create == tip.create)
            known = i3;
        }
        if (known < 0) {
          tooltipViews[i2] = this.createTooltipView(tip, i2 ? tooltipViews[i2 - 1] : null);
          if (newAbove)
            newAbove[i2] = !!tip.above;
        } else {
          let tooltipView = tooltipViews[i2] = this.tooltipViews[known];
          if (newAbove)
            newAbove[i2] = above[known];
          if (tooltipView.update)
            tooltipView.update(update);
        }
      }
      for (let t2 of this.tooltipViews)
        if (tooltipViews.indexOf(t2) < 0) {
          this.removeTooltipView(t2);
          (_a2 = t2.destroy) === null || _a2 === void 0 ? void 0 : _a2.call(t2);
        }
      if (above) {
        newAbove.forEach((val, i2) => above[i2] = val);
        above.length = newAbove.length;
      }
      this.input = input;
      this.tooltips = tooltips;
      this.tooltipViews = tooltipViews;
      return true;
    }
  };
  function fixedRange(view2) {
    let docElt = view2.dom.ownerDocument.documentElement, width = docElt.clientWidth;
    let style = getComputedStyle(docElt);
    if (!/stable/.test(style.scrollbarGutter || ""))
      return { left: 0, right: width };
    let rect = docElt.getBoundingClientRect(), scrollX = view2.win.scrollX;
    return {
      left: Math.max(0, rect.left + scrollX - parseFloat(style.marginLeft)),
      right: Math.min(width, rect.right + scrollX + parseFloat(style.marginRight))
    };
  }
  function windowSpace(view2) {
    let { left, right } = fixedRange(view2);
    return { top: 0, left, right, bottom: view2.dom.ownerDocument.documentElement.clientHeight };
  }
  var tooltipConfig = /* @__PURE__ */ Facet.define({
    combine: (values) => {
      var _a2, _b, _c;
      return {
        position: browser.ios ? "absolute" : ((_a2 = values.find((conf) => conf.position)) === null || _a2 === void 0 ? void 0 : _a2.position) || "fixed",
        parent: ((_b = values.find((conf) => conf.parent)) === null || _b === void 0 ? void 0 : _b.parent) || null,
        tooltipSpace: ((_c = values.find((conf) => conf.tooltipSpace)) === null || _c === void 0 ? void 0 : _c.tooltipSpace) || windowSpace
      };
    }
  });
  var knownHeight = /* @__PURE__ */ new WeakMap();
  var tooltipPlugin = /* @__PURE__ */ ViewPlugin.fromClass(class {
    constructor(view2) {
      this.view = view2;
      this.above = [];
      this.inView = true;
      this.madeAbsolute = false;
      this.lastTransaction = 0;
      this.measureTimeout = -1;
      let config = view2.state.facet(tooltipConfig);
      this.position = config.position;
      this.parent = config.parent;
      this.classes = view2.themeClasses;
      this.createContainer();
      this.measureReq = { read: this.readMeasure.bind(this), write: this.writeMeasure.bind(this), key: this };
      this.resizeObserver = typeof ResizeObserver == "function" ? new ResizeObserver(() => this.measureSoon()) : null;
      this.manager = new TooltipViewManager(view2, showTooltip, (t2, p) => this.createTooltip(t2, p), (t2) => {
        if (this.resizeObserver)
          this.resizeObserver.unobserve(t2.dom);
        t2.dom.remove();
      });
      this.above = this.manager.tooltips.map((t2) => !!t2.above);
      this.intersectionObserver = typeof IntersectionObserver == "function" ? new IntersectionObserver((entries) => {
        if (Date.now() > this.lastTransaction - 50 && entries.length > 0 && entries[entries.length - 1].intersectionRatio < 1)
          this.measureSoon();
      }, { threshold: [1] }) : null;
      this.observeIntersection();
      view2.win.addEventListener("resize", this.measureSoon = this.measureSoon.bind(this));
      this.maybeMeasure();
    }
    createContainer() {
      if (this.parent) {
        this.container = document.createElement("div");
        this.container.style.position = "relative";
        this.container.className = this.view.themeClasses;
        this.parent.appendChild(this.container);
      } else {
        this.container = this.view.dom;
      }
    }
    observeIntersection() {
      if (this.intersectionObserver) {
        this.intersectionObserver.disconnect();
        for (let tooltip of this.manager.tooltipViews)
          this.intersectionObserver.observe(tooltip.dom);
      }
    }
    measureSoon() {
      if (this.measureTimeout < 0)
        this.measureTimeout = setTimeout(() => {
          this.measureTimeout = -1;
          this.maybeMeasure();
        }, 50);
    }
    update(update) {
      if (update.transactions.length)
        this.lastTransaction = Date.now();
      let updated = this.manager.update(update, this.above);
      if (updated)
        this.observeIntersection();
      let shouldMeasure = updated || update.geometryChanged;
      let newConfig = update.state.facet(tooltipConfig);
      if (newConfig.position != this.position && !this.madeAbsolute) {
        this.position = newConfig.position;
        for (let t2 of this.manager.tooltipViews)
          t2.dom.style.position = this.position;
        shouldMeasure = true;
      }
      if (newConfig.parent != this.parent) {
        if (this.parent)
          this.container.remove();
        this.parent = newConfig.parent;
        this.createContainer();
        for (let t2 of this.manager.tooltipViews)
          this.container.appendChild(t2.dom);
        shouldMeasure = true;
      } else if (this.parent && this.view.themeClasses != this.classes) {
        this.classes = this.container.className = this.view.themeClasses;
      }
      if (shouldMeasure)
        this.maybeMeasure();
    }
    createTooltip(tooltip, prev) {
      let tooltipView = tooltip.create(this.view);
      let before = prev ? prev.dom : null;
      tooltipView.dom.classList.add("cm-tooltip");
      if (tooltip.arrow && !tooltipView.dom.querySelector(".cm-tooltip > .cm-tooltip-arrow")) {
        let arrow = document.createElement("div");
        arrow.className = "cm-tooltip-arrow";
        tooltipView.dom.appendChild(arrow);
      }
      tooltipView.dom.style.position = this.position;
      tooltipView.dom.style.top = Outside;
      tooltipView.dom.style.left = "0px";
      this.container.insertBefore(tooltipView.dom, before);
      if (tooltipView.mount)
        tooltipView.mount(this.view);
      if (this.resizeObserver)
        this.resizeObserver.observe(tooltipView.dom);
      return tooltipView;
    }
    destroy() {
      var _a2, _b, _c;
      this.view.win.removeEventListener("resize", this.measureSoon);
      for (let tooltipView of this.manager.tooltipViews) {
        tooltipView.dom.remove();
        (_a2 = tooltipView.destroy) === null || _a2 === void 0 ? void 0 : _a2.call(tooltipView);
      }
      if (this.parent)
        this.container.remove();
      (_b = this.resizeObserver) === null || _b === void 0 ? void 0 : _b.disconnect();
      (_c = this.intersectionObserver) === null || _c === void 0 ? void 0 : _c.disconnect();
      clearTimeout(this.measureTimeout);
    }
    readMeasure() {
      let scaleX = 1, scaleY = 1, makeAbsolute = false, fixedLeft = 0;
      if (this.position == "fixed" && this.manager.tooltipViews.length) {
        let { dom } = this.manager.tooltipViews[0];
        if (browser.safari) {
          let rect = dom.getBoundingClientRect();
          makeAbsolute = Math.abs(rect.top + 1e4) > 1 || Math.abs(rect.left) > 1;
        } else {
          makeAbsolute = !!dom.offsetParent && dom.offsetParent != this.container.ownerDocument.body;
        }
      }
      if (makeAbsolute || this.position == "absolute") {
        if (this.parent) {
          let rect = this.parent.getBoundingClientRect();
          if (rect.width && rect.height) {
            scaleX = rect.width / this.parent.offsetWidth;
            scaleY = rect.height / this.parent.offsetHeight;
          }
        } else {
          ({ scaleX, scaleY } = this.view.viewState);
        }
      } else {
        fixedLeft = fixedRange(this.view).left;
      }
      let visible = this.view.scrollDOM.getBoundingClientRect(), margins = getScrollMargins(this.view);
      return {
        visible: {
          left: visible.left + margins.left,
          top: visible.top + margins.top,
          right: visible.right - margins.right,
          bottom: visible.bottom - margins.bottom
        },
        parent: this.parent ? this.container.getBoundingClientRect() : this.view.dom.getBoundingClientRect(),
        pos: this.manager.tooltips.map((t2, i2) => {
          let tv = this.manager.tooltipViews[i2];
          return tv.getCoords ? tv.getCoords(t2.pos) : this.view.coordsAtPos(t2.pos);
        }),
        size: this.manager.tooltipViews.map(({ dom }) => dom.getBoundingClientRect()),
        space: this.view.state.facet(tooltipConfig).tooltipSpace(this.view),
        scaleX,
        scaleY,
        makeAbsolute,
        fixedLeft
      };
    }
    writeMeasure(measured) {
      var _a2;
      if (measured.makeAbsolute) {
        this.madeAbsolute = true;
        this.position = "absolute";
        for (let t2 of this.manager.tooltipViews)
          t2.dom.style.position = "absolute";
      }
      let { visible, space, scaleX, scaleY } = measured;
      let others = [];
      for (let i2 = 0; i2 < this.manager.tooltips.length; i2++) {
        let tooltip = this.manager.tooltips[i2], tView = this.manager.tooltipViews[i2], { dom } = tView;
        let pos = measured.pos[i2], size = measured.size[i2];
        if (!pos || tooltip.clip !== false && (pos.bottom <= Math.max(visible.top, space.top) || pos.top >= Math.min(visible.bottom, space.bottom) || pos.right < Math.max(visible.left, space.left) - 0.1 || pos.left > Math.min(visible.right, space.right) + 0.1)) {
          dom.style.top = Outside;
          continue;
        }
        let arrow = tooltip.arrow ? tView.dom.querySelector(".cm-tooltip-arrow") : null;
        let arrowHeight = arrow ? 7 : 0;
        let width = size.right - size.left, height = (_a2 = knownHeight.get(tView)) !== null && _a2 !== void 0 ? _a2 : size.bottom - size.top;
        let offset = tView.offset || noOffset, ltr = this.view.textDirection == Direction.LTR;
        let left = size.width > space.right - space.left ? ltr ? space.left : space.right - size.width : ltr ? Math.max(space.left, Math.min(pos.left - (arrow ? 14 : 0) + offset.x, space.right - width)) : Math.min(Math.max(space.left, pos.left - width + (arrow ? 14 : 0) - offset.x), space.right - width);
        let above = this.above[i2];
        if (!tooltip.strictSide && (above ? pos.top - height - arrowHeight - offset.y < space.top : pos.bottom + height + arrowHeight + offset.y > space.bottom) && above == space.bottom - pos.bottom > pos.top - space.top)
          above = this.above[i2] = !above;
        let spaceVert = (above ? pos.top - space.top : space.bottom - pos.bottom) - arrowHeight;
        if (spaceVert < height && tView.resize !== false) {
          if (spaceVert < this.view.defaultLineHeight) {
            dom.style.top = Outside;
            continue;
          }
          knownHeight.set(tView, height);
          dom.style.height = (height = spaceVert) / scaleY + "px";
        } else if (dom.style.height) {
          dom.style.height = "";
        }
        let top2 = above ? pos.top - height - arrowHeight - offset.y : pos.bottom + arrowHeight + offset.y;
        let right = left + width;
        if (tView.overlap !== true) {
          for (let r of others)
            if (r.left < right && r.right > left && r.top < top2 + height && r.bottom > top2)
              top2 = above ? r.top - height - 2 - arrowHeight : r.bottom + arrowHeight + 2;
        }
        if (this.position == "absolute") {
          dom.style.top = (top2 - measured.parent.top) / scaleY + "px";
          setLeftStyle(dom, (left - measured.parent.left) / scaleX);
        } else {
          dom.style.top = top2 / scaleY + "px";
          setLeftStyle(dom, (left - measured.fixedLeft) / scaleX);
        }
        if (arrow) {
          let arrowLeft = pos.left + (ltr ? offset.x : -offset.x) - (left + 14 - 7);
          arrow.style.left = arrowLeft / scaleX + "px";
        }
        if (tView.overlap !== true)
          others.push({ left, top: top2, right, bottom: top2 + height });
        dom.classList.toggle("cm-tooltip-above", above);
        dom.classList.toggle("cm-tooltip-below", !above);
        if (tView.positioned)
          tView.positioned(measured.space);
      }
    }
    maybeMeasure() {
      if (this.manager.tooltips.length) {
        if (this.view.inView)
          this.view.requestMeasure(this.measureReq);
        if (this.inView != this.view.inView) {
          this.inView = this.view.inView;
          if (!this.inView)
            for (let tv of this.manager.tooltipViews)
              tv.dom.style.top = Outside;
        }
      }
    }
  }, {
    eventObservers: {
      scroll() {
        this.maybeMeasure();
      }
    }
  });
  function setLeftStyle(elt, value) {
    let current = parseInt(elt.style.left, 10);
    if (isNaN(current) || Math.abs(value - current) > 1)
      elt.style.left = value + "px";
  }
  var baseTheme = /* @__PURE__ */ EditorView.baseTheme({
    ".cm-tooltip": {
      zIndex: 500,
      boxSizing: "border-box"
    },
    "&light .cm-tooltip": {
      border: "1px solid #bbb",
      backgroundColor: "#f5f5f5"
    },
    "&light .cm-tooltip-section:not(:first-child)": {
      borderTop: "1px solid #bbb"
    },
    "&dark .cm-tooltip": {
      backgroundColor: "#333338",
      color: "white"
    },
    ".cm-tooltip-arrow": {
      height: `${7}px`,
      width: `${7 * 2}px`,
      position: "absolute",
      zIndex: -1,
      overflow: "hidden",
      "&:before, &:after": {
        content: "''",
        position: "absolute",
        width: 0,
        height: 0,
        borderLeft: `${7}px solid transparent`,
        borderRight: `${7}px solid transparent`
      },
      ".cm-tooltip-above &": {
        bottom: `-${7}px`,
        "&:before": {
          borderTop: `${7}px solid #bbb`
        },
        "&:after": {
          borderTop: `${7}px solid #f5f5f5`,
          bottom: "1px"
        }
      },
      ".cm-tooltip-below &": {
        top: `-${7}px`,
        "&:before": {
          borderBottom: `${7}px solid #bbb`
        },
        "&:after": {
          borderBottom: `${7}px solid #f5f5f5`,
          top: "1px"
        }
      }
    },
    "&dark .cm-tooltip .cm-tooltip-arrow": {
      "&:before": {
        borderTopColor: "#333338",
        borderBottomColor: "#333338"
      },
      "&:after": {
        borderTopColor: "transparent",
        borderBottomColor: "transparent"
      }
    }
  });
  var noOffset = { x: 0, y: 0 };
  var showTooltip = /* @__PURE__ */ Facet.define({
    enables: [tooltipPlugin, baseTheme]
  });
  function getTooltip(view2, tooltip) {
    let plugin = view2.plugin(tooltipPlugin);
    if (!plugin)
      return null;
    let found = plugin.manager.tooltips.indexOf(tooltip);
    return found < 0 ? null : plugin.manager.tooltipViews[found];
  }
  var GutterMarker = class extends RangeValue {
    /**
    @internal
    */
    compare(other) {
      return this == other || this.constructor == other.constructor && this.eq(other);
    }
    /**
    Compare this marker to another marker of the same type.
    */
    eq(other) {
      return false;
    }
    /**
    Called if the marker has a `toDOM` method and its representation
    was removed from a gutter.
    */
    destroy(dom) {
    }
  };
  GutterMarker.prototype.elementClass = "";
  GutterMarker.prototype.toDOM = void 0;
  GutterMarker.prototype.mapMode = MapMode.TrackBefore;
  GutterMarker.prototype.startSide = GutterMarker.prototype.endSide = -1;
  GutterMarker.prototype.point = true;
  var gutterLineClass = /* @__PURE__ */ Facet.define();
  var gutterWidgetClass = /* @__PURE__ */ Facet.define();
  var activeGutters = /* @__PURE__ */ Facet.define();
  var unfixGutters = /* @__PURE__ */ Facet.define({
    combine: (values) => values.some((x) => x)
  });
  function gutters(config) {
    let result = [
      gutterView
    ];
    if (config && config.fixed === false)
      result.push(unfixGutters.of(true));
    return result;
  }
  var gutterView = /* @__PURE__ */ ViewPlugin.fromClass(class {
    constructor(view2) {
      this.view = view2;
      this.domAfter = null;
      this.prevViewport = view2.viewport;
      this.dom = document.createElement("div");
      this.dom.className = "cm-gutters cm-gutters-before";
      this.dom.setAttribute("aria-hidden", "true");
      this.dom.style.minHeight = this.view.contentHeight / this.view.scaleY + "px";
      this.gutters = view2.state.facet(activeGutters).map((conf) => new SingleGutterView(view2, conf));
      this.fixed = !view2.state.facet(unfixGutters);
      for (let gutter2 of this.gutters) {
        if (gutter2.config.side == "after")
          this.getDOMAfter().appendChild(gutter2.dom);
        else
          this.dom.appendChild(gutter2.dom);
      }
      if (this.fixed) {
        this.dom.style.position = "sticky";
      }
      this.syncGutters(false);
      view2.scrollDOM.insertBefore(this.dom, view2.contentDOM);
    }
    getDOMAfter() {
      if (!this.domAfter) {
        this.domAfter = document.createElement("div");
        this.domAfter.className = "cm-gutters cm-gutters-after";
        this.domAfter.setAttribute("aria-hidden", "true");
        this.domAfter.style.minHeight = this.view.contentHeight / this.view.scaleY + "px";
        this.domAfter.style.position = this.fixed ? "sticky" : "";
        this.view.scrollDOM.appendChild(this.domAfter);
      }
      return this.domAfter;
    }
    update(update) {
      if (this.updateGutters(update)) {
        let vpA = this.prevViewport, vpB = update.view.viewport;
        let vpOverlap = Math.min(vpA.to, vpB.to) - Math.max(vpA.from, vpB.from);
        this.syncGutters(vpOverlap < (vpB.to - vpB.from) * 0.8);
      }
      if (update.geometryChanged) {
        let min = this.view.contentHeight / this.view.scaleY + "px";
        this.dom.style.minHeight = min;
        if (this.domAfter)
          this.domAfter.style.minHeight = min;
      }
      if (this.view.state.facet(unfixGutters) != !this.fixed) {
        this.fixed = !this.fixed;
        this.dom.style.position = this.fixed ? "sticky" : "";
        if (this.domAfter)
          this.domAfter.style.position = this.fixed ? "sticky" : "";
      }
      this.prevViewport = update.view.viewport;
    }
    syncGutters(detach) {
      let after = this.dom.nextSibling;
      if (detach) {
        this.dom.remove();
        if (this.domAfter)
          this.domAfter.remove();
      }
      let lineClasses = RangeSet.iter(this.view.state.facet(gutterLineClass), this.view.viewport.from);
      let classSet = [];
      let contexts = this.gutters.map((gutter2) => new UpdateContext(gutter2, this.view.viewport, -this.view.documentPadding.top));
      for (let line of this.view.viewportLineBlocks) {
        if (classSet.length)
          classSet = [];
        if (Array.isArray(line.type)) {
          let first = true;
          for (let b of line.type) {
            if (b.type == BlockType.Text && first) {
              advanceCursor(lineClasses, classSet, b.from);
              for (let cx of contexts)
                cx.line(this.view, b, classSet);
              first = false;
            } else if (b.widget) {
              for (let cx of contexts)
                cx.widget(this.view, b);
            }
          }
        } else if (line.type == BlockType.Text) {
          advanceCursor(lineClasses, classSet, line.from);
          for (let cx of contexts)
            cx.line(this.view, line, classSet);
        } else if (line.widget) {
          for (let cx of contexts)
            cx.widget(this.view, line);
        }
      }
      for (let cx of contexts)
        cx.finish();
      if (detach) {
        this.view.scrollDOM.insertBefore(this.dom, after);
        if (this.domAfter)
          this.view.scrollDOM.appendChild(this.domAfter);
      }
    }
    updateGutters(update) {
      let prev = update.startState.facet(activeGutters), cur2 = update.state.facet(activeGutters);
      let change = update.docChanged || update.heightChanged || update.viewportChanged || !RangeSet.eq(update.startState.facet(gutterLineClass), update.state.facet(gutterLineClass), update.view.viewport.from, update.view.viewport.to);
      if (prev == cur2) {
        for (let gutter2 of this.gutters)
          if (gutter2.update(update))
            change = true;
      } else {
        change = true;
        let gutters2 = [];
        for (let conf of cur2) {
          let known = prev.indexOf(conf);
          if (known < 0) {
            gutters2.push(new SingleGutterView(this.view, conf));
          } else {
            this.gutters[known].update(update);
            gutters2.push(this.gutters[known]);
          }
        }
        for (let g of this.gutters) {
          g.dom.remove();
          if (gutters2.indexOf(g) < 0)
            g.destroy();
        }
        for (let g of gutters2) {
          if (g.config.side == "after")
            this.getDOMAfter().appendChild(g.dom);
          else
            this.dom.appendChild(g.dom);
        }
        this.gutters = gutters2;
      }
      return change;
    }
    destroy() {
      for (let view2 of this.gutters)
        view2.destroy();
      this.dom.remove();
      if (this.domAfter)
        this.domAfter.remove();
    }
  }, {
    provide: (plugin) => EditorView.scrollMargins.of((view2) => {
      let value = view2.plugin(plugin);
      if (!value || value.gutters.length == 0 || !value.fixed)
        return null;
      let before = value.dom.offsetWidth * view2.scaleX, after = value.domAfter ? value.domAfter.offsetWidth * view2.scaleX : 0;
      return view2.textDirection == Direction.LTR ? { left: before, right: after } : { right: before, left: after };
    })
  });
  function asArray2(val) {
    return Array.isArray(val) ? val : [val];
  }
  function advanceCursor(cursor, collect, pos) {
    while (cursor.value && cursor.from <= pos) {
      if (cursor.from == pos)
        collect.push(cursor.value);
      cursor.next();
    }
  }
  var UpdateContext = class {
    constructor(gutter2, viewport, height) {
      this.gutter = gutter2;
      this.height = height;
      this.i = 0;
      this.cursor = RangeSet.iter(gutter2.markers, viewport.from);
    }
    addElement(view2, block, markers) {
      let { gutter: gutter2 } = this, above = (block.top - this.height) / view2.scaleY, height = block.height / view2.scaleY;
      if (this.i == gutter2.elements.length) {
        let newElt = new GutterElement(view2, height, above, markers);
        gutter2.elements.push(newElt);
        gutter2.dom.appendChild(newElt.dom);
      } else {
        gutter2.elements[this.i].update(view2, height, above, markers);
      }
      this.height = block.bottom;
      this.i++;
    }
    line(view2, line, extraMarkers) {
      let localMarkers = [];
      advanceCursor(this.cursor, localMarkers, line.from);
      if (extraMarkers.length)
        localMarkers = localMarkers.concat(extraMarkers);
      let forLine = this.gutter.config.lineMarker(view2, line, localMarkers);
      if (forLine)
        localMarkers.unshift(forLine);
      let gutter2 = this.gutter;
      if (localMarkers.length == 0 && !gutter2.config.renderEmptyElements)
        return;
      this.addElement(view2, line, localMarkers);
    }
    widget(view2, block) {
      let marker = this.gutter.config.widgetMarker(view2, block.widget, block), markers = marker ? [marker] : null;
      for (let cls of view2.state.facet(gutterWidgetClass)) {
        let marker2 = cls(view2, block.widget, block);
        if (marker2)
          (markers || (markers = [])).push(marker2);
      }
      if (markers)
        this.addElement(view2, block, markers);
    }
    finish() {
      let gutter2 = this.gutter;
      while (gutter2.elements.length > this.i) {
        let last2 = gutter2.elements.pop();
        gutter2.dom.removeChild(last2.dom);
        last2.destroy();
      }
    }
  };
  var SingleGutterView = class {
    constructor(view2, config) {
      this.view = view2;
      this.config = config;
      this.elements = [];
      this.spacer = null;
      this.dom = document.createElement("div");
      this.dom.className = "cm-gutter" + (this.config.class ? " " + this.config.class : "");
      for (let prop in config.domEventHandlers) {
        this.dom.addEventListener(prop, (event) => {
          let target = event.target, y;
          if (target != this.dom && this.dom.contains(target)) {
            while (target.parentNode != this.dom)
              target = target.parentNode;
            let rect = target.getBoundingClientRect();
            y = (rect.top + rect.bottom) / 2;
          } else {
            y = event.clientY;
          }
          let line = view2.lineBlockAtHeight(y - view2.documentTop);
          if (config.domEventHandlers[prop](view2, line, event))
            event.preventDefault();
        });
      }
      this.markers = asArray2(config.markers(view2));
      if (config.initialSpacer) {
        this.spacer = new GutterElement(view2, 0, 0, [config.initialSpacer(view2)]);
        this.dom.appendChild(this.spacer.dom);
        this.spacer.dom.style.cssText += "visibility: hidden; pointer-events: none";
      }
    }
    update(update) {
      let prevMarkers = this.markers;
      this.markers = asArray2(this.config.markers(update.view));
      if (this.spacer && this.config.updateSpacer) {
        let updated = this.config.updateSpacer(this.spacer.markers[0], update);
        if (updated != this.spacer.markers[0])
          this.spacer.update(update.view, 0, 0, [updated]);
      }
      let vp = update.view.viewport;
      return !RangeSet.eq(this.markers, prevMarkers, vp.from, vp.to) || (this.config.lineMarkerChange ? this.config.lineMarkerChange(update) : false);
    }
    destroy() {
      for (let elt of this.elements)
        elt.destroy();
    }
  };
  var GutterElement = class {
    constructor(view2, height, above, markers) {
      this.height = -1;
      this.above = 0;
      this.markers = [];
      this.dom = document.createElement("div");
      this.dom.className = "cm-gutterElement";
      this.update(view2, height, above, markers);
    }
    update(view2, height, above, markers) {
      if (this.height != height) {
        this.height = height;
        this.dom.style.height = height + "px";
      }
      if (this.above != above)
        this.dom.style.marginTop = (this.above = above) ? above + "px" : "";
      if (!sameMarkers(this.markers, markers))
        this.setMarkers(view2, markers);
    }
    setMarkers(view2, markers) {
      let cls = "cm-gutterElement", domPos = this.dom.firstChild;
      for (let iNew = 0, iOld = 0; ; ) {
        let skipTo = iOld, marker = iNew < markers.length ? markers[iNew++] : null, matched = false;
        if (marker) {
          let c = marker.elementClass;
          if (c)
            cls += " " + c;
          for (let i2 = iOld; i2 < this.markers.length; i2++)
            if (this.markers[i2].compare(marker)) {
              skipTo = i2;
              matched = true;
              break;
            }
        } else {
          skipTo = this.markers.length;
        }
        while (iOld < skipTo) {
          let next = this.markers[iOld++];
          if (next.toDOM) {
            next.destroy(domPos);
            let after = domPos.nextSibling;
            domPos.remove();
            domPos = after;
          }
        }
        if (!marker)
          break;
        if (marker.toDOM) {
          if (matched)
            domPos = domPos.nextSibling;
          else
            this.dom.insertBefore(marker.toDOM(view2), domPos);
        }
        if (matched)
          iOld++;
      }
      this.dom.className = cls;
      this.markers = markers;
    }
    destroy() {
      this.setMarkers(null, []);
    }
  };
  function sameMarkers(a, b) {
    if (a.length != b.length)
      return false;
    for (let i2 = 0; i2 < a.length; i2++)
      if (!a[i2].compare(b[i2]))
        return false;
    return true;
  }
  var lineNumberMarkers = /* @__PURE__ */ Facet.define();
  var lineNumberWidgetMarker = /* @__PURE__ */ Facet.define();
  var lineNumberConfig = /* @__PURE__ */ Facet.define({
    combine(values) {
      return combineConfig(values, { formatNumber: String, domEventHandlers: {} }, {
        domEventHandlers(a, b) {
          let result = Object.assign({}, a);
          for (let event in b) {
            let exists = result[event], add = b[event];
            result[event] = exists ? (view2, line, event2) => exists(view2, line, event2) || add(view2, line, event2) : add;
          }
          return result;
        }
      });
    }
  });
  var NumberMarker = class extends GutterMarker {
    constructor(number2) {
      super();
      this.number = number2;
    }
    eq(other) {
      return this.number == other.number;
    }
    toDOM() {
      return document.createTextNode(this.number);
    }
  };
  function formatNumber(view2, number2) {
    return view2.state.facet(lineNumberConfig).formatNumber(number2, view2.state);
  }
  var lineNumberGutter = /* @__PURE__ */ activeGutters.compute([lineNumberConfig], (state) => ({
    class: "cm-lineNumbers",
    renderEmptyElements: false,
    markers(view2) {
      return view2.state.facet(lineNumberMarkers);
    },
    lineMarker(view2, line, others) {
      if (others.some((m) => m.toDOM))
        return null;
      return new NumberMarker(formatNumber(view2, view2.state.doc.lineAt(line.from).number));
    },
    widgetMarker: (view2, widget, block) => {
      for (let m of view2.state.facet(lineNumberWidgetMarker)) {
        let result = m(view2, widget, block);
        if (result)
          return result;
      }
      return null;
    },
    lineMarkerChange: (update) => update.startState.facet(lineNumberConfig) != update.state.facet(lineNumberConfig),
    initialSpacer(view2) {
      return new NumberMarker(formatNumber(view2, maxLineNumber(view2.state.doc.lines)));
    },
    updateSpacer(spacer, update) {
      let max = formatNumber(update.view, maxLineNumber(update.view.state.doc.lines));
      return max == spacer.number ? spacer : new NumberMarker(max);
    },
    domEventHandlers: state.facet(lineNumberConfig).domEventHandlers,
    side: "before"
  }));
  function lineNumbers(config = {}) {
    return [
      lineNumberConfig.of(config),
      gutters(),
      lineNumberGutter
    ];
  }
  function maxLineNumber(lines) {
    let last2 = 9;
    while (last2 < lines)
      last2 = last2 * 10 + 9;
    return last2;
  }
  var activeLineGutterMarker = /* @__PURE__ */ new class extends GutterMarker {
    constructor() {
      super(...arguments);
      this.elementClass = "cm-activeLineGutter";
    }
  }();
  var activeLineGutterHighlighter = /* @__PURE__ */ gutterLineClass.compute(["selection"], (state) => {
    let marks2 = [], last2 = -1;
    for (let range of state.selection.ranges) {
      let linePos = state.doc.lineAt(range.head).from;
      if (linePos > last2) {
        last2 = linePos;
        marks2.push(activeLineGutterMarker.range(linePos));
      }
    }
    return RangeSet.of(marks2);
  });
  function highlightActiveLineGutter() {
    return activeLineGutterHighlighter;
  }

  // node_modules/@lezer/common/dist/index.js
  var DefaultBufferLength = 1024;
  var nextPropID = 0;
  var Range2 = class {
    constructor(from, to) {
      this.from = from;
      this.to = to;
    }
  };
  var NodeProp = class {
    /**
    Create a new node prop type.
    */
    constructor(config = {}) {
      this.id = nextPropID++;
      this.perNode = !!config.perNode;
      this.deserialize = config.deserialize || (() => {
        throw new Error("This node type doesn't define a deserialize function");
      });
      this.combine = config.combine || null;
    }
    /**
    This is meant to be used with
    [`NodeSet.extend`](#common.NodeSet.extend) or
    [`LRParser.configure`](#lr.ParserConfig.props) to compute
    prop values for each node type in the set. Takes a [match
    object](#common.NodeType^match) or function that returns undefined
    if the node type doesn't get this prop, and the prop's value if
    it does.
    */
    add(match) {
      if (this.perNode)
        throw new RangeError("Can't add per-node props to node types");
      if (typeof match != "function")
        match = NodeType.match(match);
      return (type) => {
        let result = match(type);
        return result === void 0 ? null : [this, result];
      };
    }
  };
  NodeProp.closedBy = new NodeProp({ deserialize: (str) => str.split(" ") });
  NodeProp.openedBy = new NodeProp({ deserialize: (str) => str.split(" ") });
  NodeProp.group = new NodeProp({ deserialize: (str) => str.split(" ") });
  NodeProp.isolate = new NodeProp({ deserialize: (value) => {
    if (value && value != "rtl" && value != "ltr" && value != "auto")
      throw new RangeError("Invalid value for isolate: " + value);
    return value || "auto";
  } });
  NodeProp.contextHash = new NodeProp({ perNode: true });
  NodeProp.lookAhead = new NodeProp({ perNode: true });
  NodeProp.mounted = new NodeProp({ perNode: true });
  var MountedTree = class {
    constructor(tree, overlay, parser2, bracketed = false) {
      this.tree = tree;
      this.overlay = overlay;
      this.parser = parser2;
      this.bracketed = bracketed;
    }
    /**
    @internal
    */
    static get(tree) {
      return tree && tree.props && tree.props[NodeProp.mounted.id];
    }
  };
  var noProps = /* @__PURE__ */ Object.create(null);
  var NodeType = class _NodeType {
    /**
    @internal
    */
    constructor(name2, props, id, flags = 0) {
      this.name = name2;
      this.props = props;
      this.id = id;
      this.flags = flags;
    }
    /**
    Define a node type.
    */
    static define(spec) {
      let props = spec.props && spec.props.length ? /* @__PURE__ */ Object.create(null) : noProps;
      let flags = (spec.top ? 1 : 0) | (spec.skipped ? 2 : 0) | (spec.error ? 4 : 0) | (spec.name == null ? 8 : 0);
      let type = new _NodeType(spec.name || "", props, spec.id, flags);
      if (spec.props)
        for (let src of spec.props) {
          if (!Array.isArray(src))
            src = src(type);
          if (src) {
            if (src[0].perNode)
              throw new RangeError("Can't store a per-node prop on a node type");
            props[src[0].id] = src[1];
          }
        }
      return type;
    }
    /**
    Retrieves a node prop for this type. Will return `undefined` if
    the prop isn't present on this node.
    */
    prop(prop) {
      return this.props[prop.id];
    }
    /**
    True when this is the top node of a grammar.
    */
    get isTop() {
      return (this.flags & 1) > 0;
    }
    /**
    True when this node is produced by a skip rule.
    */
    get isSkipped() {
      return (this.flags & 2) > 0;
    }
    /**
    Indicates whether this is an error node.
    */
    get isError() {
      return (this.flags & 4) > 0;
    }
    /**
    When true, this node type doesn't correspond to a user-declared
    named node, for example because it is used to cache repetition.
    */
    get isAnonymous() {
      return (this.flags & 8) > 0;
    }
    /**
    Returns true when this node's name or one of its
    [groups](#common.NodeProp^group) matches the given string.
    */
    is(name2) {
      if (typeof name2 == "string") {
        if (this.name == name2)
          return true;
        let group = this.prop(NodeProp.group);
        return group ? group.indexOf(name2) > -1 : false;
      }
      return this.id == name2;
    }
    /**
    Create a function from node types to arbitrary values by
    specifying an object whose property names are node or
    [group](#common.NodeProp^group) names. Often useful with
    [`NodeProp.add`](#common.NodeProp.add). You can put multiple
    names, separated by spaces, in a single property name to map
    multiple node names to a single value.
    */
    static match(map) {
      let direct = /* @__PURE__ */ Object.create(null);
      for (let prop in map)
        for (let name2 of prop.split(" "))
          direct[name2] = map[prop];
      return (node) => {
        for (let groups = node.prop(NodeProp.group), i2 = -1; i2 < (groups ? groups.length : 0); i2++) {
          let found = direct[i2 < 0 ? node.name : groups[i2]];
          if (found)
            return found;
        }
      };
    }
  };
  NodeType.none = new NodeType(
    "",
    /* @__PURE__ */ Object.create(null),
    0,
    8
    /* NodeFlag.Anonymous */
  );
  var NodeSet = class _NodeSet {
    /**
    Create a set with the given types. The `id` property of each
    type should correspond to its position within the array.
    */
    constructor(types2) {
      this.types = types2;
      for (let i2 = 0; i2 < types2.length; i2++)
        if (types2[i2].id != i2)
          throw new RangeError("Node type ids should correspond to array positions when creating a node set");
    }
    /**
    Create a copy of this set with some node properties added. The
    arguments to this method can be created with
    [`NodeProp.add`](#common.NodeProp.add).
    */
    extend(...props) {
      let newTypes = [];
      for (let type of this.types) {
        let newProps = null;
        for (let source of props) {
          let add = source(type);
          if (add) {
            if (!newProps)
              newProps = Object.assign({}, type.props);
            let value = add[1], prop = add[0];
            if (prop.combine && prop.id in newProps)
              value = prop.combine(newProps[prop.id], value);
            newProps[prop.id] = value;
          }
        }
        newTypes.push(newProps ? new NodeType(type.name, newProps, type.id, type.flags) : type);
      }
      return new _NodeSet(newTypes);
    }
  };
  var CachedNode = /* @__PURE__ */ new WeakMap();
  var CachedInnerNode = /* @__PURE__ */ new WeakMap();
  var IterMode;
  (function(IterMode2) {
    IterMode2[IterMode2["ExcludeBuffers"] = 1] = "ExcludeBuffers";
    IterMode2[IterMode2["IncludeAnonymous"] = 2] = "IncludeAnonymous";
    IterMode2[IterMode2["IgnoreMounts"] = 4] = "IgnoreMounts";
    IterMode2[IterMode2["IgnoreOverlays"] = 8] = "IgnoreOverlays";
    IterMode2[IterMode2["EnterBracketed"] = 16] = "EnterBracketed";
  })(IterMode || (IterMode = {}));
  var Tree = class _Tree {
    /**
    Construct a new tree. See also [`Tree.build`](#common.Tree^build).
    */
    constructor(type, children, positions, length, props) {
      this.type = type;
      this.children = children;
      this.positions = positions;
      this.length = length;
      this.props = null;
      if (props && props.length) {
        this.props = /* @__PURE__ */ Object.create(null);
        for (let [prop, value] of props)
          this.props[typeof prop == "number" ? prop : prop.id] = value;
      }
    }
    /**
    @internal
    */
    toString() {
      let mounted = MountedTree.get(this);
      if (mounted && !mounted.overlay)
        return mounted.tree.toString();
      let children = "";
      for (let ch of this.children) {
        let str = ch.toString();
        if (str) {
          if (children)
            children += ",";
          children += str;
        }
      }
      return !this.type.name ? children : (/\W/.test(this.type.name) && !this.type.isError ? JSON.stringify(this.type.name) : this.type.name) + (children.length ? "(" + children + ")" : "");
    }
    /**
    Get a [tree cursor](#common.TreeCursor) positioned at the top of
    the tree. Mode can be used to [control](#common.IterMode) which
    nodes the cursor visits.
    */
    cursor(mode = 0) {
      return new TreeCursor(this.topNode, mode);
    }
    /**
    Get a [tree cursor](#common.TreeCursor) pointing into this tree
    at the given position and side (see
    [`moveTo`](#common.TreeCursor.moveTo).
    */
    cursorAt(pos, side = 0, mode = 0) {
      let scope = CachedNode.get(this) || this.topNode;
      let cursor = new TreeCursor(scope);
      cursor.moveTo(pos, side);
      CachedNode.set(this, cursor._tree);
      return cursor;
    }
    /**
    Get a [syntax node](#common.SyntaxNode) object for the top of the
    tree.
    */
    get topNode() {
      return new TreeNode(this, 0, 0, null);
    }
    /**
    Get the [syntax node](#common.SyntaxNode) at the given position.
    If `side` is -1, this will move into nodes that end at the
    position. If 1, it'll move into nodes that start at the
    position. With 0, it'll only enter nodes that cover the position
    from both sides.
    
    Note that this will not enter
    [overlays](#common.MountedTree.overlay), and you often want
    [`resolveInner`](#common.Tree.resolveInner) instead.
    */
    resolve(pos, side = 0) {
      let node = resolveNode(CachedNode.get(this) || this.topNode, pos, side, false);
      CachedNode.set(this, node);
      return node;
    }
    /**
    Like [`resolve`](#common.Tree.resolve), but will enter
    [overlaid](#common.MountedTree.overlay) nodes, producing a syntax node
    pointing into the innermost overlaid tree at the given position
    (with parent links going through all parent structure, including
    the host trees).
    */
    resolveInner(pos, side = 0) {
      let node = resolveNode(CachedInnerNode.get(this) || this.topNode, pos, side, true);
      CachedInnerNode.set(this, node);
      return node;
    }
    /**
    In some situations, it can be useful to iterate through all
    nodes around a position, including those in overlays that don't
    directly cover the position. This method gives you an iterator
    that will produce all nodes, from small to big, around the given
    position.
    */
    resolveStack(pos, side = 0) {
      return stackIterator(this, pos, side);
    }
    /**
    Iterate over the tree and its children, calling `enter` for any
    node that touches the `from`/`to` region (if given) before
    running over such a node's children, and `leave` (if given) when
    leaving the node. When `enter` returns `false`, that node will
    not have its children iterated over (or `leave` called).
    */
    iterate(spec) {
      let { enter, leave, from = 0, to = this.length } = spec;
      let mode = spec.mode || 0, anon = (mode & IterMode.IncludeAnonymous) > 0;
      for (let c = this.cursor(mode | IterMode.IncludeAnonymous); ; ) {
        let entered = false;
        if (c.from <= to && c.to >= from && (!anon && c.type.isAnonymous || enter(c) !== false)) {
          if (c.firstChild())
            continue;
          entered = true;
        }
        for (; ; ) {
          if (entered && leave && (anon || !c.type.isAnonymous))
            leave(c);
          if (c.nextSibling())
            break;
          if (!c.parent())
            return;
          entered = true;
        }
      }
    }
    /**
    Get the value of the given [node prop](#common.NodeProp) for this
    node. Works with both per-node and per-type props.
    */
    prop(prop) {
      return !prop.perNode ? this.type.prop(prop) : this.props ? this.props[prop.id] : void 0;
    }
    /**
    Returns the node's [per-node props](#common.NodeProp.perNode) in a
    format that can be passed to the [`Tree`](#common.Tree)
    constructor.
    */
    get propValues() {
      let result = [];
      if (this.props)
        for (let id in this.props)
          result.push([+id, this.props[id]]);
      return result;
    }
    /**
    Balance the direct children of this tree, producing a copy of
    which may have children grouped into subtrees with type
    [`NodeType.none`](#common.NodeType^none).
    */
    balance(config = {}) {
      return this.children.length <= 8 ? this : balanceRange(NodeType.none, this.children, this.positions, 0, this.children.length, 0, this.length, (children, positions, length) => new _Tree(this.type, children, positions, length, this.propValues), config.makeTree || ((children, positions, length) => new _Tree(NodeType.none, children, positions, length)));
    }
    /**
    Build a tree from a postfix-ordered buffer of node information,
    or a cursor over such a buffer.
    */
    static build(data) {
      return buildTree(data);
    }
  };
  Tree.empty = new Tree(NodeType.none, [], [], 0);
  var FlatBufferCursor = class _FlatBufferCursor {
    constructor(buffer, index) {
      this.buffer = buffer;
      this.index = index;
    }
    get id() {
      return this.buffer[this.index - 4];
    }
    get start() {
      return this.buffer[this.index - 3];
    }
    get end() {
      return this.buffer[this.index - 2];
    }
    get size() {
      return this.buffer[this.index - 1];
    }
    get pos() {
      return this.index;
    }
    next() {
      this.index -= 4;
    }
    fork() {
      return new _FlatBufferCursor(this.buffer, this.index);
    }
  };
  var TreeBuffer = class _TreeBuffer {
    /**
    Create a tree buffer.
    */
    constructor(buffer, length, set) {
      this.buffer = buffer;
      this.length = length;
      this.set = set;
    }
    /**
    @internal
    */
    get type() {
      return NodeType.none;
    }
    /**
    @internal
    */
    toString() {
      let result = [];
      for (let index = 0; index < this.buffer.length; ) {
        result.push(this.childString(index));
        index = this.buffer[index + 3];
      }
      return result.join(",");
    }
    /**
    @internal
    */
    childString(index) {
      let id = this.buffer[index], endIndex = this.buffer[index + 3];
      let type = this.set.types[id], result = type.name;
      if (/\W/.test(result) && !type.isError)
        result = JSON.stringify(result);
      index += 4;
      if (endIndex == index)
        return result;
      let children = [];
      while (index < endIndex) {
        children.push(this.childString(index));
        index = this.buffer[index + 3];
      }
      return result + "(" + children.join(",") + ")";
    }
    /**
    @internal
    */
    findChild(startIndex, endIndex, dir, pos, side) {
      let { buffer } = this, pick = -1;
      for (let i2 = startIndex; i2 != endIndex; i2 = buffer[i2 + 3]) {
        if (checkSide(side, pos, buffer[i2 + 1], buffer[i2 + 2])) {
          pick = i2;
          if (dir > 0)
            break;
        }
      }
      return pick;
    }
    /**
    @internal
    */
    slice(startI, endI, from) {
      let b = this.buffer;
      let copy = new Uint16Array(endI - startI), len = 0;
      for (let i2 = startI, j = 0; i2 < endI; ) {
        copy[j++] = b[i2++];
        copy[j++] = b[i2++] - from;
        let to = copy[j++] = b[i2++] - from;
        copy[j++] = b[i2++] - startI;
        len = Math.max(len, to);
      }
      return new _TreeBuffer(copy, len, this.set);
    }
  };
  function checkSide(side, pos, from, to) {
    switch (side) {
      case -2:
        return from < pos;
      case -1:
        return to >= pos && from < pos;
      case 0:
        return from < pos && to > pos;
      case 1:
        return from <= pos && to > pos;
      case 2:
        return to > pos;
      case 4:
        return true;
    }
  }
  function resolveNode(node, pos, side, overlays) {
    var _a2;
    while (node.from == node.to || (side < 1 ? node.from >= pos : node.from > pos) || (side > -1 ? node.to <= pos : node.to < pos)) {
      let parent = !overlays && node instanceof TreeNode && node.index < 0 ? null : node.parent;
      if (!parent)
        return node;
      node = parent;
    }
    let mode = overlays ? 0 : IterMode.IgnoreOverlays;
    if (overlays)
      for (let scan = node, parent = scan.parent; parent; scan = parent, parent = scan.parent) {
        if (scan instanceof TreeNode && scan.index < 0 && ((_a2 = parent.enter(pos, side, mode)) === null || _a2 === void 0 ? void 0 : _a2.from) != scan.from)
          node = parent;
      }
    for (; ; ) {
      let inner = node.enter(pos, side, mode);
      if (!inner)
        return node;
      node = inner;
    }
  }
  var BaseNode = class {
    cursor(mode = 0) {
      return new TreeCursor(this, mode);
    }
    getChild(type, before = null, after = null) {
      let r = getChildren(this, type, before, after);
      return r.length ? r[0] : null;
    }
    getChildren(type, before = null, after = null) {
      return getChildren(this, type, before, after);
    }
    resolve(pos, side = 0) {
      return resolveNode(this, pos, side, false);
    }
    resolveInner(pos, side = 0) {
      return resolveNode(this, pos, side, true);
    }
    matchContext(context) {
      return matchNodeContext(this.parent, context);
    }
    enterUnfinishedNodesBefore(pos) {
      let scan = this.childBefore(pos), node = this;
      while (scan) {
        let last2 = scan.lastChild;
        if (!last2 || last2.to != scan.to)
          break;
        if (last2.type.isError && last2.from == last2.to) {
          node = scan;
          scan = last2.prevSibling;
        } else {
          scan = last2;
        }
      }
      return node;
    }
    get node() {
      return this;
    }
    get next() {
      return this.parent;
    }
  };
  var TreeNode = class _TreeNode extends BaseNode {
    constructor(_tree, from, index, _parent) {
      super();
      this._tree = _tree;
      this.from = from;
      this.index = index;
      this._parent = _parent;
    }
    get type() {
      return this._tree.type;
    }
    get name() {
      return this._tree.type.name;
    }
    get to() {
      return this.from + this._tree.length;
    }
    nextChild(i2, dir, pos, side, mode = 0) {
      for (let parent = this; ; ) {
        for (let { children, positions } = parent._tree, e = dir > 0 ? children.length : -1; i2 != e; i2 += dir) {
          let next = children[i2], start = positions[i2] + parent.from, mounted;
          if (!(mode & IterMode.EnterBracketed && next instanceof Tree && (mounted = MountedTree.get(next)) && !mounted.overlay && mounted.bracketed && pos >= start && pos <= start + next.length) && !checkSide(side, pos, start, start + next.length))
            continue;
          if (next instanceof TreeBuffer) {
            if (mode & IterMode.ExcludeBuffers)
              continue;
            let index = next.findChild(0, next.buffer.length, dir, pos - start, side);
            if (index > -1)
              return new BufferNode(new BufferContext(parent, next, i2, start), null, index);
          } else if (mode & IterMode.IncludeAnonymous || (!next.type.isAnonymous || hasChild(next))) {
            let mounted2;
            if (!(mode & IterMode.IgnoreMounts) && (mounted2 = MountedTree.get(next)) && !mounted2.overlay)
              return new _TreeNode(mounted2.tree, start, i2, parent);
            let inner = new _TreeNode(next, start, i2, parent);
            return mode & IterMode.IncludeAnonymous || !inner.type.isAnonymous ? inner : inner.nextChild(dir < 0 ? next.children.length - 1 : 0, dir, pos, side, mode);
          }
        }
        if (mode & IterMode.IncludeAnonymous || !parent.type.isAnonymous)
          return null;
        if (parent.index >= 0)
          i2 = parent.index + dir;
        else
          i2 = dir < 0 ? -1 : parent._parent._tree.children.length;
        parent = parent._parent;
        if (!parent)
          return null;
      }
    }
    get firstChild() {
      return this.nextChild(
        0,
        1,
        0,
        4
        /* Side.DontCare */
      );
    }
    get lastChild() {
      return this.nextChild(
        this._tree.children.length - 1,
        -1,
        0,
        4
        /* Side.DontCare */
      );
    }
    childAfter(pos) {
      return this.nextChild(
        0,
        1,
        pos,
        2
        /* Side.After */
      );
    }
    childBefore(pos) {
      return this.nextChild(
        this._tree.children.length - 1,
        -1,
        pos,
        -2
        /* Side.Before */
      );
    }
    prop(prop) {
      return this._tree.prop(prop);
    }
    enter(pos, side, mode = 0) {
      let mounted;
      if (!(mode & IterMode.IgnoreOverlays) && (mounted = MountedTree.get(this._tree)) && mounted.overlay) {
        let rPos = pos - this.from, enterBracketed = mode & IterMode.EnterBracketed && mounted.bracketed;
        for (let { from, to } of mounted.overlay) {
          if ((side > 0 || enterBracketed ? from <= rPos : from < rPos) && (side < 0 || enterBracketed ? to >= rPos : to > rPos))
            return new _TreeNode(mounted.tree, mounted.overlay[0].from + this.from, -1, this);
        }
      }
      return this.nextChild(0, 1, pos, side, mode);
    }
    nextSignificantParent() {
      let val = this;
      while (val.type.isAnonymous && val._parent)
        val = val._parent;
      return val;
    }
    get parent() {
      return this._parent ? this._parent.nextSignificantParent() : null;
    }
    get nextSibling() {
      return this._parent && this.index >= 0 ? this._parent.nextChild(
        this.index + 1,
        1,
        0,
        4
        /* Side.DontCare */
      ) : null;
    }
    get prevSibling() {
      return this._parent && this.index >= 0 ? this._parent.nextChild(
        this.index - 1,
        -1,
        0,
        4
        /* Side.DontCare */
      ) : null;
    }
    get tree() {
      return this._tree;
    }
    toTree() {
      return this._tree;
    }
    /**
    @internal
    */
    toString() {
      return this._tree.toString();
    }
  };
  function getChildren(node, type, before, after) {
    let cur2 = node.cursor(), result = [];
    if (!cur2.firstChild())
      return result;
    if (before != null)
      for (let found = false; !found; ) {
        found = cur2.type.is(before);
        if (!cur2.nextSibling())
          return result;
      }
    for (; ; ) {
      if (after != null && cur2.type.is(after))
        return result;
      if (cur2.type.is(type))
        result.push(cur2.node);
      if (!cur2.nextSibling())
        return after == null ? result : [];
    }
  }
  function matchNodeContext(node, context, i2 = context.length - 1) {
    for (let p = node; i2 >= 0; p = p.parent) {
      if (!p)
        return false;
      if (!p.type.isAnonymous) {
        if (context[i2] && context[i2] != p.name)
          return false;
        i2--;
      }
    }
    return true;
  }
  var BufferContext = class {
    constructor(parent, buffer, index, start) {
      this.parent = parent;
      this.buffer = buffer;
      this.index = index;
      this.start = start;
    }
  };
  var BufferNode = class _BufferNode extends BaseNode {
    get name() {
      return this.type.name;
    }
    get from() {
      return this.context.start + this.context.buffer.buffer[this.index + 1];
    }
    get to() {
      return this.context.start + this.context.buffer.buffer[this.index + 2];
    }
    constructor(context, _parent, index) {
      super();
      this.context = context;
      this._parent = _parent;
      this.index = index;
      this.type = context.buffer.set.types[context.buffer.buffer[index]];
    }
    child(dir, pos, side) {
      let { buffer } = this.context;
      let index = buffer.findChild(this.index + 4, buffer.buffer[this.index + 3], dir, pos - this.context.start, side);
      return index < 0 ? null : new _BufferNode(this.context, this, index);
    }
    get firstChild() {
      return this.child(
        1,
        0,
        4
        /* Side.DontCare */
      );
    }
    get lastChild() {
      return this.child(
        -1,
        0,
        4
        /* Side.DontCare */
      );
    }
    childAfter(pos) {
      return this.child(
        1,
        pos,
        2
        /* Side.After */
      );
    }
    childBefore(pos) {
      return this.child(
        -1,
        pos,
        -2
        /* Side.Before */
      );
    }
    prop(prop) {
      return this.type.prop(prop);
    }
    enter(pos, side, mode = 0) {
      if (mode & IterMode.ExcludeBuffers)
        return null;
      let { buffer } = this.context;
      let index = buffer.findChild(this.index + 4, buffer.buffer[this.index + 3], side > 0 ? 1 : -1, pos - this.context.start, side);
      return index < 0 ? null : new _BufferNode(this.context, this, index);
    }
    get parent() {
      return this._parent || this.context.parent.nextSignificantParent();
    }
    externalSibling(dir) {
      return this._parent ? null : this.context.parent.nextChild(
        this.context.index + dir,
        dir,
        0,
        4
        /* Side.DontCare */
      );
    }
    get nextSibling() {
      let { buffer } = this.context;
      let after = buffer.buffer[this.index + 3];
      if (after < (this._parent ? buffer.buffer[this._parent.index + 3] : buffer.buffer.length))
        return new _BufferNode(this.context, this._parent, after);
      return this.externalSibling(1);
    }
    get prevSibling() {
      let { buffer } = this.context;
      let parentStart = this._parent ? this._parent.index + 4 : 0;
      if (this.index == parentStart)
        return this.externalSibling(-1);
      return new _BufferNode(this.context, this._parent, buffer.findChild(
        parentStart,
        this.index,
        -1,
        0,
        4
        /* Side.DontCare */
      ));
    }
    get tree() {
      return null;
    }
    toTree() {
      let children = [], positions = [];
      let { buffer } = this.context;
      let startI = this.index + 4, endI = buffer.buffer[this.index + 3];
      if (endI > startI) {
        let from = buffer.buffer[this.index + 1];
        children.push(buffer.slice(startI, endI, from));
        positions.push(0);
      }
      return new Tree(this.type, children, positions, this.to - this.from);
    }
    /**
    @internal
    */
    toString() {
      return this.context.buffer.childString(this.index);
    }
  };
  function iterStack(heads) {
    if (!heads.length)
      return null;
    let pick = 0, picked = heads[0];
    for (let i2 = 1; i2 < heads.length; i2++) {
      let node = heads[i2];
      if (node.from > picked.from || node.to < picked.to) {
        picked = node;
        pick = i2;
      }
    }
    let next = picked instanceof TreeNode && picked.index < 0 ? null : picked.parent;
    let newHeads = heads.slice();
    if (next)
      newHeads[pick] = next;
    else
      newHeads.splice(pick, 1);
    return new StackIterator(newHeads, picked);
  }
  var StackIterator = class {
    constructor(heads, node) {
      this.heads = heads;
      this.node = node;
    }
    get next() {
      return iterStack(this.heads);
    }
  };
  function stackIterator(tree, pos, side) {
    let inner = tree.resolveInner(pos, side), layers = null;
    for (let scan = inner instanceof TreeNode ? inner : inner.context.parent; scan; scan = scan.parent) {
      if (scan.index < 0) {
        let parent = scan.parent;
        (layers || (layers = [inner])).push(parent.resolve(pos, side));
        scan = parent;
      } else {
        let mount2 = MountedTree.get(scan.tree);
        if (mount2 && mount2.overlay && mount2.overlay[0].from <= pos && mount2.overlay[mount2.overlay.length - 1].to >= pos) {
          let root = new TreeNode(mount2.tree, mount2.overlay[0].from + scan.from, -1, scan);
          (layers || (layers = [inner])).push(resolveNode(root, pos, side, false));
        }
      }
    }
    return layers ? iterStack(layers) : inner;
  }
  var TreeCursor = class {
    /**
    Shorthand for `.type.name`.
    */
    get name() {
      return this.type.name;
    }
    /**
    @internal
    */
    constructor(node, mode = 0) {
      this.buffer = null;
      this.stack = [];
      this.index = 0;
      this.bufferNode = null;
      this.mode = mode & ~IterMode.EnterBracketed;
      if (node instanceof TreeNode) {
        this.yieldNode(node);
      } else {
        this._tree = node.context.parent;
        this.buffer = node.context;
        for (let n = node._parent; n; n = n._parent)
          this.stack.unshift(n.index);
        this.bufferNode = node;
        this.yieldBuf(node.index);
      }
    }
    yieldNode(node) {
      if (!node)
        return false;
      this._tree = node;
      this.type = node.type;
      this.from = node.from;
      this.to = node.to;
      return true;
    }
    yieldBuf(index, type) {
      this.index = index;
      let { start, buffer } = this.buffer;
      this.type = type || buffer.set.types[buffer.buffer[index]];
      this.from = start + buffer.buffer[index + 1];
      this.to = start + buffer.buffer[index + 2];
      return true;
    }
    /**
    @internal
    */
    yield(node) {
      if (!node)
        return false;
      if (node instanceof TreeNode) {
        this.buffer = null;
        return this.yieldNode(node);
      }
      this.buffer = node.context;
      return this.yieldBuf(node.index, node.type);
    }
    /**
    @internal
    */
    toString() {
      return this.buffer ? this.buffer.buffer.childString(this.index) : this._tree.toString();
    }
    /**
    @internal
    */
    enterChild(dir, pos, side) {
      if (!this.buffer)
        return this.yield(this._tree.nextChild(dir < 0 ? this._tree._tree.children.length - 1 : 0, dir, pos, side, this.mode));
      let { buffer } = this.buffer;
      let index = buffer.findChild(this.index + 4, buffer.buffer[this.index + 3], dir, pos - this.buffer.start, side);
      if (index < 0)
        return false;
      this.stack.push(this.index);
      return this.yieldBuf(index);
    }
    /**
    Move the cursor to this node's first child. When this returns
    false, the node has no child, and the cursor has not been moved.
    */
    firstChild() {
      return this.enterChild(
        1,
        0,
        4
        /* Side.DontCare */
      );
    }
    /**
    Move the cursor to this node's last child.
    */
    lastChild() {
      return this.enterChild(
        -1,
        0,
        4
        /* Side.DontCare */
      );
    }
    /**
    Move the cursor to the first child that ends after `pos`.
    */
    childAfter(pos) {
      return this.enterChild(
        1,
        pos,
        2
        /* Side.After */
      );
    }
    /**
    Move to the last child that starts before `pos`.
    */
    childBefore(pos) {
      return this.enterChild(
        -1,
        pos,
        -2
        /* Side.Before */
      );
    }
    /**
    Move the cursor to the child around `pos`. If side is -1 the
    child may end at that position, when 1 it may start there. This
    will also enter [overlaid](#common.MountedTree.overlay)
    [mounted](#common.NodeProp^mounted) trees unless `overlays` is
    set to false.
    */
    enter(pos, side, mode = this.mode) {
      if (!this.buffer)
        return this.yield(this._tree.enter(pos, side, mode));
      return mode & IterMode.ExcludeBuffers ? false : this.enterChild(1, pos, side);
    }
    /**
    Move to the node's parent node, if this isn't the top node.
    */
    parent() {
      if (!this.buffer)
        return this.yieldNode(this.mode & IterMode.IncludeAnonymous ? this._tree._parent : this._tree.parent);
      if (this.stack.length)
        return this.yieldBuf(this.stack.pop());
      let parent = this.mode & IterMode.IncludeAnonymous ? this.buffer.parent : this.buffer.parent.nextSignificantParent();
      this.buffer = null;
      return this.yieldNode(parent);
    }
    /**
    @internal
    */
    sibling(dir) {
      if (!this.buffer)
        return !this._tree._parent ? false : this.yield(this._tree.index < 0 ? null : this._tree._parent.nextChild(this._tree.index + dir, dir, 0, 4, this.mode));
      let { buffer } = this.buffer, d = this.stack.length - 1;
      if (dir < 0) {
        let parentStart = d < 0 ? 0 : this.stack[d] + 4;
        if (this.index != parentStart)
          return this.yieldBuf(buffer.findChild(
            parentStart,
            this.index,
            -1,
            0,
            4
            /* Side.DontCare */
          ));
      } else {
        let after = buffer.buffer[this.index + 3];
        if (after < (d < 0 ? buffer.buffer.length : buffer.buffer[this.stack[d] + 3]))
          return this.yieldBuf(after);
      }
      return d < 0 ? this.yield(this.buffer.parent.nextChild(this.buffer.index + dir, dir, 0, 4, this.mode)) : false;
    }
    /**
    Move to this node's next sibling, if any.
    */
    nextSibling() {
      return this.sibling(1);
    }
    /**
    Move to this node's previous sibling, if any.
    */
    prevSibling() {
      return this.sibling(-1);
    }
    atLastNode(dir) {
      let index, parent, { buffer } = this;
      if (buffer) {
        if (dir > 0) {
          if (this.index < buffer.buffer.buffer.length)
            return false;
        } else {
          for (let i2 = 0; i2 < this.index; i2++)
            if (buffer.buffer.buffer[i2 + 3] < this.index)
              return false;
        }
        ({ index, parent } = buffer);
      } else {
        ({ index, _parent: parent } = this._tree);
      }
      for (; parent; { index, _parent: parent } = parent) {
        if (index > -1)
          for (let i2 = index + dir, e = dir < 0 ? -1 : parent._tree.children.length; i2 != e; i2 += dir) {
            let child = parent._tree.children[i2];
            if (this.mode & IterMode.IncludeAnonymous || child instanceof TreeBuffer || !child.type.isAnonymous || hasChild(child))
              return false;
          }
      }
      return true;
    }
    move(dir, enter) {
      if (enter && this.enterChild(
        dir,
        0,
        4
        /* Side.DontCare */
      ))
        return true;
      for (; ; ) {
        if (this.sibling(dir))
          return true;
        if (this.atLastNode(dir) || !this.parent())
          return false;
      }
    }
    /**
    Move to the next node in a
    [pre-order](https://en.wikipedia.org/wiki/Tree_traversal#Pre-order,_NLR)
    traversal, going from a node to its first child or, if the
    current node is empty or `enter` is false, its next sibling or
    the next sibling of the first parent node that has one.
    */
    next(enter = true) {
      return this.move(1, enter);
    }
    /**
    Move to the next node in a last-to-first pre-order traversal. A
    node is followed by its last child or, if it has none, its
    previous sibling or the previous sibling of the first parent
    node that has one.
    */
    prev(enter = true) {
      return this.move(-1, enter);
    }
    /**
    Move the cursor to the innermost node that covers `pos`. If
    `side` is -1, it will enter nodes that end at `pos`. If it is 1,
    it will enter nodes that start at `pos`.
    */
    moveTo(pos, side = 0) {
      while (this.from == this.to || (side < 1 ? this.from >= pos : this.from > pos) || (side > -1 ? this.to <= pos : this.to < pos))
        if (!this.parent())
          break;
      while (this.enterChild(1, pos, side)) {
      }
      return this;
    }
    /**
    Get a [syntax node](#common.SyntaxNode) at the cursor's current
    position.
    */
    get node() {
      if (!this.buffer)
        return this._tree;
      let cache = this.bufferNode, result = null, depth = 0;
      if (cache && cache.context == this.buffer) {
        scan: for (let index = this.index, d = this.stack.length; d >= 0; ) {
          for (let c = cache; c; c = c._parent)
            if (c.index == index) {
              if (index == this.index)
                return c;
              result = c;
              depth = d + 1;
              break scan;
            }
          index = this.stack[--d];
        }
      }
      for (let i2 = depth; i2 < this.stack.length; i2++)
        result = new BufferNode(this.buffer, result, this.stack[i2]);
      return this.bufferNode = new BufferNode(this.buffer, result, this.index);
    }
    /**
    Get the [tree](#common.Tree) that represents the current node, if
    any. Will return null when the node is in a [tree
    buffer](#common.TreeBuffer).
    */
    get tree() {
      return this.buffer ? null : this._tree._tree;
    }
    /**
    Iterate over the current node and all its descendants, calling
    `enter` when entering a node and `leave`, if given, when leaving
    one. When `enter` returns `false`, any children of that node are
    skipped, and `leave` isn't called for it.
    */
    iterate(enter, leave) {
      for (let depth = 0; ; ) {
        let mustLeave = false;
        if (this.type.isAnonymous || enter(this) !== false) {
          if (this.firstChild()) {
            depth++;
            continue;
          }
          if (!this.type.isAnonymous)
            mustLeave = true;
        }
        for (; ; ) {
          if (mustLeave && leave)
            leave(this);
          mustLeave = this.type.isAnonymous;
          if (!depth)
            return;
          if (this.nextSibling())
            break;
          this.parent();
          depth--;
          mustLeave = true;
        }
      }
    }
    /**
    Test whether the current node matches a given context—a sequence
    of direct parent node names. Empty strings in the context array
    are treated as wildcards.
    */
    matchContext(context) {
      if (!this.buffer)
        return matchNodeContext(this.node.parent, context);
      let { buffer } = this.buffer, { types: types2 } = buffer.set;
      for (let i2 = context.length - 1, d = this.stack.length - 1; i2 >= 0; d--) {
        if (d < 0)
          return matchNodeContext(this._tree, context, i2);
        let type = types2[buffer.buffer[this.stack[d]]];
        if (!type.isAnonymous) {
          if (context[i2] && context[i2] != type.name)
            return false;
          i2--;
        }
      }
      return true;
    }
  };
  function hasChild(tree) {
    return tree.children.some((ch) => ch instanceof TreeBuffer || !ch.type.isAnonymous || hasChild(ch));
  }
  function buildTree(data) {
    var _a2;
    let { buffer, nodeSet, maxBufferLength = DefaultBufferLength, reused = [], minRepeatType = nodeSet.types.length } = data;
    let cursor = Array.isArray(buffer) ? new FlatBufferCursor(buffer, buffer.length) : buffer;
    let types2 = nodeSet.types;
    let contextHash = 0, lookAhead = 0;
    function takeNode(parentStart, minPos, children2, positions2, inRepeat, depth) {
      let { id, start, end, size } = cursor;
      let lookAheadAtStart = lookAhead, contextAtStart = contextHash;
      if (size < 0) {
        cursor.next();
        if (size == -1) {
          let node2 = reused[id];
          children2.push(node2);
          positions2.push(start - parentStart);
          return;
        } else if (size == -3) {
          contextHash = id;
          return;
        } else if (size == -4) {
          lookAhead = id;
          return;
        } else {
          throw new RangeError(`Unrecognized record size: ${size}`);
        }
      }
      let type = types2[id], node, buffer2;
      let startPos = start - parentStart;
      if (end - start <= maxBufferLength && (buffer2 = findBufferSize(cursor.pos - minPos, inRepeat))) {
        let data2 = new Uint16Array(buffer2.size - buffer2.skip);
        let endPos = cursor.pos - buffer2.size, index = data2.length;
        while (cursor.pos > endPos)
          index = copyToBuffer(buffer2.start, data2, index);
        node = new TreeBuffer(data2, end - buffer2.start, nodeSet);
        startPos = buffer2.start - parentStart;
      } else {
        let endPos = cursor.pos - size;
        cursor.next();
        let localChildren = [], localPositions = [];
        let localInRepeat = id >= minRepeatType ? id : -1;
        let lastGroup = 0, lastEnd = end, groupLookAhead = lookAheadAtStart;
        while (cursor.pos > endPos) {
          if (localInRepeat >= 0 && cursor.id == localInRepeat && cursor.size >= 0) {
            if (cursor.end <= lastEnd - maxBufferLength) {
              makeRepeatLeaf(localChildren, localPositions, start, lastGroup, cursor.end, lastEnd, localInRepeat, groupLookAhead, contextAtStart);
              lastGroup = localChildren.length;
              lastEnd = cursor.end;
              groupLookAhead = lookAhead;
            }
            cursor.next();
          } else if (depth > 2500) {
            takeFlatNode(start, endPos, localChildren, localPositions);
          } else {
            if (localInRepeat >= 0 && cursor.size == -1 && reused[cursor.id].type == nodeSet.types[localInRepeat]) {
              if (lastGroup < localChildren.length)
                makeRepeatLeaf(localChildren, localPositions, start, lastGroup, cursor.end, lastEnd, localInRepeat, groupLookAhead, contextAtStart);
              lastGroup = localChildren.length + 1;
              lastEnd = cursor.start;
              groupLookAhead = lookAhead;
            }
            takeNode(start, endPos, localChildren, localPositions, localInRepeat, depth + 1);
          }
        }
        if (localInRepeat >= 0 && lastGroup > 0 && lastGroup < localChildren.length)
          makeRepeatLeaf(localChildren, localPositions, start, lastGroup, start, lastEnd, localInRepeat, groupLookAhead, contextAtStart);
        localChildren.reverse();
        localPositions.reverse();
        if (localInRepeat > -1 && lastGroup > 0) {
          let make = makeBalanced(type, contextAtStart);
          node = balanceRange(type, localChildren, localPositions, 0, localChildren.length, 0, end - start, make, make);
        } else {
          node = makeTree(type, localChildren, localPositions, end - start, lookAheadAtStart - end, contextAtStart);
        }
      }
      children2.push(node);
      positions2.push(startPos);
    }
    function takeFlatNode(parentStart, minPos, children2, positions2) {
      let nodes = [];
      let nodeCount = 0, stopAt = -1;
      while (cursor.pos > minPos) {
        let { id, start, end, size } = cursor;
        if (size > 4) {
          cursor.next();
        } else if (stopAt > -1 && start < stopAt) {
          break;
        } else {
          if (stopAt < 0)
            stopAt = end - maxBufferLength;
          nodes.push(id, start, end);
          nodeCount++;
          cursor.next();
        }
      }
      if (nodeCount) {
        let buffer2 = new Uint16Array(nodeCount * 4);
        let start = nodes[nodes.length - 2];
        for (let i2 = nodes.length - 3, j = 0; i2 >= 0; i2 -= 3) {
          buffer2[j++] = nodes[i2];
          buffer2[j++] = nodes[i2 + 1] - start;
          buffer2[j++] = nodes[i2 + 2] - start;
          buffer2[j++] = j;
        }
        children2.push(new TreeBuffer(buffer2, nodes[2] - start, nodeSet));
        positions2.push(start - parentStart);
      }
    }
    function makeBalanced(type, contextHash2) {
      return (children2, positions2, length2) => {
        let lookAhead2 = 0, lastI = children2.length - 1, last2, lookAheadProp;
        if (lastI >= 0 && (last2 = children2[lastI]) instanceof Tree) {
          if (!lastI && last2.type == type && last2.length == length2)
            return last2;
          if (lookAheadProp = last2.prop(NodeProp.lookAhead))
            lookAhead2 = positions2[lastI] + last2.length + lookAheadProp - length2;
        }
        return makeTree(type, children2, positions2, length2, lookAhead2, contextHash2);
      };
    }
    function makeRepeatLeaf(children2, positions2, base2, i2, from, to, type, lookAhead2, contextHash2) {
      let localChildren = [], localPositions = [];
      while (children2.length > i2) {
        localChildren.push(children2.pop());
        localPositions.push(positions2.pop() + base2 - from);
      }
      children2.push(makeTree(nodeSet.types[type], localChildren, localPositions, to - from, lookAhead2 - to, contextHash2));
      positions2.push(from - base2);
    }
    function makeTree(type, children2, positions2, length2, lookAhead2, contextHash2, props) {
      if (contextHash2) {
        let pair2 = [NodeProp.contextHash, contextHash2];
        props = props ? [pair2].concat(props) : [pair2];
      }
      if (lookAhead2 > 25) {
        let pair2 = [NodeProp.lookAhead, lookAhead2];
        props = props ? [pair2].concat(props) : [pair2];
      }
      return new Tree(type, children2, positions2, length2, props);
    }
    function findBufferSize(maxSize, inRepeat) {
      let fork = cursor.fork();
      let size = 0, start = 0, skip = 0, minStart = fork.end - maxBufferLength;
      let result = { size: 0, start: 0, skip: 0 };
      scan: for (let minPos = fork.pos - maxSize; fork.pos > minPos; ) {
        let nodeSize2 = fork.size;
        if (fork.id == inRepeat && nodeSize2 >= 0) {
          result.size = size;
          result.start = start;
          result.skip = skip;
          skip += 4;
          size += 4;
          fork.next();
          continue;
        }
        let startPos = fork.pos - nodeSize2;
        if (nodeSize2 < 0 || startPos < minPos || fork.start < minStart)
          break;
        let localSkipped = fork.id >= minRepeatType ? 4 : 0;
        let nodeStart = fork.start;
        fork.next();
        while (fork.pos > startPos) {
          if (fork.size < 0) {
            if (fork.size == -3 || fork.size == -4)
              localSkipped += 4;
            else
              break scan;
          } else if (fork.id >= minRepeatType) {
            localSkipped += 4;
          }
          fork.next();
        }
        start = nodeStart;
        size += nodeSize2;
        skip += localSkipped;
      }
      if (inRepeat < 0 || size == maxSize) {
        result.size = size;
        result.start = start;
        result.skip = skip;
      }
      return result.size > 4 ? result : void 0;
    }
    function copyToBuffer(bufferStart, buffer2, index) {
      let { id, start, end, size } = cursor;
      cursor.next();
      if (size >= 0 && id < minRepeatType) {
        let startIndex = index;
        if (size > 4) {
          let endPos = cursor.pos - (size - 4);
          while (cursor.pos > endPos)
            index = copyToBuffer(bufferStart, buffer2, index);
        }
        buffer2[--index] = startIndex;
        buffer2[--index] = end - bufferStart;
        buffer2[--index] = start - bufferStart;
        buffer2[--index] = id;
      } else if (size == -3) {
        contextHash = id;
      } else if (size == -4) {
        lookAhead = id;
      }
      return index;
    }
    let children = [], positions = [];
    while (cursor.pos > 0)
      takeNode(data.start || 0, data.bufferStart || 0, children, positions, -1, 0);
    let length = (_a2 = data.length) !== null && _a2 !== void 0 ? _a2 : children.length ? positions[0] + children[0].length : 0;
    return new Tree(types2[data.topID], children.reverse(), positions.reverse(), length);
  }
  var nodeSizeCache = /* @__PURE__ */ new WeakMap();
  function nodeSize(balanceType, node) {
    if (!balanceType.isAnonymous || node instanceof TreeBuffer || node.type != balanceType)
      return 1;
    let size = nodeSizeCache.get(node);
    if (size == null) {
      size = 1;
      for (let child of node.children) {
        if (child.type != balanceType || !(child instanceof Tree)) {
          size = 1;
          break;
        }
        size += nodeSize(balanceType, child);
      }
      nodeSizeCache.set(node, size);
    }
    return size;
  }
  function balanceRange(balanceType, children, positions, from, to, start, length, mkTop, mkTree) {
    let total = 0;
    for (let i2 = from; i2 < to; i2++)
      total += nodeSize(balanceType, children[i2]);
    let maxChild = Math.ceil(
      total * 1.5 / 8
      /* Balance.BranchFactor */
    );
    let localChildren = [], localPositions = [];
    function divide(children2, positions2, from2, to2, offset) {
      for (let i2 = from2; i2 < to2; ) {
        let groupFrom = i2, groupStart = positions2[i2], groupSize = nodeSize(balanceType, children2[i2]);
        i2++;
        for (; i2 < to2; i2++) {
          let nextSize = nodeSize(balanceType, children2[i2]);
          if (groupSize + nextSize >= maxChild)
            break;
          groupSize += nextSize;
        }
        if (i2 == groupFrom + 1) {
          if (groupSize > maxChild) {
            let only = children2[groupFrom];
            divide(only.children, only.positions, 0, only.children.length, positions2[groupFrom] + offset);
            continue;
          }
          localChildren.push(children2[groupFrom]);
        } else {
          let length2 = positions2[i2 - 1] + children2[i2 - 1].length - groupStart;
          localChildren.push(balanceRange(balanceType, children2, positions2, groupFrom, i2, groupStart, length2, null, mkTree));
        }
        localPositions.push(groupStart + offset - start);
      }
    }
    divide(children, positions, from, to, 0);
    return (mkTop || mkTree)(localChildren, localPositions, length);
  }
  var TreeFragment = class _TreeFragment {
    /**
    Construct a tree fragment. You'll usually want to use
    [`addTree`](#common.TreeFragment^addTree) and
    [`applyChanges`](#common.TreeFragment^applyChanges) instead of
    calling this directly.
    */
    constructor(from, to, tree, offset, openStart = false, openEnd = false) {
      this.from = from;
      this.to = to;
      this.tree = tree;
      this.offset = offset;
      this.open = (openStart ? 1 : 0) | (openEnd ? 2 : 0);
    }
    /**
    Whether the start of the fragment represents the start of a
    parse, or the end of a change. (In the second case, it may not
    be safe to reuse some nodes at the start, depending on the
    parsing algorithm.)
    */
    get openStart() {
      return (this.open & 1) > 0;
    }
    /**
    Whether the end of the fragment represents the end of a
    full-document parse, or the start of a change.
    */
    get openEnd() {
      return (this.open & 2) > 0;
    }
    /**
    Create a set of fragments from a freshly parsed tree, or update
    an existing set of fragments by replacing the ones that overlap
    with a tree with content from the new tree. When `partial` is
    true, the parse is treated as incomplete, and the resulting
    fragment has [`openEnd`](#common.TreeFragment.openEnd) set to
    true.
    */
    static addTree(tree, fragments = [], partial = false) {
      let result = [new _TreeFragment(0, tree.length, tree, 0, false, partial)];
      for (let f of fragments)
        if (f.to > tree.length)
          result.push(f);
      return result;
    }
    /**
    Apply a set of edits to an array of fragments, removing or
    splitting fragments as necessary to remove edited ranges, and
    adjusting offsets for fragments that moved.
    */
    static applyChanges(fragments, changes, minGap = 128) {
      if (!changes.length)
        return fragments;
      let result = [];
      let fI = 1, nextF = fragments.length ? fragments[0] : null;
      for (let cI = 0, pos = 0, off = 0; ; cI++) {
        let nextC = cI < changes.length ? changes[cI] : null;
        let nextPos = nextC ? nextC.fromA : 1e9;
        if (nextPos - pos >= minGap)
          while (nextF && nextF.from < nextPos) {
            let cut = nextF;
            if (pos >= cut.from || nextPos <= cut.to || off) {
              let fFrom = Math.max(cut.from, pos) - off, fTo = Math.min(cut.to, nextPos) - off;
              cut = fFrom >= fTo ? null : new _TreeFragment(fFrom, fTo, cut.tree, cut.offset + off, cI > 0, !!nextC);
            }
            if (cut)
              result.push(cut);
            if (nextF.to > nextPos)
              break;
            nextF = fI < fragments.length ? fragments[fI++] : null;
          }
        if (!nextC)
          break;
        pos = nextC.toA;
        off = nextC.toA - nextC.toB;
      }
      return result;
    }
  };
  var Parser = class {
    /**
    Start a parse, returning a [partial parse](#common.PartialParse)
    object. [`fragments`](#common.TreeFragment) can be passed in to
    make the parse incremental.
    
    By default, the entire input is parsed. You can pass `ranges`,
    which should be a sorted array of non-empty, non-overlapping
    ranges, to parse only those ranges. The tree returned in that
    case will start at `ranges[0].from`.
    */
    startParse(input, fragments, ranges) {
      if (typeof input == "string")
        input = new StringInput(input);
      ranges = !ranges ? [new Range2(0, input.length)] : ranges.length ? ranges.map((r) => new Range2(r.from, r.to)) : [new Range2(0, 0)];
      return this.createParse(input, fragments || [], ranges);
    }
    /**
    Run a full parse, returning the resulting tree.
    */
    parse(input, fragments, ranges) {
      let parse = this.startParse(input, fragments, ranges);
      for (; ; ) {
        let done = parse.advance();
        if (done)
          return done;
      }
    }
  };
  var StringInput = class {
    constructor(string2) {
      this.string = string2;
    }
    get length() {
      return this.string.length;
    }
    chunk(from) {
      return this.string.slice(from);
    }
    get lineChunks() {
      return false;
    }
    read(from, to) {
      return this.string.slice(from, to);
    }
  };
  var stoppedInner = new NodeProp({ perNode: true });

  // node_modules/@lezer/highlight/dist/index.js
  var nextTagID = 0;
  var Tag = class _Tag {
    /**
    @internal
    */
    constructor(name2, set, base2, modified) {
      this.name = name2;
      this.set = set;
      this.base = base2;
      this.modified = modified;
      this.id = nextTagID++;
    }
    toString() {
      let { name: name2 } = this;
      for (let mod of this.modified)
        if (mod.name)
          name2 = `${mod.name}(${name2})`;
      return name2;
    }
    static define(nameOrParent, parent) {
      let name2 = typeof nameOrParent == "string" ? nameOrParent : "?";
      if (nameOrParent instanceof _Tag)
        parent = nameOrParent;
      if (parent === null || parent === void 0 ? void 0 : parent.base)
        throw new Error("Can not derive from a modified tag");
      let tag = new _Tag(name2, [], null, []);
      tag.set.push(tag);
      if (parent)
        for (let t2 of parent.set)
          tag.set.push(t2);
      return tag;
    }
    /**
    Define a tag _modifier_, which is a function that, given a tag,
    will return a tag that is a subtag of the original. Applying the
    same modifier to a twice tag will return the same value (`m1(t1)
    == m1(t1)`) and applying multiple modifiers will, regardless or
    order, produce the same tag (`m1(m2(t1)) == m2(m1(t1))`).
    
    When multiple modifiers are applied to a given base tag, each
    smaller set of modifiers is registered as a parent, so that for
    example `m1(m2(m3(t1)))` is a subtype of `m1(m2(t1))`,
    `m1(m3(t1)`, and so on.
    */
    static defineModifier(name2) {
      let mod = new Modifier(name2);
      return (tag) => {
        if (tag.modified.indexOf(mod) > -1)
          return tag;
        return Modifier.get(tag.base || tag, tag.modified.concat(mod).sort((a, b) => a.id - b.id));
      };
    }
  };
  var nextModifierID = 0;
  var Modifier = class _Modifier {
    constructor(name2) {
      this.name = name2;
      this.instances = [];
      this.id = nextModifierID++;
    }
    static get(base2, mods) {
      if (!mods.length)
        return base2;
      let exists = mods[0].instances.find((t2) => t2.base == base2 && sameArray2(mods, t2.modified));
      if (exists)
        return exists;
      let set = [], tag = new Tag(base2.name, set, base2, mods);
      for (let m of mods)
        m.instances.push(tag);
      let configs = powerSet(mods);
      for (let parent of base2.set)
        if (!parent.modified.length)
          for (let config of configs)
            set.push(_Modifier.get(parent, config));
      return tag;
    }
  };
  function sameArray2(a, b) {
    return a.length == b.length && a.every((x, i2) => x == b[i2]);
  }
  function powerSet(array) {
    let sets = [[]];
    for (let i2 = 0; i2 < array.length; i2++) {
      for (let j = 0, e = sets.length; j < e; j++) {
        sets.push(sets[j].concat(array[i2]));
      }
    }
    return sets.sort((a, b) => b.length - a.length);
  }
  function styleTags(spec) {
    let byName = /* @__PURE__ */ Object.create(null);
    for (let prop in spec) {
      let tags2 = spec[prop];
      if (!Array.isArray(tags2))
        tags2 = [tags2];
      for (let part of prop.split(" "))
        if (part) {
          let pieces = [], mode = 2, rest = part;
          for (let pos = 0; ; ) {
            if (rest == "..." && pos > 0 && pos + 3 == part.length) {
              mode = 1;
              break;
            }
            let m = /^"(?:[^"\\]|\\.)*?"|[^\/!]+/.exec(rest);
            if (!m)
              throw new RangeError("Invalid path: " + part);
            pieces.push(m[0] == "*" ? "" : m[0][0] == '"' ? JSON.parse(m[0]) : m[0]);
            pos += m[0].length;
            if (pos == part.length)
              break;
            let next = part[pos++];
            if (pos == part.length && next == "!") {
              mode = 0;
              break;
            }
            if (next != "/")
              throw new RangeError("Invalid path: " + part);
            rest = part.slice(pos);
          }
          let last2 = pieces.length - 1, inner = pieces[last2];
          if (!inner)
            throw new RangeError("Invalid path: " + part);
          let rule = new Rule(tags2, mode, last2 > 0 ? pieces.slice(0, last2) : null);
          byName[inner] = rule.sort(byName[inner]);
        }
    }
    return ruleNodeProp.add(byName);
  }
  var ruleNodeProp = new NodeProp({
    combine(a, b) {
      let cur2, root, take;
      while (a || b) {
        if (!a || b && a.depth <= b.depth) {
          take = b;
          b = b.next;
        } else {
          take = a;
          a = a.next;
        }
        if (cur2 && cur2.mode == take.mode && !take.context && !cur2.context)
          continue;
        let copy = new Rule(take.tags, take.mode, take.context);
        if (cur2)
          cur2.next = copy;
        else
          root = copy;
        cur2 = copy;
      }
      return root;
    }
  });
  var Rule = class {
    constructor(tags2, mode, context, next) {
      this.tags = tags2;
      this.mode = mode;
      this.context = context;
      this.next = next;
    }
    get opaque() {
      return this.mode == 0;
    }
    get inherit() {
      return this.mode == 1;
    }
    sort(other) {
      if (!other || other.depth < this.depth) {
        this.next = other;
        return this;
      }
      other.next = this.sort(other.next);
      return other;
    }
    get depth() {
      return this.context ? this.context.length : 0;
    }
  };
  Rule.empty = new Rule([], 2, null);
  function tagHighlighter(tags2, options) {
    let map = /* @__PURE__ */ Object.create(null);
    for (let style of tags2) {
      if (!Array.isArray(style.tag))
        map[style.tag.id] = style.class;
      else
        for (let tag of style.tag)
          map[tag.id] = style.class;
    }
    let { scope, all = null } = options || {};
    return {
      style: (tags3) => {
        let cls = all;
        for (let tag of tags3) {
          for (let sub of tag.set) {
            let tagClass = map[sub.id];
            if (tagClass) {
              cls = cls ? cls + " " + tagClass : tagClass;
              break;
            }
          }
        }
        return cls;
      },
      scope
    };
  }
  function highlightTags(highlighters, tags2) {
    let result = null;
    for (let highlighter of highlighters) {
      let value = highlighter.style(tags2);
      if (value)
        result = result ? result + " " + value : value;
    }
    return result;
  }
  function highlightTree(tree, highlighter, putStyle, from = 0, to = tree.length) {
    let builder = new HighlightBuilder(from, Array.isArray(highlighter) ? highlighter : [highlighter], putStyle);
    builder.highlightRange(tree.cursor(), from, to, "", builder.highlighters);
    builder.flush(to);
  }
  var HighlightBuilder = class {
    constructor(at, highlighters, span) {
      this.at = at;
      this.highlighters = highlighters;
      this.span = span;
      this.class = "";
    }
    startSpan(at, cls) {
      if (cls != this.class) {
        this.flush(at);
        if (at > this.at)
          this.at = at;
        this.class = cls;
      }
    }
    flush(to) {
      if (to > this.at && this.class)
        this.span(this.at, to, this.class);
    }
    highlightRange(cursor, from, to, inheritedClass, highlighters) {
      let { type, from: start, to: end } = cursor;
      if (start >= to || end <= from)
        return;
      if (type.isTop)
        highlighters = this.highlighters.filter((h) => !h.scope || h.scope(type));
      let cls = inheritedClass;
      let rule = getStyleTags(cursor) || Rule.empty;
      let tagCls = highlightTags(highlighters, rule.tags);
      if (tagCls) {
        if (cls)
          cls += " ";
        cls += tagCls;
        if (rule.mode == 1)
          inheritedClass += (inheritedClass ? " " : "") + tagCls;
      }
      this.startSpan(Math.max(from, start), cls);
      if (rule.opaque)
        return;
      let mounted = cursor.tree && cursor.tree.prop(NodeProp.mounted);
      if (mounted && mounted.overlay) {
        let inner = cursor.node.enter(mounted.overlay[0].from + start, 1);
        let innerHighlighters = this.highlighters.filter((h) => !h.scope || h.scope(mounted.tree.type));
        let hasChild2 = cursor.firstChild();
        for (let i2 = 0, pos = start; ; i2++) {
          let next = i2 < mounted.overlay.length ? mounted.overlay[i2] : null;
          let nextPos = next ? next.from + start : end;
          let rangeFrom2 = Math.max(from, pos), rangeTo2 = Math.min(to, nextPos);
          if (rangeFrom2 < rangeTo2 && hasChild2) {
            while (cursor.from < rangeTo2) {
              this.highlightRange(cursor, rangeFrom2, rangeTo2, inheritedClass, highlighters);
              this.startSpan(Math.min(rangeTo2, cursor.to), cls);
              if (cursor.to >= nextPos || !cursor.nextSibling())
                break;
            }
          }
          if (!next || nextPos > to)
            break;
          pos = next.to + start;
          if (pos > from) {
            this.highlightRange(inner.cursor(), Math.max(from, next.from + start), Math.min(to, pos), "", innerHighlighters);
            this.startSpan(Math.min(to, pos), cls);
          }
        }
        if (hasChild2)
          cursor.parent();
      } else if (cursor.firstChild()) {
        if (mounted)
          inheritedClass = "";
        do {
          if (cursor.to <= from)
            continue;
          if (cursor.from >= to)
            break;
          this.highlightRange(cursor, from, to, inheritedClass, highlighters);
          this.startSpan(Math.min(to, cursor.to), cls);
        } while (cursor.nextSibling());
        cursor.parent();
      }
    }
  };
  function getStyleTags(node) {
    let rule = node.type.prop(ruleNodeProp);
    while (rule && rule.context && !node.matchContext(rule.context))
      rule = rule.next;
    return rule || null;
  }
  var t = Tag.define;
  var comment = t();
  var name = t();
  var typeName = t(name);
  var propertyName = t(name);
  var literal = t();
  var string = t(literal);
  var number = t(literal);
  var content = t();
  var heading = t(content);
  var keyword = t();
  var operator = t();
  var punctuation = t();
  var bracket = t(punctuation);
  var meta = t();
  var tags = {
    /**
    A comment.
    */
    comment,
    /**
    A line [comment](#highlight.tags.comment).
    */
    lineComment: t(comment),
    /**
    A block [comment](#highlight.tags.comment).
    */
    blockComment: t(comment),
    /**
    A documentation [comment](#highlight.tags.comment).
    */
    docComment: t(comment),
    /**
    Any kind of identifier.
    */
    name,
    /**
    The [name](#highlight.tags.name) of a variable.
    */
    variableName: t(name),
    /**
    A type [name](#highlight.tags.name).
    */
    typeName,
    /**
    A tag name (subtag of [`typeName`](#highlight.tags.typeName)).
    */
    tagName: t(typeName),
    /**
    A property or field [name](#highlight.tags.name).
    */
    propertyName,
    /**
    An attribute name (subtag of [`propertyName`](#highlight.tags.propertyName)).
    */
    attributeName: t(propertyName),
    /**
    The [name](#highlight.tags.name) of a class.
    */
    className: t(name),
    /**
    A label [name](#highlight.tags.name).
    */
    labelName: t(name),
    /**
    A namespace [name](#highlight.tags.name).
    */
    namespace: t(name),
    /**
    The [name](#highlight.tags.name) of a macro.
    */
    macroName: t(name),
    /**
    A literal value.
    */
    literal,
    /**
    A string [literal](#highlight.tags.literal).
    */
    string,
    /**
    A documentation [string](#highlight.tags.string).
    */
    docString: t(string),
    /**
    A character literal (subtag of [string](#highlight.tags.string)).
    */
    character: t(string),
    /**
    An attribute value (subtag of [string](#highlight.tags.string)).
    */
    attributeValue: t(string),
    /**
    A number [literal](#highlight.tags.literal).
    */
    number,
    /**
    An integer [number](#highlight.tags.number) literal.
    */
    integer: t(number),
    /**
    A floating-point [number](#highlight.tags.number) literal.
    */
    float: t(number),
    /**
    A boolean [literal](#highlight.tags.literal).
    */
    bool: t(literal),
    /**
    Regular expression [literal](#highlight.tags.literal).
    */
    regexp: t(literal),
    /**
    An escape [literal](#highlight.tags.literal), for example a
    backslash escape in a string.
    */
    escape: t(literal),
    /**
    A color [literal](#highlight.tags.literal).
    */
    color: t(literal),
    /**
    A URL [literal](#highlight.tags.literal).
    */
    url: t(literal),
    /**
    A language keyword.
    */
    keyword,
    /**
    The [keyword](#highlight.tags.keyword) for the self or this
    object.
    */
    self: t(keyword),
    /**
    The [keyword](#highlight.tags.keyword) for null.
    */
    null: t(keyword),
    /**
    A [keyword](#highlight.tags.keyword) denoting some atomic value.
    */
    atom: t(keyword),
    /**
    A [keyword](#highlight.tags.keyword) that represents a unit.
    */
    unit: t(keyword),
    /**
    A modifier [keyword](#highlight.tags.keyword).
    */
    modifier: t(keyword),
    /**
    A [keyword](#highlight.tags.keyword) that acts as an operator.
    */
    operatorKeyword: t(keyword),
    /**
    A control-flow related [keyword](#highlight.tags.keyword).
    */
    controlKeyword: t(keyword),
    /**
    A [keyword](#highlight.tags.keyword) that defines something.
    */
    definitionKeyword: t(keyword),
    /**
    A [keyword](#highlight.tags.keyword) related to defining or
    interfacing with modules.
    */
    moduleKeyword: t(keyword),
    /**
    An operator.
    */
    operator,
    /**
    An [operator](#highlight.tags.operator) that dereferences something.
    */
    derefOperator: t(operator),
    /**
    Arithmetic-related [operator](#highlight.tags.operator).
    */
    arithmeticOperator: t(operator),
    /**
    Logical [operator](#highlight.tags.operator).
    */
    logicOperator: t(operator),
    /**
    Bit [operator](#highlight.tags.operator).
    */
    bitwiseOperator: t(operator),
    /**
    Comparison [operator](#highlight.tags.operator).
    */
    compareOperator: t(operator),
    /**
    [Operator](#highlight.tags.operator) that updates its operand.
    */
    updateOperator: t(operator),
    /**
    [Operator](#highlight.tags.operator) that defines something.
    */
    definitionOperator: t(operator),
    /**
    Type-related [operator](#highlight.tags.operator).
    */
    typeOperator: t(operator),
    /**
    Control-flow [operator](#highlight.tags.operator).
    */
    controlOperator: t(operator),
    /**
    Program or markup punctuation.
    */
    punctuation,
    /**
    [Punctuation](#highlight.tags.punctuation) that separates
    things.
    */
    separator: t(punctuation),
    /**
    Bracket-style [punctuation](#highlight.tags.punctuation).
    */
    bracket,
    /**
    Angle [brackets](#highlight.tags.bracket) (usually `<` and `>`
    tokens).
    */
    angleBracket: t(bracket),
    /**
    Square [brackets](#highlight.tags.bracket) (usually `[` and `]`
    tokens).
    */
    squareBracket: t(bracket),
    /**
    Parentheses (usually `(` and `)` tokens). Subtag of
    [bracket](#highlight.tags.bracket).
    */
    paren: t(bracket),
    /**
    Braces (usually `{` and `}` tokens). Subtag of
    [bracket](#highlight.tags.bracket).
    */
    brace: t(bracket),
    /**
    Content, for example plain text in XML or markup documents.
    */
    content,
    /**
    [Content](#highlight.tags.content) that represents a heading.
    */
    heading,
    /**
    A level 1 [heading](#highlight.tags.heading).
    */
    heading1: t(heading),
    /**
    A level 2 [heading](#highlight.tags.heading).
    */
    heading2: t(heading),
    /**
    A level 3 [heading](#highlight.tags.heading).
    */
    heading3: t(heading),
    /**
    A level 4 [heading](#highlight.tags.heading).
    */
    heading4: t(heading),
    /**
    A level 5 [heading](#highlight.tags.heading).
    */
    heading5: t(heading),
    /**
    A level 6 [heading](#highlight.tags.heading).
    */
    heading6: t(heading),
    /**
    A prose [content](#highlight.tags.content) separator (such as a horizontal rule).
    */
    contentSeparator: t(content),
    /**
    [Content](#highlight.tags.content) that represents a list.
    */
    list: t(content),
    /**
    [Content](#highlight.tags.content) that represents a quote.
    */
    quote: t(content),
    /**
    [Content](#highlight.tags.content) that is emphasized.
    */
    emphasis: t(content),
    /**
    [Content](#highlight.tags.content) that is styled strong.
    */
    strong: t(content),
    /**
    [Content](#highlight.tags.content) that is part of a link.
    */
    link: t(content),
    /**
    [Content](#highlight.tags.content) that is styled as code or
    monospace.
    */
    monospace: t(content),
    /**
    [Content](#highlight.tags.content) that has a strike-through
    style.
    */
    strikethrough: t(content),
    /**
    Inserted text in a change-tracking format.
    */
    inserted: t(),
    /**
    Deleted text.
    */
    deleted: t(),
    /**
    Changed text.
    */
    changed: t(),
    /**
    An invalid or unsyntactic element.
    */
    invalid: t(),
    /**
    Metadata or meta-instruction.
    */
    meta,
    /**
    [Metadata](#highlight.tags.meta) that applies to the entire
    document.
    */
    documentMeta: t(meta),
    /**
    [Metadata](#highlight.tags.meta) that annotates or adds
    attributes to a given syntactic element.
    */
    annotation: t(meta),
    /**
    Processing instruction or preprocessor directive. Subtag of
    [meta](#highlight.tags.meta).
    */
    processingInstruction: t(meta),
    /**
    [Modifier](#highlight.Tag^defineModifier) that indicates that a
    given element is being defined. Expected to be used with the
    various [name](#highlight.tags.name) tags.
    */
    definition: Tag.defineModifier("definition"),
    /**
    [Modifier](#highlight.Tag^defineModifier) that indicates that
    something is constant. Mostly expected to be used with
    [variable names](#highlight.tags.variableName).
    */
    constant: Tag.defineModifier("constant"),
    /**
    [Modifier](#highlight.Tag^defineModifier) used to indicate that
    a [variable](#highlight.tags.variableName) or [property
    name](#highlight.tags.propertyName) is being called or defined
    as a function.
    */
    function: Tag.defineModifier("function"),
    /**
    [Modifier](#highlight.Tag^defineModifier) that can be applied to
    [names](#highlight.tags.name) to indicate that they belong to
    the language's standard environment.
    */
    standard: Tag.defineModifier("standard"),
    /**
    [Modifier](#highlight.Tag^defineModifier) that indicates a given
    [names](#highlight.tags.name) is local to some scope.
    */
    local: Tag.defineModifier("local"),
    /**
    A generic variant [modifier](#highlight.Tag^defineModifier) that
    can be used to tag language-specific alternative variants of
    some common tag. It is recommended for themes to define special
    forms of at least the [string](#highlight.tags.string) and
    [variable name](#highlight.tags.variableName) tags, since those
    come up a lot.
    */
    special: Tag.defineModifier("special")
  };
  for (let name2 in tags) {
    let val = tags[name2];
    if (val instanceof Tag)
      val.name = name2;
  }
  var classHighlighter = tagHighlighter([
    { tag: tags.link, class: "tok-link" },
    { tag: tags.heading, class: "tok-heading" },
    { tag: tags.emphasis, class: "tok-emphasis" },
    { tag: tags.strong, class: "tok-strong" },
    { tag: tags.keyword, class: "tok-keyword" },
    { tag: tags.atom, class: "tok-atom" },
    { tag: tags.bool, class: "tok-bool" },
    { tag: tags.url, class: "tok-url" },
    { tag: tags.labelName, class: "tok-labelName" },
    { tag: tags.inserted, class: "tok-inserted" },
    { tag: tags.deleted, class: "tok-deleted" },
    { tag: tags.literal, class: "tok-literal" },
    { tag: tags.string, class: "tok-string" },
    { tag: tags.number, class: "tok-number" },
    { tag: [tags.regexp, tags.escape, tags.special(tags.string)], class: "tok-string2" },
    { tag: tags.variableName, class: "tok-variableName" },
    { tag: tags.local(tags.variableName), class: "tok-variableName tok-local" },
    { tag: tags.definition(tags.variableName), class: "tok-variableName tok-definition" },
    { tag: tags.special(tags.variableName), class: "tok-variableName2" },
    { tag: tags.definition(tags.propertyName), class: "tok-propertyName tok-definition" },
    { tag: tags.typeName, class: "tok-typeName" },
    { tag: tags.namespace, class: "tok-namespace" },
    { tag: tags.className, class: "tok-className" },
    { tag: tags.macroName, class: "tok-macroName" },
    { tag: tags.propertyName, class: "tok-propertyName" },
    { tag: tags.operator, class: "tok-operator" },
    { tag: tags.comment, class: "tok-comment" },
    { tag: tags.meta, class: "tok-meta" },
    { tag: tags.invalid, class: "tok-invalid" },
    { tag: tags.punctuation, class: "tok-punctuation" }
  ]);

  // node_modules/@codemirror/language/dist/index.js
  var _a;
  var languageDataProp = /* @__PURE__ */ new NodeProp();
  function defineLanguageFacet(baseData) {
    return Facet.define({
      combine: baseData ? (values) => values.concat(baseData) : void 0
    });
  }
  var sublanguageProp = /* @__PURE__ */ new NodeProp();
  var Language = class {
    /**
    Construct a language object. If you need to invoke this
    directly, first define a data facet with
    [`defineLanguageFacet`](https://codemirror.net/6/docs/ref/#language.defineLanguageFacet), and then
    configure your parser to [attach](https://codemirror.net/6/docs/ref/#language.languageDataProp) it
    to the language's outer syntax node.
    */
    constructor(data, parser2, extraExtensions = [], name2 = "") {
      this.data = data;
      this.name = name2;
      if (!EditorState.prototype.hasOwnProperty("tree"))
        Object.defineProperty(EditorState.prototype, "tree", { get() {
          return syntaxTree(this);
        } });
      this.parser = parser2;
      this.extension = [
        language.of(this),
        EditorState.languageData.of((state, pos, side) => {
          let top2 = topNodeAt(state, pos, side), data2 = top2.type.prop(languageDataProp);
          if (!data2)
            return [];
          let base2 = state.facet(data2), sub = top2.type.prop(sublanguageProp);
          if (sub) {
            let innerNode = top2.resolve(pos - top2.from, side);
            for (let sublang of sub)
              if (sublang.test(innerNode, state)) {
                let data3 = state.facet(sublang.facet);
                return sublang.type == "replace" ? data3 : data3.concat(base2);
              }
          }
          return base2;
        })
      ].concat(extraExtensions);
    }
    /**
    Query whether this language is active at the given position.
    */
    isActiveAt(state, pos, side = -1) {
      return topNodeAt(state, pos, side).type.prop(languageDataProp) == this.data;
    }
    /**
    Find the document regions that were parsed using this language.
    The returned regions will _include_ any nested languages rooted
    in this language, when those exist.
    */
    findRegions(state) {
      let lang = state.facet(language);
      if ((lang === null || lang === void 0 ? void 0 : lang.data) == this.data)
        return [{ from: 0, to: state.doc.length }];
      if (!lang || !lang.allowsNesting)
        return [];
      let result = [];
      let explore = (tree, from) => {
        if (tree.prop(languageDataProp) == this.data) {
          result.push({ from, to: from + tree.length });
          return;
        }
        let mount2 = tree.prop(NodeProp.mounted);
        if (mount2) {
          if (mount2.tree.prop(languageDataProp) == this.data) {
            if (mount2.overlay)
              for (let r of mount2.overlay)
                result.push({ from: r.from + from, to: r.to + from });
            else
              result.push({ from, to: from + tree.length });
            return;
          } else if (mount2.overlay) {
            let size = result.length;
            explore(mount2.tree, mount2.overlay[0].from + from);
            if (result.length > size)
              return;
          }
        }
        for (let i2 = 0; i2 < tree.children.length; i2++) {
          let ch = tree.children[i2];
          if (ch instanceof Tree)
            explore(ch, tree.positions[i2] + from);
        }
      };
      explore(syntaxTree(state), 0);
      return result;
    }
    /**
    Indicates whether this language allows nested languages. The
    default implementation returns true.
    */
    get allowsNesting() {
      return true;
    }
  };
  Language.setState = /* @__PURE__ */ StateEffect.define();
  function topNodeAt(state, pos, side) {
    let topLang = state.facet(language), tree = syntaxTree(state).topNode;
    if (!topLang || topLang.allowsNesting) {
      for (let node = tree; node; node = node.enter(pos, side, IterMode.ExcludeBuffers | IterMode.EnterBracketed))
        if (node.type.isTop)
          tree = node;
    }
    return tree;
  }
  var LRLanguage = class _LRLanguage extends Language {
    constructor(data, parser2, name2) {
      super(data, parser2, [], name2);
      this.parser = parser2;
    }
    /**
    Define a language from a parser.
    */
    static define(spec) {
      let data = defineLanguageFacet(spec.languageData);
      return new _LRLanguage(data, spec.parser.configure({
        props: [languageDataProp.add((type) => type.isTop ? data : void 0)]
      }), spec.name);
    }
    /**
    Create a new instance of this language with a reconfigured
    version of its parser and optionally a new name.
    */
    configure(options, name2) {
      return new _LRLanguage(this.data, this.parser.configure(options), name2 || this.name);
    }
    get allowsNesting() {
      return this.parser.hasWrappers();
    }
  };
  function syntaxTree(state) {
    let field = state.field(Language.state, false);
    return field ? field.tree : Tree.empty;
  }
  var DocInput = class {
    /**
    Create an input object for the given document.
    */
    constructor(doc2) {
      this.doc = doc2;
      this.cursorPos = 0;
      this.string = "";
      this.cursor = doc2.iter();
    }
    get length() {
      return this.doc.length;
    }
    syncTo(pos) {
      this.string = this.cursor.next(pos - this.cursorPos).value;
      this.cursorPos = pos + this.string.length;
      return this.cursorPos - this.string.length;
    }
    chunk(pos) {
      this.syncTo(pos);
      return this.string;
    }
    get lineChunks() {
      return true;
    }
    read(from, to) {
      let stringStart = this.cursorPos - this.string.length;
      if (from < stringStart || to >= this.cursorPos)
        return this.doc.sliceString(from, to);
      else
        return this.string.slice(from - stringStart, to - stringStart);
    }
  };
  var currentContext = null;
  var ParseContext = class _ParseContext {
    constructor(parser2, state, fragments = [], tree, treeLen, viewport, skipped, scheduleOn) {
      this.parser = parser2;
      this.state = state;
      this.fragments = fragments;
      this.tree = tree;
      this.treeLen = treeLen;
      this.viewport = viewport;
      this.skipped = skipped;
      this.scheduleOn = scheduleOn;
      this.parse = null;
      this.tempSkipped = [];
    }
    /**
    @internal
    */
    static create(parser2, state, viewport) {
      return new _ParseContext(parser2, state, [], Tree.empty, 0, viewport, [], null);
    }
    startParse() {
      return this.parser.startParse(new DocInput(this.state.doc), this.fragments);
    }
    /**
    @internal
    */
    work(until, upto) {
      if (upto != null && upto >= this.state.doc.length)
        upto = void 0;
      if (this.tree != Tree.empty && this.isDone(upto !== null && upto !== void 0 ? upto : this.state.doc.length)) {
        this.takeTree();
        return true;
      }
      return this.withContext(() => {
        var _a2;
        if (typeof until == "number") {
          let endTime = Date.now() + until;
          until = () => Date.now() > endTime;
        }
        if (!this.parse)
          this.parse = this.startParse();
        if (upto != null && (this.parse.stoppedAt == null || this.parse.stoppedAt > upto) && upto < this.state.doc.length)
          this.parse.stopAt(upto);
        for (; ; ) {
          let done = this.parse.advance();
          if (done) {
            this.fragments = this.withoutTempSkipped(TreeFragment.addTree(done, this.fragments, this.parse.stoppedAt != null));
            this.treeLen = (_a2 = this.parse.stoppedAt) !== null && _a2 !== void 0 ? _a2 : this.state.doc.length;
            this.tree = done;
            this.parse = null;
            if (this.treeLen < (upto !== null && upto !== void 0 ? upto : this.state.doc.length))
              this.parse = this.startParse();
            else
              return true;
          }
          if (until())
            return false;
        }
      });
    }
    /**
    @internal
    */
    takeTree() {
      let pos, tree;
      if (this.parse && (pos = this.parse.parsedPos) >= this.treeLen) {
        if (this.parse.stoppedAt == null || this.parse.stoppedAt > pos)
          this.parse.stopAt(pos);
        this.withContext(() => {
          while (!(tree = this.parse.advance())) {
          }
        });
        this.treeLen = pos;
        this.tree = tree;
        this.fragments = this.withoutTempSkipped(TreeFragment.addTree(this.tree, this.fragments, true));
        this.parse = null;
      }
    }
    withContext(f) {
      let prev = currentContext;
      currentContext = this;
      try {
        return f();
      } finally {
        currentContext = prev;
      }
    }
    withoutTempSkipped(fragments) {
      for (let r; r = this.tempSkipped.pop(); )
        fragments = cutFragments(fragments, r.from, r.to);
      return fragments;
    }
    /**
    @internal
    */
    changes(changes, newState) {
      let { fragments, tree, treeLen, viewport, skipped } = this;
      this.takeTree();
      if (!changes.empty) {
        let ranges = [];
        changes.iterChangedRanges((fromA, toA, fromB, toB) => ranges.push({ fromA, toA, fromB, toB }));
        fragments = TreeFragment.applyChanges(fragments, ranges);
        tree = Tree.empty;
        treeLen = 0;
        viewport = { from: changes.mapPos(viewport.from, -1), to: changes.mapPos(viewport.to, 1) };
        if (this.skipped.length) {
          skipped = [];
          for (let r of this.skipped) {
            let from = changes.mapPos(r.from, 1), to = changes.mapPos(r.to, -1);
            if (from < to)
              skipped.push({ from, to });
          }
        }
      }
      return new _ParseContext(this.parser, newState, fragments, tree, treeLen, viewport, skipped, this.scheduleOn);
    }
    /**
    @internal
    */
    updateViewport(viewport) {
      if (this.viewport.from == viewport.from && this.viewport.to == viewport.to)
        return false;
      this.viewport = viewport;
      let startLen = this.skipped.length;
      for (let i2 = 0; i2 < this.skipped.length; i2++) {
        let { from, to } = this.skipped[i2];
        if (from < viewport.to && to > viewport.from) {
          this.fragments = cutFragments(this.fragments, from, to);
          this.skipped.splice(i2--, 1);
        }
      }
      if (this.skipped.length >= startLen)
        return false;
      this.reset();
      return true;
    }
    /**
    @internal
    */
    reset() {
      if (this.parse) {
        this.takeTree();
        this.parse = null;
      }
    }
    /**
    Notify the parse scheduler that the given region was skipped
    because it wasn't in view, and the parse should be restarted
    when it comes into view.
    */
    skipUntilInView(from, to) {
      this.skipped.push({ from, to });
    }
    /**
    Returns a parser intended to be used as placeholder when
    asynchronously loading a nested parser. It'll skip its input and
    mark it as not-really-parsed, so that the next update will parse
    it again.
    
    When `until` is given, a reparse will be scheduled when that
    promise resolves.
    */
    static getSkippingParser(until) {
      return new class extends Parser {
        createParse(input, fragments, ranges) {
          let from = ranges[0].from, to = ranges[ranges.length - 1].to;
          let parser2 = {
            parsedPos: from,
            advance() {
              let cx = currentContext;
              if (cx) {
                for (let r of ranges)
                  cx.tempSkipped.push(r);
                if (until)
                  cx.scheduleOn = cx.scheduleOn ? Promise.all([cx.scheduleOn, until]) : until;
              }
              this.parsedPos = to;
              return new Tree(NodeType.none, [], [], to - from);
            },
            stoppedAt: null,
            stopAt() {
            }
          };
          return parser2;
        }
      }();
    }
    /**
    @internal
    */
    isDone(upto) {
      upto = Math.min(upto, this.state.doc.length);
      let frags = this.fragments;
      return this.treeLen >= upto && frags.length && frags[0].from == 0 && frags[0].to >= upto;
    }
    /**
    Get the context for the current parse, or `null` if no editor
    parse is in progress.
    */
    static get() {
      return currentContext;
    }
  };
  function cutFragments(fragments, from, to) {
    return TreeFragment.applyChanges(fragments, [{ fromA: from, toA: to, fromB: from, toB: to }]);
  }
  var LanguageState = class _LanguageState {
    constructor(context) {
      this.context = context;
      this.tree = context.tree;
    }
    apply(tr) {
      if (!tr.docChanged && this.tree == this.context.tree)
        return this;
      let newCx = this.context.changes(tr.changes, tr.state);
      let upto = this.context.treeLen == tr.startState.doc.length ? void 0 : Math.max(tr.changes.mapPos(this.context.treeLen), newCx.viewport.to);
      if (!newCx.work(20, upto))
        newCx.takeTree();
      return new _LanguageState(newCx);
    }
    static init(state) {
      let vpTo = Math.min(3e3, state.doc.length);
      let parseState = ParseContext.create(state.facet(language).parser, state, { from: 0, to: vpTo });
      if (!parseState.work(20, vpTo))
        parseState.takeTree();
      return new _LanguageState(parseState);
    }
  };
  Language.state = /* @__PURE__ */ StateField.define({
    create: LanguageState.init,
    update(value, tr) {
      for (let e of tr.effects)
        if (e.is(Language.setState))
          return e.value;
      if (tr.startState.facet(language) != tr.state.facet(language))
        return LanguageState.init(tr.state);
      return value.apply(tr);
    }
  });
  var requestIdle = (callback) => {
    let timeout = setTimeout(
      () => callback(),
      500
      /* Work.MaxPause */
    );
    return () => clearTimeout(timeout);
  };
  if (typeof requestIdleCallback != "undefined")
    requestIdle = (callback) => {
      let idle = -1, timeout = setTimeout(
        () => {
          idle = requestIdleCallback(callback, {
            timeout: 500 - 100
            /* Work.MinPause */
          });
        },
        100
        /* Work.MinPause */
      );
      return () => idle < 0 ? clearTimeout(timeout) : cancelIdleCallback(idle);
    };
  var isInputPending = typeof navigator != "undefined" && ((_a = navigator.scheduling) === null || _a === void 0 ? void 0 : _a.isInputPending) ? () => navigator.scheduling.isInputPending() : null;
  var parseWorker = /* @__PURE__ */ ViewPlugin.fromClass(class ParseWorker {
    constructor(view2) {
      this.view = view2;
      this.working = null;
      this.workScheduled = 0;
      this.chunkEnd = -1;
      this.chunkBudget = -1;
      this.work = this.work.bind(this);
      this.scheduleWork();
    }
    update(update) {
      let cx = this.view.state.field(Language.state).context;
      if (cx.updateViewport(update.view.viewport) || this.view.viewport.to > cx.treeLen)
        this.scheduleWork();
      if (update.docChanged || update.selectionSet) {
        if (this.view.hasFocus)
          this.chunkBudget += 50;
        this.scheduleWork();
      }
      this.checkAsyncSchedule(cx);
    }
    scheduleWork() {
      if (this.working)
        return;
      let { state } = this.view, field = state.field(Language.state);
      if (field.tree != field.context.tree || !field.context.isDone(state.doc.length))
        this.working = requestIdle(this.work);
    }
    work(deadline) {
      this.working = null;
      let now = Date.now();
      if (this.chunkEnd < now && (this.chunkEnd < 0 || this.view.hasFocus)) {
        this.chunkEnd = now + 3e4;
        this.chunkBudget = 3e3;
      }
      if (this.chunkBudget <= 0)
        return;
      let { state, viewport: { to: vpTo } } = this.view, field = state.field(Language.state);
      if (field.tree == field.context.tree && field.context.isDone(
        vpTo + 1e5
        /* Work.MaxParseAhead */
      ))
        return;
      let endTime = Date.now() + Math.min(this.chunkBudget, 100, deadline && !isInputPending ? Math.max(25, deadline.timeRemaining() - 5) : 1e9);
      let viewportFirst = field.context.treeLen < vpTo && state.doc.length > vpTo + 1e3;
      let done = field.context.work(() => {
        return isInputPending && isInputPending() || Date.now() > endTime;
      }, vpTo + (viewportFirst ? 0 : 1e5));
      this.chunkBudget -= Date.now() - now;
      if (done || this.chunkBudget <= 0) {
        field.context.takeTree();
        this.view.dispatch({ effects: Language.setState.of(new LanguageState(field.context)) });
      }
      if (this.chunkBudget > 0 && !(done && !viewportFirst))
        this.scheduleWork();
      this.checkAsyncSchedule(field.context);
    }
    checkAsyncSchedule(cx) {
      if (cx.scheduleOn) {
        this.workScheduled++;
        cx.scheduleOn.then(() => this.scheduleWork()).catch((err) => logException(this.view.state, err)).then(() => this.workScheduled--);
        cx.scheduleOn = null;
      }
    }
    destroy() {
      if (this.working)
        this.working();
    }
    isWorking() {
      return !!(this.working || this.workScheduled > 0);
    }
  }, {
    eventHandlers: { focus() {
      this.scheduleWork();
    } }
  });
  var language = /* @__PURE__ */ Facet.define({
    combine(languages) {
      return languages.length ? languages[0] : null;
    },
    enables: (language2) => [
      Language.state,
      parseWorker,
      EditorView.contentAttributes.compute([language2], (state) => {
        let lang = state.facet(language2);
        return lang && lang.name ? { "data-language": lang.name } : {};
      })
    ]
  });
  var indentService = /* @__PURE__ */ Facet.define();
  var indentUnit = /* @__PURE__ */ Facet.define({
    combine: (values) => {
      if (!values.length)
        return "  ";
      let unit = values[0];
      if (!unit || /\S/.test(unit) || Array.from(unit).some((e) => e != unit[0]))
        throw new Error("Invalid indent unit: " + JSON.stringify(values[0]));
      return unit;
    }
  });
  function getIndentUnit(state) {
    let unit = state.facet(indentUnit);
    return unit.charCodeAt(0) == 9 ? state.tabSize * unit.length : unit.length;
  }
  function indentString(state, cols) {
    let result = "", ts = state.tabSize, ch = state.facet(indentUnit)[0];
    if (ch == "	") {
      while (cols >= ts) {
        result += "	";
        cols -= ts;
      }
      ch = " ";
    }
    for (let i2 = 0; i2 < cols; i2++)
      result += ch;
    return result;
  }
  function getIndentation(context, pos) {
    if (context instanceof EditorState)
      context = new IndentContext(context);
    for (let service of context.state.facet(indentService)) {
      let result = service(context, pos);
      if (result !== void 0)
        return result;
    }
    let tree = syntaxTree(context.state);
    return tree.length >= pos ? syntaxIndentation(context, tree, pos) : null;
  }
  var IndentContext = class {
    /**
    Create an indent context.
    */
    constructor(state, options = {}) {
      this.state = state;
      this.options = options;
      this.unit = getIndentUnit(state);
    }
    /**
    Get a description of the line at the given position, taking
    [simulated line
    breaks](https://codemirror.net/6/docs/ref/#language.IndentContext.constructor^options.simulateBreak)
    into account. If there is such a break at `pos`, the `bias`
    argument determines whether the part of the line line before or
    after the break is used.
    */
    lineAt(pos, bias = 1) {
      let line = this.state.doc.lineAt(pos);
      let { simulateBreak, simulateDoubleBreak } = this.options;
      if (simulateBreak != null && simulateBreak >= line.from && simulateBreak <= line.to) {
        if (simulateDoubleBreak && simulateBreak == pos)
          return { text: "", from: pos };
        else if (bias < 0 ? simulateBreak < pos : simulateBreak <= pos)
          return { text: line.text.slice(simulateBreak - line.from), from: simulateBreak };
        else
          return { text: line.text.slice(0, simulateBreak - line.from), from: line.from };
      }
      return line;
    }
    /**
    Get the text directly after `pos`, either the entire line
    or the next 100 characters, whichever is shorter.
    */
    textAfterPos(pos, bias = 1) {
      if (this.options.simulateDoubleBreak && pos == this.options.simulateBreak)
        return "";
      let { text, from } = this.lineAt(pos, bias);
      return text.slice(pos - from, Math.min(text.length, pos + 100 - from));
    }
    /**
    Find the column for the given position.
    */
    column(pos, bias = 1) {
      let { text, from } = this.lineAt(pos, bias);
      let result = this.countColumn(text, pos - from);
      let override = this.options.overrideIndentation ? this.options.overrideIndentation(from) : -1;
      if (override > -1)
        result += override - this.countColumn(text, text.search(/\S|$/));
      return result;
    }
    /**
    Find the column position (taking tabs into account) of the given
    position in the given string.
    */
    countColumn(line, pos = line.length) {
      return countColumn(line, this.state.tabSize, pos);
    }
    /**
    Find the indentation column of the line at the given point.
    */
    lineIndent(pos, bias = 1) {
      let { text, from } = this.lineAt(pos, bias);
      let override = this.options.overrideIndentation;
      if (override) {
        let overriden = override(from);
        if (overriden > -1)
          return overriden;
      }
      return this.countColumn(text, text.search(/\S|$/));
    }
    /**
    Returns the [simulated line
    break](https://codemirror.net/6/docs/ref/#language.IndentContext.constructor^options.simulateBreak)
    for this context, if any.
    */
    get simulatedBreak() {
      return this.options.simulateBreak || null;
    }
  };
  var indentNodeProp = /* @__PURE__ */ new NodeProp();
  function syntaxIndentation(cx, ast, pos) {
    let stack = ast.resolveStack(pos);
    let inner = ast.resolveInner(pos, -1).resolve(pos, 0).enterUnfinishedNodesBefore(pos);
    if (inner != stack.node) {
      let add = [];
      for (let cur2 = inner; cur2 && !(cur2.from < stack.node.from || cur2.to > stack.node.to || cur2.from == stack.node.from && cur2.type == stack.node.type); cur2 = cur2.parent)
        add.push(cur2);
      for (let i2 = add.length - 1; i2 >= 0; i2--)
        stack = { node: add[i2], next: stack };
    }
    return indentFor(stack, cx, pos);
  }
  function indentFor(stack, cx, pos) {
    for (let cur2 = stack; cur2; cur2 = cur2.next) {
      let strategy = indentStrategy(cur2.node);
      if (strategy)
        return strategy(TreeIndentContext.create(cx, pos, cur2));
    }
    return 0;
  }
  function ignoreClosed(cx) {
    return cx.pos == cx.options.simulateBreak && cx.options.simulateDoubleBreak;
  }
  function indentStrategy(tree) {
    let strategy = tree.type.prop(indentNodeProp);
    if (strategy)
      return strategy;
    let first = tree.firstChild, close;
    if (first && (close = first.type.prop(NodeProp.closedBy))) {
      let last2 = tree.lastChild, closed = last2 && close.indexOf(last2.name) > -1;
      return (cx) => delimitedStrategy(cx, true, 1, void 0, closed && !ignoreClosed(cx) ? last2.from : void 0);
    }
    return tree.parent == null ? topIndent : null;
  }
  function topIndent() {
    return 0;
  }
  var TreeIndentContext = class _TreeIndentContext extends IndentContext {
    constructor(base2, pos, context) {
      super(base2.state, base2.options);
      this.base = base2;
      this.pos = pos;
      this.context = context;
    }
    /**
    The syntax tree node to which the indentation strategy
    applies.
    */
    get node() {
      return this.context.node;
    }
    /**
    @internal
    */
    static create(base2, pos, context) {
      return new _TreeIndentContext(base2, pos, context);
    }
    /**
    Get the text directly after `this.pos`, either the entire line
    or the next 100 characters, whichever is shorter.
    */
    get textAfter() {
      return this.textAfterPos(this.pos);
    }
    /**
    Get the indentation at the reference line for `this.node`, which
    is the line on which it starts, unless there is a node that is
    _not_ a parent of this node covering the start of that line. If
    so, the line at the start of that node is tried, again skipping
    on if it is covered by another such node.
    */
    get baseIndent() {
      return this.baseIndentFor(this.node);
    }
    /**
    Get the indentation for the reference line of the given node
    (see [`baseIndent`](https://codemirror.net/6/docs/ref/#language.TreeIndentContext.baseIndent)).
    */
    baseIndentFor(node) {
      let line = this.state.doc.lineAt(node.from);
      for (; ; ) {
        let atBreak = node.resolve(line.from);
        while (atBreak.parent && atBreak.parent.from == atBreak.from)
          atBreak = atBreak.parent;
        if (isParent(atBreak, node))
          break;
        line = this.state.doc.lineAt(atBreak.from);
      }
      return this.lineIndent(line.from);
    }
    /**
    Continue looking for indentations in the node's parent nodes,
    and return the result of that.
    */
    continue() {
      return indentFor(this.context.next, this.base, this.pos);
    }
  };
  function isParent(parent, of) {
    for (let cur2 = of; cur2; cur2 = cur2.parent)
      if (parent == cur2)
        return true;
    return false;
  }
  function bracketedAligned(context) {
    let tree = context.node;
    let openToken = tree.childAfter(tree.from), last2 = tree.lastChild;
    if (!openToken)
      return null;
    let sim = context.options.simulateBreak;
    let openLine = context.state.doc.lineAt(openToken.from);
    let lineEnd = sim == null || sim <= openLine.from ? openLine.to : Math.min(openLine.to, sim);
    for (let pos = openToken.to; ; ) {
      let next = tree.childAfter(pos);
      if (!next || next == last2)
        return null;
      if (!next.type.isSkipped) {
        if (next.from >= lineEnd)
          return null;
        let space = /^ */.exec(openLine.text.slice(openToken.to - openLine.from))[0].length;
        return { from: openToken.from, to: openToken.to + space };
      }
      pos = next.to;
    }
  }
  function delimitedStrategy(context, align, units, closing, closedAt) {
    let after = context.textAfter, space = after.match(/^\s*/)[0].length;
    let closed = closing && after.slice(space, space + closing.length) == closing || closedAt == context.pos + space;
    let aligned = align ? bracketedAligned(context) : null;
    if (aligned)
      return closed ? context.column(aligned.from) : context.column(aligned.to);
    return context.baseIndent + (closed ? 0 : context.unit * units);
  }
  function continuedIndent({ except, units = 1 } = {}) {
    return (context) => {
      let matchExcept = except && except.test(context.textAfter);
      return context.baseIndent + (matchExcept ? 0 : units * context.unit);
    };
  }
  var foldNodeProp = /* @__PURE__ */ new NodeProp();
  var HighlightStyle = class _HighlightStyle {
    constructor(specs, options) {
      this.specs = specs;
      let modSpec;
      function def(spec) {
        let cls = StyleModule.newName();
        (modSpec || (modSpec = /* @__PURE__ */ Object.create(null)))["." + cls] = spec;
        return cls;
      }
      const all = typeof options.all == "string" ? options.all : options.all ? def(options.all) : void 0;
      const scopeOpt = options.scope;
      this.scope = scopeOpt instanceof Language ? (type) => type.prop(languageDataProp) == scopeOpt.data : scopeOpt ? (type) => type == scopeOpt : void 0;
      this.style = tagHighlighter(specs.map((style) => ({
        tag: style.tag,
        class: style.class || def(Object.assign({}, style, { tag: null }))
      })), {
        all
      }).style;
      this.module = modSpec ? new StyleModule(modSpec) : null;
      this.themeType = options.themeType;
    }
    /**
    Create a highlighter style that associates the given styles to
    the given tags. The specs must be objects that hold a style tag
    or array of tags in their `tag` property, and either a single
    `class` property providing a static CSS class (for highlighter
    that rely on external styling), or a
    [`style-mod`](https://code.haverbeke.berlin/marijn/style-mod#documentation)-style
    set of CSS properties (which define the styling for those tags).
    
    The CSS rules created for a highlighter will be emitted in the
    order of the spec's properties. That means that for elements that
    have multiple tags associated with them, styles defined further
    down in the list will have a higher CSS precedence than styles
    defined earlier.
    */
    static define(specs, options) {
      return new _HighlightStyle(specs, options || {});
    }
  };
  var highlighterFacet = /* @__PURE__ */ Facet.define();
  var fallbackHighlighter = /* @__PURE__ */ Facet.define({
    combine(values) {
      return values.length ? [values[0]] : null;
    }
  });
  function getHighlighters(state) {
    let main = state.facet(highlighterFacet);
    return main.length ? main : state.facet(fallbackHighlighter);
  }
  function syntaxHighlighting(highlighter, options) {
    let ext = [treeHighlighter], themeType;
    if (highlighter instanceof HighlightStyle) {
      if (highlighter.module)
        ext.push(EditorView.styleModule.of(highlighter.module));
      themeType = highlighter.themeType;
    }
    if (options === null || options === void 0 ? void 0 : options.fallback)
      ext.push(fallbackHighlighter.of(highlighter));
    else if (themeType)
      ext.push(highlighterFacet.computeN([EditorView.darkTheme], (state) => {
        return state.facet(EditorView.darkTheme) == (themeType == "dark") ? [highlighter] : [];
      }));
    else
      ext.push(highlighterFacet.of(highlighter));
    return ext;
  }
  var TreeHighlighter = class {
    constructor(view2) {
      this.markCache = /* @__PURE__ */ Object.create(null);
      this.tree = syntaxTree(view2.state);
      this.decorations = this.buildDeco(view2, getHighlighters(view2.state));
      this.decoratedTo = view2.viewport.to;
    }
    update(update) {
      let tree = syntaxTree(update.state), highlighters = getHighlighters(update.state);
      let styleChange = highlighters != getHighlighters(update.startState);
      let { viewport } = update.view, decoratedToMapped = update.changes.mapPos(this.decoratedTo, 1);
      if (tree.length < viewport.to && !styleChange && tree.type == this.tree.type && decoratedToMapped >= viewport.to) {
        this.decorations = this.decorations.map(update.changes);
        this.decoratedTo = decoratedToMapped;
      } else if (tree != this.tree || update.viewportChanged || styleChange) {
        this.tree = tree;
        this.decorations = this.buildDeco(update.view, highlighters);
        this.decoratedTo = viewport.to;
      }
    }
    buildDeco(view2, highlighters) {
      if (!highlighters || !this.tree.length)
        return Decoration.none;
      let builder = new RangeSetBuilder();
      for (let { from, to } of view2.visibleRanges) {
        highlightTree(this.tree, highlighters, (from2, to2, style) => {
          builder.add(from2, to2, this.markCache[style] || (this.markCache[style] = Decoration.mark({ class: style })));
        }, from, to);
      }
      return builder.finish();
    }
  };
  var treeHighlighter = /* @__PURE__ */ Prec.high(/* @__PURE__ */ ViewPlugin.fromClass(TreeHighlighter, {
    decorations: (v) => v.decorations
  }));
  var defaultHighlightStyle = /* @__PURE__ */ HighlightStyle.define([
    {
      tag: tags.meta,
      color: "#404740"
    },
    {
      tag: tags.link,
      textDecoration: "underline"
    },
    {
      tag: tags.heading,
      textDecoration: "underline",
      fontWeight: "bold"
    },
    {
      tag: tags.emphasis,
      fontStyle: "italic"
    },
    {
      tag: tags.strong,
      fontWeight: "bold"
    },
    {
      tag: tags.strikethrough,
      textDecoration: "line-through"
    },
    {
      tag: tags.keyword,
      color: "#708"
    },
    {
      tag: [tags.atom, tags.bool, tags.url, tags.contentSeparator, tags.labelName],
      color: "#219"
    },
    {
      tag: [tags.literal, tags.inserted],
      color: "#164"
    },
    {
      tag: [tags.string, tags.deleted],
      color: "#a11"
    },
    {
      tag: [tags.regexp, tags.escape, /* @__PURE__ */ tags.special(tags.string)],
      color: "#e40"
    },
    {
      tag: /* @__PURE__ */ tags.definition(tags.variableName),
      color: "#00f"
    },
    {
      tag: /* @__PURE__ */ tags.local(tags.variableName),
      color: "#30a"
    },
    {
      tag: [tags.typeName, tags.namespace],
      color: "#085"
    },
    {
      tag: tags.className,
      color: "#167"
    },
    {
      tag: [/* @__PURE__ */ tags.special(tags.variableName), tags.macroName],
      color: "#256"
    },
    {
      tag: /* @__PURE__ */ tags.definition(tags.propertyName),
      color: "#00c"
    },
    {
      tag: tags.comment,
      color: "#940"
    },
    {
      tag: tags.invalid,
      color: "#f00"
    }
  ]);
  var baseTheme2 = /* @__PURE__ */ EditorView.baseTheme({
    "&.cm-focused .cm-matchingBracket": { backgroundColor: "#328c8252" },
    "&.cm-focused .cm-nonmatchingBracket": { backgroundColor: "#bb555544" }
  });
  var DefaultScanDist = 1e4;
  var DefaultBrackets = "()[]{}";
  var bracketMatchingConfig = /* @__PURE__ */ Facet.define({
    combine(configs) {
      return combineConfig(configs, {
        afterCursor: true,
        brackets: DefaultBrackets,
        maxScanDistance: DefaultScanDist,
        renderMatch: defaultRenderMatch
      });
    }
  });
  var matchingMark = /* @__PURE__ */ Decoration.mark({ class: "cm-matchingBracket" });
  var nonmatchingMark = /* @__PURE__ */ Decoration.mark({ class: "cm-nonmatchingBracket" });
  function defaultRenderMatch(match) {
    let decorations2 = [];
    let mark = match.matched ? matchingMark : nonmatchingMark;
    decorations2.push(mark.range(match.start.from, match.start.to));
    if (match.end)
      decorations2.push(mark.range(match.end.from, match.end.to));
    return decorations2;
  }
  function bracketDeco(state) {
    let decorations2 = [];
    let config = state.facet(bracketMatchingConfig);
    for (let range of state.selection.ranges) {
      if (!range.empty)
        continue;
      let match = matchBrackets(state, range.head, -1, config) || range.head > 0 && matchBrackets(state, range.head - 1, 1, config) || config.afterCursor && (matchBrackets(state, range.head, 1, config) || range.head < state.doc.length && matchBrackets(state, range.head + 1, -1, config));
      if (match)
        decorations2 = decorations2.concat(config.renderMatch(match, state));
    }
    return Decoration.set(decorations2, true);
  }
  var bracketMatcher = /* @__PURE__ */ ViewPlugin.fromClass(class {
    constructor(view2) {
      this.paused = false;
      this.decorations = bracketDeco(view2.state);
    }
    update(update) {
      if (update.docChanged || update.selectionSet || this.paused) {
        if (update.view.composing) {
          this.decorations = this.decorations.map(update.changes);
          this.paused = true;
        } else {
          this.decorations = bracketDeco(update.state);
          this.paused = false;
        }
      }
    }
  }, {
    decorations: (v) => v.decorations
  });
  var bracketMatchingUnique = [
    bracketMatcher,
    baseTheme2
  ];
  function bracketMatching(config = {}) {
    return [bracketMatchingConfig.of(config), bracketMatchingUnique];
  }
  var bracketMatchingHandle = /* @__PURE__ */ new NodeProp();
  function matchingNodes(node, dir, brackets) {
    let byProp = node.prop(dir < 0 ? NodeProp.openedBy : NodeProp.closedBy);
    if (byProp)
      return byProp;
    if (node.name.length == 1) {
      let index = brackets.indexOf(node.name);
      if (index > -1 && index % 2 == (dir < 0 ? 1 : 0))
        return [brackets[index + dir]];
    }
    return null;
  }
  function findHandle(node) {
    let hasHandle = node.type.prop(bracketMatchingHandle);
    return hasHandle ? hasHandle(node.node) : node;
  }
  function matchBrackets(state, pos, dir, config = {}) {
    let maxScanDistance = config.maxScanDistance || DefaultScanDist, brackets = config.brackets || DefaultBrackets;
    let tree = syntaxTree(state), node = tree.resolveInner(pos, dir);
    for (let cur2 = node; cur2; cur2 = cur2.parent) {
      let matches = matchingNodes(cur2.type, dir, brackets);
      if (matches && cur2.from < cur2.to) {
        let handle = findHandle(cur2);
        if (handle && (dir > 0 ? pos >= handle.from && pos < handle.to : pos > handle.from && pos <= handle.to))
          return matchMarkedBrackets(state, pos, dir, cur2, handle, matches, brackets);
      }
    }
    return matchPlainBrackets(state, pos, dir, tree, node.type, maxScanDistance, brackets);
  }
  function matchMarkedBrackets(_state, _pos, dir, token, handle, matching, brackets) {
    let parent = token.parent, firstToken = { from: handle.from, to: handle.to };
    let depth = 0, cursor = parent === null || parent === void 0 ? void 0 : parent.cursor();
    if (cursor && (dir < 0 ? cursor.childBefore(token.from) : cursor.childAfter(token.to)))
      do {
        if (dir < 0 ? cursor.to <= token.from : cursor.from >= token.to) {
          if (depth == 0 && matching.indexOf(cursor.type.name) > -1 && cursor.from < cursor.to) {
            let endHandle = findHandle(cursor);
            return { start: firstToken, end: endHandle ? { from: endHandle.from, to: endHandle.to } : void 0, matched: true };
          } else if (matchingNodes(cursor.type, dir, brackets)) {
            depth++;
          } else if (matchingNodes(cursor.type, -dir, brackets)) {
            if (depth == 0) {
              let endHandle = findHandle(cursor);
              return {
                start: firstToken,
                end: endHandle && endHandle.from < endHandle.to ? { from: endHandle.from, to: endHandle.to } : void 0,
                matched: false
              };
            }
            depth--;
          }
        }
      } while (dir < 0 ? cursor.prevSibling() : cursor.nextSibling());
    return { start: firstToken, matched: false };
  }
  function matchPlainBrackets(state, pos, dir, tree, tokenType, maxScanDistance, brackets) {
    if (dir < 0 ? !pos : pos == state.doc.length)
      return null;
    let startCh = dir < 0 ? state.sliceDoc(pos - 1, pos) : state.sliceDoc(pos, pos + 1);
    let bracket2 = brackets.indexOf(startCh);
    if (bracket2 < 0 || bracket2 % 2 == 0 != dir > 0)
      return null;
    let startToken = { from: dir < 0 ? pos - 1 : pos, to: dir > 0 ? pos + 1 : pos };
    let iter = state.doc.iterRange(pos, dir > 0 ? state.doc.length : 0), depth = 0;
    for (let distance = 0; !iter.next().done && distance <= maxScanDistance; ) {
      let text = iter.value;
      if (dir < 0)
        distance += text.length;
      let basePos = pos + distance * dir;
      for (let pos2 = dir > 0 ? 0 : text.length - 1, end = dir > 0 ? text.length : -1; pos2 != end; pos2 += dir) {
        let found = brackets.indexOf(text[pos2]);
        if (found < 0 || tree.resolveInner(basePos + pos2, 1).type != tokenType)
          continue;
        if (found % 2 == 0 == dir > 0) {
          depth++;
        } else if (depth == 1) {
          return { start: startToken, end: { from: basePos + pos2, to: basePos + pos2 + 1 }, matched: found >> 1 == bracket2 >> 1 };
        } else {
          depth--;
        }
      }
      if (dir > 0)
        distance += text.length;
    }
    return iter.done ? { start: startToken, matched: false } : null;
  }
  var noTokens = /* @__PURE__ */ Object.create(null);
  var typeArray = [NodeType.none];
  var warned = [];
  var byTag = /* @__PURE__ */ Object.create(null);
  var defaultTable = /* @__PURE__ */ Object.create(null);
  for (let [legacyName, name2] of [
    ["variable", "variableName"],
    ["variable-2", "variableName.special"],
    ["string-2", "string.special"],
    ["def", "variableName.definition"],
    ["tag", "tagName"],
    ["attribute", "attributeName"],
    ["type", "typeName"],
    ["builtin", "variableName.standard"],
    ["qualifier", "modifier"],
    ["error", "invalid"],
    ["header", "heading"],
    ["property", "propertyName"]
  ])
    defaultTable[legacyName] = /* @__PURE__ */ createTokenType(noTokens, name2);
  function warnForPart(part, msg) {
    if (warned.indexOf(part) > -1)
      return;
    warned.push(part);
    console.warn(msg);
  }
  function createTokenType(extra, tagStr) {
    let tags$1 = [];
    for (let name3 of tagStr.split(" ")) {
      let found = [];
      for (let part of name3.split(".")) {
        let value = extra[part] || tags[part];
        if (!value) {
          warnForPart(part, `Unknown highlighting tag ${part}`);
        } else if (typeof value == "function") {
          if (!found.length)
            warnForPart(part, `Modifier ${part} used at start of tag`);
          else
            found = found.map(value);
        } else {
          if (found.length)
            warnForPart(part, `Tag ${part} used as modifier`);
          else
            found = Array.isArray(value) ? value : [value];
        }
      }
      for (let tag of found)
        tags$1.push(tag);
    }
    if (!tags$1.length)
      return 0;
    let name2 = tagStr.replace(/ /g, "_"), key = name2 + " " + tags$1.map((t2) => t2.id);
    let known = byTag[key];
    if (known)
      return known.id;
    let type = byTag[key] = NodeType.define({
      id: typeArray.length,
      name: name2,
      props: [styleTags({ [name2]: tags$1 })]
    });
    typeArray.push(type);
    return type.id;
  }
  var marks = {
    rtl: /* @__PURE__ */ Decoration.mark({ class: "cm-iso", inclusive: true, attributes: { dir: "rtl" }, bidiIsolate: Direction.RTL }),
    ltr: /* @__PURE__ */ Decoration.mark({ class: "cm-iso", inclusive: true, attributes: { dir: "ltr" }, bidiIsolate: Direction.LTR }),
    auto: /* @__PURE__ */ Decoration.mark({ class: "cm-iso", inclusive: true, attributes: { dir: "auto" }, bidiIsolate: null })
  };

  // node_modules/@lezer/lr/dist/index.js
  var Stack = class _Stack {
    /**
    @internal
    */
    constructor(p, stack, state, reducePos, pos, score2, buffer, bufferBase, curContext, lookAhead = 0, parent) {
      this.p = p;
      this.stack = stack;
      this.state = state;
      this.reducePos = reducePos;
      this.pos = pos;
      this.score = score2;
      this.buffer = buffer;
      this.bufferBase = bufferBase;
      this.curContext = curContext;
      this.lookAhead = lookAhead;
      this.parent = parent;
    }
    /**
    @internal
    */
    toString() {
      return `[${this.stack.filter((_, i2) => i2 % 3 == 0).concat(this.state)}]@${this.pos}${this.score ? "!" + this.score : ""}`;
    }
    // Start an empty stack
    /**
    @internal
    */
    static start(p, state, pos = 0) {
      let cx = p.parser.context;
      return new _Stack(p, [], state, pos, pos, 0, [], 0, cx ? new StackContext(cx, cx.start) : null, 0, null);
    }
    /**
    The stack's current [context](#lr.ContextTracker) value, if
    any. Its type will depend on the context tracker's type
    parameter, or it will be `null` if there is no context
    tracker.
    */
    get context() {
      return this.curContext ? this.curContext.context : null;
    }
    // Push a state onto the stack, tracking its start position as well
    // as the buffer base at that point.
    /**
    @internal
    */
    pushState(state, start) {
      this.stack.push(this.state, start, this.bufferBase + this.buffer.length);
      this.state = state;
    }
    // Apply a reduce action
    /**
    @internal
    */
    reduce(action) {
      var _a2;
      let depth = action >> 19, type = action & 65535;
      let { parser: parser2 } = this.p;
      let lookaheadRecord = this.reducePos < this.pos - 25 && this.setLookAhead(this.pos);
      let dPrec = parser2.dynamicPrecedence(type);
      if (dPrec)
        this.score += dPrec;
      if (depth == 0) {
        if (type < parser2.minRepeatTerm && this.reducePos < this.pos)
          this.reducePos = this.pos;
        this.pushState(parser2.getGoto(this.state, type, true), this.reducePos);
        if (type < parser2.minRepeatTerm)
          this.storeNode(type, this.reducePos, this.reducePos, lookaheadRecord ? 8 : 4, true);
        this.reduceContext(type, this.reducePos);
        return;
      }
      let base2 = this.stack.length - (depth - 1) * 3 - (action & 262144 ? 6 : 0);
      let start = base2 ? this.stack[base2 - 2] : this.p.ranges[0].from;
      if (type < parser2.minRepeatTerm && start == this.reducePos && this.reducePos < this.pos)
        this.reducePos = this.pos;
      let size = this.reducePos - start;
      if (size >= 2e3 && !((_a2 = this.p.parser.nodeSet.types[type]) === null || _a2 === void 0 ? void 0 : _a2.isAnonymous)) {
        if (start == this.p.lastBigReductionStart) {
          this.p.bigReductionCount++;
          this.p.lastBigReductionSize = size;
        } else if (this.p.lastBigReductionSize < size) {
          this.p.bigReductionCount = 1;
          this.p.lastBigReductionStart = start;
          this.p.lastBigReductionSize = size;
        }
      }
      let bufferBase = base2 ? this.stack[base2 - 1] : 0, count = this.bufferBase + this.buffer.length - bufferBase;
      if (type < parser2.minRepeatTerm || action & 131072) {
        let pos = parser2.stateFlag(
          this.state,
          1
          /* StateFlag.Skipped */
        ) ? this.pos : this.reducePos;
        this.storeNode(type, start, pos, count + 4, true);
      }
      if (action & 262144) {
        this.state = this.stack[base2];
      } else {
        let baseStateID = this.stack[base2 - 3];
        this.state = parser2.getGoto(baseStateID, type, true);
      }
      while (this.stack.length > base2)
        this.stack.pop();
      this.reduceContext(type, start);
    }
    // Shift a value into the buffer
    /**
    @internal
    */
    storeNode(term, start, end, size = 4, mustSink = false) {
      if (term == 0 && (!this.stack.length || this.stack[this.stack.length - 1] < this.buffer.length + this.bufferBase)) {
        let top2 = this.buffer.length;
        if (top2 > 0 && this.buffer[top2 - 4] == 0 && this.buffer[top2 - 1] > -1) {
          if (start == end)
            return;
          if (this.buffer[top2 - 2] >= start) {
            this.buffer[top2 - 2] = end;
            return;
          }
        }
      }
      if (!mustSink || this.pos == end) {
        this.buffer.push(term, start, end, size);
      } else {
        let index = this.buffer.length;
        if (index > 0 && (this.buffer[index - 4] != 0 || this.buffer[index - 1] < 0)) {
          let mustMove = false;
          for (let scan = index; scan > 0 && this.buffer[scan - 2] > end; scan -= 4) {
            if (this.buffer[scan - 1] >= 0) {
              mustMove = true;
              break;
            }
          }
          if (mustMove)
            while (index > 0 && this.buffer[index - 2] > end) {
              this.buffer[index] = this.buffer[index - 4];
              this.buffer[index + 1] = this.buffer[index - 3];
              this.buffer[index + 2] = this.buffer[index - 2];
              this.buffer[index + 3] = this.buffer[index - 1];
              index -= 4;
              if (size > 4)
                size -= 4;
            }
        }
        this.buffer[index] = term;
        this.buffer[index + 1] = start;
        this.buffer[index + 2] = end;
        this.buffer[index + 3] = size;
      }
    }
    // Apply a shift action
    /**
    @internal
    */
    shift(action, type, start, end) {
      if (action & 131072) {
        this.pushState(action & 65535, this.pos);
      } else if ((action & 262144) == 0) {
        let nextState = action, { parser: parser2 } = this.p;
        this.pos = end;
        let skipped = parser2.stateFlag(
          nextState,
          1
          /* StateFlag.Skipped */
        );
        if (!skipped && (end > start || type <= parser2.maxNode))
          this.reducePos = end;
        this.pushState(nextState, skipped ? start : Math.min(start, this.reducePos));
        this.shiftContext(type, start);
        if (type <= parser2.maxNode)
          this.buffer.push(type, start, end, 4);
      } else {
        this.pos = end;
        this.shiftContext(type, start);
        if (type <= this.p.parser.maxNode)
          this.buffer.push(type, start, end, 4);
      }
    }
    // Apply an action
    /**
    @internal
    */
    apply(action, next, nextStart, nextEnd) {
      if (action & 65536)
        this.reduce(action);
      else
        this.shift(action, next, nextStart, nextEnd);
    }
    // Add a prebuilt (reused) node into the buffer.
    /**
    @internal
    */
    useNode(value, next, start) {
      let index = this.p.reused.length - 1;
      if (index < 0 || this.p.reused[index] != value) {
        this.p.reused.push(value);
        index++;
      }
      let end = this.reducePos = this.pos = start + value.length;
      this.pushState(next, start);
      this.buffer.push(
        index,
        start,
        end,
        -1
        /* size == -1 means this is a reused value */
      );
      if (this.curContext)
        this.updateContext(this.curContext.tracker.reuse(this.curContext.context, value, this, this.p.stream.reset(this.pos - value.length)));
    }
    // Split the stack. Due to the buffer sharing and the fact
    // that `this.stack` tends to stay quite shallow, this isn't very
    // expensive.
    /**
    @internal
    */
    split() {
      let parent = this;
      let off = parent.buffer.length;
      if (off && parent.buffer[off - 4] == 0)
        off -= 4;
      while (off > 0 && parent.buffer[off - 2] > parent.reducePos)
        off -= 4;
      let buffer = parent.buffer.slice(off), base2 = parent.bufferBase + off;
      while (parent && base2 == parent.bufferBase)
        parent = parent.parent;
      return new _Stack(this.p, this.stack.slice(), this.state, this.reducePos, this.pos, this.score, buffer, base2, this.curContext, this.lookAhead, parent);
    }
    // Try to recover from an error by 'deleting' (ignoring) one token.
    /**
    @internal
    */
    recoverByDelete(next, nextEnd) {
      let isNode = next <= this.p.parser.maxNode;
      if (isNode)
        this.storeNode(next, this.pos, nextEnd, 4);
      this.storeNode(0, this.pos, nextEnd, isNode ? 8 : 4);
      this.pos = this.reducePos = nextEnd;
      this.score -= 190;
    }
    /**
    Check if the given term would be able to be shifted (optionally
    after some reductions) on this stack. This can be useful for
    external tokenizers that want to make sure they only provide a
    given token when it applies.
    */
    canShift(term) {
      for (let sim = new SimulatedStack(this); ; ) {
        let action = this.p.parser.stateSlot(
          sim.state,
          4
          /* ParseState.DefaultReduce */
        ) || this.p.parser.hasAction(sim.state, term);
        if (action == 0)
          return false;
        if ((action & 65536) == 0)
          return true;
        sim.reduce(action);
      }
    }
    // Apply up to Recover.MaxNext recovery actions that conceptually
    // inserts some missing token or rule.
    /**
    @internal
    */
    recoverByInsert(next) {
      if (this.stack.length >= 300)
        return [];
      let nextStates = this.p.parser.nextStates(this.state);
      if (nextStates.length > 4 << 1 || this.stack.length >= 120) {
        let best = [];
        for (let i2 = 0, s; i2 < nextStates.length; i2 += 2) {
          if ((s = nextStates[i2 + 1]) != this.state && this.p.parser.hasAction(s, next))
            best.push(nextStates[i2], s);
        }
        if (this.stack.length < 120)
          for (let i2 = 0; best.length < 4 << 1 && i2 < nextStates.length; i2 += 2) {
            let s = nextStates[i2 + 1];
            if (!best.some((v, i3) => i3 & 1 && v == s))
              best.push(nextStates[i2], s);
          }
        nextStates = best;
      }
      let result = [];
      for (let i2 = 0; i2 < nextStates.length && result.length < 4; i2 += 2) {
        let s = nextStates[i2 + 1];
        if (s == this.state)
          continue;
        let stack = this.split();
        stack.pushState(s, this.pos);
        stack.storeNode(0, stack.pos, stack.pos, 4, true);
        stack.shiftContext(nextStates[i2], this.pos);
        stack.reducePos = this.pos;
        stack.score -= 200;
        result.push(stack);
      }
      return result;
    }
    // Force a reduce, if possible. Return false if that can't
    // be done.
    /**
    @internal
    */
    forceReduce() {
      let { parser: parser2 } = this.p;
      let reduce = parser2.stateSlot(
        this.state,
        5
        /* ParseState.ForcedReduce */
      );
      if ((reduce & 65536) == 0)
        return false;
      if (!parser2.validAction(this.state, reduce)) {
        let depth = reduce >> 19, term = reduce & 65535;
        let target = this.stack.length - depth * 3;
        if (target < 0 || parser2.getGoto(this.stack[target], term, false) < 0) {
          let backup = this.findForcedReduction();
          if (backup == null)
            return false;
          reduce = backup;
        }
        this.storeNode(0, this.pos, this.pos, 4, true);
        this.score -= 100;
      }
      this.reducePos = this.pos;
      this.reduce(reduce);
      return true;
    }
    /**
    Try to scan through the automaton to find some kind of reduction
    that can be applied. Used when the regular ForcedReduce field
    isn't a valid action. @internal
    */
    findForcedReduction() {
      let { parser: parser2 } = this.p, seen = [];
      let explore = (state, depth) => {
        if (seen.includes(state))
          return;
        seen.push(state);
        return parser2.allActions(state, (action) => {
          if (action & (262144 | 131072)) ;
          else if (action & 65536) {
            let rDepth = (action >> 19) - depth;
            if (rDepth > 1) {
              let term = action & 65535, target = this.stack.length - rDepth * 3;
              if (target >= 0 && parser2.getGoto(this.stack[target], term, false) >= 0)
                return rDepth << 19 | 65536 | term;
            }
          } else {
            let found = explore(action, depth + 1);
            if (found != null)
              return found;
          }
        });
      };
      return explore(this.state, 0);
    }
    /**
    @internal
    */
    forceAll() {
      while (!this.p.parser.stateFlag(
        this.state,
        2
        /* StateFlag.Accepting */
      )) {
        if (!this.forceReduce()) {
          this.storeNode(0, this.pos, this.pos, 4, true);
          break;
        }
      }
      return this;
    }
    /**
    Check whether this state has no further actions (assumed to be a direct descendant of the
    top state, since any other states must be able to continue
    somehow). @internal
    */
    get deadEnd() {
      if (this.stack.length != 3)
        return false;
      let { parser: parser2 } = this.p;
      return parser2.data[parser2.stateSlot(
        this.state,
        1
        /* ParseState.Actions */
      )] == 65535 && !parser2.stateSlot(
        this.state,
        4
        /* ParseState.DefaultReduce */
      );
    }
    /**
    Restart the stack (put it back in its start state). Only safe
    when this.stack.length == 3 (state is directly below the top
    state). @internal
    */
    restart() {
      this.storeNode(0, this.pos, this.pos, 4, true);
      this.state = this.stack[0];
      this.stack.length = 0;
    }
    /**
    @internal
    */
    sameState(other) {
      if (this.state != other.state || this.stack.length != other.stack.length)
        return false;
      for (let i2 = 0; i2 < this.stack.length; i2 += 3)
        if (this.stack[i2] != other.stack[i2])
          return false;
      return true;
    }
    /**
    Get the parser used by this stack.
    */
    get parser() {
      return this.p.parser;
    }
    /**
    Test whether a given dialect (by numeric ID, as exported from
    the terms file) is enabled.
    */
    dialectEnabled(dialectID) {
      return this.p.parser.dialect.flags[dialectID];
    }
    shiftContext(term, start) {
      if (this.curContext)
        this.updateContext(this.curContext.tracker.shift(this.curContext.context, term, this, this.p.stream.reset(start)));
    }
    reduceContext(term, start) {
      if (this.curContext)
        this.updateContext(this.curContext.tracker.reduce(this.curContext.context, term, this, this.p.stream.reset(start)));
    }
    /**
    @internal
    */
    emitContext() {
      let last2 = this.buffer.length - 1;
      if (last2 < 0 || this.buffer[last2] != -3)
        this.storeNode(this.curContext.hash, this.reducePos, this.reducePos, -3, true);
    }
    /**
    @internal
    */
    emitLookAhead() {
      let last2 = this.buffer.length - 1;
      if (last2 < 0 || this.buffer[last2] != -4)
        this.buffer.push(this.lookAhead, this.pos, this.pos, -4);
    }
    updateContext(context) {
      if (context != this.curContext.context) {
        let newCx = new StackContext(this.curContext.tracker, context);
        if (newCx.hash != this.curContext.hash)
          this.emitContext();
        this.curContext = newCx;
      }
    }
    /**
    @internal
    */
    setLookAhead(lookAhead) {
      if (lookAhead <= this.lookAhead)
        return false;
      this.emitLookAhead();
      this.lookAhead = lookAhead;
      return true;
    }
    /**
    @internal
    */
    close() {
      if (this.curContext && this.curContext.tracker.strict)
        this.emitContext();
      if (this.lookAhead > 0)
        this.emitLookAhead();
    }
  };
  var StackContext = class {
    constructor(tracker, context) {
      this.tracker = tracker;
      this.context = context;
      this.hash = tracker.strict ? tracker.hash(context) : 0;
    }
  };
  var SimulatedStack = class {
    constructor(start) {
      this.start = start;
      this.state = start.state;
      this.stack = start.stack;
      this.base = this.stack.length;
    }
    reduce(action) {
      let term = action & 65535, depth = action >> 19;
      if (depth == 0) {
        if (this.stack == this.start.stack)
          this.stack = this.stack.slice();
        this.stack.push(this.state, 0, 0);
        this.base += 3;
      } else {
        this.base -= (depth - 1) * 3;
      }
      let goto = this.start.p.parser.getGoto(this.stack[this.base - 3], term, true);
      this.state = goto;
    }
  };
  var StackBufferCursor = class _StackBufferCursor {
    constructor(stack, pos, index) {
      this.stack = stack;
      this.pos = pos;
      this.index = index;
      this.buffer = stack.buffer;
      if (this.index == 0)
        this.maybeNext();
    }
    static create(stack, pos = stack.bufferBase + stack.buffer.length) {
      return new _StackBufferCursor(stack, pos, pos - stack.bufferBase);
    }
    maybeNext() {
      let next = this.stack.parent;
      if (next != null) {
        this.index = this.stack.bufferBase - next.bufferBase;
        this.stack = next;
        this.buffer = next.buffer;
      }
    }
    get id() {
      return this.buffer[this.index - 4];
    }
    get start() {
      return this.buffer[this.index - 3];
    }
    get end() {
      return this.buffer[this.index - 2];
    }
    get size() {
      return this.buffer[this.index - 1];
    }
    next() {
      this.index -= 4;
      this.pos -= 4;
      if (this.index == 0)
        this.maybeNext();
    }
    fork() {
      return new _StackBufferCursor(this.stack, this.pos, this.index);
    }
  };
  function decodeArray(input, Type2 = Uint16Array) {
    if (typeof input != "string")
      return input;
    let array = null;
    for (let pos = 0, out = 0; pos < input.length; ) {
      let value = 0;
      for (; ; ) {
        let next = input.charCodeAt(pos++), stop = false;
        if (next == 126) {
          value = 65535;
          break;
        }
        if (next >= 92)
          next--;
        if (next >= 34)
          next--;
        let digit = next - 32;
        if (digit >= 46) {
          digit -= 46;
          stop = true;
        }
        value += digit;
        if (stop)
          break;
        value *= 46;
      }
      if (array)
        array[out++] = value;
      else
        array = new Type2(value);
    }
    return array;
  }
  var CachedToken = class {
    constructor() {
      this.start = -1;
      this.value = -1;
      this.end = -1;
      this.extended = -1;
      this.lookAhead = 0;
      this.mask = 0;
      this.context = 0;
    }
  };
  var nullToken = new CachedToken();
  var InputStream = class {
    /**
    @internal
    */
    constructor(input, ranges) {
      this.input = input;
      this.ranges = ranges;
      this.chunk = "";
      this.chunkOff = 0;
      this.chunk2 = "";
      this.chunk2Pos = 0;
      this.next = -1;
      this.token = nullToken;
      this.rangeIndex = 0;
      this.pos = this.chunkPos = ranges[0].from;
      this.range = ranges[0];
      this.end = ranges[ranges.length - 1].to;
      this.readNext();
    }
    /**
    @internal
    */
    resolveOffset(offset, assoc) {
      let range = this.range, index = this.rangeIndex;
      let pos = this.pos + offset;
      while (pos < range.from) {
        if (!index)
          return null;
        let next = this.ranges[--index];
        pos -= range.from - next.to;
        range = next;
      }
      while (assoc < 0 ? pos > range.to : pos >= range.to) {
        if (index == this.ranges.length - 1)
          return null;
        let next = this.ranges[++index];
        pos += next.from - range.to;
        range = next;
      }
      return pos;
    }
    /**
    @internal
    */
    clipPos(pos) {
      if (pos >= this.range.from && pos < this.range.to)
        return pos;
      for (let range of this.ranges)
        if (range.to > pos)
          return Math.max(pos, range.from);
      return this.end;
    }
    /**
    Look at a code unit near the stream position. `.peek(0)` equals
    `.next`, `.peek(-1)` gives you the previous character, and so
    on.
    
    Note that looking around during tokenizing creates dependencies
    on potentially far-away content, which may reduce the
    effectiveness incremental parsing—when looking forward—or even
    cause invalid reparses when looking backward more than 25 code
    units, since the library does not track lookbehind.
    */
    peek(offset) {
      let idx = this.chunkOff + offset, pos, result;
      if (idx >= 0 && idx < this.chunk.length) {
        pos = this.pos + offset;
        result = this.chunk.charCodeAt(idx);
      } else {
        let resolved = this.resolveOffset(offset, 1);
        if (resolved == null)
          return -1;
        pos = resolved;
        if (pos >= this.chunk2Pos && pos < this.chunk2Pos + this.chunk2.length) {
          result = this.chunk2.charCodeAt(pos - this.chunk2Pos);
        } else {
          let i2 = this.rangeIndex, range = this.range;
          while (range.to <= pos)
            range = this.ranges[++i2];
          this.chunk2 = this.input.chunk(this.chunk2Pos = pos);
          if (pos + this.chunk2.length > range.to)
            this.chunk2 = this.chunk2.slice(0, range.to - pos);
          result = this.chunk2.charCodeAt(0);
        }
      }
      if (pos >= this.token.lookAhead)
        this.token.lookAhead = pos + 1;
      return result;
    }
    /**
    Accept a token. By default, the end of the token is set to the
    current stream position, but you can pass an offset (relative to
    the stream position) to change that.
    */
    acceptToken(token, endOffset = 0) {
      let end = endOffset ? this.resolveOffset(endOffset, -1) : this.pos;
      if (end == null || end < this.token.start)
        throw new RangeError("Token end out of bounds");
      this.token.value = token;
      this.token.end = end;
    }
    /**
    Accept a token ending at a specific given position.
    */
    acceptTokenTo(token, endPos) {
      this.token.value = token;
      this.token.end = endPos;
    }
    getChunk() {
      if (this.pos >= this.chunk2Pos && this.pos < this.chunk2Pos + this.chunk2.length) {
        let { chunk, chunkPos } = this;
        this.chunk = this.chunk2;
        this.chunkPos = this.chunk2Pos;
        this.chunk2 = chunk;
        this.chunk2Pos = chunkPos;
        this.chunkOff = this.pos - this.chunkPos;
      } else {
        this.chunk2 = this.chunk;
        this.chunk2Pos = this.chunkPos;
        let nextChunk = this.input.chunk(this.pos);
        let end = this.pos + nextChunk.length;
        this.chunk = end > this.range.to ? nextChunk.slice(0, this.range.to - this.pos) : nextChunk;
        this.chunkPos = this.pos;
        this.chunkOff = 0;
      }
    }
    readNext() {
      if (this.chunkOff >= this.chunk.length) {
        this.getChunk();
        if (this.chunkOff == this.chunk.length)
          return this.next = -1;
      }
      return this.next = this.chunk.charCodeAt(this.chunkOff);
    }
    /**
    Move the stream forward N (defaults to 1) code units. Returns
    the new value of [`next`](#lr.InputStream.next).
    */
    advance(n = 1) {
      this.chunkOff += n;
      while (this.pos + n >= this.range.to) {
        if (this.rangeIndex == this.ranges.length - 1)
          return this.setDone();
        n -= this.range.to - this.pos;
        this.range = this.ranges[++this.rangeIndex];
        this.pos = this.range.from;
      }
      this.pos += n;
      if (this.pos >= this.token.lookAhead)
        this.token.lookAhead = this.pos + 1;
      return this.readNext();
    }
    setDone() {
      this.pos = this.chunkPos = this.end;
      this.range = this.ranges[this.rangeIndex = this.ranges.length - 1];
      this.chunk = "";
      return this.next = -1;
    }
    /**
    @internal
    */
    reset(pos, token) {
      if (token) {
        this.token = token;
        token.start = pos;
        token.lookAhead = pos + 1;
        token.value = token.extended = -1;
      } else {
        this.token = nullToken;
      }
      if (this.pos != pos) {
        this.pos = pos;
        if (pos == this.end) {
          this.setDone();
          return this;
        }
        while (pos < this.range.from)
          this.range = this.ranges[--this.rangeIndex];
        while (pos >= this.range.to)
          this.range = this.ranges[++this.rangeIndex];
        if (pos >= this.chunkPos && pos < this.chunkPos + this.chunk.length) {
          this.chunkOff = pos - this.chunkPos;
        } else {
          this.chunk = "";
          this.chunkOff = 0;
        }
        this.readNext();
      }
      return this;
    }
    /**
    @internal
    */
    read(from, to) {
      if (from >= this.chunkPos && to <= this.chunkPos + this.chunk.length)
        return this.chunk.slice(from - this.chunkPos, to - this.chunkPos);
      if (from >= this.chunk2Pos && to <= this.chunk2Pos + this.chunk2.length)
        return this.chunk2.slice(from - this.chunk2Pos, to - this.chunk2Pos);
      if (from >= this.range.from && to <= this.range.to)
        return this.input.read(from, to);
      let result = "";
      for (let r of this.ranges) {
        if (r.from >= to)
          break;
        if (r.to > from)
          result += this.input.read(Math.max(r.from, from), Math.min(r.to, to));
      }
      return result;
    }
  };
  var TokenGroup = class {
    constructor(data, id) {
      this.data = data;
      this.id = id;
    }
    token(input, stack) {
      let { parser: parser2 } = stack.p;
      readToken(this.data, input, stack, this.id, parser2.data, parser2.tokenPrecTable);
    }
  };
  TokenGroup.prototype.contextual = TokenGroup.prototype.fallback = TokenGroup.prototype.extend = false;
  var LocalTokenGroup = class {
    constructor(data, precTable, elseToken) {
      this.precTable = precTable;
      this.elseToken = elseToken;
      this.data = typeof data == "string" ? decodeArray(data) : data;
    }
    token(input, stack) {
      let start = input.pos, skipped = 0;
      for (; ; ) {
        let atEof = input.next < 0, nextPos = input.resolveOffset(1, 1);
        readToken(this.data, input, stack, 0, this.data, this.precTable);
        if (input.token.value > -1)
          break;
        if (this.elseToken == null)
          return;
        if (!atEof)
          skipped++;
        if (nextPos == null)
          break;
        input.reset(nextPos, input.token);
      }
      if (skipped) {
        input.reset(start, input.token);
        input.acceptToken(this.elseToken, skipped);
      }
    }
  };
  LocalTokenGroup.prototype.contextual = TokenGroup.prototype.fallback = TokenGroup.prototype.extend = false;
  var ExternalTokenizer = class {
    /**
    Create a tokenizer. The first argument is the function that,
    given an input stream, scans for the types of tokens it
    recognizes at the stream's position, and calls
    [`acceptToken`](#lr.InputStream.acceptToken) when it finds
    one.
    */
    constructor(token, options = {}) {
      this.token = token;
      this.contextual = !!options.contextual;
      this.fallback = !!options.fallback;
      this.extend = !!options.extend;
    }
  };
  function readToken(data, input, stack, group, precTable, precOffset) {
    let state = 0, groupMask = 1 << group, { dialect: dialect2 } = stack.p.parser;
    scan: for (; ; ) {
      if ((groupMask & data[state]) == 0)
        break;
      let accEnd = data[state + 1];
      for (let i2 = state + 3; i2 < accEnd; i2 += 2)
        if ((data[i2 + 1] & groupMask) > 0) {
          let term = data[i2];
          if (dialect2.allows(term) && (input.token.value == -1 || input.token.value == term || overrides(term, input.token.value, precTable, precOffset))) {
            input.acceptToken(term);
            break;
          }
        }
      let next = input.next, low = 0, high = data[state + 2];
      if (input.next < 0 && high > low && data[accEnd + high * 3 - 3] == 65535) {
        state = data[accEnd + high * 3 - 1];
        continue scan;
      }
      for (; low < high; ) {
        let mid = low + high >> 1;
        let index = accEnd + mid + (mid << 1);
        let from = data[index], to = data[index + 1] || 65536;
        if (next < from)
          high = mid;
        else if (next >= to)
          low = mid + 1;
        else {
          state = data[index + 2];
          input.advance();
          continue scan;
        }
      }
      break;
    }
  }
  function findOffset(data, start, term) {
    for (let i2 = start, next; (next = data[i2]) != 65535; i2++)
      if (next == term)
        return i2 - start;
    return -1;
  }
  function overrides(token, prev, tableData, tableOffset) {
    let iPrev = findOffset(tableData, tableOffset, prev);
    return iPrev < 0 || findOffset(tableData, tableOffset, token) < iPrev;
  }
  var verbose = typeof process != "undefined" && process.env && /\bparse\b/.test(process.env.LOG);
  var stackIDs = null;
  function cutAt(tree, pos, side) {
    let cursor = tree.cursor(IterMode.IncludeAnonymous);
    cursor.moveTo(pos);
    for (; ; ) {
      if (!(side < 0 ? cursor.childBefore(pos) : cursor.childAfter(pos)))
        for (; ; ) {
          if ((side < 0 ? cursor.to < pos : cursor.from > pos) && !cursor.type.isError)
            return side < 0 ? Math.max(0, Math.min(
              cursor.to - 1,
              pos - 25
              /* Lookahead.Margin */
            )) : Math.min(tree.length, Math.max(
              cursor.from + 1,
              pos + 25
              /* Lookahead.Margin */
            ));
          if (side < 0 ? cursor.prevSibling() : cursor.nextSibling())
            break;
          if (!cursor.parent())
            return side < 0 ? 0 : tree.length;
        }
    }
  }
  var FragmentCursor = class {
    constructor(fragments, minRepeat) {
      this.fragments = fragments;
      this.minRepeat = minRepeat;
      this.i = 0;
      this.fragment = null;
      this.safeFrom = -1;
      this.safeTo = -1;
      this.trees = [];
      this.start = [];
      this.index = [];
      this.lastRepeat = null;
      this.lastRepeatPos = -1;
      this.nextFragment();
    }
    nextFragment() {
      let fr = this.fragment = this.i == this.fragments.length ? null : this.fragments[this.i++];
      if (fr) {
        this.safeFrom = fr.openStart ? cutAt(fr.tree, fr.from + fr.offset, 1) - fr.offset : fr.from;
        this.safeTo = fr.openEnd ? cutAt(fr.tree, fr.to + fr.offset, -1) - fr.offset : fr.to;
        while (this.trees.length) {
          this.trees.pop();
          this.start.pop();
          this.index.pop();
        }
        this.trees.push(fr.tree);
        this.start.push(-fr.offset);
        this.index.push(0);
        this.nextStart = this.safeFrom;
      } else {
        this.nextStart = 1e9;
      }
    }
    // `pos` must be >= any previously given `pos` for this cursor
    nodeAt(pos) {
      if (pos < this.nextStart)
        return null;
      while (this.fragment && this.safeTo <= pos)
        this.nextFragment();
      if (!this.fragment)
        return null;
      for (; ; ) {
        let last2 = this.trees.length - 1;
        if (last2 < 0) {
          this.nextFragment();
          return null;
        }
        if (pos < this.safeFrom)
          return null;
        let top2 = this.trees[last2], index = this.index[last2];
        if (index == top2.children.length) {
          this.trees.pop();
          this.start.pop();
          this.index.pop();
          continue;
        }
        let next = top2.children[index];
        let start = this.start[last2] + top2.positions[index];
        if (start > pos) {
          this.nextStart = start;
          return null;
        }
        if (next instanceof Tree) {
          let storeRepeat = start > this.lastRepeatPos && next.type.id >= this.minRepeat;
          if (start == pos || storeRepeat) {
            let end = start + next.length, lookahead;
            if (start >= this.safeFrom && end <= this.safeTo && (!(lookahead = next.prop(NodeProp.lookAhead)) || end + lookahead < this.fragment.to)) {
              if (storeRepeat) {
                this.lastRepeat = next;
                this.lastRepeatPos = start;
              }
              if (start == pos)
                return next;
            }
          }
          this.index[last2]++;
          if (start + next.length >= Math.max(this.safeFrom, pos)) {
            this.trees.push(next);
            this.start.push(start);
            this.index.push(0);
          }
        } else {
          this.index[last2]++;
          this.nextStart = start + next.length;
        }
      }
    }
  };
  var TokenCache = class {
    constructor(parser2, stream) {
      this.stream = stream;
      this.tokens = [];
      this.mainToken = null;
      this.actions = [];
      this.tokens = parser2.tokenizers.map((_) => new CachedToken());
    }
    getActions(stack) {
      let actionIndex = 0;
      let main = null;
      let { parser: parser2 } = stack.p, { tokenizers } = parser2;
      let mask = parser2.stateSlot(
        stack.state,
        3
        /* ParseState.TokenizerMask */
      );
      let context = stack.curContext ? stack.curContext.hash : 0;
      let lookAhead = 0;
      for (let i2 = 0; i2 < tokenizers.length; i2++) {
        if ((1 << i2 & mask) == 0)
          continue;
        let tokenizer = tokenizers[i2], token = this.tokens[i2];
        if (main && !tokenizer.fallback)
          continue;
        if (tokenizer.contextual || token.start != stack.pos || token.mask != mask || token.context != context) {
          this.updateCachedToken(token, tokenizer, stack);
          token.mask = mask;
          token.context = context;
        }
        if (token.lookAhead > token.end + 25)
          lookAhead = Math.max(token.lookAhead, lookAhead);
        if (token.value != 0) {
          let startIndex = actionIndex;
          if (token.extended > -1)
            actionIndex = this.addActions(stack, token.extended, token.end, actionIndex);
          actionIndex = this.addActions(stack, token.value, token.end, actionIndex);
          if (!tokenizer.extend) {
            main = token;
            if (actionIndex > startIndex)
              break;
          }
        }
      }
      while (this.actions.length > actionIndex)
        this.actions.pop();
      if (lookAhead)
        stack.setLookAhead(lookAhead);
      if (!main && stack.pos == this.stream.end) {
        main = new CachedToken();
        main.value = stack.p.parser.eofTerm;
        main.start = main.end = stack.pos;
        actionIndex = this.addActions(stack, main.value, main.end, actionIndex);
      }
      this.mainToken = main;
      return this.actions;
    }
    getMainToken(stack) {
      if (this.mainToken)
        return this.mainToken;
      let main = new CachedToken(), { pos, p } = stack;
      main.start = pos;
      main.end = Math.min(pos + 1, p.stream.end);
      main.value = pos == p.stream.end ? p.parser.eofTerm : 0;
      return main;
    }
    updateCachedToken(token, tokenizer, stack) {
      let start = this.stream.clipPos(stack.pos);
      tokenizer.token(this.stream.reset(start, token), stack);
      if (token.value > -1) {
        let { parser: parser2 } = stack.p;
        for (let i2 = 0; i2 < parser2.specialized.length; i2++)
          if (parser2.specialized[i2] == token.value) {
            let result = parser2.specializers[i2](this.stream.read(token.start, token.end), stack);
            if (result >= 0 && stack.p.parser.dialect.allows(result >> 1)) {
              if ((result & 1) == 0)
                token.value = result >> 1;
              else
                token.extended = result >> 1;
              break;
            }
          }
      } else {
        token.value = 0;
        token.end = this.stream.clipPos(start + 1);
      }
    }
    putAction(action, token, end, index) {
      for (let i2 = 0; i2 < index; i2 += 3)
        if (this.actions[i2] == action)
          return index;
      this.actions[index++] = action;
      this.actions[index++] = token;
      this.actions[index++] = end;
      return index;
    }
    addActions(stack, token, end, index) {
      let { state } = stack, { parser: parser2 } = stack.p, { data } = parser2;
      for (let set = 0; set < 2; set++) {
        for (let i2 = parser2.stateSlot(
          state,
          set ? 2 : 1
          /* ParseState.Actions */
        ); ; i2 += 3) {
          if (data[i2] == 65535) {
            if (data[i2 + 1] == 1) {
              i2 = pair(data, i2 + 2);
            } else {
              if (index == 0 && data[i2 + 1] == 2)
                index = this.putAction(pair(data, i2 + 2), token, end, index);
              break;
            }
          }
          if (data[i2] == token)
            index = this.putAction(pair(data, i2 + 1), token, end, index);
        }
      }
      return index;
    }
  };
  var Parse = class {
    constructor(parser2, input, fragments, ranges) {
      this.parser = parser2;
      this.input = input;
      this.ranges = ranges;
      this.recovering = 0;
      this.nextStackID = 9812;
      this.minStackPos = 0;
      this.reused = [];
      this.stoppedAt = null;
      this.lastBigReductionStart = -1;
      this.lastBigReductionSize = 0;
      this.bigReductionCount = 0;
      this.stream = new InputStream(input, ranges);
      this.tokens = new TokenCache(parser2, this.stream);
      this.topTerm = parser2.top[1];
      let { from } = ranges[0];
      this.stacks = [Stack.start(this, parser2.top[0], from)];
      this.fragments = fragments.length && this.stream.end - from > parser2.bufferLength * 4 ? new FragmentCursor(fragments, parser2.minRepeatTerm) : null;
    }
    get parsedPos() {
      return this.minStackPos;
    }
    // Move the parser forward. This will process all parse stacks at
    // `this.pos` and try to advance them to a further position. If no
    // stack for such a position is found, it'll start error-recovery.
    //
    // When the parse is finished, this will return a syntax tree. When
    // not, it returns `null`.
    advance() {
      let stacks = this.stacks, pos = this.minStackPos;
      let newStacks = this.stacks = [];
      let stopped, stoppedTokens;
      if (this.bigReductionCount > 300 && stacks.length == 1) {
        let [s] = stacks;
        while (s.forceReduce() && s.stack.length && s.stack[s.stack.length - 2] >= this.lastBigReductionStart) {
        }
        this.bigReductionCount = this.lastBigReductionSize = 0;
      }
      for (let i2 = 0; i2 < stacks.length; i2++) {
        let stack = stacks[i2];
        for (; ; ) {
          this.tokens.mainToken = null;
          if (stack.pos > pos) {
            newStacks.push(stack);
          } else if (this.advanceStack(stack, newStacks, stacks)) {
            continue;
          } else {
            if (!stopped) {
              stopped = [];
              stoppedTokens = [];
            }
            stopped.push(stack);
            let tok = this.tokens.getMainToken(stack);
            stoppedTokens.push(tok.value, tok.end);
          }
          break;
        }
      }
      if (!newStacks.length) {
        let finished = stopped && findFinished(stopped);
        if (finished) {
          if (verbose)
            console.log("Finish with " + this.stackID(finished));
          return this.stackToTree(finished);
        }
        if (this.parser.strict) {
          if (verbose && stopped)
            console.log("Stuck with token " + (this.tokens.mainToken ? this.parser.getName(this.tokens.mainToken.value) : "none"));
          throw new SyntaxError("No parse at " + pos);
        }
        if (!this.recovering)
          this.recovering = 5;
      }
      if (this.recovering && stopped) {
        let finished = this.stoppedAt != null && stopped[0].pos > this.stoppedAt ? stopped[0] : this.runRecovery(stopped, stoppedTokens, newStacks);
        if (finished) {
          if (verbose)
            console.log("Force-finish " + this.stackID(finished));
          return this.stackToTree(finished.forceAll());
        }
      }
      if (this.recovering) {
        let maxRemaining = this.recovering == 1 ? 1 : this.recovering * 3;
        if (newStacks.length > maxRemaining) {
          newStacks.sort((a, b) => b.score - a.score);
          while (newStacks.length > maxRemaining)
            newStacks.pop();
        }
        if (newStacks.some((s) => s.reducePos > pos))
          this.recovering--;
      } else if (newStacks.length > 1) {
        outer: for (let i2 = 0; i2 < newStacks.length - 1; i2++) {
          let stack = newStacks[i2];
          for (let j = i2 + 1; j < newStacks.length; j++) {
            let other = newStacks[j];
            if (stack.sameState(other) || stack.buffer.length > 500 && other.buffer.length > 500) {
              if ((stack.score - other.score || stack.buffer.length - other.buffer.length) > 0) {
                newStacks.splice(j--, 1);
              } else {
                newStacks.splice(i2--, 1);
                continue outer;
              }
            }
          }
        }
        if (newStacks.length > 12) {
          newStacks.sort((a, b) => b.score - a.score);
          newStacks.splice(
            12,
            newStacks.length - 12
            /* Rec.MaxStackCount */
          );
        }
      }
      this.minStackPos = newStacks[0].pos;
      for (let i2 = 1; i2 < newStacks.length; i2++)
        if (newStacks[i2].pos < this.minStackPos)
          this.minStackPos = newStacks[i2].pos;
      return null;
    }
    stopAt(pos) {
      if (this.stoppedAt != null && this.stoppedAt < pos)
        throw new RangeError("Can't move stoppedAt forward");
      this.stoppedAt = pos;
    }
    // See if a given tree, or a descendant right at its start, can be
    // reused in the given stack.
    tryReuse(stack, start, tree, repeatOnly) {
      if (!tree)
        return null;
      let strictCx = stack.curContext && stack.curContext.tracker.strict, cxHash = strictCx ? stack.curContext.hash : 0;
      for (; tree; ) {
        let match = this.parser.nodeSet.types[tree.type.id] != tree.type ? -1 : this.parser.getGoto(stack.state, tree.type.id);
        if (match > -1 && tree.length && (!strictCx || (tree.prop(NodeProp.contextHash) || 0) == cxHash)) {
          stack.useNode(tree, match, start);
          return tree;
        }
        if (tree.children.length == 0 || tree.positions[0] > 0)
          break;
        let inner = tree.children[0];
        if (inner instanceof Tree && (!repeatOnly || inner.type.id >= this.parser.minRepeatTerm))
          tree = inner;
        else
          break;
      }
      return null;
    }
    // Returns an updated version of the given stack, or null if the
    // stack can't advance normally. When `split` and `stacks` are
    // given, stacks split off by ambiguous operations will be pushed to
    // `split`, or added to `stacks` if they move `pos` forward.
    advanceStack(stack, stacks, split) {
      let start = stack.pos, { parser: parser2 } = this;
      let base2 = verbose ? this.stackID(stack) + " -> " : "";
      if (this.stoppedAt != null && start > this.stoppedAt)
        return stack.forceReduce() ? stack : null;
      if (this.fragments) {
        let reused = stack.reducePos < start && stack.buffer.length && stack.buffer[stack.buffer.length - 2] <= stack.reducePos && this.fragments.lastRepeatPos == stack.reducePos && this.tryReuse(stack, stack.reducePos, this.fragments.lastRepeat, true) || this.tryReuse(stack, start, this.fragments.nodeAt(start), false);
        if (reused) {
          if (verbose)
            console.log(base2 + this.stackID(stack) + ` (via reuse of ${parser2.getName(reused.type.id)})`);
          return true;
        }
      }
      let defaultReduce = parser2.stateSlot(
        stack.state,
        4
        /* ParseState.DefaultReduce */
      );
      if (defaultReduce > 0) {
        stack.reduce(defaultReduce);
        if (verbose)
          console.log(base2 + this.stackID(stack) + ` (via always-reduce ${parser2.getName(
            defaultReduce & 65535
            /* Action.ValueMask */
          )})`);
        return true;
      }
      if (stack.stack.length >= 8400) {
        while (stack.stack.length > 6e3 && stack.forceReduce()) {
        }
      }
      let actions = this.tokens.getActions(stack);
      for (let i2 = 0; i2 < actions.length; ) {
        let action = actions[i2++], term = actions[i2++], end = actions[i2++];
        let last2 = i2 == actions.length || !split;
        let localStack = last2 ? stack : stack.split();
        let main = this.tokens.mainToken;
        localStack.apply(action, term, main ? main.start : localStack.pos, end);
        if (verbose)
          console.log(base2 + this.stackID(localStack) + ` (via ${(action & 65536) == 0 ? "shift" : `reduce of ${parser2.getName(
            action & 65535
            /* Action.ValueMask */
          )}`} for ${parser2.getName(term)} @ ${start}${localStack == stack ? "" : ", split"})`);
        if (last2)
          return true;
        else if (localStack.pos > start)
          stacks.push(localStack);
        else
          split.push(localStack);
      }
      return false;
    }
    // Advance a given stack forward as far as it will go. Returns the
    // (possibly updated) stack if it got stuck, or null if it moved
    // forward and was given to `pushStackDedup`.
    advanceFully(stack, newStacks) {
      let pos = stack.pos;
      for (; ; ) {
        if (!this.advanceStack(stack, null, null))
          return false;
        if (stack.pos > pos) {
          pushStackDedup(stack, newStacks);
          return true;
        }
      }
    }
    runRecovery(stacks, tokens2, newStacks) {
      let finished = null, restarted = false;
      for (let i2 = 0; i2 < stacks.length; i2++) {
        let stack = stacks[i2], token = tokens2[i2 << 1], tokenEnd = tokens2[(i2 << 1) + 1];
        let base2 = verbose ? this.stackID(stack) + " -> " : "";
        if (stack.deadEnd) {
          if (restarted)
            continue;
          restarted = true;
          stack.restart();
          if (verbose)
            console.log(base2 + this.stackID(stack) + " (restarted)");
          let done = this.advanceFully(stack, newStacks);
          if (done)
            continue;
        }
        let force = stack.split(), forceBase = base2;
        for (let j = 0; j < 10 && force.forceReduce(); j++) {
          if (verbose)
            console.log(forceBase + this.stackID(force) + " (via force-reduce)");
          let done = this.advanceFully(force, newStacks);
          if (done)
            break;
          if (verbose)
            forceBase = this.stackID(force) + " -> ";
        }
        for (let insert2 of stack.recoverByInsert(token)) {
          if (verbose)
            console.log(base2 + this.stackID(insert2) + " (via recover-insert)");
          this.advanceFully(insert2, newStacks);
        }
        if (this.stream.end > stack.pos) {
          if (tokenEnd == stack.pos) {
            tokenEnd++;
            token = 0;
          }
          stack.recoverByDelete(token, tokenEnd);
          if (verbose)
            console.log(base2 + this.stackID(stack) + ` (via recover-delete ${this.parser.getName(token)})`);
          pushStackDedup(stack, newStacks);
        } else if (!finished || finished.score < force.score) {
          finished = force;
        }
      }
      return finished;
    }
    // Convert the stack's buffer to a syntax tree.
    stackToTree(stack) {
      stack.close();
      return Tree.build({
        buffer: StackBufferCursor.create(stack),
        nodeSet: this.parser.nodeSet,
        topID: this.topTerm,
        maxBufferLength: this.parser.bufferLength,
        reused: this.reused,
        start: this.ranges[0].from,
        length: stack.pos - this.ranges[0].from,
        minRepeatType: this.parser.minRepeatTerm
      });
    }
    stackID(stack) {
      let id = (stackIDs || (stackIDs = /* @__PURE__ */ new WeakMap())).get(stack);
      if (!id)
        stackIDs.set(stack, id = String.fromCodePoint(this.nextStackID++));
      return id + stack;
    }
  };
  function pushStackDedup(stack, newStacks) {
    for (let i2 = 0; i2 < newStacks.length; i2++) {
      let other = newStacks[i2];
      if (other.pos == stack.pos && other.sameState(stack)) {
        if (newStacks[i2].score < stack.score)
          newStacks[i2] = stack;
        return;
      }
    }
    newStacks.push(stack);
  }
  var Dialect = class {
    constructor(source, flags, disabled) {
      this.source = source;
      this.flags = flags;
      this.disabled = disabled;
    }
    allows(term) {
      return !this.disabled || this.disabled[term] == 0;
    }
  };
  var LRParser = class _LRParser extends Parser {
    /**
    @internal
    */
    constructor(spec) {
      super();
      this.wrappers = [];
      if (spec.version != 14)
        throw new RangeError(`Parser version (${spec.version}) doesn't match runtime version (${14})`);
      let nodeNames = spec.nodeNames.split(" ");
      this.minRepeatTerm = nodeNames.length;
      for (let i2 = 0; i2 < spec.repeatNodeCount; i2++)
        nodeNames.push("");
      let topTerms = Object.keys(spec.topRules).map((r) => spec.topRules[r][1]);
      let nodeProps = [];
      for (let i2 = 0; i2 < nodeNames.length; i2++)
        nodeProps.push([]);
      function setProp(nodeID, prop, value) {
        nodeProps[nodeID].push([prop, prop.deserialize(String(value))]);
      }
      if (spec.nodeProps)
        for (let propSpec of spec.nodeProps) {
          let prop = propSpec[0];
          if (typeof prop == "string")
            prop = NodeProp[prop];
          for (let i2 = 1; i2 < propSpec.length; ) {
            let next = propSpec[i2++];
            if (next >= 0) {
              setProp(next, prop, propSpec[i2++]);
            } else {
              let value = propSpec[i2 + -next];
              for (let j = -next; j > 0; j--)
                setProp(propSpec[i2++], prop, value);
              i2++;
            }
          }
        }
      this.nodeSet = new NodeSet(nodeNames.map((name2, i2) => NodeType.define({
        name: i2 >= this.minRepeatTerm ? void 0 : name2,
        id: i2,
        props: nodeProps[i2],
        top: topTerms.indexOf(i2) > -1,
        error: i2 == 0,
        skipped: spec.skippedNodes && spec.skippedNodes.indexOf(i2) > -1
      })));
      if (spec.propSources)
        this.nodeSet = this.nodeSet.extend(...spec.propSources);
      this.strict = false;
      this.bufferLength = DefaultBufferLength;
      let tokenArray = decodeArray(spec.tokenData);
      this.context = spec.context;
      this.specializerSpecs = spec.specialized || [];
      this.specialized = new Uint16Array(this.specializerSpecs.length);
      for (let i2 = 0; i2 < this.specializerSpecs.length; i2++)
        this.specialized[i2] = this.specializerSpecs[i2].term;
      this.specializers = this.specializerSpecs.map(getSpecializer);
      this.states = decodeArray(spec.states, Uint32Array);
      this.data = decodeArray(spec.stateData);
      this.goto = decodeArray(spec.goto);
      this.maxTerm = spec.maxTerm;
      this.tokenizers = spec.tokenizers.map((value) => typeof value == "number" ? new TokenGroup(tokenArray, value) : value);
      this.topRules = spec.topRules;
      this.dialects = spec.dialects || {};
      this.dynamicPrecedences = spec.dynamicPrecedences || null;
      this.tokenPrecTable = spec.tokenPrec;
      this.termNames = spec.termNames || null;
      this.maxNode = this.nodeSet.types.length - 1;
      this.dialect = this.parseDialect();
      this.top = this.topRules[Object.keys(this.topRules)[0]];
    }
    createParse(input, fragments, ranges) {
      let parse = new Parse(this, input, fragments, ranges);
      for (let w of this.wrappers)
        parse = w(parse, input, fragments, ranges);
      return parse;
    }
    /**
    Get a goto table entry @internal
    */
    getGoto(state, term, loose = false) {
      let table = this.goto;
      if (term >= table[0])
        return -1;
      for (let pos = table[term + 1]; ; ) {
        let groupTag = table[pos++], last2 = groupTag & 1;
        let target = table[pos++];
        if (last2 && loose)
          return target;
        for (let end = pos + (groupTag >> 1); pos < end; pos++)
          if (table[pos] == state)
            return target;
        if (last2)
          return -1;
      }
    }
    /**
    Check if this state has an action for a given terminal @internal
    */
    hasAction(state, terminal) {
      let data = this.data;
      for (let set = 0; set < 2; set++) {
        for (let i2 = this.stateSlot(
          state,
          set ? 2 : 1
          /* ParseState.Actions */
        ), next; ; i2 += 3) {
          if ((next = data[i2]) == 65535) {
            if (data[i2 + 1] == 1)
              next = data[i2 = pair(data, i2 + 2)];
            else if (data[i2 + 1] == 2)
              return pair(data, i2 + 2);
            else
              break;
          }
          if (next == terminal || next == 0)
            return pair(data, i2 + 1);
        }
      }
      return 0;
    }
    /**
    @internal
    */
    stateSlot(state, slot) {
      return this.states[state * 6 + slot];
    }
    /**
    @internal
    */
    stateFlag(state, flag) {
      return (this.stateSlot(
        state,
        0
        /* ParseState.Flags */
      ) & flag) > 0;
    }
    /**
    @internal
    */
    validAction(state, action) {
      return !!this.allActions(state, (a) => a == action ? true : null);
    }
    /**
    @internal
    */
    allActions(state, action) {
      let deflt = this.stateSlot(
        state,
        4
        /* ParseState.DefaultReduce */
      );
      let result = deflt ? action(deflt) : void 0;
      for (let i2 = this.stateSlot(
        state,
        1
        /* ParseState.Actions */
      ); result == null; i2 += 3) {
        if (this.data[i2] == 65535) {
          if (this.data[i2 + 1] == 1)
            i2 = pair(this.data, i2 + 2);
          else
            break;
        }
        result = action(pair(this.data, i2 + 1));
      }
      return result;
    }
    /**
    Get the states that can follow this one through shift actions or
    goto jumps. @internal
    */
    nextStates(state) {
      let result = [];
      for (let i2 = this.stateSlot(
        state,
        1
        /* ParseState.Actions */
      ); ; i2 += 3) {
        if (this.data[i2] == 65535) {
          if (this.data[i2 + 1] == 1)
            i2 = pair(this.data, i2 + 2);
          else
            break;
        }
        if ((this.data[i2 + 2] & 65536 >> 16) == 0) {
          let value = this.data[i2 + 1];
          if (!result.some((v, i3) => i3 & 1 && v == value))
            result.push(this.data[i2], value);
        }
      }
      return result;
    }
    /**
    Configure the parser. Returns a new parser instance that has the
    given settings modified. Settings not provided in `config` are
    kept from the original parser.
    */
    configure(config) {
      let copy = Object.assign(Object.create(_LRParser.prototype), this);
      if (config.props)
        copy.nodeSet = this.nodeSet.extend(...config.props);
      if (config.top) {
        let info = this.topRules[config.top];
        if (!info)
          throw new RangeError(`Invalid top rule name ${config.top}`);
        copy.top = info;
      }
      if (config.tokenizers)
        copy.tokenizers = this.tokenizers.map((t2) => {
          let found = config.tokenizers.find((r) => r.from == t2);
          return found ? found.to : t2;
        });
      if (config.specializers) {
        copy.specializers = this.specializers.slice();
        copy.specializerSpecs = this.specializerSpecs.map((s, i2) => {
          let found = config.specializers.find((r) => r.from == s.external);
          if (!found)
            return s;
          let spec = Object.assign(Object.assign({}, s), { external: found.to });
          copy.specializers[i2] = getSpecializer(spec);
          return spec;
        });
      }
      if (config.contextTracker)
        copy.context = config.contextTracker;
      if (config.dialect)
        copy.dialect = this.parseDialect(config.dialect);
      if (config.strict != null)
        copy.strict = config.strict;
      if (config.wrap)
        copy.wrappers = copy.wrappers.concat(config.wrap);
      if (config.bufferLength != null)
        copy.bufferLength = config.bufferLength;
      return copy;
    }
    /**
    Tells you whether any [parse wrappers](#lr.ParserConfig.wrap)
    are registered for this parser.
    */
    hasWrappers() {
      return this.wrappers.length > 0;
    }
    /**
    Returns the name associated with a given term. This will only
    work for all terms when the parser was generated with the
    `--names` option. By default, only the names of tagged terms are
    stored.
    */
    getName(term) {
      return this.termNames ? this.termNames[term] : String(term <= this.maxNode && this.nodeSet.types[term].name || term);
    }
    /**
    The eof term id is always allocated directly after the node
    types. @internal
    */
    get eofTerm() {
      return this.maxNode + 1;
    }
    /**
    The type of top node produced by the parser.
    */
    get topNode() {
      return this.nodeSet.types[this.top[1]];
    }
    /**
    @internal
    */
    dynamicPrecedence(term) {
      let prec2 = this.dynamicPrecedences;
      return prec2 == null ? 0 : prec2[term] || 0;
    }
    /**
    @internal
    */
    parseDialect(dialect2) {
      let values = Object.keys(this.dialects), flags = values.map(() => false);
      if (dialect2)
        for (let part of dialect2.split(" ")) {
          let id = values.indexOf(part);
          if (id >= 0)
            flags[id] = true;
        }
      let disabled = null;
      for (let i2 = 0; i2 < values.length; i2++)
        if (!flags[i2]) {
          for (let j = this.dialects[values[i2]], id; (id = this.data[j++]) != 65535; )
            (disabled || (disabled = new Uint8Array(this.maxTerm + 1)))[id] = 1;
        }
      return new Dialect(dialect2, flags, disabled);
    }
    /**
    Used by the output of the parser generator. Not available to
    user code. @hide
    */
    static deserialize(spec) {
      return new _LRParser(spec);
    }
  };
  function pair(data, off) {
    return data[off] | data[off + 1] << 16;
  }
  function findFinished(stacks) {
    let best = null;
    for (let stack of stacks) {
      let stopped = stack.p.stoppedAt;
      if ((stack.pos == stack.p.stream.end || stopped != null && stack.pos > stopped) && stack.p.parser.stateFlag(
        stack.state,
        2
        /* StateFlag.Accepting */
      ) && (!best || best.score < stack.score))
        best = stack;
    }
    return best;
  }
  function getSpecializer(spec) {
    if (spec.external) {
      let mask = spec.extend ? 1 : 0;
      return (value, stack) => spec.external(value, stack) << 1 | mask;
    }
    return spec.get;
  }

  // node_modules/@codemirror/autocomplete/dist/index.js
  var CompletionContext = class {
    /**
    Create a new completion context. (Mostly useful for testing
    completion sources—in the editor, the extension will create
    these for you.)
    */
    constructor(state, pos, explicit, view2) {
      this.state = state;
      this.pos = pos;
      this.explicit = explicit;
      this.view = view2;
      this.abortListeners = [];
      this.abortOnDocChange = false;
    }
    /**
    Get the extent, content, and (if there is a token) type of the
    token before `this.pos`.
    */
    tokenBefore(types2) {
      let token = syntaxTree(this.state).resolveInner(this.pos, -1);
      while (token && types2.indexOf(token.name) < 0)
        token = token.parent;
      return token ? {
        from: token.from,
        to: this.pos,
        text: this.state.sliceDoc(token.from, this.pos),
        type: token.type
      } : null;
    }
    /**
    Get the match of the given expression directly before the
    cursor.
    */
    matchBefore(expr) {
      let line = this.state.doc.lineAt(this.pos);
      let start = Math.max(line.from, this.pos - 250);
      let str = line.text.slice(start - line.from, this.pos - line.from);
      let found = str.search(ensureAnchor(expr, false));
      return found < 0 ? null : { from: start + found, to: this.pos, text: str.slice(found) };
    }
    /**
    Yields true when the query has been aborted. Can be useful in
    asynchronous queries to avoid doing work that will be ignored.
    */
    get aborted() {
      return this.abortListeners == null;
    }
    /**
    Allows you to register abort handlers, which will be called when
    the query is
    [aborted](https://codemirror.net/6/docs/ref/#autocomplete.CompletionContext.aborted).
    
    By default, running queries will not be aborted for regular
    typing or backspacing, on the assumption that they are likely to
    return a result with a
    [`validFor`](https://codemirror.net/6/docs/ref/#autocomplete.CompletionResult.validFor) field that
    allows the result to be used after all. Passing `onDocChange:
    true` will cause this query to be aborted for any document
    change.
    */
    addEventListener(type, listener, options) {
      if (type == "abort" && this.abortListeners) {
        this.abortListeners.push(listener);
        if (options && options.onDocChange)
          this.abortOnDocChange = true;
      }
    }
  };
  function toSet(chars) {
    let flat = Object.keys(chars).join("");
    let words = /\w/.test(flat);
    if (words)
      flat = flat.replace(/\w/g, "");
    return `[${words ? "\\w" : ""}${flat.replace(/[^\w\s]/g, "\\$&")}]`;
  }
  function prefixMatch(options) {
    let first = /* @__PURE__ */ Object.create(null), rest = /* @__PURE__ */ Object.create(null);
    for (let { label } of options) {
      first[label[0]] = true;
      for (let i2 = 1; i2 < label.length; i2++)
        rest[label[i2]] = true;
    }
    let source = toSet(first) + toSet(rest) + "*$";
    return [new RegExp("^" + source), new RegExp(source)];
  }
  function completeFromList(list) {
    let options = list.map((o) => typeof o == "string" ? { label: o } : o);
    let [validFor, match] = options.every((o) => /^\w+$/.test(o.label)) ? [/\w*$/, /\w+$/] : prefixMatch(options);
    return (context) => {
      let token = context.matchBefore(match);
      return token || context.explicit ? { from: token ? token.from : context.pos, options, validFor } : null;
    };
  }
  var Option = class {
    constructor(completion, source, match, score2) {
      this.completion = completion;
      this.source = source;
      this.match = match;
      this.score = score2;
    }
  };
  function cur(state) {
    return state.selection.main.from;
  }
  function ensureAnchor(expr, start) {
    var _a2;
    let { source } = expr;
    let addStart = start && source[0] != "^", addEnd = source[source.length - 1] != "$";
    if (!addStart && !addEnd)
      return expr;
    return new RegExp(`${addStart ? "^" : ""}(?:${source})${addEnd ? "$" : ""}`, (_a2 = expr.flags) !== null && _a2 !== void 0 ? _a2 : expr.ignoreCase ? "i" : "");
  }
  var pickedCompletion = /* @__PURE__ */ Annotation.define();
  function insertCompletionText(state, text, from, to) {
    let { main } = state.selection, fromOff = from - main.from, toOff = to - main.from;
    return {
      ...state.changeByRange((range) => {
        if (range != main && from != to && state.sliceDoc(range.from + fromOff, range.from + toOff) != state.sliceDoc(from, to))
          return { range };
        let lines = state.toText(text);
        return {
          changes: { from: range.from + fromOff, to: to == main.from ? range.to : range.from + toOff, insert: lines },
          range: EditorSelection.cursor(range.from + fromOff + lines.length)
        };
      }),
      scrollIntoView: true,
      userEvent: "input.complete"
    };
  }
  var SourceCache = /* @__PURE__ */ new WeakMap();
  function asSource(source) {
    if (!Array.isArray(source))
      return source;
    let known = SourceCache.get(source);
    if (!known)
      SourceCache.set(source, known = completeFromList(source));
    return known;
  }
  var startCompletionEffect = /* @__PURE__ */ StateEffect.define();
  var closeCompletionEffect = /* @__PURE__ */ StateEffect.define();
  var FuzzyMatcher = class {
    constructor(pattern) {
      this.pattern = pattern;
      this.chars = [];
      this.folded = [];
      this.any = [];
      this.precise = [];
      this.byWord = [];
      this.score = 0;
      this.matched = [];
      for (let p = 0; p < pattern.length; ) {
        let char = codePointAt2(pattern, p), size = codePointSize2(char);
        this.chars.push(char);
        let part = pattern.slice(p, p + size), upper = part.toUpperCase();
        this.folded.push(codePointAt2(upper == part ? part.toLowerCase() : upper, 0));
        p += size;
      }
      this.astral = pattern.length != this.chars.length;
    }
    ret(score2, matched) {
      this.score = score2;
      this.matched = matched;
      return this;
    }
    // Matches a given word (completion) against the pattern (input).
    // Will return a boolean indicating whether there was a match and,
    // on success, set `this.score` to the score, `this.matched` to an
    // array of `from, to` pairs indicating the matched parts of `word`.
    //
    // The score is a number that is more negative the worse the match
    // is. See `Penalty` above.
    match(word) {
      if (this.pattern.length == 0)
        return this.ret(-100, []);
      if (word.length < this.pattern.length)
        return null;
      let { chars, folded, any, precise, byWord } = this;
      if (chars.length == 1) {
        let first = codePointAt2(word, 0), firstSize = codePointSize2(first);
        let score2 = firstSize == word.length ? 0 : -100;
        if (first == chars[0]) ;
        else if (first == folded[0])
          score2 += -200;
        else
          return null;
        return this.ret(score2, [0, firstSize]);
      }
      let direct = word.indexOf(this.pattern);
      if (direct == 0)
        return this.ret(word.length == this.pattern.length ? 0 : -100, [0, this.pattern.length]);
      let len = chars.length, anyTo = 0;
      if (direct < 0) {
        for (let i2 = 0, e = Math.min(word.length, 200); i2 < e && anyTo < len; ) {
          let next = codePointAt2(word, i2);
          if (next == chars[anyTo] || next == folded[anyTo])
            any[anyTo++] = i2;
          i2 += codePointSize2(next);
        }
        if (anyTo < len)
          return null;
      }
      let preciseTo = 0;
      let byWordTo = 0, byWordFolded = false;
      let adjacentTo = 0, adjacentStart = -1, adjacentEnd = -1;
      let hasLower = /[a-z]/.test(word), wordAdjacent = true;
      for (let i2 = 0, e = Math.min(word.length, 200), prevType = 0; i2 < e && byWordTo < len; ) {
        let next = codePointAt2(word, i2);
        if (direct < 0) {
          if (preciseTo < len && next == chars[preciseTo])
            precise[preciseTo++] = i2;
          if (adjacentTo < len) {
            if (next == chars[adjacentTo] || next == folded[adjacentTo]) {
              if (adjacentTo == 0)
                adjacentStart = i2;
              adjacentEnd = i2 + 1;
              adjacentTo++;
            } else {
              adjacentTo = 0;
            }
          }
        }
        let ch, type = next < 255 ? next >= 48 && next <= 57 || next >= 97 && next <= 122 ? 2 : next >= 65 && next <= 90 ? 1 : 0 : (ch = fromCodePoint(next)) != ch.toLowerCase() ? 1 : ch != ch.toUpperCase() ? 2 : 0;
        if (!i2 || type == 1 && hasLower || prevType == 0 && type != 0) {
          if (chars[byWordTo] == next || folded[byWordTo] == next && (byWordFolded = true))
            byWord[byWordTo++] = i2;
          else if (byWord.length)
            wordAdjacent = false;
        }
        prevType = type;
        i2 += codePointSize2(next);
      }
      if (byWordTo == len && byWord[0] == 0 && wordAdjacent)
        return this.result(-100 + (byWordFolded ? -200 : 0), byWord, word);
      if (adjacentTo == len && adjacentStart == 0)
        return this.ret(-200 - word.length + (adjacentEnd == word.length ? 0 : -100), [0, adjacentEnd]);
      if (direct > -1)
        return this.ret(-700 - word.length, [direct, direct + this.pattern.length]);
      if (adjacentTo == len)
        return this.ret(-200 + -700 - word.length, [adjacentStart, adjacentEnd]);
      if (byWordTo == len)
        return this.result(-100 + (byWordFolded ? -200 : 0) + -700 + (wordAdjacent ? 0 : -1100), byWord, word);
      return chars.length == 2 ? null : this.result((any[0] ? -700 : 0) + -200 + -1100, any, word);
    }
    result(score2, positions, word) {
      let result = [], i2 = 0;
      for (let pos of positions) {
        let to = pos + (this.astral ? codePointSize2(codePointAt2(word, pos)) : 1);
        if (i2 && result[i2 - 1] == pos)
          result[i2 - 1] = to;
        else {
          result[i2++] = pos;
          result[i2++] = to;
        }
      }
      return this.ret(score2 - word.length, result);
    }
  };
  var StrictMatcher = class {
    constructor(pattern) {
      this.pattern = pattern;
      this.matched = [];
      this.score = 0;
      this.folded = pattern.toLowerCase();
    }
    match(word) {
      if (word.length < this.pattern.length)
        return null;
      let start = word.slice(0, this.pattern.length);
      let match = start == this.pattern ? 0 : start.toLowerCase() == this.folded ? -200 : null;
      if (match == null)
        return null;
      this.matched = [0, start.length];
      this.score = match + (word.length == this.pattern.length ? 0 : -100);
      return this;
    }
  };
  var completionConfig = /* @__PURE__ */ Facet.define({
    combine(configs) {
      return combineConfig(configs, {
        activateOnTyping: true,
        activateOnCompletion: () => false,
        activateOnTypingDelay: 100,
        selectOnOpen: true,
        override: null,
        closeOnBlur: true,
        maxRenderedOptions: 100,
        defaultKeymap: true,
        tooltipClass: () => "",
        optionClass: () => "",
        aboveCursor: false,
        icons: true,
        addToOptions: [],
        positionInfo: defaultPositionInfo,
        filterStrict: false,
        compareCompletions: (a, b) => (a.sortText || a.label).localeCompare(b.sortText || b.label),
        interactionDelay: 75,
        updateSyncTime: 100
      }, {
        defaultKeymap: (a, b) => a && b,
        closeOnBlur: (a, b) => a && b,
        icons: (a, b) => a && b,
        tooltipClass: (a, b) => (c) => joinClass(a(c), b(c)),
        optionClass: (a, b) => (c) => joinClass(a(c), b(c)),
        addToOptions: (a, b) => a.concat(b),
        filterStrict: (a, b) => a || b
      });
    }
  });
  function joinClass(a, b) {
    return a ? b ? a + " " + b : a : b;
  }
  function defaultPositionInfo(view2, list, option, info, space, tooltip) {
    let rtl = view2.textDirection == Direction.RTL, left = rtl, narrow = false;
    let side = "top", offset, maxWidth;
    let spaceLeft = list.left - space.left, spaceRight = space.right - list.right;
    let infoWidth = info.right - info.left, infoHeight = info.bottom - info.top;
    if (left && spaceLeft < Math.min(infoWidth, spaceRight))
      left = false;
    else if (!left && spaceRight < Math.min(infoWidth, spaceLeft))
      left = true;
    if (infoWidth <= (left ? spaceLeft : spaceRight)) {
      offset = Math.max(space.top, Math.min(option.top, space.bottom - infoHeight)) - list.top;
      maxWidth = Math.min(400, left ? spaceLeft : spaceRight);
    } else {
      narrow = true;
      maxWidth = Math.min(
        400,
        (rtl ? list.right : space.right - list.left) - 30
        /* Info.Margin */
      );
      let spaceBelow = space.bottom - list.bottom;
      if (spaceBelow >= infoHeight || spaceBelow > list.top) {
        offset = option.bottom - list.top;
      } else {
        side = "bottom";
        offset = list.bottom - option.top;
      }
    }
    let scaleY = (list.bottom - list.top) / tooltip.offsetHeight;
    let scaleX = (list.right - list.left) / tooltip.offsetWidth;
    return {
      style: `${side}: ${offset / scaleY}px; max-width: ${maxWidth / scaleX}px`,
      class: "cm-completionInfo-" + (narrow ? rtl ? "left-narrow" : "right-narrow" : left ? "left" : "right")
    };
  }
  var setSelectedEffect = /* @__PURE__ */ StateEffect.define();
  function optionContent(config) {
    let content2 = config.addToOptions.slice();
    if (config.icons)
      content2.push({
        render(completion) {
          let icon = document.createElement("div");
          icon.classList.add("cm-completionIcon");
          if (completion.type)
            icon.classList.add(...completion.type.split(/\s+/g).map((cls) => "cm-completionIcon-" + cls));
          icon.setAttribute("aria-hidden", "true");
          return icon;
        },
        position: 20
      });
    content2.push({
      render(completion, _s, _v, match) {
        let labelElt = document.createElement("span");
        labelElt.className = "cm-completionLabel";
        let label = completion.displayLabel || completion.label, off = 0;
        for (let j = 0; j < match.length; ) {
          let from = match[j++], to = match[j++];
          if (from > off)
            labelElt.appendChild(document.createTextNode(label.slice(off, from)));
          let span = labelElt.appendChild(document.createElement("span"));
          span.appendChild(document.createTextNode(label.slice(from, to)));
          span.className = "cm-completionMatchedText";
          off = to;
        }
        if (off < label.length)
          labelElt.appendChild(document.createTextNode(label.slice(off)));
        return labelElt;
      },
      position: 50
    }, {
      render(completion) {
        if (!completion.detail)
          return null;
        let detailElt = document.createElement("span");
        detailElt.className = "cm-completionDetail";
        detailElt.textContent = completion.detail;
        return detailElt;
      },
      position: 80
    });
    return content2.sort((a, b) => a.position - b.position).map((a) => a.render);
  }
  function rangeAroundSelected(total, selected, max) {
    if (total <= max)
      return { from: 0, to: total };
    if (selected < 0)
      selected = 0;
    if (selected <= total >> 1) {
      let off2 = Math.floor(selected / max);
      return { from: off2 * max, to: (off2 + 1) * max };
    }
    let off = Math.ceil((total - selected) / max);
    return { from: total - off * max, to: total - (off - 1) * max };
  }
  var CompletionTooltip = class {
    constructor(view2, stateField, applyCompletion2) {
      this.view = view2;
      this.stateField = stateField;
      this.applyCompletion = applyCompletion2;
      this.info = null;
      this.infoDestroy = null;
      this.placeInfoReq = {
        read: () => this.measureInfo(),
        write: (pos) => this.placeInfo(pos),
        key: this
      };
      this.space = null;
      this.currentClass = "";
      let cState = view2.state.field(stateField);
      let { options, selected } = cState.open;
      let config = view2.state.facet(completionConfig);
      this.optionContent = optionContent(config);
      this.optionClass = config.optionClass;
      this.tooltipClass = config.tooltipClass;
      this.range = rangeAroundSelected(options.length, selected, config.maxRenderedOptions);
      this.dom = document.createElement("div");
      this.dom.className = "cm-tooltip-autocomplete";
      this.updateTooltipClass(view2.state);
      this.dom.addEventListener("mousedown", (e) => {
        let { options: options2 } = view2.state.field(stateField).open;
        for (let dom = e.target, match; dom && dom != this.dom; dom = dom.parentNode) {
          if (dom.nodeName == "LI" && (match = /-(\d+)$/.exec(dom.id)) && +match[1] < options2.length) {
            this.applyCompletion(view2, options2[+match[1]]);
            e.preventDefault();
            return;
          }
        }
        if (e.target == this.list) {
          let move = this.list.classList.contains("cm-completionListIncompleteTop") && e.clientY < this.list.firstChild.getBoundingClientRect().top ? this.range.from - 1 : this.list.classList.contains("cm-completionListIncompleteBottom") && e.clientY > this.list.lastChild.getBoundingClientRect().bottom ? this.range.to : null;
          if (move != null) {
            view2.dispatch({ effects: setSelectedEffect.of(move) });
            e.preventDefault();
          }
        }
      });
      this.dom.addEventListener("focusout", (e) => {
        let state = view2.state.field(this.stateField, false);
        if (state && state.tooltip && view2.state.facet(completionConfig).closeOnBlur && e.relatedTarget != view2.contentDOM)
          view2.dispatch({ effects: closeCompletionEffect.of(null) });
      });
      this.showOptions(options, cState.id);
    }
    mount() {
      this.updateSel();
    }
    showOptions(options, id) {
      if (this.list)
        this.list.remove();
      this.list = this.dom.appendChild(this.createListBox(options, id, this.range));
      this.list.addEventListener("scroll", () => {
        if (this.info)
          this.view.requestMeasure(this.placeInfoReq);
      });
    }
    update(update) {
      var _a2;
      let cState = update.state.field(this.stateField);
      let prevState = update.startState.field(this.stateField);
      this.updateTooltipClass(update.state);
      if (cState != prevState) {
        let { options, selected, disabled } = cState.open;
        if (!prevState.open || prevState.open.options != options) {
          this.range = rangeAroundSelected(options.length, selected, update.state.facet(completionConfig).maxRenderedOptions);
          this.showOptions(options, cState.id);
        }
        this.updateSel();
        if (disabled != ((_a2 = prevState.open) === null || _a2 === void 0 ? void 0 : _a2.disabled))
          this.dom.classList.toggle("cm-tooltip-autocomplete-disabled", !!disabled);
      }
    }
    updateTooltipClass(state) {
      let cls = this.tooltipClass(state);
      if (cls != this.currentClass) {
        for (let c of this.currentClass.split(" "))
          if (c)
            this.dom.classList.remove(c);
        for (let c of cls.split(" "))
          if (c)
            this.dom.classList.add(c);
        this.currentClass = cls;
      }
    }
    positioned(space) {
      this.space = space;
      if (this.info)
        this.view.requestMeasure(this.placeInfoReq);
    }
    updateSel() {
      let cState = this.view.state.field(this.stateField), open = cState.open;
      if (open.selected > -1 && open.selected < this.range.from || open.selected >= this.range.to) {
        this.range = rangeAroundSelected(open.options.length, open.selected, this.view.state.facet(completionConfig).maxRenderedOptions);
        this.showOptions(open.options, cState.id);
      }
      let newSel = this.updateSelectedOption(open.selected);
      if (newSel) {
        this.destroyInfo();
        let { completion } = open.options[open.selected];
        let { info } = completion;
        if (!info)
          return;
        let infoResult = typeof info === "string" ? document.createTextNode(info) : info(completion);
        if (!infoResult)
          return;
        if ("then" in infoResult) {
          infoResult.then((obj) => {
            if (obj && this.view.state.field(this.stateField, false) == cState)
              this.addInfoPane(obj, completion);
          }).catch((e) => logException(this.view.state, e, "completion info"));
        } else {
          this.addInfoPane(infoResult, completion);
          newSel.setAttribute("aria-describedby", this.info.id);
        }
      }
    }
    addInfoPane(content2, completion) {
      this.destroyInfo();
      let wrap = this.info = document.createElement("div");
      wrap.className = "cm-tooltip cm-completionInfo";
      wrap.id = "cm-completionInfo-" + Math.floor(Math.random() * 65535).toString(16);
      if (content2.nodeType != null) {
        wrap.appendChild(content2);
        this.infoDestroy = null;
      } else {
        let { dom, destroy } = content2;
        wrap.appendChild(dom);
        this.infoDestroy = destroy || null;
      }
      this.dom.appendChild(wrap);
      this.view.requestMeasure(this.placeInfoReq);
    }
    updateSelectedOption(selected) {
      let set = null;
      for (let opt = this.list.firstChild, i2 = this.range.from; opt; opt = opt.nextSibling, i2++) {
        if (opt.nodeName != "LI" || !opt.id) {
          i2--;
        } else if (i2 == selected) {
          if (!opt.hasAttribute("aria-selected")) {
            opt.setAttribute("aria-selected", "true");
            set = opt;
          }
        } else {
          if (opt.hasAttribute("aria-selected")) {
            opt.removeAttribute("aria-selected");
            opt.removeAttribute("aria-describedby");
          }
        }
      }
      if (set)
        scrollIntoView2(this.list, set);
      return set;
    }
    measureInfo() {
      let sel = this.dom.querySelector("[aria-selected]");
      if (!sel || !this.info)
        return null;
      let listRect = this.dom.getBoundingClientRect();
      let infoRect = this.info.getBoundingClientRect();
      let selRect = sel.getBoundingClientRect();
      let space = this.space;
      if (!space) {
        let docElt = this.dom.ownerDocument.documentElement;
        space = { left: 0, top: 0, right: docElt.clientWidth, bottom: docElt.clientHeight };
      }
      if (selRect.top > Math.min(space.bottom, listRect.bottom) - 10 || selRect.bottom < Math.max(space.top, listRect.top) + 10)
        return null;
      return this.view.state.facet(completionConfig).positionInfo(this.view, listRect, selRect, infoRect, space, this.dom);
    }
    placeInfo(pos) {
      if (this.info) {
        if (pos) {
          if (pos.style)
            this.info.style.cssText = pos.style;
          this.info.className = "cm-tooltip cm-completionInfo " + (pos.class || "");
        } else {
          this.info.style.cssText = "top: -1e6px";
        }
      }
    }
    createListBox(options, id, range) {
      const ul = document.createElement("ul");
      ul.id = id;
      ul.setAttribute("role", "listbox");
      ul.setAttribute("aria-expanded", "true");
      ul.setAttribute("aria-label", this.view.state.phrase("Completions"));
      ul.addEventListener("mousedown", (e) => {
        if (e.target == ul)
          e.preventDefault();
      });
      let curSection = null;
      for (let i2 = range.from; i2 < range.to; i2++) {
        let { completion, match } = options[i2], { section } = completion;
        if (section) {
          let name2 = typeof section == "string" ? section : section.name;
          if (name2 != curSection && (i2 > range.from || range.from == 0)) {
            curSection = name2;
            if (typeof section != "string" && section.header) {
              ul.appendChild(section.header(section));
            } else {
              let header = ul.appendChild(document.createElement("completion-section"));
              header.textContent = name2;
            }
          }
        }
        const li = ul.appendChild(document.createElement("li"));
        li.id = id + "-" + i2;
        li.setAttribute("role", "option");
        let cls = this.optionClass(completion);
        if (cls)
          li.className = cls;
        for (let source of this.optionContent) {
          let node = source(completion, this.view.state, this.view, match);
          if (node)
            li.appendChild(node);
        }
      }
      if (range.from)
        ul.classList.add("cm-completionListIncompleteTop");
      if (range.to < options.length)
        ul.classList.add("cm-completionListIncompleteBottom");
      return ul;
    }
    destroyInfo() {
      if (this.info) {
        if (this.infoDestroy)
          this.infoDestroy();
        this.info.remove();
        this.info = null;
      }
    }
    destroy() {
      this.destroyInfo();
    }
  };
  function completionTooltip(stateField, applyCompletion2) {
    return (view2) => new CompletionTooltip(view2, stateField, applyCompletion2);
  }
  function scrollIntoView2(container, element) {
    let parent = container.getBoundingClientRect();
    let self = element.getBoundingClientRect();
    let scaleY = parent.height / container.offsetHeight;
    if (self.top < parent.top)
      container.scrollTop -= (parent.top - self.top) / scaleY;
    else if (self.bottom > parent.bottom)
      container.scrollTop += (self.bottom - parent.bottom) / scaleY;
  }
  function score(option) {
    return (option.boost || 0) * 100 + (option.apply ? 10 : 0) + (option.info ? 5 : 0) + (option.type ? 1 : 0);
  }
  function sortOptions(active, state) {
    let options = [];
    let sections = null, dynamicSectionScore = null;
    let addOption = (option) => {
      options.push(option);
      let { section } = option.completion;
      if (section) {
        if (!sections)
          sections = [];
        let name2 = typeof section == "string" ? section : section.name;
        if (!sections.some((s) => s.name == name2))
          sections.push(typeof section == "string" ? { name: name2 } : section);
      }
    };
    let conf = state.facet(completionConfig);
    for (let a of active)
      if (a.hasResult()) {
        let getMatch = a.result.getMatch;
        if (a.result.filter === false) {
          for (let option of a.result.options) {
            addOption(new Option(option, a.source, getMatch ? getMatch(option) : [], 1e9 - options.length));
          }
        } else {
          let pattern = state.sliceDoc(a.from, a.to), match;
          let matcher = conf.filterStrict ? new StrictMatcher(pattern) : new FuzzyMatcher(pattern);
          for (let option of a.result.options)
            if (match = matcher.match(option.label)) {
              let matched = !option.displayLabel ? match.matched : getMatch ? getMatch(option, match.matched) : [];
              let score2 = match.score + (option.boost || 0);
              addOption(new Option(option, a.source, matched, score2));
              if (typeof option.section == "object" && option.section.rank === "dynamic") {
                let { name: name2 } = option.section;
                if (!dynamicSectionScore)
                  dynamicSectionScore = /* @__PURE__ */ Object.create(null);
                dynamicSectionScore[name2] = Math.max(score2, dynamicSectionScore[name2] || -1e9);
              }
            }
        }
      }
    if (sections) {
      let sectionOrder = /* @__PURE__ */ Object.create(null), pos = 0;
      let cmp = (a, b) => {
        return (a.rank === "dynamic" && b.rank === "dynamic" ? dynamicSectionScore[b.name] - dynamicSectionScore[a.name] : 0) || (typeof a.rank == "number" ? a.rank : 1e9) - (typeof b.rank == "number" ? b.rank : 1e9) || (a.name < b.name ? -1 : 1);
      };
      for (let s of sections.sort(cmp)) {
        pos -= 1e5;
        sectionOrder[s.name] = pos;
      }
      for (let option of options) {
        let { section } = option.completion;
        if (section)
          option.score += sectionOrder[typeof section == "string" ? section : section.name];
      }
    }
    let result = [], prev = null;
    let compare2 = conf.compareCompletions;
    for (let opt of options.sort((a, b) => b.score - a.score || compare2(a.completion, b.completion))) {
      let cur2 = opt.completion;
      if (!prev || prev.label != cur2.label || prev.detail != cur2.detail || prev.type != null && cur2.type != null && prev.type != cur2.type || prev.apply != cur2.apply || prev.boost != cur2.boost)
        result.push(opt);
      else if (score(opt.completion) > score(prev))
        result[result.length - 1] = opt;
      prev = opt.completion;
    }
    return result;
  }
  var CompletionDialog = class _CompletionDialog {
    constructor(options, attrs, tooltip, timestamp, selected, disabled) {
      this.options = options;
      this.attrs = attrs;
      this.tooltip = tooltip;
      this.timestamp = timestamp;
      this.selected = selected;
      this.disabled = disabled;
    }
    setSelected(selected, id) {
      return selected == this.selected || selected >= this.options.length ? this : new _CompletionDialog(this.options, makeAttrs(id, selected), this.tooltip, this.timestamp, selected, this.disabled);
    }
    static build(active, state, id, prev, conf, didSetActive) {
      if (prev && !didSetActive && active.some((s) => s.isPending))
        return prev.setDisabled();
      let options = sortOptions(active, state);
      if (!options.length)
        return prev && active.some((a) => a.isPending) ? prev.setDisabled() : null;
      let selected = state.facet(completionConfig).selectOnOpen ? 0 : -1;
      if (prev && prev.selected != selected && prev.selected != -1) {
        let selectedValue = prev.options[prev.selected].completion;
        for (let i2 = 0; i2 < options.length; i2++)
          if (options[i2].completion == selectedValue) {
            selected = i2;
            break;
          }
      }
      return new _CompletionDialog(options, makeAttrs(id, selected), {
        pos: active.reduce((a, b) => b.hasResult() ? Math.min(a, b.from) : a, 1e8),
        create: createTooltip,
        above: conf.aboveCursor
      }, prev ? prev.timestamp : Date.now(), selected, false);
    }
    map(changes) {
      return new _CompletionDialog(this.options, this.attrs, { ...this.tooltip, pos: changes.mapPos(this.tooltip.pos) }, this.timestamp, this.selected, this.disabled);
    }
    setDisabled() {
      return new _CompletionDialog(this.options, this.attrs, this.tooltip, this.timestamp, this.selected, true);
    }
  };
  var CompletionState = class _CompletionState {
    constructor(active, id, open) {
      this.active = active;
      this.id = id;
      this.open = open;
    }
    static start() {
      return new _CompletionState(none2, "cm-ac-" + Math.floor(Math.random() * 2e6).toString(36), null);
    }
    update(tr) {
      let { state } = tr, conf = state.facet(completionConfig);
      let sources = conf.override || state.languageDataAt("autocomplete", cur(state)).map(asSource);
      let active = sources.map((source) => {
        let value = this.active.find((s) => s.source == source) || new ActiveSource(
          source,
          this.active.some(
            (a) => a.state != 0
            /* State.Inactive */
          ) ? 1 : 0
          /* State.Inactive */
        );
        return value.update(tr, conf);
      });
      if (active.length == this.active.length && active.every((a, i2) => a == this.active[i2]))
        active = this.active;
      let open = this.open, didSet = tr.effects.some((e) => e.is(setActiveEffect));
      if (open && tr.docChanged)
        open = open.map(tr.changes);
      if (tr.selection || active.some((a) => a.hasResult() && tr.changes.touchesRange(a.from, a.to)) || !sameResults(active, this.active) || didSet)
        open = CompletionDialog.build(active, state, this.id, open, conf, didSet);
      else if (open && open.disabled && !active.some((a) => a.isPending))
        open = null;
      if (!open && active.every((a) => !a.isPending) && active.some((a) => a.hasResult()))
        active = active.map((a) => a.hasResult() ? new ActiveSource(
          a.source,
          0
          /* State.Inactive */
        ) : a);
      for (let effect of tr.effects)
        if (effect.is(setSelectedEffect))
          open = open && open.setSelected(effect.value, this.id);
      return active == this.active && open == this.open ? this : new _CompletionState(active, this.id, open);
    }
    get tooltip() {
      return this.open ? this.open.tooltip : null;
    }
    get attrs() {
      return this.open ? this.open.attrs : this.active.length ? baseAttrs : noAttrs2;
    }
  };
  function sameResults(a, b) {
    if (a == b)
      return true;
    for (let iA = 0, iB = 0; ; ) {
      while (iA < a.length && !a[iA].hasResult())
        iA++;
      while (iB < b.length && !b[iB].hasResult())
        iB++;
      let endA = iA == a.length, endB = iB == b.length;
      if (endA || endB)
        return endA == endB;
      if (a[iA++].result != b[iB++].result)
        return false;
    }
  }
  var baseAttrs = {
    "aria-autocomplete": "list"
  };
  var noAttrs2 = {};
  function makeAttrs(id, selected) {
    let result = {
      "aria-autocomplete": "list",
      "aria-haspopup": "listbox",
      "aria-controls": id
    };
    if (selected > -1)
      result["aria-activedescendant"] = id + "-" + selected;
    return result;
  }
  var none2 = [];
  function getUpdateType(tr, conf) {
    if (tr.isUserEvent("input.complete")) {
      let completion = tr.annotation(pickedCompletion);
      if (completion && conf.activateOnCompletion(completion))
        return 4 | 8;
    }
    let typing = tr.isUserEvent("input.type");
    return typing && conf.activateOnTyping ? 4 | 1 : typing ? 1 : tr.isUserEvent("delete.backward") ? 2 : tr.selection ? 8 : tr.docChanged ? 16 : 0;
  }
  var ActiveSource = class _ActiveSource {
    constructor(source, state, explicit = false) {
      this.source = source;
      this.state = state;
      this.explicit = explicit;
    }
    hasResult() {
      return false;
    }
    get isPending() {
      return this.state == 1;
    }
    update(tr, conf) {
      let type = getUpdateType(tr, conf), value = this;
      if (type & 8 || type & 16 && this.touches(tr))
        value = new _ActiveSource(
          value.source,
          0
          /* State.Inactive */
        );
      if (type & 4 && value.state == 0)
        value = new _ActiveSource(
          this.source,
          1
          /* State.Pending */
        );
      value = value.updateFor(tr, type);
      for (let effect of tr.effects) {
        if (effect.is(startCompletionEffect))
          value = new _ActiveSource(value.source, 1, effect.value);
        else if (effect.is(closeCompletionEffect))
          value = new _ActiveSource(
            value.source,
            0
            /* State.Inactive */
          );
        else if (effect.is(setActiveEffect)) {
          for (let active of effect.value)
            if (active.source == value.source)
              value = active;
        }
      }
      return value;
    }
    updateFor(tr, type) {
      return this.map(tr.changes);
    }
    map(changes) {
      return this;
    }
    touches(tr) {
      return tr.changes.touchesRange(cur(tr.state));
    }
  };
  var ActiveResult = class _ActiveResult extends ActiveSource {
    constructor(source, explicit, limit, result, from, to) {
      super(source, 3, explicit);
      this.limit = limit;
      this.result = result;
      this.from = from;
      this.to = to;
    }
    hasResult() {
      return true;
    }
    updateFor(tr, type) {
      var _a2;
      if (!(type & 3))
        return this.map(tr.changes);
      let result = this.result;
      if (result.map && !tr.changes.empty)
        result = result.map(result, tr.changes);
      let from = tr.changes.mapPos(this.from), to = tr.changes.mapPos(this.to, 1);
      let pos = cur(tr.state);
      if (pos > to || !result || type & 2 && (cur(tr.startState) == this.from || pos < this.limit))
        return new ActiveSource(
          this.source,
          type & 4 ? 1 : 0
          /* State.Inactive */
        );
      let limit = tr.changes.mapPos(this.limit);
      if (checkValid(result.validFor, tr.state, from, to))
        return new _ActiveResult(this.source, this.explicit, limit, result, from, to);
      if (result.update && (result = result.update(result, from, to, new CompletionContext(tr.state, pos, false))))
        return new _ActiveResult(this.source, this.explicit, limit, result, result.from, (_a2 = result.to) !== null && _a2 !== void 0 ? _a2 : cur(tr.state));
      return new ActiveSource(this.source, 1, this.explicit);
    }
    map(mapping) {
      if (mapping.empty)
        return this;
      let result = this.result.map ? this.result.map(this.result, mapping) : this.result;
      if (!result)
        return new ActiveSource(
          this.source,
          0
          /* State.Inactive */
        );
      return new _ActiveResult(this.source, this.explicit, mapping.mapPos(this.limit), result, mapping.mapPos(this.from), mapping.mapPos(this.to, 1));
    }
    touches(tr) {
      return tr.changes.touchesRange(this.from, this.to);
    }
  };
  function checkValid(validFor, state, from, to) {
    if (!validFor)
      return false;
    let text = state.sliceDoc(from, to);
    return typeof validFor == "function" ? validFor(text, from, to, state) : ensureAnchor(validFor, true).test(text);
  }
  var setActiveEffect = /* @__PURE__ */ StateEffect.define({
    map(sources, mapping) {
      return sources.map((s) => s.map(mapping));
    }
  });
  var completionState = /* @__PURE__ */ StateField.define({
    create() {
      return CompletionState.start();
    },
    update(value, tr) {
      return value.update(tr);
    },
    provide: (f) => [
      showTooltip.from(f, (val) => val.tooltip),
      EditorView.contentAttributes.from(f, (state) => state.attrs)
    ]
  });
  function applyCompletion(view2, option) {
    const apply = option.completion.apply || option.completion.label;
    let result = view2.state.field(completionState).active.find((a) => a.source == option.source);
    if (!(result instanceof ActiveResult))
      return false;
    if (typeof apply == "string")
      view2.dispatch({
        ...insertCompletionText(view2.state, apply, result.from, result.to),
        annotations: pickedCompletion.of(option.completion)
      });
    else
      apply(view2, option.completion, result.from, result.to);
    return true;
  }
  var createTooltip = /* @__PURE__ */ completionTooltip(completionState, applyCompletion);
  function moveCompletionSelection(forward, by = "option") {
    return (view2) => {
      let cState = view2.state.field(completionState, false);
      if (!cState || !cState.open || cState.open.disabled || Date.now() - cState.open.timestamp < view2.state.facet(completionConfig).interactionDelay)
        return false;
      let step = 1, tooltip;
      if (by == "page" && (tooltip = getTooltip(view2, cState.open.tooltip)))
        step = Math.max(2, Math.floor(tooltip.dom.offsetHeight / tooltip.dom.querySelector("li").offsetHeight) - 1);
      let { length } = cState.open.options;
      let selected = cState.open.selected > -1 ? cState.open.selected + step * (forward ? 1 : -1) : forward ? 0 : length - 1;
      if (selected < 0)
        selected = by == "page" ? 0 : length - 1;
      else if (selected >= length)
        selected = by == "page" ? length - 1 : 0;
      view2.dispatch({ effects: setSelectedEffect.of(selected) });
      return true;
    };
  }
  var acceptCompletion = (view2) => {
    let cState = view2.state.field(completionState, false);
    if (view2.state.readOnly || !cState || !cState.open || cState.open.selected < 0 || cState.open.disabled || Date.now() - cState.open.timestamp < view2.state.facet(completionConfig).interactionDelay)
      return false;
    return applyCompletion(view2, cState.open.options[cState.open.selected]);
  };
  var startCompletion = (view2) => {
    let cState = view2.state.field(completionState, false);
    if (!cState)
      return false;
    view2.dispatch({ effects: startCompletionEffect.of(true) });
    return true;
  };
  var closeCompletion = (view2) => {
    let cState = view2.state.field(completionState, false);
    if (!cState || !cState.active.some(
      (a) => a.state != 0
      /* State.Inactive */
    ))
      return false;
    view2.dispatch({ effects: closeCompletionEffect.of(null) });
    return true;
  };
  var RunningQuery = class {
    constructor(active, context) {
      this.active = active;
      this.context = context;
      this.time = Date.now();
      this.updates = [];
      this.done = void 0;
    }
  };
  var MaxUpdateCount = 50;
  var MinAbortTime = 1e3;
  var completionPlugin = /* @__PURE__ */ ViewPlugin.fromClass(class {
    constructor(view2) {
      this.view = view2;
      this.debounceUpdate = -1;
      this.running = [];
      this.debounceAccept = -1;
      this.pendingStart = false;
      this.composing = 0;
      for (let active of view2.state.field(completionState).active)
        if (active.isPending)
          this.startQuery(active);
    }
    update(update) {
      let cState = update.state.field(completionState);
      let conf = update.state.facet(completionConfig);
      if (!update.selectionSet && !update.docChanged && update.startState.field(completionState) == cState)
        return;
      let doesReset = update.transactions.some((tr) => {
        let type = getUpdateType(tr, conf);
        return type & 8 || (tr.selection || tr.docChanged) && !(type & 3);
      });
      for (let i2 = 0; i2 < this.running.length; i2++) {
        let query = this.running[i2];
        if (doesReset || query.context.abortOnDocChange && update.docChanged || query.updates.length + update.transactions.length > MaxUpdateCount && Date.now() - query.time > MinAbortTime) {
          for (let handler of query.context.abortListeners) {
            try {
              handler();
            } catch (e) {
              logException(this.view.state, e);
            }
          }
          query.context.abortListeners = null;
          this.running.splice(i2--, 1);
        } else {
          query.updates.push(...update.transactions);
        }
      }
      if (this.debounceUpdate > -1)
        clearTimeout(this.debounceUpdate);
      if (update.transactions.some((tr) => tr.effects.some((e) => e.is(startCompletionEffect))))
        this.pendingStart = true;
      let delay = this.pendingStart ? 50 : conf.activateOnTypingDelay;
      this.debounceUpdate = cState.active.some((a) => a.isPending && !this.running.some((q) => q.active.source == a.source)) ? setTimeout(() => this.startUpdate(), delay) : -1;
      if (this.composing != 0)
        for (let tr of update.transactions) {
          if (tr.isUserEvent("input.type"))
            this.composing = 2;
          else if (this.composing == 2 && tr.selection)
            this.composing = 3;
        }
    }
    startUpdate() {
      this.debounceUpdate = -1;
      this.pendingStart = false;
      let { state } = this.view, cState = state.field(completionState);
      for (let active of cState.active) {
        if (active.isPending && !this.running.some((r) => r.active.source == active.source))
          this.startQuery(active);
      }
      if (this.running.length && cState.open && cState.open.disabled)
        this.debounceAccept = setTimeout(() => this.accept(), this.view.state.facet(completionConfig).updateSyncTime);
    }
    startQuery(active) {
      let { state } = this.view, pos = cur(state);
      let context = new CompletionContext(state, pos, active.explicit, this.view);
      let pending = new RunningQuery(active, context);
      this.running.push(pending);
      Promise.resolve(active.source(context)).then((result) => {
        if (!pending.context.aborted) {
          pending.done = result || null;
          this.scheduleAccept();
        }
      }, (err) => {
        this.view.dispatch({ effects: closeCompletionEffect.of(null) });
        logException(this.view.state, err);
      });
    }
    scheduleAccept() {
      if (this.running.every((q) => q.done !== void 0))
        this.accept();
      else if (this.debounceAccept < 0)
        this.debounceAccept = setTimeout(() => this.accept(), this.view.state.facet(completionConfig).updateSyncTime);
    }
    // For each finished query in this.running, try to create a result
    // or, if appropriate, restart the query.
    accept() {
      var _a2;
      if (this.debounceAccept > -1)
        clearTimeout(this.debounceAccept);
      this.debounceAccept = -1;
      let updated = [];
      let conf = this.view.state.facet(completionConfig), cState = this.view.state.field(completionState);
      for (let i2 = 0; i2 < this.running.length; i2++) {
        let query = this.running[i2];
        if (query.done === void 0)
          continue;
        this.running.splice(i2--, 1);
        if (query.done) {
          let pos = cur(query.updates.length ? query.updates[0].startState : this.view.state);
          let limit = Math.min(pos, query.done.from + (query.active.explicit ? 0 : 1));
          let active = new ActiveResult(query.active.source, query.active.explicit, limit, query.done, query.done.from, (_a2 = query.done.to) !== null && _a2 !== void 0 ? _a2 : pos);
          for (let tr of query.updates)
            active = active.update(tr, conf);
          if (active.hasResult()) {
            updated.push(active);
            continue;
          }
        }
        let current = cState.active.find((a) => a.source == query.active.source);
        if (current && current.isPending) {
          if (query.done == null) {
            let active = new ActiveSource(
              query.active.source,
              0
              /* State.Inactive */
            );
            for (let tr of query.updates)
              active = active.update(tr, conf);
            if (!active.isPending)
              updated.push(active);
          } else {
            this.startQuery(current);
          }
        }
      }
      if (updated.length || cState.open && cState.open.disabled)
        this.view.dispatch({ effects: setActiveEffect.of(updated) });
    }
  }, {
    eventHandlers: {
      blur(event) {
        let state = this.view.state.field(completionState, false);
        if (state && state.tooltip && this.view.state.facet(completionConfig).closeOnBlur) {
          let dialog = state.open && getTooltip(this.view, state.open.tooltip);
          if (!dialog || !dialog.dom.contains(event.relatedTarget))
            setTimeout(() => this.view.dispatch({ effects: closeCompletionEffect.of(null) }), 10);
        }
      },
      compositionstart() {
        this.composing = 1;
      },
      compositionend() {
        if (this.composing == 3) {
          setTimeout(() => this.view.dispatch({ effects: startCompletionEffect.of(false) }), 20);
        }
        this.composing = 0;
      }
    }
  });
  var windows = typeof navigator == "object" && /* @__PURE__ */ /Win/.test(navigator.platform);
  var commitCharacters = /* @__PURE__ */ Prec.highest(/* @__PURE__ */ EditorView.domEventHandlers({
    keydown(event, view2) {
      let field = view2.state.field(completionState, false);
      if (!field || !field.open || field.open.disabled || field.open.selected < 0 || !event.key || event.key.length > 1 || event.ctrlKey && !(windows && event.altKey) || event.metaKey)
        return false;
      let option = field.open.options[field.open.selected];
      let result = field.active.find((a) => a.source == option.source);
      let commitChars = option.completion.commitCharacters || result.result.commitCharacters;
      if (commitChars && commitChars.indexOf(event.key) > -1)
        applyCompletion(view2, option);
      return false;
    }
  }));
  var baseTheme3 = /* @__PURE__ */ EditorView.baseTheme({
    ".cm-tooltip.cm-tooltip-autocomplete": {
      "& > ul": {
        fontFamily: "monospace",
        whiteSpace: "nowrap",
        overflow: "hidden auto",
        maxWidth_fallback: "700px",
        maxWidth: "min(700px, 95vw)",
        minWidth: "250px",
        maxHeight: "10em",
        height: "100%",
        listStyle: "none",
        margin: 0,
        padding: 0,
        "& > li, & > completion-section": {
          padding: "1px 3px",
          lineHeight: 1.2
        },
        "& > li": {
          overflowX: "hidden",
          textOverflow: "ellipsis",
          cursor: "pointer"
        },
        "& > completion-section": {
          display: "list-item",
          borderBottom: "1px solid silver",
          paddingLeft: "0.5em",
          opacity: 0.7
        }
      }
    },
    "&light .cm-tooltip-autocomplete ul li[aria-selected]": {
      background: "#17c",
      color: "white"
    },
    "&light .cm-tooltip-autocomplete-disabled ul li[aria-selected]": {
      background: "#777"
    },
    "&dark .cm-tooltip-autocomplete ul li[aria-selected]": {
      background: "#347",
      color: "white"
    },
    "&dark .cm-tooltip-autocomplete-disabled ul li[aria-selected]": {
      background: "#444"
    },
    ".cm-completionListIncompleteTop:before, .cm-completionListIncompleteBottom:after": {
      content: '"\xB7\xB7\xB7"',
      opacity: 0.5,
      display: "block",
      textAlign: "center",
      cursor: "pointer"
    },
    ".cm-tooltip.cm-completionInfo": {
      position: "absolute",
      padding: "3px 9px",
      width: "max-content",
      maxWidth: `${400}px`,
      boxSizing: "border-box",
      whiteSpace: "pre-line"
    },
    ".cm-completionInfo.cm-completionInfo-left": { right: "100%" },
    ".cm-completionInfo.cm-completionInfo-right": { left: "100%" },
    ".cm-completionInfo.cm-completionInfo-left-narrow": { right: `${30}px` },
    ".cm-completionInfo.cm-completionInfo-right-narrow": { left: `${30}px` },
    "&light .cm-snippetField": { backgroundColor: "#00000022" },
    "&dark .cm-snippetField": { backgroundColor: "#ffffff22" },
    ".cm-snippetFieldPosition": {
      verticalAlign: "text-top",
      width: 0,
      height: "1.15em",
      display: "inline-block",
      margin: "0 -0.7px -.7em",
      borderLeft: "1.4px dotted #888"
    },
    ".cm-completionMatchedText": {
      textDecoration: "underline"
    },
    ".cm-completionDetail": {
      marginLeft: "0.5em",
      fontStyle: "italic"
    },
    ".cm-completionIcon": {
      fontSize: "90%",
      width: ".8em",
      display: "inline-block",
      textAlign: "center",
      paddingRight: ".6em",
      opacity: "0.6",
      boxSizing: "content-box"
    },
    ".cm-completionIcon-function, .cm-completionIcon-method": {
      "&:after": { content: "'\u0192'" }
    },
    ".cm-completionIcon-class": {
      "&:after": { content: "'\u25CB'" }
    },
    ".cm-completionIcon-interface": {
      "&:after": { content: "'\u25CC'" }
    },
    ".cm-completionIcon-variable": {
      "&:after": { content: "'\u{1D465}'" }
    },
    ".cm-completionIcon-constant": {
      "&:after": { content: "'\u{1D436}'" }
    },
    ".cm-completionIcon-type": {
      "&:after": { content: "'\u{1D461}'" }
    },
    ".cm-completionIcon-enum": {
      "&:after": { content: "'\u222A'" }
    },
    ".cm-completionIcon-property": {
      "&:after": { content: "'\u25A1'" }
    },
    ".cm-completionIcon-keyword": {
      "&:after": { content: "'\u{1F511}\uFE0E'" }
      // Disable emoji rendering
    },
    ".cm-completionIcon-namespace": {
      "&:after": { content: "'\u25A2'" }
    },
    ".cm-completionIcon-text": {
      "&:after": { content: "'abc'", fontSize: "50%", verticalAlign: "middle" }
    }
  });
  var closedBracket = /* @__PURE__ */ new class extends RangeValue {
  }();
  closedBracket.startSide = 1;
  closedBracket.endSide = -1;
  var android = typeof navigator == "object" && /* @__PURE__ */ /Android\b/.test(navigator.userAgent);
  function autocompletion(config = {}) {
    return [
      commitCharacters,
      completionState,
      completionConfig.of(config),
      completionPlugin,
      completionKeymapExt,
      baseTheme3
    ];
  }
  var completionKeymap = [
    { key: "Ctrl-Space", run: startCompletion },
    { mac: "Alt-`", run: startCompletion },
    { mac: "Alt-i", run: startCompletion },
    { key: "Escape", run: closeCompletion },
    { key: "ArrowDown", run: /* @__PURE__ */ moveCompletionSelection(true) },
    { key: "ArrowUp", run: /* @__PURE__ */ moveCompletionSelection(false) },
    { key: "PageDown", run: /* @__PURE__ */ moveCompletionSelection(true, "page") },
    { key: "PageUp", run: /* @__PURE__ */ moveCompletionSelection(false, "page") },
    { key: "Enter", run: acceptCompletion }
  ];
  var completionKeymapExt = /* @__PURE__ */ Prec.highest(/* @__PURE__ */ keymap.computeN([completionConfig], (state) => state.facet(completionConfig).defaultKeymap ? [completionKeymap] : []));

  // node_modules/@codemirror/lang-sql/dist/index.js
  var whitespace = 36;
  var LineComment = 1;
  var BlockComment = 2;
  var String$1 = 3;
  var Number2 = 4;
  var Bool = 5;
  var Null = 6;
  var ParenL = 7;
  var ParenR = 8;
  var BraceL = 9;
  var BraceR = 10;
  var BracketL = 11;
  var BracketR = 12;
  var Semi = 13;
  var Dot = 14;
  var Operator = 15;
  var Punctuation = 16;
  var SpecialVar = 17;
  var Identifier = 18;
  var QuotedIdentifier = 19;
  var Keyword = 20;
  var Type = 21;
  var Bits = 22;
  var Bytes = 23;
  var Builtin = 24;
  function isAlpha(ch) {
    return ch >= 65 && ch <= 90 || ch >= 97 && ch <= 122 || ch >= 48 && ch <= 57;
  }
  function isHexDigit(ch) {
    return ch >= 48 && ch <= 57 || ch >= 97 && ch <= 102 || ch >= 65 && ch <= 70;
  }
  function readLiteral(input, endQuote, backslashEscapes) {
    for (let escaped = false; ; ) {
      if (input.next < 0)
        return;
      if (input.next == endQuote && !escaped) {
        input.advance();
        return;
      }
      escaped = backslashEscapes && !escaped && input.next == 92;
      input.advance();
    }
  }
  function readDoubleDollarLiteral(input, tag) {
    scan: for (; ; ) {
      if (input.next < 0)
        return;
      if (input.next == 36) {
        input.advance();
        for (let i2 = 0; i2 < tag.length; i2++) {
          if (input.next != tag.charCodeAt(i2))
            continue scan;
          input.advance();
        }
        if (input.next == 36) {
          input.advance();
          return;
        }
      } else {
        input.advance();
      }
    }
  }
  function readPLSQLQuotedLiteral(input, openDelim) {
    let matchingDelim = "[{<(".indexOf(String.fromCharCode(openDelim));
    let closeDelim = matchingDelim < 0 ? openDelim : "]}>)".charCodeAt(matchingDelim);
    for (; ; ) {
      if (input.next < 0)
        return;
      if (input.next == closeDelim && input.peek(1) == 39) {
        input.advance(2);
        return;
      }
      input.advance();
    }
  }
  function readWord(input, result) {
    for (; ; ) {
      if (input.next != 95 && !isAlpha(input.next))
        break;
      if (result != null)
        result += String.fromCharCode(input.next);
      input.advance();
    }
    return result;
  }
  function readWordOrQuoted(input) {
    if (input.next == 39 || input.next == 34 || input.next == 96) {
      let quote = input.next;
      input.advance();
      readLiteral(input, quote, false);
    } else {
      readWord(input);
    }
  }
  function readBits(input, endQuote) {
    while (input.next == 48 || input.next == 49)
      input.advance();
    if (endQuote && input.next == endQuote)
      input.advance();
  }
  function readNumber(input, sawDot) {
    for (; ; ) {
      if (input.next == 46) {
        if (sawDot)
          break;
        sawDot = true;
      } else if (input.next < 48 || input.next > 57) {
        break;
      }
      input.advance();
    }
    if (input.next == 69 || input.next == 101) {
      input.advance();
      if (input.next == 43 || input.next == 45)
        input.advance();
      while (input.next >= 48 && input.next <= 57)
        input.advance();
    }
  }
  function eol(input) {
    while (!(input.next < 0 || input.next == 10))
      input.advance();
  }
  function inString(ch, str) {
    for (let i2 = 0; i2 < str.length; i2++)
      if (str.charCodeAt(i2) == ch)
        return true;
    return false;
  }
  var Space = " 	\r\n";
  function keywords(keywords2, types2, builtin) {
    let result = /* @__PURE__ */ Object.create(null);
    result["true"] = result["false"] = Bool;
    result["null"] = result["unknown"] = Null;
    for (let kw of keywords2.split(" "))
      if (kw)
        result[kw] = Keyword;
    for (let tp of types2.split(" "))
      if (tp)
        result[tp] = Type;
    for (let kw of (builtin || "").split(" "))
      if (kw)
        result[kw] = Builtin;
    return result;
  }
  var SQLTypes = "array binary bit boolean char character clob date decimal double float int integer interval large national nchar nclob numeric object precision real smallint time timestamp varchar varying ";
  var SQLKeywords = "absolute action add after all allocate alter and any are as asc assertion at authorization before begin between both breadth by call cascade cascaded case cast catalog check close collate collation column commit condition connect connection constraint constraints constructor continue corresponding count create cross cube current current_date current_default_transform_group current_transform_group_for_type current_path current_role current_time current_timestamp current_user cursor cycle data day deallocate declare default deferrable deferred delete depth deref desc describe descriptor deterministic diagnostics disconnect distinct do domain drop dynamic each else elseif end end-exec equals escape except exception exec execute exists exit external fetch first for foreign found from free full function general get global go goto grant group grouping handle having hold hour identity if immediate in indicator initially inner inout input insert intersect into is isolation join key language last lateral leading leave left level like limit local localtime localtimestamp locator loop map match method minute modifies module month names natural nesting new next no none not of old on only open option or order ordinality out outer output overlaps pad parameter partial path prepare preserve primary prior privileges procedure public read reads recursive redo ref references referencing relative release repeat resignal restrict result return returns revoke right role rollback rollup routine row rows savepoint schema scroll search second section select session session_user set sets signal similar size some space specific specifictype sql sqlexception sqlstate sqlwarning start state static system_user table temporary then timezone_hour timezone_minute to trailing transaction translation treat trigger under undo union unique unnest until update usage user using value values view when whenever where while with without work write year zone ";
  var defaults = {
    backslashEscapes: false,
    hashComments: false,
    spaceAfterDashes: false,
    slashComments: false,
    doubleQuotedStrings: false,
    doubleDollarQuotedStrings: false,
    unquotedBitLiterals: false,
    treatBitsAsBytes: false,
    charSetCasts: false,
    plsqlQuotingMechanism: false,
    operatorChars: "*+-%<>!=&|~^/",
    specialVar: "?",
    identifierQuotes: '"',
    caseInsensitiveIdentifiers: false,
    words: /* @__PURE__ */ keywords(SQLKeywords, SQLTypes)
  };
  function dialect(spec, kws, types2, builtin) {
    let dialect2 = {};
    for (let prop in defaults)
      dialect2[prop] = (spec.hasOwnProperty(prop) ? spec : defaults)[prop];
    if (kws)
      dialect2.words = keywords(kws, types2 || "", builtin);
    return dialect2;
  }
  function tokensFor(d) {
    return new ExternalTokenizer((input) => {
      var _a2;
      let { next } = input;
      input.advance();
      if (inString(next, Space)) {
        while (inString(input.next, Space))
          input.advance();
        input.acceptToken(whitespace);
      } else if (next == 36 && d.doubleDollarQuotedStrings) {
        let tag = readWord(input, "");
        if (input.next == 36) {
          input.advance();
          readDoubleDollarLiteral(input, tag);
          input.acceptToken(String$1);
        }
      } else if (next == 39 || next == 34 && d.doubleQuotedStrings) {
        readLiteral(input, next, d.backslashEscapes);
        input.acceptToken(String$1);
      } else if (next == 35 && d.hashComments || next == 47 && input.next == 47 && d.slashComments) {
        eol(input);
        input.acceptToken(LineComment);
      } else if (next == 45 && input.next == 45 && (!d.spaceAfterDashes || input.peek(1) == 32)) {
        eol(input);
        input.acceptToken(LineComment);
      } else if (next == 47 && input.next == 42) {
        input.advance();
        for (let depth = 1; ; ) {
          let cur2 = input.next;
          if (input.next < 0)
            break;
          input.advance();
          if (cur2 == 42 && input.next == 47) {
            depth--;
            input.advance();
            if (!depth)
              break;
          } else if (cur2 == 47 && input.next == 42) {
            depth++;
            input.advance();
          }
        }
        input.acceptToken(BlockComment);
      } else if ((next == 101 || next == 69) && input.next == 39) {
        input.advance();
        readLiteral(input, 39, true);
        input.acceptToken(String$1);
      } else if ((next == 110 || next == 78) && input.next == 39 && d.charSetCasts) {
        input.advance();
        readLiteral(input, 39, d.backslashEscapes);
        input.acceptToken(String$1);
      } else if (next == 95 && d.charSetCasts) {
        for (let i2 = 0; ; i2++) {
          if (input.next == 39 && i2 > 1) {
            input.advance();
            readLiteral(input, 39, d.backslashEscapes);
            input.acceptToken(String$1);
            break;
          }
          if (!isAlpha(input.next))
            break;
          input.advance();
        }
      } else if (d.plsqlQuotingMechanism && (next == 113 || next == 81) && input.next == 39 && input.peek(1) > 0 && !inString(input.peek(1), Space)) {
        let openDelim = input.peek(1);
        input.advance(2);
        readPLSQLQuotedLiteral(input, openDelim);
        input.acceptToken(String$1);
      } else if (inString(next, d.identifierQuotes)) {
        const endQuote = next == 91 ? 93 : next;
        readLiteral(input, endQuote, false);
        input.acceptToken(QuotedIdentifier);
      } else if (next == 40) {
        input.acceptToken(ParenL);
      } else if (next == 41) {
        input.acceptToken(ParenR);
      } else if (next == 123) {
        input.acceptToken(BraceL);
      } else if (next == 125) {
        input.acceptToken(BraceR);
      } else if (next == 91) {
        input.acceptToken(BracketL);
      } else if (next == 93) {
        input.acceptToken(BracketR);
      } else if (next == 59) {
        input.acceptToken(Semi);
      } else if (d.unquotedBitLiterals && next == 48 && input.next == 98) {
        input.advance();
        readBits(input);
        input.acceptToken(Bits);
      } else if ((next == 98 || next == 66) && (input.next == 39 || input.next == 34)) {
        const quoteStyle = input.next;
        input.advance();
        if (d.treatBitsAsBytes) {
          readLiteral(input, quoteStyle, d.backslashEscapes);
          input.acceptToken(Bytes);
        } else {
          readBits(input, quoteStyle);
          input.acceptToken(Bits);
        }
      } else if (next == 48 && (input.next == 120 || input.next == 88) || (next == 120 || next == 88) && input.next == 39) {
        let quoted = input.next == 39;
        input.advance();
        while (isHexDigit(input.next))
          input.advance();
        if (quoted && input.next == 39)
          input.advance();
        input.acceptToken(Number2);
      } else if (next == 46 && input.next >= 48 && input.next <= 57) {
        readNumber(input, true);
        input.acceptToken(Number2);
      } else if (next == 46) {
        input.acceptToken(Dot);
      } else if (next >= 48 && next <= 57) {
        readNumber(input, false);
        input.acceptToken(Number2);
      } else if (inString(next, d.operatorChars)) {
        while (inString(input.next, d.operatorChars))
          input.advance();
        input.acceptToken(Operator);
      } else if (inString(next, d.specialVar)) {
        if (input.next == next)
          input.advance();
        readWordOrQuoted(input);
        input.acceptToken(SpecialVar);
      } else if (next == 58 || next == 44) {
        input.acceptToken(Punctuation);
      } else if (isAlpha(next)) {
        let word = readWord(input, String.fromCharCode(next));
        input.acceptToken(input.next == 46 || input.peek(-word.length - 1) == 46 ? Identifier : (_a2 = d.words[word.toLowerCase()]) !== null && _a2 !== void 0 ? _a2 : Identifier);
      }
    });
  }
  var tokens = /* @__PURE__ */ tokensFor(defaults);
  var parser$1 = /* @__PURE__ */ LRParser.deserialize({
    version: 14,
    states: "%vQ]QQOOO#wQRO'#DSO$OQQO'#CwO%eQQO'#CxO%lQQO'#CyO%sQQO'#CzOOQQ'#DS'#DSOOQQ'#C}'#C}O'UQRO'#C{OOQQ'#Cv'#CvOOQQ'#C|'#C|Q]QQOOQOQQOOO'`QQO'#DOO(xQRO,59cO)PQQO,59cO)UQQO'#DSOOQQ,59d,59dO)cQQO,59dOOQQ,59e,59eO)jQQO,59eOOQQ,59f,59fO)qQQO,59fOOQQ-E6{-E6{OOQQ,59b,59bOOQQ-E6z-E6zOOQQ,59j,59jOOQQ-E6|-E6|O+VQRO1G.}O+^QQO,59cOOQQ1G/O1G/OOOQQ1G/P1G/POOQQ1G/Q1G/QP+kQQO'#C}O+rQQO1G.}O)PQQO,59cO,PQQO'#Cw",
    stateData: ",[~OtOSPOSQOS~ORUOSUOTUOUUOVROXSOZTO]XO^QO_UO`UOaPObPOcPOdUOeUOfUOgUOhUO~O^]ORvXSvXTvXUvXVvXXvXZvX]vX_vX`vXavXbvXcvXdvXevXfvXgvXhvX~OsvX~P!jOa_Ob_Oc_O~ORUOSUOTUOUUOVROXSOZTO^tO_UO`UOa`Ob`Oc`OdUOeUOfUOgUOhUO~OWaO~P$ZOYcO~P$ZO[eO~P$ZORUOSUOTUOUUOVROXSOZTO^QO_UO`UOaPObPOcPOdUOeUOfUOgUOhUO~O]hOsoX~P%zOajObjOcjO~O^]ORkaSkaTkaUkaVkaXkaZka]ka_ka`kaakabkackadkaekafkagkahka~Oska~P'kO^]O~OWvXYvX[vX~P!jOWnO~P$ZOYoO~P$ZO[pO~P$ZO^]ORkiSkiTkiUkiVkiXkiZki]ki_ki`kiakibkickidkiekifkigkihki~Oski~P)xOWkaYka[ka~P'kO]hO~P$ZOWkiYki[ki~P)xOasObsOcsO~O",
    goto: "#hwPPPPPPPPPPPPPPPPPPPPPPPPPPx||||!Y!^!d!xPPP#[TYOZeUORSTWZbdfqT[OZQZORiZSWOZQbRQdSQfTZgWbdfqQ^PWk^lmrQl_Qm`RrseVORSTWZbdfq",
    nodeNames: "\u26A0 LineComment BlockComment String Number Bool Null ( ) { } [ ] ; . Operator Punctuation SpecialVar Identifier QuotedIdentifier Keyword Type Bits Bytes Builtin Script Statement CompositeIdentifier Parens Braces Brackets Statement",
    maxTerm: 38,
    nodeProps: [
      ["isolate", -4, 1, 2, 3, 19, ""]
    ],
    skippedNodes: [0, 1, 2],
    repeatNodeCount: 3,
    tokenData: "RORO",
    tokenizers: [0, tokens],
    topRules: { "Script": [0, 25] },
    tokenPrec: 0
  });
  var parser = /* @__PURE__ */ parser$1.configure({
    props: [
      /* @__PURE__ */ indentNodeProp.add({
        Statement: /* @__PURE__ */ continuedIndent()
      }),
      /* @__PURE__ */ foldNodeProp.add({
        Statement(tree, state) {
          return { from: Math.min(tree.from + 100, state.doc.lineAt(tree.from).to), to: tree.to };
        },
        BlockComment(tree) {
          return { from: tree.from + 2, to: tree.to - 2 };
        }
      }),
      /* @__PURE__ */ styleTags({
        Keyword: tags.keyword,
        Type: tags.typeName,
        Builtin: /* @__PURE__ */ tags.standard(tags.name),
        Bits: tags.number,
        Bytes: tags.string,
        Bool: tags.bool,
        Null: tags.null,
        Number: tags.number,
        String: tags.string,
        Identifier: tags.name,
        QuotedIdentifier: /* @__PURE__ */ tags.special(tags.string),
        SpecialVar: /* @__PURE__ */ tags.special(tags.name),
        LineComment: tags.lineComment,
        BlockComment: tags.blockComment,
        Operator: tags.operator,
        "Semi Punctuation": tags.punctuation,
        "( )": tags.paren,
        "{ }": tags.brace,
        "[ ]": tags.squareBracket
      })
    ]
  });
  var SQLDialect = class _SQLDialect {
    constructor(dialect2, language2, spec) {
      this.dialect = dialect2;
      this.language = language2;
      this.spec = spec;
    }
    /**
    Returns the language for this dialect as an extension.
    */
    get extension() {
      return this.language.extension;
    }
    /**
    Reconfigure the parser used by this dialect. Returns a new
    dialect object.
    */
    configureLanguage(options, name2) {
      return new _SQLDialect(this.dialect, this.language.configure(options, name2), this.spec);
    }
    /**
    Define a new dialect.
    */
    static define(spec) {
      let d = dialect(spec, spec.keywords, spec.types, spec.builtin);
      let language2 = LRLanguage.define({
        name: "sql",
        parser: parser.configure({
          tokenizers: [{ from: tokens, to: tokensFor(d) }]
        }),
        languageData: {
          commentTokens: { line: "--", block: { open: "/*", close: "*/" } },
          closeBrackets: { brackets: ["(", "[", "{", "'", '"', "`"] }
        }
      });
      return new _SQLDialect(d, language2, spec);
    }
  };
  var PostgreSQL = /* @__PURE__ */ SQLDialect.define({
    charSetCasts: true,
    doubleDollarQuotedStrings: true,
    operatorChars: "+-*/<>=~!@#%^&|`?",
    specialVar: "",
    keywords: SQLKeywords + "abort abs absent access according ada admin aggregate alias also always analyse analyze array_agg array_max_cardinality asensitive assert assignment asymmetric atomic attach attribute attributes avg backward base64 begin_frame begin_partition bernoulli bit_length blocked bom cache called cardinality catalog_name ceil ceiling chain char_length character_length character_set_catalog character_set_name character_set_schema characteristics characters checkpoint class class_origin cluster coalesce cobol collation_catalog collation_name collation_schema collect column_name columns command_function command_function_code comment comments committed concurrently condition_number configuration conflict connection_name constant constraint_catalog constraint_name constraint_schema contains content control conversion convert copy corr cost covar_pop covar_samp csv cume_dist current_catalog current_row current_schema cursor_name database datalink datatype datetime_interval_code datetime_interval_precision db debug defaults defined definer degree delimiter delimiters dense_rank depends derived detach detail dictionary disable discard dispatch dlnewcopy dlpreviouscopy dlurlcomplete dlurlcompleteonly dlurlcompletewrite dlurlpath dlurlpathonly dlurlpathwrite dlurlscheme dlurlserver dlvalue document dump dynamic_function dynamic_function_code element elsif empty enable encoding encrypted end_frame end_partition endexec enforced enum errcode error event every exclude excluding exclusive exp explain expression extension extract family file filter final first_value flag floor following force foreach fortran forward frame_row freeze fs functions fusion generated granted greatest groups handler header hex hierarchy hint id ignore ilike immediately immutable implementation implicit import include including increment indent index indexes info inherit inherits inline insensitive instance instantiable instead integrity intersection invoker isnull key_member key_type label lag last_value lead leakproof least length library like_regex link listen ln load location lock locked log logged lower mapping matched materialized max max_cardinality maxvalue member merge message message_length message_octet_length message_text min minvalue mod mode more move multiset mumps name namespace nfc nfd nfkc nfkd nil normalize normalized nothing notice notify notnull nowait nth_value ntile nullable nullif nulls number occurrences_regex octet_length octets off offset oids operator options ordering others over overlay overriding owned owner parallel parameter_mode parameter_name parameter_ordinal_position parameter_specific_catalog parameter_specific_name parameter_specific_schema parser partition pascal passing passthrough password percent percent_rank percentile_cont percentile_disc perform period permission pg_context pg_datatype_name pg_exception_context pg_exception_detail pg_exception_hint placing plans pli policy portion position position_regex power precedes preceding prepared print_strict_params procedural procedures program publication query quote raise range rank reassign recheck recovery refresh regr_avgx regr_avgy regr_count regr_intercept regr_r2 regr_slope regr_sxx regr_sxy regr_syy reindex rename repeatable replace replica requiring reset respect restart restore result_oid returned_cardinality returned_length returned_octet_length returned_sqlstate returning reverse routine_catalog routine_name routine_schema routines row_count row_number rowtype rule scale schema_name schemas scope scope_catalog scope_name scope_schema security selective self sensitive sequence sequences serializable server server_name setof share show simple skip slice snapshot source specific_name sqlcode sqlerror sqrt stable stacked standalone statement statistics stddev_pop stddev_samp stdin stdout storage strict strip structure style subclass_origin submultiset subscription substring substring_regex succeeds sum symmetric sysid system system_time table_name tables tablesample tablespace temp template ties token top_level_count transaction_active transactions_committed transactions_rolled_back transform transforms translate translate_regex trigger_catalog trigger_name trigger_schema trim trim_array truncate trusted type types uescape unbounded uncommitted unencrypted unlink unlisten unlogged unnamed untyped upper uri use_column use_variable user_defined_type_catalog user_defined_type_code user_defined_type_name user_defined_type_schema vacuum valid validate validator value_of var_pop var_samp varbinary variable_conflict variadic verbose version versioning views volatile warning whitespace width_bucket window within wrapper xmlagg xmlattributes xmlbinary xmlcast xmlcomment xmlconcat xmldeclaration xmldocument xmlelement xmlexists xmlforest xmliterate xmlnamespaces xmlparse xmlpi xmlquery xmlroot xmlschema xmlserialize xmltable xmltext xmlvalidate yes",
    types: SQLTypes + "bigint int8 bigserial serial8 varbit bool box bytea cidr circle precision float8 inet int4 json jsonb line lseg macaddr macaddr8 money numeric pg_lsn point polygon float4 int2 smallserial serial2 serial serial4 text timetz timestamptz tsquery tsvector txid_snapshot uuid xml"
  });
  var MySQLKeywords = "accessible algorithm analyze asensitive authors auto_increment autocommit avg avg_row_length binlog btree cache catalog_name chain change changed checkpoint checksum class_origin client_statistics coalesce code collations columns comment committed completion concurrent consistent contains contributors convert database databases day_hour day_microsecond day_minute day_second delay_key_write delayed delimiter des_key_file dev_pop dev_samp deviance directory disable discard distinctrow div dual dumpfile enable enclosed ends engine engines enum errors escaped even event events every explain extended fast field fields flush force found_rows fulltext grants handler hash high_priority hosts hour_microsecond hour_minute hour_second ignore ignore_server_ids import index index_statistics infile innodb insensitive insert_method install invoker iterate keys kill linear lines list load lock logs low_priority master master_heartbeat_period master_ssl_verify_server_cert masters max max_rows maxvalue message_text middleint migrate min min_rows minute_microsecond minute_second mod mode modify mutex mysql_errno no_write_to_binlog offline offset one online optimize optionally outfile pack_keys parser partition partitions password phase plugin plugins prev processlist profile profiles purge query quick range read_write rebuild recover regexp relaylog remove rename reorganize repair repeatable replace require resume rlike row_format rtree schedule schema_name schemas second_microsecond security sensitive separator serializable server share show slave slow snapshot soname spatial sql_big_result sql_buffer_result sql_cache sql_calc_found_rows sql_no_cache sql_small_result ssl starting starts std stddev stddev_pop stddev_samp storage straight_join subclass_origin sum suspend table_name table_statistics tables tablespace terminated triggers truncate uncommitted uninstall unlock upgrade use use_frm user_resources user_statistics utc_date utc_time utc_timestamp variables views warnings xa xor year_month zerofill";
  var MySQLTypes = SQLTypes + "bool blob long longblob longtext medium mediumblob mediumint mediumtext tinyblob tinyint tinytext text bigint int1 int2 int3 int4 int8 float4 float8 varbinary varcharacter precision datetime unsigned signed";
  var MySQLBuiltin = "charset clear edit ego help nopager notee nowarning pager print prompt quit rehash source status system tee";
  var MySQL = /* @__PURE__ */ SQLDialect.define({
    operatorChars: "*+-%<>!=&|^",
    charSetCasts: true,
    doubleQuotedStrings: true,
    unquotedBitLiterals: true,
    hashComments: true,
    spaceAfterDashes: true,
    specialVar: "@?",
    identifierQuotes: "`",
    keywords: SQLKeywords + "group_concat " + MySQLKeywords,
    types: MySQLTypes,
    builtin: MySQLBuiltin
  });
  var MariaSQL = /* @__PURE__ */ SQLDialect.define({
    operatorChars: "*+-%<>!=&|^",
    charSetCasts: true,
    doubleQuotedStrings: true,
    unquotedBitLiterals: true,
    hashComments: true,
    spaceAfterDashes: true,
    specialVar: "@?",
    identifierQuotes: "`",
    keywords: SQLKeywords + "always generated groupby_concat hard persistent shutdown soft virtual " + MySQLKeywords,
    types: MySQLTypes,
    builtin: MySQLBuiltin
  });
  var MSSQLBuiltin = (
    // Aggregate https://msdn.microsoft.com/en-us/library/ms173454.aspx
    "approx_count_distinct approx_percentile_cont approx_percentile_disc avg checksum_agg count count_big grouping grouping_id max min product stdev stdevp sum var varp ai_generate_embeddings ai_generate_chunks cume_dist first_value lag last_value lead percentile_cont percentile_disc percent_rank left_shift right_shift bit_count get_bit set_bit collationproperty tertiary_weights @@datefirst @@dbts @@langid @@language @@lock_timeout @@max_connections @@max_precision @@nestlevel @@options @@remserver @@servername @@servicename @@spid @@textsize @@version cast convert parse try_cast try_convert try_parse asymkey_id asymkeyproperty certproperty cert_id crypt_gen_random decryptbyasymkey decryptbycert decryptbykey decryptbykeyautoasymkey decryptbykeyautocert decryptbypassphrase encryptbyasymkey encryptbycert encryptbykey encryptbypassphrase hashbytes is_objectsigned key_guid key_id key_name signbyasymkey signbycert symkeyproperty verifysignedbycert verifysignedbyasymkey @@cursor_rows @@fetch_status cursor_status datalength ident_current ident_incr ident_seed identity sql_variant_property @@datefirst current_timestamp current_timezone current_timezone_id date_bucket dateadd datediff datediff_big datefromparts datename datepart datetime2fromparts datetimefromparts datetimeoffsetfromparts datetrunc day eomonth getdate getutcdate isdate month smalldatetimefromparts switchoffset sysdatetime sysdatetimeoffset sysutcdatetime timefromparts todatetimeoffset year edit_distance edit_distance_similarity jaro_winkler_distance jaro_winkler_similarity edge_id_from_parts graph_id_from_edge_id graph_id_from_node_id node_id_from_parts object_id_from_edge_id object_id_from_node_id json isjson json_array json_contains json_modify json_object json_path_exists json_query json_value regexp_like regexp_replace regexp_substr regexp_instr regexp_count regexp_matches regexp_split_to_table abs acos asin atan atn2 ceiling cos cot degrees exp floor log log10 pi power radians rand round sign sin sqrt square tan choose greatest iif least @@procid app_name applock_mode applock_test assemblyproperty col_length col_name columnproperty databasepropertyex db_id db_name file_id file_idex file_name filegroup_id filegroup_name filegroupproperty fileproperty filepropertyex fulltextcatalogproperty fulltextserviceproperty index_col indexkey_property indexproperty next value for object_definition object_id object_name object_schema_name objectproperty objectpropertyex original_db_name parsename schema_id schema_name scope_identity serverproperty stats_date type_id type_name typeproperty dense_rank ntile rank row_number publishingservername certenclosed certprivatekey current_user database_principal_id has_dbaccess has_perms_by_name is_member is_rolemember is_srvrolemember loginproperty original_login permissions pwdencrypt pwdcompare session_user sessionproperty suser_id suser_name suser_sid suser_sname system_user user user_id user_name ascii char charindex concat concat_ws difference format left len lower ltrim nchar patindex quotename replace replicate reverse right rtrim soundex space str string_agg string_escape stuff substring translate trim unicode upper $partition @@error @@identity @@pack_received @@rowcount @@trancount binary_checksum checksum compress connectionproperty context_info current_request_id current_transaction_id decompress error_line error_message error_number error_procedure error_severity error_state formatmessage get_filestream_transaction_context getansinull host_id host_name isnull isnumeric min_active_rowversion newid newsequentialid rowcount_big session_context xact_state @@connections @@cpu_busy @@idle @@io_busy @@pack_sent @@packet_errors @@timeticks @@total_errors @@total_read @@total_write textptr textvalid columns_updated eventdata trigger_nestlevel vector_distance vectorproperty vector_search generate_series opendatasource openjson openquery openrowset openxml predict string_split coalesce nullif apply catch filter force include keep keepfixed modify optimize parameterization parameters partition recompile sequence set"
  );
  var MSSQL = /* @__PURE__ */ SQLDialect.define({
    keywords: SQLKeywords + // Reserved Keywords https://learn.microsoft.com/en-us/sql/t-sql/language-elements/reserved-keywords-transact-sql?view=sql-server-ver17
    "add external procedure all fetch public alter file raiserror and fillfactor read any for readtext as foreign reconfigure asc freetext references authorization freetexttable replication backup from restore begin full restrict between function return break goto revert browse grant revoke bulk group right by having rollback cascade holdlock rowcount case identity rowguidcol check identity_insert rule checkpoint identitycol save close if schema clustered in securityaudit coalesce index select collate inner semantickeyphrasetable column insert semanticsimilaritydetailstable commit intersect semanticsimilaritytable compute into session_user constraint is set contains join setuser containstable key shutdown continue kill some convert left statistics create like system_user cross lineno table current load tablesample current_date merge textsize current_time national then current_timestamp nocheck to current_user nonclustered top cursor not tran database null transaction dbcc nullif trigger deallocate of truncate declare off try_convert default offsets tsequal delete on union deny open unique desc opendatasource unpivot disk openquery update distinct openrowset updatetext distributed openxml use double option user drop or values dump order varying else outer view end over waitfor errlvl percent when escape pivot where except plan while exec precision with execute primary within group exists print writetext exit proc noexpand index forceseek forcescan holdlock nolock nowait paglock readcommitted readcommittedlock readpast readuncommitted repeatableread rowlock serializable snapshot spatial_window_max_cells tablock tablockx updlock xlock keepidentity keepdefaults ignore_constraints ignore_triggers",
    types: SQLTypes + "smalldatetime datetimeoffset datetime2 datetime bigint smallint smallmoney tinyint money real text nvarchar ntext varbinary image hierarchyid uniqueidentifier sql_variant xml",
    builtin: MSSQLBuiltin,
    operatorChars: "*+-%<>!=^&|/",
    specialVar: "@",
    identifierQuotes: '"['
  });
  var SQLite = /* @__PURE__ */ SQLDialect.define({
    keywords: SQLKeywords + "abort analyze attach autoincrement conflict database detach exclusive fail glob ignore index indexed instead isnull notnull offset plan pragma query raise regexp reindex rename replace temp vacuum virtual",
    types: SQLTypes + "bool blob long longblob longtext medium mediumblob mediumint mediumtext tinyblob tinyint tinytext text bigint int2 int8 unsigned signed real",
    builtin: "auth backup bail changes clone databases dbinfo dump echo eqp explain fullschema headers help import imposter indexes iotrace lint load log mode nullvalue once print prompt quit restore save scanstats separator shell show stats system tables testcase timeout timer trace vfsinfo vfslist vfsname width",
    operatorChars: "*+-%<>!=&|/~",
    identifierQuotes: '`"',
    specialVar: "@:?$"
  });
  var Cassandra = /* @__PURE__ */ SQLDialect.define({
    keywords: "add all allow alter and any apply as asc authorize batch begin by clustering columnfamily compact consistency count create custom delete desc distinct drop each_quorum exists filtering from grant if in index insert into key keyspace keyspaces level limit local_one local_quorum modify nan norecursive nosuperuser not of on one order password permission permissions primary quorum rename revoke schema select set storage superuser table three to token truncate ttl two type unlogged update use user users using values where with writetime infinity NaN",
    types: SQLTypes + "ascii bigint blob counter frozen inet list map static text timeuuid tuple uuid varint",
    slashComments: true
  });
  var PLSQL = /* @__PURE__ */ SQLDialect.define({
    keywords: SQLKeywords + "abort accept access add all alter and any arraylen as asc assert assign at attributes audit authorization avg base_table begin between binary_integer body by case cast char_base check close cluster clusters colauth column comment commit compress connected constant constraint crash create current currval cursor data_base database dba deallocate debugoff debugon declare default definition delay delete desc digits dispose distinct do drop else elseif elsif enable end entry exception exception_init exchange exclusive exists external fast fetch file for force form from function generic goto grant group having identified if immediate in increment index indexes indicator initial initrans insert interface intersect into is key level library like limited local lock log logging loop master maxextents maxtrans member minextents minus mislabel mode modify multiset new next no noaudit nocompress nologging noparallel not nowait number_base of off offline on online only option or order out package parallel partition pctfree pctincrease pctused pls_integer positive positiven pragma primary prior private privileges procedure public raise range raw rebuild record ref references refresh rename replace resource restrict return returning returns reverse revoke rollback row rowid rowlabel rownum rows run savepoint schema segment select separate set share snapshot some space split sql start statement storage subtype successful synonym tabauth table tables tablespace task terminate then to trigger truncate type union unique unlimited unrecoverable unusable update use using validate value values variable view views when whenever where while with work",
    builtin: "appinfo arraysize autocommit autoprint autorecovery autotrace blockterminator break btitle cmdsep colsep compatibility compute concat copycommit copytypecheck define echo editfile embedded feedback flagger flush heading headsep instance linesize lno loboffset logsource longchunksize markup native newpage numformat numwidth pagesize pause pno recsep recsepchar repfooter repheader serveroutput shiftinout show showmode spool sqlblanklines sqlcase sqlcode sqlcontinue sqlnumber sqlpluscompatibility sqlprefix sqlprompt sqlterminator suffix tab term termout timing trimout trimspool ttitle underline verify version wrap",
    types: SQLTypes + "ascii bfile bfilename bigserial bit blob dec long number nvarchar nvarchar2 serial smallint string text uid varchar2 xml",
    operatorChars: "*/+-%<>!=~",
    doubleQuotedStrings: true,
    charSetCasts: true,
    plsqlQuotingMechanism: true
  });

  // node_modules/@codemirror/commands/dist/index.js
  var toggleComment = (target) => {
    let { state } = target, line = state.doc.lineAt(state.selection.main.from), config = getConfig(target.state, line.from);
    return config.line ? toggleLineComment(target) : config.block ? toggleBlockCommentByLine(target) : false;
  };
  function command(f, option) {
    return ({ state, dispatch }) => {
      if (state.readOnly)
        return false;
      let tr = f(option, state);
      if (!tr)
        return false;
      dispatch(state.update(tr));
      return true;
    };
  }
  var toggleLineComment = /* @__PURE__ */ command(
    changeLineComment,
    0
    /* CommentOption.Toggle */
  );
  var toggleBlockComment = /* @__PURE__ */ command(
    changeBlockComment,
    0
    /* CommentOption.Toggle */
  );
  var toggleBlockCommentByLine = /* @__PURE__ */ command(
    (o, s) => changeBlockComment(o, s, selectedLineRanges(s)),
    0
    /* CommentOption.Toggle */
  );
  function getConfig(state, pos) {
    let data = state.languageDataAt("commentTokens", pos, 1);
    return data.length ? data[0] : {};
  }
  var SearchMargin = 50;
  function findBlockComment(state, { open, close }, from, to) {
    let textBefore = state.sliceDoc(from - SearchMargin, from);
    let textAfter = state.sliceDoc(to, to + SearchMargin);
    let spaceBefore = /\s*$/.exec(textBefore)[0].length, spaceAfter = /^\s*/.exec(textAfter)[0].length;
    let beforeOff = textBefore.length - spaceBefore;
    if (textBefore.slice(beforeOff - open.length, beforeOff) == open && textAfter.slice(spaceAfter, spaceAfter + close.length) == close) {
      return {
        open: { pos: from - spaceBefore, margin: spaceBefore && 1 },
        close: { pos: to + spaceAfter, margin: spaceAfter && 1 }
      };
    }
    let startText, endText;
    if (to - from <= 2 * SearchMargin) {
      startText = endText = state.sliceDoc(from, to);
    } else {
      startText = state.sliceDoc(from, from + SearchMargin);
      endText = state.sliceDoc(to - SearchMargin, to);
    }
    let startSpace = /^\s*/.exec(startText)[0].length, endSpace = /\s*$/.exec(endText)[0].length;
    let endOff = endText.length - endSpace - close.length;
    if (startText.slice(startSpace, startSpace + open.length) == open && endText.slice(endOff, endOff + close.length) == close) {
      return {
        open: {
          pos: from + startSpace + open.length,
          margin: /\s/.test(startText.charAt(startSpace + open.length)) ? 1 : 0
        },
        close: {
          pos: to - endSpace - close.length,
          margin: /\s/.test(endText.charAt(endOff - 1)) ? 1 : 0
        }
      };
    }
    return null;
  }
  function selectedLineRanges(state) {
    let ranges = [];
    for (let r of state.selection.ranges) {
      let fromLine = state.doc.lineAt(r.from);
      let toLine = r.to <= fromLine.to ? fromLine : state.doc.lineAt(r.to);
      if (toLine.from > fromLine.from && toLine.from == r.to)
        toLine = r.to == fromLine.to + 1 ? fromLine : state.doc.lineAt(r.to - 1);
      let last2 = ranges.length - 1;
      if (last2 >= 0 && ranges[last2].to > fromLine.from)
        ranges[last2].to = toLine.to;
      else
        ranges.push({ from: fromLine.from + /^\s*/.exec(fromLine.text)[0].length, to: toLine.to });
    }
    return ranges;
  }
  function changeBlockComment(option, state, ranges = state.selection.ranges) {
    let tokens2 = ranges.map((r) => getConfig(state, r.from).block);
    if (!tokens2.every((c) => c))
      return null;
    let comments = ranges.map((r, i2) => findBlockComment(state, tokens2[i2], r.from, r.to));
    if (option != 2 && !comments.every((c) => c)) {
      return { changes: state.changes(ranges.map((range, i2) => {
        if (comments[i2])
          return [];
        return [{ from: range.from, insert: tokens2[i2].open + " " }, { from: range.to, insert: " " + tokens2[i2].close }];
      })) };
    } else if (option != 1 && comments.some((c) => c)) {
      let changes = [];
      for (let i2 = 0, comment2; i2 < comments.length; i2++)
        if (comment2 = comments[i2]) {
          let token = tokens2[i2], { open, close } = comment2;
          changes.push({ from: open.pos - token.open.length, to: open.pos + open.margin }, { from: close.pos - close.margin, to: close.pos + token.close.length });
        }
      return { changes };
    }
    return null;
  }
  function changeLineComment(option, state, ranges = state.selection.ranges) {
    let lines = [];
    let prevLine = -1;
    ranges: for (let { from, to } of ranges) {
      let startI = lines.length, minIndent = 1e9, token;
      for (let pos = from; pos <= to; ) {
        let line = state.doc.lineAt(pos);
        if (token == void 0) {
          token = getConfig(state, line.from).line;
          if (!token)
            continue ranges;
        }
        if (line.from > prevLine && (from == to || to > line.from)) {
          prevLine = line.from;
          let indent = /^\s*/.exec(line.text)[0].length;
          let empty = indent == line.length;
          let comment2 = line.text.slice(indent, indent + token.length) == token ? indent : -1;
          if (indent < line.text.length && indent < minIndent)
            minIndent = indent;
          lines.push({ line, comment: comment2, token, indent, empty, single: false });
        }
        pos = line.to + 1;
      }
      if (minIndent < 1e9) {
        for (let i2 = startI; i2 < lines.length; i2++)
          if (lines[i2].indent < lines[i2].line.text.length)
            lines[i2].indent = minIndent;
      }
      if (lines.length == startI + 1)
        lines[startI].single = true;
    }
    if (option != 2 && lines.some((l) => l.comment < 0 && (!l.empty || l.single))) {
      let changes = [];
      for (let { line, token, indent, empty, single } of lines)
        if (single || !empty)
          changes.push({ from: line.from + indent, insert: token + " " });
      let changeSet = state.changes(changes);
      return { changes: changeSet, selection: state.selection.map(changeSet, 1) };
    } else if (option != 1 && lines.some((l) => l.comment >= 0)) {
      let changes = [];
      for (let { line, comment: comment2, token } of lines)
        if (comment2 >= 0) {
          let from = line.from + comment2, to = from + token.length;
          if (line.text[to - line.from] == " ")
            to++;
          changes.push({ from, to });
        }
      return { changes };
    }
    return null;
  }
  var fromHistory = /* @__PURE__ */ Annotation.define();
  var isolateHistory = /* @__PURE__ */ Annotation.define();
  var invertedEffects = /* @__PURE__ */ Facet.define();
  var historyConfig = /* @__PURE__ */ Facet.define({
    combine(configs) {
      return combineConfig(configs, {
        minDepth: 100,
        newGroupDelay: 500,
        joinToEvent: (_t, isAdjacent2) => isAdjacent2
      }, {
        minDepth: Math.max,
        newGroupDelay: Math.min,
        joinToEvent: (a, b) => (tr, adj) => a(tr, adj) || b(tr, adj)
      });
    }
  });
  var historyField_ = /* @__PURE__ */ StateField.define({
    create() {
      return HistoryState.empty;
    },
    update(state, tr) {
      let config = tr.state.facet(historyConfig);
      let fromHist = tr.annotation(fromHistory);
      if (fromHist) {
        let item = HistEvent.fromTransaction(tr, fromHist.selection), from = fromHist.side;
        let other = from == 0 ? state.undone : state.done;
        if (item)
          other = updateBranch(other, other.length, config.minDepth, item);
        else
          other = addSelection(other, tr.startState.selection);
        return new HistoryState(from == 0 ? fromHist.rest : other, from == 0 ? other : fromHist.rest);
      }
      let isolate = tr.annotation(isolateHistory);
      if (isolate == "full" || isolate == "before")
        state = state.isolate();
      if (tr.annotation(Transaction.addToHistory) === false)
        return !tr.changes.empty ? state.addMapping(tr.changes.desc) : state;
      let event = HistEvent.fromTransaction(tr);
      let time = tr.annotation(Transaction.time), userEvent = tr.annotation(Transaction.userEvent);
      if (event)
        state = state.addChanges(event, time, userEvent, config, tr);
      else if (tr.selection)
        state = state.addSelection(tr.startState.selection, time, userEvent, config.newGroupDelay);
      if (isolate == "full" || isolate == "after")
        state = state.isolate();
      return state;
    },
    toJSON(value) {
      return { done: value.done.map((e) => e.toJSON()), undone: value.undone.map((e) => e.toJSON()) };
    },
    fromJSON(json) {
      return new HistoryState(json.done.map(HistEvent.fromJSON), json.undone.map(HistEvent.fromJSON));
    }
  });
  function history(config = {}) {
    return [
      historyField_,
      historyConfig.of(config),
      EditorView.domEventHandlers({
        beforeinput(e, view2) {
          let command2 = e.inputType == "historyUndo" ? undo : e.inputType == "historyRedo" ? redo : null;
          if (!command2)
            return false;
          e.preventDefault();
          return command2(view2);
        }
      })
    ];
  }
  function cmd(side, selection) {
    return function({ state, dispatch }) {
      if (!selection && state.readOnly)
        return false;
      let historyState = state.field(historyField_, false);
      if (!historyState)
        return false;
      let tr = historyState.pop(side, state, selection);
      if (!tr)
        return false;
      dispatch(tr);
      return true;
    };
  }
  var undo = /* @__PURE__ */ cmd(0, false);
  var redo = /* @__PURE__ */ cmd(1, false);
  var undoSelection = /* @__PURE__ */ cmd(0, true);
  var redoSelection = /* @__PURE__ */ cmd(1, true);
  var HistEvent = class _HistEvent {
    constructor(changes, effects, mapped, startSelection, selectionsAfter) {
      this.changes = changes;
      this.effects = effects;
      this.mapped = mapped;
      this.startSelection = startSelection;
      this.selectionsAfter = selectionsAfter;
    }
    setSelAfter(after) {
      return new _HistEvent(this.changes, this.effects, this.mapped, this.startSelection, after);
    }
    toJSON() {
      var _a2, _b, _c;
      return {
        changes: (_a2 = this.changes) === null || _a2 === void 0 ? void 0 : _a2.toJSON(),
        mapped: (_b = this.mapped) === null || _b === void 0 ? void 0 : _b.toJSON(),
        startSelection: (_c = this.startSelection) === null || _c === void 0 ? void 0 : _c.toJSON(),
        selectionsAfter: this.selectionsAfter.map((s) => s.toJSON())
      };
    }
    static fromJSON(json) {
      return new _HistEvent(json.changes && ChangeSet.fromJSON(json.changes), [], json.mapped && ChangeDesc.fromJSON(json.mapped), json.startSelection && EditorSelection.fromJSON(json.startSelection), json.selectionsAfter.map(EditorSelection.fromJSON));
    }
    // This does not check `addToHistory` and such, it assumes the
    // transaction needs to be converted to an item. Returns null when
    // there are no changes or effects in the transaction.
    static fromTransaction(tr, selection) {
      let effects = none3;
      for (let invert of tr.startState.facet(invertedEffects)) {
        let result = invert(tr);
        if (result.length)
          effects = effects.concat(result);
      }
      if (!effects.length && tr.changes.empty)
        return null;
      return new _HistEvent(tr.changes.invert(tr.startState.doc), effects, void 0, selection || tr.startState.selection, none3);
    }
    static selection(selections) {
      return new _HistEvent(void 0, none3, void 0, void 0, selections);
    }
  };
  function updateBranch(branch, to, maxLen, newEvent) {
    let start = to + 1 > maxLen + 20 ? to - maxLen - 1 : 0;
    let newBranch = branch.slice(start, to);
    newBranch.push(newEvent);
    return newBranch;
  }
  function isAdjacent(a, b) {
    let ranges = [], isAdjacent2 = false;
    a.iterChangedRanges((f, t2) => ranges.push(f, t2));
    b.iterChangedRanges((_f, _t, f, t2) => {
      for (let i2 = 0; i2 < ranges.length; ) {
        let from = ranges[i2++], to = ranges[i2++];
        if (t2 >= from && f <= to)
          isAdjacent2 = true;
      }
    });
    return isAdjacent2;
  }
  function eqSelectionShape(a, b) {
    return a.ranges.length == b.ranges.length && a.ranges.filter((r, i2) => r.empty != b.ranges[i2].empty).length === 0;
  }
  function conc(a, b) {
    return !a.length ? b : !b.length ? a : a.concat(b);
  }
  var none3 = [];
  var MaxSelectionsPerEvent = 200;
  function addSelection(branch, selection) {
    if (!branch.length) {
      return [HistEvent.selection([selection])];
    } else {
      let lastEvent = branch[branch.length - 1];
      let sels = lastEvent.selectionsAfter.slice(Math.max(0, lastEvent.selectionsAfter.length - MaxSelectionsPerEvent));
      if (sels.length && sels[sels.length - 1].eq(selection))
        return branch;
      sels.push(selection);
      return updateBranch(branch, branch.length - 1, 1e9, lastEvent.setSelAfter(sels));
    }
  }
  function popSelection(branch) {
    let last2 = branch[branch.length - 1];
    let newBranch = branch.slice();
    newBranch[branch.length - 1] = last2.setSelAfter(last2.selectionsAfter.slice(0, last2.selectionsAfter.length - 1));
    return newBranch;
  }
  function addMappingToBranch(branch, mapping) {
    if (!branch.length)
      return branch;
    let length = branch.length, selections = none3;
    while (length) {
      let event = mapEvent(branch[length - 1], mapping, selections);
      if (event.changes && !event.changes.empty || event.effects.length) {
        let result = branch.slice(0, length);
        result[length - 1] = event;
        return result;
      } else {
        mapping = event.mapped;
        length--;
        selections = event.selectionsAfter;
      }
    }
    return selections.length ? [HistEvent.selection(selections)] : none3;
  }
  function mapEvent(event, mapping, extraSelections) {
    let selections = conc(event.selectionsAfter.length ? event.selectionsAfter.map((s) => s.map(mapping)) : none3, extraSelections);
    if (!event.changes)
      return HistEvent.selection(selections);
    let mappedChanges = event.changes.map(mapping), before = mapping.mapDesc(event.changes, true);
    let fullMapping = event.mapped ? event.mapped.composeDesc(before) : before;
    return new HistEvent(mappedChanges, StateEffect.mapEffects(event.effects, mapping), fullMapping, event.startSelection.map(before), selections);
  }
  var joinableUserEvent = /^(input\.type|delete)($|\.)/;
  var HistoryState = class _HistoryState {
    constructor(done, undone, prevTime = 0, prevUserEvent = void 0) {
      this.done = done;
      this.undone = undone;
      this.prevTime = prevTime;
      this.prevUserEvent = prevUserEvent;
    }
    isolate() {
      return this.prevTime ? new _HistoryState(this.done, this.undone) : this;
    }
    addChanges(event, time, userEvent, config, tr) {
      let done = this.done, lastEvent = done[done.length - 1];
      if (lastEvent && lastEvent.changes && !lastEvent.changes.empty && event.changes && (!userEvent || joinableUserEvent.test(userEvent)) && (!lastEvent.selectionsAfter.length && time - this.prevTime < config.newGroupDelay && config.joinToEvent(tr, isAdjacent(lastEvent.changes, event.changes)) || // For compose (but not compose.start) events, always join with previous event
      userEvent == "input.type.compose")) {
        done = updateBranch(done, done.length - 1, config.minDepth, new HistEvent(event.changes.compose(lastEvent.changes), conc(StateEffect.mapEffects(event.effects, lastEvent.changes), lastEvent.effects), lastEvent.mapped, lastEvent.startSelection, none3));
      } else {
        done = updateBranch(done, done.length, config.minDepth, event);
      }
      return new _HistoryState(done, none3, time, userEvent);
    }
    addSelection(selection, time, userEvent, newGroupDelay) {
      let last2 = this.done.length ? this.done[this.done.length - 1].selectionsAfter : none3;
      if (last2.length > 0 && time - this.prevTime < newGroupDelay && userEvent == this.prevUserEvent && userEvent && /^select($|\.)/.test(userEvent) && eqSelectionShape(last2[last2.length - 1], selection))
        return this;
      return new _HistoryState(addSelection(this.done, selection), this.undone, time, userEvent);
    }
    addMapping(mapping) {
      return new _HistoryState(addMappingToBranch(this.done, mapping), addMappingToBranch(this.undone, mapping), this.prevTime, this.prevUserEvent);
    }
    pop(side, state, onlySelection) {
      let branch = side == 0 ? this.done : this.undone;
      if (branch.length == 0)
        return null;
      let event = branch[branch.length - 1], selection = event.selectionsAfter[0] || (event.startSelection ? event.startSelection.map(event.changes.invertedDesc, 1) : state.selection);
      if (onlySelection && event.selectionsAfter.length) {
        return state.update({
          selection: event.selectionsAfter[event.selectionsAfter.length - 1],
          annotations: fromHistory.of({ side, rest: popSelection(branch), selection }),
          userEvent: side == 0 ? "select.undo" : "select.redo",
          scrollIntoView: true
        });
      } else if (!event.changes) {
        return null;
      } else {
        let rest = branch.length == 1 ? none3 : branch.slice(0, branch.length - 1);
        if (event.mapped)
          rest = addMappingToBranch(rest, event.mapped);
        return state.update({
          changes: event.changes,
          selection: event.startSelection,
          effects: event.effects,
          annotations: fromHistory.of({ side, rest, selection }),
          filter: false,
          userEvent: side == 0 ? "undo" : "redo",
          scrollIntoView: true
        });
      }
    }
  };
  HistoryState.empty = /* @__PURE__ */ new HistoryState(none3, none3);
  var historyKeymap = [
    { key: "Mod-z", run: undo, preventDefault: true },
    { key: "Mod-y", mac: "Mod-Shift-z", run: redo, preventDefault: true },
    { linux: "Ctrl-Shift-z", run: redo, preventDefault: true },
    { key: "Mod-u", run: undoSelection, preventDefault: true },
    { key: "Alt-u", mac: "Mod-Shift-u", run: redoSelection, preventDefault: true }
  ];
  function updateSel(sel, by) {
    return EditorSelection.create(sel.ranges.map(by), sel.mainIndex);
  }
  function setSel(state, selection) {
    return state.update({ selection, scrollIntoView: true, userEvent: "select" });
  }
  function moveSel({ state, dispatch }, how) {
    let selection = updateSel(state.selection, how);
    if (selection.eq(state.selection, true))
      return false;
    dispatch(setSel(state, selection));
    return true;
  }
  function rangeEnd(range, forward) {
    return EditorSelection.cursor(forward ? range.to : range.from);
  }
  function cursorByChar(view2, forward) {
    return moveSel(view2, (range) => range.empty ? view2.moveByChar(range, forward) : rangeEnd(range, forward));
  }
  function ltrAtCursor(view2) {
    return view2.textDirectionAt(view2.state.selection.main.head) == Direction.LTR;
  }
  var cursorCharLeft = (view2) => cursorByChar(view2, !ltrAtCursor(view2));
  var cursorCharRight = (view2) => cursorByChar(view2, ltrAtCursor(view2));
  function cursorByGroup(view2, forward) {
    return moveSel(view2, (range) => range.empty ? view2.moveByGroup(range, forward) : rangeEnd(range, forward));
  }
  var cursorGroupLeft = (view2) => cursorByGroup(view2, !ltrAtCursor(view2));
  var cursorGroupRight = (view2) => cursorByGroup(view2, ltrAtCursor(view2));
  var segmenter = typeof Intl != "undefined" && Intl.Segmenter ? /* @__PURE__ */ new Intl.Segmenter(void 0, { granularity: "word" }) : null;
  function interestingNode(state, node, bracketProp) {
    if (node.type.prop(bracketProp))
      return true;
    let len = node.to - node.from;
    return len && (len > 2 || /[^\s,.;:]/.test(state.sliceDoc(node.from, node.to))) || node.firstChild;
  }
  function moveBySyntax(state, start, forward) {
    let pos = syntaxTree(state).resolveInner(start.head);
    let bracketProp = forward ? NodeProp.closedBy : NodeProp.openedBy;
    for (let at = start.head; ; ) {
      let next = forward ? pos.childAfter(at) : pos.childBefore(at);
      if (!next)
        break;
      if (interestingNode(state, next, bracketProp))
        pos = next;
      else
        at = forward ? next.to : next.from;
    }
    let bracket2 = pos.type.prop(bracketProp), match, newPos;
    if (bracket2 && (match = forward ? matchBrackets(state, pos.from, 1) : matchBrackets(state, pos.to, -1)) && match.matched)
      newPos = forward ? match.end.to : match.end.from;
    else
      newPos = forward ? pos.to : pos.from;
    return EditorSelection.cursor(newPos, forward ? -1 : 1);
  }
  var cursorSyntaxLeft = (view2) => moveSel(view2, (range) => moveBySyntax(view2.state, range, !ltrAtCursor(view2)));
  var cursorSyntaxRight = (view2) => moveSel(view2, (range) => moveBySyntax(view2.state, range, ltrAtCursor(view2)));
  function cursorByLine(view2, forward) {
    return moveSel(view2, (range) => {
      if (!range.empty)
        return rangeEnd(range, forward);
      let moved = view2.moveVertically(range, forward);
      return moved.head != range.head ? moved : view2.moveToLineBoundary(range, forward);
    });
  }
  var cursorLineUp = (view2) => cursorByLine(view2, false);
  var cursorLineDown = (view2) => cursorByLine(view2, true);
  function pageInfo(view2) {
    let selfScroll = view2.scrollDOM.clientHeight < view2.scrollDOM.scrollHeight - 2;
    let marginTop = 0, marginBottom = 0, height;
    if (selfScroll) {
      for (let source of view2.state.facet(EditorView.scrollMargins)) {
        let margins = source(view2);
        if (margins === null || margins === void 0 ? void 0 : margins.top)
          marginTop = Math.max(margins === null || margins === void 0 ? void 0 : margins.top, marginTop);
        if (margins === null || margins === void 0 ? void 0 : margins.bottom)
          marginBottom = Math.max(margins === null || margins === void 0 ? void 0 : margins.bottom, marginBottom);
      }
      height = view2.scrollDOM.clientHeight - marginTop - marginBottom;
    } else {
      height = (view2.dom.ownerDocument.defaultView || window).innerHeight;
    }
    return {
      marginTop,
      marginBottom,
      selfScroll,
      height: Math.max(view2.defaultLineHeight, height - 5)
    };
  }
  function cursorByPage(view2, forward) {
    let page = pageInfo(view2);
    let { state } = view2, selection = updateSel(state.selection, (range) => {
      return range.empty ? view2.moveVertically(range, forward, page.height) : rangeEnd(range, forward);
    });
    if (selection.eq(state.selection))
      return false;
    let effect;
    if (page.selfScroll) {
      let startPos = view2.coordsAtPos(state.selection.main.head);
      let scrollRect = view2.scrollDOM.getBoundingClientRect();
      let scrollTop = scrollRect.top + page.marginTop, scrollBottom = scrollRect.bottom - page.marginBottom;
      if (startPos && startPos.top > scrollTop && startPos.bottom < scrollBottom)
        effect = EditorView.scrollIntoView(selection.main.head, { y: "start", yMargin: startPos.top - scrollTop });
    }
    view2.dispatch(setSel(state, selection), { effects: effect });
    return true;
  }
  var cursorPageUp = (view2) => cursorByPage(view2, false);
  var cursorPageDown = (view2) => cursorByPage(view2, true);
  function moveByLineBoundary(view2, start, forward) {
    let line = view2.lineBlockAt(start.head), moved = view2.moveToLineBoundary(start, forward);
    if (moved.head == start.head && moved.head != (forward ? line.to : line.from))
      moved = view2.moveToLineBoundary(start, forward, false);
    if (!forward && moved.head == line.from && line.length) {
      let space = /^\s*/.exec(view2.state.sliceDoc(line.from, Math.min(line.from + 100, line.to)))[0].length;
      if (space && start.head != line.from + space)
        moved = EditorSelection.cursor(line.from + space);
    }
    return moved;
  }
  var cursorLineBoundaryForward = (view2) => moveSel(view2, (range) => moveByLineBoundary(view2, range, true));
  var cursorLineBoundaryBackward = (view2) => moveSel(view2, (range) => moveByLineBoundary(view2, range, false));
  var cursorLineBoundaryLeft = (view2) => moveSel(view2, (range) => moveByLineBoundary(view2, range, !ltrAtCursor(view2)));
  var cursorLineBoundaryRight = (view2) => moveSel(view2, (range) => moveByLineBoundary(view2, range, ltrAtCursor(view2)));
  var cursorLineStart = (view2) => moveSel(view2, (range) => view2.moveToLineBoundary(range, false, false));
  var cursorLineEnd = (view2) => moveSel(view2, (range) => view2.moveToLineBoundary(range, true, false));
  function toMatchingBracket(state, dispatch, extend) {
    let found = false, selection = updateSel(state.selection, (range) => {
      let matching = matchBrackets(state, range.head, -1) || matchBrackets(state, range.head, 1) || range.head > 0 && matchBrackets(state, range.head - 1, 1) || range.head < state.doc.length && matchBrackets(state, range.head + 1, -1);
      if (!matching || !matching.end)
        return range;
      found = true;
      let head = matching.start.from == range.head ? matching.end.to : matching.end.from;
      return extend ? EditorSelection.range(range.anchor, head) : EditorSelection.cursor(head);
    });
    if (!found)
      return false;
    dispatch(setSel(state, selection));
    return true;
  }
  var cursorMatchingBracket = ({ state, dispatch }) => toMatchingBracket(state, dispatch, false);
  function extendSel(target, forward, how) {
    let selection = updateSel(target.state.selection, (range) => {
      if (range.undirectional && range.head >= range.anchor != forward)
        range = EditorSelection.range(range.head, range.anchor);
      let head = how(range);
      return EditorSelection.range(range.anchor, head.head, head.goalColumn, head.bidiLevel || void 0, head.assoc);
    });
    if (selection.eq(target.state.selection))
      return false;
    target.dispatch(setSel(target.state, selection));
    return true;
  }
  function selectByChar(view2, forward) {
    return extendSel(view2, forward, (range) => view2.moveByChar(range, forward));
  }
  var selectCharLeft = (view2) => selectByChar(view2, !ltrAtCursor(view2));
  var selectCharRight = (view2) => selectByChar(view2, ltrAtCursor(view2));
  function selectByGroup(view2, forward) {
    return extendSel(view2, forward, (range) => view2.moveByGroup(range, forward));
  }
  var selectGroupLeft = (view2) => selectByGroup(view2, !ltrAtCursor(view2));
  var selectGroupRight = (view2) => selectByGroup(view2, ltrAtCursor(view2));
  var selectSyntaxLeft = (view2) => {
    let forward = !ltrAtCursor(view2);
    return extendSel(view2, forward, (range) => moveBySyntax(view2.state, range, forward));
  };
  var selectSyntaxRight = (view2) => {
    let forward = ltrAtCursor(view2);
    return extendSel(view2, forward, (range) => moveBySyntax(view2.state, range, forward));
  };
  function selectByLine(view2, forward) {
    return extendSel(view2, forward, (range) => view2.moveVertically(range, forward));
  }
  var selectLineUp = (view2) => selectByLine(view2, false);
  var selectLineDown = (view2) => selectByLine(view2, true);
  function selectByPage(view2, forward) {
    return extendSel(view2, forward, (range) => view2.moveVertically(range, forward, pageInfo(view2).height));
  }
  var selectPageUp = (view2) => selectByPage(view2, false);
  var selectPageDown = (view2) => selectByPage(view2, true);
  var selectLineBoundaryForward = (view2) => extendSel(view2, true, (range) => moveByLineBoundary(view2, range, true));
  var selectLineBoundaryBackward = (view2) => extendSel(view2, false, (range) => moveByLineBoundary(view2, range, false));
  var selectLineBoundaryLeft = (view2) => {
    let forward = !ltrAtCursor(view2);
    return extendSel(view2, forward, (range) => moveByLineBoundary(view2, range, forward));
  };
  var selectLineBoundaryRight = (view2) => {
    let forward = ltrAtCursor(view2);
    return extendSel(view2, forward, (range) => moveByLineBoundary(view2, range, forward));
  };
  var selectLineStart = (view2) => extendSel(view2, false, (range) => EditorSelection.cursor(view2.lineBlockAt(range.head).from));
  var selectLineEnd = (view2) => extendSel(view2, true, (range) => EditorSelection.cursor(view2.lineBlockAt(range.head).to));
  var cursorDocStart = ({ state, dispatch }) => {
    dispatch(setSel(state, { anchor: 0 }));
    return true;
  };
  var cursorDocEnd = ({ state, dispatch }) => {
    dispatch(setSel(state, { anchor: state.doc.length }));
    return true;
  };
  var selectDocStart = ({ state, dispatch }) => {
    dispatch(setSel(state, { anchor: state.selection.main.anchor, head: 0 }));
    return true;
  };
  var selectDocEnd = ({ state, dispatch }) => {
    dispatch(setSel(state, { anchor: state.selection.main.anchor, head: state.doc.length }));
    return true;
  };
  var selectAll = ({ state, dispatch }) => {
    dispatch(state.update({ selection: { anchor: 0, head: state.doc.length }, userEvent: "select" }));
    return true;
  };
  var selectLine = ({ state, dispatch }) => {
    let ranges = selectedLineBlocks(state).map(({ from, to }) => EditorSelection.undirectionalRange(from, Math.min(to + 1, state.doc.length)));
    dispatch(state.update({ selection: EditorSelection.create(ranges), userEvent: "select" }));
    return true;
  };
  var selectParentSyntax = ({ state, dispatch }) => {
    let selection = updateSel(state.selection, (range) => {
      let tree = syntaxTree(state), stack = tree.resolveStack(range.from, 1);
      if (range.empty) {
        let stackBefore = tree.resolveStack(range.from, -1);
        if (stackBefore.node.from >= stack.node.from && stackBefore.node.to <= stack.node.to)
          stack = stackBefore;
      }
      for (let cur2 = stack; cur2; cur2 = cur2.next) {
        let { node } = cur2;
        if ((node.from < range.from && node.to >= range.to || node.to > range.to && node.from <= range.from) && cur2.next)
          return EditorSelection.undirectionalRange(node.from, node.to);
      }
      return range;
    });
    if (selection.eq(state.selection))
      return false;
    dispatch(setSel(state, selection));
    return true;
  };
  function addCursorVertically(view2, forward) {
    let { state } = view2, sel = state.selection, ranges = state.selection.ranges.slice();
    for (let range of state.selection.ranges) {
      let line = state.doc.lineAt(range.head);
      if (forward ? line.to < view2.state.doc.length : line.from > 0)
        for (let cur2 = range; ; ) {
          let next = view2.moveVertically(cur2, forward);
          if (next.head < line.from || next.head > line.to) {
            if (!ranges.some((r) => r.head == next.head))
              ranges.push(next);
            break;
          } else if (next.head == cur2.head) {
            break;
          } else {
            cur2 = next;
          }
        }
    }
    if (ranges.length == sel.ranges.length)
      return false;
    view2.dispatch(setSel(state, EditorSelection.create(ranges, ranges.length - 1)));
    return true;
  }
  var addCursorAbove = (view2) => addCursorVertically(view2, false);
  var addCursorBelow = (view2) => addCursorVertically(view2, true);
  var simplifySelection = ({ state, dispatch }) => {
    let cur2 = state.selection, selection = null;
    if (cur2.ranges.length > 1)
      selection = EditorSelection.create([cur2.main]);
    else if (!cur2.main.empty)
      selection = EditorSelection.create([EditorSelection.cursor(cur2.main.head)]);
    if (!selection)
      return false;
    dispatch(setSel(state, selection));
    return true;
  };
  function deleteBy(target, by) {
    if (target.state.readOnly)
      return false;
    let event = "delete.selection", { state } = target;
    let changes = state.changeByRange((range) => {
      let { from, to } = range;
      if (from == to) {
        let towards = by(range);
        if (towards < from) {
          event = "delete.backward";
          towards = skipAtomic(target, towards, false);
        } else if (towards > from) {
          event = "delete.forward";
          towards = skipAtomic(target, towards, true);
        }
        from = Math.min(from, towards);
        to = Math.max(to, towards);
      } else {
        from = skipAtomic(target, from, false);
        to = skipAtomic(target, to, true);
      }
      return from == to ? { range } : { changes: { from, to }, range: EditorSelection.cursor(from, from < range.head ? -1 : 1) };
    });
    if (changes.changes.empty)
      return false;
    target.dispatch(state.update(changes, {
      scrollIntoView: true,
      userEvent: event,
      effects: event == "delete.selection" ? EditorView.announce.of(state.phrase("Selection deleted")) : void 0
    }));
    return true;
  }
  function skipAtomic(target, pos, forward) {
    if (target instanceof EditorView)
      for (let ranges of target.state.facet(EditorView.atomicRanges).map((f) => f(target)))
        ranges.between(pos, pos, (from, to) => {
          if (from < pos && to > pos)
            pos = forward ? to : from;
        });
    return pos;
  }
  var deleteByChar = (target, forward, byIndentUnit) => deleteBy(target, (range) => {
    let pos = range.from, { state } = target, line = state.doc.lineAt(pos), before, targetPos;
    if (byIndentUnit && !forward && pos > line.from && pos < line.from + 200 && !/[^ \t]/.test(before = line.text.slice(0, pos - line.from))) {
      if (before[before.length - 1] == "	")
        return pos - 1;
      let col = countColumn(before, state.tabSize), drop = col % getIndentUnit(state) || getIndentUnit(state);
      for (let i2 = 0; i2 < drop && before[before.length - 1 - i2] == " "; i2++)
        pos--;
      targetPos = pos;
    } else {
      targetPos = findClusterBreak2(line.text, pos - line.from, forward, forward) + line.from;
      if (targetPos == pos && line.number != (forward ? state.doc.lines : 1))
        targetPos += forward ? 1 : -1;
      else if (!forward && /[\ufe00-\ufe0f]/.test(line.text.slice(targetPos - line.from, pos - line.from)))
        targetPos = findClusterBreak2(line.text, targetPos - line.from, false, false) + line.from;
    }
    return targetPos;
  });
  var deleteCharBackward = (view2) => deleteByChar(view2, false, true);
  var deleteCharForward = (view2) => deleteByChar(view2, true, false);
  var deleteByGroup = (target, forward) => deleteBy(target, (range) => {
    let pos = range.head, { state } = target, line = state.doc.lineAt(pos);
    let categorize = state.charCategorizer(pos);
    for (let cat = null; ; ) {
      if (pos == (forward ? line.to : line.from)) {
        if (pos == range.head && line.number != (forward ? state.doc.lines : 1))
          pos += forward ? 1 : -1;
        break;
      }
      let next = findClusterBreak2(line.text, pos - line.from, forward) + line.from;
      let nextChar = line.text.slice(Math.min(pos, next) - line.from, Math.max(pos, next) - line.from);
      let nextCat = categorize(nextChar);
      if (cat != null && nextCat != cat)
        break;
      if (nextChar != " " || pos != range.head)
        cat = nextCat;
      pos = next;
    }
    return pos;
  });
  var deleteGroupBackward = (target) => deleteByGroup(target, false);
  var deleteGroupForward = (target) => deleteByGroup(target, true);
  var deleteToLineEnd = (view2) => deleteBy(view2, (range) => {
    let lineEnd = view2.lineBlockAt(range.head).to;
    return range.head < lineEnd ? lineEnd : Math.min(view2.state.doc.length, range.head + 1);
  });
  var deleteLineBoundaryBackward = (view2) => deleteBy(view2, (range) => {
    let lineStart = view2.moveToLineBoundary(range, false).head;
    return range.head > lineStart ? lineStart : Math.max(0, range.head - 1);
  });
  var deleteLineBoundaryForward = (view2) => deleteBy(view2, (range) => {
    let lineStart = view2.moveToLineBoundary(range, true).head;
    return range.head < lineStart ? lineStart : Math.min(view2.state.doc.length, range.head + 1);
  });
  var splitLine = ({ state, dispatch }) => {
    if (state.readOnly)
      return false;
    let changes = state.changeByRange((range) => {
      return {
        changes: { from: range.from, to: range.to, insert: Text.of(["", ""]) },
        range: EditorSelection.cursor(range.from)
      };
    });
    dispatch(state.update(changes, { scrollIntoView: true, userEvent: "input" }));
    return true;
  };
  var transposeChars = ({ state, dispatch }) => {
    if (state.readOnly)
      return false;
    let changes = state.changeByRange((range) => {
      if (!range.empty || range.from == 0 || range.from == state.doc.length)
        return { range };
      let pos = range.from, line = state.doc.lineAt(pos);
      let from = pos == line.from ? pos - 1 : findClusterBreak2(line.text, pos - line.from, false) + line.from;
      let to = pos == line.to ? pos + 1 : findClusterBreak2(line.text, pos - line.from, true) + line.from;
      return {
        changes: { from, to, insert: state.doc.slice(pos, to).append(state.doc.slice(from, pos)) },
        range: EditorSelection.cursor(to)
      };
    });
    if (changes.changes.empty)
      return false;
    dispatch(state.update(changes, { scrollIntoView: true, userEvent: "move.character" }));
    return true;
  };
  function selectedLineBlocks(state) {
    let blocks = [], upto = -1;
    for (let range of state.selection.ranges) {
      let startLine = state.doc.lineAt(range.from), endLine = state.doc.lineAt(range.to);
      if (!range.empty && range.to == endLine.from)
        endLine = state.doc.lineAt(range.to - 1);
      if (upto >= startLine.number) {
        let prev = blocks[blocks.length - 1];
        prev.to = endLine.to;
        prev.ranges.push(range);
      } else {
        blocks.push({ from: startLine.from, to: endLine.to, ranges: [range] });
      }
      upto = endLine.number + 1;
    }
    return blocks;
  }
  function moveLine(state, dispatch, forward) {
    if (state.readOnly)
      return false;
    let changes = [], ranges = [];
    for (let block of selectedLineBlocks(state)) {
      if (forward ? block.to == state.doc.length : block.from == 0)
        continue;
      let nextLine = state.doc.lineAt(forward ? block.to + 1 : block.from - 1);
      let size = nextLine.length + 1;
      if (forward) {
        changes.push({ from: block.to, to: nextLine.to }, { from: block.from, insert: nextLine.text + state.lineBreak });
        for (let r of block.ranges)
          ranges.push(EditorSelection.range(Math.min(state.doc.length, r.anchor + size), Math.min(state.doc.length, r.head + size)));
      } else {
        changes.push({ from: nextLine.from, to: block.from }, { from: block.to, insert: state.lineBreak + nextLine.text });
        for (let r of block.ranges)
          ranges.push(EditorSelection.range(r.anchor - size, r.head - size));
      }
    }
    if (!changes.length)
      return false;
    dispatch(state.update({
      changes,
      scrollIntoView: true,
      selection: EditorSelection.create(ranges, state.selection.mainIndex),
      userEvent: "move.line"
    }));
    return true;
  }
  var moveLineUp = ({ state, dispatch }) => moveLine(state, dispatch, false);
  var moveLineDown = ({ state, dispatch }) => moveLine(state, dispatch, true);
  function copyLine(state, dispatch, forward) {
    if (state.readOnly)
      return false;
    let changes = [];
    for (let block of selectedLineBlocks(state)) {
      if (forward)
        changes.push({ from: block.from, insert: state.doc.slice(block.from, block.to) + state.lineBreak });
      else
        changes.push({ from: block.to, insert: state.lineBreak + state.doc.slice(block.from, block.to) });
    }
    let changeSet = state.changes(changes);
    dispatch(state.update({
      changes: changeSet,
      selection: state.selection.map(changeSet, forward ? 1 : -1),
      scrollIntoView: true,
      userEvent: "input.copyline"
    }));
    return true;
  }
  var copyLineUp = ({ state, dispatch }) => copyLine(state, dispatch, false);
  var copyLineDown = ({ state, dispatch }) => copyLine(state, dispatch, true);
  var deleteLine = (view2) => {
    if (view2.state.readOnly)
      return false;
    let { state } = view2, changes = state.changes(selectedLineBlocks(state).map(({ from, to }) => {
      if (from > 0)
        from--;
      else if (to < state.doc.length)
        to++;
      return { from, to };
    }));
    let selection = updateSel(state.selection, (range) => {
      let dist2 = void 0;
      if (view2.lineWrapping) {
        let block = view2.lineBlockAt(range.head), pos = view2.coordsAtPos(range.head, range.assoc || 1);
        if (pos)
          dist2 = block.bottom + view2.documentTop - pos.bottom + view2.defaultLineHeight / 2;
      }
      return view2.moveVertically(range, true, dist2);
    }).map(changes);
    view2.dispatch({ changes, selection, scrollIntoView: true, userEvent: "delete.line" });
    return true;
  };
  function isBetweenBrackets(state, pos) {
    if (/\(\)|\[\]|\{\}/.test(state.sliceDoc(pos - 1, pos + 1)))
      return { from: pos, to: pos };
    let context = syntaxTree(state).resolveInner(pos);
    let before = context.childBefore(pos), after = context.childAfter(pos), closedBy;
    if (before && after && before.to <= pos && after.from >= pos && (closedBy = before.type.prop(NodeProp.closedBy)) && closedBy.indexOf(after.name) > -1 && state.doc.lineAt(before.to).from == state.doc.lineAt(after.from).from && !/\S/.test(state.sliceDoc(before.to, after.from)))
      return { from: before.to, to: after.from };
    return null;
  }
  var insertNewlineAndIndent = /* @__PURE__ */ newlineAndIndent(false);
  var insertBlankLine = /* @__PURE__ */ newlineAndIndent(true);
  function newlineAndIndent(atEof) {
    return ({ state, dispatch }) => {
      if (state.readOnly)
        return false;
      let changes = state.changeByRange((range) => {
        let { from, to } = range, line = state.doc.lineAt(from);
        let explode = !atEof && from == to && isBetweenBrackets(state, from);
        if (atEof)
          from = to = (to <= line.to ? line : state.doc.lineAt(to)).to;
        let cx = new IndentContext(state, { simulateBreak: from, simulateDoubleBreak: !!explode });
        let indent = getIndentation(cx, from);
        if (indent == null)
          indent = countColumn(/^\s*/.exec(state.doc.lineAt(from).text)[0], state.tabSize);
        while (to < line.to && /\s/.test(line.text[to - line.from]))
          to++;
        if (explode)
          ({ from, to } = explode);
        else if (from > line.from && from < line.from + 100 && !/\S/.test(line.text.slice(0, from)))
          from = line.from;
        let insert2 = ["", indentString(state, indent)];
        if (explode)
          insert2.push(indentString(state, cx.lineIndent(line.from, -1)));
        return {
          changes: { from, to, insert: Text.of(insert2) },
          range: EditorSelection.cursor(from + 1 + insert2[1].length)
        };
      });
      dispatch(state.update(changes, { scrollIntoView: true, userEvent: "input" }));
      return true;
    };
  }
  function changeBySelectedLine(state, f) {
    let atLine = -1;
    return state.changeByRange((range) => {
      let changes = [];
      for (let pos = range.from; pos <= range.to; ) {
        let line = state.doc.lineAt(pos);
        if (line.number > atLine && (range.empty || range.to > line.from)) {
          f(line, changes, range);
          atLine = line.number;
        }
        pos = line.to + 1;
      }
      let changeSet = state.changes(changes);
      return {
        changes,
        range: EditorSelection.range(changeSet.mapPos(range.anchor, 1), changeSet.mapPos(range.head, 1))
      };
    });
  }
  var indentSelection = ({ state, dispatch }) => {
    if (state.readOnly)
      return false;
    let updated = /* @__PURE__ */ Object.create(null);
    let context = new IndentContext(state, { overrideIndentation: (start) => {
      let found = updated[start];
      return found == null ? -1 : found;
    } });
    let changes = changeBySelectedLine(state, (line, changes2, range) => {
      let indent = getIndentation(context, line.from);
      if (indent == null)
        return;
      if (!/\S/.test(line.text))
        indent = 0;
      let cur2 = /^\s*/.exec(line.text)[0];
      let norm = indentString(state, indent);
      if (cur2 != norm || range.from < line.from + cur2.length) {
        updated[line.from] = indent;
        changes2.push({ from: line.from, to: line.from + cur2.length, insert: norm });
      }
    });
    if (!changes.changes.empty)
      dispatch(state.update(changes, { userEvent: "indent" }));
    return true;
  };
  var indentMore = ({ state, dispatch }) => {
    if (state.readOnly)
      return false;
    dispatch(state.update(changeBySelectedLine(state, (line, changes) => {
      changes.push({ from: line.from, insert: state.facet(indentUnit) });
    }), { userEvent: "input.indent" }));
    return true;
  };
  var indentLess = ({ state, dispatch }) => {
    if (state.readOnly)
      return false;
    dispatch(state.update(changeBySelectedLine(state, (line, changes) => {
      let space = /^\s*/.exec(line.text)[0];
      if (!space)
        return;
      let col = countColumn(space, state.tabSize), keep = 0;
      let insert2 = indentString(state, Math.max(0, col - getIndentUnit(state)));
      while (keep < space.length && keep < insert2.length && space.charCodeAt(keep) == insert2.charCodeAt(keep))
        keep++;
      changes.push({ from: line.from + keep, to: line.from + space.length, insert: insert2.slice(keep) });
    }), { userEvent: "delete.dedent" }));
    return true;
  };
  var toggleTabFocusMode = (view2) => {
    view2.setTabFocusMode();
    return true;
  };
  var emacsStyleKeymap = [
    { key: "Ctrl-b", run: cursorCharLeft, shift: selectCharLeft, preventDefault: true },
    { key: "Ctrl-f", run: cursorCharRight, shift: selectCharRight },
    { key: "Ctrl-p", run: cursorLineUp, shift: selectLineUp },
    { key: "Ctrl-n", run: cursorLineDown, shift: selectLineDown },
    { key: "Ctrl-a", run: cursorLineStart, shift: selectLineStart },
    { key: "Ctrl-e", run: cursorLineEnd, shift: selectLineEnd },
    { key: "Ctrl-d", run: deleteCharForward },
    { key: "Ctrl-h", run: deleteCharBackward },
    { key: "Ctrl-k", run: deleteToLineEnd },
    { key: "Ctrl-Alt-h", run: deleteGroupBackward },
    { key: "Ctrl-o", run: splitLine },
    { key: "Ctrl-t", run: transposeChars },
    { key: "Ctrl-v", run: cursorPageDown }
  ];
  var standardKeymap = /* @__PURE__ */ [
    { key: "ArrowLeft", run: cursorCharLeft, shift: selectCharLeft, preventDefault: true },
    { key: "Mod-ArrowLeft", mac: "Alt-ArrowLeft", run: cursorGroupLeft, shift: selectGroupLeft, preventDefault: true },
    { mac: "Cmd-ArrowLeft", run: cursorLineBoundaryLeft, shift: selectLineBoundaryLeft, preventDefault: true },
    { key: "ArrowRight", run: cursorCharRight, shift: selectCharRight, preventDefault: true },
    { key: "Mod-ArrowRight", mac: "Alt-ArrowRight", run: cursorGroupRight, shift: selectGroupRight, preventDefault: true },
    { mac: "Cmd-ArrowRight", run: cursorLineBoundaryRight, shift: selectLineBoundaryRight, preventDefault: true },
    { key: "ArrowUp", run: cursorLineUp, shift: selectLineUp, preventDefault: true },
    { mac: "Cmd-ArrowUp", run: cursorDocStart, shift: selectDocStart },
    { mac: "Ctrl-ArrowUp", run: cursorPageUp, shift: selectPageUp },
    { key: "ArrowDown", run: cursorLineDown, shift: selectLineDown, preventDefault: true },
    { mac: "Cmd-ArrowDown", run: cursorDocEnd, shift: selectDocEnd },
    { mac: "Ctrl-ArrowDown", run: cursorPageDown, shift: selectPageDown },
    { key: "PageUp", run: cursorPageUp, shift: selectPageUp },
    { key: "PageDown", run: cursorPageDown, shift: selectPageDown },
    { key: "Home", run: cursorLineBoundaryBackward, shift: selectLineBoundaryBackward, preventDefault: true },
    { key: "Mod-Home", run: cursorDocStart, shift: selectDocStart },
    { key: "End", run: cursorLineBoundaryForward, shift: selectLineBoundaryForward, preventDefault: true },
    { key: "Mod-End", run: cursorDocEnd, shift: selectDocEnd },
    { key: "Enter", run: insertNewlineAndIndent, shift: insertNewlineAndIndent },
    { key: "Mod-a", run: selectAll },
    { key: "Backspace", run: deleteCharBackward, shift: deleteCharBackward, preventDefault: true },
    { key: "Delete", run: deleteCharForward, preventDefault: true },
    { key: "Mod-Backspace", mac: "Alt-Backspace", run: deleteGroupBackward, preventDefault: true },
    { key: "Mod-Delete", mac: "Alt-Delete", run: deleteGroupForward, preventDefault: true },
    { mac: "Mod-Backspace", run: deleteLineBoundaryBackward, preventDefault: true },
    { mac: "Mod-Delete", run: deleteLineBoundaryForward, preventDefault: true }
  ].concat(/* @__PURE__ */ emacsStyleKeymap.map((b) => ({ mac: b.key, run: b.run, shift: b.shift })));
  var defaultKeymap = /* @__PURE__ */ [
    { key: "Alt-ArrowLeft", mac: "Ctrl-ArrowLeft", run: cursorSyntaxLeft, shift: selectSyntaxLeft },
    { key: "Alt-ArrowRight", mac: "Ctrl-ArrowRight", run: cursorSyntaxRight, shift: selectSyntaxRight },
    { key: "Alt-ArrowUp", run: moveLineUp },
    { key: "Shift-Alt-ArrowUp", run: copyLineUp },
    { key: "Alt-ArrowDown", run: moveLineDown },
    { key: "Shift-Alt-ArrowDown", run: copyLineDown },
    { key: "Mod-Alt-ArrowUp", run: addCursorAbove },
    { key: "Mod-Alt-ArrowDown", run: addCursorBelow },
    { key: "Escape", run: simplifySelection },
    { key: "Mod-Enter", run: insertBlankLine },
    { key: "Alt-l", mac: "Ctrl-l", run: selectLine },
    { key: "Mod-i", run: selectParentSyntax, preventDefault: true },
    { key: "Mod-[", run: indentLess },
    { key: "Mod-]", run: indentMore },
    { key: "Mod-Alt-\\", run: indentSelection },
    { key: "Shift-Mod-k", run: deleteLine },
    { key: "Shift-Mod-\\", run: cursorMatchingBracket },
    { key: "Mod-/", run: toggleComment },
    { key: "Alt-A", mac: "Ctrl-A", run: toggleBlockComment },
    { key: "Ctrl-m", mac: "Shift-Alt-m", run: toggleTabFocusMode }
  ].concat(standardKeymap);
  var indentWithTab = { key: "Tab", run: indentMore, shift: indentLess };

  // server/sql-script.js
  function skipQuoted(sql, i2) {
    const quote = sql[i2];
    i2 += 1;
    while (i2 < sql.length) {
      if (sql[i2] === "\\" && quote !== "`") {
        i2 += 2;
        continue;
      }
      if (sql[i2] === quote) {
        if (sql[i2 + 1] === quote) {
          i2 += 2;
          continue;
        }
        return i2 + 1;
      }
      i2 += 1;
    }
    return i2;
  }
  function splitStatements(sql) {
    const text = String(sql ?? "");
    const out = [];
    let start = 0;
    let i2 = 0;
    while (i2 < text.length) {
      const c = text[i2];
      if (c === "'" || c === '"' || c === "`") {
        i2 = skipQuoted(text, i2);
        continue;
      }
      if (c === "-" && text[i2 + 1] === "-") {
        const nl = text.indexOf("\n", i2);
        i2 = nl < 0 ? text.length : nl + 1;
        continue;
      }
      if (c === "#") {
        const nl = text.indexOf("\n", i2);
        i2 = nl < 0 ? text.length : nl + 1;
        continue;
      }
      if (c === "/" && text[i2 + 1] === "*") {
        const end = text.indexOf("*/", i2 + 2);
        i2 = end < 0 ? text.length : end + 2;
        continue;
      }
      if (c === ";") {
        const body = text.slice(start, i2).trim();
        if (body) out.push({ start, end: i2 + 1, text: body });
        start = i2 + 1;
        i2 += 1;
        continue;
      }
      i2 += 1;
    }
    const tail = text.slice(start).trim();
    if (tail) out.push({ start, end: text.length, text: tail });
    return out;
  }
  function statementAt(sql, pos) {
    const text = String(sql ?? "");
    const at = Math.max(0, Math.min(Number(pos) || 0, text.length));
    const parts = splitStatements(text);
    if (!parts.length) return null;
    const hit = parts.find((part) => at >= part.start && at <= part.end);
    if (hit) return hit;
    const next = parts.find((part) => part.start >= at);
    return next || parts[parts.length - 1];
  }
  function isRunnable(sql) {
    let i2 = 0;
    const text = String(sql ?? "");
    while (i2 < text.length) {
      const c = text[i2];
      if (c === "'" || c === '"' || c === "`") {
        i2 = skipQuoted(text, i2);
        return true;
      }
      if (c === "-" && text[i2 + 1] === "-") {
        const nl = text.indexOf("\n", i2);
        i2 = nl < 0 ? text.length : nl + 1;
        continue;
      }
      if (c === "#") {
        const nl = text.indexOf("\n", i2);
        i2 = nl < 0 ? text.length : nl + 1;
        continue;
      }
      if (c === "/" && text[i2 + 1] === "*") {
        const end = text.indexOf("*/", i2 + 2);
        i2 = end < 0 ? text.length : end + 2;
        continue;
      }
      if (!/\s/.test(c)) return true;
      i2 += 1;
    }
    return false;
  }
  function unquote(token) {
    const s = String(token ?? "").trim();
    if (s.length >= 2 && s.startsWith("`") && s.endsWith("`")) return s.slice(1, -1).replaceAll("``", "`");
    return s;
  }
  function quoteIdent(name2) {
    const s = String(name2 ?? "");
    if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(s)) return s;
    return "`" + s.replaceAll("`", "``") + "`";
  }
  var ALIAS_STOP = /* @__PURE__ */ new Set([
    "WHERE",
    "ON",
    "LEFT",
    "RIGHT",
    "INNER",
    "OUTER",
    "CROSS",
    "FULL",
    "JOIN",
    "GROUP",
    "ORDER",
    "LIMIT",
    "UNION",
    "SELECT",
    "HAVING",
    "AND",
    "OR",
    "SET",
    "USING",
    "OFFSET",
    "ASC",
    "DESC"
  ]);
  function cteNames(sql) {
    const names = [];
    const re = /(?:\bWITH\b|,)\s*(`[^`]+`|[A-Za-z_][\w$]*)\s+AS\s*\(/gi;
    let match;
    while (match = re.exec(String(sql ?? ""))) {
      const name2 = unquote(match[1]);
      if (name2) names.push(name2);
    }
    return names;
  }
  function aliasMap(sql) {
    const map = /* @__PURE__ */ new Map();
    const re = /\b(?:FROM|JOIN)\s+(`[^`]+`|[A-Za-z_][\w$]*)(?:\s+(?:AS\s+)?(`[^`]+`|[A-Za-z_][\w$]*))?/gi;
    let match;
    while (match = re.exec(String(sql ?? ""))) {
      const table = unquote(match[1]);
      if (!table) continue;
      map.set(table.toLowerCase(), table);
      if (!match[2]) continue;
      const alias = unquote(match[2]);
      if (alias && !ALIAS_STOP.has(alias.toUpperCase())) map.set(alias.toLowerCase(), table);
    }
    return map;
  }
  function completionTarget(raw, cursor) {
    const text = String(raw ?? "");
    const head = text.slice(0, Math.max(0, Math.min(Number(cursor) || 0, text.length)));
    const fromJoin = head.match(/\b(?:FROM|JOIN)\s+([\s\S]*)$/i);
    if (fromJoin && !/\b(?:WHERE|ON|GROUP|ORDER|LIMIT|UNION|HAVING|SET|SELECT)\b/i.test(fromJoin[1])) {
      const rest = fromJoin[1];
      const tok = rest.match(/(`[^`]*|[A-Za-z_][\w$]*)$/);
      const rawTok = tok ? tok[1] : "";
      if (rawTok.startsWith("`")) {
        return { kind: "tables", from: head.length - (rawTok.length - 1), prefix: rawTok.slice(1) };
      }
      return { kind: "tables", from: head.length - rawTok.length, prefix: rawTok };
    }
    const col = head.match(/(?:`([^`]+)`|([A-Za-z_][\w$]*))\s*\.\s*(`([^`]*)|([A-Za-z_][\w$]*))?$/);
    if (col) {
      const name2 = col[1] || col[2];
      const partial = col[4] != null ? col[4] : col[5] || "";
      const consumed = col[3] != null ? col[3].length : (col[5] || "").length;
      return { kind: "columns", name: name2, from: head.length - consumed, prefix: partial };
    }
    const word = head.match(/[A-Za-z_][\w$]*$/);
    if (!word) return { kind: "mixed", from: head.length, prefix: "" };
    return { kind: "mixed", from: head.length - word[0].length, prefix: word[0] };
  }

  // editor/sql-editor-entry.js
  var KEYWORDS = [
    "SELECT",
    "DISTINCT",
    "FROM",
    "WHERE",
    "AND",
    "OR",
    "NOT",
    "IN",
    "IS",
    "NULL",
    "LIKE",
    "BETWEEN",
    "EXISTS",
    "AS",
    "ON",
    "USING",
    "JOIN",
    "INNER JOIN",
    "LEFT JOIN",
    "RIGHT JOIN",
    "CROSS JOIN",
    "GROUP BY",
    "HAVING",
    "ORDER BY",
    "ASC",
    "DESC",
    "LIMIT",
    "OFFSET",
    "UNION",
    "UNION ALL",
    "WITH",
    "CASE",
    "WHEN",
    "THEN",
    "ELSE",
    "END",
    "CAST",
    "INTERVAL",
    "TRUE",
    "FALSE",
    "SHOW",
    "DESCRIBE",
    "EXPLAIN"
  ];
  var FUNCTIONS = [
    "COUNT",
    "SUM",
    "AVG",
    "MIN",
    "MAX",
    "ROUND",
    "COALESCE",
    "IFNULL",
    "NULLIF",
    "CONCAT",
    "SUBSTRING",
    "DATE_FORMAT",
    "YEAR",
    "MONTH",
    "DAY",
    "NOW",
    "CURDATE"
  ];
  var view = null;
  var tables = [];
  var columnsFor = async () => [];
  var themeCompartment = new Compartment();
  function colors(dark) {
    return HighlightStyle.define([
      { tag: tags.keyword, color: dark ? "#c586c0" : "#7a3e9d" },
      { tag: tags.string, color: dark ? "#ce9178" : "#a31515" },
      { tag: tags.number, color: dark ? "#b5cea8" : "#098658" },
      { tag: tags.comment, color: dark ? "#6a9955" : "#008000", fontStyle: "italic" },
      { tag: tags.operator, color: dark ? "#d4d4d4" : "#333333" },
      { tag: [tags.name, tags.propertyName], color: dark ? "#9cdcfe" : "#0b6280" },
      { tag: tags.typeName, color: dark ? "#4ec9b0" : "#267f99" },
      { tag: tags.function(tags.variableName), color: dark ? "#dcdcaa" : "#795e26" }
    ]);
  }
  function chrome2(dark) {
    const line = dark ? "#38383f" : "#d5d8de";
    return EditorView.theme({
      "&": {
        height: "100%",
        backgroundColor: dark ? "#161618" : "#ffffff",
        color: dark ? "#e2e2e6" : "#1c1d21"
      },
      ".cm-scroller": { fontFamily: "var(--font-mono)", fontSize: "13px", lineHeight: "1.55" },
      ".cm-gutters": {
        backgroundColor: dark ? "#1f1f23" : "#f3f4f6",
        color: dark ? "#818190" : "#5c6370",
        borderRight: `1px solid ${line}`
      },
      ".cm-activeLine": { backgroundColor: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" },
      ".cm-activeLineGutter": { backgroundColor: "transparent" },
      "&.cm-focused": { outline: "none" },
      ".cm-tooltip-autocomplete": {
        backgroundColor: dark ? "#28282e" : "#ffffff",
        color: dark ? "#e2e2e6" : "#1c1d21",
        border: `1px solid ${dark ? "#46464f" : "#c3c7d0"}`
      },
      ".cm-tooltip-autocomplete ul li[aria-selected]": { backgroundColor: dark ? "#1e8fb3" : "#0b7ea0", color: "#fff" },
      ".cm-completionDetail": { marginLeft: "12px", fontStyle: "normal", opacity: "0.75" }
    }, { dark });
  }
  function themeExt(dark) {
    return [chrome2(dark), syntaxHighlighting(colors(dark))];
  }
  function applyPlain(view2, completion, from, to) {
    const insert2 = completion.label;
    view2.dispatch({ changes: { from, to, insert: insert2 }, selection: { anchor: from + insert2.length } });
  }
  function applyIdent(view2, completion, from, to) {
    let start = from;
    let end = to;
    if (view2.state.doc.sliceString(start - 1, start) === "`") start -= 1;
    if (view2.state.doc.sliceString(end, end + 1) === "`") end += 1;
    const insert2 = quoteIdent(completion.label);
    view2.dispatch({ changes: { from: start, to: end, insert: insert2 }, selection: { anchor: start + insert2.length } });
  }
  async function complete(context) {
    const doc2 = context.state.doc.toString();
    const pos = context.pos;
    const stmt = statementAt(doc2, pos) || { start: 0, end: doc2.length, text: doc2 };
    const raw = doc2.slice(stmt.start, stmt.end);
    const target = completionTarget(raw, pos - stmt.start);
    if (!target) return null;
    if (target.kind === "mixed" && !target.prefix && !context.explicit) return null;
    const options = [];
    if (target.kind !== "columns") {
      for (const word of KEYWORDS) options.push({ label: word, type: "keyword", apply: applyPlain });
      for (const word of FUNCTIONS) options.push({ label: word, type: "function", apply: applyPlain });
    }
    if (target.kind === "tables" || target.kind === "mixed") {
      for (const name2 of tables) {
        options.push({
          label: name2,
          type: "type",
          detail: "table",
          boost: target.kind === "tables" ? 2 : 0,
          apply: applyIdent
        });
      }
    }
    if (target.kind === "columns" || target.kind === "mixed" && target.prefix) {
      const map = aliasMap(raw);
      const names = [];
      if (target.kind === "columns" && target.name) names.push(map.get(target.name.toLowerCase()) || target.name);
      else for (const table of new Set(map.values())) names.push(table);
      const seen = /* @__PURE__ */ new Set();
      for (const table of names) {
        let cols = [];
        try {
          cols = await columnsFor(table);
        } catch {
          cols = [];
        }
        for (const col of cols) {
          const key = String(col.name).toLowerCase();
          if (seen.has(key)) continue;
          seen.add(key);
          options.push({
            label: col.name,
            type: "property",
            detail: col.type || "column",
            boost: 3,
            apply: applyIdent
          });
        }
      }
    }
    if (!options.length) return null;
    return { from: stmt.start + target.from, options, validFor: /^[\w$]*$/ };
  }
  function formatScript(doc2, formatOne) {
    const parts = splitStatements(doc2);
    if (!parts.length) return doc2;
    const body = parts.map((part) => {
      if (!isRunnable(part.text)) return part.text.trim();
      try {
        return String(formatOne(part.text) || part.text).trim().replace(/;+\s*$/, "");
      } catch {
        return part.text.trim().replace(/;+\s*$/, "");
      }
    }).filter(Boolean).join(";\n\n");
    return body ? body + ";\n" : doc2;
  }
  function mount(parent, opts = {}) {
    if (view) view.destroy();
    const dark = !!opts.dark;
    const hint = opts.placeholder || "Write several SELECT statements. Completions appear as you type.";
    view = new EditorView({
      parent,
      state: EditorState.create({
        doc: opts.doc || "",
        extensions: [
          lineNumbers(),
          highlightActiveLine(),
          highlightActiveLineGutter(),
          drawSelection(),
          history(),
          bracketMatching(),
          keymap.of([
            { key: "Mod-Enter", run: () => {
              opts.onRun?.("primary");
              return true;
            } },
            { key: "Mod-Shift-Enter", run: () => {
              opts.onRun?.("all");
              return true;
            } },
            indentWithTab,
            ...completionKeymap,
            ...defaultKeymap,
            ...historyKeymap
          ]),
          MySQL.language,
          autocompletion({ override: [complete] }),
          placeholder(hint),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) opts.onChange?.(update.state.doc.toString());
            if (update.selectionSet) opts.onSelection?.(update.state.selection.main.empty);
            if (!update.docChanged || !update.view.hasFocus) return;
            let inserted = "";
            update.changes.iterChanges((_a2, _b, _c, _d, ins) => {
              inserted += ins.toString();
            });
            if (inserted !== "." && inserted !== " ") return;
            const pos = update.state.selection.main.head;
            const line = update.state.doc.lineAt(pos);
            const before = line.text.slice(0, pos - line.from);
            if (inserted === "." || /\b(?:FROM|JOIN)\s+$/i.test(before)) startCompletion(update.view);
          }),
          themeCompartment.of(themeExt(dark))
        ]
      })
    });
    return view;
  }
  function runPlan(mode) {
    if (!view) return [];
    const doc2 = view.state.doc.toString();
    const sel = view.state.selection.main;
    const which = mode === "primary" ? sel.empty ? "current" : "selection" : mode;
    if (which === "selection") {
      return splitStatements(view.state.sliceDoc(sel.from, sel.to)).map((part) => part.text).filter(isRunnable);
    }
    if (which === "all") return splitStatements(doc2).map((part) => part.text).filter(isRunnable);
    const stmt = statementAt(doc2, sel.head);
    return stmt && isRunnable(stmt.text) ? [stmt.text] : [];
  }
  globalThis.SqlEditor = {
    mount,
    setTables(names) {
      tables = Array.isArray(names) ? names : [];
    },
    setColumnsFor(fn) {
      columnsFor = typeof fn === "function" ? fn : async () => [];
    },
    getDoc() {
      return view ? view.state.doc.toString() : "";
    },
    setDoc(text) {
      if (!view) return;
      const next = String(text ?? "");
      if (next === view.state.doc.toString()) return;
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: next } });
    },
    format(formatOne) {
      if (!view) return;
      const sel = view.state.selection.main;
      if (!sel.empty) {
        const next2 = formatScript(view.state.sliceDoc(sel.from, sel.to), formatOne);
        view.dispatch({
          changes: { from: sel.from, to: sel.to, insert: next2 },
          selection: { anchor: sel.from, head: sel.from + next2.length }
        });
        return;
      }
      const next = formatScript(view.state.doc.toString(), formatOne);
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: next } });
    },
    runPlan,
    selectionEmpty() {
      return !view || view.state.selection.main.empty;
    },
    setDark(dark) {
      if (!view) return;
      view.dispatch({ effects: themeCompartment.reconfigure(themeExt(!!dark)) });
    },
    focus() {
      view?.focus();
    },
    cteNames
  };
})();
