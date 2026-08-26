// SPDX-License-Identifier: MIT
import React from "react"; React;
import { toggleMark } from "prosemirror-commands";
import { FormulaBar } from "./FormulaBar";

function classNames(...classes) {
  const className = classes.filter(Boolean).join(' ')
  return className;
}

const items = [{
  name: "B",
  className: "font-bold",
  selected: false,
  command: schema => toggleMark(schema.marks.strong),
  mark: schema => schema.marks.strong,
}, {
  name: "I",
  className: "italic",
  selected: false,
  command: schema => toggleMark(schema.marks.em),
  mark: schema => schema.marks.em,
}];

const isMarkActive = ({ state, mark }) => {
  const { from, $from, to, empty } = state.selection;
  if (empty) {
    return !!mark.isInSet(state.storedMarks || $from.marks());
  } else {
    return state.doc.rangeHasMark(from, to, mark);
  }
}

export const MenuView = ({ className, editorView, hideMenu = false }) => {
  // const toggle = item => {
  //   item.selected = !item.selected;
  //   item.command(editorView.state.schema)(editorView.state, editorView.dispatch);
  // };
  editorView && items.forEach(item =>
    item.selected = isMarkActive({
      state: editorView.state,
      mark: item.mark(editorView.state.schema)
    })
  );
  // Don't render anything if hideMenu is true
  if (hideMenu) {
    return null;
  }
  return (
    <div
      className={classNames(
        "flex flex-col gap-1 mb-2 text-sm font-sans pb-1 border-b border-gray-200",
        className
      )}
    >
      {/*
      <div
        className={classNames(
          "flex flex-row gap-1 mb-2 text-sm font-sans"
        )}
      >
        {
          items.map(item => (
            <button
              key={item.name}
              className={classNames(
                "w-7 h-7 text-center border border-1 rounded",
                item.selected && "bg-gray-100",
                item.className
              )}
              onMouseDown={
                e => {
                  e.preventDefault();
                  editorView.focus();
                  toggle(item);
                }
              }>
              {
                item.name
              }
            </button>
          ))
        }
        </div>
       */}
      <FormulaBar
        editorView={editorView}
      />
    </div>
  );
};
