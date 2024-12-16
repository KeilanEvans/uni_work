import Papa from 'papaparse';
import { saveAs } from 'file-saver';

const handleRegister = async () => {
  const username = prompt("Choose a Username:");
  const password = prompt("Choose a Password:");

  const response = await fetch('./users.csv');
  const csvData = await response.text();

  Papa.parse(csvData, {
    header: true,
    complete: (result) => {
      const users = result.data;
      const userExists = users.some((u) => u.username === username);

      if (userExists) {
        alert("Username already exists. Please choose another.");
        return;
      }

      // Append new user
      users.push({ username, password });

      // Convert back to CSV
      const updatedCSV = Papa.unparse(users);

      // Download updated CSV
      const blob = new Blob([updatedCSV], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, 'users.csv');

      alert("Registration Successful. Please log in.");
    },
  });
};

export default handleRegister;