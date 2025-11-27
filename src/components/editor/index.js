import React, { useState } from "react";
import dynamic from "next/dynamic";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import Preview from "../preview";
import ButtonPreview from "../button-preview";

// Dynamic import agar tidak crash saat SSR
const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false }
);

const Editor = ({ value, onChange, id, index, label }) => {
  const [isEditMode, setIsEditMode] = useState(false);

  const handleChange = (val) => {
    onChange(index, id, val);
  };

  const toggleEditMode = () => {
    setIsEditMode((prev) => !prev);
  };

  const codePreview = {
    name: "preview",
    keyCommand: "preview",
    value: "preview",
    icon: <ButtonPreview isEditMode={isEditMode} clickHandler={() => toggleEditMode()} />,
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <label htmlFor={`${id}-${index}`} className="text-[14px] font-[600]">{label}:</label>
      </div>

      {isEditMode ? (
        <MDEditor
          id={`${id}-${index}`}
          preview="edit"
          data-color-mode="light"
          value={value}
          onChange={handleChange}
          className="focus:outline-none focus:ring-0 focus:border-none"
          height={500}
          extraCommands={[codePreview]}
          previewOptions={{
            remarkPlugins: [remarkMath],
            rehypePlugins: [rehypeKatex, rehypeRaw],
          }}
        />
      ) : (
        <Preview isEditMode={isEditMode} clickHandler={() => toggleEditMode()}>{value}</Preview>
      )}
    </div>
  );
};

export default Editor;
