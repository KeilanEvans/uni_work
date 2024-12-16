const handleRowClick = (id, clickedRow, setClickedRow) => {
  // If the clicked row is an already selected row, deselect it. (setClickedRow(null) deselects.)
  if (id === clickedRow) {
    setClickedRow(null);
  } else {
    setClickedRow(id);
  }
};

export default handleRowClick;