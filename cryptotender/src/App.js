import logo from './eebay.svg'
import './App.css';

function App() {

  const productsOnSale = [
    { id: 1, name: 'Laptop', price: '$999', description: 'High-performance laptop' },
    { id: 2, name: 'Phone', price: '$699', description: 'Latest model smartphone' },
    { id: 3, name: 'Headphones', price: '$199', description: 'Noise-cancelling headphones' },
    { id: 4, name: 'Watch', price: '$149', description: 'Smart watch with fitness tracking' },
  ];


  return (
    <div className="App">
      <div className="App-spacer" />

      <img src={logo} className='App-logo' alt="logo" />

      <header className="App-header">
        <p>Welcome to e-Ebay!</p>
      </header>

      <h1>Sale of Stuff idk</h1>
      <table className="App-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Description</th>
          </tr>
        </thead>

        <tbody>
          {productsOnSale.map(product => {
            return (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.price}</td>
              <td>{product.description}</td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default App;
