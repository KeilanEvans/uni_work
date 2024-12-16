import Papa from 'papaparse';

const handleLogin = async (setIsLoggedIn) => {
  const response = await fetch('./users.csv');
  const csvData = await response.text();

  Papa.parse(csvData, {
    header: true,
    complete: (result) => {
      const users = result.data;
      const username = prompt("Enter Username:");
      const password = prompt("Enter Password:");
      const user = users.find((u) => u.username === username && u.password === password);

      if (user) {
        alert("Login Successful");
        setIsLoggedIn(true);
      } else {
        alert("Invalid credentials");
      }
    },
  });
};

export default handleLogin;