import React from 'react';
import Dictionary from '../lib/Dictionary';
import keyBindings from '../lib/keyBindings';

export default class Editor extends React.Component {
  state = {
    col: 0, row: 0,
    rows: ['function() {}'],
    __html: '',
    dirty: false
  }

  textAreaRef = React.createRef()

  componentDidMount() {
    // Get hold of the text area DOM element
    const textArea = this.textAreaRef.current;
    textArea.focus();
    const lineHeight = window.getComputedStyle(textArea).lineHeight;
    this.setState({ lineHeight, __html: this.rowsToHtml(this.state.rows) });
  }

  componentDidUpdate() {
    if(this.state.dirty) {
      const newState = { dirty: false, __html: this.rowsToHtml(this.state.rows) };
      this.setState(newState);
    }
  }

  handleKeyDown = (e) => {
    e.preventDefault();
    console.log('pressed', e.key);
    if(e.key.length === 1) return this.insertCharacter(e.key);
    switch(e.key) {
      case keyBindings.up:
        this.goUp();
        break;
      case keyBindings.down:
        this.goDown();
        break;
      case keyBindings.left:
        this.goLeft();
        break;
      case keyBindings.right:
        this.goRight();
        break;
      case keyBindings.newLine:
        this.newLine();
        break;
      case keyBindings.Backspace:
        this.backspace();
        break;
      case 'Tab':
        this.insertCharacter('  ');
        break;
    }
  }

  goLeft() {
    if(this.state.col > 0) this.setState({ col: this.state.col - 1 });
  }

  goRight() {
    const { row, col, rows } = this.state;
    if(col < rows[row].length - 1) {
      this.setState({ col: this.state.col + 1 });
    } else if(row < rows.length - 1){
      this.setState({ col: 0, row: row + 1 });
    }
  }

  goUp() {
    if(this.state.row > 0) this.setState({ row: this.state.row - 1 });
  }

  goDown() {
    if(this.state.rows < this.state.rows.length - 1) this.setState({ row: this.state.row + 1 });
  }

  rowsToHtml(rows) {
    return rows.map(row => this.textToHtml(row)).join('<br />');
  }

  textToHtml(text) {
    let html = text;
    html = addSpansToKeywords(html);
    html = html.replace(/ /g, '&nbsp;');
    return html;
  }

  insertCharacter = (toInsert) => {
    const { row, col } = this.state;
    toInsert = toInsert.toString();
    const rows = this.state.rows.slice(); // Copy the array
    rows[row] = rows[row].insert(toInsert, col);
    this.setState({ rows, col: col + toInsert.length, dirty: true });
  }

  backspace = () => {
    const { row, col } = this.state;
    const rows = this.state.rows.slice();
    rows[row] = rows[row].removeAt(col - 1);
    this.setState({ rows, col: col - 1, dirty: true })
  }

  cursorPosition = () => {
    const { row, col } = this.state;
    const lineHeight = parseInt(this.state.lineHeight);
    return {
      left: `${col}ch`,
      top: `${row * lineHeight}px`,
      height: lineHeight / 1.2
    };
  }

  newLine = () => {
    const { row, col, rows } = this.state;
    const currentLine = rows[row];
    const currentLineText = currentLine.slice(0, col);
    const nextLineText = currentLine.slice(col);
    const newRows = [...rows.slice(0, row), currentLineText, nextLineText, ...rows.slice(row + 1)];
    this.setState({ rows: newRows, col: 0, row: row + 1, dirty: true });
  }

  render() {
    return (
      <section className="editor">
        <div className="left-panel">
          <div className="line-numbers"></div>
        </div>
        <div className="right-panel">
          <div className="text-area">
            {/* tabIndex is requred to allow a div to receive keyDown events */}
            <div className="text-content" onKeyDown={this.handleKeyDown}
              tabIndex="0" dangerouslySetInnerHTML={this.state}
              ref={this.textAreaRef}
            ></div>
            {this.state.lineHeight && <div className="cursor" style={this.cursorPosition()}></div>}
          </div>
        </div>
      </section>
    );
  }
}

String.prototype.insert = function(character, atPosition) {
  console.log(`inserting |${character}| here`);
  const before = this.slice(0, atPosition);
  const after = this.slice(atPosition);
  return before + character + after;
}

String.prototype.wrapWithTag = function(tagName, className) {
  return `<${tagName} class="${className}">${this}</${tagName}>`;
}

String.prototype.removeAt = function(index) {
  return this.slice(0, index) + this.slice(index + 1);
}

function regexFindWord(word) {
  return new RegExp(`\\b${word}\\b`, 'g')
}

function addSpansToKeywords(text) {
  for(const i in Dictionary.keywords) {
    const keyword = Dictionary.keywords[i];
    text = text.replace(regexFindWord(keyword), keyword.wrapWithTag('span', 'keyword'));
  }
  return text;
}
