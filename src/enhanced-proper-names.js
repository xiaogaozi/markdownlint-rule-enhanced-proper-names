// Based on https://github.com/DavidAnson/markdownlint/blob/2b2dc27f24a16a2afdf66d850a247f7ce02df6c8/lib/md044.js

const {
  addErrorDetailIf,
  bareUrlRe,
  codeBlockAndSpanRanges,
  escapeForRegExp,
  forEachLine,
  forEachLink,
  htmlElementRanges,
  getLineMetadata,
  linkReferenceDefinitionRe,
  withinAnyRange
} = require('markdownlint-rule-helpers');

// Regular expression for matching heading ID
const headingIdRe = /\s*\{#(?<id>(?:.(?!\{#|\}))*.)\}$/;

/**
 * Returns an array of heading ID ranges.
 *
 * @param {Object} params RuleParams instance.
 * @param {Object} lineMetadata Line metadata object.
 * @returns {number[][]} Array of ranges (lineIndex, columnIndex, length).
 */
function headingIdRanges(params, lineMetadata) {
  const exclusions = [];
  forEachLine(lineMetadata, (line, lineIndex, inCode) => {
    let match = null;
    // eslint-disable-next-line no-unmodified-loop-condition
    if (!inCode && ((match = headingIdRe.exec(line)) !== null)) {
      exclusions.push([lineIndex, match.index, match[0].length]);
    }
  });
  return exclusions;
};

module.exports = {
  "names": ["enhanced-proper-names"],
  "description": "Proper names should have the correct capitalization",
  "information": new URL("https://github.com/xiaogaozi/markdownlint-rule-enhanced-proper-names"),
  "tags": ["spelling"],
  "function": function enhancedProperNames(params, onError) {
    let names = params.config.names;
    names = Array.isArray(names) ? names : [];
    names.sort((a, b) => (b.length - a.length) || a.localeCompare(b));
    const codeBlocks = params.config.code_blocks;
    const includeCodeBlocks =
      (codeBlocks === undefined) ? true : !!codeBlocks;
    const htmlElements = params.config.html_elements;
    const includeHtmlElements =
      (htmlElements === undefined) ? true : !!htmlElements;
    const headingId = params.config.heading_id;
    const includeHeadingId =
      (headingId === undefined) ? true : !!headingId;
    const exclusions = [];
    const lineMetadata = getLineMetadata(params);
    forEachLine(lineMetadata, (line, lineIndex) => {
      if (linkReferenceDefinitionRe.test(line)) {
        exclusions.push([lineIndex, 0, line.length]);
      } else {
        let match = null;
        while ((match = bareUrlRe.exec(line)) !== null) {
          exclusions.push([lineIndex, match.index, match[0].length]);
        }
        forEachLink(line, (index, _, text, destination) => {
          if (destination) {
            exclusions.push(
              [lineIndex, index + text.length, destination.length]
            );
          }
        });
      }
    });
    if (!includeCodeBlocks) {
      exclusions.push(...codeBlockAndSpanRanges(params, lineMetadata));
    }
    if (!includeHtmlElements) {
      exclusions.push(...htmlElementRanges(params, lineMetadata));
    }
    if (!includeHeadingId) {
      exclusions.push(...headingIdRanges(params, lineMetadata));
    }
    for (const name of names) {
      const escapedName = escapeForRegExp(name);
      const startNamePattern = /^\W/.test(name) ? "" : "\\b_*";
      const endNamePattern = /\W$/.test(name) ? "" : "_*\\b";
      const namePattern =
        `(${startNamePattern})(${escapedName})${endNamePattern}`;
      const nameRe = new RegExp(namePattern, "gi");
      forEachLine(lineMetadata, (line, lineIndex, inCode, onFence) => {
        if (includeCodeBlocks || (!inCode && !onFence)) {
          let match = null;
          while ((match = nameRe.exec(line)) !== null) {
            const [, leftMatch, nameMatch] = match;
            const index = match.index + leftMatch.length;
            const length = nameMatch.length;
            if (
              !withinAnyRange(exclusions, lineIndex, index, length) &&
              !names.includes(nameMatch)
            ) {
              addErrorDetailIf(
                onError,
                lineIndex + 1,
                name,
                nameMatch,
                null,
                null,
                [index + 1, length],
                {
                  "editColumn": index + 1,
                  "deleteCount": length,
                  "insertText": name
                }
              );
            }
            exclusions.push([lineIndex, index, length]);
          }
        }
      });
    }
  }
};
