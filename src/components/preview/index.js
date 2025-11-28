import React from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import ButtonPreview from "../button-preview";
import DOMPurify from "dompurify";

const renderLatex = (text, displayMode = false) => {
  try {
    return katex.renderToString(text, { throwOnError: false, displayMode });
  } catch {
    return text;
  }
};

const convertMarkdownTableToHtml = (markdown) => {
  const lines = markdown.trim().split("\n");
  if (lines.length < 2) return markdown;

  const headerLine = lines[0];
  const separatorLine = lines[1];
  const dataLines = lines.slice(2);

  if (!/^\|[\s-:]+\|([\s-:]+\|)*$/.test(separatorLine)) return markdown;

  const headers = headerLine.split("|").slice(1, -1).map((h) => h.trim());
  const rows = dataLines.map((line) =>
    line.split("|").slice(1, -1).map((cell) => cell.trim())
  );

  let html =
    "<table border='1' style='border-collapse: collapse; width: 100%;'>";
  html +=
    "<thead><tr>" +
    headers
      .map(
        (header) =>
          `<th style='border: 1px solid black; padding: 5px;'>${header}</th>`
      )
      .join("") +
    "</tr></thead><tbody>";

  rows.forEach((row) => {
    html +=
      "<tr>" +
      row
        .map(
          (cell) =>
            `<td style='border: 1px solid black; padding: 5px;'>${cell}</td>`
        )
        .join("") +
      "</tr>";
  });

  html += "</tbody></table>";
  return html;
};

const processSvgWithLatex = (svgText) => {
  const latexMatches = [...svgText.matchAll(/<text\s+([^>]+)>(.*?)<\/text>/gs)];
  let processedSvg = svgText;
  const latexElements = [];

  latexMatches.forEach((match, index) => {
    const attributes = match[1];
    const content = match[2];

    if (/\$.*?\$/.test(content)) {
      const coordsMatch = attributes.match(/x="([\d.]+)"\s+y="([\d.]+)"/);
      if (coordsMatch) {
        const [, x, y] = coordsMatch;
        const latexString = content.replace(/\$/g, "");
        const latexHtml = renderLatex(latexString, false);

        processedSvg = processedSvg.replace(match[0], "");

        latexElements.push(
          <div
            key={index}
            style={{
              position: "absolute",
              left: `${x}px`,
              top: `${y}px`,
              transform: "translate(-50%, -50%)",
              whiteSpace: "nowrap",
            }}
            dangerouslySetInnerHTML={{ __html: latexHtml }}
          />
        );
      }
    }
  });

  return { processedSvg, latexElements };
};

const renderSvgWithLatex = (svgString, key) => {
  const { processedSvg, latexElements } = processSvgWithLatex(svgString);
  return (
    <div key={key} style={{ position: "relative", display: "inline-block" }}>
      <div
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(processedSvg),
        }}
      />
      {latexElements}
    </div>
  );
};

const renderBoldAndLatex = (text, keyPrefix) => {
  const parts = [];
  let lastIndex = 0;
  const boldRegex = /\*\*(.*?)\*\*/gs;
  let match;
  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), bold: false });
    }
    parts.push({ text: match[1], bold: true });
    lastIndex = boldRegex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), bold: false });
  }

  return parts.map((part, idx) => {
    const inlineParts = part.text.split(/(\$\$.*?\$\$|\$.*?\$)/gs);
    const children = inlineParts.map((p, i) => {
      if (!p) return null;
      if (p.startsWith("$$") && p.endsWith("$$")) {
        return (
          <span
            key={`${idx}-${i}`}
            className="katex-inline"
            style={{ display: "inline-block", verticalAlign: "middle" }}
            dangerouslySetInnerHTML={{
              __html: renderLatex(p.slice(2, -2), true),
            }}
          />
        );
      }
      if (p.startsWith("$") && p.endsWith("$")) {
        return (
          <span
            key={`${idx}-${i}`}
            className="katex-inline"
            style={{ display: "inline-block", verticalAlign: "middle" }}
            dangerouslySetInnerHTML={{
              __html: renderLatex(p.slice(1, -1), false),
            }}
          />
        );
      }
      return <span key={`${idx}-${i}`}>{p}</span>;
    });
    return part.bold ? (
      <strong key={`${keyPrefix}-${idx}`}>{children}</strong>
    ) : (
      <React.Fragment key={`${keyPrefix}-${idx}`}>{children}</React.Fragment>
    );
  }).flat();
};

const renderLine = (line, key) => {
  if (line.trim() === "") return null;

  const blockMathMatch = line.trim().match(/^\$\$(.*)\$\$$/s);
  if (blockMathMatch) {
    return (
      <div
        key={key}
        style={{ textAlign: "center" }}
        className="katex-block"
        dangerouslySetInnerHTML={{
          __html: renderLatex(blockMathMatch[1], true),
        }}
      />
    );
  }

  const children = renderBoldAndLatex(line, key);
  if (line.includes("$$")) {
    return <div key={key} style={{ textAlign: "center" }}>{children}</div>;
  }
  return <div key={key}>{children}</div>;
};

const renderTextWithLatex = (text, key) => {
  const parts = text.split(/(\n+)/);
  return (
    <React.Fragment key={key}>
      {parts.map((part, idx) => {
        if (/^\n+$/.test(part)) {
          const brCount = part.length - 1;
          return Array.from({ length: brCount }, (_, i) => (
            <br key={`${key}-br-${idx}-${i}`} />
          ));
        }
        return renderLine(part, `${key}-line-${idx}`);
      })}
    </React.Fragment>
  );
};

const renderContent = (text) => {
  const pattern =
    /(<svg[\s\S]*?<\/svg>)|(\$\$[\s\S]+?\$\$)|(^\|[^\n]+\|\n\|[-:\s|]+\|\n(?:\|[^\n]+\|\n?)*)/gm;
  let elements = [];
  let lastIndex = 0;
  let match;
  let keyCounter = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const before = text.slice(lastIndex, match.index);
      if (before.trim()) {
        elements.push(renderTextWithLatex(before, `txt-${keyCounter++}`));
      }
    }

    const svgGroup = match[1];
    const blockMath = match[2];
    const tableGroup = match[3];

    if (svgGroup) {
      elements.push(renderSvgWithLatex(svgGroup, `svg-${keyCounter++}`));
    } else if (blockMath) {
      const latex = blockMath.slice(2, -2).trim();
      elements.push(
        <div
          key={`math-${keyCounter++}`}
          className="katex-block"
          style={{ textAlign: "center" }}
          dangerouslySetInnerHTML={{ __html: renderLatex(latex, true) }}
        />
      );
    } else if (tableGroup) {
      const html = convertMarkdownTableToHtml(tableGroup);
      elements.push(
        <div
          key={`table-${keyCounter++}`}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(html),
          }}
        />
      );
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex);
    if (remaining.trim()) {
      elements.push(renderTextWithLatex(remaining, `end-${keyCounter++}`));
    }
  }

  return elements;
};

const Preview = ({ children, isEditMode, clickHandler }) => {
  return (
    <div className="border border-gray-100 pb-4 rounded-[3px] overflow-scroll h-[500px] relative">
      <div className="sticky z-[10] top-0 left-0 w-full flex justify-between items-center border-b border-b-gray-100 px-[3px] h-fit bg-white">
        <span className="text-[14px] text-gray-500 py-[2px] ml-1">Preview</span>
        {clickHandler && <ButtonPreview isEditMode={isEditMode} clickHandler={clickHandler} />}
      </div>
      <div className="prose max-w-full p-2">
        {typeof children === "string" ? renderContent(children) : children}
      </div>
    </div>
  );
};

export default Preview;
