// SimpleText.jsx
import React from "react";

export default function SimpleText(props) {
  const { text } = props;
  return (
    <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{text}</pre>
  );
}
