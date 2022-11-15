import { semanticColorVars } from '../../styles/core.css';

const tag = semanticColorVars.foregroundColors.blue;
const attribute = semanticColorVars.foregroundColors.pink;
const value = semanticColorVars.foregroundColors.purple;
const punctuation = semanticColorVars.foregroundColors.blue;
const plainText = 'white';
const meta = semanticColorVars.foregroundColors.blue;
const other = semanticColorVars.foregroundColors.blue;
const inserted = semanticColorVars.foregroundColors.blue;
const deleted = semanticColorVars.foregroundColors.blue;

export const codeTheme = {
  'attr-name': {
    color: attribute,
  },
  'attr-value': {
    color: value,
  },
  bold: {
    fontWeight: 'bold',
  },
  boolean: {
    color: value,
  },
  builtin: {
    color: other,
  },
  cdata: {
    color: meta,
  },
  char: {
    color: value,
  },
  'code[class*="language-"]': {
    color: plainText,
    whiteSpace: 'pre',
  },
  comment: {
    color: meta,
  },
  constant: {
    color: value,
  },
  'deleted-sign': {
    color: deleted,
  },
  doctype: {
    color: meta,
  },
  entity: {
    color: other,
    cursor: 'help',
  },
  function: {
    color: tag,
  },
  important: {
    color: other,
    fontWeight: 'bold',
  },
  'inserted-sign': {
    color: inserted,
  },
  italic: {
    fontStyle: 'italic',
  },
  keyword: {
    color: value,
  },
  number: {
    color: value,
  },
  operator: {
    color: other,
  },
  'plain-text': {
    color: plainText,
  },
  'pre[class*="language-"]': {
    margin: 0,
    whiteSpace: 'pre',
  },
  prolog: {
    color: meta,
  },
  property: {
    color: attribute,
  },
  punctuation: {
    color: punctuation,
  },
  regex: {
    color: other,
  },
  selector: {
    color: value,
  },
  string: {
    color: value,
  },
  symbol: {
    color: value,
  },
  tag: {
    color: tag,
  },
  url: {
    color: other,
  },
};
